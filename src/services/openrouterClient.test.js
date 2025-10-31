import axios from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as openrouterConfig from '../config/openrouter.js';
import { requestOpenRouter } from './openrouterClient.js';

vi.mock('axios');
vi.mock('../config/openrouter.js', async () => {
  const actual = await vi.importActual('../config/openrouter.js');
  return {
    ...actual,
    createPayload: vi.fn(),
    createRequestConfig: vi.fn(),
  };
});

describe('openrouterClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('requestOpenRouter', () => {
    it('должен успешно выполнять запрос и возвращать результат', async () => {
      const query = 'test query';
      const mockResponse = {
        data: {
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'test response',
              },
            },
          ],
        },
      };

      const mockPayload = { model: 'test-model', messages: [] };
      const mockConfig = { headers: {} };

      openrouterConfig.createPayload.mockReturnValue(mockPayload);
      openrouterConfig.createRequestConfig.mockReturnValue(mockConfig);
      axios.post.mockResolvedValue(mockResponse);

      const result = await requestOpenRouter({ query });

      expect(openrouterConfig.createPayload).toHaveBeenCalledWith(query, {});
      expect(openrouterConfig.createRequestConfig).toHaveBeenCalledWith({});
      expect(axios.post).toHaveBeenCalledWith(
        openrouterConfig.OPENROUTER_API_URL,
        mockPayload,
        mockConfig
      );

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: JSON.stringify(mockResponse.data.choices[0].message),
          },
        ],
        structuredContent: {
          result: JSON.stringify(mockResponse.data.choices[0].message),
        },
      });
    });

    it('должен передавать overrides в createPayload и createRequestConfig', async () => {
      const input = {
        query: 'test query',
        model: 'custom-model',
        timeoutMs: 30000,
      };

      const mockResponse = {
        data: {
          choices: [{ message: { role: 'assistant', content: 'response' } }],
        },
      };

      openrouterConfig.createPayload.mockReturnValue({});
      openrouterConfig.createRequestConfig.mockReturnValue({});
      axios.post.mockResolvedValue(mockResponse);

      await requestOpenRouter(input);

      const expectedOverrides = {
        model: 'custom-model',
        timeoutMs: 30000,
      };

      expect(openrouterConfig.createPayload).toHaveBeenCalledWith('test query', expectedOverrides);
      expect(openrouterConfig.createRequestConfig).toHaveBeenCalledWith(expectedOverrides);
    });

    it('должен возвращать "No response" если нет choices', async () => {
      const query = 'test query';
      const mockResponse = {
        data: {},
      };

      openrouterConfig.createPayload.mockReturnValue({});
      openrouterConfig.createRequestConfig.mockReturnValue({});
      axios.post.mockResolvedValue(mockResponse);

      const result = await requestOpenRouter({ query });

      expect(result.content[0].text).toBe('No response');
      expect(result.structuredContent.result).toBe('No response');
    });

    it('должен возвращать "No response" если choices пустой', async () => {
      const query = 'test query';
      const mockResponse = {
        data: {
          choices: [],
        },
      };

      openrouterConfig.createPayload.mockReturnValue({});
      openrouterConfig.createRequestConfig.mockReturnValue({});
      axios.post.mockResolvedValue(mockResponse);

      const result = await requestOpenRouter({ query });

      expect(result.content[0].text).toBe('No response');
      expect(result.structuredContent.result).toBe('No response');
    });

    it('должен прокидывать ошибку при неудачном запросе', async () => {
      const query = 'test query';
      const error = new Error('Network error');

      openrouterConfig.createPayload.mockReturnValue({});
      openrouterConfig.createRequestConfig.mockReturnValue({});
      axios.post.mockRejectedValue(error);

      await expect(requestOpenRouter({ query })).rejects.toThrow('Network error');
    });

    it('должен корректно сериализовать сложные message объекты', async () => {
      const query = 'test query';
      const complexMessage = {
        role: 'assistant',
        content: 'response',
        metadata: { timestamp: 123456 },
        nested: { deep: { value: 'test' } },
      };

      const mockResponse = {
        data: {
          choices: [{ message: complexMessage }],
        },
      };

      openrouterConfig.createPayload.mockReturnValue({});
      openrouterConfig.createRequestConfig.mockReturnValue({});
      axios.post.mockResolvedValue(mockResponse);

      const result = await requestOpenRouter({ query });
      const expectedSerialized = JSON.stringify(complexMessage);

      expect(result.content[0].text).toBe(expectedSerialized);
      expect(result.structuredContent.result).toBe(expectedSerialized);
    });

    it('должен передавать все параметры кроме query в overrides', async () => {
      const input = {
        query: 'test query',
        httpProxy: 'http://proxy',
        httpsProxy: 'https://proxy',
        model: 'model',
        pluginId: 'plugin',
        timeoutMs: 5000,
        maxRedirects: 10,
      };

      const mockResponse = {
        data: {
          choices: [{ message: { content: 'test' } }],
        },
      };

      openrouterConfig.createPayload.mockReturnValue({});
      openrouterConfig.createRequestConfig.mockReturnValue({});
      axios.post.mockResolvedValue(mockResponse);

      await requestOpenRouter(input);

      const { query, ...expectedOverrides } = input;

      expect(openrouterConfig.createPayload).toHaveBeenCalledWith(query, expectedOverrides);
      expect(openrouterConfig.createRequestConfig).toHaveBeenCalledWith(expectedOverrides);
    });
  });
});
