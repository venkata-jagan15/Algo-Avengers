import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import pymysql

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:@localhost:3306/innotrack")

# Handle db creation if requested database does not exist
try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    engine.connect()
except Exception as e:
    print("Database connection failed. Attempting to create it...")
    # fallback to just localhost to create the db
    # Split by the last slash and keep the protocol
    base_url = SQLALCHEMY_DATABASE_URL.rsplit("/", 1)[0]
    db_name = SQLALCHEMY_DATABASE_URL.rsplit("/", 1)[-1]
    
    from sqlalchemy import text
    temp_engine = create_engine(base_url)
    with temp_engine.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS {db_name}"))
    print(f"Created database {db_name}")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
