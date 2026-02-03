"""
AI/ML Module - Text classification for phishing detection
This integrates with Step 3 (Content Analysis) if needed
Currently the rule-based system in utils.py handles most logic
"""
from typing import Optional
import os
from functools import lru_cache

# Text model is optional - system works without it using rule-based analysis
DEFAULT_MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'models', 'text', 'text_model_final')
MODEL_PATH = os.environ.get('TEXT_MODEL_PATH', DEFAULT_MODEL_PATH)


@lru_cache(maxsize=1)
def load_model():
    """Load tokenizer and model from MODEL_PATH (cached)."""
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        import torch
        
        tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH, local_files_only=True)
        model.to('cpu')
        model.eval()
        return tokenizer, model
    except Exception as e:
        print(f"Warning: Could not load ML model: {e}")
        return None, None


def is_model_loaded() -> bool:
    """Check if ML model is available"""
    try:
        tokenizer, model = load_model()
        return tokenizer is not None and model is not None
    except Exception:
        return False


def predict_with_model(text: str) -> Optional[float]:
    """
    Use ML model for prediction if available
    Returns risk score 0.0-1.0 or None if model unavailable
    """
    try:
        import torch
        tokenizer, model = load_model()
        
        if tokenizer is None or model is None:
            return None
        
        inputs = tokenizer(text, truncation=True, padding=True, max_length=512, return_tensors='pt')
        
        with torch.no_grad():
            outputs = model(**inputs)
            probabilities = torch.softmax(outputs.logits, dim=1)
            # Assume model outputs [safe_prob, phishing_prob]
            risk_score = probabilities[0][1].item()  # Phishing probability
        
        return risk_score
    except Exception as e:
        print(f"Model prediction failed: {e}")
        return None
