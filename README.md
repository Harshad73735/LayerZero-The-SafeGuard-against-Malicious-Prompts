# LayerZero: Safeguard Against Malicious Prompts

A full-stack app that screens user prompts for malicious intent before sending them to a Gemini-powered chat backend. It combines:
- A React + Vite frontend chat UI.
- A Node/Express API that stores threads in MongoDB.
- A local Flask BERT classifier used as a safety gate.

## Architecture
- Frontend (React) -> Backend (Express) -> Gemini API
- Backend -> BERT safety service (Flask) -> decision

If the BERT service marks a message as malicious (e.g., bypass, phishing, injection, jailbreak), the backend blocks the request and logs the message in MongoDB.

## Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (for the classifier service)
- A running MongoDB instance
- A Gemini API key

## Environment Variables (.env)
Create a .env file inside the Backend directory.

Backend/.env:
```
GEMINI_API_KEY=your_gemini_api_key
MONGODB_URI=mongodb://localhost:27017/layerzero
```

Optional environment variables for the classifier service (defaults shown):
```
BERT_MODEL_DIR=./bert_malicious_safe_model
BERT_PORT=5002
BERT_MAX_LENGTH=128
BERT_BATCH_SIZE=8
TZ_NAME=Asia/Kolkata
```

## Setup and Run

### 1) Start the classifier (BERT safety service)
From the classifier directory:
```
python run_bert.py
```
This starts a Flask server on http://127.0.0.1:5002 with /predict and /health endpoints.

Note: The backend middleware calls the BERT service at http://127.0.0.1:5002/predict.

### 2) Start the backend (Express API)
From the Backend directory:
```
npm install
node index.js
```
The API listens on http://localhost:8080.

### 3) Start the frontend (React + Vite)
From the frontend directory:
```
npm install
npm run dev
```
The app will connect to the backend at http://localhost:8080 (hardcoded in the UI).

## API Overview
- GET /api/thread -> list threads
- GET /api/thread/:threadId -> thread messages
- DELETE /api/thread/:threadId -> delete a thread
- POST /api/chat -> send a message

## Notes
- The logistic classifier in classifier/run_logistic.py is not wired into the backend, but can be run independently on port 5001 if needed.
- Make sure MongoDB is running before starting the backend.
