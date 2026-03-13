from sqlalchemy import Column, String, Integer, Text, Enum, Boolean
import enum
from database import Base
import uuid

class UserRole(str, enum.Enum):
    student = "Student"
    faculty = "Faculty"
    admin = "Admin"

class ProjectOutcome(str, enum.Enum):
    completed = "Completed"
    partial = "Partially Completed"
    abandoned = "Abandoned"
    poc = "Proof of Concept Only"

class RelationshipType(str, enum.Enum):
    inspired_by = "inspired_by"
    direct_continuation = "direct_continuation"
    alternative_approach = "alternative_approach"
    failed_attempt_of = "failed_attempt_of"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.student)
    institution = Column(String(255), nullable=True) # E.g. "MVGR"
    hashed_password = Column(String(255), nullable=False)

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    batch_year = Column(Integer, nullable=False)
    department = Column(String(100), nullable=False)
    institution = Column(String(255), nullable=True) # To link project to a college
    team_members = Column(Text, nullable=True) # JSON strings or comma separated
    faculty_advisor = Column(String(255), nullable=True)
    tech_stack = Column(Text, nullable=False) # comma separated
    domain_tags = Column(Text, nullable=True) # JSON array

    # What was built
    problem_statement = Column(Text, nullable=False)
    our_approach = Column(Text, nullable=True)
    outcome = Column(Enum(ProjectOutcome), nullable=False)
    completion_percentage = Column(Integer, default=0)
    what_was_delivered = Column(Text, nullable=True)

    # What was learned
    failed_attempts = Column(Text, nullable=True) # JSON array of dicts
    dead_ends = Column(Text, nullable=True) # JSON array
    wish_we_had_known = Column(Text, nullable=True)
    
    # What comes next
    whats_next = Column(Text, nullable=True)
    unsolved_problem = Column(Text, nullable=True)
    open_for_continuation = Column(Boolean, default=False)
    
    # Links
    code_repo_link = Column(String(255), nullable=True)
    report_link = Column(String(255), nullable=True)
    demo_link = Column(String(255), nullable=True)
    
    # Permissions
    repo_access_granted = Column(Boolean, default=False)

class ProjectRelationship(Base):
    __tablename__ = "project_relationships"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_project_id = Column(String(36), nullable=False)
    target_project_id = Column(String(36), nullable=False)
    relationship_type = Column(Enum(RelationshipType), nullable=False)
