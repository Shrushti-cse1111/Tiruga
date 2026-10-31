import { GoogleGenAI } from '@google/genai';
import { config } from '../config';
import { ApiResponse, ValidationResult } from '../../src/shared/aiTypes';

export interface CallGeminiJsonOptions<T> {
  feature: string;
  systemPrompt: string;
  payload: string;
  responseSchema?: any;
  validate: (parsed: any) => ValidationResult<T>;
  forceInvalid?: boolean;
}

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  if (!config.geminiApiKey || !config.geminiApiKey.trim()) {
    return null;
  }
  aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  return aiClient;
}

/**
 * Strips stray markdown fences and extra whitespace around JSON output.
 */
function cleanJsonText(raw: string): string {
  let text = raw.trim();
  if (text.startsWith('```json')) {
    text = text.slice(7);
  } else if (text.startsWith('```')) {
    text = text.slice(3);
  }
  if (text.endsWith('```')) {
    text = text.slice(0, -3);
  }
  return text.trim();
}

/**
 * Calls Gemini with structured JSON output, official SDK, 25-second timeout,
 * automatic single retry on validation error or 429/5xx, and strict validation.
 */
export async function callGeminiJson<T>(
  options: CallGeminiJsonOptions<T>
): Promise<ApiResponse<T>> {
  const { feature, systemPrompt, payload, responseSchema, validate, forceInvalid } = options;
  const startTime = Date.now();

  // 1. Check required configuration
  if (!config.geminiApiKey || !config.geminiModel) {
    return {
      ok: false,
      error: {
        code: 'NOT_CONFIGURED',
        message: 'Gemini AI is not configured. Please check GEMINI_API_KEY and GEMINI_MODEL.',
        retryable: false
      }
    };
  }

  const ai = getAiClient();
  if (!ai) {
    return {
      ok: false,
      error: {
        code: 'NOT_CONFIGURED',
        message: 'Gemini AI client initialization failed.',
        retryable: false
      }
    };
  }

  const isDev = config.nodeEnv !== 'production';
  const shouldForceInvalid = isDev && (process.env.AI_FORCE_INVALID === 'true' || Boolean(forceInvalid));

  let attempts: 1 | 2 = 1;
  let lastErrors: string[] = [];

  // Helper to run generateContent with 25s timeout and transient 429/5xx retry
  const executeGeneration = async (promptText: string): Promise<string> => {
    let callAttempt = 1;
    while (callAttempt <= 2) {
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 25000);

      try {
        const genConfig: any = {
          systemInstruction: systemPrompt,
          temperature: 0.4,
          responseMimeType: 'application/json'
        };

        if (responseSchema) {
          genConfig.responseSchema = responseSchema;
        }

        const responsePromise = ai.models.generateContent({
          model: config.geminiModel,
          contents: promptText,
          config: genConfig
        });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT_ERROR')), 25000);
        });

        const response: any = await Promise.race([responsePromise, timeoutPromise]);
        clearTimeout(timeoutId);

        const rawText = response.text ? response.text : (response.candidates?.[0]?.content?.parts?.[0]?.text || '');
        return rawText;
      } catch (err: any) {
        clearTimeout(timeoutId);
        const errMessage = err?.message || String(err);

        if (errMessage.includes('TIMEOUT_ERROR') || abortController.signal.aborted) {
          throw new Error('TIMEOUT_ERROR');
        }

        const isTransient =
          errMessage.includes('429') ||
          errMessage.includes('RESOURCE_EXHAUSTED') ||
          errMessage.includes('500') ||
          errMessage.includes('503') ||
          errMessage.includes('UNAVAILABLE');

        if (isTransient && callAttempt === 1) {
          callAttempt++;
          await new Promise((r) => setTimeout(r, 1000));
          continue;
        }

        throw err;
      }
    }
    throw new Error('AI_UNAVAILABLE');
  };

  try {
    // Attempt 1
    let rawOutput = '';
    try {
      rawOutput = await executeGeneration(payload);
    } catch (genErr: any) {
      const latency = Date.now() - startTime;
      if (genErr?.message === 'TIMEOUT_ERROR') {
        console.log(JSON.stringify({ timestamp: new Date().toISOString(), feature, attempts: 1, error: 'TIMEOUT', latencyMs: latency }));
        return {
          ok: false,
          error: {
            code: 'TIMEOUT',
            message: 'AI request timed out. Please try again.',
            retryable: true
          }
        };
      }
      console.log(JSON.stringify({ timestamp: new Date().toISOString(), feature, attempts: 1, error: 'AI_UNAVAILABLE', latencyMs: latency }));
      return {
        ok: false,
        error: {
          code: 'AI_UNAVAILABLE',
          message: 'AI service is temporarily unavailable. Please try again.',
          retryable: true
        }
      };
    }

    let parsed: any;
    try {
      parsed = JSON.parse(cleanJsonText(rawOutput));
    } catch {
      parsed = null;
    }

    if (shouldForceInvalid) {
      parsed = { invalidTest: true };
    }

    let validation = parsed ? validate(parsed) : { valid: false, errors: ['Output was not valid JSON'] };

    if (validation.valid && validation.data) {
      const latency = Date.now() - startTime;
      console.log(JSON.stringify({ timestamp: new Date().toISOString(), feature, attempts: 1, validationErrors: [], latencyMs: latency }));
      return {
        ok: true,
        data: validation.data,
        meta: {
          model: config.geminiModel,
          generatedAt: new Date().toISOString(),
          attempts: 1,
          costsAreEstimated: true,
          latencyMs: latency
        }
      };
    }

    // Attempt 2: retry appending previous errors
    attempts = 2;
    lastErrors = validation.errors;
    const correctionPrompt = `${payload}\n\nYour previous output was invalid for these reasons:\n${validation.errors.join('\n')}\nReturn corrected JSON only.`;

    try {
      rawOutput = await executeGeneration(correctionPrompt);
    } catch (genErr: any) {
      const latency = Date.now() - startTime;
      if (genErr?.message === 'TIMEOUT_ERROR') {
        return {
          ok: false,
          error: {
            code: 'TIMEOUT',
            message: 'AI request timed out during retry.',
            retryable: true
          }
        };
      }
      return {
        ok: false,
        error: {
          code: 'AI_UNAVAILABLE',
          message: 'AI service is temporarily unavailable.',
          retryable: true
        }
      };
    }

    try {
      parsed = JSON.parse(cleanJsonText(rawOutput));
    } catch {
      parsed = null;
    }

    if (shouldForceInvalid) {
      parsed = { invalidTestAttemptTwo: true };
    }

    validation = parsed ? validate(parsed) : { valid: false, errors: ['Output was not valid JSON on retry'] };

    const latency = Date.now() - startTime;
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), feature, attempts: 2, validationErrors: validation.errors, latencyMs: latency }));

    if (validation.valid && validation.data) {
      return {
        ok: true,
        data: validation.data,
        meta: {
          model: config.geminiModel,
          generatedAt: new Date().toISOString(),
          attempts: 2,
          costsAreEstimated: true,
          latencyMs: latency
        }
      };
    }

    // Never return unvalidated data
    return {
      ok: false,
      error: {
        code: 'AI_INVALID_OUTPUT',
        message: "Tiruga couldn't generate this right now. Please try again.",
        retryable: true,
        errors: validation.errors
      }
    };
  } catch (err: any) {
    const latency = Date.now() - startTime;
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), feature, attempts, error: err?.message || 'UNKNOWN', latencyMs: latency }));
    return {
      ok: false,
      error: {
        code: 'AI_UNAVAILABLE',
        message: 'An unexpected AI error occurred. Please try again.',
        retryable: true
      }
    };
  }
}
