# CampusBot (frontend + backend)

Simple rule-based college assistant:
- Backend: FastAPI (keyword-based replies from `gitam_site.json`)
- Frontend: static HTML + JS

## Run locally

### 1) Backend
Open a terminal in `campusbot/backend`:

Windows:
```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 5000 --reload
