from fastapi import FastAPI, Depends, HTTPException, status, Form, File, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import json
from typing import List, Optional

from app import models, schemas, crud, auth, ai, pdf
from app.config import settings
from app.database import engine, get_db

# Initialize database models (auto-creates tables in SQLite)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SkillPath AI API",
    description="Intelligent Career Roadmap & Skill Gap Analyzer API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return crud.create_user(db, user)

@app.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user_credentials.email)
    if not db_user or not auth.verify_password(user_credentials.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

# Standard OAuth2 Form Login Endpoint (allows FastAPI automatic Swagger docs logins)
@app.post("/token", response_model=schemas.Token)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, form_data.username) # Form username contains email
    if not db_user or not auth.verify_password(form_data.password, db_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": db_user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }

@app.post("/generate-roadmap", response_model=schemas.RoadmapResponse)
async def generate_roadmap(
    dream_job: str = Form(...),
    experience_level: str = Form(...),
    current_skills: str = Form(default=""),
    file: Optional[UploadFile] = File(default=None),
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    try:
        pdf_bytes = None
        skills_text = current_skills
        
        if file:
            # 1. Read PDF bytes
            pdf_bytes = await file.read()
            # Try to extract skills to list in database
            extracted_text = ai.extract_text_from_pdf(pdf_bytes)
            if extracted_text:
                skills_text = f"Extracted from Resume: {extracted_text[:150]}..."
        
        # 2. Trigger AI Roadmap generation (Gemini or tailored Mock fallback)
        roadmap_data = ai.generate_roadmap_data(
            dream_job=dream_job,
            current_skills=current_skills,
            experience_level=experience_level,
            pdf_bytes=pdf_bytes
        )
        
        # Use the AI-extracted skills for the saved roadmap profile when available.
        existing_skills_list = roadmap_data.get("existing_skills", [])
        if existing_skills_list:
            skills_text = ", ".join(existing_skills_list)
            
        # 3. Extract readiness score
        readiness_score = roadmap_data.get("readiness_score", 50)
        
        # 4. Create database entities
        db_roadmap = crud.create_roadmap(
            db=db,
            roadmap_data=roadmap_data,
            user_id=current_user.id,
            dream_job=dream_job,
            current_skills=skills_text,
            readiness_score=readiness_score
        )
        return db_roadmap
    except ai.AIConfigurationError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ai.RoadmapGenerationError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate roadmap: {str(e)}"
        )

@app.get("/roadmaps", response_model=List[schemas.RoadmapBriefResponse])
def get_roadmaps(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    return crud.get_user_roadmaps(db, current_user.id)

@app.get("/roadmap/{id}", response_model=schemas.RoadmapResponse)
def get_roadmap_details(
    id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = crud.get_roadmap(db, id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    if roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this roadmap")
    return roadmap

@app.post("/update-progress", response_model=schemas.ProgressResponse)
def update_progress(
    progress_in: schemas.ProgressUpdate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    # Verify ownership of roadmap
    roadmap = crud.get_roadmap(db, progress_in.roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    if roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this roadmap")
        
    db_progress = crud.update_progress(
        db=db,
        roadmap_id=progress_in.roadmap_id,
        week_number=progress_in.week_number,
        completed=progress_in.completed
    )
    if not db_progress:
        raise HTTPException(status_code=400, detail="Invalid week number or progress update failed")
    return db_progress

@app.get("/roadmap/{id}/pdf")
def export_roadmap_pdf(
    id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    roadmap = crud.get_roadmap(db, id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    if roadmap.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this roadmap")
        
    pdf_buffer = pdf.generate_pdf_report(roadmap)
    filename = f"roadmap_{roadmap.dream_job.lower().replace(' ', '_')}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
