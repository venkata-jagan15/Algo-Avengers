# Inno Track: Academic Project Knowledge Repository

Inno Track is an AI-powered platform designed to solve the "academic amnesia" problem in universities. Every year, students build incredible projects, but the knowledge, failed attempts, and core breakthroughs are often lost once the semester ends. 

Inno Track acts as a central nervous system for academic projects, allowing institutions to capture, connect, and analyze student development across different domains and batches.

---

## 🌟 Key Features

* **Multi-Role Authentication**: Distinct portals with secure routing for Students, Faculty, and Institution Administrators.
* **AI Auto-Fill Studio (NVIDIA Nemotron)**: Students can upload raw project `.zip` codebases or `.pdf` reports. The backend parses the files, extracts text, and uses a powerful LLM to automatically structure the project data (identifying problem statements, tech stacks, completion percentages, and even *failed attempts*).
* **Interactive Knowledge Graph**: A visual, interactive node-link diagram that exposes the relationships between projects. Instantly see if a new project is a "Direct Continuation" of a past project, or an "Alternative Approach" to an existing problem.
* **Idea Matching (RAG)**: Students can type in a rough project idea. The system uses ChromaDB vector search to find similar past projects and uses the LLM to provide immediate insights and warnings about common pitfalls before the student begins coding.
* **Institution Analytics Dashboard**: A read-only, macro-level dashboard for Admins. Visualizes project completion rates, department engagement, and top focus domains using dynamic charts (Recharts).

---

## 🛠️ Tech Stack

### Frontend (User Interface)
* **React 18** (Vite)
* **Tailwind CSS** (Styling & Layouts)
* **Lucide React** (Icons)
* **React Force Graph 2D** (Knowledge Graph Visualization)
* **Recharts** (Analytics Dashboard)
* **Axios** (API Communication)

### Backend (API & AI Layer)
* **FastAPI** (Python web framework)
* **MySQL** (Relational Database)
* **SQLAlchemy** (ORM)
* **ChromaDB** (Vector Database for RAG)
* **NVIDIA Nemotron LLM** (via OpenAI-compatible API)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:
* **Node.js** (v18 or higher)
* **Python** (3.9 or higher)
* **MySQL Server** (Running locally on default port 3306)

---

## 🚀 Installation & Setup

### 1. Database Setup
Ensure your local MySQL server is running. Log into MySQL and create the database:
```sql
CREATE DATABASE innotrack;
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Virtual Environment:
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Mac/Linux:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` directory (see Environment Variables below).
5. Seed the database with demo data:
   ```bash
   python temp_refresh_db.py
   python ingest_reports.py
   ```
6. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the project root:
   ```bash
   cd src  # Or stay in the root if package.json is there
   ```
2. Install Node modules:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The application will be available at `http://localhost:8080` (or the port specified by Vite).

---

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory with the following structure:

```env
# Database Configuration
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/innotrack

# NVIDIA AI Endpoint (For Document Parsing & RAG)
NVIDIA_API_KEY=your_nvidia_api_key_here

# Required for file parsing
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langchain_api_key_here
```

---

## 👔 Demo Credentials

Once the database is seeded, you can log in using the following test accounts:

**Institution Administrator:**
* Email: `admin@innotrack.com`
* Password: `admin123`
*(Logging in with these credentials will automatically route you to the restricted Analytics Dashboard).*

**Student User:**
* Email: `student@innotrack.com`
* Password: `student123`

---

## 📁 Project Structure

```
innotrack/
├── backend/                  # FastAPI Application
│   ├── main.py               # API Endpoints & Routes
│   ├── models.py             # SQLAlchemy Database Models
│   ├── schemas.py            # Pydantic Validation Schemas
│   ├── database.py           # MySQL Connection Setup
│   ├── rag.py                # LLM, LangChain, and ChromaDB Logic
│   ├── ingest_reports.py     # Script to bulk-ingest PDFs/ZIPs via LLM
│   └── project reports/      # Sample data for ingestion
│
├── src/                      # React Frontend
│   ├── components/           # Reusable UI Elements (Navbar, ProtectedRoutes)
│   ├── pages/                # Main Application Views
│   │   ├── Home.jsx                 # Public Landing Page
│   │   ├── Dashboard.jsx            # Student/Faculty Portal
│   │   ├── SubmitProject.jsx        # 5-stage submission form with AI Auto-Fill
│   │   ├── KnowledgeGraphPage.jsx   # Interactive Node Graph
│   │   ├── InstitutionDashboard.jsx # Admin Analytics Screen
│   │   └── Login.jsx / Register.jsx # Authentication
│   ├── App.jsx               # React Router Configuration
│   └── main.jsx              # React Entry Point
```

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the issues page.
