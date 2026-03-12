import { json, methodNotAllowed } from './_lib/http.js';
import { bumpUsage, getUsage } from './_lib/flex-store.js';

const MODEL_CONFIG = {
  'fazon-realistic-pro': {
    keySlots: [1, 2, 3],
    systemPrompt:
      'You are Fazon Realistic Pro. Use Gemini Flash Image (Nano Banana 2 style capability) to generate extremely realistic, physically plausible images with premium camera lighting and highly detailed textures. Support text prompts and local reference image conditioning.',
    supportsImageInput: true
  },
  'fazon-photography': {
    keySlots: [4, 5],
    systemPrompt:
      'You are Fazon Photography. Create aesthetically optimized images with excellent composition, mood, and editorial-quality visual storytelling. Text-only generation.',
    supportsImageInput: false
  },
  'nano-banana-pro': {
    keySlots: [6, 7],
    systemPrompt:
      'You are Nano Banana Pro. Generate high-quality general images and perform edits from local image references. Keep results sharp, balanced, and visually clean.',
    supportsImageInput: true
  }
};

const FALLBACK_KEY_SLOTS = [8, 9];

function readGeminiKey(slot) {
  return process.env[`GEMINI_KEY_${slot}`] || '';
}

function pickKey(model) {
  const config = MODEL_CONFIG[model];
  if (!config) return null;

  const usage = getUsage(model);
  const rotation = Math.floor(usage / 100);
  const primarySlot = config.keySlots[rotation % config.keySlots.length];
  const primaryKey = readGeminiKey(primarySlot);
  if (primaryKey) return { keySlot: primarySlot, apiKey: primaryKey };

  for (const slot of FALLBACK_KEY_SLOTS) {
    const fallbackKey = readGeminiKey(slot);
    if (fallbackKey) return { keySlot: slot, apiKey: fallbackKey };
  }

  return null;
}

function parseDataUrl(dataUrl) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

function buildGeminiPayload({ prompt, styleNotes, aspectRatio, referenceImage, model }) {
  const cfg = MODEL_CONFIG[model];
  const parts = [
    {
      text: `${cfg.systemPrompt}\nAspect ratio: ${aspectRatio}\nPrompt: ${prompt}\nStyle instructions: ${styleNotes || 'none'}`
    }
  ];

  if (cfg.supportsImageInput && referenceImage) {
    const inline = parseDataUrl(referenceImage);
    if (inline) {
      parts.push({ inlineData: inline });
    }
  }

  return {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE']
    }
  };
}

function extractImageUrl(data) {
  const candidates = data?.candidates || [];
  for (const candidate of candidates) {
    for (const part of candidate?.content?.parts || []) {
      if (part.inlineData?.mimeType?.startsWith('image/') && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  }
  return '';
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const { model, prompt, styleNotes, aspectRatio, referenceImage } = JSON.parse(event.body || '{}');
  if (!MODEL_CONFIG[model]) return json(400, { message: 'Unsupported model.' });
  if (!prompt) return json(400, { message: 'Prompt is required.' });

  const picked = pickKey(model);
  if (!picked?.apiKey) {
    return json(200, {
      message: 'Gemini keys are not configured yet; configure GEMINI_KEY_1..9 in Netlify secrets.',
      imageUrl: ''
    });
  }

  const payload = buildGeminiPayload({ model, prompt, styleNotes, aspectRatio, referenceImage });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${picked.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return json(502, { message: `Gemini request failed: ${errorText.slice(0, 200)}` });
    }

    const data = await response.json();
    const imageUrl = extractImageUrl(data);
    bumpUsage(model);

    return json(200, {
      message: `Generated with key slot ${picked.keySlot}. Key slot changes every 100 generations.`,
      imageUrl
    });
  } catch (error) {
    return json(500, { message: `Generation failed: ${error.message}` });
  }
}
