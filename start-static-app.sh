#!/bin/bash

set -e

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting static app build and deployment...${NC}"

# Имя образа и контейнера
IMAGE_NAME="cookbook-static"
CONTAINER_NAME="cookbook-static-app"
PORT=${PORT:-8000}

# Создание временного Dockerfile для сборки
echo -e "${GREEN}Creating Dockerfile for build...${NC}"

# Сборка Docker образа
echo -e "${GREEN}Building Docker image...${NC}"
docker build -f Dockerfile -t $IMAGE_NAME .

# Запуск контейнера
echo -e "${GREEN}Starting container on port $PORT...${NC}"
docker run -d \
    --name $CONTAINER_NAME \
    -p $PORT:80 \
    --rm \
    $IMAGE_NAME

echo -e "${GREEN}✓ Static app is running!${NC}"
echo -e "${GREEN}✓ Access the app at: http://localhost:$PORT${NC}"
echo -e "${YELLOW}To stop the container, run: docker stop $CONTAINER_NAME${NC}"
echo -e "${YELLOW}To view logs, run: docker logs -f $CONTAINER_NAME${NC}"