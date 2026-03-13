-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role ENUM('Student', 'Faculty', 'Admin') NOT NULL DEFAULT 'Student',
    institution VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    INDEX idx_email (email)
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    batch_year INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    institution VARCHAR(255),
    team_members TEXT,
    faculty_advisor VARCHAR(255),
    tech_stack TEXT NOT NULL,
    domain_tags TEXT,
    
    -- Analysis Content
    problem_statement TEXT NOT NULL,
    our_approach TEXT,
    outcome ENUM('Completed', 'Partially Completed', 'Abandoned', 'Proof of Concept Only') NOT NULL,
    completion_percentage INT DEFAULT 0,
    what_was_delivered TEXT,
    
    -- Insights/Lessons Learned
    failed_attempts TEXT, -- Stored as JSON string
    dead_ends TEXT,      -- Stored as JSON string
    wish_we_had_known TEXT,
    
    -- Future Work
    whats_next TEXT,
    unsolved_problem TEXT,
    open_for_continuation BOOLEAN DEFAULT FALSE,
    
    -- External Links
    code_repo_link VARCHAR(255),
    report_link VARCHAR(255),
    demo_link VARCHAR(255),
    
    -- Permissions
    repo_access_granted BOOLEAN DEFAULT FALSE
);

-- Project Relationships Table (for Knowledge Graph)
CREATE TABLE IF NOT EXISTS project_relationships (
    id VARCHAR(36) PRIMARY KEY,
    source_project_id VARCHAR(36) NOT NULL,
    target_project_id VARCHAR(36) NOT NULL,
    relationship_type ENUM('inspired_by', 'direct_continuation', 'alternative_approach', 'failed_attempt_of') NOT NULL,
    
    -- Foreign keys are handled at application level by SQLAlchemy but can be added here:
    CONSTRAINT fk_source FOREIGN KEY (source_project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_target FOREIGN KEY (target_project_id) REFERENCES projects(id) ON DELETE CASCADE
);
