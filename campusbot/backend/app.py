# backend/app.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import pathlib

app = FastAPI()

# Allow CORS from anywhere for local dev. In production restrict origin(s).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load knowledge data
DATA_PATH = pathlib.Path(__file__).parent / "gitam_site.json"
with open(DATA_PATH, "r", encoding="utf-8") as f:
    gitam_data = json.load(f)

def find_reply(user_text: str, lang: str = "english"):
    """
    Very simple keyword matching: returns the 'answer' for the first item
    whose keywords appear in user_text. Otherwise returns fallback.
    """
    text = user_text.lower()
    # iterate through entries
    for item in gitam_data.get("faq", []):
        keywords = item.get("keywords", [])
        for kw in keywords:
            if kw.lower() in text:
                return item.get("answer", "")
    # nothing matched
    return "Sorry, I didn't understand. Can you rephrase?"

@app.post("/api/chat")
async def chat_endpoint(request: Request):
    """
    POST JSON: { "message": "...", "language": "english" }
    Returns JSON: { "reply": "..." }
    """
    try:
        data = await request.json()
        message = data.get("message", "")
        language = data.get("language", "english")
    except Exception:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)

    if not message or not message.strip():
        return JSONResponse({"error": "Empty message"}, status_code=400)

    reply = find_reply(message, language)
    return {"reply": reply}


# Root (optional) — helpful to verify server is running
@app.get("/")
async def root():
    return {"status": "ok", "message": "✅ Backend running. Use /api/chat for POST requests."}
