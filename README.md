# OpenRouter Web Search MCP

## Что это?

MCP сервер для веб-поиска через [OpenRouter](https://openrouter.ai). Позволяет AI-приложениям выполнять поиск в интернете через простой инструмент `web_search`.

## Принцип работы

```
AI Приложение → MCP Клиент → MCP Сервер → OpenRouter API → Результаты поиска
```

**Ключевые особенности:**
- **Streamable HTTP** для real-time коммуникации
- **Один инструмент** - `web_search` с параметром `query`
- **API ключ** передается через заголовки при подключении
- **Docker-ready** для легкого деплоя

## Быстрый старт

### 1. Запуск через Docker

```bash
# Сборка и запуск
docker build --platform linux/amd64 -t openrouter-web-search:latest .
docker run -d -p 60125:80 --restart=always --name openrouter-web-search-mcp openrouter-web-search-mcp

# Проверка
curl http://localhost:60125/health
```

### 2. Настройка MCP клиента

```jsonc
{
  "mcpServers": {
    "web-search": {
      "url": "http://localhost:60125/mcp",
      "headers": {
        "Authorization": "Bearer sk-or-v1-***",
        "X-Model": "openai/gpt-4o-mini:online",
        "X-HTTP-Proxy": "http://5.129.238.212:5559"
      }
    }
  }
}
```

### 3. Использование

```json
{
  "name": "web_search",
  "arguments": {
    "query": "Последние новости про MCP"
  }
}
```

## Основные команды

| Команда | Описание |
|---------|----------|
| `npm install` | Установка зависимостей |
| `npm test` | Запуск тестов |
| `npm run test:watch` | Тесты в watch режиме |

## API Endpoints

- `GET /mcp` - MCP подключение
- `POST /mcp` - Отправка сообщений  
- `GET /health` - Health check

## Настройки

### Обязательно
- `Authorization: Bearer sk-or-v1-***` - API ключ OpenRouter

### Опционально
- `X-Model` - Модель (по умолчанию: `openai/gpt-4o-mini:online`)
- `X-HTTP-Proxy` / `X-HTTPS-Proxy` - Прокси серверы

## Деплой

Подробная инструкция по деплою: [DEPLOY.md](deploy/DEPLOY.md)

## Тестирование

Проект покрыт unit-тестами через Vitest:
- Конфигурация сервера и OpenRouter API
- OpenRouter клиент
- Инструмент web_search

```bash
npm test
```

**Простое правило:** Все настройки (API ключ, модель, прокси) передаются через заголовки при подключении к серверу, а не как параметры инструмента.
