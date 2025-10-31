#!/bin/bash

# Скрипт для деплоя Docker образа на удаленный сервер

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Проверка аргументов
if [ $# -lt 2 ]; then
    echo -e "${RED}Ошибка: Недостаточно аргументов${NC}"
    echo "Использование: $0 <user@host> <image_name:tag>"
    echo "Пример: $0 user@example.com openrouter-web-search:latest"
    exit 1
fi

SERVER=$1
IMAGE_NAME=$2
TAR_FILE="${IMAGE_NAME//[:\/]/_}.tar"

echo -e "${YELLOW}===== Деплой Docker образа =====${NC}"
echo "Сервер: $SERVER"
echo "Образ: $IMAGE_NAME"
echo "Файл архива: $TAR_FILE"
echo ""

# Проверка наличия Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Ошибка: Docker не установлен${NC}"
    exit 1
fi

# Проверка наличия образа локально
echo -e "${YELLOW}Проверка наличия образа локально...${NC}"
if ! docker image inspect "$IMAGE_NAME" &> /dev/null; then
    echo -e "${RED}Ошибка: Образ $IMAGE_NAME не найден локально${NC}"
    echo "Сначала соберите образ: docker build -t $IMAGE_NAME ."
    exit 1
fi
echo -e "${GREEN}✓ Образ найден${NC}"
echo ""

# Сохранение образа в tar файл
echo -e "${YELLOW}Сохранение образа в tar файл...${NC}"
docker save -o "$TAR_FILE" "$IMAGE_NAME"

if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при сохранении образа${NC}"
    exit 1
fi

FILE_SIZE=$(du -h "$TAR_FILE" | cut -f1)
echo -e "${GREEN}✓ Образ сохранен${NC} (размер: $FILE_SIZE)"
echo ""

# Копирование tar файла на сервер
echo -e "${YELLOW}Копирование образа на сервер...${NC}"
scp "$TAR_FILE" "$SERVER:~/"

if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при копировании на сервер${NC}"
    rm -f "$TAR_FILE"
    exit 1
fi
echo -e "${GREEN}✓ Образ скопирован на сервер${NC}"
echo ""

# Загрузка образа на сервере
echo -e "${YELLOW}Загрузка образа на сервере...${NC}"
ssh "$SERVER" "docker load -i ~/$TAR_FILE && rm -f ~/$TAR_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при загрузке образа на сервере${NC}"
    rm -f "$TAR_FILE"
    exit 1
fi
echo -e "${GREEN}✓ Образ загружен на сервере${NC}"
echo ""

# Удаление локального tar файла
echo -e "${YELLOW}Очистка локального tar файла...${NC}"
rm -f "$TAR_FILE"
echo -e "${GREEN}✓ Временный файл удален${NC}"
echo ""

echo -e "${GREEN}===== Деплой успешно завершен! =====${NC}"
echo ""
echo -e "${BLUE}Следующие шаги на сервере:${NC}"
echo "1. Подключитесь к серверу: ssh $SERVER"
echo "2. Проверьте образ: docker images | grep ${IMAGE_NAME%:*}"
echo "3. Запустите контейнер:"
echo "   docker run -d -p 3000:3000 --name openrouter-mcp $IMAGE_NAME"
echo ""
echo -e "${BLUE}Или используйте docker-compose на сервере для запуска${NC}"