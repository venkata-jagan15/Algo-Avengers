from pydantic import BaseModel, ConfigDict
from enum import Enum
from typing import List, Optional

class ProjectOutcome(str, Enum):
    completed = "Completed"
    partial = "Partially Completed"
    abandoned = "Abandoned"
    poc = "Proof of Concept Only"

class RelationshipType(str, Enum):
    inspired_by = "inspired_by"
    direct_continuation = "direct_continuation"
    failed_attempt_of = "failed_attempt_of"

class UserRole(str, Enum):
    student = "Student"
    faculty = "Faculty"
    admin = "Admin"

class UserBase(BaseModel):
    name: str
    email: str
    role: UserRole
    institution: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class User(UserBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

class ProjectBase(BaseModel):
    title: str
    batch_year: int
    department: str
    institution: Optional[str] = None
    team_members: Optional[str] = None
    faculty_advisor: Optional[str] = None
    tech_stack: str
    domain_tags: Optional[str] = None

    problem_statement: str
    our_approach: Optional[str] = None
    outcome: ProjectOutcome
    completion_percentage: Optional[int] = 0
    what_was_delivered: Optional[str] = None

    failed_attempts: Optional[str] = None
    dead_ends: Optional[str] = None
    wish_we_had_known: Optional[str] = None

    whats_next: Optional[str] = None
    unsolved_problem: Optional[str] = None
    open_for_continuation: Optional[bool] = False

    code_repo_link: Optional[str] = None
    report_link: Optional[str] = None
    demo_link: Optional[str] = None
    repo_access_granted: Optional[bool] = False

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: str
    
    model_config = ConfigDict(from_attributes=True)

class ProjectRelationshipBase(BaseModel):
    source_project_id: str
    target_project_id: str
    relationship_type: RelationshipType

class ProjectRelationshipCreate(ProjectRelationshipBase):
    pass

class ProjectRelationship(ProjectRelationshipBase):
    id: str

    model_config = ConfigDict(from_attributes=True)

class IdeaMatchRequest(BaseModel):
    user_idea: str

class ProjectChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None
