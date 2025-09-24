export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userMessage } = req.body;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userMessage } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't understand.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, // 🔑 API key from Vercel env
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I didn't understand.";

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}

