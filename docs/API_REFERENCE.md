# API Reference — SIGC&T Rural

Esta guía documenta los endpoints principales de la API backend (Django/DRF), el esquema de autenticación y ejemplos prácticos de uso.

## Base URL

- Desarrollo local: `http://localhost:8000`
- Ejemplo de prefijo: `http://localhost:8000/api/`

## Autenticación (JWT)

La API utiliza JWT. Primero obtén el token de acceso y úsalo en el encabezado `Authorization`.

```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "usuario",
  "password": "contraseña"
}
```

Respuesta:

```json
{
  "access": "<ACCESS_TOKEN>",
  "refresh": "<REFRESH_TOKEN>"
}
```

Usa el token de acceso:

```http
GET /api/v1/proyectos/
Authorization: Bearer <ACCESS_TOKEN>
```

## Endpoints

### Autenticación

- `POST /api/auth/register/` — Registrar usuario.
- `POST /api/auth/login/` — Iniciar sesión y obtener tokens.
- `POST /api/auth/refresh/` — Refrescar token de acceso.
- `GET  /api/auth/me/` — Consultar perfil autenticado.

### Proyectos

- `GET    /api/v1/proyectos/` — Listar proyectos.
- `POST   /api/v1/proyectos/` — Crear proyecto.
- `GET    /api/v1/proyectos/{id}/` — Detalle proyecto.
- `PUT    /api/v1/proyectos/{id}/` — Actualizar proyecto.
- `DELETE /api/v1/proyectos/{id}/` — Eliminar proyecto.

### Sensores y Lecturas

- `GET  /api/v1/sensores/` — Listar sensores.
- `POST /api/v1/readings/` — Publicar nueva lectura.
- `GET  /api/v1/latest-readings/{proyecto_id}/` — Últimas lecturas por proyecto.

### Inteligencia Artificial

- `POST /api/ia/classify/` — Clasificar imagen de planta.
- `GET  /api/ia/analisis/` — Listar análisis.
- `GET  /api/ia/analisis/{id}/` — Detalle de análisis.

### Contenido Académico

- `GET /api/v1/contenido-academico/` — Listado de recursos.
- `GET /api/v1/contenido-academico/{id}/` — Detalle de recurso.

## Ejemplos

Obtener proyectos:

```bash
curl -X GET "http://localhost:8000/api/v1/proyectos/" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

Clasificar imagen (IA):

```bash
curl -X POST "http://localhost:8000/api/ia/classify/" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "image=@/ruta/a/tu/imagen.jpg"
```

## Estructura del backend

- Código de la API: `src/backend/api/`
- Usuarios y autenticación: `src/backend/users/`
- Arranque local: `src/backend/manage.py`

> Nota: La documentación OpenAPI/Swagger podrá integrarse cuando se habilite la configuración correspondiente en el proyecto.