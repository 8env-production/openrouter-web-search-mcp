# OpenRouter Web Search MCP

Сервер MCP предоставляет инструмент `web_search`, выполняющий запросы к [OpenRouter Web](https://openrouter.ai).

Сервер работает по протоколу **SSE (Server-Sent Events)** через HTTP.

## Запуск

### Через Docker (рекомендуется)

1. Соберите образ:

   ```bash
   docker build -t openrouter-web-search-mcp .
   ```

2. Запустите контейнер:

   ```bash
   docker run -d \
     -p 60125:80 \
     --restart=always \
     --name openrouter-web-search-mcp \
     openrouter-web-search:latest
   ```

3. Проверьте работоспособность:

   ```bash
   curl http://localhost:60125/health
   ```

   Ожидаемый ответ: `{"status":"ok"}`

4. Настройте MCP клиент для подключения к SSE серверу с передачей API key и опциональных параметров через заголовки:

   ```jsonc
   {
     "mcpServers": {
       "web-search": {
         "url": "http://localhost:60125/mcp",
         "headers": {
           "Authorization": "Bearer sk-or-v1-***",
           "X-Model": "openai/gpt-4o",
           "X-HTTP-Proxy": "http://proxy.example:3128"
         }
       }
     }
   }
   ```

### Локальный запуск

1. Установите зависимости:

   ```bash
   npm install
   ```

2. Запустите сервер:

   ```bash
   node src/index.js
   ```

3. Сервер будет доступен по адресу `http://localhost:80/mcp`

   **Важно:** API key должен передаваться в заголовке Authorization при каждом запросе.

### Тестирование

Проект использует [Vitest](https://vitest.dev/) для unit-тестирования.

1. Запуск всех тестов:

   ```bash
   npm test
   ```

2. Запуск тестов в watch режиме (автоматически перезапускаются при изменении файлов):

   ```bash
   npm run test:watch
   ```

Тесты покрывают следующие модули:

- [`src/config/server.js`](src/config/server.js) - конфигурация сервера
- [`src/config/openrouter.js`](src/config/openrouter.js) - конфигурация OpenRouter API (создание payload и request config)
- [`src/services/openrouterClient.js`](src/services/openrouterClient.js) - клиент для работы с OpenRouter API
- [`src/tools/webSearch.js`](src/tools/webSearch.js) - инструмент web_search и его валидация

### Endpoints

- `GET /mcp` - MCP endpoint для подключения клиентов
- `POST /mcp` - Endpoint для отправки сообщений
- `GET /health` - Health check endpoint

## Аутентификация и настройки

### Обязательные заголовки

API ключ OpenRouter **обязательно** передается в заголовке `Authorization` при подключении к MCP серверу:

```
Authorization: Bearer sk-or-v1-***
```

или

```
Authorization: sk-or-v1-***
```

Без заголовка Authorization запрос будет отклонен с ошибкой 401.

### Опциональные заголовки

Дополнительные настройки могут быть переданы через заголовки при подключении к серверу:

| Заголовок        | Описание                               | По умолчанию                |
| ---------------- | -------------------------------------- | --------------------------- |
| `X-Model`        | Модель OpenRouter для обработки поиска | `openai/gpt-4o-mini:online` |
| `X-HTTP-Proxy`   | Прокси для HTTP запросов               | не установлен               |
| `X-HTTPS-Proxy`  | Прокси для HTTPS запросов              | не установлен               |

## Инструмент `web_search`

Инструмент принимает только один обязательный параметр:

| Параметр | Тип    | Описание                               |
| -------- | ------ | -------------------------------------- |
| `query`  | string | Поисковый запрос для выполнения в веб  |

### Пример вызова инструмента

```json
{
  "name": "web_search",
  "arguments": {
    "query": "latest news about Model Context Protocol"
  }
}
```

**Важно:** Все настройки (API ключ, модель, прокси) передаются через заголовки при подключении к MCP серверу, а не как параметры инструмента.
