import models
from database import SessionLocal
import rag
import json

def check():
    db = SessionLocal()
    projects = db.query(models.Project).all()
    relationships = db.query(models.ProjectRelationship).all()
    
    print(f"Total Projects: {len(projects)}")
    print(f"Total Relationships: {len(relationships)}")
    
    for rel in relationships:
        p1 = db.query(models.Project).filter(models.Project.id == rel.source_project_id).first()
        p2 = db.query(models.Project).filter(models.Project.id == rel.target_project_id).first()
        if p1 and p2:
            print(f"  {p1.title} -> {p2.title} ({rel.relationship_type})")
        else:
            print(f"  Unknown relationship: {rel.source_project_id} -> {rel.target_project_id}")
            
    # Check ChromaDB
    try:
        count = rag.collection.count()
        print(f"ChromaDB Collection Count: {count}")
    except Exception as e:
        print(f"Error checking ChromaDB: {e}")
        
    db.close()

if __name__ == "__main__":
    check()
