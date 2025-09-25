# backend/app.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import pathlib
import os

app = FastAPI(title="CampusBot Backend")

# Allow CORS for local dev and for static frontend hosting.
# In production narrow down allowed origins.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load dataset file
DATA_PATH = pathlib.Path(__file__).parent / "gitam_site.json"
if not DATA_PATH.exists():
    gitam_data = {"faq": []}
else:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        gitam_data = json.load(f)

def find_reply(user_text: str, lang: str = "english"):
    """
    Simple keyword matching:
    - Iterate over items in gitam_data["faq"]
    - If any keyword is substring of user_text -> return that answer
    - Otherwise fallback message
    """
    text = (user_text or "").lower()
    if not text:
        return "Please send a message."

    for item in gitam_data.get("faq", []):
        keywords = item.get("keywords", []) or []
        for kw in keywords:
            if kw and kw.lower() in text:
                return item.get("answer", "Sorry, no answer available.")
    # fallback
    return "Sorry, I didn't understand. Can you rephrase?"

@app.get("/")
async def root():
    return {"status": "ok", "message": "✅ Backend running. Use /api/chat for POST requests."}

@app.post("/api/chat")
async def chat_endpoint(req: Request):
    """
    POST JSON: { "message": "<text>", "language": "english" }
    Returns { "reply": "<text>" }
    """
    try:
        data = await req.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)

    message = data.get("message", "")
    language = data.get("language", "english")

    if not message or not message.strip():
        return JSONResponse({"error": "Empty message"}, status_code=400)

    reply = find_reply(message, language)
    return {"reply": reply}
