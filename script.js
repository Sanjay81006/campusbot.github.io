// Send text message to bot
async function sendMessage() {
  const inputField = document.getElementById("userInput");
  const chatbox = document.getElementById("chatbox");
  const language = document.getElementById("language").value;
  const userMessage = inputField.value.trim();

  if (!userMessage) return;

  // Show user message
  chatbox.innerHTML += `<p class="user-message"><b>You:</b> ${userMessage}</p>`;
  inputField.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, language })
    });

    const data = await res.json();

    if (data.reply) {
      chatbox.innerHTML += `<p class="bot-message"><b>Bot:</b> ${data.reply}</p>`;
      speakText(data.reply, language); // Speak out reply
    } else {
      chatbox.innerHTML += `<p class="bot-message"><b>Bot:</b> Error: No reply.</p>`;
    }

    chatbox.scrollTop = chatbox.scrollHeight;
  } catch (err) {
    chatbox.innerHTML += `<p class="bot-message"><b>Bot:</b> Error: No response from server.</p>`;
  }
}

// Voice input using Web Speech API
function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = document.getElementById("language").value;
  recognition.start();

  recognition.onresult = function (event) {
    document.getElementById("userInput").value = event.results[0][0].transcript;
    sendMessage();
  };
}

// Text-to-speech
function speakText(text, language) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language; // will try to use the selected language
  window.speechSynthesis.speak(utterance);
}
