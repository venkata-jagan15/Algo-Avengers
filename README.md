# Inno Track: Academic Project Knowledge Repository

Inno Track is an AI-powered platform designed to solve the "academic amnesia" problem in universities. It acts as a central nervous system for academic projects, allowing institutions to capture, connect, and analyze student development across different domains and batches.

---

## 🌟 Key Features

*   **AI Auto-Fill Studio (NVIDIA Nemotron)**: Automatically structure project data from `.zip` or `.pdf` uploads.
*   **Interactive Knowledge Graph**: Visualize semantic relationships between projects.
*   **Idea Matching (RAG)**: Search past projects and get AI insights for new ideas.
*   **Multi-Role Dashboards**: Specific portals for Students, Faculty, and Admin.
*   **Access Control**: Faculty can manage repo and file visibility for students.

---

## 🛠️ Tech Stack

*   **Frontend**: React 18 (Vite), Tailwind CSS, Lucide Icons, Recharts, React Force Graph.
*   **Backend**: FastAPI (Python), MySQL (SQLAlchemy), ChromaDB (Vector DB).
*   **AI**: NVIDIA Nemotron LLM via OpenAI-compatible API.

---

## 🚀 Getting Started

### 1. Database
Create a MySQL database named `innotrack`.

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Activate: .\venv\Scripts\activate (Win) or source venv/bin/activate (Mac/Linux)
pip install -r requirements.txt
# Copy .env.example to .env and add your keys
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
npm install
npm run dev
```

---

## 🚀 Deployment
This project is deployment-ready! See the **[Deployment Guide](.gemini/antigravity/brain/61e85879-f96a-428b-83a3-5fcc2d49ba98/deployment_guide.md)** for instructions on hosting with **Vercel** and **Render**.

---

## 📁 Project Structure
```plaintext
innotrack/
├── backend/            # FastAPI Application
│   ├── main.py         # API Endpoints
│   ├── models.py       # SQL Database Models
│   ├── rag.py          # AI & Vector Search Logic
│   └── database.py     # MySQL Connection Setup
├── src/                # React Frontend
│   ├── config.js       # Central API URL Configuration
│   ├── components/     # UI Elements
│   └── pages/          # Application Views
└── project reports/    # Sample data for testing
```

## 👔 Demo Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| Admin | `admin@innotrack.com` | `admin123` |
| Student | `student@innotrack.com` | `student123` |
