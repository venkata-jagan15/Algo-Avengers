from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
import json
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models, schemas, database, rag
import hashlib

def get_password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return get_password_hash(plain_password) == hashed_password

# Create Database Tables
try:
    models.Base.metadata.create_all(bind=database.engine)
except Exception as e:
    print(f"Failed to create tables: {e}")

app = FastAPI(title="Inno Track API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for deployment ease, can be restricted later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Inno Track Backend is running"}

@app.post("/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user.password)
    new_user = models.User(
        name=user.name,
        email=user.email,
        role=user.role,
        institution=user.institution if user.institution else "MVGR College of Engineering", # Default for demo
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login", response_model=schemas.User)
def login_user(user: schemas.UserLogin, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return db_user

@app.post("/analyze-submission")
async def analyze_submission(
    files: List[UploadFile] = File(None),
    draft_text: str = Form("")
):
    try:
        extracted_text = ""
        
        # Read files into memory if they exist
        if files:
            for file in files:
                file_bytes = await file.read()
                # Extract Text
                text = rag.extract_text_from_file(file_bytes, file.filename)
                if text:
                    extracted_text += f"\n--- Content from {file.filename} ---\n{text}\n"
        
        # Combine with draft text
        full_context = f"DRAFT TEXT PROVIDED BY STUDENT:\n{draft_text}\n\nFILE CONTENTS:\n{extracted_text}"
        
        # Send to LLM to structure
        structured_data = rag.analyze_project_files_with_llm(full_context)
        
        return structured_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/projects", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(database.get_db)):
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    # Add to ChromaDB vector store
    rag.add_project_to_chroma(
        project_id=db_project.id,
        title=db_project.title,
        problem_statement=db_project.problem_statement,
        tech_stack=db_project.tech_stack
    )
    
    # Automatically discover relationships
    try:
        rag.discover_project_relationships(db_project.id, db)
    except Exception as e:
        print(f"Error discovering relationships: {e}")
    
    return db_project

@app.get("/projects", response_model=List[schemas.Project])
def get_projects(skip: int = 0, limit: int = 100, institution: Optional[str] = None, db: Session = Depends(database.get_db)):
    query = db.query(models.Project)
    if institution:
        # Simple string match for PoC
        query = query.filter(models.Project.institution == institution)
        
    projects = query.offset(skip).limit(limit).all()
    return projects

@app.get("/projects/{project_id}", response_model=schemas.Project)
def get_project(project_id: str, db: Session = Depends(database.get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project

@app.post("/projects/{project_id}/chat")
async def chat_with_project(project_id: str, request: schemas.ProjectChatRequest, db: Session = Depends(database.get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Convert SQLAlchemy model to dict for RAG processing
    project_data = {c.name: getattr(db_project, c.name) for c in db_project.__table__.columns}
    
    response = rag.generate_project_chat_response(
        project_data=project_data,
        user_query=request.message,
        chat_history=request.history
    )
    
    return {"response": response}

@app.post("/relationships", response_model=schemas.ProjectRelationship)
def create_relationship(rel: schemas.ProjectRelationshipCreate, db: Session = Depends(database.get_db)):
    db_rel = models.ProjectRelationship(**rel.model_dump())
    db.add(db_rel)
    db.commit()
    db.refresh(db_rel)
    return db_rel

@app.get("/relationships", response_model=List[schemas.ProjectRelationship])
def get_relationships(db: Session = Depends(database.get_db)):
    return db.query(models.ProjectRelationship).all()

@app.get("/graph-data")
def get_graph_data(db: Session = Depends(database.get_db)):
    """Returns the nodes and edges required for Sigma.js / react-force-graph"""
    projects = db.query(models.Project).all()
    relationships = db.query(models.ProjectRelationship).all()
    
    # Map outcomes to sizes/colors in frontend logic or backend
    # ProjectOutcome enum: Completed, Partially Completed, Abandoned, Proof of Concept Only
    nodes = []
    for p in projects:
        outcome = str(p.outcome).lower()
        size = 4 # Default
        if "completed" in outcome and "partially" not in outcome:
            size = 6
        elif "failed" in outcome or "abandoned" in outcome:
            size = 2
        elif "proof of concept" in outcome:
            size = 3
            
        nodes.append({
            "id": p.id,
            "label": p.title,
            "department": p.department,
            "outcome": p.outcome,
            "size": size
        })
        
    edges = [
        {
            "id": r.id,
            "source": r.source_project_id,
            "target": r.target_project_id,
            "label": r.relationship_type
        } for r in relationships
    ]
    
    return {"nodes": nodes, "edges": edges}

@app.post("/match-idea")
def match_idea(request: schemas.IdeaMatchRequest, db: Session = Depends(database.get_db)):
    # 1. Search ChromaDB
    search_results = rag.match_idea_with_past_projects(request.user_idea, top_k=3)
    
    if not search_results or not search_results['ids'] or len(search_results['ids'][0]) == 0:
        return {"insight": "No similar past projects found.", "related_projects": []}
    
    matched_ids = search_results['ids'][0]
    
    # 2. Fetch full project details from MySQL
    similar_projects = db.query(models.Project).filter(models.Project.id.in_(matched_ids)).all()
    
    # 3. Ask RAG to generate insights
    insight = rag.generate_rag_insight(request.user_idea, similar_projects)
    
    return {
        "insight": insight,
        "related_projects": [p.__dict__ for p in similar_projects] 
    }

@app.put("/projects/{project_id}/toggle-access")
async def toggle_project_access(project_id: str, db: Session = Depends(database.get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.repo_access_granted = not project.repo_access_granted
    db.commit()
    db.refresh(project)
    
    return {"status": "success", "repo_access_granted": project.repo_access_granted}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
