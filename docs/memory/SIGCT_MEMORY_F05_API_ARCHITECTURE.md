# SIGCT_MEMORY_F05_API_ARCHITECTURE

**Fecha:** 2026-10-11
**Base:** F00-F04
**Objetivo:** Diseño API (solo diseño)


## 1. API PÚBLICA (read-only)
- **GET /api/v1/memory/health** — estado
- **POST /api/v1/memory/query** — consulta (MemoryQueryPort)
- **GET /api/v1/memory/collections** — metadatos colecciones
**Principio:** read-only para consumidores.


## 2. API INTERNA (gobernada)
- **POST /api/v1/memory/admin/ingest-batch** — gobernado
- **GET /api/v1/memory/admin/snapshot** — validar corpus
- **POST /api/v1/memory/admin/forget-path** — gobernado + aprobación
- **POST /api/v1/memory/admin/forget-collection** — gobernado + aprobación
Solo interna, acceso restringido.


## 3. CMSC INTEGRATION
MemoryQueryPort vía API o adaptador in-process (hexagonal). Read-only.


## 4. KNOWLEDGE HUB INTEGRATION
Consulta read-only. Nunca escritura.


## 5. ACP INTEGRATION
Consumidor principal. Filtros + trazabilidad.


## 6. ALEXA INTEGRATION
Canal -> ACP -> API query read-only.


## 7. BBB INTEGRATION
On-device (sc-on-device-ai-memory), pull-only, sync selectivo.


## 8. SEGURIDAD
- Público read-only.
- Admin protegido (mTLS/IP + aprobación).
- Sin secrets/payloads sensibles.
- Principio mínimo privilegio.


## 9. VERSIONADO
/api/v1/memory/*, colección v1, model/corpus version en respuesta.


## 10. ROADMAP F05
1. Definir contratos request/response.
2. Definir filtros.
3. Esquemas errores.
4. Seguridad admin.
5. Validar con integraciones.

**SOLO DISEÑO.**
