# 📧 Email Guard - How It Actually Works (Step-by-Step)

## 🎯 Overview
Email Guard analyzes emails through **10 sequential steps**, combining AI, external threat intelligence, and infrastructure validation to detect phishing attempts.

---

## 📝 Example Email We'll Analyze

```
From: security@paypal-verify.com
To: user@example.com
Subject: Urgent: Verify Your PayPal Account

Dear Customer,

Your PayPal account has been suspended due to unusual activity.
Click here to verify your identity immediately: http://paypal-secure.xyz/login

If you don't verify within 24 hours, your account will be permanently closed.

Best regards,
PayPal Security Team
```

**Is this phishing?** Let's see how Email Guard detects it!

---

## 🔬 STEP 1: Email Arrives & Parsing

### **What Happens:**
The raw email text is broken down into structured components.

### **Code Function:**
```python
parse_email(raw_email_text)
```

### **Processing:**
1. Detects if input has email headers (From:, To:, Subject:)
2. If headers exist, uses Python's email parser
3. If plain text, treats entire input as email body
4. Extracts: sender, subject, body, headers

### **Output:**
```python
{
    'from': 'security@paypal-verify.com',
    'to': 'user@example.com',
    'subject': 'Urgent: Verify Your PayPal Account',
    'body': 'Your PayPal account has been suspended...',
    'headers': {
        'Received': '...',
        'DKIM-Signature': None  # Missing!
    }
}
```

### **Keywords:**
- **Raw Email:** Unprocessed email text as received
- **Email Parser:** Python library that understands email format
- **Headers:** Metadata (From, To, Date, etc.)
- **Body:** Actual message content

---

## 🔐 STEP 2: Authentication Checks

### **What Happens:**
Verifies if sender is who they claim to be using email security protocols.

### **Code Function:**
```python
authentication_checks(parsed_email)
```

### **Three Sub-Checks:**

#### **2A. SPF (Sender Policy Framework)**
- **Purpose:** Verify sender's IP is authorized
- **How:** DNS lookup for `v=spf1` TXT record
- **Example:** `paypal-verify.com` has NO SPF record!
- **Result:** **FAIL** (90% risk)

```python
# DNS Query:
dig TXT paypal-verify.com
# Response: No record found ❌
```

#### **2B. DKIM (DomainKeys Identified Mail)**
- **Purpose:** Check digital signature
- **How:** Look for `DKIM-Signature` in headers
- **Example:** No signature found in headers!
- **Result:** **FAIL** (80% risk)

```python
headers.get('DKIM-Signature') = None ❌
```

#### **2C. DMARC (Domain-based Message Authentication)**
- **Purpose:** Check domain's anti-spoofing policy
- **How:** DNS lookup for `_dmarc.paypal-verify.com`
- **Example:** No DMARC policy found!
- **Result:** **NONE** (70% risk)

```python
# DNS Query:
dig TXT _dmarc.paypal-verify.com
# Response: NXDOMAIN (domain doesn't exist) ❌
```

### **Output:**
```python
{
    'spf': {'status': 'fail', 'risk': 0.9},
    'dkim': {'status': 'fail', 'risk': 0.8},
    'dmarc': {'status': 'none', 'risk': 0.7},
    'overall_score': 0.8  # 80% authentication risk
}
```

### **Keywords:**
- **SPF:** List of authorized mail servers for a domain
- **DKIM:** Cryptographic signature proving email authenticity
- **DMARC:** Policy telling receivers what to do with failed checks
- **DNS (Domain Name System):** Internet's phone book (converts domains to IPs)
- **TXT Record:** Text data stored in DNS

---

## 📝 STEP 3: Content Analysis (AI-Powered)

### **What Happens:**
AI model analyzes email text to understand meaning and intent.

### **Code Function:**
```python
content_analysis(subject, body, sender)
```

### **Processing:**

