# 🛡️ Email Guard - AI-Powered Email Security

Complete implementation of **AI-Powered Email Security System** for phishing detection and email threat analysis.

## 📋 System Overview

Email Guard implements a comprehensive email threat detection system using machine learning models running locally.

### Analysis Process:

1. **Email Input** - Parse raw email content and headers
2. **Authentication Checks** - SPF, DKIM, DMARC validation
3. **Content Analysis** - Urgency detection, credential requests, brand misuse
4. **URL Inspection** - Domain analysis, phishing URL detection
5. **Sender Behavior** - History tracking, timing patterns
6. **Sentiment Analysis** - Pressure/fear tactic identification
7. **Final Scoring** - ML-based weighted combination of all scores
8. **Classification** - Safe / Suspicious / Phishing

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 14+
- npm or yarn

### One-Command Start
```bash
./run.sh
```

This automatically starts:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

Press `Ctrl+C` to stop all servers.

### Manual Start

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📁 Project Structure

```
email-guard/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # Main API endpoints
│   │   ├── ai.py        # ML model logic
│   │   ├── auth.py      # Authentication
│   │   ├── crud.py      # Database operations
│   │   ├── db.py        # Database config
│   │   └── utils.py     # Utility functions
│   └── requirements.txt
├── frontend/            # Next.js frontend
│   ├── pages/
│   │   └── index.js    # Main UI
│   └── package.json
├── models/              # ML models (local)
│   ├── classical/       # Traditional ML models
│   └── text/           # NLP models
├── tests/              # Test files
├── run.sh              # Auto-start script
└── test_emails.json    # Sample test data
```

## 📊 Features

### Analysis Features
- ✅ **Email Authentication** - SPF, DKIM, DMARC validation
- ✅ **Content Analysis** - Urgency, credentials, brand misuse detection
- ✅ **URL Inspection** - Suspicious link detection
- ✅ **Behavior Analysis** - Sender patterns and timing
- ✅ **Sentiment Analysis** - Pressure and manipulation detection
- ✅ **ML Classification** - Ensemble scoring with local models

### User Features
- ✅ **User Authentication** - Register/Login system
- ✅ **Analysis History** - View past email analyses
- ✅ **HTML Reports** - Download detailed analysis reports
- ✅ **Help Documentation** - In-app usage guide

### Scoring System
- Authentication: 25%
- Content: 30%
- URL: 20%
- Behavior: 15%
- Sentiment: 10%

**Classification:**
- **Safe** (70-100): Green - Email is trustworthy
- **Suspicious** (40-69): Yellow - Proceed with caution
- **Phishing** (0-39): Red - Dangerous, do not interact

## 🔌 API Endpoints

```bash
POST /auth/register        # Register new user
POST /auth/token          # Login user
POST /analyze             # Analyze email text
GET  /analyses            # Get analysis history
GET  /statistics          # Get user statistics
```

## 📝 Testing

Use included sample emails:
```bash
cat test_emails.json
```

Or run demo script:
```bash
bash demo.sh
```

## 🗄️ Data Storage

- **Database**: SQLite (`backend/emailguard.db`)
- **Persistence**: User accounts and history persist across restarts
- **Models**: Stored locally in `models/` directory

## 📚 Documentation

- **Setup Guide**: `SETUP_AND_RUN.md` - Detailed installation instructions
- **User Guide**: `USER_GUIDE.md` - How to use the application
- **Detection Methods**: `HOW_IT_DETECTS.md` - Analysis techniques explained
- **Quick Reference**: `QUICK_REFERENCE.md` - Command cheatsheet

## 🛠️ Development

### Adding Features
1. Backend: Add endpoints in `backend/app/main.py`
2. Frontend: Update `frontend/pages/index.js`
3. Test thoroughly before deployment

### Running Tests
```bash
python -m pytest tests/
```

## 🔒 Security Notes

- This tool is for educational and testing purposes
- Always verify suspicious emails through official channels
- Do not rely solely on automated analysis for critical decisions
- Keep models updated for best detection rates

## 📖 Quick Commands

| Task | Command |
|------|---------|
| Start everything | `./run.sh` |
| Stop servers | Press `Ctrl+C` |
| Run tests | `bash test-project.sh` |
| Check status | `bash verify.sh` |

---

**Ready to protect your inbox! 🛡️**
