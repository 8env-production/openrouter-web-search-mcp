import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import {
  getApiKeyFromContext,
  getHttpProxyFromContext,
  getHttpsProxyFromContext,
  getModelFromContext,
} from '../context/requestContext.js';

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const DEFAULT_MODEL = 'openai/gpt-4o-mini:online';
export const DEFAULT_PLUGIN_ID = 'web';
export const REQUEST_TIMEOUT_MS = 60000;
export const MAX_REDIRECTS = 5;

function toOptionalString(value) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function resolveApiKey() {
  const apiKey = getApiKeyFromContext();

  if (!apiKey) {
    throw new Error('Missing OPENROUTER_API_KEY. Provide it via Authorization header.');
  }

  return apiKey;
}

function resolveProxyUrl() {
  const contextHttpsProxy = getHttpsProxyFromContext();
  const contextHttpProxy = getHttpProxyFromContext();

  const resolvedHttpsProxy = toOptionalString(contextHttpsProxy);
  const resolvedHttpProxy = toOptionalString(contextHttpProxy);

  if (OPENROUTER_API_URL.startsWith('https://')) {
    return resolvedHttpsProxy ?? resolvedHttpProxy;
  }

  return resolvedHttpProxy ?? resolvedHttpsProxy;
}

export function createPayload(query) {
  const contextModel = getModelFromContext();
  const model = toOptionalString(contextModel) ?? DEFAULT_MODEL;

  return {
    model,
    messages: [{ role: 'user', content: query }],
    plugins: [{ id: DEFAULT_PLUGIN_ID }],
  };
}

export function createRequestConfig() {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resolveApiKey()}`,
    },
    maxRedirects: MAX_REDIRECTS,
    timeout: REQUEST_TIMEOUT_MS,
  };

  const proxyUrl = resolveProxyUrl();

  if (proxyUrl) {
    console.log(`Configuring proxy: ${proxyUrl}`);

    if (OPENROUTER_API_URL.startsWith('https://')) {
      config.httpsAgent = new HttpsProxyAgent(proxyUrl);
    } else {
      config.httpAgent = new HttpProxyAgent(proxyUrl);
    }

    config.proxy = false;
  }

  return config;
}
