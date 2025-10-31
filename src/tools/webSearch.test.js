import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as openrouterClient from '../services/openrouterClient.js';
import {
  registerWebSearchTool,
  WEB_SEARCH_TOOL_NAME,
  webSearchInputSchema,
  webSearchMetadata,
} from './webSearch.js';

vi.mock('../services/openrouterClient.js');

describe('webSearch tool', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('константы', () => {
    it('должен экспортировать корректное имя инструмента', () => {
      expect(WEB_SEARCH_TOOL_NAME).toBe('web_search');
    });
  });

  describe('webSearchInputSchema', () => {
    it('должен валидировать корректный минимальный input', () => {
      const input = { query: 'test query' };
      const result = webSearchInputSchema.parse(input);
      expect(result).toEqual(input);
    });

    it('должен отклонять пустой query', () => {
      const input = { query: '' };
      expect(() => webSearchInputSchema.parse(input)).toThrow();
    });

    it('должен отклонять отсутствующий query', () => {
      const input = {};
      expect(() => webSearchInputSchema.parse(input)).toThrow();
    });

    it('должен отклонять query не-строкового типа', () => {
      const input = { query: 123 };
      expect(() => webSearchInputSchema.parse(input)).toThrow();
    });

    it('должен отклонять дополнительные поля (strict режим)', () => {
      const input = { query: 'test', extraField: 'value' };
      expect(() => webSearchInputSchema.parse(input)).toThrow();
    });
  });

  describe('webSearchMetadata', () => {
    it('должен содержать корректные метаданные', () => {
      expect(webSearchMetadata).toHaveProperty('title', 'Web Search');
      expect(webSearchMetadata).toHaveProperty('description');
      expect(webSearchMetadata.description).toContain('OpenRouter');
      expect(webSearchMetadata).toHaveProperty('inputSchema');
    });

    it('inputSchema должен соответствовать webSearchInputSchema', () => {
      expect(webSearchMetadata.inputSchema).toBe(webSearchInputSchema.shape);
    });
  });

  describe('registerWebSearchTool', () => {
    it('должен регистрировать инструмент в MCP сервере', () => {
      const mockServer = {
        registerTool: vi.fn(),
      };

      registerWebSearchTool(mockServer);

      expect(mockServer.registerTool).toHaveBeenCalledTimes(1);
      expect(mockServer.registerTool).toHaveBeenCalledWith(
        WEB_SEARCH_TOOL_NAME,
        webSearchMetadata,
        expect.any(Function)
      );
    });

    it('зарегистрированный обработчик должен валидировать input', async () => {
      const mockServer = {
        registerTool: vi.fn(),
      };

      registerWebSearchTool(mockServer);

      const handler = mockServer.registerTool.mock.calls[0][2];
      const invalidInput = { query: '' };

      await expect(handler(invalidInput)).rejects.toThrow();
    });

    it('зарегистрированный обработчик должен вызывать requestOpenRouter', async () => {
      const mockServer = {
        registerTool: vi.fn(),
      };

      const mockResponse = {
        content: [{ type: 'text', text: 'response' }],
        structuredContent: { result: 'response' },
      };

      openrouterClient.requestOpenRouter.mockResolvedValue(mockResponse);

      registerWebSearchTool(mockServer);

      const handler = mockServer.registerTool.mock.calls[0][2];
      const validInput = { query: 'test query' };

      const result = await handler(validInput);

      expect(openrouterClient.requestOpenRouter).toHaveBeenCalledWith(validInput);
      expect(result).toEqual(mockResponse);
    });

    it('зарегистрированный обработчик должен прокидывать ошибки', async () => {
      const mockServer = {
        registerTool: vi.fn(),
      };

      const error = new Error('API error');
      openrouterClient.requestOpenRouter.mockRejectedValue(error);

      registerWebSearchTool(mockServer);

      const handler = mockServer.registerTool.mock.calls[0][2];
      const validInput = { query: 'test query' };

      await expect(handler(validInput)).rejects.toThrow('API error');
    });
  });
});
