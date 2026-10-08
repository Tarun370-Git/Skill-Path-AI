# SkillPath AI - Intelligent Career Roadmap & Skill Gap Analyzer

SkillPath AI is a complete full-stack web application designed for final-year BCA engineering portfolios. The application analyzes a user's target career role (dream job) and their current skills to generate an interactive 8-week structured learning roadmap, compute a career readiness index score, render active skill gaps, track week-by-week checkboxes, and export blueprints to a clean PDF report.

The system utilizes **FastAPI (Python)**, **Vite React (JavaScript)**, **SQLite**, and **Google Gemini API** with structured schema outputs, featuring a robust, context-aware local mockup generator for offline/unconfigured API key evaluation.

---

## 🚀 Key Features

* **Resume PDF Upload**: Upload your resume in PDF format; the AI automatically extracts existing skills to save manual typing time.
* **JWT Secure Authentication**: Fully protected login/registration views with JWT payload persistence and route guards.
* **Roadmap Generator**: Uses Gemini for role-specific generated roadmaps when `GEMINI_API_KEY` is set. Without a key, a built-in local template generator keeps roadmap, skill-gap, and readiness features available offline.
* **Interactive Timeline Checklist**: Check off weeks as completed to update database status and recalculate completion percentages in real-time.
* **Skill Gap Visualization**: High-fidelity circular SVG chart and progress bars with side-by-side matrices (Existing vs Missing vs Priority skills).
* **PDF Export Engine**: Generate downloadable roadmap PDFs on the backend using `reportlab`.
* **Visual Premium Design**: Dark/Light mode theme toggle with glassmorphism dashboard cards, loading skeletons, and interactive animations.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: React.js (v18.3), Tailwind CSS, Lucide icons, Axios, Vite.
* **Backend**: FastAPI (Python), Uvicorn server, Pydantic data schemas.
* **Database**: SQLite with SQLAlchemy ORM (User, Roadmap, and Progress models).
* **AI Integration**: Google Gemini API via `google-genai` with validated structured output.

---

## 📂 Project Structure

```
skillpath-ai/
├── README.md
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py        # API Routes, CORS settings, DB tables initialization
│   │   ├── config.py      # Pydantic-settings config mapper
│   │   ├── database.py    # SQLite engine and session makers
│   │   ├── models.py      # SQLAlchemy schemas (Users, Roadmaps, Progress)
│   │   ├── schemas.py     # Pydantic schemas validation
│   │   ├── auth.py        # BCrypt hashing & JWT token generators
│   │   ├── ai.py          # Gemini API connector and mock blueprinters
│   │   ├── pdf.py         # ReportLab flowables PDF generator
│   │   └── crud.py        # Database operations helpers
│   ├── requirements.txt   # Backend pip packages
│   ├── seed.py            # Database seed script for quick evaluator demos
│   └── .env.example       # Local configuration template
└── frontend/
    ├── package.json       # Node package configurations
    ├── vite.config.js
    ├── tailwind.config.js # Custom themes and fonts
    ├── postcss.config.js
    ├── index.html         # Fonts and meta tags
    └── src/
        ├── index.css      # Core utility panels, gradients, and custom scrollbars
        ├── main.jsx       # ReactDOM bootstrap
        ├── App.jsx        # Routing system (React Router)
        ├── context/
        │   ├── AuthContext.jsx  # JWT state interceptor
        │   └── ThemeContext.jsx # Dark/Light persist context
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── RoadmapCard.jsx  # History preview cards
        │   ├── SkillGapChart.jsx # Circular SVGs and progress bars
        │   └── SkeletonLoader.jsx # Glowing progressive AI thinking loaders
        ├── pages/
        │   ├── Landing.jsx      # Features overview page
        │   ├── Login.jsx        # JWT auth form
        │   ├── Register.jsx     # User signup form
        │   ├── Dashboard.jsx    # Roadmap inputs and histories
        │   ├── RoadmapDetails.jsx # Interactive timelines, checklist, and PDF links
        │   └── Profile.jsx      # Complete analytics logs
        └── utils/
            └── api.js           # API request methods (Axios)
```

---

## ⚙️ Installation & Setup

Ensure you have **Python 3** (`py` launcher on Windows) and **Node.js** (including `npm`) installed.

### 1. Backend Setup

1. Open a terminal and navigate to the `backend/` folder.
2. Create a Python Virtual Environment:
   ```bash
   py -m venv venv
   ```
3. Activate the virtual environment:
   * **Windows Powershell**: `.\venv\Scripts\Activate.ps1`
   * **Windows CMD**: `.\venv\Scripts\activate.bat`
   * **Mac/Linux**: `source venv/bin/activate`
4. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Optional Gemini API Key:
   Copy `backend/.env.example` to `backend/.env` and set `GEMINI_API_KEY=your_api_key_here` to enable Gemini-generated roadmaps. Without a key, the app uses its built-in local roadmap generator.
6. Seed the Database:
   Generate standard users and mock roadmaps with active history logs:
   ```bash
   python seed.py
   ```
7. Start the API Server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API documentation is now available at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup

1. Open another terminal and navigate to the `frontend/` folder.
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Run the React Vite Dev Server:
   ```bash
   npm run dev
   ```
4. Access the web interface at: [http://localhost:5173](http://localhost:5173)

---

## ☁️ Deploying a Live Demo

The `render.yaml` Blueprint deploys the API and frontend to Render. A Neon PostgreSQL database keeps user accounts and roadmaps between deploys; the local app continues to use SQLite by default.

1. Create a PostgreSQL project on [Neon](https://neon.tech/) and copy its connection string.
2. In Render, create a new Blueprint from this GitHub repository and use `render.yaml`.
3. When prompted, set `DATABASE_URL` to the Neon connection string. Render generates a production `SECRET_KEY` for the API.
4. After Render creates the services, check that `CORS_ORIGINS` on the API is the exact URL of the frontend service, including `https://`.
5. Wait for both services to finish deploying, then open the frontend service URL and register an account. Set `GEMINI_API_KEY` on the API service if you want AI-generated roadmaps; otherwise the local generator is used.

The free Render web service may sleep when idle, so its first request can take a little while. Keep database credentials and API keys in the hosting provider's environment settings, not in GitHub.

---

## 🎓 Evaluation & Demo Guide

To easily demonstrate the project to examiners or interviewers, the database comes pre-seeded with sample histories:

1. **Sign In**: Navigate to the Login page and use:
   * **Email**: `test@example.com`
   * **Password**: `password123`
2. **Review Histories**: The dashboard displays 2 pre-generated roadmaps with different learning percentages and readiness scores:
   * **Full-Stack Web Developer**: 3 completed weeks.
   * **React Developer**: 6 completed weeks.
3. **Interactive Checklists**: Open any roadmap, toggle week checkboxes, and watch the circular SVG score match metrics and progress rings update dynamically.
4. **PDF Reports**: Click the **Download Roadmap PDF** button in the header toolbar to immediately compile and download a professional learning report.