#### **3A. ML Model Prediction (95% weight)**
```python
# Combine subject + body
text = "Urgent: Verify Your PayPal Account. Your PayPal account has been suspended..."

# Feed to transformer model
ml_score = predict_with_model(text)
# Output: 0.98 (98% phishing probability!)
```

**What Model Detects:**
- **Urgency:** "Urgent", "immediately", "24 hours"
- **Threats:** "suspended", "permanently closed"
- **Credential requests:** "verify your identity"
- **Impersonation:** Claims to be "PayPal Security Team"

#### **3B. Rule-Based Safety Nets (5% weight)**

**Urgency Keywords Found:**
```python
['urgent', 'immediately', '24 hours']
urgency_detected = True
```

**Credential Requests Found:**
```python
['verify', 'login', 'identity']
credentials_requested = True
```

**Scam Keywords Found:**
```python
['suspended', 'unusual activity', 'permanently closed']
scam_detected = True
```

**Brand Mentioned:**
```python
brand = 'paypal'  # Found in text
```

#### **3C. Brand Verification**
```python
# Check if URLs match brand
urls_in_email = ['paypal-secure.xyz']
legitimate_domains = ['paypal.com']

if 'paypal-secure.xyz' not in legitimate_domains:
    brand_misuse = True  # PHISHING! ❌
```

### **Output:**
```python
{
    'ml_score': 0.98,
    'rule_score': 0.85,
    'combined_score': 0.97,  # 97% content risk
    'urgency': True,
    'credentials': True,
    'brand_misuse': True,
    'reasons': [
        'High urgency language detected',
        'Credential information requested',
        'Brand mentioned but URL mismatch',
        'Threatening language detected'
    ]
}
```

### **Keywords:**
- **Transformer Model:** AI that understands context (BERT/RoBERTa)
- **Tokenization:** Converting words to numbers for ML
- **Semantic Analysis:** Understanding meaning, not just keywords
- **Brand Impersonation:** Pretending to be a legitimate company
- **Urgency Tactics:** Pressuring user to act quickly
- **Credential Harvesting:** Trying to steal login info

---

## 🔗 STEP 4: URL Inspection (External Intelligence)

### **What Happens:**
Analyzes URLs using real-time threat databases and infrastructure checks.

### **Code Function:**
```python
url_inspection(body, parsed_email)
```

### **URL Found:**
```
http://paypal-secure.xyz/login
```

### **Processing:**

#### **4A. External Intelligence (Primary Check)**

**Check 1: Google Safe Browsing**
```python
# API Call:
POST https://safebrowsing.googleapis.com/v4/threatMatches:find
Body: {"url": "paypal-secure.xyz"}

Response: {"matches": []} # Not in database (yet!)
Risk: 0.0
```

**Check 2: PhishTank Community**
```python
# API Call:
POST http://checkurl.phishtank.com/checkurl/
Body: {"url": "paypal-secure.xyz"}

Response: {"in_database": false}
Risk: 0.0
```

**Check 3: WHOIS Domain Age**
```python
import whois
domain_info = whois.query('paypal-secure.xyz')

creation_date: 2025-01-01  # Created 2 days ago!
age_days: 2

if age < 30 days:
    risk = 0.8  # New domain = suspicious ⚠️
```

**Check 4: SSL Certificate**
```python
import ssl
try:
    cert = ssl.get_server_certificate(('paypal-secure.xyz', 443))
except:
    # SSL Error: Connection refused
    risk = 0.9  # No valid SSL = dangerous! ❌
```

**Check 5: DNS Records**
```python
import dns.resolver

# Check if domain exists
try:
    answers = dns.resolver.resolve('paypal-secure.xyz', 'A')
except dns.resolver.NXDOMAIN:
    # Domain doesn't exist!
    risk = 0.9  # ❌
```

**Check 6: MX (Email) Records**
```python
try:
    mx_records = dns.resolver.resolve('paypal-secure.xyz', 'MX')
except:
    # No email infrastructure
    risk = 0.6  # Suspicious ⚠️
```

#### **4B. Pattern Analysis (Secondary Check)**

