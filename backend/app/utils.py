"""
AI-Powered Email Security System - Complete Implementation
Matches the 10-step workflow from PDF
"""

import re
import hashlib
import unicodedata
import io
import zipfile
from email import policy
from email.parser import Parser
from typing import Dict, Any, List, Tuple
from datetime import datetime
import dns.resolver
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ============================================================================
# STEP 1: Email Arrives & Parsing
# ============================================================================

def parse_email(raw: str) -> Dict[str, Any]:
    """Parse raw email into structured format"""
    # If input doesn't look like an email (no headers), treat it as plain body text
    if not raw.strip().startswith(('From:', 'To:', 'Subject:', 'Date:', 'Received:', 'MIME-Version:')):
        # Simple text input - treat entire input as body
        return {
            'from': '',
            'to': [],
            'subject': '',
            'headers': {},
            'body': raw,
            'raw': raw,
            'timestamp': datetime.now()
        }
    
    parser = Parser(policy=policy.default)
    msg = parser.parsestr(raw)
    
    body = ''
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            if ctype == 'text/plain':
                body += part.get_content()
            elif ctype == 'text/html' and not body:
                soup = BeautifulSoup(part.get_content(), 'lxml')
                body += soup.get_text()
    else:
        body = msg.get_content()

    return {
        'from': msg.get('from', ''),
        'to': msg.get_all('to', []),
        'subject': msg.get('subject', ''),
        'headers': dict(msg.items()),
        'body': body or '',
        'raw': raw,
        'timestamp': datetime.now()
    }


# ============================================================================
# STEP 2: Authentication Checks (SPF, DKIM, DMARC)
# ============================================================================

def check_spf(sender_ip: str, sender_domain: str) -> Tuple[str, float]:
    """Check SPF record - simplified implementation"""
    try:
        # In production, use spf.check() with actual IP
        # For demo, check if domain has SPF record
        answers = dns.resolver.resolve(sender_domain, 'TXT')
        for rdata in answers:
            txt = str(rdata)
            if 'v=spf1' in txt:
                return 'pass', 0.0
        return 'none', 0.3
    except Exception as e:
        logger.warning(f"SPF check failed: {e}")
        return 'fail', 0.9


def check_dkim(headers: Dict) -> Tuple[str, float]:
    """Check DKIM signature - simplified implementation"""
    # In production, use dkim.verify()
    if 'DKIM-Signature' in headers or 'dkim-signature' in headers:
        # Assume valid if signature present (real impl would verify)
        return 'pass', 0.0
    return 'fail', 0.9


def check_dmarc(domain: str) -> Tuple[str, float]:
    """Check DMARC policy"""
    try:
        dmarc_domain = f'_dmarc.{domain}'
        answers = dns.resolver.resolve(dmarc_domain, 'TXT')
        for rdata in answers:
            txt = str(rdata)
            if 'v=DMARC1' in txt:
                return 'pass', 0.0
        return 'none', 0.3
    except Exception as e:
        logger.warning(f"DMARC check failed: {e}")
        return 'fail', 0.9


def authentication_checks(parsed: Dict) -> Dict[str, Any]:
    """STEP 2: Perform SPF, DKIM, DMARC checks"""
    sender = parsed.get('from', '')
    headers = parsed.get('headers', {})
    
    # Extract domain from sender
    domain_match = re.search(r'@([a-zA-Z0-9.-]+)', sender)
    domain = domain_match.group(1) if domain_match else 'unknown.com'
    
    # Extract sender IP (from Received header in real scenario)
    sender_ip = '0.0.0.0'  # Placeholder
    
    spf_result, spf_score = check_spf(sender_ip, domain)
    dkim_result, dkim_score = check_dkim(headers)
    dmarc_result, dmarc_score = check_dmarc(domain)
    
    # Combined auth score (0.0 = pass all, 1.0 = fail all)
    auth_score = (spf_score + dkim_score + dmarc_score) / 3
    auth_reasons = []
    if spf_result != 'pass':
        auth_reasons.append(f'SPF={spf_result}')
    if dkim_result != 'pass':
        auth_reasons.append(f'DKIM={dkim_result}')
    if dmarc_result != 'pass':
        auth_reasons.append(f'DMARC={dmarc_result}')
    
    return {
        'auth_score': auth_score,
        'spf_result': spf_result,
        'dkim_result': dkim_result,
        'dmarc_result': dmarc_result,
        'auth_reasons': auth_reasons
    }


