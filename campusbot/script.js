let gitamData = {};

// Load local GITAM data
fetch("gitam_site.json")
  .then(res => res.json())
  .then(data => {
    gitamData = data;
    console.log("✅ GITAM data loaded");
  })
  .catch(err => console.error("Error loading JSON", err));

// Send text message
async function sendMessage() {
  const inputField = document.getElementById("userInput");
  const chatbox = document.getElementById("chatbox");
  const language = document.getElementById("language").value;
  const userMessage = inputField.value.trim();

  if (!userMessage) return;

  chatbox.innerHTML += `<p class="user-message"><b>You:</b> ${userMessage}</p>`;
  inputField.value = "";

  // Search inside gitamData
  let reply = "Sorry, I don't have info on that.";
  for (const item of gitamData.faqs) {
    if (userMessage.toLowerCase().includes(item.q.toLowerCase())) {
      reply = item.a;
      break;
    }
  }

  chatbox.innerHTML += `<p class="bot-message"><b>Bot:</b> ${reply}</p>`;
  chatbox.scrollTop = chatbox.scrollHeight;

  speakText(reply, language);
}

// Voice input
function startVoice() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = document.getElementById("language").value;
  recognition.start();

  recognition.onresult = function (event) {
    document.getElementById("userInput").value = event.results[0][0].transcript;
    sendMessage();
  };
}

// Bot speaks
function speakText(text, language) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language;
  window.speechSynthesis.speak(utterance);
}

