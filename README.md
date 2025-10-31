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
     -e HTTP_PROXY="http://proxy.example:5559" \
     --restart=always \
     --name openrouter-web-search-mcp \
     openrouter-web-search:latest
   ```

3. Проверьте работоспособность:

   ```bash
   curl http://localhost:60125/health
   ```

   Ожидаемый ответ: `{"status":"ok"}`

4. Настройте MCP клиент для подключения к SSE серверу с передачей API key через заголовок Authorization:

   ```jsonc
   {
     "mcpServers": {
       "web-search": {
         "url": "http://localhost:60125/mcp",
         "headers": {
           "Authorization": "Bearer sk-or-v1-***"
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
   HTTP_PROXY="http://proxy.example:3128" \
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

## Переменные окружения

| Переменная                   | Назначение                               |
| ---------------------------- | ---------------------------------------- |
| `HTTP_PROXY` / `HTTPS_PROXY` | Прокси для исходящих HTTP/HTTPS запросов |

## Аутентификация

API ключ OpenRouter **обязательно** передается в заголовке `Authorization` при каждом запросе:

```
Authorization: Bearer sk-or-v1-***
```

или

```
Authorization: sk-or-v1-***
```

Без заголовка Authorization запрос будет отклонен с ошибкой 401.

## Параметры инструмента `web_search`

Все поля, кроме `query`, необязательны. Если параметр не указан, используется значение из переменных окружения или дефолт (см. ниже).

| Поле           | Тип    | По умолчанию                | Описание                          |
| -------------- | ------ | --------------------------- | --------------------------------- |
| `query`        | string | — (обязательное)            | Запрос пользователя               |
| `httpProxy`    | string | `HTTP_PROXY`                | Прокси для HTTP                   |
| `httpsProxy`   | string | `HTTPS_PROXY`               | Прокси для HTTPS                  |
| `model`        | string | `openai/gpt-4o-mini:online` | Модель OpenRouter                 |
| `pluginId`     | string | `web`                       | Плагин OpenRouter                 |
| `timeoutMs`    | number | `60000`                     | Таймаут запроса в миллисекундах   |
| `maxRedirects` | number | `5`                         | Максимальное число редиректов     |

### Пример вызова инструмента

```json
{
  "name": "web_search",
  "arguments": {
    "query": "latest news about Model Context Protocol",
    "httpsProxy": "http://proxy.example:3128",
    "timeoutMs": 30000
  }
}
```

**Важно:** API ключ OpenRouter передается через заголовок `Authorization`, а не как параметр инструмента.

При отсутствии прокси в аргументах, будут использованы переменные окружения `HTTP_PROXY` / `HTTPS_PROXY`.