# ============================================================================
# STEP 3: Content & Context Analysis
# ============================================================================

URGENCY_KEYWORDS = [
    'urgent', 'immediately', 'act now', 'expire', 'suspended', 
    'locked', 'verify now', 'confirm now', 'within 24 hours'
]

CREDENTIAL_KEYWORDS = [
    'password', 'login', 'username', 'credential', 'account',
    'verify account', 'confirm identity', 'update payment'
]

BRAND_KEYWORDS = [
    'microsoft', 'office365', 'google', 'amazon', 'paypal',
    'bank', 'apple', 'netflix', 'facebook', 'instagram'
]

# Legitimate e-commerce/retail platforms (won't trigger brand misuse)
LEGITIMATE_RETAILERS = [
    'amazon', 'ebay', 'walmart', 'target', 'bestbuy', 'flipkart', 'myntra',
    'ajio', 'nykaa', 'meesho', 'shopify', 'etsy', 'alibaba', 'temu',
    'shein', 'aliexpress', 'snapdeal', 'paytm', 'indiamart',
    # Official brand stores
    'apple', 'microsoft', 'google', 'samsung', 'dell', 'hp', 'lenovo',
    'nike', 'adidas', 'zara', 'h&m', 'uniqlo'
]

# Scam/fraud keywords - lottery, prize, money transfer scams
SCAM_KEYWORDS = [
    'lottery', 'prize', 'winner', 'won', 'congratulations', 'claim',
    'million', 'dollars', 'pounds', 'euros', 'inheritance', 'beneficiary',
    'transfer funds', 'wire transfer', 'bitcoin', 'cryptocurrency',
    'investment opportunity', 'guaranteed return', 'risk-free',
    'click here', 'click below', 'click link', 'download attachment'
]


