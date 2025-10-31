# Инструкция по деплою OpenRouter Web Search MCP Server

Этот документ описывает процесс деплоя MCP сервера на удаленный сервер через Docker.

## Оглавление

- [Требования](#требования)
- [Процесс деплоя](#процесс-деплоя)
- [Автоматический деплой](#автоматический-деплой)
- [Ручной деплой](#ручной-деплой)
- [Запуск на сервере](#запуск-на-сервере)
- [Проверка работоспособности](#проверка-работоспособности)
- [Устранение неполадок](#устранение-неполадок)

## Требования

### Локальная машина

- Docker установлен и запущен
- SSH клиент (для копирования образа)
- Доступ к удаленному серверу по SSH

### Удаленный сервер

- Docker установлен и запущен
- SSH доступ настроен
- Порт 60125 (или другой выбранный) доступен для подключения

## Процесс деплоя

Деплой состоит из следующих этапов:

1. **Сборка Docker образа** локально
2. **Сохранение образа** в tar архив
3. **Копирование архива** на удаленный сервер через scp
4. **Загрузка образа** на сервере
5. **Запуск контейнера** на сервере

## Автоматический деплой

Используйте скрипт [`deploy-docker.sh`](deploy-docker.sh) для автоматизации процесса.

### Шаг 1: Сборка образа

Перейдите в корень проекта и соберите Docker образ:

```bash
docker build -t openrouter-web-search-mcp:latest .
```

### Шаг 2: Запуск скрипта деплоя

```bash
./deploy/deploy-docker.sh user@your-server.com openrouter-web-search-mcp:latest
```

**Параметры:**
- `user@your-server.com` - SSH адрес удаленного сервера
- `openrouter-web-search-mcp:latest` - имя и тег образа

### Что делает скрипт

1. ✓ Проверяет наличие Docker
2. ✓ Проверяет наличие образа локально
3. ✓ Сохраняет образ в tar файл
4. ✓ Копирует файл на сервер через scp
5. ✓ Загружает образ на сервере
6. ✓ Удаляет временные файлы

### Пример вывода

```bash
===== Деплой Docker образа =====
Сервер: user@example.com
Образ: openrouter-web-search-mcp:latest
Файл архива: openrouter-web-search-mcp_latest.tar

✓ Образ найден
✓ Образ сохранен (размер: 145M)
✓ Образ скопирован на сервер
✓ Образ загружен на сервере
✓ Временный файл удален

===== Деплой успешно завершен! =====
```

## Ручной деплой

Если вы предпочитаете выполнить деплой вручную:

### Шаг 1: Сборка образа

```bash
docker build -t openrouter-web-search-mcp:latest .
```

### Шаг 2: Сохранение образа в tar

```bash
docker save -o openrouter-web-search-mcp.tar openrouter-web-search-mcp:latest
```

### Шаг 3: Копирование на сервер

```bash
scp openrouter-web-search-mcp.tar user@your-server.com:~/
```

### Шаг 4: Загрузка на сервере

Подключитесь к серверу и выполните:

```bash
ssh user@your-server.com

# На сервере:
docker load -i ~/openrouter-web-search-mcp.tar
rm ~/openrouter-web-search-mcp.tar
```

## Запуск на сервере

После успешной загрузки образа на сервере, запустите контейнер:

### Базовый запуск

```bash
docker run -d \
  -p 60125:80 \
  --restart=always \
  --name openrouter-web-search-mcp \
  openrouter-web-search-mcp:latest
```

### Запуск с переменными окружения

```bash
docker run -d \
  -p 60125:80 \
  -e HTTP_PROXY="http://proxy.example.com:3128" \
  -e HTTPS_PROXY="http://proxy.example.com:3128" \
  --restart=always \
  --name openrouter-web-search-mcp \
  openrouter-web-search-mcp:latest
```

### Параметры запуска

| Параметр | Описание |
|----------|----------|
| `-d` | Запуск в фоновом режиме |
| `-p 60125:80` | Проброс порта (внешний:внутренний) |
| `-e HTTP_PROXY` | Прокси для HTTP запросов |
| `-e HTTPS_PROXY` | Прокси для HTTPS запросов |
| `--restart=always` | Автоматический перезапуск при падении |
| `--name` | Имя контейнера |

### Использование docker-compose

Создайте файл `docker-compose.yml` на сервере:

```yaml
version: '3.8'

services:
  openrouter-mcp:
    image: openrouter-web-search-mcp:latest
    container_name: openrouter-web-search-mcp
    ports:
      - "60125:80"
    environment:
      - HTTP_PROXY=http://proxy.example.com:3128
      - HTTPS_PROXY=http://proxy.example.com:3128
    restart: always
```

Запустите:

```bash
docker-compose up -d
```

## Проверка работоспособности

### Проверка статуса контейнера

```bash
docker ps | grep openrouter-web-search-mcp
```

### Health check endpoint

```bash
curl http://localhost:60125/health
```

Ожидаемый ответ:
```json
{"status":"ok"}
```

### Проверка с внешнего хоста

```bash
curl http://your-server.com:60125/health
```

### Просмотр логов

```bash
docker logs openrouter-web-search-mcp
```

Следить за логами в реальном времени:

```bash
docker logs -f openrouter-web-search-mcp
```

## Настройка MCP клиента

После успешного запуска сервера, настройте MCP клиент для подключения:

```jsonc
{
  "mcpServers": {
    "web-search": {
      "url": "http://your-server.com:60125/sse",
      "env": {
        "OPENROUTER_API_KEY": "sk-or-v1-***"
      }
    }
  }
}
```

**Важно:** API ключ OpenRouter (`OPENROUTER_API_KEY`) должен быть передан через конфигурацию MCP клиента, а не в переменных окружения контейнера.

## Обновление сервера

Для обновления запущенного сервера:

1. Остановите и удалите старый контейнер:
   ```bash
   docker stop openrouter-web-search-mcp
   docker rm openrouter-web-search-mcp
   ```

2. Удалите старый образ (опционально):
   ```bash
   docker rmi openrouter-web-search-mcp:latest
   ```

3. Повторите процесс деплоя с новой версией

4. Запустите новый контейнер

## Устранение неполадок

### Образ не найден локально

**Проблема:** Скрипт сообщает, что образ не найден.

**Решение:**
```bash
docker build -t openrouter-web-search-mcp:latest .
```

### Ошибка при копировании на сервер

**Проблема:** `scp` не может подключиться к серверу.

**Решение:**
- Проверьте SSH доступ: `ssh user@your-server.com`
- Убедитесь, что у пользователя есть права на запись в домашнюю директорию

### Контейнер не запускается

**Проблема:** Контейнер останавливается сразу после запуска.

**Решение:**
```bash
# Просмотрите логи
docker logs openrouter-web-search-mcp

# Проверьте, не занят ли порт
sudo netstat -tulpn | grep 60125

# Попробуйте запустить интерактивно для отладки
docker run -it --rm -p 60125:80 openrouter-web-search-mcp:latest
```

### Порт уже занят

**Проблема:** Ошибка "port is already allocated".

**Решение:**
```bash
# Найдите процесс, использующий порт
sudo lsof -i :60125

# Используйте другой порт
docker run -d -p 60126:80 --name openrouter-web-search-mcp openrouter-web-search-mcp:latest
```

### Health check возвращает ошибку

**Проблема:** `/health` endpoint недоступен.

**Решение:**
```bash
# Проверьте логи контейнера
docker logs openrouter-web-search-mcp

# Проверьте, запущен ли контейнер
docker ps -a | grep openrouter-web-search-mcp

# Проверьте сетевые настройки
docker inspect openrouter-web-search-mcp | grep -A 10 Networks
```

### Прокси не работает

**Проблема:** Запросы к OpenRouter не проходят через прокси.

**Решение:**
- Убедитесь, что переменные `HTTP_PROXY` и `HTTPS_PROXY` заданы при запуске контейнера
- Проверьте, что прокси сервер доступен из контейнера:
  ```bash
  docker exec openrouter-web-search-mcp wget -O- http://proxy.example.com:3128
  ```

## Дополнительные команды

### Остановка контейнера

```bash
docker stop openrouter-web-search-mcp
```

### Запуск остановленного контейнера

```bash
docker start openrouter-web-search-mcp
```

### Перезапуск контейнера

```bash
docker restart openrouter-web-search-mcp
```

### Удаление контейнера

```bash
docker rm -f openrouter-web-search-mcp
```

### Просмотр ресурсов контейнера

```bash
docker stats openrouter-web-search-mcp
```

## Архитектура деплоя

```
┌─────────────────────┐
│  Локальная машина   │
│                     │
│  1. docker build    │
│  2. docker save     │
│  3. scp to server   │
└──────────┬──────────┘
           │
           │ SSH/SCP
           │
┌──────────▼──────────┐
│  Удаленный сервер   │
│                     │
│  4. docker load     │
│  5. docker run      │
│                     │
│  ┌───────────────┐  │
│  │  Container    │  │
│  │  Port: 80     │  │
│  └───────┬───────┘  │
│          │          │
└──────────┼──────────┘
           │
     Port 60125
           │
┌──────────▼──────────┐
│    MCP Client       │
│                     │
│  SSE: /sse          │
│  Health: /health    │
└─────────────────────┘
```

## Безопасность

### Рекомендации

1. **Не храните API ключи в образе Docker** - передавайте их через конфигурацию MCP клиента
2. **Используйте HTTPS** для production деплоя (настройте reverse proxy, например nginx)
3. **Ограничьте доступ к порту** через firewall (ufw, iptables)
4. **Регулярно обновляйте** базовый образ Node.js
5. **Используйте docker secrets** для чувствительных данных

### Настройка firewall (пример для ufw)

```bash
# Разрешить только определенным IP
sudo ufw allow from 192.168.1.0/24 to any port 60125

# Или разрешить всем
sudo ufw allow 60125/tcp
```

## Поддержка

При возникновении проблем:

1. Проверьте логи: `docker logs openrouter-web-search-mcp`
2. Проверьте документацию в [`README.md`](../README.md)
3. Убедитесь, что все требования выполнены