**Suspicious TLD:**
```python
tld = '.xyz'  # Cheap domain extension
if tld in ['.xyz', '.tk', '.ml', '.ga', '.cf']:
    risk += 0.5
```

**Typosquatting Check:**
```python
import Levenshtein
distance = Levenshtein.distance('paypal-secure', 'paypal')
# distance = 7 (too different but similar enough)

if 1 <= distance <= 3:
    risk += 0.8  # Likely typosquatting!
```

**URL Structure:**
```python
# Check for suspicious patterns
if 'login' in url.path:
    risk += 0.3  # Login pages often phishing
```

### **Output:**
```python
{
    'url': 'http://paypal-secure.xyz/login',
    'overall_risk': 0.95,  # 95% URL risk
    'external_intelligence': {
        'domain_age_days': 2,
        'ssl_valid': False,
        'dns_exists': False,
        'mx_records': False,
        'safe_browsing': False,
        'phishtank': False
    },
    'pattern_analysis': {
        'suspicious_tld': True,
        'typosquatting': True,
        'phishing_keywords': ['login']
    },
    'reasons': [
        'Domain created 2 days ago (very new)',
        'No valid SSL certificate',
        'Domain does not exist in DNS',
        'No email infrastructure',
        'Suspicious TLD (.xyz)',
        'Possible typosquatting attack'
    ]
}
```

### **Keywords:**
- **WHOIS:** Database of domain registration information
- **SSL Certificate:** Encryption certificate (HTTPS padlock)
- **DNS Records:** Domain's internet configuration
- **MX Records:** Mail server addresses
- **TLD (Top-Level Domain):** Extension (.com, .xyz, etc.)
- **Typosquatting:** Registering similar domain names (faceb00k.com)
- **NXDOMAIN:** DNS error meaning domain doesn't exist

---

## 👤 STEP 5: Sender Behavior Analysis

### **What Happens:**
Checks sender's history in database.

### **Code Function:**
```python
sender_behavior_analysis(sender, timestamp)
```

### **Processing:**
```python
# Query database for sender history
sender = 'security@paypal-verify.com'
history = db.query(EmailAnalysis).filter(sender=sender).all()

if history == []:
    # New sender (first time contact)
    risk = 0.25
else:
    # Known sender - check past behavior
    previous_phishing = any(h.classification == 'Phishing' for h in history)
    if previous_phishing:
        risk = 0.8
    else:
        risk = 0.0
```

### **Output:**
```python
{
    'new_sender': True,
    'risk': 0.25,
    'reason': 'First-time sender (no history)'
}
```

### **Keywords:**
- **Sender History:** Past emails from this address
- **First-Time Contact:** Never received email from this sender before
- **Reputation Score:** Trust level based on past behavior

---

## 😰 STEP 6: Sentiment Analysis

### **What Happens:**
Detects psychological manipulation tactics.

### **Code Function:**
```python
sentiment_analysis(subject, body)
```

### **Processing:**
```python
text = subject + ' ' + body

# Pressure keywords
pressure_words = ['urgent', 'immediately', 'suspended', 'permanently closed', '24 hours']
pressure_count = sum(1 for word in pressure_words if word in text.lower())

if pressure_count >= 3:
    sentiment_risk = 0.8  # High pressure detected!
```

### **Output:**
```python
{
    'pressure_detected': True,
    'pressure_score': 0.8,
    'pressure_keywords': ['urgent', 'immediately', 'suspended', 'permanently', '24 hours'],
    'reason': 'High-pressure language creating urgency'
}
```

### **Keywords:**
- **Sentiment:** Emotional tone of message
- **Pressure Tactics:** Creating false urgency/fear
- **Social Engineering:** Manipulating people psychologically
- **Fear Appeals:** Threatening negative consequences

---

## ⚖️ STEP 7: Ensemble Scoring

### **What Happens:**
Combines all scores with weighted importance.

### **Code Function:**
```python
ensemble_scoring(auth, content, url, behavior, sentiment)
```