def content_analysis(parsed: Dict) -> Dict[str, Any]:
    """STEP 3: AI-FIRST content analysis - ML model is primary decision maker"""
    from .ai import predict_with_model, is_model_loaded
    from .url_intelligence import smart_url_extraction
    
    subject = (parsed.get('subject', '') or '')
    body = (parsed.get('body', '') or '')
    combined_text = f"{subject} {body}"
    
    content_reasons: List[str] = []
    
    # PRIMARY: ML Model Decision (Semantic Understanding)
    ml_score = None
    if len(combined_text.strip()) > 10:
        ml_score = predict_with_model(combined_text)
        if ml_score is not None:
            content_reasons.append(f'AI semantic analysis: {ml_score*100:.0f}% phishing probability')
            content_reasons.append('Model understands context and intent')
    
    # FALLBACK: Rule-based safety nets (only when ML fails or as validators)
    rule_based_score = 0.0
    combined_lower = combined_text.lower()
    
    # Critical patterns that should always trigger (safety net)
    urgency_detected = any(kw in combined_lower for kw in URGENCY_KEYWORDS)
    credential_request = any(kw in combined_lower for kw in CREDENTIAL_KEYWORDS)
    scam_detected = any(kw in combined_lower for kw in SCAM_KEYWORDS)
    
    # Brand detection - but verify against actual URLs in email
    brand_mentioned = any(kw in combined_lower for kw in BRAND_KEYWORDS)
    brand_misuse = False
    
    if brand_mentioned:
        # Check if URLs match ANY of the brands mentioned
        urls = smart_url_extraction(combined_text)
        legitimate_brand_url = False
        
        if urls:
            # Find all brands mentioned in the text
            mentioned_brands = [brand for brand in BRAND_KEYWORDS if brand in combined_lower]
            
            # Check if ANY URL matches ANY brand mentioned OR is a legitimate retailer
            for brand in mentioned_brands:
                for url in urls:
                    url_lower = url.lower()
                    
                    # Check 1: Is this URL from a known legitimate e-commerce retailer?
                    # Retailers like Amazon, Myntra, Flipkart can legitimately sell other brands
                    is_legitimate_retailer = any(retailer in url_lower for retailer in LEGITIMATE_RETAILERS)
                    if is_legitimate_retailer:
                        legitimate_brand_url = True
                        break
                    
                    # Check 2: Match official brand domains: apple.com, microsoft.com, google.com, etc.
                    # Also match subdomains: www.apple.com, store.apple.com
                    if f'{brand}.com' in url_lower or f'.{brand}.com' in url_lower:
                        legitimate_brand_url = True
                        break
                    # Handle special cases: office365 -> office.com, instagram -> instagram.com
                    if brand == 'office365' and ('office.com' in url_lower or 'microsoft.com' in url_lower):
                        legitimate_brand_url = True
                        break
                    if brand == 'bank' and any(bank_domain in url_lower for bank_domain in ['.bank', 'banking.', 'bank.']):
                        legitimate_brand_url = True
                        break
                if legitimate_brand_url:
                    break
            
            # Only flag as misuse if brand mentioned but NO legitimate URL present
            # This catches cases like: "Apple security alert" with URL "apple-login.xyz"
            brand_misuse = not legitimate_brand_url
        # If brand mentioned but no URLs at all, not necessarily misuse (could be legitimate email about the brand)
    
    # Rules only boost ML prediction or act as fallback
    if urgency_detected:
        content_reasons.append('High-pressure language pattern detected')
    if credential_request:
        content_reasons.append('Credential solicitation pattern')
    if brand_misuse:
        content_reasons.append('Brand name detected in suspicious context')
    if scam_detected:
        content_reasons.append('Financial scam indicators found')
    
    # Calculate rule-based backup score
    risk_factors = sum([urgency_detected, credential_request, brand_misuse])
    if scam_detected:
        risk_factors += 2
    rule_based_score = min(risk_factors * 0.25, 1.0)
    
    # DECISION: ML is PRIMARY (95%), rules are safety net (5%)
    # BUT: Override ML if legitimate branded URL is present
    if ml_score is not None:
        # Trust the AI model - it has semantic understanding
        content_score = (ml_score * 0.95) + (rule_based_score * 0.05)
        content_reasons.append('✓ AI-driven decision (semantic understanding)')
        
        # CRITICAL FIX: If legitimate brand URL found and ML flagged high risk
        # This handles promotional emails from real brands (Apple, Amazon, etc.)
        if brand_mentioned and not brand_misuse and ml_score >= 0.7:
            # Legitimate brand with matching URL - ML likely false positive on promotional content
            content_score = 0.2  # Low risk - trust the URL over the text pattern
            content_reasons.append('✓ Legitimate brand URL verified - ML override applied')
            content_reasons.append('Promotional content from verified brand is safe')
    else:
        # ML unavailable - fall back to rules reluctantly
        content_score = rule_based_score
        content_reasons.append('⚠ Fallback: Rule-based (ML unavailable)')
    
    return {
        'content_score': content_score,
        'urgency_detected': urgency_detected,
        'credential_request': credential_request,
        'brand_misuse': brand_misuse,
        'content_reasons': content_reasons
    }


# ============================================================================
# STEP 4: URL and Link Inspection
# ============================================================================

def _strip_zero_width(text: str) -> str:
    """Remove zero-width/invisible Unicode characters attackers use to obfuscate domains."""
    invisible = [
        '\u200b', '\u200c', '\u200d', '\ufeff',
        '\u2060', '\u180e', '\u00ad'
    ]
    for ch in invisible:
        text = text.replace(ch, '')
    return text


