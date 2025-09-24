from flask import Flask, request, jsonify
import json

app = Flask(__name__)

# Load QnA data from JSON file
with open("data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

@app.route("/api/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message", "").lower()
    language = request.json.get("language", "english").lower()

    response = "Sorry, I didn’t understand. Can you rephrase?"

    # Simple keyword search in the data
    for item in data["faq"]:
        for keyword in item["keywords"]:
            if keyword.lower() in user_input:   # ✅ lowercase check
                response = item["answer"]
                break

    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(debug=True)
