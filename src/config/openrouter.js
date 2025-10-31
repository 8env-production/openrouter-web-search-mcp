import { HttpProxyAgent } from 'http-proxy-agent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { getApiKeyFromContext } from '../context/requestContext.js';

export const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const DEFAULT_MODEL = 'openai/gpt-4o-mini:online';
export const DEFAULT_PLUGIN_ID = 'web';
export const REQUEST_TIMEOUT_MS = 60000;
export const MAX_REDIRECTS = 5;

const HTTP_REFERER = 'https://memorina.app';
const CLIENT_TITLE = 'Memorina';

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

function resolveProxyUrl({ httpsProxy, httpProxy } = {}) {
  const resolvedHttpsProxy =
    toOptionalString(httpsProxy) ?? toOptionalString(process.env.HTTPS_PROXY);
  const resolvedHttpProxy = toOptionalString(httpProxy) ?? toOptionalString(process.env.HTTP_PROXY);

  if (OPENROUTER_API_URL.startsWith('https://')) {
    return resolvedHttpsProxy ?? resolvedHttpProxy;
  }

  return resolvedHttpProxy ?? resolvedHttpsProxy;
}

export function createPayload(query, overrides = {}) {
  const { model = DEFAULT_MODEL, pluginId = DEFAULT_PLUGIN_ID } = overrides;

  return {
    model,
    messages: [{ role: 'user', content: query }],
    plugins: [{ id: pluginId }],
  };
}

export function createRequestConfig(overrides = {}) {
  const {
    httpProxy,
    httpsProxy,
    timeoutMs = REQUEST_TIMEOUT_MS,
    maxRedirects = MAX_REDIRECTS,
  } = overrides;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resolveApiKey()}`,
      'HTTP-Referer': HTTP_REFERER,
      'X-Title': CLIENT_TITLE,
    },
    maxRedirects,
    timeout: timeoutMs,
  };

  const proxyUrl = resolveProxyUrl({ httpsProxy, httpProxy });

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
