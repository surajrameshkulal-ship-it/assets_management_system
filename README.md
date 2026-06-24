# AssetFlow

IT Asset & License Management Platform — a full-stack system for tracking hardware assets, software licenses, employees, support tickets, and AI-powered reports.

## Architecture

```
Users (Admin / Employee)
        │
   Web Dashboard (React + Tailwind)
        │
   REST API (FastAPI + JWT/RBAC)
        │
   ┌────┬──────┬─────────┬──────────┬──────────────┐
   Auth Assets Licenses  AI Engine  Notifications
        │
   MongoDB
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.12+
- MongoDB (local or Docker)

### 1. Start MongoDB

```bash
docker compose up mongodb -d
```

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

### Demo Accounts

| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Admin    | admin@assetflow.io       | admin123     |
| Employee | employee@assetflow.io    | employee123  |

## Features

- **Dashboard** — KPI cards, asset distribution charts, activity feed, compliance alerts
- **Asset Management** — CRUD, assignment tracking, history, warranty dates
- **License Management** — Seat utilization, expiry tracking, compliance risk flags
- **Employee Directory** — Department grouping, contact info
- **Support Tickets** — Priority-based ticketing with role-scoped views
- **AI Reports** — Ollama/Llama integration for intelligent IT insights
- **Notifications** — Email alerts and reminders (admin)
- **RBAC** — JWT auth with Admin and Employee roles

## AI Engine (Optional)

Install and run [Ollama](https://ollama.ai) for live AI reports:

```bash
ollama serve
ollama pull llama3.2
```

Without Ollama, the AI module returns structured fallback reports from your data.

## API Docs

Once the backend is running: **http://localhost:8000/docs**

## Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 19, Vite, Tailwind CSS v4     |
| Backend  | FastAPI, Motor (async MongoDB)      |
| Auth     | JWT + Role-Based Access Control     |
| Database | MongoDB                             |
| AI       | Ollama / Llama 3.2                  |
# CodeDNA scan test
Phase 4 webhook test Wed Jun 24 16:43:11 IST 2026
Phase 5 AI Review Test Wed Jun 24 17:16:54 IST 2026
