import { Product } from '../types/product';
import { ChatMessage } from '../types/chat';

const API_KEY_STORAGE = 'mitchell_gemini_api_key';

// Target the official active model: gemini-3.8-flash
export const TARGET_MODEL = 'gemini-3.8-flash';

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
    // Clear any legacy cached model keys
    localStorage.removeItem('mitchell_active_gemini_model');
  } catch (e) {
    console.error('Failed to save API key to localStorage', e);
  }
}

export function removeApiKey(): void {
  try {
    localStorage.removeItem(API_KEY_STORAGE);
    localStorage.removeItem('mitchell_active_gemini_model');
  } catch (e) {
    console.error('Failed to remove API key from localStorage', e);
  }
}

/**
 * Ultra-fast Realtime Streaming Gemini Barista using models/gemini-3.8-flash
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

  const systemPrompt = `You are Mitchell AI Barista, the virtual sommelier of Mitchell Cafe & Artisan Kitchen.
LIVE MENU:
${catalogContext}

INSTRUCTIONS:
1. Speak in the customer's language (Default: polite Thai with ครับ/ค่ะ).
2. Answer concisely and quickly (under 2-3 short paragraphs or bullet points).
3. If an item is SOLD OUT, politely explain it and recommend an in-stock alternative.
4. Bold item names and prices (e.g. **Mitchell Signature Dirty** ($145.00)).`;

  // Use recent 6 messages to keep latency minimal
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
      maxOutputTokens: 600,
    },
  };

  const model = TARGET_MODEL;
  const headers = {
    'Content-Type': 'application/json',
    'x-goog-api-key': cleanKey,
  };

  // 1. Try real-time streaming endpoint first
  try {
    const sseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${cleanKey}`;
    const response = await fetch(sseUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let buffer = '';

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
                // Ignore partial JSON chunks
              }
            }
          }
        }

        if (accumulated.trim()) {
          return { text: accumulated, model };
        }
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData?.error?.message || response.statusText;
      console.warn('Streaming error, falling back to generateContent:', msg);

      // If key is invalid or quota exceeded, throw the actual Google message directly
      if (response.status === 400 && (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid'))) {
        throw new Error('API Key ไม่ถูกต้อง กรุณาตรวจสอบจาก https://aistudio.google.com/api-keys');
      }
      if (response.status === 429) {
        throw new Error('Google Gemini API Rate Limit: โควตาคำขอเต็มชั่วคราว กรุณารอสักครู่แล้วลองใหม่');
      }
    }
  } catch (streamErr: any) {
    if (streamErr?.message?.includes('API Key ไม่ถูกต้อง') || streamErr?.message?.includes('Rate Limit')) {
      throw streamErr;
    }
    console.warn('Stream failed, trying standard generateContent fallback...', streamErr);
  }

  // 2. Fallback to standard generateContent if streaming encounters network/CORS issues
  const standardUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
  const stdResponse = await fetch(standardUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const stdData = await stdResponse.json().catch(() => ({}));

  if (!stdResponse.ok) {
    const errorMsg = stdData?.error?.message || `Google API Error (${stdResponse.status})`;
    if (stdResponse.status === 400 && (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('API key not valid'))) {
      throw new Error('API Key ไม่ถูกต้อง กรุณาตรวจสอบจาก https://aistudio.google.com/api-keys');
    }
    if (stdResponse.status === 429) {
      throw new Error('Google Gemini API Rate Limit: โควตาคำขอเต็มชั่วคราว กรุณารอสักครู่แล้วลองใหม่');
    }
    throw new Error(errorMsg);
  }

  const generatedText = stdData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!generatedText) {
    throw new Error('ไม่พบคำตอบจาก Gemini โปรดลองพิมพ์คำถามใหม่อีกครั้ง');
  }

  onChunk(generatedText, model);
  return { text: generatedText, model };
}
