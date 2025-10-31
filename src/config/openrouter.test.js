import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as requestContext from '../context/requestContext.js';
import {
  createPayload,
  createRequestConfig,
  DEFAULT_MODEL,
  DEFAULT_PLUGIN_ID,
  MAX_REDIRECTS,
  OPENROUTER_API_URL,
  REQUEST_TIMEOUT_MS,
} from './openrouter.js';

vi.mock('../context/requestContext.js');

describe('openrouter config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createPayload', () => {
    it('должен создавать payload с дефолтными значениями', () => {
      requestContext.getModelFromContext.mockReturnValue(undefined);
      const query = 'test query';
      const payload = createPayload(query);

      expect(payload).toEqual({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: query }],
        plugins: [{ id: DEFAULT_PLUGIN_ID }],
      });
    });

    it('должен использовать модель из контекста', () => {
      const query = 'test query';
      const model = 'openai/gpt-4';
      requestContext.getModelFromContext.mockReturnValue(model);
      const payload = createPayload(query);

      expect(payload.model).toBe(model);
    });

    it('должен игнорировать пустые строки для model из контекста', () => {
      requestContext.getModelFromContext.mockReturnValue('   ');
      const query = 'test query';
      const payload = createPayload(query);

      expect(payload.model).toBe(DEFAULT_MODEL);
    });
  });

  describe('createRequestConfig', () => {
    beforeEach(() => {
      requestContext.getHttpProxyFromContext.mockReturnValue(undefined);
      requestContext.getHttpsProxyFromContext.mockReturnValue(undefined);
    });

    it('должен создавать конфиг с дефолтными значениями', () => {
      requestContext.getApiKeyFromContext.mockReturnValue('test-api-key');
      const config = createRequestConfig();

      expect(config.headers).toHaveProperty('Content-Type', 'application/json');
      expect(config.headers).toHaveProperty('Authorization', 'Bearer test-api-key');
      expect(config.timeout).toBe(REQUEST_TIMEOUT_MS);
      expect(config.maxRedirects).toBe(MAX_REDIRECTS);
    });

    it('должен использовать API key из контекста', () => {
      const apiKey = 'context-api-key';
      requestContext.getApiKeyFromContext.mockReturnValue(apiKey);
      const config = createRequestConfig();

      expect(config.headers.Authorization).toBe(`Bearer ${apiKey}`);
    });

    it('должен выбрасывать ошибку если нет API ключа в контексте', () => {
      requestContext.getApiKeyFromContext.mockReturnValue(undefined);

      expect(() => createRequestConfig()).toThrow('Missing OPENROUTER_API_KEY');
    });

    it('должен настраивать HTTPS прокси для HTTPS URL из контекста', () => {
      requestContext.getApiKeyFromContext.mockReturnValue('test-api-key');
      requestContext.getHttpsProxyFromContext.mockReturnValue('http://proxy.example:3128');
      const config = createRequestConfig();

      expect(config.httpsAgent).toBeDefined();
      expect(config.proxy).toBe(false);
    });

    it('должен игнорировать пустые строки для прокси из контекста', () => {
      requestContext.getApiKeyFromContext.mockReturnValue('test-api-key');
      requestContext.getHttpsProxyFromContext.mockReturnValue('   ');
      const config = createRequestConfig();

      expect(config.httpsAgent).toBeUndefined();
      expect(config.httpAgent).toBeUndefined();
    });
  });

  describe('константы', () => {
    it('должен иметь корректные константы', () => {
      expect(OPENROUTER_API_URL).toBe('https://openrouter.ai/api/v1/chat/completions');
      expect(DEFAULT_MODEL).toBe('openai/gpt-4o-mini:online');
      expect(DEFAULT_PLUGIN_ID).toBe('web');
      expect(REQUEST_TIMEOUT_MS).toBe(60000);
      expect(MAX_REDIRECTS).toBe(5);
    });
  });
});
