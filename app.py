from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    message = data.get("message", "")
    language = data.get("language", "english")

    # Simple mock reply (replace later with gitam_site.json logic)
    if "placement" in message.lower():
        reply = "GITAM has strong placement support with top recruiters."
    else:
        reply = "Sorry, I don't understand."

    return jsonify({"response": reply})

if __name__ == "__main__":
    app.run(debug=True)
