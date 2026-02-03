"""
Real External Phishing Intelligence - NOT text matching!
Uses actual threat intelligence APIs and libraries
"""
from typing import Tuple, List, Optional, Dict
import requests
import socket
import ssl
import certifi
try:
    import whois
except ImportError:
    whois = None
from datetime import datetime
from urllib.parse import urlparse
import logging
try:
    import dns.resolver
except ImportError:
    dns = None

logger = logging.getLogger(__name__)


def check_google_safe_browsing(url: str, api_key: Optional[str] = None) -> Tuple[bool, str]:
    """
    Check URL against Google Safe Browsing API
    Real-time threat intelligence, not pattern matching!
    
    Get API key: https://developers.google.com/safe-browsing/v4/get-started
    """
    if not api_key:
        # Use environment variable or skip
        import os
        api_key = os.getenv('GOOGLE_SAFE_BROWSING_API_KEY')
        if not api_key:
            return False, "API key not configured"
    
    try:
        endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}"
        payload = {
            "client": {
                "clientId": "email-guard",
                "clientVersion": "1.0.0"
            },
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url}]
            }
        }
        
        response = requests.post(endpoint, json=payload, timeout=2)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('matches'):
                threat_type = data['matches'][0].get('threatType', 'UNKNOWN')
                return True, f"Google flagged as {threat_type}"
            return False, "Clean per Google Safe Browsing"
        
        return False, f"API error: {response.status_code}"
    
    except Exception as e:
        logger.error(f"Google Safe Browsing check failed: {e}")
        return False, str(e)


def check_phishtank(url: str) -> Tuple[bool, str]:
    """
    Check URL against PhishTank database
    Community-driven phishing intelligence
    """
    try:
        # PhishTank API endpoint
        api_url = "http://checkurl.phishtank.com/checkurl/"
        
        payload = {
            'url': url,
            'format': 'json',
            'app_key': ''  # Optional: get from phishtank.com
        }
        
        response = requests.post(api_url, data=payload, timeout=2)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('results', {}).get('in_database'):
                if data['results'].get('verified'):
                    return True, "Verified phishing site in PhishTank"
                return True, "Reported in PhishTank (unverified)"
            return False, "Not in PhishTank database"
        
        return False, f"API error: {response.status_code}"
    
    except Exception as e:
        logger.error(f"PhishTank check failed: {e}")
        return False, str(e)


def check_domain_age(domain: str) -> Tuple[float, str]:
    """
    Check domain registration age using WHOIS
    New domains are often used for phishing
    
    Returns: (risk_score, info)
    """
    if not whois:
        return 0.3, "WHOIS library not available"
    
    try:
        w = whois.query(domain)
        
        if w and w.creation_date:
            age_days = (datetime.now() - w.creation_date).days
            
            # New domains are suspicious
            if age_days < 30:
                return 0.8, f"Domain created {age_days} days ago (very new)"
            elif age_days < 90:
                return 0.5, f"Domain created {age_days} days ago (recent)"
            elif age_days < 365:
                return 0.2, f"Domain created {age_days} days ago"
            else:
                return 0.0, f"Domain age: {age_days} days (established)"
        
        return 0.3, "Domain age unknown"
    
    except Exception as e:
        logger.warning(f"WHOIS lookup failed for {domain}: {e}")
        return 0.3, "Could not verify domain age"


def check_ssl_certificate(domain: str) -> Tuple[float, str]:
    """
    Validate SSL certificate
    Legitimate sites have valid SSL, phishing often don't
    """
    try:
        context = ssl.create_default_context(cafile=certifi.where())
        
        with socket.create_connection((domain, 443), timeout=2) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                
                # Check expiry
                not_after = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                days_until_expiry = (not_after - datetime.now()).days
                
                # Check issuer
                issuer = dict(x[0] for x in cert.get('issuer', []))
                org = issuer.get('organizationName', 'Unknown')
                
                if days_until_expiry < 0:
                    return 0.9, "SSL certificate expired"
                elif days_until_expiry < 3:
                    return 0.5, f"SSL expires in {days_until_expiry} days"
                else:
                    # All valid SSL certs are good (Let's Encrypt, Cloudflare, Google, etc.)
                    return 0.0, f"Valid SSL from {org}"
        
    except ssl.SSLError:
        return 0.8, "Invalid or self-signed SSL certificate"
    except socket.timeout:
        return 0.5, "SSL check timeout"
    except Exception as e:
        return 0.4, f"Could not verify SSL: {str(e)[:50]}"


