export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userMessage } = req.body;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();

    // ✅ Fix: check that data.choices exists before using
    if (data.choices && data.choices.length > 0) {
      return res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      console.error("OpenAI error:", data);
      return res.status(500).json({ reply: "Sorry, I couldn't generate a reply." });
    }
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ reply: "Something went wrong on the server." });
  }
}
