import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  OPENROUTER_API_URL,
  DEFAULT_MODEL,
  DEFAULT_PLUGIN_ID,
  REQUEST_TIMEOUT_MS,
  MAX_REDIRECTS,
  createPayload,
  createRequestConfig,
} from './openrouter.js';

describe('openrouter config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('createPayload', () => {
    it('должен создавать payload с дефолтными значениями', () => {
      const query = 'test query';
      const payload = createPayload(query);

      expect(payload).toEqual({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: query }],
        plugins: [{ id: DEFAULT_PLUGIN_ID }],
      });
    });

    it('должен использовать кастомную модель', () => {
      const query = 'test query';
      const model = 'openai/gpt-4';
      const payload = createPayload(query, { model });

      expect(payload.model).toBe(model);
    });

    it('должен использовать кастомный pluginId', () => {
      const query = 'test query';
      const pluginId = 'custom-plugin';
      const payload = createPayload(query, { pluginId });

      expect(payload.plugins[0].id).toBe(pluginId);
    });

    it('должен игнорировать лишние параметры в overrides', () => {
      const query = 'test query';
      const payload = createPayload(query, { extraParam: 'value' });

      expect(payload).toEqual({
        model: DEFAULT_MODEL,
        messages: [{ role: 'user', content: query }],
        plugins: [{ id: DEFAULT_PLUGIN_ID }],
      });
    });
  });

  describe('createRequestConfig', () => {
    it('должен создавать конфиг с дефолтными значениями', () => {
      process.env.OPENROUTER_API_KEY = 'test-api-key';
      const config = createRequestConfig({});

      expect(config.headers).toHaveProperty('Content-Type', 'application/json');
      expect(config.headers).toHaveProperty('Authorization', 'Bearer test-api-key');
      expect(config.timeout).toBe(REQUEST_TIMEOUT_MS);
      expect(config.maxRedirects).toBe(MAX_REDIRECTS);
    });

    it('должен использовать переданный apiKey', () => {
      const apiKey = 'custom-api-key';
      const config = createRequestConfig({ apiKey });

      expect(config.headers.Authorization).toBe(`Bearer ${apiKey}`);
    });

    it('должен выбрасывать ошибку если нет API ключа', () => {
      delete process.env.OPENROUTER_API_KEY;

      expect(() => createRequestConfig({})).toThrow(
        'Missing OPENROUTER_API_KEY'
      );
    });

    it('должен использовать кастомный timeout', () => {
      process.env.OPENROUTER_API_KEY = 'test-api-key';
      const timeoutMs = 30000;
      const config = createRequestConfig({ timeoutMs });

      expect(config.timeout).toBe(timeoutMs);
    });

    it('должен использовать кастомный maxRedirects', () => {
      process.env.OPENROUTER_API_KEY = 'test-api-key';
      const maxRedirects = 10;
      const config = createRequestConfig({ maxRedirects });

      expect(config.maxRedirects).toBe(maxRedirects);
    });

    it('должен настраивать HTTPS прокси для HTTPS URL', () => {
      process.env.OPENROUTER_API_KEY = 'test-api-key';
      const httpsProxy = 'http://proxy.example:3128';
      const config = createRequestConfig({ httpsProxy });

      expect(config.httpsAgent).toBeDefined();
      expect(config.proxy).toBe(false);
    });

    it('должен использовать HTTP_PROXY из env', () => {
      process.env.OPENROUTER_API_KEY = 'test-api-key';
      process.env.HTTP_PROXY = 'http://proxy.example:3128';
      const config = createRequestConfig({});

      expect(config.httpsAgent).toBeDefined();
      expect(config.proxy).toBe(false);
    });

    it('должен использовать HTTPS_PROXY из env', () => {
      process.env.OPENROUTER_API_KEY = 'test-api-key';
      process.env.HTTPS_PROXY = 'https://proxy.example:3128';
      const config = createRequestConfig({});

      expect(config.httpsAgent).toBeDefined();
      expect(config.proxy).toBe(false);
    });

    it('должен приоритизировать переданный прокси над env', () => {
      process.env.OPENROUTER_API_KEY = 'test-api-key';
      process.env.HTTPS_PROXY = 'https://env-proxy.example:3128';
      const httpsProxy = 'http://param-proxy.example:3128';
      const config = createRequestConfig({ httpsProxy });

      expect(config.httpsAgent).toBeDefined();
      expect(config.proxy).toBe(false);
    });

    it('должен игнорировать пустые строки для apiKey', () => {
      process.env.OPENROUTER_API_KEY = 'test-api-key';
      const config = createRequestConfig({ apiKey: '   ' });

      expect(config.headers.Authorization).toBe('Bearer test-api-key');
    });

    it('должен игнорировать пустые строки для прокси', () => {
      process.env.OPENROUTER_API_KEY = 'test-api-key';
      const config = createRequestConfig({ httpsProxy: '   ' });

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