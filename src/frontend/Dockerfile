# Dockerfile — Frontend (Vite + React) servido por Nginx
# Contexto de build: raíz del repositorio (FASE 9B.1 — Knowledge Hub Stabilization).
# El Knowledge Hub lee README.md, SIGCT_RURAL_SYSTEM_BOOT.md y docs/** vía
# import.meta.glob en tiempo de build (docLoader.js) — por eso el contexto ya
# no puede acotarse a src/frontend/. Ver .dockerignore en la raíz del repo.

FROM node:18-alpine AS build
WORKDIR /app

# Copiar solo el manifiesto de dependencias primero (aprovecha cache de capas)
COPY src/frontend/package.json src/frontend/package-lock.json* ./src/frontend/
WORKDIR /app/src/frontend
RUN npm install --legacy-peer-deps

# Copiar el resto del repositorio (filtrado por .dockerignore): src/frontend/
# completo + README.md + SIGCT_RURAL_SYSTEM_BOOT.md + docs/**
WORKDIR /app
COPY . .

WORKDIR /app/src/frontend

# Permite inyectar endpoints en build (Vite lee .env.* en build)
ARG VITE_API_URL
ARG VITE_AI_API_BASE
ARG VITE_AI_INFERENCE_URL
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env.production && \
    echo "VITE_AI_API_BASE=${VITE_AI_API_BASE}" >> .env.production && \
    echo "VITE_AI_INFERENCE_URL=${VITE_AI_INFERENCE_URL}" >> .env.production

RUN npm run build

FROM nginx:alpine AS runtime

# --- SOLUCIÓN AL ERROR 404 ---
# Esta configuración redirige todas las peticiones al index.html
# permitiendo que el ruteo de React funcione al refrescar la página.
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/src/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