### **Processing:**
```python
# Weighted combination
final_score = (
    authentication_score * 0.20 +  # 20% weight
    content_score * 0.20 +         # 20% weight
    url_score * 0.35 +             # 35% weight (highest!)
    behavior_score * 0.15 +        # 15% weight
    sentiment_score * 0.10         # 10% weight
)

# Our example:
final_score = (
    0.80 * 0.20 +  # Auth: 0.16
    0.97 * 0.20 +  # Content: 0.194
    0.95 * 0.35 +  # URL: 0.3325 (most important!)
    0.25 * 0.15 +  # Behavior: 0.0375
    0.80 * 0.10    # Sentiment: 0.08
) = 0.804

# Critical Override Check:
if url_score >= 0.7 and url_score > 0:
    # Bad URL found - definitely phishing!
    final_score = max(final_score, 0.7)  # Ensure at least 70%
```

### **Output:**
```python
{
    'final_score': 0.804,  # 80.4% phishing risk
    'component_scores': {
        'authentication': 0.80,
        'content': 0.97,
        'url': 0.95,  # Highest risk!
        'behavior': 0.25,
        'sentiment': 0.80
    },
    'override_triggered': True,
    'override_reason': 'High-risk URL detected (95%)'
}
```

### **Keywords:**
- **Ensemble:** Combining multiple models/scores
- **Weighted Average:** Some factors matter more than others
- **Override Logic:** Critical findings force classification
- **Risk Score:** Final probability (0.0-1.0)

---

## 🚨 STEP 8: Classification & Actions

### **What Happens:**
Determines threat level and recommended actions.

### **Code Function:**
```python
determine_actions(final_score, classification_reason)
```

### **Processing:**
```python
final_score = 0.804

if final_score >= 0.7:
    classification = 'Phishing'
    actions = [
        'Quarantine email',
        'Block sender',
        'Tag as High Risk',
        'Notify administrator',
        'Add domain to blacklist'
    ]
elif final_score >= 0.4:
    classification = 'Suspicious'
    actions = [
        'Move to spam folder',
        'Tag for manual review',
        'Warn user before opening'
    ]
else:
    classification = 'Safe'
    actions = [
        'Deliver to inbox'
    ]
```

### **Output:**
```python
{
    'classification': 'Phishing',
    'confidence': 0.804,
    'severity': 'High',
    'actions': [
        'Quarantine email',
        'Block sender',
        'Tag as High Risk',
        'Notify administrator',
        'Add domain to blacklist'
    ]
}
```

### **Keywords:**
- **Classification:** Safe / Suspicious / Phishing
- **Quarantine:** Isolate dangerous email
- **Blacklist:** Permanently block sender/domain
- **False Positive:** Safe email wrongly marked as phishing
- **False Negative:** Phishing email wrongly marked as safe

---

## 💾 STEP 9: Store Results

### **What Happens:**
Save analysis to database for learning and reporting.

### **Code Function:**
```python
create_email_analysis(db, analysis_result)
```

### **Processing:**
```python
db_record = EmailAnalysis(
    sender='security@paypal-verify.com',
    subject='Urgent: Verify Your PayPal Account',
    classification='Phishing',
    final_score=0.804,
    auth_score=0.80,
    content_score=0.97,
    url_score=0.95,
    behavior_score=0.25,
    sentiment_score=0.80,
    actions_taken=['Quarantine', 'Block sender', 'Notify admin'],
    timestamp=datetime.now(),
    reasons=[
        'No SPF/DKIM/DMARC authentication',
        'ML model detected 98% phishing probability',
        'Brand impersonation (PayPal)',
        'Domain created 2 days ago',
        'No valid SSL certificate',
        'High-pressure language'
    ]
)
db.add(db_record)
db.commit()
```

### **Output:**
```python
{
    'id': 12345,
    'stored_at': '2025-01-03T10:30:00Z',
    'status': 'success'
}
```

