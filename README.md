# 🛡️ Email Guard

AI-Powered Email Security System with Advanced Phishing Detection

[![FastAPI](https://img.shields.io/badge/FastAPI-0.95.2-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-13.5.6-000000?style=flat&logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat&logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Overview

Email Guard is a comprehensive email security analysis platform that combines classical machine learning, transformer-based text analysis, and external threat intelligence to detect phishing attempts, malicious URLs, and suspicious email patterns. The system implements a complete 10-step analysis workflow with real-time feedback and continuous learning capabilities.

### ✨ Key Features

- **🤖 AI-Powered Analysis**: Combines classical ML models with transformer-based text analysis
- **🔍 Multi-Layer Detection**: 
  - Header analysis (SPF, DKIM, DMARC)
  - Content analysis (text patterns, suspicious keywords)
  - URL intelligence (reputation checks, redirects)
  - Attachment scanning
- **🌐 External Threat Intelligence**: Integration with VirusTotal, URLhaus, and other sources
- **📊 Real-time Dashboard**: Live statistics and analysis history
- **👥 Analyst Feedback Loop**: Human-in-the-loop verification for continuous model improvement
- **🗄️ SQLite Database**: Persistent storage of analyses and sender behavior
- **🔐 Authentication**: JWT-based secure authentication system

## 🏗️ Architecture

```
email-guard/
├── backend/              # FastAPI backend server
│   ├── app/
│   │   ├── main.py      # API endpoints
│   │   ├── ai.py        # ML model inference
│   │   ├── auth.py      # Authentication logic
│   │   ├── crud.py      # Database operations
│   │   ├── db.py        # Database configuration
│   │   ├── models_db.py # SQLAlchemy models
│   │   ├── schemas.py   # Pydantic schemas
│   │   ├── utils.py     # Email parsing & analysis
│   │   ├── external_intelligence.py  # Threat intelligence APIs
│   │   └── url_intelligence.py       # URL analysis
│   └── requirements.txt
├── frontend/             # Next.js frontend
│   ├── pages/
│   │   └── index.js     # Main dashboard
│   └── package.json
├── models/               # ML model artifacts (Git LFS)
│   ├── classical/       # Scikit-learn models
│   │   ├── fuse_lr.joblib
│   │   └── url_gbm.joblib
│   └── text/            # Transformer models
│       └── text_model_final/
├── run.sh               # Automated start script
└── test_emails.json     # Sample test data
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **Git LFS** (for downloading model files)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Dhruvzzzz/email-guard.git
cd email-guard
```

2. **Install Git LFS and download model files**
```bash
git lfs install
git lfs pull
```

3. **Set up backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

4. **Set up frontend**
```bash
cd ../frontend
npm install
```

5. **Configure environment** (optional)
```bash
# Create .env file in backend/ directory
cp .env.example .env
# Edit .env with your API keys for external intelligence services
```

### Running the Application

#### Option 1: Automated Start (Recommended)
```bash
chmod +x run.sh
./run.sh
```

#### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 📖 Usage

### Default Credentials
```
Username: analyst
Password: demo
```

### API Endpoints

#### Authentication
- `POST /auth/token` - Login and get JWT token
- `POST /auth/register` - Register new user

#### Email Analysis
- `POST /analyze` - Analyze email content
- `POST /analyze-attachment` - Analyze email attachment
- `GET /history` - Get analysis history
- `GET /statistics` - Get system statistics

#### Feedback
- `POST /feedback` - Submit analyst feedback
- `PUT /sender-behavior` - Update sender behavior profile

### Example: Analyze an Email via API

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "raw_email": "From: sender@example.com\nSubject: Test\n\nEmail body",
    "analyst_review_requested": false
  }'
```

## 🧪 Testing

Run the included test emails:
```bash
# View test_emails.json for sample phishing and legitimate emails
cat test_emails.json
```

Test via the web interface by pasting email content into the analysis form.

## 🛠️ Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PyTorch** - Deep learning framework
- **Transformers** - Hugging Face transformer models
- **Scikit-learn** - Classical ML models
- **SQLAlchemy** - SQL toolkit and ORM
- **PyJWT** - JSON Web Token authentication
- **Beautiful Soup** - HTML/XML parsing
- **DNSPython** - DNS toolkit
- **pyspf, dkimpy** - Email authentication protocols

### Frontend
- **Next.js** - React framework
- **React** - UI library
- **Axios** - HTTP client

### Database
- **SQLite** - Embedded relational database

## 🔒 Security Features

1. **Email Header Validation**: SPF, DKIM, DMARC verification
2. **URL Analysis**: Link reputation, redirect chain analysis, blacklist checking
3. **Sender Behavior Profiling**: Historical pattern analysis
4. **Threat Intelligence**: Integration with multiple threat databases
5. **Secure Authentication**: JWT-based token system with bcrypt password hashing

## 📊 Analysis Workflow

1. **Email Parsing** - Extract headers, body, URLs, attachments
2. **Header Analysis** - Verify SPF, DKIM, DMARC records
3. **Content Analysis** - Text pattern matching, keyword detection
4. **URL Intelligence** - Reputation check, redirect analysis
5. **Attachment Scanning** - File type and content analysis
6. **ML Classification** - Classical and transformer-based scoring
7. **External Intelligence** - Query threat databases
8. **Sender Profiling** - Historical behavior analysis
9. **Risk Aggregation** - Combined risk scoring
10. **Human Verification** - Optional analyst review

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Transformer models for text classification
- VirusTotal, URLhaus for threat intelligence
- FastAPI and Next.js communities

## 📧 Contact

For questions or support, please open an issue on GitHub.

## ⚠️ Disclaimer

This tool is for educational and security research purposes. Always ensure you have proper authorization before analyzing emails. The accuracy of phishing detection is not guaranteed and should be used as part of a comprehensive security strategy.

---

**Built with ❤️ for email security**
