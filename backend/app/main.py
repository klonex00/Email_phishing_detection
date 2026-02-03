"""
AI-Powered Email Security API
Implements complete 10-step workflow from PDF
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .schemas import EmailIn, EmailAnalysisResponse, FeedbackIn
from .utils import parse_email, analyze_email_complete, analyze_attachment
from .auth import get_current_user, create_access_token, authenticate_user, register_user
from .db import get_db, engine
from . import models_db
from .crud import (
    create_email_analysis, 
    list_email_analyses, 
    add_analyst_feedback,
    update_sender_behavior,
    get_statistics
)
from sqlalchemy.orm import Session

# Create all database tables
models_db.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Email Guard API",
    description="AI-Powered Email Security System - 10 Step Workflow"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginIn(BaseModel):
    username: str
    password: str


# ============================================================================
# Authentication Endpoints
# ============================================================================

@app.post('/auth/token')
def login(form: LoginIn, db: Session = Depends(get_db)):
    """Login endpoint"""
    user = authenticate_user(db, form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    token = create_access_token({'sub': user.username})
    return {"access_token": token, "token_type": "bearer"}


@app.post('/auth/register')
def register(form: LoginIn, db: Session = Depends(get_db)):
    """Register new user"""
    user = register_user(db, form.username, form.password)
    token = create_access_token({'sub': user.username})
    return {"access_token": token, "token_type": "bearer"}


# ============================================================================
# Email Analysis Endpoints (Steps 1-8)
# ============================================================================

@app.post('/analyze', response_model=EmailAnalysisResponse)
async def analyze_email_endpoint(
    email: EmailIn, 
    user=Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """
    Main endpoint: Analyze email through complete 10-step workflow
    
    Steps executed:
    1. Email arrives and is parsed
    2. Authentication checks (SPF, DKIM, DMARC)
    3. Content & context analysis
    4. URL and link inspection
    5. Sender behavior analysis
    6. Sentiment & intent detection
    7. Ensemble scoring
    8. Automated action determination
    9. Store results for feedback loop
    10. Return results
    """
    # STEP 1: Parse email
    parsed = parse_email(email.raw)
    
    # STEPS 2-8: Complete analysis
    analysis = analyze_email_complete(parsed, db)
    
    # Add parsed data for storage
    analysis['sender'] = parsed.get('from', '')
    analysis['subject'] = parsed.get('subject', '')
    analysis['raw'] = email.raw
    
    # STEP 9: Store in database for learning
    db_record = create_email_analysis(db, analysis)
    
    # Update sender behavior tracking
    update_sender_behavior(db, analysis['sender'], analysis['classification'])
    
    # Return analysis response
    return EmailAnalysisResponse(**analysis)


@app.post('/analyze-file', response_model=EmailAnalysisResponse)
async def analyze_email_file(
    file: UploadFile = File(...), 
    user=Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    """Analyze email from uploaded .eml file"""
    content = await file.read()
    try:
        text = content.decode('utf-8', errors='ignore')
    except Exception:
        raise HTTPException(status_code=400, detail='Unable to decode uploaded file')
    
    # Parse and analyze
    parsed = parse_email(text)
    analysis = analyze_email_complete(parsed, db)
    
    # Store results
    analysis['sender'] = parsed.get('from', '')
    analysis['subject'] = parsed.get('subject', '')
    analysis['raw'] = text
    
    db_record = create_email_analysis(db, analysis)
    update_sender_behavior(db, analysis['sender'], analysis['classification'])
    
    return EmailAnalysisResponse(**analysis)


# =========================================================================
# Attachment Triage Endpoint (Research add-on)
# =========================================================================

@app.post('/analyze-attachment')
async def analyze_attachment_endpoint(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    content = await file.read()
    return analyze_attachment(file.filename, content)


# ============================================================================
# Feedback & Learning Endpoints (Step 9)
# ============================================================================

@app.post('/feedback')
def submit_feedback(
    feedback: FeedbackIn,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    STEP 9: Submit analyst feedback for continuous learning
    Helps improve model accuracy by marking false positives
    """
    result = add_analyst_feedback(
        db, 
        feedback.email_id, 
        feedback.feedback, 
        feedback.is_false_positive
    )
    
    if not result:
        raise HTTPException(status_code=404, detail='Email analysis not found')
    
    return {
        "message": "Feedback recorded successfully",
        "email_id": feedback.email_id
    }


# ============================================================================
# History & Statistics Endpoints (Step 10)
# ============================================================================

@app.get('/analyses')
def list_analyses(
    limit: int = 100, 
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List recent email analyses"""
    analyses = list_email_analyses(db, limit=limit)
    return [a.to_dict() for a in analyses]


@app.get('/statistics')
def get_stats(
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get overall system statistics"""
    return get_statistics(db)


# ============================================================================
# Health Check Endpoints
# ============================================================================

@app.get('/health')
def health():
    """Basic health check"""
    return {"status": "ok", "service": "email-guard-api"}


@app.get('/')
def root():
    """Root endpoint with system info"""
    return {
        "service": "Email Guard API",
        "version": "1.0.0",
        "description": "AI-Powered Email Security - 10 Step Workflow",
        "endpoints": {
            "analyze": "POST /analyze - Analyze email",
            "analyze_file": "POST /analyze-file - Analyze .eml file",
            "feedback": "POST /feedback - Submit analyst feedback",
            "analyses": "GET /analyses - List recent analyses",
            "statistics": "GET /statistics - System statistics"
        }
    }
