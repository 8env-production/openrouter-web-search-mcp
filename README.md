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
     -e HTTP_PROXY="http://5.129.238.212:5559" \
     --restart=always \
     --name openrouter-web-search-mcp \
     openrouter-web-search:latest
   ```

3. Проверьте работоспособность:

   ```bash
   curl http://localhost:60125/health
   ```

   Ожидаемый ответ: `{"status":"ok"}`

4. Настройте MCP клиент для подключения к SSE серверу:

   ```jsonc
   {
     "mcpServers": {
       "web-search": {
         "url": "http://localhost:60125/mcp",
         "env": {
           "OPENROUTER_API_KEY": "sk-or-v1-***"
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
   OPENROUTER_API_KEY="sk-or-v1-***" \
   HTTP_PROXY="http://proxy.example:3128" \
   node src/index.js
   ```

3. Сервер будет доступен по адресу `http://localhost:80/mcp`

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

## Переменные окружения (используются по умолчанию)

| Переменная                   | Назначение                               |
| ---------------------------- | ---------------------------------------- |
| `OPENROUTER_API_KEY`         | API-ключ OpenRouter                      |
| `HTTP_PROXY` / `HTTPS_PROXY` | Прокси для исходящих HTTP/HTTPS запросов |

## Параметры инструмента `web_search`

Все поля, кроме `query`, необязательны. Если параметр не указан, используется значение из переменных окружения или дефолт (см. ниже).

| Поле           | Тип    | По умолчанию                | Описание                                    |
| -------------- | ------ | --------------------------- | ------------------------------------------- |
| `query`        | string | — (обязательное)            | Запрос пользователя                         |
| `apiKey`       | string | `OPENROUTER_API_KEY`        | API-ключ OpenRouter для конкретного запроса |
| `httpProxy`    | string | `HTTP_PROXY`                | Прокси для HTTP                             |
| `httpsProxy`   | string | `HTTPS_PROXY`               | Прокси для HTTPS                            |
| `model`        | string | `openai/gpt-4o-mini:online` | Модель OpenRouter                           |
| `pluginId`     | string | `web`                       | Плагин OpenRouter                           |
| `timeoutMs`    | number | `60000`                     | Таймаут запроса в миллисекундах             |
| `maxRedirects` | number | `5`                         | Максимальное число редиректов               |

### Пример вызова инструмента

```json
{
  "name": "web_search",
  "arguments": {
    "query": "latest news about Model Context Protocol",
    "apiKey": "sk-or-v1-***",
    "httpsProxy": "http://proxy.example:3128",
    "timeoutMs": 30000
  }
}
```

При отсутствии `apiKey` и/или прокси в аргументах, будут использованы переменные окружения.  
Если ни в аргументах, ни в окружении не найден `OPENROUTER_API_KEY`, будет выброшена ошибка.
