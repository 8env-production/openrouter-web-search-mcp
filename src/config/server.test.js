import { describe, expect, it } from 'vitest';
import { SERVER_CONFIG } from './server.js';

describe('server config', () => {
  describe('SERVER_CONFIG', () => {
    it('должен содержать корректное имя сервера', () => {
      expect(SERVER_CONFIG).toHaveProperty('name');
      expect(SERVER_CONFIG.name).toBe('openrouter-web-search-mcp');
    });

    it('должен содержать версию', () => {
      expect(SERVER_CONFIG).toHaveProperty('version');
      expect(SERVER_CONFIG.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('должен содержать только необходимые поля', () => {
      const expectedKeys = ['name', 'version'];
      const actualKeys = Object.keys(SERVER_CONFIG);

      expect(actualKeys).toEqual(expectedKeys);
    });

    it('версия должна быть строкой', () => {
      expect(typeof SERVER_CONFIG.version).toBe('string');
    });

    it('имя должно быть строкой', () => {
      expect(typeof SERVER_CONFIG.name).toBe('string');
    });
  });
});
