# OpenRouter Web Search MCP

Сервер MCP предоставляет инструмент `web_search`, выполняющий запросы к [OpenRouter Web](https://openrouter.ai).

## Запуск

```jsonc
{
  "mcpServers": {
    "web-search": {
      "command": "node",
      "args": ["./src/index.js"],
      "env": {
        "OPENROUTER_API_KEY": "sk-or-v1-***",
        "HTTPS_PROXY": "http://proxy.example:3128"
      }
    }
  }
}
```

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