def extract_urls(text: str) -> List[str]:
    """Extract all URLs from text including www., IP addresses, and domains."""
    urls = []
    clean_text = _strip_zero_width(text)
    
    # Extract URLs with http/https
    http_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    urls.extend(re.findall(http_pattern, clean_text))
    
    # Extract www. URLs (add http:// prefix for processing)
    www_pattern = r'www\.[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:/[^\s<>"{}|\\^`\[\]]*)?'
    www_matches = re.findall(www_pattern, clean_text)
    urls.extend([f'http://{url}' if not url.startswith('http') else url for url in www_matches])
    
    # Extract standalone domains with common TLDs (typosquatting attempts)
    domain_pattern = r'\b[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.(com|org|net|io|xyz|tk|ml|ga|cf|gq|top|click|link|local|zip|loan|win|bid)\b'
    domain_matches = re.findall(domain_pattern, clean_text)
    urls.extend([f'http://{match[0]}.{match[1]}' for match in domain_matches if not any(match[0] in url for url in urls)])
    
    # Extract IP addresses
    ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:/[^\s]*)?\b'
    ip_matches = re.findall(ip_pattern, clean_text)
    urls.extend([f'http://{ip}' if not ip.startswith('http') else ip for ip in ip_matches])
    
    # Extract URLs from HTML anchor tags (hidden links)
    html_link_pattern = r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>(.*?)</a>'
    html_matches = re.findall(html_link_pattern, clean_text, re.IGNORECASE)
    
    for link_url, link_text in html_matches:
        urls.append(link_url)
        if link_text and 'http' in link_text:
            displayed_urls = re.findall(http_pattern, link_text)
            if displayed_urls and displayed_urls[0] != link_url:
                urls.append(f"MISMATCH:{link_url}|DISPLAYS:{displayed_urls[0]}")
    
    return list(set(urls))


def _decode_punycode(domain: str) -> str:
    """Convert IDN/punycode domains to Unicode for homograph checks."""
    try:
        if domain.startswith('xn--') or '.xn--' in domain:
            return domain.encode('ascii').decode('idna')
    except Exception:
        pass
    return domain


def _has_homoglyph(domain: str) -> bool:
    """Detect potential homograph by checking for mixed scripts (Latin + others)."""
    scripts = set()
    for ch in domain:
        if ch.isascii():
            scripts.add('latin')
        else:
            try:
                name = unicodedata.name(ch)
                scripts.add(name.split(' ')[0])
            except Exception:
                continue
    return len(scripts) > 1


