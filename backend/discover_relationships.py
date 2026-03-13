import models
from database import SessionLocal
import rag
import json

def discover():
    db = SessionLocal()
    projects = db.query(models.Project).all()
    
    print(f"Finding relationships for {len(projects)} projects...")
    
    for project in projects:
        try:
            rag.discover_project_relationships(project.id, db)
        except Exception as e:
            print(f"Error discovering relationships for {project.title}: {e}")
            
    print("Relationship discovery complete!")

if __name__ == "__main__":
    discover()
