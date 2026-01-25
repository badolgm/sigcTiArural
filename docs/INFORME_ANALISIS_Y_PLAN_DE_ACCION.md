# Informe de Análisis y Plan de Acción: Integración Robótica Segura
**Fecha:** 24 de Enero 2026
**Autor:** Bernardo Adolfo Gómez Montoya + Gemini AI
**Contexto:** Recuperación tras incidente de `.gitignore` y plan de integración controlada.

---

## 1. Análisis de Situación Actual

### 1.1 Estado del Repositorio
- **Rama Actual:** `feature/laboratorios-integracion-2026`
- **Dashboard:** ✅ Restaurado y funcional (todas las tarjetas visibles).
- **Backend:** ✅ Modelos de Robótica (`Robot`, `RobotTelemetry`, `RobotCommand`) implementados pero NO integrados al frontend.
- **Frontend:** ⚠️ `RoboticsLab.jsx` está en modo "aislado" (Standalone), usando datos simulados o conexión directa a ROSBridge local, sin consumir la API de Django aún.
- **Docker:** ✅ Limpieza realizada (10GB recuperados). Contenedores operando correctamente con PostgreSQL.

### 1.2 Riesgos Identificados
1.  **Corrupción de UI:** Modificar componentes compartidos (`LabCatalog`, `lab-data.js`) puede romper otras secciones (como sucedió hoy).
2.  **Pérdida de Datos:** Reinicios de contenedores sin volúmenes persistentes o migraciones fallidas.
3.  **Conflictos de Red:** La comunicación Frontend (Browser) -> ROSBridge (Localhost:9090) vs Frontend -> Backend (Docker:8000) puede generar problemas de CORS o Mixed Content.

---

## 2. Metodología de Desarrollo: "Integración Defensiva"

Para evitar nuevos incidentes, adoptaremos una estrategia de **"Integración Defensiva"** basada en 3 pilares:

1.  **Aislamiento de Cambios:** Todo cambio de Robótica se hará en archivos NUEVOS o ESPECÍFICOS, tocando lo mínimo posible los archivos globales (`lab-data.js`).
2.  **Feature Flags (Banderas de Características):** El frontend detectará si la API de backend está disponible; si falla, degradará suavemente a modo "Simulación" sin romper la pantalla blanca (White Screen of Death).
3.  **Verificación Incremental:** Cada paso se verificará con comandos `curl` (Backend) y prueba visual (Frontend) ANTES de hacer commit.

---

## 3. Plan de Acción Detallado

### Fase 1: Verificación de Cimientos (Backend)
**Objetivo:** Asegurar que el Backend responda correctamente a las peticiones de robots antes de conectar el frontend.

**Comandos de Verificación:**
```bash
# 1. Verificar estado del servidor
curl -I http://localhost:8000/api/health/

# 2. Listar robots existentes (debe devolver lista vacía [] o datos previos)
curl http://localhost:8000/api/robots/

# 3. Crear un robot de prueba "RBT-TEST-01"
curl -X POST http://localhost:8000/api/robots/ \
     -H "Content-Type: application/json" \
     -d '{"robot_id": "RBT-TEST-01", "name": "Test Robot", "type": "ground", "status": "active"}'
```

### Fase 2: Integración Frontend Segura (Hook Personalizado)
**Estrategia:** No modificaremos `RoboticsLab.jsx` directamente con lógica compleja. Crearemos un "Hook" de React separado (`useRoboticsApi.js`) que maneje la comunicación.

**Pasos:**
1.  Crear `src/frontend/src/hooks/useRoboticsApi.js`.
2.  Implementar lógica de `fetch` con manejo de errores (Try/Catch).
3.  Importar este hook en `RoboticsLab.jsx` solo para LEER datos, sin borrar la funcionalidad actual de ROSBridge.

### Fase 3: Prueba de Humo (Smoke Test)
**Procedimiento:**
1.  Levantar entorno: `docker-compose up -d --no-deps frontend` (reconstrucción rápida).
2.  Abrir navegador en `http://localhost:5173/lab-robotics`.
3.  Verificar consola de desarrollador (F12) buscando errores rojos.
4.  Confirmar que aparece el robot de prueba creado en la Fase 1.

---

## 4. Comandos de Referencia (Bitácora)

### Gestión de Ramas y Guardado
```bash
# Verificar estado antes de empezar
git status

# Guardar progreso parcial (Backend verificado)
git add src/backend/api/
git commit -m "feat(backend): Verify robotics API endpoints"

# Guardar progreso parcial (Frontend Hook)
git add src/frontend/src/hooks/
git commit -m "feat(frontend): Add useRoboticsApi hook for safe integration"
```

### Recuperación de Emergencia (Si algo falla)
```bash
# Descartar cambios en frontend (volver al último commit seguro)
git restore src/frontend/src/labs/RoboticsLab.jsx

# Reconstruir contenedor frontend limpio
docker-compose up -d --build --force-recreate --no-deps frontend
```

---

**Firma:**
*Bernardo Adolfo Gómez Montoya*
*Líder de Desarrollo - Proyecto SIGC&T Rural*
