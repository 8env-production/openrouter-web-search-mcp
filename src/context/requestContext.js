import { AsyncLocalStorage } from 'node:async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Хранит контекст запроса (API key, proxy, model)
 * @param {Object} context - Контекст запроса
 * @param {string} context.openrouterApiKey - OpenRouter API key
 * @param {string} [context.httpProxy] - HTTP proxy URL
 * @param {string} [context.httpsProxy] - HTTPS proxy URL
 * @param {string} [context.model] - OpenRouter model
 * @param {Function} callback - Функция для выполнения в контексте
 * @returns {Promise<*>} Результат выполнения callback
 */
export function runWithRequestContext(context, callback) {
  return asyncLocalStorage.run(context, callback);
}

/**
 * Получает API key из текущего контекста запроса
 * @returns {string|undefined} API key или undefined
 */
export function getApiKeyFromContext() {
  const store = asyncLocalStorage.getStore();
  return store?.openrouterApiKey;
}

/**
 * Получает HTTP proxy из текущего контекста запроса
 * @returns {string|undefined} HTTP proxy URL или undefined
 */
export function getHttpProxyFromContext() {
  const store = asyncLocalStorage.getStore();
  return store?.httpProxy;
}

/**
 * Получает HTTPS proxy из текущего контекста запроса
 * @returns {string|undefined} HTTPS proxy URL или undefined
 */
export function getHttpsProxyFromContext() {
  const store = asyncLocalStorage.getStore();
  return store?.httpsProxy;
}

/**
 * Получает model из текущего контекста запроса
 * @returns {string|undefined} Model или undefined
 */
export function getModelFromContext() {
  const store = asyncLocalStorage.getStore();
  return store?.model;
}

/**
 * @deprecated Используйте runWithRequestContext
 * Обратная совместимость для старого API
 */
export function runWithApiKey(openrouterApiKey, callback) {
  return runWithRequestContext({ openrouterApiKey }, callback);
}
