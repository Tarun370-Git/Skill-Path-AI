import os
import json
import pytest
from types import SimpleNamespace
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Set environment variables for testing before importing settings
os.environ["DATABASE_URL"] = "sqlite:///./test_skillpath.db"

from app.database import Base, get_db
from app import ai
from app.main import app

# Create in-memory or file-based test database
engine = create_engine("sqlite:///./test_skillpath.db", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency override
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Clean up test database file after tests
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test_skillpath.db"):
        try:
            os.remove("./test_skillpath.db")
        except Exception:
            pass

client = TestClient(app)

def education_roadmap_data():
    topics = [
        "English language acquisition and learner assessment",
        "Lesson planning for diverse classrooms",
        "Grammar instruction through communicative activities",
        "Teaching reading and critical analysis",
        "Writing instruction and constructive feedback",
        "Classroom management and inclusive practice",
        "Assessment design and learner progress tracking",
        "Teaching portfolio and interview preparation",
    ]
    return {
        "readiness_score": 55,
        "existing_skills": ["Communication", "English literature", "M.Ed."],
        "missing_skills": ["Lesson planning", "Classroom assessment"],
        "priority_skills": ["Differentiated instruction", "Assessment design"],
        "roadmap": [
            {
                "week_number": week_number,
                "topic": topic,
                "tasks": [f"Create a classroom activity for {topic.lower()}"],
                "mini_project": f"Prepare a lesson plan for {topic.lower()}",
                "resources": ["British Council TeachingEnglish (teachingenglish.org.uk)"],
            }
            for week_number, topic in enumerate(topics, start=1)
        ],
        "portfolio_projects": ["English lesson-plan portfolio", "Learner assessment rubric"],
        "interview_topics": ["Differentiated instruction", "Formative assessment"],
        "certifications": ["Teaching English as a Foreign Language certification"],
    }

def configure_fake_gemini(monkeypatch, response_data):
    captured = {}

    class FakeModels:
        def generate_content(self, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(text=json.dumps(response_data))

    class FakeClient:
        def __init__(self, api_key):
            captured["api_key"] = api_key
            self.models = FakeModels()

        def __enter__(self):
            return self

        def __exit__(self, *args):
            return None

    monkeypatch.setattr(ai.settings, "GEMINI_API_KEY", "test-api-key")
    monkeypatch.setattr(ai.genai, "Client", FakeClient)
    return captured

def test_register():
    response = client.post(
        "/register",
        json={"name": "Test User", "email": "unit_test@example.com", "password": "password123"}
    )
    assert response.status_code == 201
    assert response.json()["email"] == "unit_test@example.com"
    assert "id" in response.json()

def test_login():
    response = client.post(
        "/login",
        json={"email": "unit_test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_unauthorized_endpoints():
    response = client.get("/roadmaps")
    assert response.status_code == 401

def test_cors_allows_vite_alternate_port():
    response = client.options(
        "/login",
        headers={
            "Origin": "http://localhost:5174",
            "Access-Control-Request-Method": "POST"
        }
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5174"

def test_generate_roadmap_uses_local_fallback_without_ai_key(monkeypatch):
    monkeypatch.setattr(ai.settings, "GEMINI_API_KEY", "")
    client.post(
        "/register",
        json={"name": "Fallback User", "email": "fallback_test@example.com", "password": "password123"}
    )
    login_response = client.post(
        "/login", json={"email": "fallback_test@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Post to generate-roadmap using form fields
    response = client.post(
        "/generate-roadmap",
        data={
            "dream_job": "Frontend React Engineer",
            "current_skills": "HTML, CSS",
            "experience_level": "Beginner"
        },
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["dream_job"] == "Frontend React Engineer"
    roadmap_data = json.loads(data["roadmap_json"])
    assert len(roadmap_data["roadmap"]) == 8
    assert roadmap_data["existing_skills"] == ["HTML", "CSS"]
    assert roadmap_data["missing_skills"]

    teacher_response = client.post(
        "/generate-roadmap",
        data={
            "dream_job": "English Teacher",
            "current_skills": "Communication, English literature",
            "experience_level": "Intermediate"
        },
        headers=headers
    )
    assert teacher_response.status_code == 200
    teacher_data = json.loads(teacher_response.json()["roadmap_json"])
    assert "English Teacher" in teacher_data["roadmap"][0]["topic"]
    assert "FastAPI" not in teacher_data["missing_skills"]

def test_generate_roadmap_uses_role_and_resume_with_ai(monkeypatch):
    captured = configure_fake_gemini(monkeypatch, education_roadmap_data())
    # Login to get token
    login_response = client.post(
        "/login",
        json={"email": "unit_test@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Simulate a dummy PDF file upload containing skills text
    dummy_pdf_content = b"%PDF-1.4 dummy pdf content with javascript python react skills"
    response = client.post(
        "/generate-roadmap",
        data={
            "dream_job": "English Teacher",
            "experience_level": "Intermediate",
            "current_skills": ""
        },
        files={"file": ("resume.pdf", dummy_pdf_content, "application/pdf")},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["dream_job"] == "English Teacher"
    roadmap_data = json.loads(data["roadmap_json"])
    assert roadmap_data["roadmap"][0]["topic"] == "English language acquisition and learner assessment"
    assert "English Teacher" in captured["contents"]
    assert "resume" in captured["contents"].lower()
    assert "Do not assume this is a software job" in captured["contents"]

def test_roadmap_list_includes_updated_progress(monkeypatch):
    configure_fake_gemini(monkeypatch, education_roadmap_data())
    login_response = client.post(
        "/login",
        json={"email": "unit_test@example.com", "password": "password123"}
    )
    headers = {"Authorization": f"Bearer {login_response.json()['access_token']}"}
    roadmap_response = client.post(
        "/generate-roadmap",
        data={
            "dream_job": "Backend Engineer",
            "current_skills": "Python",
            "experience_level": "Beginner"
        },
        headers=headers
    )
    roadmap_id = roadmap_response.json()["id"]

    progress_response = client.post(
        "/update-progress",
        json={"roadmap_id": roadmap_id, "week_number": 1, "completed": True},
        headers=headers
    )
    assert progress_response.status_code == 200

    roadmaps_response = client.get("/roadmaps", headers=headers)
    roadmap = next(item for item in roadmaps_response.json() if item["id"] == roadmap_id)
    assert len(roadmap["progress_items"]) == 8
    assert roadmap["progress_items"][0]["completed"] is True

def test_pdf_export_escapes_user_text(monkeypatch):
    configure_fake_gemini(monkeypatch, education_roadmap_data())
    login_response = client.post(
        "/login",
        json={"email": "unit_test@example.com", "password": "password123"}
    )
    headers = {"Authorization": f"Bearer {login_response.json()['access_token']}"}
    roadmap_response = client.post(
        "/generate-roadmap",
        data={
            "dream_job": "C++ & <Design>",
            "current_skills": "HTML & CSS <script>",
            "experience_level": "Beginner"
        },
        headers=headers
    )
    roadmap_id = roadmap_response.json()["id"]

    pdf_response = client.get(f"/roadmap/{roadmap_id}/pdf", headers=headers)

    assert pdf_response.status_code == 200
    assert pdf_response.headers["content-type"] == "application/pdf"
    assert pdf_response.content.startswith(b"%PDF")
