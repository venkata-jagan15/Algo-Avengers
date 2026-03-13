import os
import shutil
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

def clean():
    db = SessionLocal()
    print("Deleting all projects from MySQL...")
    db.query(models.ProjectRelationship).delete()
    db.query(models.Project).delete()
    db.commit()
    db.close()
    
    # Delete chroma DB directory
    chroma_dir = os.path.join(os.path.dirname(__file__), "chroma_db")
    if os.path.exists(chroma_dir):
        print("Deleting ChromaDB vector store...")
        shutil.rmtree(chroma_dir)
        
    print("DB reset complete!")

if __name__ == "__main__":
    clean()
