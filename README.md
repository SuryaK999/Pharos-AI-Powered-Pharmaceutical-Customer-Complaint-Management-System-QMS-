<div align="center">

<img src="frontend/public/pharos-logo.svg" alt="Pharos Logo" width="130" />

# ⚓ Pharos | AI-Powered Quality Intelligence & QMS

> **Autonomous multi-agent orchestration engine for pharmaceutical complaint intake, ICH Q9 risk classification, and regulatory CAPA recommendations.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.6-009688.svg?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Redux](https://img.shields.io/badge/Redux%20Toolkit-2.5-764ABC.svg?style=for-the-badge&logo=redux)](https://redux-toolkit.js.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2.60-FF6F61.svg?style=for-the-badge)](https://www.langchain.com/langgraph)
[![Groq](https://img.shields.io/badge/Groq%20API-gemma2--9b--it-F05032.svg?style=for-the-badge)](https://groq.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Compliance](https://img.shields.io/badge/Compliance-ICH%20Q9%20%7C%2021%20CFR%20211.198%20%7C%20EU%20GMP-blue.svg?style=for-the-badge)](#-regulatory-compliance)

---

**Pharos** brings intelligent, real-time agentic automation to pharmaceutical Quality Management Systems (QMS). Built around multi-agent workflows, Pharos automates the intake, risk classification, completeness validation, duplicate detection, root cause analysis, and CAPA generation for customer complaints across API and Finished Dosage Form (FDF) portfolios.

</div>

<br />

## 📋 Table of Contents

1. [🌟 Origin & Philosophy](#-origin--philosophy)
2. [✨ Key Features](#-key-features)
3. [🏛 Regulatory Compliance](#-regulatory-compliance)
4. [🏗 Architecture & LangGraph Pipeline](#-architecture--langgraph-pipeline)
5. [🛠 Tech Stack](#-tech-stack)
6. [🚀 Quickstart & Installation](#-quickstart--installation)
7. [🤖 AI Model Strategy](#-ai-model-strategy)
8. [📡 Real-Time SSE Event Streaming](#-real-time-sse-event-streaming)
9. [🔌 API Reference](#-api-reference)
10. [📂 Project Structure](#-project-structure)
11. [🎬 Demo Walkthrough Guide](#-demo-walkthrough-guide)

---

## 🌟 Origin & Philosophy

The **Pharos of Alexandria** was the ancient world’s legendary lighthouse — a beacon of light keeping ships safe from hidden reefs. 

In pharmaceutical manufacturing, **customer complaints are early beacons of quality risk**. Pharos transforms raw customer communications (emails, letters, PDFs, transcripts) into actionable QMS intelligence before minor deviations escalate into patient harm, adverse events, or major regulatory actions.

---

## ✨ Key Features

- **🤖 Multi-Agent LangGraph Pipeline**: 7 specialized processing nodes with parallel fan-out and join execution.
- **⚡ Real-Time Streaming Progress (SSE)**: Live, Server-Sent Event updates stream agent execution steps directly to the UI.
- **📊 ICH Q9 Risk Matrix Engine**: Automated Severity (1–5) × Probability (1–5) scoring with animated 180° gauge & risk rationale.
- **🔍 Intelligent Entity Extraction**: Parses product name, batch/lot numbers, complainant details, quantity affected, defect type, and classification with flash-highlight feedback.
- **✅ Completeness Checker**: Audit required QMS fields against regulatory standards (21 CFR 211.198) with missing field alerts.
- **👯 Duplicate Detection**: Deterministic similarity scanning across historical records using batch matching, product alignment, and Jaccard text overlap.
- **🔍 Root Cause Analysis (Ishikawa & 5 Whys)**: Automated Cause-and-Effect classification and 5 Whys derivation using deep reasoning models.
- **🛡 CAPA Recommendation**: Categorized Immediate (quarantine/hold), Corrective, and Preventive Action drafting + regulatory reporting alerts (FDA Field Alert / Pharmacovigilance).
- **📈 Interactive Dashboard**: Executive KPIs, weekly ISO-week intake pulse, risk breakdown bar, priority alerts, and lifecycle status pipeline.

---

## 🏛 Regulatory Compliance

Pharos is designed from the ground up to comply with global pharmaceutical quality standards:

| Regulation / Guidance | Subject Area | Implementation in Pharos |
|---|---|---|
| **ICH Q9** | Quality Risk Management | Automated 5×5 Risk Matrix scoring (Severity × Probability), level categorization (Low, Medium, High, Critical), and risk rationale generation. |
| **21 CFR 211.198** | Customer Complaint Files | Standardized complaint record schema, mandatory field completeness auditing, and activity audit trails. |
| **EU GMP Chapter 8** | Complaints, Quality Defects & Recalls | End-to-end lifecycle workflow tracking (`Draft` $\rightarrow$ `Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Investigation` $\rightarrow$ `CAPA` $\rightarrow$ `Closed`). |
| **21 CFR 209 / 314.81** | Pharmacovigilance & Field Alerts | Instant flagging for adverse events, sterility/contamination issues, and mandatory reporting window reminders. |

---

## 🏗 Architecture & LangGraph Pipeline

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Raw Complaint: Email / PDF / Text / Form                 │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
                     FastAPI Endpoint (/api/ai/process-*)
                                       │
                                       ▼
                    LangGraph StateGraph Engine (7 Nodes)
                                       │
                         ┌─────────────┴─────────────┐
                         │   node: extract (Groq)    │
                         └─────────────┬─────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
   node: risk (Groq)         node: completeness        node: duplicates
  (ICH Q9 Risk Matrix)         (Field Audit)            (Register Scan)
            │                          │                          │
            └──────────────────────────┼──────────────────────────┘
                                       ▼
                         node: root_cause (Groq 70B)
                          (Ishikawa + 5 Whys Chain)
                                       │
                                       ▼
                            node: capa (Groq 70B)
                           (21 CFR 211.198 Actions)
                                       │
                                       ▼
                            node: summarize (Groq)
                             (Executive Brief)
                                       │
                                       ▼
                       Client UI (React via SSE Stream)
```

### LangGraph Agent Execution Flow

1. **`extract`** *(Groq · `gemma2-9b-it`)*: Parses unstructured text/email into structured JSON entity fields.
2. **`risk`** *(Groq · `gemma2-9b-it`)*: Evaluates ICH Q9 risk matrix (Severity 1–5, Probability 1–5, Score 1–25, Level).
3. **`completeness`** *(Deterministic Audit)*: Verifies presence of mandatory QMS fields and calculates percentage score.
4. **`duplicates`** *(Deterministic Search)*: Scans recent complaint database (Batch match 45%, Product match 25%, Narrative Jaccard 30%).
5. **`root_cause`** *(Groq · `llama-3.3-70b-versatile`)*: Performs Ishikawa categorization and builds a 5-step "Whys" investigative chain.
6. **`capa`** *(Groq · `llama-3.3-70b-versatile`)*: Formulates Immediate, Corrective, and Preventive actions alongside regulatory submission guidelines.
7. **`summarize`** *(Groq · `gemma2-9b-it`)*: Generates an executive brief for QA leadership.

---

## 🛠 Tech Stack

### **Backend**
- **Framework**: FastAPI 0.115
- **Orchestration**: LangGraph 0.2.60
- **LLM Engine**: Groq Client (`gemma2-9b-it` & `llama-3.3-70b-versatile`)
- **Database & ORM**: PostgreSQL 16 + SQLAlchemy 2.0 (with SQLite fallback support)
- **Document Parsers**: PyPDF (`pypdf` 5.1), Python Standard Library `email`

### **Frontend**
- **Framework**: React 18 + Vite 6
- **State Management**: Redux Toolkit 2.5 (`complaints` and `intake` slices)
- **Routing**: React Router DOM v7
- **Styling**: Vanilla Tailwind CSS 3.4 + Radix UI Primitives + Lucide Icons + Sonner Toasts
- **Typography**: Google Fonts (*Inter*, *Space Grotesk*, *JetBrains Mono*)

---

## 🚀 Quickstart & Installation

### Prerequisites
- Node.js v18+
- Python 3.10+
- Groq API Key ([Get a free key here](https://console.groq.com/))
- Docker & Docker Compose (Optional, for PostgreSQL)

---

### Step 1: Database Setup (PostgreSQL)

```bash
# Start PostgreSQL container in background
docker compose up -d
```
*(Note: If Docker is unavailable, the database layer gracefully falls back to local storage configured in `.env`)*

---

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# On Linux/macOS:
source .venv/bin/activate
# On Windows PowerShell:
# .venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration & edit your Groq API key
cp .env.example .env
```

Edit `.env` to include your Groq API Key:
```env
GROQ_API_KEY=gsk_your_groq_token_here
DATABASE_URL=postgresql://aivoa:aivoa@localhost:5432/aivoa_qms
MODEL_PRIMARY=gemma2-9b-it
MODEL_CONTEXT=llama-3.3-70b-versatile
```

Seed the database with 10 realistic pharmaceutical complaints:
```bash
python seed.py
```

Launch the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```
*Backend API available at: `http://localhost:8000` | API Docs at `http://localhost:8000/docs`*

---

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend Application available at: `http://localhost:5173`*

---

## 🤖 AI Model Strategy

Pharos employs a dual-model hybrid architecture on Groq's high-speed LPU infrastructure:

```
                  ┌──────────────────────────────────────────────┐
                  │                Groq LPU Engine               │
                  └──────────────────────┬───────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
       Fast Extraction & Risk                      Deep Reasoning & CAPA
         (gemma2-9b-it)                          (llama-3.3-70b-versatile)
 ─────────┬──────────────────────────── ───────────┬───────────────────────────
          ├─ Parse entities                        ├─ Ishikawa Category & 5 Whys
          ├─ ICH Q9 Risk Matrix                    ├─ Corrective & Preventive Actions
          └─ Executive Summarization               └─ Regulatory Reporting Rules
```

---

## 📡 Real-Time SSE Event Streaming

Instead of long-polling, Pharos uses **Server-Sent Events (SSE)** to stream LangGraph execution nodes live to the browser:

```javascript
// Example Server-Sent Event stream output
data: {"type": "start"}
data: {"type": "node", "node": "extract", "data": {...}}
data: {"type": "node", "node": "risk", "data": {...}}
data: {"type": "node", "node": "completeness", "data": {...}}
data: {"type": "node", "node": "duplicates", "data": {...}}
data: {"type": "node", "node": "root_cause", "data": {...}}
data: {"type": "node", "node": "capa", "data": {...}}
data: {"type": "node", "node": "summarize", "data": {...}}
data: {"type": "done"}
```

---

## 🔌 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Health check and active AI models status |
| `/api/ai/process-text` | `POST` | Process raw complaint text via LangGraph SSE stream |
| `/api/ai/process-file` | `POST` | Process uploaded PDF/EML/TXT file via LangGraph SSE stream |
| `/api/complaints` | `GET` | List complaints with search (`q`), `status`, and `risk` filters |
| `/api/complaints/{id}` | `GET` | Retrieve single complaint record with activity audit trail |
| `/api/complaints` | `POST` | Commit new reviewed complaint to the QMS database |
| `/api/complaints/{id}` | `PATCH` | Update complaint status or record fields |
| `/api/stats` | `GET` | Retrieve Dashboard KPI metrics, intake graph & risk stats |

---

## 📂 Project Structure

```
Pharos/
├── README.md                           # Comprehensive documentation
├── backend/
│   ├── requirements.txt                # Python dependencies
│   ├── .env.example                    # Environment template
│   ├── seed.py                         # Seed database with pharma complaint data
│   ├── samples/
│   │   └── sample_complaint.eml        # Sample EML file for testing
│   └── app/
│       ├── main.py                     # FastAPI app initialization & middleware
│       ├── core/
│       │   ├── config.py               # Pydantic settings & environment vars
│       │   └── database.py             # SQLAlchemy engine & session factory
│       ├── models/
│       │   └── complaint.py            # SQLAlchemy database models (Complaint & Activity)
│       ├── schemas/
│       │   └── complaint.py            # Pydantic response/request schemas
│       ├── ai/
│       │   ├── llm.py                  # Groq client & JSON-mode handler
│       │   ├── prompts.py              # Specialized QMS system prompts
│       │   └── graph.py                # 7-node LangGraph multi-agent workflow
│       ├── services/
│       │   └── documents.py            # Document parsing service (PDF, EML, TXT)
│       └── api/
│           └── routes/
│               └── complaints.py       # API endpoints (SSE intake, CRUD, Dashboard)
└── frontend/
    ├── package.json                    # Frontend dependencies & scripts
    ├── vite.config.js                  # Vite configuration & path aliases
    ├── tailwind.config.js              # Tailwind custom theme & animations
    ├── index.html                      # App HTML entry point & Google Fonts
    └── src/
        ├── main.jsx                    # React root render with Redux Provider & Router
        ├── App.jsx                     # Route definitions
        ├── index.css                   # Global CSS & animations
        ├── lib/
        │   ├── utils.js                # Tailwind class merge helper (`cn`)
        │   └── api.js                  # API fetch client & SSE stream consumer
        ├── hooks/
        │   └── useCountUp.js           # Animated numeric counter hook
        ├── store/
        │   ├── index.js                # Redux Store configuration
        │   ├── complaintsSlice.js      # Complaints list, detail, & stats state
        │   └── intakeSlice.js          # Live AI intake streaming state
        ├── components/
        │   ├── AppShell.jsx            # Main app shell with sidebar & header
        │   ├── badges.jsx              # Status, Risk, and Type badge components
        │   ├── RiskGauge.jsx           # Animated 180° ICH Q9 risk gauge
        │   ├── CopilotPanel.jsx        # AI Copilot analysis & recommendations view
        │   ├── ExtractionProgress.jsx  # Live LangGraph node progress indicator
        │   └── ui/                     # Reusable UI primitives
        │       ├── button.jsx, badge.jsx, card.jsx, input.jsx, textarea.jsx,
        │       ├── label.jsx, select.jsx, tabs.jsx, progress.jsx, separator.jsx,
        │       └── skeleton.jsx, table.jsx, sonner.jsx
        └── pages/
            ├── Dashboard.jsx           # Quality Dashboard page
            ├── Complaints.jsx          # Filterable Complaint Register page
            ├── NewComplaint.jsx        # AI Intake & Log Complaint workspace
            └── ComplaintDetail.jsx     # Detailed Complaint record & timeline view
```

---

## 🎬 Demo Walkthrough Guide

Follow these steps for a complete feature demonstration:

1. **Dashboard Overview**: Navigate to `http://localhost:5173/`. Observe live KPIs (Total, Open, Critical Open, Avg Completeness), 8-week intake trend bar graph, ICH Q9 risk distribution bar, and recent complaint activity.
2. **AI Intake via Sample Text**:
   - Click **Log Complaint with AI**.
   - Click **"Load sample: packaging defect"** (populates an email regarding Amoxicillin 500 mg Capsules, Batch `AMX-24091`).
   - Click **Run AI Intake Pipeline**.
   - Watch the 7 LangGraph nodes execute in real time on the progress panel.
   - Observe auto-filled form fields with subtle flash highlight animations.
   - Inspect the **AI Copilot** panels: Risk Assessment (High risk, score 16), Duplicate Detection alert (**matches existing record CC-2026-0038**), Completeness score, Root Cause analysis, and CAPA recommendations.
3. **Submit Complaint**: Click **Submit Complaint**. The record is saved as `CC-2026-0041` and redirects to the detail page.
4. **Adverse Event Handling**:
   - Click **Log Complaint**.
   - Click **"Load sample: adverse event"** (populates Ceftriaxone injection contamination with patient fever).
   - Run AI Intake and observe the **Critical Risk (Score 15)** classification and automatic **Pharmacovigilance Flag**.
5. **Document Upload Intake**:
   - Switch to the **Upload Document** tab.
   - Select or drag-and-drop `backend/samples/sample_complaint.eml`.
   - Watch the pipeline parse the file and auto-populate the record.

---

<div align="center">

**Pharos ⭐ — Illuminating Quality Risk in Global Pharmaceuticals.**  
*Built for Regulatory Compliance and Patient Safety.*

</div>
