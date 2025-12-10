# Stage 1: Build Frontend
FROM node:18-alpine as frontend_build

WORKDIR /app

# Install dependencies first for caching
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Production Backend
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies (ffmpeg for potential audio handling)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy built frontend assets to backend static directory
# We create the structure expected by the modified main.py
RUN mkdir -p app/static
COPY --from=frontend_build /app/dist /app/app/static

# Expose port (Documentation mostly, Railway ignores this but uses $PORT)
EXPOSE 8000

# Start command
# We use sh -c to allow environment variable expansion if needed, 
# but uvicorn by default listens on port 8000. 
# Railway sets $PORT, so we need to tell uvicorn to use it.
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
