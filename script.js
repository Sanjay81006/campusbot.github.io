// Get UI elements
const btn = document.getElementById("voice-btn");
const langSelect = document.getElementById("lang");
const chatBox = document.getElementById("chat-box"); // Add a div with id="chat-box" in your HTML

// Setup Speech Recognition
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.interimResults = false;

// 🎤 Handle click on Speak button
btn.addEventListener("click", () => {
  recognition.lang = langSelect.value;
  recognition.start();
});

// 🎤 When speech is recognized
recognition.onresult = async (event) => {
  const text = event.results[0][0].transcript;
  addMessage("You", text);

  // Send message to backend (Vercel -> OpenAI)
  const reply = await sendMessage(text);
  addMessage("Bot", reply);

  // 🔊 Speak reply
  speak(reply);
};

// 📨 Send message to backend API
async function sendMessage(userMessage) {
  const response = await fetch("https://campusbot-github-io.vercel.app/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: userMessage })
  });

  const data = await response.json();
  return data.reply;
}

// 💬 Add messages to chat box
function addMessage(sender, text) {
  const msg = document.createElement("p");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
}

// 🔊 Text-to-speech for bot reply
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = langSelect.value;
  speechSynthesis.speak(utter);
}
