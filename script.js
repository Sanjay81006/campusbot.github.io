let gitamData = {};

// Load the JSON file
fetch('gitam_site.json')
  .then(response => response.json())
  .then(data => {
    gitamData = data;
    console.log("✅ GITAM data loaded", gitamData);
  })
  .catch(error => console.error("Error loading GITAM data:", error));

function searchGitamData(query) {
  query = query.toLowerCase();
  let answer = "";

  if (gitamData.homepage && gitamData.homepage.description.toLowerCase().includes(query)) {
    answer = gitamData.homepage.description;
  }

  if (!answer && gitamData.campuses) {
    for (const [campus, info] of Object.entries(gitamData.campuses)) {
      if (query.includes(campus.toLowerCase())) {
        answer = `${campus} Campus: ${info.address}, Phone: ${info.phone}`;
        break;
      }
    }
  }

  if (!answer && gitamData.faq) {
    for (const faq of gitamData.faq) {
      if (query.includes(faq.question.toLowerCase())) {
        answer = faq.answer;
        break;
      }
    }
  }

  return answer || null;
}

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
   try {
  try {
  // First, search in local gitam_site.json
  let botReply = searchGitamData(userMessage);

  // If not found, fallback to OpenAI
  if (!botReply) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}` // put your key safely
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await res.json();
    botReply = data.choices[0].message.content;
  }

  // Show + speak bot reply
  chatbox.innerHTML += `<p class="bot-message"><b>Bot:</b> ${botReply}</p>`;
  speakText(botReply, language);

} catch (err) {
  console.error("Error:", err);
  chatbox.innerHTML += `<p class="bot-message"><b>Bot:</b> Error: No response.</p>`;
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


