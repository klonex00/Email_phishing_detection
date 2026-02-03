from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, JSON
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
import json

Base = declarative_base()


class EmailAnalysis(Base):
    """Main table storing email analysis results matching PDF workflow"""
    __tablename__ = 'email_analyses'
    
    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(String, unique=True, index=True)
    sender = Column(String, index=True)
    subject = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Step 2: Authentication scores
    auth_score = Column(Float, default=0.0)  # SPF/DKIM/DMARC
    spf_result = Column(String)
    dkim_result = Column(String)
    dmarc_result = Column(String)
    
    # Step 3: Content analysis score
    content_score = Column(Float, default=0.0)
    urgency_detected = Column(Boolean, default=False)
    credential_request = Column(Boolean, default=False)
    brand_misuse = Column(Boolean, default=False)
    
    # Step 4: URL inspection score
    url_score = Column(Float, default=0.0)
    urls_found = Column(JSON)  # List of URLs
    suspicious_urls = Column(Integer, default=0)
    
    # Step 5: Sender behavior score
    behavior_score = Column(Float, default=0.0)
    is_new_sender = Column(Boolean, default=True)
    odd_timing = Column(Boolean, default=False)
    
    # Step 6: Sentiment score
    sentiment_score = Column(Float, default=0.0)
    pressure_tone = Column(Boolean, default=False)
    
    # Step 7: Final ensemble score
    final_score = Column(Float, index=True)
    classification = Column(String, index=True)  # Safe/Suspicious/Phishing
    
    # Step 8: Automated actions
    actions_taken = Column(JSON)  # List of actions
    quarantined = Column(Boolean, default=False)
    admin_notified = Column(Boolean, default=False)
    
    # Step 9: Feedback loop
    analyst_feedback = Column(String, nullable=True)
    is_false_positive = Column(Boolean, default=False)
    
    raw_email = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'email_id': self.email_id,
            'sender': self.sender,
            'subject': self.subject,
            'auth_score': self.auth_score,
            'content_score': self.content_score,
            'url_score': self.url_score,
            'behavior_score': self.behavior_score,
            'sentiment_score': self.sentiment_score,
            'final_score': self.final_score,
            'classification': self.classification,
            'actions_taken': self.actions_taken,
            'quarantined': self.quarantined,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class SenderBehavior(Base):
    """Track sender history for behavior analysis (Step 5)"""
    __tablename__ = 'sender_behaviors'
    
    sender_email = Column(String, primary_key=True, index=True)
    total_emails = Column(Integer, default=0)
    suspicious_count = Column(Integer, default=0)
    phishing_count = Column(Integer, default=0)
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now())
    typical_send_times = Column(JSON)  # List of hour patterns


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
