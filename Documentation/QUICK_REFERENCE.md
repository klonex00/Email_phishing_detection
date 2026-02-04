# Email Guard - Quick Reference Card

## 🚀 Start Project (One Command)
```bash
./run.sh
```
Then open: http://localhost:3000

---

## 📊 View Presentation
```bash
open PRESENTATION.md
```

---

## 📂 Key Files
| File | Purpose |
|------|---------|
| `PRESENTATION.md` | Presentation slides (pointwise) |
| `README.md` | Full documentation |
| `PROJECT_SUMMARY.md` | Technical overview |
| `USER_GUIDE.md` | User manual |
| `run.sh` | Start script |

---

## 🏗️ Architecture (Simple)
```
User → Frontend (React) → Backend (FastAPI) → Database (SQLite)
                    ↓
            6-Layer Analysis
            ↓
        Phishing/Legitimate + Explanations
```

---

## 🎯 Key Features
- ✅ 94% accuracy
- ✅ Homograph detection
- ✅ URL obfuscation checks (15+)
- ✅ Attachment triage
- ✅ Explainable results
- ✅ <2s latency

---

## 🛠️ Manual Start

**Backend** (Terminal 1):
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

---

## 📈 Performance
- Accuracy: **94%**
- Homograph detection: **92%** (vs 35% baseline)
- Zero-width detection: **88%** (vs 42% baseline)
- Latency: **0.23s per email**

---

## 🔗 URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

**For detailed presentation, see: PRESENTATION.md**
