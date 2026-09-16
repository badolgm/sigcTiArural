# Despliegue — Desarrollo Local y Opciones Cloud

Guía para ejecutar el sistema en desarrollo local y preparar un despliegue a Cloud. Esta guía evita enlaces rotos y se basa en lo que existe hoy en el repositorio.

## Desarrollo Local

### Backend (Django)

```bash
cd src/backend
python -m venv venv
# Linux/Mac
source venv/bin/activate
# Windows
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Frontend (React + Vite)

```bash
cd src/frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
# App disponible en http://localhost:5173
```

### Edge (opcional)

Consulta `docs/EDGE_SETUP.md` para levantar los servicios en BeagleBone (Gateway MQTT, IA TFLite y Sensores).

## Base de Datos

Por defecto, el proyecto puede iniciar con SQLite. Si deseas PostgreSQL:

```ini
# Ejemplo de variables (ajusta en tu entorno)
DB_NAME=sigct_rural_db
DB_USER=sigct_user
DB_PASSWORD=tu-password
DB_HOST=localhost
DB_PORT=5432
```

Habilita credenciales y configuración en `config/settings.ini` o variables de entorno.

## Variables de entorno

Copia `.env.example` desde la raíz y crea `.env` adaptado a tu entorno. Variables recomendadas:

```ini
DEBUG=True
SECRET_KEY=tu-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

## Despliegue Cloud (Plan)

> Esta sección se habilitará cuando se agreguen los manifiestos y scripts de despliegue.

Opciones previstas:

- Render / Railway para el backend Django
- Vercel / Netlify para el frontend Vite
- Nginx como reverse proxy

## Docker (Plan)

> El repositorio actual no incluye `docker-compose.yml`. Cuando se añada, se documentará aquí con servicios para backend, frontend y base de datos.

Ejemplo de comandos (referencia futura):

```bash
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

## CI/CD (Plan)

> Se publicará una guía y workflows cuando se integren pruebas automatizadas y despliegue continuo.