# Dockerfile — Frontend (Vite + React) servido por Nginx
# Contexto de build: src/frontend

FROM node:18-alpine AS build
WORKDIR /app

# Copiar archivos del frontend
COPY package.json package-lock.json* ./
RUN npm ci || npm install 

COPY . .

# Permite inyectar endpoints en build (Vite lee .env.* en build)
ARG VITE_API_URL
ARG VITE_AI_API_BASE
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env.production && \
    echo "VITE_AI_API_BASE=${VITE_AI_API_BASE}" >> .env.production 

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

COPY --from=build /app/dist /usr/share/nginx/html 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]