### **Keywords:**
- **Database:** Persistent storage (SQLite)
- **Learning:** Building history for future analysis
- **Audit Trail:** Record of all decisions made
- **Analytics:** Statistics on phishing trends

---

## 📊 STEP 10: Return Results to User

### **What Happens:**
Send analysis results to frontend for display.

### **Code Function:**
```python
return JSONResponse(content=analysis_result)
```

### **API Response:**
```json
{
    "classification": "Phishing",
    "final_score": 0.804,
    "safety_score": 19.6,
    "auth_score": 0.80,
    "content_score": 0.97,
    "url_score": 0.95,
    "behavior_score": 0.25,
    "sentiment_score": 0.80,
    "actions_taken": [
        "Quarantine email",
        "Block sender",
        "Tag as High Risk",
        "Notify administrator"
    ],
    "details": {
        "spf": "fail",
        "dkim": "fail",
        "dmarc": "none",
        "urgency_detected": true,
        "credentials_requested": true,
        "brand_misuse": true,
        "urls_found": 1,
        "suspicious_urls": 1,
        "new_sender": true,
        "pressure_detected": true
    },
    "reasons": [
        "No email authentication (SPF/DKIM/DMARC)",
        "AI detected 98% phishing probability",
        "PayPal brand mentioned but URL is paypal-secure.xyz",
        "Domain created 2 days ago (very new)",
        "No valid SSL certificate",
        "Domain doesn't exist in DNS",
        "High-pressure language detected",
        "Credential harvesting attempt"
    ]
}
```

### **Frontend Display:**

**Safety Score: 19.6/100** 🔴

**Classification: PHISHING**

**Breakdown:**
- 🔐 Authentication: 20/100 (No SPF/DKIM/DMARC)
- 📝 Content: 3/100 (AI detected phishing patterns)
- 🔗 URLs: 5/100 (Malicious URL detected)
- 👤 Behavior: 75/100 (New sender)
- 😰 Sentiment: 20/100 (High pressure tactics)

**Actions Taken:**
- ✅ Email quarantined
- ✅ Sender blocked
- ✅ Administrator notified

---

## 📈 Summary: Why This Email is Phishing

| Category | Finding | Risk Impact |
|----------|---------|-------------|
| **Authentication** | No SPF/DKIM/DMARC | 🔴 High |
| **Content** | AI detected phishing language | 🔴 Critical |
| **URL** | Domain 2 days old, no SSL, doesn't exist | 🔴 Critical |
| **Brand** | Claims PayPal but wrong domain | 🔴 High |
| **Pressure** | Urgent threats of closure | 🟠 Medium |
| **Sender** | Never seen before | 🟡 Low |

**Final Verdict:** This is a **textbook phishing attack**. The system correctly identified:
1. Fake domain impersonating PayPal
2. No security authentication
3. Psychological pressure tactics
4. Newly registered domain with no infrastructure

**Safety Score: 19.6/100 = PHISHING** 🚨

---

## 🎯 Key Takeaways

### **What Makes Email Guard Smart:**

1. **Not Just Keywords:** Uses AI to understand context and meaning
2. **Real Infrastructure Checks:** Verifies domains actually exist with proper security
3. **External Threat Intelligence:** Checks Google Safe Browsing, PhishTank databases
4. **Context-Aware:** Knows Amazon can sell Apple products (legitimate)
5. **Learning System:** Builds sender history over time
6. **Multi-Layered:** 10 independent checks catching different attack types

### **Technology Stack:**
- **AI Model:** Transformer (BERT/RoBERTa) for semantic understanding
- **External APIs:** Google Safe Browsing, PhishTank, WHOIS, DNS
- **Security Protocols:** SPF, DKIM, DMARC validation
- **Database:** SQLite for learning and history
- **Backend:** Python FastAPI
- **Frontend:** React/Next.js

### **Innovation:**
Traditional filters: "password" in email → phishing ❌  
Email Guard: Check if domain exists, has valid SSL, matches brand, ML analysis → intelligent decision ✅

---

**Built with intelligence, not just rules!** 🛡️