def check_dns_records(domain: str) -> Tuple[float, str]:
    """
    Check DNS MX records (email servers)
    Phishing domains often lack proper email infrastructure
    """
    if not dns:
        return 0.2, "DNS library not available"
        
    try:
        # Check MX records
        try:
            mx_records = dns.resolver.resolve(domain, 'MX')
            if len(list(mx_records)) > 0:
                return 0.0, "Valid MX records (legitimate email setup)"
        except dns.resolver.NoAnswer:
            return 0.0, "No MX records (uses separate email domain)"
        except dns.resolver.NXDOMAIN:
            return 0.9, "Domain does not exist"
        
        return 0.3, "DNS configuration unusual"
    
    except Exception as e:
        logger.warning(f"DNS check failed for {domain}: {e}")
        return 0.2, "Could not check DNS"


def comprehensive_url_check(url: str) -> Dict[str, any]:
    """
    REAL intelligence check using multiple sources
    NO text matching - actual threat intelligence!
    
    Returns dict with risk_score and details
    """
    parsed = urlparse(url)
    domain = parsed.netloc
    
    # Whitelist: Trusted educational and government domains
    trusted_tlds = ['.edu', '.edu.in', '.ac.in', '.gov', '.gov.in', '.ac.uk', '.edu.au']
    if any(domain.endswith(tld) for tld in trusted_tlds):
        return {
            "risk_score": 0.0,
            "details": [f"✓ Trusted educational/government domain: {domain}"]
        }
    
    # Whitelist: Major trusted brands and platforms (skip slow checks)
    trusted_domains = [
        'google.com', 'microsoft.com', 'apple.com', 'amazon.com', 'facebook.com',
        'instagram.com', 'twitter.com', 'linkedin.com', 'youtube.com', 'netflix.com',
        'paypal.com', 'ebay.com', 'walmart.com', 'target.com', 'github.com',
        'stackoverflow.com', 'reddit.com', 'wikipedia.org', 'zoom.us'
    ]
    if any(domain.endswith(f'.{td}') or domain == td for td in trusted_domains):
        return {
            "risk_score": 0.0,
            "details": [f"✓ Trusted major platform: {domain}"]
        }
    
    risk_score = 0.0
    reasons = []
    
    # 1. Google Safe Browsing (most reliable) - SKIP if API not configured
    is_malicious, gsb_msg = check_google_safe_browsing(url)
    if is_malicious:
        risk_score = 1.0
        reasons.append(f"🚨 {gsb_msg}")
        return {"risk_score": risk_score, "details": reasons}  # Immediate block
    elif "Clean" in gsb_msg:
        reasons.append(f"✓ {gsb_msg}")
    
    # 2. PhishTank community intelligence
    is_phishing, pt_msg = check_phishtank(url)
    if is_phishing:
        risk_score = max(risk_score, 0.9)
        reasons.append(f"🚨 {pt_msg}")
    
    # 3. Domain age analysis
    age_risk, age_msg = check_domain_age(domain)
    is_established = age_risk == 0.0  # Old domains are established
    risk_score += age_risk
    reasons.append(f"Domain: {age_msg}")
    
    # 4. SSL certificate validation (lower weight for established domains)
    ssl_risk, ssl_msg = check_ssl_certificate(domain)
    
    # If domain is established (10+ years) and SSL fails, it's likely a cert chain issue, not phishing
    if is_established and ssl_risk >= 0.8:
        ssl_risk = 0.2  # Reduce risk for established domains with SSL issues
        reasons.append(f"SSL: ⚠ Certificate validation issue (likely config, domain is established)")
    else:
        risk_score += ssl_risk
        reasons.append(f"SSL: {ssl_msg}")
    
    # 5. DNS/Email infrastructure (very low weight - many sites use separate email domains)
    dns_risk, dns_msg = check_dns_records(domain)
    if dns_risk >= 0.9:  # Only flag if domain doesn't exist
        risk_score += dns_risk
        reasons.append(f"DNS: {dns_msg}")
    else:
        reasons.append(f"DNS: {dns_msg}")
    
    return {"risk_score": min(risk_score, 1.0), "details": reasons}
