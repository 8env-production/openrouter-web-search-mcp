import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Хранит API key для текущего запроса
 * @param {string} openrouterApiKey - OpenRouter API key
 * @param {Function} callback - Функция для выполнения в контексте
 * @returns {Promise<*>} Результат выполнения callback
 */
export function runWithApiKey(openrouterApiKey, callback) {
  return asyncLocalStorage.run({ openrouterApiKey }, callback);
}

/**
 * Получает API key из текущего контекста запроса
 * @returns {string|undefined} API key или undefined
 */
export function getApiKeyFromContext() {
  const store = asyncLocalStorage.getStore();
  return store?.openrouterApiKey;
}
