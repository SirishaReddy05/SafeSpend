# SafeSpend System Architecture

## 1) High-Level Architecture

```mermaid
flowchart LR
    U[User Browser]

    subgraph FE[Frontend - React + Vite + TypeScript]
      FE1[Auth: Login / Signup / Profile]
      FE2[Finance Modules: Dashboard, Wallets, Budget, Goals, Investments, Savings, Debts]
      FE3[AI UX: Finance Guru + Ask Agent]
      FE4[Other: Reports, Notifications, About, Landing]
      FE5[Planned: Bills, Docs, Settings]
    end

    subgraph BE[Backend API - Node.js + Express]
      BE0[/api/health]
      BE1[/api/users - auth + profile]
      BE2[/api/wallet]
      BE3[/api/budget]
      BE4[/api/goals]
      BE5[/api/investments]
      BE6[/api/savings]
      BE7[/api/debt]
      BE8[/api/python - proxy layer]
    end

    subgraph DB[MongoDB]
      DB1[(User)]
      DB2[(Wallet)]
      DB3[(Budget)]
      DB4[(Goals)]
      DB5[(Investments)]
      DB6[(Savings)]
      DB7[(Debt)]
    end

    subgraph PE[Python Engine - FastAPI]
      PE1[/health]
      PE2[/resources]
      PE3[/resources/upload]
      PE4[/resources/{id} delete]
      PE5[/agent/ask]
      PE6[OCR + Preprocess + Retrieval]
      PE7[(Resource files + extracted text + metadata JSON)]
    end

    subgraph EXT[External AI]
      EXT1[Gemini API]
    end

    U --> FE
    FE -->|REST /api| BE
    BE --> DB
    BE -->|/api/python/*| PE
    PE --> PE7
    PE -->|context-based answer| EXT1
```

## 2) Frontend Feature Map

- Public pages:
  - `Landing`, `About`, `Login`, `SignUp`
- Protected pages:
  - `Dashboard`
  - `Wallets`
  - `Budget`
  - `Goals`
  - `Investments`
  - `Savings`
  - `Debts`
  - `FinanceGuru` (resource upload + grounded Q&A)
  - `AskAgent` (chat assistant)
  - `Reports`
  - `Profile`
  - `Notifications`
- Planned placeholders:
  - `Bills`, `Docs`, `Settings`

## 3) Backend Domain APIs

- Auth & profile:
  - `POST /api/users/signup`
  - `POST /api/users/signin`
  - `GET /api/users/me`
  - `PUT /api/users/me`
- Finance CRUD:
  - Wallet: `/api/wallet/*`
  - Budget: `/api/budget/*`
  - Goals: `/api/goals/*`
  - Investments: `/api/investments/*`
  - Savings: `/api/savings/*`
  - Debt: `/api/debt/*`
- Python engine integration proxy:
  - `GET /api/python/health`
  - `GET /api/python/resources`
  - `POST /api/python/resources/upload`
  - `DELETE /api/python/resources/:resourceId`
  - `POST /api/python/agent/ask`

## 4) Python Engine Responsibilities

- Document resource lifecycle:
  - Upload resource file (base64 payload)
  - Persist file + extracted text + metadata
  - List saved resources
  - Delete saved resources
- Document intelligence pipeline:
  - OCR extraction (`ocr_engine.py`, `pdf_utils.py`, `preprocess.py`)
  - Chunking + token overlap retrieval (`retrieval.py`)
  - Grounded answer generation (`agent.py`) using retrieved context

## 5) Data Storage Design

- MongoDB (transactional app data):
  - users, wallets, budgets, goals, investments, savings, debts
- Python local storage (knowledge resources):
  - `python_engine/resources/files/` -> original uploaded files
  - `python_engine/resources/texts/` -> extracted text
  - `python_engine/resources/resources.json` -> resource metadata index

## 6) Request Flows

- Standard finance CRUD:
  1. Frontend page -> Express `/api/<domain>`
  2. Controller -> Mongo model -> response to UI

- Finance Guru (resource-grounded):
  1. Frontend sends upload/query to `/api/python/*`
  2. Express proxy forwards to Python engine
  3. Python engine OCRs + stores resources
  4. On ask, retrieval selects relevant chunks
  5. Agent responds from resource context (and Gemini when available)
  6. Response returns via backend to frontend chat

## 7) Runtime Ports

- Frontend (Vite): `5173`
- Backend (Express): `5000`
- Python engine (FastAPI/Uvicorn): `8000`
- MongoDB: configured by `MONGO_URI`

