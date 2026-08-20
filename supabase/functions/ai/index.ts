// Shared Gemini proxy. Keep GEMINI_API_KEY in Supabase secrets, never in frontend code.
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const MODEL = 'gemini-2.5-flash';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>;
  error?: { status?: unknown };
};

const retryableStatuses = new Set([429, 500, 502, 503, 504]);

async function askGemini(requestBody: object) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  let response: Response | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(25_000),
      });
      if (!retryableStatuses.has(response.status) || attempt === 2) return response;
    } catch (error) {
      if (attempt === 2) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
  }

  return response as Response;
}

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
    const body = await request.json() as { prompt?: unknown; system?: unknown; json?: unknown; image?: { mimeType?: unknown; data?: unknown } };
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      const message = 'Sidekick is installed, but its Gemini key has not been connected yet. Add GEMINI_API_KEY to activate AI answers.';
      const text = body.json === true
        ? JSON.stringify({ reply: message, action: { type: 'none' } })
        : message;
      return json({ text });
    }

    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const system = typeof body.system === 'string' ? body.system.trim() : '';
    const mimeType = typeof body.image?.mimeType === 'string' ? body.image.mimeType : '';
    const imageData = typeof body.image?.data === 'string' ? body.image.data : '';
    if (!prompt) return json({ error: 'Write a message for Sidekick.' }, 400);
    if (prompt.length > 20_000 || system.length > 6_000) return json({ error: 'The request is too long.' }, 400);
    if (imageData && (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType) || imageData.length > 8_000_000)) return json({ error: 'The room photo is too large or unsupported.' }, 400);

    const response = await askGemini({
      systemInstruction: system ? { parts: [{ text: system }] } : undefined,
      contents: [{ parts: [...(imageData ? [{ inlineData: { mimeType, data: imageData } }] : []), { text: prompt }] }],
      generationConfig: body.json === true ? {
        responseMimeType: 'application/json',
        temperature: 0.25,
        maxOutputTokens: 1_200,
        responseJsonSchema: {
          type: 'object',
          required: ['reply', 'action'],
          properties: {
            reply: { type: 'string' },
            action: {
              type: 'object', required: ['type'], additionalProperties: false,
              properties: {
                type: { type: 'string', enum: ['none', 'create_todo', 'create_todos', 'complete_todo', 'delete_todo', 'create_event', 'delete_event'] },
                title: { type: 'string' }, dueDate: { type: ['string', 'null'] }, memberId: { type: ['string', 'null'] },
                priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] }, starValue: { type: 'integer', minimum: 1, maximum: 5 },
                todoId: { type: 'string' }, eventId: { type: 'string' }, startTime: { type: 'string' }, endTime: { type: 'string' }, location: { type: 'string' },
                items: { type: 'array', maxItems: 10, items: { type: 'object', required: ['title', 'dueDate', 'memberId', 'priority', 'starValue'], properties: { title: { type: 'string' }, dueDate: { type: ['string', 'null'] }, memberId: { type: ['string', 'null'] }, priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] }, starValue: { type: 'integer', minimum: 1, maximum: 5 } } } },
              },
            },
          },
        },
      } : { temperature: 0.45, maxOutputTokens: 1_200 },
    });

    const data = await response.json() as GeminiResponse;
    if (!response.ok) {
      console.error('Gemini request failed', response.status, data.error?.status);
      const overloaded = response.status === 429 || response.status === 503;
      return json({ error: overloaded ? 'Sidekick is busy right now. Wait a moment and try again.' : 'Sidekick could not answer right now. Please try again.' }, overloaded ? 503 : 502);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string' || !text.trim()) return json({ error: 'Sidekick returned an empty answer.' }, 502);
    return json({ text });
  } catch (error) {
    console.error('AI function failed', error);
    return json({ error: 'Could not reach Sidekick. Please try again.' }, 500);
  }
});
