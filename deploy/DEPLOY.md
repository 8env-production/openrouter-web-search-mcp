# Деплой OpenRouter Web Search MCP

> **О проекте:** MCP сервер для веб-поиска через OpenRouter API. Подробнее: [`README.md`](../README.md)

## Оглавление

- [Зачем это нужно](#зачем-это-нужно)
- [Как работает](#как-работает)
- [Быстрый старт](#быстрый-старт)
- [Автоматический деплой](#автоматический-деплой)
- [Ручной деплой](#ручной-деплой)
- [Проверка работы](#проверка-работы)
- [Управление контейнером](#управление-контейнером)
- [Решение проблем](#решение-проблем)

## Зачем это нужно

Деплой позволяет развернуть MCP сервер на удаленной машине, чтобы:
- Использовать единый сервер для нескольких клиентов
- Работать с сервером из любого места
- Изолировать сервис в Docker контейнере

## Как работает

```
Локально: Собираем docker образ → Копируем образ на сервер → Подключаемся к серверу
Сервер: Запускаем docker контейнер на сервере → Настраиваем MCP сервер в AI приложении → Готово
```

**Процесс:**
1. Собираем Docker образ локально
2. Сохраняем в tar файл
3. Копируем на сервер через SSH (команда scp)
4. Загружаем и запускаем на сервере

**Требования:**
- Docker на локальной машине и сервере
- SSH доступ к серверу
- Свободный порт (по умолчанию 60125)

## Быстрый старт

```bash
# 1. Собрать образ
docker build --platform linux/amd64 -t openrouter-web-search:latest .

# 2. Задеплоить
./deploy/deploy-docker.sh user@server.com openrouter-web-search-mcp:latest

# 3. Запустить на сервере
ssh user@server.com
docker run -d -p 60125:80 --restart=always \
  --name openrouter-web-search-mcp \
  openrouter-web-search-mcp:latest

# 4. Проверить
curl http://server.com:60125/health
```

## Автоматический деплой

Используйте скрипт [`deploy-docker.sh`](deploy-docker.sh):

```bash
./deploy/deploy-docker.sh user@server.com openrouter-web-search-mcp:latest
```

**Что делает:**
- ✓ Проверяет Docker и образ
- ✓ Сохраняет образ в tar
- ✓ Копирует на сервер
- ✓ Загружает на сервере
- ✓ Очищает временные файлы

## Ручной деплой

```bash
# Локально
docker build -t openrouter-web-search-mcp:latest .
docker save -o openrouter-web-search-mcp.tar openrouter-web-search-mcp:latest
scp openrouter-web-search-mcp.tar user@server.com:~/

# На сервере
ssh user@server.com
docker load -i ~/openrouter-web-search-mcp.tar
rm ~/openrouter-web-search-mcp.tar
```

## Запуск контейнера

```bash
docker run -d \
  -p 60125:80 \
  --restart=always \
  --name openrouter-web-search-mcp \
  openrouter-web-search-mcp:latest
```

## Проверка работы

```bash
# Статус контейнера
docker ps | grep openrouter

# Health check
curl http://localhost:60125/health
# Ожидается: {"status":"ok"}

# Логи
docker logs openrouter-web-search-mcp
docker logs -f openrouter-web-search-mcp  # в реальном времени
```

## Настройка клиента

```jsonc
{
  "mcpServers": {
    "web-search": {
      "url": "http://server.com:60125/mcp",
      "headers": {
        "Authorization": "Bearer sk-or-v1-***",
        "X-Model": "openai/gpt-4o-mini:online",
        "X-HTTP-Proxy": "http://proxy:5559"
      }
    }
  }
}
```

> ⚠️ **Важно:** API ключ передается через заголовки клиента, не в контейнере!

## Управление контейнером

```bash
# Остановка
docker stop openrouter-web-search-mcp

# Запуск
docker start openrouter-web-search-mcp

# Перезапуск
docker restart openrouter-web-search-mcp

# Удаление
docker rm -f openrouter-web-search-mcp

# Мониторинг ресурсов
docker stats openrouter-web-search-mcp
```

### Обновление

```bash
docker stop openrouter-web-search-mcp
docker rm openrouter-web-search-mcp
docker rmi openrouter-web-search-mcp:latest
# Повторить процесс деплоя
```

## Решение проблем

| Проблема | Решение |
|----------|---------|
| Образ не найден | `docker build -t openrouter-web-search-mcp:latest .` |
| SSH не работает | Проверить: `ssh user@server.com` |
| Порт занят | `sudo lsof -i :60125` или использовать другой порт |
| Контейнер падает | `docker logs openrouter-web-search-mcp` |
| Health check fail | Проверить логи и статус: `docker ps -a` |

---

**Основная документация:** [`README.md`](../README.md)