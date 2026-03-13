from database import engine
from sqlalchemy import text
from models import Base
with engine.connect() as conn:
    conn.execute(text('DROP TABLE IF EXISTS project_relationships'))
    conn.execute(text('DROP TABLE IF EXISTS projects'))
    conn.commit()
print('Tables dropped. Recreating from models...')
Base.metadata.create_all(bind=engine)
print('Tables created!')
