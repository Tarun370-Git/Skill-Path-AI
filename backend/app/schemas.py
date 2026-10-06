import datetime
from pydantic import BaseModel, EmailStr
from typing import List, Optional

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    email: Optional[str] = None


# Progress Schemas
class ProgressUpdate(BaseModel):
    roadmap_id: int
    week_number: int
    completed: bool

class ProgressResponse(BaseModel):
    id: int
    roadmap_id: int
    week_number: int
    completed: bool

    class Config:
        from_attributes = True


# Detailed AI generated structure
class WeekRoadmap(BaseModel):
    week_number: int
    topic: str
    tasks: List[str]
    mini_project: str
    resources: List[str]

class GeneratedRoadmapData(BaseModel):
    readiness_score: int
    existing_skills: List[str]
    missing_skills: List[str]
    priority_skills: List[str]
    roadmap: List[WeekRoadmap]
    portfolio_projects: List[str]
    interview_topics: List[str]
    certifications: List[str]


# Roadmap Schemas
class RoadmapCreate(BaseModel):
    dream_job: str
    current_skills: str
    experience_level: Optional[str] = "Beginner"

class RoadmapResponse(BaseModel):
    id: int
    user_id: int
    dream_job: str
    current_skills: str
    readiness_score: int
    roadmap_json: str # Stringified GeneratedRoadmapData
    created_at: datetime.datetime
    progress_items: List[ProgressResponse]

    class Config:
        from_attributes = True

class RoadmapBriefResponse(BaseModel):
    id: int
    user_id: int
    dream_job: str
    current_skills: str
    readiness_score: int
    created_at: datetime.datetime
    progress_items: List[ProgressResponse]

    class Config:
        from_attributes = True
