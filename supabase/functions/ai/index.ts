// Shared Gemini proxy. Keep GEMINI_API_KEY in Supabase secrets, never in frontend code.
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = 'gemini-2.5-flash';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>;
};

function json(body: object, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (request.method !== 'POST') return json({ error: 'Use a POST request.' }, 405);

  try {
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return json({ error: 'AI is not configured yet. Add the Gemini secret and deploy this function.' }, 503);
    }

    const body = await request.json() as { prompt?: unknown; system?: unknown; json?: unknown };
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const system = typeof body.system === 'string' ? body.system.trim() : '';
    if (!prompt) return json({ error: 'Write a message for Sidekick.' }, 400);
    if (prompt.length > 20_000 || system.length > 6_000) return json({ error: 'The request is too long.' }, 400);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: body.json === true ? { responseMimeType: 'application/json' } : undefined,
        }),
      },
    );

    const data = await response.json() as GeminiResponse;
    if (!response.ok) {
      console.error('Gemini request failed', response.status, data);
      return json({ error: 'Sidekick could not answer right now. Please try again.' }, 502);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string' || !text.trim()) return json({ error: 'Sidekick returned an empty answer.' }, 502);
    return json({ text });
  } catch (error) {
    console.error('AI function failed', error);
    return json({ error: 'Could not reach Sidekick. Please try again.' }, 500);
  }
});
