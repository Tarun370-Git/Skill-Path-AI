import json
from sqlalchemy.orm import Session
from app.models import User, Roadmap, Progress
from app.schemas import UserCreate

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    from app.auth import get_password_hash
    hashed_password = get_password_hash(user.password)
    db_user = User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_roadmap(db: Session, roadmap_id: int):
    return db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()

def get_user_roadmaps(db: Session, user_id: int):
    return db.query(Roadmap).filter(Roadmap.user_id == user_id).order_by(Roadmap.created_at.desc()).all()

def create_roadmap(db: Session, roadmap_data: dict, user_id: int, dream_job: str, current_skills: str, readiness_score: int):
    db_roadmap = Roadmap(
        user_id=user_id,
        dream_job=dream_job,
        current_skills=current_skills,
        roadmap_json=json.dumps(roadmap_data),
        readiness_score=readiness_score
    )
    db.add(db_roadmap)
    db.commit()
    db.refresh(db_roadmap)
    
    # Initialize Progress items for each week (1 to 8)
    for week_num in range(1, 9):
        db_progress = Progress(
            roadmap_id=db_roadmap.id,
            week_number=week_num,
            completed=False
        )
        db.add(db_progress)
    db.commit()
    db.refresh(db_roadmap)
    
    return db_roadmap

def update_progress(db: Session, roadmap_id: int, week_number: int, completed: bool):
    db_progress = db.query(Progress).filter(
        Progress.roadmap_id == roadmap_id,
        Progress.week_number == week_number
    ).first()
    if db_progress:
        db_progress.completed = completed
        db.commit()
        db.refresh(db_progress)
    return db_progress
