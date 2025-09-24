// ⚠️ Replace with your own OpenAI API key
const API_KEY = "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";

const messagesDiv = document.getElementById("messages");
const userInput = document.getElementById("userInput");

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Show user message
  appendMessage("You", text, "user");
  userInput.value = "";

  try {
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: text }]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Error: No response";

    appendMessage("Bot", reply, "bot");

  } catch (err) {
    appendMessage("Bot", "⚠️ Error: " + err.message, "bot");
  }
}

function appendMessage(sender, text, cssClass) {
  const msgDiv = document.createElement("div");
  msgDiv.className = `msg ${cssClass}`;
  msgDiv.innerHTML = `<strong>${sender}:</strong> ${text}`;
  messagesDiv.appendChild(msgDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

