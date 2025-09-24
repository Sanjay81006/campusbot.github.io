from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Load GITAM data from JSON file
with open("gitam-site.json", "r", encoding="utf-8") as f:
    gitam_data = json.load(f)

@app.route("/api/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "").lower()
    language = request.json.get("language", "english").lower()

    response = "Sorry, I didn't understand. Can you rephrase?"

    # Simple keyword search in the data
    for item in gitam_data.get("faq", []):
        if any(word in user_input for word in item["keywords"]):
            response = item["answer"]

    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
