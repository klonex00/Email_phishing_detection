from typing import List, Optional
from pydantic import BaseModel


class EmailIn(BaseModel):
    raw: str


class EmailAnalysisResponse(BaseModel):
    """Response matching PDF workflow steps"""
    # Step 2: Authentication
    auth_score: float
    spf_result: str
    dkim_result: str
    dmarc_result: str
    
    # Step 3: Content Analysis
    content_score: float
    urgency_detected: bool
    credential_request: bool
    brand_misuse: bool
    
    # Step 4: URL Inspection
    url_score: float
    urls_found: List[str]
    suspicious_urls: int
    
    # Step 5: Sender Behavior
    behavior_score: float
    is_new_sender: bool
    odd_timing: bool
    
    # Step 6: Sentiment
    sentiment_score: float
    pressure_tone: bool
    
    # Step 7: Ensemble
    final_score: float
    classification: str
    
    # Step 8: Actions
    actions_taken: List[str]
    quarantined: bool
    admin_notified: bool


class FeedbackIn(BaseModel):
    """Step 9: Analyst feedback"""
    email_id: int
    feedback: str
    is_false_positive: bool
