# CareForge — Multi-Tenant AI Healthcare Content Engine

CareForge is an automated, AI-driven content generation platform built specifically for health and wellness blogs. It streamlines the creation of accurate, engaging, and medically relevant content, helping healthcare professionals and wellness creators scale their digital presence with ease.

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* Python 3.11+
* Node.js 18+ and npm
* Google Gemini API Key ([Get one free from Google AI Studio](https://aistudio.google.com/))

---

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY
```

**Run the Backend Server:**
```bash
uvicorn app.main:app --reload --port 8000
```
* **API Server:** `http://localhost:8000`
* **Interactive Swagger UI:** `http://localhost:8000/docs`

**Run Backend Tests:**
```bash
pytest tests/ -v
```

---

### 2. Frontend Setup

```bash
cd frontend

# Install packages
npm install

# (Optional) Set environment variable for remote backend
# cp .env.example .env

# Start development server
npm run dev
```
* **Application UI:** `http://localhost:5173`

**Run Frontend Checks & Tests:**
```bash
npm run type-check
npm run test:unit
```
