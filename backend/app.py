from flask import Flask, request, jsonify
import json
import os

app = Flask(__name__)

# Load GITAM data from JSON file
with open("gitam_site.json", "r", encoding="utf-8") as f:
    gitam_data = json.load(f)

@app.route("/api/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "").lower()
    language = request.json.get("language", "english")

    response = "Sorry, I don't understand. Can you rephrase?"

    # Simple keyword search in the data
    for item in gitam_data.get("faq", []):
        if any(word in user_input for word in item["keywords"]):
            response = item["answer"]
            break

    return jsonify({"reply": response, "language": language})

@app.route("/")
def home():
    return "✅ Backend is running! Use /api/chat for POST requests."

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
