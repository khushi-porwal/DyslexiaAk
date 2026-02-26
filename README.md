# Dyslexia_AK

This repository contains the backend and frontend code for a dyslexia assessment and support application.  It includes:

* **backend/** – Express.js API serving authentication, history, phonological exercises, drawings and ML service integration.
* **frontend/dyslexiaF/** – Expo/React Native app (with web support) implementing the user interface.
* **Ml_Backend/** – Python FastAPI service used by the backend to classify user drawings using a trained TensorFlow model.

---

## Prerequisites

1. **Git** – for version control and pushing to GitHub.
2. **Node.js & npm** – `>=18.x` recommended for backend and frontend packages.
3. **Python 3.10+** – for the ML service (virtual environment recommended).
4. **MongoDB** – a database instance (local or cloud) accessible via `MONGO_URI`.
5. **(Optional)** `expo-cli` globally if you prefer `expo` commands without `npx`.

---

## Environment variables

Create a `.env` file at the root of `backend/` with the following keys:

```
MONGO_URI=<your mongodb connection string>
PORT=5000               # optional, defaults to 5000
JWT_SECRET=<random secret>
JWT_REFRESH_SECRET=<another secret>
ML_URL=http://localhost:8000   # address of the ML backend (see below)
```

The frontend uses Expo and handles most configuration internally; you can add additional env vars with Expo config plugin if needed.

---

## Getting started

### 1. Backend

```powershell
cd backend
npm install
```

Run in development mode (auto‑restarts on change):

```powershell
npm run dev       # starts server on PORT, 0.0.0.0 by default
```

Or start normally:

```powershell
npm start
```

The API endpoints are mounted under `/api/*`.  A simple health check is available at:

```
GET http://localhost:5000/
``` 

### 2. ML backend (Python service)

```powershell
cd Ml_Backend
python -m venv venv        # or use your preferred env manager
# activate the environment:
# windows: venv\Scripts\activate
# mac/linux: source venv/bin/activate
pip install -r requirements.txt
```

Start the FastAPI server:

```powershell
uvicorn main:app --reload --port 8000
```

The inference endpoint is:

```
POST http://localhost:8000/predict
```

with a JSON body `{ "image": "<base64>", "target": "apple" }`.

### 3. Frontend (Expo app)

```powershell
cd frontend/dyslexiaF
npm install
npm run start         # or `expo start`
```

Choose Android, iOS, or web in the Expo CLI menu.  The app will communicate with the backend via the URLs defined in `services/mlService.js` and other API wrappers.

---

## Testing

* **Backend** currently has no automated tests (placeholder script in `package.json`).  Use tools such as Postman or `curl` to exercise endpoints.
* **ML service** has simple scripts:
  ```powershell
  cd Ml_Backend
  python ml/test_predict.py
  python ml/test_preprocess.py
  ```
  These print results to the console and can be adapted to a proper test framework later.

* **Frontend** linting is available:
  ```powershell
  npm run lint
  ```
  You can also test the user flows manually via Expo.

---

## Development tips

1. Run backend and ML server in separate terminals.  The backend expects `ML_URL` to point at the running ML service.
2. If you change schema/models, restart the Node server to reload.
3. Use `npm run reset-project` in the frontend to clear starter code.
4. Remember to add new environment variables to `.env` and do not commit secrets.

---

## Deployment

Deployment choices depend on your hosting provider.  A common setup:

1. Deploy backend (and ML service if separate) on a Node‑friendly host or container (Heroku, Vercel Serverless, AWS ECS, etc.).
2. Host the Expo web build as a static site or use EAS to build mobile binaries.
3. Ensure `MONGO_URI` and JWT secrets are set in your production environment variables.

---

## License

Specify your project's license here (e.g., MIT).

---

For more details about the frontend check `frontend/dyslexiaF/README.md` (Expo boilerplate).  Feel free to extend this documentation as the project grows.