# SafeSpend

SafeSpend runs as a single React + Vite frontend and an Express + MongoDB backend.

## Project structure

- `frontend/src/components`: shared layout and navigation components
- `frontend/src/context`: auth, theme, and sidebar providers
- `frontend/src/pages`: route-level React pages
- `frontend/src/services`: API clients for backend and AI integrations
- `backend`: Express routes, controllers, models, and database config
- `python_engine`: optional OCR and preprocessing utilities
- `frontend/legacy_unused`: old duplicate frontend files preserved from the previous structure

## Run locally

1. Copy `.env.example` to `.env` and fill in real values.
2. Install dependencies with `npm install`.
3. Start both apps with `npm run dev`.
4. Frontend runs on `http://localhost:5173` and proxies `/api` to the backend on `http://localhost:5000`.

## Useful scripts

- `npm run frontend`: start the React app
- `npm run frontend:build`: build the React app
- `npm run backend`: start the Express API
- `npm run backend:dev`: start the API with nodemon
- `npm run dev`: run frontend and backend together
"# safespend_test" 
"# safespend_test" 
