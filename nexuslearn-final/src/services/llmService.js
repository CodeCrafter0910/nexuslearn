const OpenAI = require('openai');

let client = null;

const getClient = () => {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
};

const summarizeText = async (text) => {
  const openai = getClient();

  const res = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a summarization assistant. Summarize the given text into 3 to 6 concise bullet points. Each bullet should be one clear sentence. Return only the bullet points with no intro or extra text.',
      },
      {
        role: 'user',
        content: `Summarize this:\n\n${text}`,
      },
    ],
    max_tokens: 300,
    temperature: 0.4,
  });

  return {
    summary: res.choices[0]?.message?.content?.trim(),
    model: res.model,
  };
};

module.exports = { summarizeText };
