from sqlalchemy import text
from database import engine

def migrate():
    try:
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("SHOW COLUMNS FROM projects LIKE 'repo_access_granted'"))
            column_exists = result.fetchone()
            
            if not column_exists:
                print("Adding repo_access_granted column to projects table...")
                conn.execute(text("ALTER TABLE projects ADD COLUMN repo_access_granted BOOLEAN DEFAULT FALSE"))
                conn.commit()
                print("Migration successful.")
            else:
                print("Column repo_access_granted already exists.")
                
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
