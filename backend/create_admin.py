import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models import User, UserRole
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

db = SessionLocal()
admin = db.query(User).filter(User.role == UserRole.admin).first()

if not admin:
    admin = User(
        name="Institution Admin",
        email="admin@innotrack.com",
        institution="MVGR College of Engineering",
        hashed_password=pwd_context.hash("admin123"),
        role=UserRole.admin
    )
    db.add(admin)
    db.commit()
    print("Created Admin User")
else:
    print(f"Admin already exists: {admin.email}")
