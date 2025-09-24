async function sendMessage() {
  const input = document.getElementById("userInput");
  const message = input.value.trim();
  if (!message) return;

  const messagesDiv = document.getElementById("messages");
  messagesDiv.innerHTML += `<p><span class="msg-user">You:</span> ${message}</p>`;
  input.value = "";

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userMessage: message }),
    });

    const data = await response.json();
    console.log("DEBUG frontend got:", data);

    if (data.reply) {
      messagesDiv.innerHTML += `<p><span class="msg-bot">Bot:</span> ${data.reply}</p>`;
    } else {
      messagesDiv.innerHTML += `<p><span class="msg-bot">Bot:</span> (no reply from server)</p>`;
    }
  } catch (err) {
    console.error("Frontend error:", err);
    messagesDiv.innerHTML += `<p><span class="msg-bot">Bot:</span> Error contacting server.</p>`;
  }
}
