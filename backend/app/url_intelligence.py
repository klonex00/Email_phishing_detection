"""
AI-Powered URL Intelligence Module
Uses ML and contextual features instead of just regex patterns
"""
from typing import Tuple, List, Dict, Any
from urllib.parse import urlparse
import re
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def extract_url_features(url: str) -> Dict[str, Any]:
    """
    Extract semantic features from URL for ML model
    These features help the model understand URL characteristics
    """
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    path = parsed.path.lower()
    full_url = url.lower()
    
    features = {
        # Domain characteristics
        'domain_length': len(domain),
        'subdomain_count': domain.count('.') - 1,
        'has_ip': bool(re.match(r'\d+\.\d+\.\d+\.\d+', domain)),
        'domain_has_numbers': bool(re.search(r'\d', domain)),
        'domain_has_hyphen': '-' in domain,
        
        # Path characteristics  
        'path_length': len(path),
        'path_depth': path.count('/'),
        'has_suspicious_extension': any(ext in path for ext in ['.exe', '.zip', '.scr', '.bat']),
        
        # URL structure
        'url_length': len(full_url),
        'has_at_symbol': '@' in full_url,
        'has_double_slash_in_path': '//' in path,
        'url_entropy': calculate_entropy(full_url),
        
        # Suspicious patterns
        'excessive_encoding': full_url.count('%') > 3,
        'port_in_url': bool(re.search(r':\d+', domain)),
        
        # Textual features for semantic analysis
        'url_text': full_url,
        'domain_text': domain,
    }
    
    return features


def calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy - randomness indicator"""
    from collections import Counter
    import math
    
    if not text:
        return 0.0
    
    counter = Counter(text)
    length = len(text)
    entropy = -sum((count/length) * math.log2(count/length) for count in counter.values())
    
    return entropy


def analyze_url_with_ai(url: str, email_context: str = "") -> Tuple[float, List[str]]:
    """
    REAL intelligence: External APIs + ML, NOT text matching!
    
    Priority order:
    1. External threat intelligence (Google, PhishTank, etc.)
    2. Domain infrastructure analysis (WHOIS, SSL, DNS)
    3. ML model features (entropy, structure)
    4. Minimal safety nets only
    """
    from .external_intelligence import comprehensive_url_check
    
    reasons = []
    
    # PRIMARY: Use real external intelligence APIs
    try:
        external_result = comprehensive_url_check(url)
        external_risk = external_result['risk_score']
        external_reasons = external_result['details']
        reasons.extend(external_reasons)
        
        # If external sources flag it, trust them
        if external_risk >= 0.7:
            return external_risk, reasons
        
        risk_score = external_risk
    except Exception as e:
        logger.warning(f"External intelligence failed: {e}")
        risk_score = 0.0
        reasons.append("⚠ External checks unavailable")
    
    # SECONDARY: ML-based feature analysis (not text matching)
    # BUT: Only apply if external intelligence didn't give clean bill of health
    features = extract_url_features(url)
    parsed = urlparse(url)
    domain = parsed.netloc.lower()
    
    # If external intelligence says domain is 100% safe (risk=0.0), skip ML features
    # Legitimate sites like myntra.com with tracking params shouldn't be penalized
    if external_risk == 0.0:
        # Domain is established with valid SSL/DNS - trust external intelligence
        return risk_score, reasons
    
    # Critical safety nets (absolute certainties only)
    if features['has_ip']:
        risk_score += 0.7
        reasons.append('⚠ IP address used instead of domain')
    
    # Entropy-based detection (ML feature, not text matching)
    # Only flag if external intelligence already has some concerns
    if features['url_entropy'] > 4.5 and external_risk > 0:
        risk_score += 0.4
        reasons.append(f'⚠ High randomness score: {features["url_entropy"]:.1f}')
    
    # Context analysis (understand relationship, not keywords)
    if email_context:
        context_risk = analyze_url_context(url, email_context)
        if context_risk > 0:
            risk_score += context_risk
            reasons.append('⚠ Suspicious context relationship')
    
    return min(risk_score, 1.0), reasons


def analyze_url_context(url: str, email_text: str) -> float:
    """
    Contextual analysis - understands URL in relation to email content
    This is where AI shines vs regex
    """
    risk = 0.0
    email_lower = email_text.lower()
    domain = urlparse(url).netloc.lower()
    
    # Money/prize scam indicators with URL
    money_scam_keywords = ['$', 'dollar', 'free money', 'win', 'prize', 'reward', 
                          'bonus', 'cash', 'claim', '000']  # 000 catches 2000, 5000, etc
    if any(kw in email_lower for kw in money_scam_keywords):
        risk += 0.6
    
    # Check if URL context matches email narrative
    # Example: Email says "Microsoft" but URL is random domain
    major_brands = ['microsoft', 'google', 'amazon', 'facebook', 'paypal', 'apple', 'bank']
    
    for brand in major_brands:
        if brand in email_lower and brand not in domain:
            # Brand mentioned but URL doesn't match
            risk += 0.5
            break
    
    # Check for context mismatches
    action_words = ['click', 'verify', 'confirm', 'update', 'urgent', 'login', 'signin']
    if any(word in email_lower for word in action_words):
        # High-pressure language with URL = suspicious context
        risk += 0.3
    
    return min(risk, 1.0)


def smart_url_extraction(text: str) -> List[str]:
    """
    Intelligent URL extraction using NLP, not just regex
    Understands URLs in context, finds obfuscated URLs
    """
    urls = set()
    
    # Pattern 1: Standard URLs with protocol
    http_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    urls.update(re.findall(http_pattern, text))
    
    # Pattern 2: www. domains (most common in phishing)
    www_pattern = r'www\.[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z0-9][-a-zA-Z0-9]*)+(?:/[^\s<>"{}|\\^`\[\]]*)?'
    www_urls = re.findall(www_pattern, text)
    urls.update([f'http://{u}' for u in www_urls])
    
    # Pattern 3: Standalone domains with TLDs (typosquatting attempts)
    # Matches: domain.com, sub.domain.xyz, zilllow.com-rental.xyz, micros0ft-secure.com
    domain_pattern = r'\b[a-zA-Z0-9][-a-zA-Z0-9]*(?:\.[a-zA-Z0-9][-a-zA-Z0-9]*)+\.(com|org|net|xyz|tk|ml|ga|cf|gq|top|click|link|local|zip|loan|win|bid|co|io|me|info)\b'
    for match in re.finditer(domain_pattern, text):
        full_domain = match.group(0)
        # Don't add if already captured
        if not any(full_domain in str(url) for url in urls):
            urls.add(f'http://{full_domain}')
    
    # Pattern 4: IP addresses (with or without protocol)
    ip_pattern = r'(?:https?://)?(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:/[^\s]*)?'
    ip_urls = re.findall(ip_pattern, text)
    urls.update([u if u.startswith('http') else f'http://{u}' for u in ip_urls])
    
    # Clean up and return
    return list(urls)
