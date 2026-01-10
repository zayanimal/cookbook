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
cat > Dockerfile.tmp << 'EOF'
# Stage 1: Build
FROM node:25-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем приложение
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Копируем собранные файлы из builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем кастомную конфигурацию nginx для SPA (опционально)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://host.docker.internal:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
EOF

# Сборка Docker образа
echo -e "${GREEN}Building Docker image...${NC}"
docker build -f Dockerfile.tmp -t $IMAGE_NAME .

# Удаление временного Dockerfile
rm Dockerfile.tmp

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