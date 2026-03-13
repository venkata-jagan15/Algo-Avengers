import os
from openai import OpenAI
import chromadb
from dotenv import load_dotenv
import uuid
import json
import zipfile
import io
import PyPDF2

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# NVIDIA Nemotron LLM Setup for chat and embeddings
# Embeddings: using NVIDIA's standard embedding model via openai client
# RAG insights: using nvidia/nemotron-3-nano-30b-a3b
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

client = OpenAI(
  base_url="https://integrate.api.nvidia.com/v1",
  api_key=NVIDIA_API_KEY
)

# Define the chat model name as it's used in multiple places
CHAT_MODEL_NAME = "meta/llama-3.1-70b-instruct"
oai_client = client # Alias for consistency with the new code

# ChromaDB Setup for Vector storage
current_dir = os.path.dirname(os.path.abspath(__file__))
chroma_path = os.path.join(current_dir, "chroma_db")
chroma_client = chromadb.PersistentClient(path=chroma_path)
collection = chroma_client.get_or_create_collection(name="projects")

def generate_embedding(text: str):
    """Generate an embedding using Nvidia API"""
    try:
        response = client.embeddings.create(
            input=text,
            model="nvidia/nv-embedqa-e5-v5",
            encoding_format="float",
            extra_body={"input_type": "query", "truncate": "NONE"}
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Error generating embedding: {e}")
        # dummy fallback if embedding model is not accessible
        import random
        return [random.uniform(-1, 1) for _ in range(1024)]

def add_project_to_chroma(project_id: str, title: str, problem_statement: str, tech_stack: str):
    """Store project text embedding in ChromaDB"""
    # Create the single text representation of the project to embed
    content = f"Title: {title}\nTech Stack: {tech_stack}\nProblem: {problem_statement}"
    embedding = generate_embedding(content)
    
    collection.add(
        ids=[project_id],
        embeddings=[embedding],
        metadatas=[{"title": title, "tech_stack": tech_stack}]
    )

def match_idea_with_past_projects(user_idea: str, top_k: int = 3):
    """Find similar past projects using vector search"""
    idea_embedding = generate_embedding(user_idea)
    results = collection.query(
        query_embeddings=[idea_embedding],
        n_results=top_k
    )
    return results

def sync_chroma_with_db(db):
    """
    Ensure Vector DB is in sync with the SQL DB.
    Useful for cloud deployments with ephemeral disks (like Render Free).
    """
    import models
    print("Syncing ChromaDB with MySQL...")
    
    # Get all projects from SQL
    projects = db.query(models.Project).all()
    
    # Get existing IDs in Chroma
    existing_ids = collection.get()['ids']
    
    for p in projects:
        if p.id not in existing_ids:
            print(f"Adding missing project to Chroma: {p.title}")
            add_project_to_chroma(p.id, p.title, p.problem_statement, p.tech_stack)
            
    print(f"Sync complete. {len(projects)} projects indexed.")

def discover_project_relationships(project_id: str, db):
    """
    Find and store relationships for a specific project.
    This should be called whenever a new project is created.
    """
    import models # Local import to avoid any potential circular dependencies
    
    p1 = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not p1:
        return
        
    print(f"Discovering relationships for project: {p1.title}")
    
    # We query ChromaDB for similar projects
    search_results = match_idea_with_past_projects(p1.problem_statement, top_k=5)
    
    ids = search_results['ids'][0]
    distances = search_results['distances'][0]
    
    for p2_id, dist in zip(ids, distances):
        if p2_id == p1.id:
            continue
            
        # Distance threshold (cosine distance)
        # Low distance = high similarity
        if dist < 0.8: 
            # Check if relationship already exists
            exists = db.query(models.ProjectRelationship).filter(
                ((models.ProjectRelationship.source_project_id == p1.id) & (models.ProjectRelationship.target_project_id == p2_id)) |
                ((models.ProjectRelationship.source_project_id == p2_id) & (models.ProjectRelationship.target_project_id == p1.id))
            ).first()
            
            if not exists:
                # Determine relationship type
                rel_type = models.RelationshipType.alternative_approach
                
                p2 = db.query(models.Project).filter(models.Project.id == p2_id).first()
                if p2:
                    p1_tech = set(t.strip().lower() for t in (p1.tech_stack or "").split(',') if t.strip())
                    p2_tech = set(t.strip().lower() for t in (p2.tech_stack or "").split(',') if t.strip())
                    
                    if p1_tech.intersection(p2_tech):
                        rel_type = models.RelationshipType.inspired_by
                    else:
                        rel_type = models.RelationshipType.alternative_approach
                    
                    relationship = models.ProjectRelationship(
                        source_project_id=p1.id,
                        target_project_id=p2_id,
                        relationship_type=rel_type
                    )
                    db.add(relationship)
                    print(f"  Added relationship: {p1.title} -> {p2.title} ({rel_type})")
    
    db.commit()

def generate_rag_insight(user_idea: str, similar_projects: list):
    """Use nemotron to generate insights based on the retrieved projects"""
    projects_context = ""
    for idx, proj in enumerate(similar_projects):
        projects_context += f"Project {idx+1}:\n"
        if isinstance(proj, dict):
            projects_context += f"Title: {proj.get('title')}\nProblem: {proj.get('problem_statement')}\nFailed: {proj.get('what_failed')}\nRecommended Next: {proj.get('whats_next')}\n\n"
        else:
            projects_context += f"Title: {proj.title}\nProblem: {proj.problem_statement}\nFailed: {proj.what_failed}\nRecommended Next: {proj.whats_next}\n\n"

    prompt = f"""
    The user wants to build the following idea: "{user_idea}"

    Here are details from {len(similar_projects)} past projects that are related, based on semantic similarity:
    {projects_context}

    Based exclusively on these past projects, provide an analysis of:
    1. What generally worked for these types of projects (patterns of success).
    2. What specific things failed, and why (lessons learned to avoid).
    3. Actionable advice for the user to succeed in building their idea.
    
    Do not invent new advice outside of what is present in the past projects data.
    """

    try:
        response = oai_client.chat.completions.create(
            model=CHAT_MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1024,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"NVIDIA generation error: {e}")
        return "Could not generate insights due to an API error."

def generate_project_chat_response(project_data: dict, user_query: str, chat_history: list = None):
    """Generates an answer to a user query based on a specific project's context."""
    
    # Format the project context for the prompt
    context = f"""
    PROJECT INFORMATION:
    - Title: {project_data.get('title')}
    - Department: {project_data.get('department')}
    - Batch: {project_data.get('batch_year')}
    - Tech Stack: {project_data.get('tech_stack')}
    - Problem Statement: {project_data.get('problem_statement')}
    - Approach: {project_data.get('our_approach')}
    - Outcome: {project_data.get('outcome')}
    - Delivered: {project_data.get('what_was_delivered')}
    - Failed Attempts: {project_data.get('failed_attempts')}
    - Dead Ends: {project_data.get('dead_ends')}
    - Lessons Learned: {project_data.get('wish_we_had_known')}
    - Next Steps: {project_data.get('whats_next')}
    - Unsolved: {project_data.get('unsolved_problem')}
    """

    history_context = ""
    if chat_history:
        for msg in chat_history[-6:]:  # Keep only last 3 turns
            role = "User" if msg.get("role") == "user" else "AI"
            history_context += f"{role}: {msg.get('content')}\n"

    system_prompt = f"""
    You are an academic project assistant for the Inno Track repository. 
    A user is asking questions about a specific project: "{project_data.get('title')}".
    Use the following project data to answer the query accurately. 
    If you don't know the answer based on the provided data, state that you don't have that information.
    Be helpful, technical, and concise.
    
    {context}
    """

    messages = [{"role": "system", "content": system_prompt}]
    if chat_history:
        # Convert history format if needed, but assuming OpenAI format
        for msg in chat_history[-6:]:
            messages.append({"role": msg["role"], "content": msg["content"]})
    
    messages.append({"role": "user", "content": user_query})

    try:
        response = oai_client.chat.completions.create(
            model=CHAT_MODEL_NAME,
            messages=messages,
            temperature=0.3,
            max_tokens=1024,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Project chat generation error: {e}")
        return "I apologize, but I encountered an error while processing your request. Please try again later."

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    """Extracts raw text from uploaded PDF or ZIP files (looking at code/text files inside)."""
    extracted_text = ""
    fn_lower = filename.lower()
    
    if fn_lower.endswith(".pdf"):
        try:
            reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text += text + "\n"
        except Exception as e:
            print(f"Failed to parse PDF: {e}")
            
    elif fn_lower.endswith(".zip"):
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
                for file_info in z.infolist():
                    # Skip directories, large binary files, and system junk
                    if file_info.is_dir(): continue
                    if "__MACOSX" in file_info.filename or ".DS_Store" in file_info.filename: continue
                    if any(part.startswith('.') for part in file_info.filename.split('/')): continue
                    
                    # Only read relevant extensions for academic code
                    valid_exts = [".txt", ".md", ".py", ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".java", ".cpp", ".c", ".h", ".cs", ".sql", ".ipynb", ".json"]
                    if not any(file_info.filename.lower().endswith(ext) for ext in valid_exts):
                        continue
                        
                    # Skip extremely large individual files (above 1MB)
                    if file_info.file_size > 1024 * 1024: continue
                    
                    with z.open(file_info) as f:
                        # Attempt to decode as utf-8, ignore errors
                        # Keep it to a reasonable size per file
                        content = f.read(10000).decode('utf-8', errors='ignore')
                        extracted_text += f"\n--- File: {file_info.filename} ---\n{content}\n"
                        
                        # Stop if we already have a massive amount of text
                        if len(extracted_text) > 50000: break
                        
        except Exception as e:
            print(f"Failed to parse ZIP: {e}")
            
    return extracted_text.strip()

def analyze_project_files_with_llm(context_text: str) -> dict:
    """
    Sends raw parsed text from the ZIP/PDF to the LLM to extract the exact 
    categorized JSON structure requested for the submission form.
    """
    
    # Strictly define the expected JSON schema as part of the prompt
    prompt = f"""
    You are an expert academic evaluator. Your task is to analyze the provided raw contents of a student's project submission (which may include pieces of their PDF report or codebase).
    
    Extract the following information and return it STRICTLY as a valid JSON object.
    
    CRITICAL JSON FORMATTING INSTRUCTIONS:
    - ALL property names and string values MUST be enclosed in double quotes ("").
    - DO NOT use literal newlines inside string values. Use \\n instead.
    - DO NOT use unescaped double quotes inside string values. Use \\" instead.
    - DO NOT leave any trailing commas before closing braces (}}) or brackets (]).
    - Output ONLY the JSON object, do not wrap it in markdown block quotes.
    
    Expected JSON Structure:
    {{
        "title": "Title of the project",
        "batch_year": 2024,
        "department": "Department (e.g., Computer Science, Mechanical)",
        "problem_statement": "1-3 sentences describing the specific real-world problem.",
        "our_approach": "How did they tackle it? Architecture/Idea.",
        "outcome": "Must be exactly one of: Completed, Partially Completed, Abandoned, Proof of Concept Only. Deduce this accurately by looking at the delivered results vs the planned goals.",
        "completion_percentage": 100, // A number from 0 to 100 representing how much of the original goal was achieved.
        "what_was_delivered": "What worked? What could a user do with it?",
        "failed_attempts": [
            {{"tried": "what was tried", "failed_because": "why it failed", "weeks_lost": 2}}
        ],
        "dead_ends": ["first dead end string", "second dead end string"],
        "wish_we_had_known": "One paragraph of the most valuable lesson learned.",
        "whats_next": "Technical roadmap of what to build next.",
        "unsolved_problem": "Core problem STILL not solved.",
        "open_for_continuation": true,
        "tech_stack": "Comma separated string of tech (e.g., React, Python)",
        "domain_tags": ["Smart Campus", "Healthcare"],
        "team_members": "Comma separated student names",
        "faculty_advisor": "Name of advisor",
        "code_repo_link": "",
        "report_link": "",
        "demo_link": ""
    }}
    
    ANALYSIS GUIDELINES for accuracy:
    1. **Intended Scope**: Look at the "Abstract", "Introduction", or "Objectives" sections to understand what the students *planned* to build.
    2. **Actual Achievement**: Compare the intended scope against the "Results", "Conclusion", and "System Implementation" sections.
    3. **The "Future Work" Signal**: High-quality reports often list what they *couldn't* finish in "Future Work". If core features promised in the introduction appear in "Future Work", the project is "Partially Completed".
    4. **Code vs Report**: If a ZIP (codebase) is provided, verify if the code actually implements the features described in the report. If the report claims a feature that isn't in the code, penalize the completion percentage.
    5. **Outcome Mapping**:
       - **Completed**: All core objectives met, system is functional and tested.
       - **Partially Completed**: Significant progress made, but core features are missing or untested.
       - **Abandoned**: Initial work exists but the project stopped far short of a prototype.
       - **Proof of Concept Only**: Only the core idea is demonstrated without real-world robustness or secondary features.
    6. **Percentage Calculation**: 
       - 100%: All goals met.
       - 70-90%: Core goals met, minor features missing.
       - 40-60%: Some core goals met, but system is not fully usable.
       - <40%: Basic prototype or fragmented work.
    
    Raw Project Contents:
    {context_text[:35000]} # Increased context window for deeper analysis
    """

    try:
        response = oai_client.chat.completions.create(
            model=CHAT_MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1, # Extremely low temperature for strict JSON generation
            max_tokens=2048,
        )
        
        raw_output = response.choices[0].message.content.strip()
        
        # 1. Clean markdown code blocks if present
        if "```json" in raw_output:
            raw_output = raw_output.split("```json")[1].split("```")[0].strip()
        elif "```" in raw_output:
            raw_output = raw_output.split("```")[1].split("```")[0].strip()
        
        # 2. Find the JSON object
        first_idx = raw_output.find('{')
        last_idx = raw_output.rfind('}')
        
        if first_idx != -1:
            if last_idx != -1 and last_idx > first_idx:
                raw_output = raw_output[first_idx : last_idx + 1]
            else:
                raw_output = raw_output[first_idx:] # Missing closing brace, handle below
        
        raw_output = raw_output.strip()
        
        # 3. Robust Fixes for common syntax errors
        import re
        # Remove trailing commas
        raw_output = re.sub(r',\s*}', '}', raw_output)
        raw_output = re.sub(r',\s*\]', ']', raw_output)
        
        # 4. Attempt to close truncated JSON
        # Count braces and brackets
        open_braces = raw_output.count('{')
        close_braces = raw_output.count('}')
        open_brackets = raw_output.count('[')
        close_brackets = raw_output.count(']')
        
        if open_braces > close_braces:
            raw_output += '}' * (open_braces - close_braces)
        if open_brackets > close_brackets:
            # This is harder to fix blindly, but often it's a trailing comma before a truncated end
            raw_output = raw_output.rstrip(', \n\t')
            raw_output += ']'
            if raw_output.count('{') > raw_output.count('}'):
                raw_output += '}'
        
        # Final cleanup for common LLM junk
        raw_output = raw_output.replace('\\n', ' ').replace('\\t', ' ')
        
        # Log for debugging if it still fails
        try:
            return json.loads(raw_output, strict=False)
        except json.JSONDecodeError:
            with open("debug_raw_json.txt", "w", encoding="utf-8") as f_debug:
                f_debug.write(raw_output)
            raise
            
    except Exception as e:
        print(f"Error during LLM structure generation: {e}")
        return {
            "title": "Error Analyzing File",
            "problem_statement": f"AI Parsing Error: {str(e)}. The file might be too complex or the AI reached its limit.",
            "outcome": "Proof of Concept Only"
        }