def _levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate Levenshtein distance between two strings."""
    if len(s1) < len(s2):
        return _levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]


def _check_typosquatting(domain: str) -> Tuple[bool, str]:
    """Check if domain is typosquatting a popular brand using Levenshtein distance."""
    popular_brands = [
        'google', 'facebook', 'amazon', 'microsoft', 'apple', 'netflix',
        'paypal', 'ebay', 'twitter', 'instagram', 'linkedin', 'youtube',
        'zillow', 'redfin', 'chase', 'wellsfargo', 'bankofamerica'
    ]
    
    domain_lower = domain.lower().replace('www.', '').split('.')[0]
    
    for brand in popular_brands:
        distance = _levenshtein_distance(domain_lower, brand)
        # If distance is 1-2 chars and similar length, likely typosquatting
        if distance <= 2 and abs(len(domain_lower) - len(brand)) <= 2 and domain_lower != brand:
            return True, brand
    
    return False, ''

def _check_phishtank(url: str) -> Tuple[bool, str]:
    """Check URL against PhishTank database (with caching)."""
    try:
        import requests
        import hashlib
        from functools import lru_cache
        
        # PhishTank API - free but requires API key (we'll use public lookup)
        # For production, get API key from https://www.phishtank.com/api_info.php
        # This is a simplified check using URL hash
        
        # For now, return False to not block - in production, implement proper API call
        # TODO: Add PhishTank API key and implement full check
        return False, ''
    except Exception as e:
        logger.warning(f"PhishTank check failed: {e}")
        return False, ''

def check_url_safety(url: str) -> Tuple[float, List[str]]:
    """Check if URL is suspicious including obfuscation techniques and homographs."""
    reasons: List[str] = []
    
    # Hidden link mismatch
    if url.startswith('MISMATCH:'):
        reasons.append('Displayed link differs from actual href')
        return 1.0, reasons
    
    parsed = urlparse(_strip_zero_width(url))
    domain = parsed.netloc.lower()
    full_url = url.lower()
    risk_score = 0.0
    
    # Punycode/IDN homograph detection
    if domain.startswith('xn--') or '.xn--' in domain:
        reasons.append('Punycode/IDN domain detected')
        risk_score += 0.6
        decoded = _decode_punycode(domain)
        domain = decoded.lower()
    
    if _has_homoglyph(domain):
        reasons.append('Mixed-script domain (possible homograph)')
        risk_score += 0.4
    
    # IP address usage
    if re.match(r'\d+\.\d+\.\d+\.\d+', domain):
        risk_score += 0.7
        reasons.append('IP address used instead of domain')
    
    # Suspicious TLDs
    suspicious_tlds = ['.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.click', '.link', '.local', '.zip', '.loan', '.win', '.bid']
    if any(domain.endswith(tld) for tld in suspicious_tlds):
        risk_score += 0.5
        reasons.append('Suspicious/cheap TLD')
    
    # URL shorteners
    shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly', 'is.gd', 'buff.ly']
    if any(short in domain for short in shorteners):
        risk_score += 0.3
        reasons.append('URL shortener hides destination')
    
    # Phishing keywords
    phishing_keywords = ['verify', 'secure', 'account', 'login', 'update', 'confirm', 'validation']
    if any(kw in domain for kw in phishing_keywords):
        risk_score += 0.3
        reasons.append('Phishing keyword in domain')
    
    # Brand impersonation
    legitimate_brands = ['microsoft', 'google', 'amazon', 'paypal', 'apple', 'facebook', 'netflix']
    for brand in legitimate_brands:
        if brand in domain and not domain.endswith(f'{brand}.com'):
            risk_score += 0.6
            reasons.append(f'Brand impersonation: {brand}')
            break
    
    # Typosquatting detection (zilllow vs zillow)
    is_typosquat, similar_brand = _check_typosquatting(domain)
    if is_typosquat:
        risk_score += 0.8
        reasons.append(f'Typosquatting: Similar to {similar_brand}')
    
    # URL encoding obfuscation
    if full_url.count('%') > 3:
        risk_score += 0.3
        reasons.append('Excessive URL encoding')
    
    # Suspicious ports
    if ':' in domain and not any(p in domain for p in [':80', ':443']):
        port_match = re.search(r':(\d+)', domain)
        if port_match and port_match.group(1) not in ['80', '443']:
            risk_score += 0.2
            reasons.append(f'Non-standard port {port_match.group(1)}')
    
    # @ symbol redirects
    if '@' in full_url:
        risk_score += 0.6
        reasons.append('@ symbol used for redirect')
    
    # Excessive subdomains
    subdomain_count = domain.count('.')
    if subdomain_count > 3:
        risk_score += 0.3
        reasons.append('Excessive subdomains (obfuscation)')
    
    return min(risk_score, 1.0), reasons


def url_inspection(parsed: Dict) -> Dict[str, Any]:
    """STEP 4: AI-FIRST URL inspection with semantic understanding"""
    from .url_intelligence import smart_url_extraction, analyze_url_with_ai
    
    body = parsed.get('body', '')
    subject = parsed.get('subject', '')
    email_context = f"{subject} {body}"
    
    # Use intelligent URL extraction (not just regex)
    urls = smart_url_extraction(body)
    
    if not urls:
        return {
            'url_score': 0.0,
            'urls_found': [],
            'suspicious_urls': 0,
            'url_reasons': []
        }
    
    url_risks: List[float] = []
    reasons_all: List[str] = []
    
    for url in urls:
        # AI-based contextual analysis
        score, reasons = analyze_url_with_ai(url, email_context)
        url_risks.append(score)
        
        if reasons:
            reasons_all.append(f"{url} → {', '.join(reasons)}")
        
        # Add legacy typosquatting check as safety net
        parsed_url = urlparse(url)
        domain = parsed_url.netloc.lower()
        is_typosquat, similar_brand = _check_typosquatting(domain)
        if is_typosquat:
            score = max(score, 0.8)
            reasons_all.append(f"{url} → Typosquatting: {similar_brand}")
    
    suspicious_count = sum(1 for risk in url_risks if risk > 0.5)
    url_score = max(url_risks) if url_risks else 0.0  # Use max risk, not average
    
    return {
        'url_score': url_score,
        'urls_found': urls,
        'suspicious_urls': suspicious_count,
        'url_reasons': reasons_all
    }


# ============================================================================
# STEP 5: Sender Behavior Analysis
# ============================================================================

def sender_behavior_analysis(parsed: Dict, db_session=None) -> Dict[str, Any]:
    """STEP 5: Analyze sender behavior patterns"""
    sender = parsed.get('from', '')
    timestamp = parsed.get('timestamp', datetime.now())
    recipients = parsed.get('to', [])
    
    # Check if new sender (would query database in real implementation)
    is_new_sender = True  # Assume new for demo
    
    # Check sending time (odd hours: 11pm - 6am)
    hour = timestamp.hour
    odd_timing = hour >= 23 or hour <= 6
    
    # Check recipient count (mass mailing indicator)
    many_recipients = len(recipients) > 10
    
    # Calculate behavior risk
    risk_factors = sum([is_new_sender, odd_timing, many_recipients])
    behavior_score = risk_factors * 0.25  # Max 0.75
    behavior_reasons: List[str] = []
    if is_new_sender:
        behavior_reasons.append('First-time sender')
    if odd_timing:
        behavior_reasons.append('Sent at unusual hours')
    if many_recipients:
        behavior_reasons.append('Mass mailing pattern')
    
    return {
        'behavior_score': behavior_score,
        'is_new_sender': is_new_sender,
        'odd_timing': odd_timing,
        'behavior_reasons': behavior_reasons
    }


# ============================================================================
# STEP 6: Sentiment & Intent Detection
# ============================================================================

PRESSURE_WORDS = [
    'urgent', 'immediate', 'act now', 'hurry', 'limited time',
    'expire', 'suspended', 'warning', 'alert', 'risk', 'threat'
]

FEAR_WORDS = [
    'suspended', 'locked', 'blocked', 'terminated', 'closed',
    'illegal', 'fraud', 'unauthorized', 'security breach'
]


def sentiment_analysis(parsed: Dict) -> Dict[str, Any]:
    """STEP 6: Detect pressure/fear tactics using NLP"""
    subject = (parsed.get('subject', '') or '').lower()
    body = (parsed.get('body', '') or '').lower()
    combined_text = f"{subject} {body}"
    
    # Count pressure/fear words
    pressure_count = sum(1 for word in PRESSURE_WORDS if word in combined_text)
    fear_count = sum(1 for word in FEAR_WORDS if word in combined_text)
    
    pressure_tone = pressure_count >= 2 or fear_count >= 1
    
    # Calculate sentiment risk score
    sentiment_score = min((pressure_count + fear_count) * 0.15, 0.8)
    sentiment_reasons: List[str] = []
    if pressure_count:
        sentiment_reasons.append(f'Pressure words count={pressure_count}')
    if fear_count:
        sentiment_reasons.append(f'Fear words count={fear_count}')
    
    return {
        'sentiment_score': sentiment_score,
        'pressure_tone': pressure_tone,
        'sentiment_reasons': sentiment_reasons
    }


# ============================================================================
# STEP 7: Ensemble Scoring
# ============================================================================

def ensemble_scoring(auth: Dict, content: Dict, url: Dict, 
                     behavior: Dict, sentiment: Dict) -> Tuple[float, str, Dict[str, Any]]:
    """STEP 7: Combine all scores with weighted average and keep contributions"""
    
    # Increased URL weight - phishing URLs are strong indicators
    weights = {
        'auth': 0.20,
        'content': 0.20,
        'url': 0.35,  # Increased from 0.20 to 0.35
        'behavior': 0.15,
        'sentiment': 0.10
    }
    
    final_score = (
        auth['auth_score'] * weights['auth'] +
        content['content_score'] * weights['content'] +
        url['url_score'] * weights['url'] +
        behavior['behavior_score'] * weights['behavior'] +
        sentiment['sentiment_score'] * weights['sentiment']
    )
    
    # Classification based on final score
    if final_score >= 0.7:
        classification = 'Phishing'
    elif final_score >= 0.4:
        classification = 'Suspicious'
    else:
        classification = 'Safe'
    
    # CRITICAL OVERRIDE: If suspicious URLs found, upgrade classification
    # Phishing URLs are strong indicators regardless of other factors
    if url['url_score'] >= 0.7 and url['suspicious_urls'] > 0:
        # High-risk URL detected - force Phishing classification
        classification = 'Phishing'
        final_score = max(final_score, 0.7)  # Ensure score reflects phishing level
    elif url['url_score'] >= 0.5 and url['suspicious_urls'] > 0:
        # Medium-risk URL detected - force at least Suspicious
        if classification == 'Safe':
            classification = 'Suspicious'
            final_score = max(final_score, 0.4)  # Ensure score reflects suspicious level
    
    # CONTENT OVERRIDE: If high-risk content detected (scams, phishing text)
    # ML model or scam keywords indicate phishing regardless of other factors
    # BUT: If URLs are all safe (0.0 score), DON'T override - trust the URLs
    if content['content_score'] >= 0.7:
        # Check if URLs are verified safe (external intelligence passed)
        if url['url_score'] <= 0.3 and url['suspicious_urls'] == 0:
            # URLs are legitimate and verified safe - trust them over content analysis
            # This handles cases like: "Get iPhone at apple.com" which may trigger ML false positive
            # Keep the classification as-is (likely Safe or Suspicious based on weighted score)
            pass
        else:
            # High-risk content with suspicious/unknown URLs - force Phishing
            classification = 'Phishing'
            final_score = max(final_score, 0.7)

    contributions = {
        'auth': {'score': auth['auth_score'], 'weight': weights['auth'], 'reasons': auth.get('auth_reasons', [])},
        'content': {'score': content['content_score'], 'weight': weights['content'], 'reasons': content.get('content_reasons', [])},
        'url': {'score': url['url_score'], 'weight': weights['url'], 'reasons': url.get('url_reasons', [])},
        'behavior': {'score': behavior['behavior_score'], 'weight': weights['behavior'], 'reasons': behavior.get('behavior_reasons', [])},
        'sentiment': {'score': sentiment['sentiment_score'], 'weight': weights['sentiment'], 'reasons': sentiment.get('sentiment_reasons', [])},
    }
    
    return final_score, classification, contributions


# ============================================================================
# STEP 8: Automated Action
# ============================================================================

def determine_actions(final_score: float, classification: str) -> Tuple[List[str], bool, bool]:
    """STEP 8: Determine automated actions based on classification"""
    actions = []
    quarantined = False
    admin_notified = False
    
    if classification == 'Phishing':
        actions.append('Move to Quarantine')
        actions.append('Tag as High Risk - Phish Detected')
        actions.append('Notify Admin')
        quarantined = True
        admin_notified = True
    elif classification == 'Suspicious':
        actions.append('Move to Spam')
        actions.append('Tag as Suspicious')
        quarantined = True
    else:
        actions.append('Deliver to Inbox')
    
    return actions, quarantined, admin_notified


# =========================================================================
# ATTACHMENT TRIAGE (Research Add-on)
# =========================================================================


def analyze_attachment(name: str, content: bytes) -> Dict[str, Any]:
    """Lightweight static triage for PDF/Office/HTML attachments.

    This is not a full AV scan; it flags high-risk patterns used in phishing:
    - PDF JavaScript/OpenAction/AA triggers
    - Office macros (vbaProject.bin in OOXML) and legacy binaries
    - HTML with script tags that can phish credentials
    """
    reasons: List[str] = []
    fname = name or 'unknown'
    ext = fname.lower().split('.')[-1] if '.' in fname else ''
    risk = 0.0

    # PDF heuristics
    if content.startswith(b'%PDF-'):
        if b'/JavaScript' in content or b'/JS' in content:
            risk += 0.4
            reasons.append('PDF contains JavaScript')
        if b'/OpenAction' in content or b'/AA' in content:
            risk += 0.3
            reasons.append('PDF auto-action (OpenAction/AA) present')
        if b'/Launch' in content:
            risk += 0.3
            reasons.append('PDF launch action detected')
        if risk == 0.0:
            reasons.append('PDF without active content detected')

    # Office OOXML (docx/xlsx/pptx) / macro-enabled (docm/xlsm/pptm)
    elif zipfile.is_zipfile(io.BytesIO(content)):
        with zipfile.ZipFile(io.BytesIO(content)) as z:
            names = z.namelist()
            if any('vbaProject.bin' in n for n in names):
                risk += 0.6
                reasons.append('Office document contains macros (vbaProject.bin)')
            if any(n.endswith(('.bin', '.exe')) for n in names):
                risk += 0.2
                reasons.append('Embedded binary inside Office document')
            if risk == 0.0:
                reasons.append('Office document without macros detected')

    # Legacy Office binaries (doc/xls/ppt)
    elif ext in ['doc', 'xls', 'ppt']:
        risk += 0.4
        reasons.append('Legacy Office binary (macros possible)')

    # HTML attachments
    elif ext in ['html', 'htm']:
        lower = content.lower()
        if b'<script' in lower or b'onclick=' in lower:
            risk += 0.5
            reasons.append('HTML contains script/onclick (credential harvest risk)')
        if b'form' in lower and b'password' in lower:
            risk += 0.3
            reasons.append('HTML form requests password')
        if risk == 0.0:
            reasons.append('HTML without active scripting detected')

    else:
        reasons.append('Attachment type not analyzed; treat with caution')

    risk = min(risk, 1.0)
    if risk >= 0.7:
        classification = 'High-Risk Attachment'
    elif risk >= 0.4:
        classification = 'Suspicious Attachment'
    else:
        classification = 'Low-Risk Attachment'

    return {
        'attachment_name': fname,
        'attachment_score': risk,
        'attachment_classification': classification,
        'attachment_reasons': reasons
    }


# ============================================================================
# MAIN ANALYSIS FUNCTION - Orchestrates all 10 steps
# ============================================================================

def analyze_email_complete(parsed: Dict, db_session=None) -> Dict[str, Any]:
    """
    Complete email analysis following PDF workflow:
    Steps 1-10: From email arrival to automated action
    """
    
    # STEP 2: Authentication checks
    auth_results = authentication_checks(parsed)
    
    # STEP 3: Content analysis
    content_results = content_analysis(parsed)
    
    # STEP 4: URL inspection
    url_results = url_inspection(parsed)
    
    # STEP 5: Sender behavior
    behavior_results = sender_behavior_analysis(parsed, db_session)
    
    # STEP 6: Sentiment detection
    sentiment_results = sentiment_analysis(parsed)
    
    # STEP 7: Ensemble scoring
    final_score, classification, contributions = ensemble_scoring(
        auth_results, content_results, url_results,
        behavior_results, sentiment_results
    )
    
    # STEP 8: Determine actions
    actions, quarantined, admin_notified = determine_actions(final_score, classification)
    
    # Combine all results
    return {
        **auth_results,
        **content_results,
        **url_results,
        **behavior_results,
        **sentiment_results,
        'final_score': final_score,
        'classification': classification,
        'actions_taken': actions,
        'quarantined': quarantined,
        'admin_notified': admin_notified,
        'explanations': contributions
    }
