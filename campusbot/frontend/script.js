const chatbox = document.getElementById("chatbox");
const inputField = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const languageSel = document.getElementById("language");

function addMessage(text, cls) {
  const p = document.createElement("div");
  p.className = cls;
  p.innerHTML = text;
  chatbox.appendChild(p);
  chatbox.scrollTop = chatbox.scrollHeight;
}

async function sendMessage() {
  const msg = inputField.value.trim();
  const language = languageSel.value || "english";
  if (!msg) return;
  addMessage(`<b>You:</b> ${msg}`, "user-message");
  inputField.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, language })
    });
    if (!res.ok) {
      const err = await res.text();
      addMessage(`<b>Bot:</b> Error: ${res.status} ${err}`, "bot-message");
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
