type ChatHistoryItem = {
  role: string;
  parts: Array<{ text: string }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function askFinancialAgent(prompt: string, history: ChatHistoryItem[] = []) {
  const response = await fetch(`${API_BASE_URL}/agent/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      history,
    }),
  });

  if (!response.ok) {
    const details = await response.json().catch(() => ({}));
    throw new Error(
      details?.detail ??
        "I'm sorry, I'm having trouble connecting to the financial agent right now. Please try again later.",
    );
  }

  const data = await response.json();
  return data?.answer ?? "I couldn't generate a response for that question. Please try rephrasing it.";
}
