# SIGCT-Rural — Plan de Trabajo de 20 Días

**Ritmo:** 8 horas diarias, 4 semanas, 20 días hábiles.
**Restricción de hardware:** ASUS i3 11va gen, 12GB RAM — cada día indica si requiere Docker completo (pesado) o solo lectura/edición (liviano).
**Regla general:** no se avanza al día siguiente sin que el día actual quede con `git status` limpio y explicado. Nada se borra del disco — todo movimiento queda respaldado y registrado en `docs/local/MOVEMENT_LOG.md`.

---

## SEMANA 1 — Auditoría documental exhaustiva + Identidad canónica
*(Carga liviana — sin Docker la mayoría de los días. Ideal para tu hardware.)*

**Día 1 — Inventario total de documentación**
- Listar TODOS los `.md`, diagramas Mermaid/UML, imágenes de arquitectura, en cada carpeta del repo, sin excepción.
- Para cada archivo: ¿es legible?, ¿está corrupto?, ¿su contenido corresponde a lo que su nombre promete?, ¿está duplicado en otro lado?
- Salida: `docs/local/DOCUMENT_INVENTORY.md` (local-only) con tabla: archivo | estado | acción sugerida (mantener / mover / archivar / reescribir / duplicado-de-X).

**Día 2 — Identidad canónica**
- Crear `docs/ECOSYSTEM_IDENTITY.md` con la narrativa completa del ecosistema (la que ya destilamos).
- Marcar `EIARC_MISSION.md`, `EIARC_SCOPE.md`, `EIARC_VISION.md` y las secciones de `PLAN_MAESTRO.md`/`MASTERDOC.md` sobre EIARC-agropecuario como **superadas** (no se borran — se les agrega una nota de cabecera "Ver docs/ECOSYSTEM_IDENTITY.md — definición vigente").
- Actualizar `CLAUDE.md` si algo quedó pendiente.

**Día 3 — README.md a la verdad**
- Reescribir `README.md` usando `README_REALITY_CHECK.md` como checklist: cada punto `DESACTUALIZADA` se corrige, cada `PARCIAL` se aclara, cada `VERIFICADA` se conserva.
- Incorporar la identidad de ecosistema (agnóstico de hardware, labs interconectados) en la sección de visión del README.

**Día 4 — Cierre del hallazgo Docs\*.jsx legacy**
- Ejecutar el retiro en dos fases ya auditado: (1) retirar `DocsReadme`, `DocsMasterdoc`, `DocsPlanMaestro` (cobertura ya completa en Knowledge Hub); (2) incorporar `EDGE_SETUP.md` y `API_REFERENCE.md` al registry del Knowledge Hub, luego retirar `DocsEdgeSetup` y `DocsApiReference`.
- Archivar (no borrar) los 5 `.jsx` en `src/frontend/src/pages/_deprecated/` vía `git mv`.
- Corregir el routeMap del asistente de voz (`App.jsx:80`).

**Día 5 — Diagramas y gráficos**
- Revisar cada diagrama Mermaid/UML del repo: ¿renderiza?, ¿sigue la sintaxis vigente?, ¿describe la arquitectura real o una versión vieja?
- Corregir los rotos, marcar como históricos los que describan versiones superadas.
- Cierre de semana: `git status` limpio, resumen de la semana en `docs/local/MOVEMENT_LOG.md`.

---

## SEMANA 2 — Arquitectura: Bounded Contexts reales
*(Carga media — Docker selectivo, un servicio a la vez.)*

