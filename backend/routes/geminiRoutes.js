import express from 'express';

const router = express.Router();
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_GEMINI_MODELS = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];

function getGeminiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    process.env.VITE_GEMINI_API_KEY?.trim()
  );
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item?.role && Array.isArray(item.parts))
    .map((item) => ({
      role: item.role === 'assistant' ? 'model' : item.role,
      parts: item.parts
        .filter((part) => typeof part?.text === 'string')
        .map((part) => ({ text: part.text })),
    }))
    .filter((item) => item.parts.length > 0);
}

function getGeminiModels() {
  const configured =
    process.env.GEMINI_MODELS?.trim() ||
    process.env.GEMINI_MODEL?.trim() ||
    process.env.VITE_GEMINI_MODEL?.trim() ||
    '';
  const models = configured
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  for (const model of DEFAULT_GEMINI_MODELS) {
    if (!models.includes(model)) {
      models.push(model);
    }
  }

  return models;
}

router.post('/ask', async (req, res) => {
  const prompt = String(req.body?.prompt ?? '').trim();
  if (!prompt) {
    res.status(400).json({ detail: 'Prompt is required.' });
    return;
  }

  const apiKey = getGeminiKey();
  if (!apiKey) {
    res.status(500).json({
      detail:
        'Gemini API key is missing. Add GEMINI_API_KEY or VITE_GEMINI_API_KEY to the root .env file.',
    });
    return;
  }

  const contents = [
    ...normalizeHistory(req.body?.history),
    { role: 'user', parts: [{ text: prompt }] },
  ];

  try {
    let lastDetail = 'Gemini request failed.';

    for (const model of getGeminiModels()) {
      const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text:
                  'You are Expenzo Financial Agent, a helpful and professional financial advisor. Help users analyze spending, set budgets, reduce debt, grow savings, and make practical financial decisions. Keep answers concise, actionable, and encouraging.',
              },
            ],
          },
          contents,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        lastDetail = data?.error?.message || `Gemini request failed for ${model}.`;
        continue;
      }

      const answer = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text)
        .filter(Boolean)
        .join('\n')
        .trim();

      if (answer) {
        res.json({ answer });
        return;
      }

      lastDetail = `Gemini returned an empty answer from ${model}.`;
    }

    res.json({
      answer: buildLocalFinancialAnswer(prompt),
    });
  } catch (error) {
    console.error('Gemini route error:', error);
    res.status(503).json({
      detail: "I'm having trouble connecting to Gemini right now. Please try again later.",
    });
  }
});

function buildLocalFinancialAnswer(prompt) {
  return [
    "Here is a practical financial answer you can use right now.",
    "",
    `For your question: "${prompt}"`,
    "",
    "1. List your monthly income, fixed expenses, flexible spending, debt payments, and current savings.",
    "2. Put essentials first, then set a realistic savings target before optional spending.",
    "3. If debt is involved, pay minimums on all debts and send extra money to the highest-interest balance first.",
    "4. Review the plan every week and adjust categories that repeatedly go over budget.",
  ].join('\n');
}

export default router;
