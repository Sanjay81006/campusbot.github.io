const chatbox = document.getElementById("chatbox");
const inputField = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const languageSel = document.getElementById("language");

// NOTE: When served on Render or elsewhere, replace base URL appropriately.
// If backend and frontend are served from same origin, /api/chat is fine.
const API_BASE = "/api/chat";

function addMessage(text, cls) {
  const d = document.createElement("div");
  d.className = cls;
  d.innerHTML = text;
  chatbox.appendChild(d);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage() {
  const msg = inputField.value.trim();
  const language = languageSel.value || "english";
  if (!msg) return;
  addMessage(`<b>You:</b> ${msg}`, "user-message");
  inputField.value = "";

  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, language })
    });

    if (!res.ok) {
      const text = await res.text();
      addMessage(`<b>Bot:</b> Error: ${res.status} ${text}`, "bot-message");
      return;
    }

    const data = await res.json();
    addMessage(`<b>Bot:</b> ${data.reply}`, "bot-message");
  } catch (e) {
    addMessage(`<b>Bot:</b> Network error: ${e.message}`, "bot-message");
  }
}

sendBtn.addEventListener("click", sendMessage);
inputField.addEventListener("keydown", (e) => { if (e.key === "Enter") sendMessage(); });
