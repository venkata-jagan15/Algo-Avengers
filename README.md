Inno Track: Academic Project Knowledge RepositoryInno Track is an AI-powered ecosystem designed to solve "academic amnesia" in universities. It captures the lifecycle of student projects—including breakthroughs and failed attempts—ensuring institutional knowledge grows across batches rather than disappearing at graduation.Explore Features • Tech Stack • Installation • Demo Credentials🌟 Key Features🧠 AI Auto-Fill Studio (Powered by NVIDIA Nemotron)Stop manual data entry. Upload a .zip codebase or .pdf report, and our backend LLM automatically extracts:Core Problem Statements & Tech Stacks.Project Completion Percentages.The "Failure Log": Insights into what didn't work and why.🕸️ Interactive Knowledge GraphVisualize connections between research. Using React Force Graph, users can instantly identify if a project is a Direct Continuation or an Alternative Approach to existing work.🔍 Idea Matching & Pitfall Prevention (RAG)Integrated with ChromaDB, students can test project ideas against a vector database of past work to receive AI-generated warnings about common pitfalls before writing a single line of code.📊 Institutional AnalyticsA macro-level dashboard for Admins built with Recharts to track department engagement, trending domains, and overall project success rates.🛠️ Tech StackLayerTechnologiesFrontendReact 18 (Vite), Tailwind CSS, Lucide Icons, React Force Graph 2D, RechartsBackendFastAPI (Python), MySQL, SQLAlchemy ORMAI/MLNVIDIA Nemotron LLM, LangChain, ChromaDB (Vector DB)DevOpsPydantic, Axios, Python-Dotenv🚀 Installation & Setup1. Database InitializationEnsure MySQL is running on port 3306.SQLCREATE DATABASE innotrack;
2. Backend ConfigurationBashcd backend
python -m venv venv
# Activate: .\venv\Scripts\activate (Win) or source venv/bin/activate (Mac/Linux)

pip install -r requirements.txt
# Seed the AI Knowledge Base
python temp_refresh_db.py
python ingest_reports.py

uvicorn main:app --reload --port 8000
3. Frontend ConfigurationBashcd src
npm install
npm run dev
Access the App: http://localhost:8080🔐 Environment VariablesCreate a .env file in the /backend folder:Code snippetDATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/innotrack
NVIDIA_API_KEY=your_nvidia_api_key_here
LANGCHAIN_API_KEY=your_langchain_api_key_here
LANGCHAIN_TRACING_V2=true
👔 Demo CredentialsRoleEmailPasswordAdminadmin@innotrack.comadmin123Studentstudent@innotrack.comstudent123📁 Architecture OverviewPlaintextinnotrack/
├── backend/            # FastAPI, SQLAlchemy Models, & RAG Logic
│   ├── rag.py          # Core AI / ChromaDB integration
│   └── ingest_reports.py # Automated PDF/Zip processing
├── src/                # React (Vite) Frontend
│   ├── components/     # UI Elements (Force Graphs, Charts)
│   └── pages/          # Auth, AI Studio, & Admin Dashboards
└── project reports/    # Sample data for ingestion testing