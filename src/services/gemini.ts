import { Product } from '../types/product';
import { ChatMessage } from '../types/chat';

const API_KEY_STORAGE = 'mitchell_gemini_api_key';
const ACTIVE_MODEL_STORAGE = 'mitchell_active_gemini_model';

// Candidate models in priority order to guarantee support for all API keys
export const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

export function getStoredApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || '';
  } catch {
    return '';
  }
}

export function saveApiKey(key: string): void {
  try {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
    // Reset cached model when key changes so new key is re-verified
    localStorage.removeItem(ACTIVE_MODEL_STORAGE);
  } catch (e) {
    console.error('Failed to save API key to localStorage', e);
  }
}

export function removeApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE);
    localStorage.removeItem(ACTIVE_MODEL_STORAGE);
  } catch (e) {
    console.error('Failed to remove API key from localStorage', e);
  }
}

export function getCachedModel(): string {
  try {
    return localStorage.getItem(ACTIVE_MODEL_STORAGE) || CANDIDATE_MODELS[0];
  } catch {
    return CANDIDATE_MODELS[0];
  }
}

export function setCachedModel(model: string): void {
  try {
    localStorage.setItem(ACTIVE_MODEL_STORAGE, model);
  } catch {
    // ignore
  }
}

/**
 * Ultra-fast Realtime Streaming Gemini Barista
 * Supports all API keys with automatic model fallback cascade and SSE streaming.
 */
export async function streamGeminiBarista(
  apiKey: string,
  messages: ChatMessage[],
  products: Product[],
  onChunk: (accumulatedText: string, activeModel: string) => void
): Promise<{ text: string; model: string }> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error('กรุณากรอก Google Gemini API Key เพื่อเริ่มใช้งาน');
  }

  // Concise menu context for sub-second TTFT (Time To First Token)
  const catalogContext = products
    .map(
      (p) =>
        `- ${p.name} ($${Number(p.price).toFixed(2)}) [${p.category}]: ${
          p.is_available ? 'In Stock' : 'SOLD OUT'
        }. ${p.description || ''}`
    )
    .join('\n');

  const systemPrompt = `You are Mitchell AI Barista, the witty, warm, and expert sommelier of Mitchell Cafe & Artisan Kitchen.
LIVE MENU:
${catalogContext}

INSTRUCTIONS:
1. Speak in the customer's language (Default: polite, stylish Thai with ครับ/ค่ะ).
2. Answer concisely and quickly. Keep replies under 2-3 short paragraphs or bullet points.
3. If an item is SOLD OUT, politely mention it and recommend an in-stock alternative.
4. Bold item names and prices (e.g. **Mitchell Signature Dirty** ($145.00)).`;

  // Only take the last 6 messages to keep latency minimal
  const recentMessages = messages.slice(-6);
  const contents = recentMessages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents,
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 500,
    },
  };

  // Reorder candidate models to try the cached working model first
  const cachedModel = getCachedModel();
  const modelsToTry = [
    cachedModel,
    ...CANDIDATE_MODELS.filter((m) => m !== cachedModel),
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const sseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${cleanKey}`;

      const response = await fetch(sseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const status = response.status;
        const msg = errorData?.error?.message || response.statusText;

        // If model not found or forbidden, continue to next model in cascade
        if (status === 404 || msg.includes('not found') || msg.includes('not supported')) {
          console.warn(`Model ${model} not available for this key, falling back to next model...`);
          lastError = new Error(`Model ${model} not supported.`);
          continue;
        }

        // Invalid API Key error
        if (status === 400 && (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid'))) {
          throw new Error('API Key ไม่ถูกต้อง กรุณาตรวจสอบจาก https://aistudio.google.com/api-keys');
        }

        if (status === 429) {
          throw new Error('Google Gemini API Rate Limit: ขออภัยครับ โควตาคำขอเต็มชั่วคราว กรุณารอสักครู่แล้วลองใหม่');
        }

        throw new Error(msg || `Gemini Error (${status})`);
      }

      // Read SSE stream in real-time
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Streaming response body is unavailable.');
      }

      const decoder = new TextDecoder('utf-8');
      let accumulated = '';
      let buffer = '';

      // Remember successful model for future instant calls
      setCachedModel(model);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonText = trimmed.slice(6);
            if (!jsonText || jsonText === '[DONE]') continue;

            try {
              const data = JSON.parse(jsonText);
              const chunk = data?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (chunk) {
                accumulated += chunk;
                onChunk(accumulated, model);
              }
            } catch {
              // Ignore partial JSON parse errors
            }
          }
        }
      }

      if (accumulated.trim()) {
        return { text: accumulated, model };
      }

      // If streaming produced no text, try next model
      continue;
    } catch (err: any) {
      if (err?.message?.includes('API Key ไม่ถูกต้อง') || err?.message?.includes('Rate Limit')) {
        throw err;
      }
      lastError = err;
      console.warn(`Error streaming with model ${model}:`, err);
    }
  }

  throw lastError || new Error('ไม่สามารถเชื่อมต่อกับโมเดล Gemini ได้ กรุณาตรวจสอบ API Key ของคุณ');
}
