"""
CRUD operations for email analysis and feedback (Steps 9-10)
"""
import json
from sqlalchemy.orm import Session
from . import models_db
import hashlib
from datetime import datetime


def create_email_analysis(db: Session, analysis_data: dict) -> models_db.EmailAnalysis:
    """Store complete email analysis result"""
    
    # Generate unique email ID
    email_id = hashlib.md5(
        f"{analysis_data.get('sender', '')}{analysis_data.get('subject', '')}{datetime.now()}".encode()
    ).hexdigest()[:16]
    
    db_analysis = models_db.EmailAnalysis(
        email_id=email_id,
        sender=analysis_data.get('sender', ''),
        subject=analysis_data.get('subject', ''),
        
        # Authentication
        auth_score=analysis_data.get('auth_score', 0.0),
        spf_result=analysis_data.get('spf_result', ''),
        dkim_result=analysis_data.get('dkim_result', ''),
        dmarc_result=analysis_data.get('dmarc_result', ''),
        
        # Content
        content_score=analysis_data.get('content_score', 0.0),
        urgency_detected=analysis_data.get('urgency_detected', False),
        credential_request=analysis_data.get('credential_request', False),
        brand_misuse=analysis_data.get('brand_misuse', False),
        
        # URL
        url_score=analysis_data.get('url_score', 0.0),
        urls_found=analysis_data.get('urls_found', []),
        suspicious_urls=analysis_data.get('suspicious_urls', 0),
        
        # Behavior
        behavior_score=analysis_data.get('behavior_score', 0.0),
        is_new_sender=analysis_data.get('is_new_sender', True),
        odd_timing=analysis_data.get('odd_timing', False),
        
        # Sentiment
        sentiment_score=analysis_data.get('sentiment_score', 0.0),
        pressure_tone=analysis_data.get('pressure_tone', False),
        
        # Ensemble
        final_score=analysis_data.get('final_score', 0.0),
        classification=analysis_data.get('classification', 'Safe'),
        
        # Actions
        actions_taken=analysis_data.get('actions_taken', []),
        quarantined=analysis_data.get('quarantined', False),
        admin_notified=analysis_data.get('admin_notified', False),
        
        raw_email=analysis_data.get('raw', '')
    )
    
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    return db_analysis


def update_sender_behavior(db: Session, sender_email: str, classification: str):
    """STEP 9: Update sender behavior for learning"""
    sender = db.query(models_db.SenderBehavior).filter(
        models_db.SenderBehavior.sender_email == sender_email
    ).first()
    
    if not sender:
        sender = models_db.SenderBehavior(
            sender_email=sender_email,
            total_emails=0,
            suspicious_count=0,
            phishing_count=0,
            typical_send_times=[]
        )
        db.add(sender)
    
    sender.total_emails += 1
    sender.last_seen = datetime.now()
    
    if classification == 'Suspicious':
        sender.suspicious_count += 1
    elif classification == 'Phishing':
        sender.phishing_count += 1
    
    db.commit()


def add_analyst_feedback(db: Session, email_id: int, feedback: str, is_false_positive: bool):
    """STEP 9: Add analyst feedback for model improvement"""
    analysis = db.query(models_db.EmailAnalysis).filter(
        models_db.EmailAnalysis.id == email_id
    ).first()
    
    if analysis:
        analysis.analyst_feedback = feedback
        analysis.is_false_positive = is_false_positive
        db.commit()
        return analysis
    return None


def list_email_analyses(db: Session, limit: int = 100):
    """List recent email analyses"""
    return db.query(models_db.EmailAnalysis).order_by(
        models_db.EmailAnalysis.created_at.desc()
    ).limit(limit).all()


def get_statistics(db: Session):
    """Get overall statistics"""
    total = db.query(models_db.EmailAnalysis).count()
    phishing = db.query(models_db.EmailAnalysis).filter(
        models_db.EmailAnalysis.classification == 'Phishing'
    ).count()
    suspicious = db.query(models_db.EmailAnalysis).filter(
        models_db.EmailAnalysis.classification == 'Suspicious'
    ).count()
    safe = db.query(models_db.EmailAnalysis).filter(
        models_db.EmailAnalysis.classification == 'Safe'
    ).count()
    
    return {
        'total': total,
        'phishing': phishing,
        'suspicious': suspicious,
        'safe': safe
    }


def get_user_by_username(db: Session, username: str):
    return db.query(models_db.User).filter(models_db.User.username == username).first()


def create_user(db: Session, username: str, hashed_password: str):
    u = models_db.User(username=username, hashed_password=hashed_password)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u
