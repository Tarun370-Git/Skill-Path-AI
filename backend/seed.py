import json
from datetime import datetime, timedelta
from app.database import SessionLocal, engine, Base
from app import models, auth, ai, crud

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Create a default test user
        test_email = "test@example.com"
        test_user = db.query(models.User).filter(models.User.email == test_email).first()
        
        if not test_user:
            print("Creating default test user...")
            test_user = models.User(
                name="Tarun Kumar",
                email=test_email,
                password_hash=auth.get_password_hash("password123")
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)
            print(f"Created user: {test_email} (Password: password123)")
        else:
            print("Default test user already exists.")
            
        # 2. Check if the user already has roadmaps
        user_roadmaps = db.query(models.Roadmap).filter(models.Roadmap.user_id == test_user.id).all()
        if not user_roadmaps:
            print("Seeding sample roadmaps...")
            
            # Seed 1: Full-Stack Web Developer (65% readiness, completed 3 weeks)
            fs_data = ai.generate_mock_roadmap(
                dream_job="Full-Stack Web Developer",
                current_skills="HTML, CSS, JavaScript, Basic Python",
                experience_level="Beginner"
            )
            fs_roadmap = crud.create_roadmap(
                db=db,
                roadmap_data=fs_data,
                user_id=test_user.id,
                dream_job="Full-Stack Web Developer",
                current_skills="HTML, CSS, JavaScript, Basic Python",
                readiness_score=65
            )
            # Make week 1, 2, 3 completed
            crud.update_progress(db, fs_roadmap.id, 1, True)
            crud.update_progress(db, fs_roadmap.id, 2, True)
            crud.update_progress(db, fs_roadmap.id, 3, True)
            
            # Seed 2: React Developer (80% readiness, completed 6 weeks)
            react_data = ai.generate_mock_roadmap(
                dream_job="React Developer",
                current_skills="HTML, CSS, JavaScript, Tailwind, Git, API Integrations",
                experience_level="Intermediate"
            )
            react_roadmap = crud.create_roadmap(
                db=db,
                roadmap_data=react_data,
                user_id=test_user.id,
                dream_job="React Developer",
                current_skills="HTML, CSS, JavaScript, Tailwind, Git, API Integrations",
                readiness_score=80
            )
            # Make week 1-6 completed
            for wk in range(1, 7):
                crud.update_progress(db, react_roadmap.id, wk, True)
                
            print("Successfully seeded 2 sample roadmaps with progress history!")
        else:
            print("Roadmaps already seeded.")
            
        print("Database seeding completed successfully.")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
