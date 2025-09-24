// 🚨 Replace with your OpenAI API key (keep it secret in real projects)
const API_KEY = "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";

async function sendMessage() {
  const input = document.getElementById("userInput");
  const msg = input.value;
  if (!msg) return;

  addMessage("You: " + msg);
  input.value = "";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: msg }]
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      const botReply = data.choices[0].message.content;
      addMessage("Bot: " + botReply);
      speak(botReply);
    } else {
      addMessage("Bot: [Error: no response]");
    }
  } catch (error) {
    addMessage("Bot: [Error connecting to API]");
    console.error(error);
  }
}

function addMessage(text) {
  const messages = document.getElementById("messages");
  const div = document.createElement("div");
  div.textContent = text;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// 🎤 Voice input
const btn = document.getElementById("voice-btn");
const langSelect = document.getElementById("lang");
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.interimResults = false;

btn.addEventListener("click", () => {
  recognition.lang = langSelect.value;
  recognition.start();
});

recognition.onresult = (event) => {
  const text = event.results[0][0].transcript;
  document.getElementById("userInput").value = text;
  sendMessage();
};

// 🔊 Voice output
function speak(text) {
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = langSelect.value;
  speechSynthesis.speak(utter);
}
