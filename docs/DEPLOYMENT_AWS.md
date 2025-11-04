# Despliegue en AWS — Guía Paso a Paso

Esta guía te lleva de desarrollo local a producción en Amazon Web Services (AWS), aprovechando el año gratuito. El objetivo es dejar el sistema listo para:

- Frontend estático (React/Vite) servido en `S3 + CloudFront`.
- Microservicio de IA (FastAPI + SSE) en `App Runner` o `EC2` (Free Tier).
- Opcional: Backend Django/DRF en `Elastic Beanstalk` o `EC2`.

## Arquitectura Objetivo

- Frontend: `CloudFront` (CDN) delante de `S3` (sitio estático).
- IA Service (FastAPI): `AWS App Runner` (container) o `EC2` con Docker.
- Dominio: `Route 53` (opcional) con HTTPS gestionado en CloudFront.
- Artefactos de IA y logs: `S3` (modelos, `data/logs/infer_log.jsonl`).

## Pre-requisitos

- Cuenta AWS con Free Tier activa.
- `aws-cli` configurado: `aws configure`.
- Docker instalado para construir imágenes.

## 1) Frontend en S3 + CloudFront

1. Construir el frontend con los endpoints del backend/IA:
   - En Windows PowerShell:
     ```powershell
     cd src/frontend
     $env:VITE_API_URL="https://<tu-backend-domain>"  # Django opcional
     $env:VITE_AI_API_BASE="https://<tu-ia-service-domain>"  # FastAPI
     npm install
     npm run build
     ```

2. Crear bucket S3 (región us-east-1 recomendado):
   - Nombre único, por ejemplo: `sigct-frontend-prod`.
   - Habilita Bloqueo de acceso público: off para hosting estático (usa políticas mínimas y CloudFront para seguridad).

3. Subir el sitio:
   ```powershell
   aws s3 sync ./dist s3://sigct-frontend-prod --delete
   ```

4. Crear distribución CloudFront apuntando al bucket S3.
   - Origen: tu bucket S3.
   - Comportamiento: index document `index.html`.
   - Habilita HTTPS (certificado ACM en us-east-1 si usas dominio propio).

5. Prueba:
   - Accede a la URL de CloudFront y valida navegación.

## 2) Microservicio IA (FastAPI) en App Runner

Opción sencilla y administrada. Alternativa EC2 más económica (Free Tier) abajo.

1. Crea repositorio en ECR:
   ```powershell
   aws ecr create-repository --repository-name sigct-ia-service
   ```

2. Construye y sube imagen:
   ```powershell
   $ACCOUNT_ID=(aws sts get-caller-identity --query Account --output text)
   $REGION="us-east-1"
   $ECR_URI="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/sigct-ia-service"

   aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

   docker build -t sigct-ia-service -f src/backend/ai_service/Dockerfile .
   docker tag sigct-ia-service:latest "$ECR_URI:latest"
   docker push "$ECR_URI:latest"
   ```

3. Crea servicio en App Runner:
   - Fuente: ECR, imagen `latest`.
   - Puerto: `8000`.
   - Auto scaling: mínimo 1 instancia.
   - Variables de entorno: ninguna obligatoria.
   - Asigna acceso a `S3` si vas a leer/escribir modelos o logs en bucket.

4. Actualiza el frontend (`VITE_AI_API_BASE`) con la URL de App Runner.

5. Prueba endpoints:
   ```powershell
   curl https://<apprunner-url>/health
   curl https://<apprunner-url>/events  # SSE (observa flujo continuo)
   ```

## 3) Alternativa económica: EC2 (Free Tier)

1. Lanza instancia `t2.micro` o `t3.micro` (Free Tier).
2. Instala Docker en EC2 (Amazon Linux 2):
   ```bash
   sudo yum update -y
   sudo amazon-linux-extras install docker
   sudo service docker start
   sudo usermod -a -G docker ec2-user
   ```
3. Copia `.env` si corresponde y arranca el servicio IA:
   ```bash
   docker run -d -p 8000:8000 --name sigct-ia \
     -v /home/ec2-user/data/logs:/app/data/logs \
     <ECR_URI>:latest
   ```
4. Abre puerto 8000 en el Security Group.
5. Considera poner un Nginx reverse proxy en EC2 y usar `ALB` si necesitas TLS y dominios.

## 4) Backend Django (opcional)

- Si vas a usar autenticación, CRUD y WebSockets, despliega con Elastic Beanstalk (Docker o Python) o EC2.
- Ajusta `ALLOWED_HOSTS`, base de datos (RDS PostgreSQL) y CORS (`corsheaders`).

## 5) Variables de Entorno (Frontend)

- `VITE_API_URL`: Base del backend Django si se usa.
- `VITE_AI_API_BASE`: Base del microservicio FastAPI (App Runner/EC2).
- Se inyectan en build (`.env.production`) o vía `docker-compose` build args.

## 6) CORS y SSE

- FastAPI ya permite `allow_origins=["*"]`. En producción, define dominios exactos.
- SSE funciona correctamente detrás de App Runner, ALB o Nginx. Evita API Gateway para SSE (limitaciones).

## 7) Observabilidad

- Usa CloudWatch Logs para App Runner o EC2.
- Guarda `data/logs/infer_log.jsonl` en volumen persistente o S3.

## 8) Pruebas de humo

- Frontend (CloudFront): navega y verifica "IA Predictiva" y "Ciencia de Datos".
- IA Service: `curl /health`, `curl /models`, `POST /infer` con `image_url`.
- SSE: abre `/events` y observa stream; en la app, gráficos vivos deben moverse.

## 9) Costos y Free Tier

- S3 + CloudFront: costo muy bajo, apto para Free Tier con tráfico moderado.
- App Runner: más cómodo pero con costo; EC2 Free Tier es la vía gratuita.
- RDS PostgreSQL: no recomendado en Free Tier si no es imprescindible.

## 10) Siguientes pasos

- Convertir tu modelo Keras a TFJS para usar en el navegador.
- O subir un modelo TensorFlow ligero al IA Service en la nube.
- Integrar BeagleBone Black más adelante vía MQTT (IoT Core o Mosquitto en EC2).