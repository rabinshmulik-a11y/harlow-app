export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { system, messages } = req.body;

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.Groqharlow}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: system || 'You are a helpful assistant.'
            },
            ...(messages || [])
          ],
          max_tokens: 1000
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || data
      });
    }

    return res.status(200).json({
      content: data.choices?.[0]?.message?.content || ''
    });

  } catch (err) {
    return res.status(500).json({
      error: 'API error',
      detail: err.message
    });
  }
}