**Día 6-7 — Definición formal de contextos**
- Actualizar `ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` con los bounded contexts definitivos, alineados a la identidad canónica: `Labs`, `Telemetry`, `AI`, `Knowledge`, `Identity`, `EIARC` (contexto productivo).
- Definir explícitamente los contratos/puertos entre contextos — especialmente el mecanismo por el cual una señal de un lab puede fluir a otro (principio #2 de la identidad).
- Sin tocar código todavía — esto es diseño documentado.

**Día 8-10 — Scaffold real de `contexts/`**
- Crear la carpeta `contexts/{labs,telemetry,ai,identity}/` con estructura hexagonal (domain/application/infrastructure) para 1-2 contextos piloto — empezar por el que tenga menos riesgo de romper lo que funciona (Strangler Fig: el código viejo sigue sirviendo mientras se migra).
- Clean Code + SOLID en cada archivo nuevo. Tests de dominio antes de mover lógica.
- Cierre de semana: verificar que nada de lo que funcionaba antes se rompió (correr los 50 tests de dominio existentes).

- **Día 8 (Laboratorios): ✅ COMPLETADO — commit `daf2f67`.** `contexts/labs/` creado desde V2 (`api/logic/domain/`) con sus 50 tests heredados, duplicados y verificados 50/50 en la nueva ubicación. Original intacto, sirviendo producción sin cambios.
- **Día 9 (Telemetría): ✅ COMPLETADO — commits `43a280d`** (28 tests de caracterización escritos antes de mover código, dado que Telemetría no tenía par V2 ni cobertura previa) **+ `14d7cb0`** (`contexts/telemetry/` creado desde `core/domain|ports/` + `infrastructure/persistence/`, 28/28 verificados). Original intacto.
**Día 10 (conectar a tráfico real): ✅ COMPLETADO — commits `75d5d9b`** (fix del bug de timezone, bloqueante) **+ `9b2ccf7`** (repunte final). TelemetryHistoryV2View conectada a contexts/telemetry/ vía el adaptador ACL (LegacySensorReadingRepositoryAdapter). Verificado en vivo con datos reales sembrados (no solo el fallback de simulación): 200, formato idéntico al original. 174/174 tests, cero regresiones. Primer contexto de la Semana 2 conectado a tráfico real de producción.

**Semana 2 completa:** Días 6-7 (reconciliación de bounded contexts), Día 8 (scaffold Labs), Día 9 (scaffold Telemetría + 28 tests de caracterización), Día 10 (conexión a tráfico real + corrección de un bug preexistente de timezone que afectaba también a /api/v3/telemetry/history/ en producción).

---

## SEMANA 3 — Interconexión de laboratorios + seguridad
*(Carga alta — planificar los días de Docker completo con anticipación, uno por uno.)*

**Día 11-12 — Diseño del bus de señales entre labs**
- Diseñar (documentado primero, ligero en cómputo dado tu hardware — nada de Kafka/mensajería pesada) el mecanismo por el cual laboratorios se comunican: contrato de eventos, formato de señal común, ruta de un dato desde captura hasta cualquier lab de destino.

**Día 13 — Contrato semántico de IA**
- Resolver la incompatibilidad ya auditada (`TRAE_AI_INTEGRATION_AUDIT.md`): el modelo devuelve `class_N`, el frontend espera nombres agrícolas. Definir el contrato canónico (principio EIARC_MISSION #2: separar inferencia técnica de contrato de negocio) y aplicarlo.

**Día 14-15 — Seguridad**
- `DEBUG=False` condicionado a entorno, `ALLOWED_HOSTS` real, CORS acotado, JWT real (`simplejwt`) con endpoints `/api/auth/*` funcionales, reemplazando el fallback `demo-token`.
- Cierre de semana: probar login real end-to-end.

---

## SEMANA 4 — Integración, pruebas, cierre
*(Carga alta el día de pruebas end-to-end — reservar ese día completo, sin otras tareas paralelas.)*

**Día 16-17 — Interconexión funcionando**
- Implementar el primer caso real de un lab hablando con otro (caso piloto: señal → Señales → Matemáticas, el ejemplo que ya describiste).

**Día 18 — Prueba end-to-end del sistema completo**
- Levantar todo con `docker-compose up`, navegar cada pieza en vivo (Dashboard, Knowledge Hub, Labs interconectados, IA, Auth real), sin depender de lo que digan los documentos.

**Día 19 — Auditoría forense final**
- Repetir el checklist de verificación honesta (el mismo tipo de auditoría que ya hicimos para Docs\*.jsx y para la rama de contextos) sobre todo el sistema.
- Generar `SIGCT_RURAL_FORENSIC_STATUS_REPORT_FINAL.md`.

**Día 20 — Cierre**
- Documentación de cierre, `CHANGELOG` actualizado, PR preparado (sin mergear — eso lo autorizas tú).
- Resumen ejecutivo final: qué quedó resuelto, qué queda como trabajo futuro explícito (ej. capa Edge física con hardware real, que depende de tener el hardware en mano, no de tiempo de desarrollo).

---

## Reglas fijas para cada día

1. Empezar con `git status`.
2. Confirmar en `PLAN_20_DIAS.md` qué día toca (no asumir).
3. Nada se borra — solo se mueve con respaldo y registro en `docs/local/MOVEMENT_LOG.md`.
4. Ningún commit/push sin tu autorización explícita en el mensaje de ese día.
5. Terminar el día con `git status` limpio y un resumen de una línea de qué se logró.
6. **Control de alcance (regla dura):** cualquier idea nueva que surja durante estos 20 días (nueva especie a estudiar, nuevo módulo, nueva integración, nuevo caso de uso) se anota en `docs/local/IDEAS_FUTURAS.md` y NO se ejecuta hasta después del Día 20. Sin excepciones, sin importar qué tan buena parezca la idea en el momento — este plan existe precisamente para cerrar lo que ya se empezó.
