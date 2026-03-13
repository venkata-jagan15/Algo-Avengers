import os
import json
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import schemas
import rag

def ingest_all_reports(base_dir):
    db = SessionLocal()
    
    success_count = 0
    fail_count = 0
    
    print(f"Starting bulk ingestion from: {base_dir}")
    
    for root, dirs, files in os.walk(base_dir):
        # We want to combine all text from the folder into one LLM call to get the most accurate project representation
        combined_text = ""
        project_name = os.path.basename(root)
        
        # Skip the root directory itself if it has no files
        if not files:
            continue
            
        print(f"\nProcessing project folder: {project_name}")
        
        for file in files:
            file_path = os.path.join(root, file)
            print(f"  Reading: {file}")
            
            try:
                with open(file_path, 'rb') as f:
                    file_bytes = f.read()
                    text = rag.extract_text_from_file(file_bytes, file)
                    if text:
                        combined_text += f"\n\n--- Content from {file} ---\n{text}"
            except Exception as e:
                print(f"  Failed to read {file}: {e}")
                
        if not combined_text.strip():
            print(f"  No text extracted for {project_name}, skipping.")
            continue
            
        print(f"  Extracted {len(combined_text)} characters. Sending to Nvidia Nemotron AI...")
        
        # We cap text if it's too gigantic
        try:
            structured_data = rag.analyze_project_files_with_llm(combined_text[:12000])
            # Check if this is an error result from rag.py fallback
            if structured_data.get("title") == "Error Analyzing File":
                print(f"  AI returned an error record for {project_name}, skipping.")
                fail_count += 1
                continue
        except Exception as e:
            print(f"  AI analysis failed: {e}")
            fail_count += 1
            continue
            
        # Clean up data specifically to match Pydantic constraints
        try:
            # Add some defaults in case LLM missed them
            title = structured_data.get("title", project_name)
            if not title: title = project_name
            dept = structured_data.get("department", "Unknown")
            if not dept: dept = "Unknown"
            prob = structured_data.get("problem_statement", "No problem statement extracted.")
            if not prob: prob = "No problem statement extracted."
            ts = structured_data.get("tech_stack", "Unknown")
            if not ts: ts = "Unknown"
            
            outcome = structured_data.get("outcome", "Completed")
            valid_outcomes = ["Completed", "Partially Completed", "Abandoned", "Proof of Concept Only"]
            if outcome not in valid_outcomes:
                outcome = "Completed"
                
            db_project = models.Project(
                title=title,
                batch_year=int(structured_data.get("batch_year", 2024)),
                department=dept,
                institution="MVGR College of Engineering",
                team_members=structured_data.get("team_members", ""),
                faculty_advisor=structured_data.get("faculty_advisor", ""),
                tech_stack=ts,
                domain_tags=json.dumps(structured_data.get("domain_tags", [])),
                
                problem_statement=prob,
                our_approach=structured_data.get("our_approach", ""),
                outcome=outcome,
                completion_percentage=int(structured_data.get("completion_percentage", 100)),
                what_was_delivered=structured_data.get("what_was_delivered", ""),
                
                failed_attempts=json.dumps(structured_data.get("failed_attempts", [])),
                dead_ends=json.dumps(structured_data.get("dead_ends", [])),
                wish_we_had_known=structured_data.get("wish_we_had_known", ""),
                
                whats_next=structured_data.get("whats_next", ""),
                unsolved_problem=structured_data.get("unsolved_problem", ""),
                open_for_continuation=bool(structured_data.get("open_for_continuation", False)),
                
                code_repo_link=structured_data.get("code_repo_link", ""),
                report_link=structured_data.get("report_link", ""),
                demo_link=structured_data.get("demo_link", "")
            )
            
            db.add(db_project)
            db.commit()
            db.refresh(db_project)
            
            # Add to Chroma
            rag.add_project_to_chroma(
                project_id=db_project.id,
                title=db_project.title,
                problem_statement=db_project.problem_statement,
                tech_stack=db_project.tech_stack
            )
            
            print(f"  Successfully inserted '{title}' into MySQL and ChromaDB!")
            success_count += 1
            
        except Exception as e:
            db.rollback()
            print(f"  Failed to save to database. Error: {e}")
            fail_count += 1

    print(f"\nIngestion Complete! Success: {success_count}, Failed: {fail_count}")
    db.close()

if __name__ == "__main__":
    reports_dir = r"c:\Users\HP\OneDrive\Desktop\MVGR\project\backend\project reports\project reports"
    ingest_all_reports(reports_dir)
