# Stage 1: Build Frontend
FROM node:18-alpine as frontend_build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production Backend
FROM python:3.12-slim

WORKDIR /app

# Install ffmpeg and Node.js (required for yt-dlp signature decryption)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Verify node is installed
RUN node --version

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

RUN mkdir -p app/static
COPY --from=frontend_build /app/dist /app/app/static

EXPOSE 8000
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
