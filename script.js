document.getElementById("send-btn").addEventListener("click", sendMessage);

async function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const userMessage = input.value.trim();
  if (!userMessage) return;

  // Show user's message
  chatBox.innerHTML += `<p><b>You:</b> ${userMessage}</p>`;
  input.value = "";

  // Send to backend
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userMessage }),
  });

  const data = await response.json();

  // Show bot's reply
  chatBox.innerHTML += `<p><b>Bot:</b> ${data.reply}</p>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}
