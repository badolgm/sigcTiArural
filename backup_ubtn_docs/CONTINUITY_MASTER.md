# SIGCT-Rural — Documento Maestro de Continuidad

**Fecha de corte:** 19 de julio de 2026, 18:27
**Commit base:** `8b22f3e` — `feat(fase-9): consolidate knowledge hub, docker deployment and ecosystem UX`
**Autor del proyecto:** Bernardo Adolfo Gómez Montoya
**Repositorio local:** `C:\Users\Devbadolgm\Development\research-ai\ProjectsAndDatasets\sigcTiArural`
**Repositorio remoto:** `github.com/badolgm/sigcTiArural`

---

## 0. Cómo usar este documento

Este archivo reemplaza la necesidad de reexplicar el proyecto cada vez que abres una terminal nueva de Claude Code.

1. Guarda este archivo en el repositorio (sugerido: `docs/CONTINUITY_MASTER.md`), **solo si me autorizas explícitamente a escribir archivos** — hasta ahora ese paso no se ha ejecutado.
2. Al abrir una sesión nueva de Claude Code sobre este proyecto, pega **el PROMPT 1** (sección 1) como primer mensaje.
3. Si Claude necesita más profundidad de estado técnico, pégale también el **PROMPT 2** (sección 2).
4. Las secciones 3 en adelante son el respaldo narrativo/informativo — no hace falta pegarlas, están aquí para que tú (o una auditoría futura) puedan verificar de dónde salió cada afirmación de los prompts.

---

## 1. PROMPT 1 — Arranque y continuidad (pegar siempre primero)

```
CONTINUIDAD DE PROYECTO — SIGCT-RURAL

Soy Bernardo Adolfo Gómez Montoya, autor del proyecto SIGCT-Rural
(repositorio local: C:\Users\Devbadolgm\Development\research-ai\ProjectsAndDatasets\sigcTiArural).

Este NO es un proyecto nuevo. Ya existe un historial extenso de fases de
trabajo (nomenclatura "FASE 7X", "FASE 8X" y "FASE 9X") que cubrieron
gobernanza documental, auditoría técnica, recuperación de infraestructura,
diseño de visión de producto/ecosistema, y consolidación de UX y Docker.
Antes de proponer o ejecutar cualquier cosa, debes asumir lo siguiente
como ya resuelto — NO lo reconstruyas, NO lo vuelvas a auditar desde cero
salvo que yo te lo pida explícitamente:

ESTADO DE GOBERNANZA DOCUMENTAL (FASE 7H–7O — COMPLETADO):
- Fuente de verdad y precedencia entre documentos ya resuelta y escrita
  en SIGCT_RURAL_SYSTEM_BOOT.md (sección 18): MASTERDOC.md es la
  bitácora oficial; PLAN_MAESTRO.md manda sobre fases; ADSO_GUIA_TECNICA
  manda sobre detalle técnico de refactor; docs/eiarc/02_ARCHITECTURE/
  manda sobre arquitectura/contextos.
- Los 42+ archivos .md de la raíz fueron clasificados y reorganizados:
  familia "AI Research V2" (18 docs) → docs/ai/research_v2/; documentos
  históricos (TRAE, README_REALITY_CHECK) → docs/historical/.
  NO TOCAR docs/eiarc/, docs/architect_master/, docs/project_knowledge_base/,
  docs/sena_artifacts/ salvo instrucción explícita.
- Rama de trabajo docs/architecture-consolidation-v8 fue mergeada a
  main vía PR #13.

ESTADO TÉCNICO (FASE 8A/8B — COMPLETADO):
- AI Service: tuvo una caída real documentada (imagen Docker corrupta,
  archivos de 0 bytes en site-packages) — fue diagnosticada y
  recuperada sin necesidad de rebuild destructivo completo.
- Knowledge Hub: MVP construido y funcional en
  src/frontend/src/knowledge-hub/ — 49 documentos indexados en 6
  categorías (project-core, eiarc-foundation, eiarc-architecture,
  knowledge-base, research-v2, historical), verificado con navegador
  real (Puppeteer), cero llamadas a CDN en el código nuevo.

ESTADO UX/DOCKER (FASE 9A–9B.1 — COMPLETADO, VER SECCIÓN 3 DE ESTE DOCUMENTO):
- FASE 9A: se eliminó conceptualmente "Docs (v5.0)" de la navegación
  visible, se integró "Conocimiento" en TopNav, y se introdujo la
  gramática visual Verificado / Simulado / Planeado.
- FASE 9B: auditoría forense confirmó que el frontend en Docker
  desplegaba una imagen antigua (causa raíz: Docker Build Context,
  no React/Mermaid/Markdown).
- FASE 9B.1: recuperación completa del Knowledge Hub — 49/49
  documentos operativos, Mermaid, TOC, anclas, SVG y build de Docker
  verificados.

VISIÓN DE PRODUCTO (FASE 8F–8I — COMPLETADO, SOLO DISEÑO, NO IMPLEMENTADO):
Existen tres documentos de visión ya construidos y entregados en
conversación (NO están guardados como archivo en el repositorio —
solo existen en un Word que yo conservo aparte):
  1. SIGCT_RURAL_CANONICAL_PRODUCT_VISION_V10 — identidad real del
     proyecto: un ejercicio de honestidad de ingeniería verificable,
     no solo "una app agrícola con IA."
  2. SIGCT_RURAL_ECOSYSTEM_VISION_2030 — estado maduro a 5 años: un
     ecosistema de seis eslabones (Telemetría → Investigación → IA →
     Laboratorios → Conocimiento, gobernados por EIARC).
  3. SIGCT_RURAL_EXPERIENCE_BLUEPRINT_V10 — cómo debe VIVIRSE la
     plataforma (mapas de experiencia/cognitivo/visual/emocional,
     principios inviolables de rediseño).
También existe un cuarto documento de visión visual:
  4. SIGCT_RURAL_VISUAL_EXPERIENCE_SYSTEM_V10 — lenguaje visual del
     ecosistema (FASE 8J).
Si necesitas el contenido completo de estos documentos para continuar,
PÍDEMELO explícitamente — puedo pegarlo desde mi Word. NO los
reconstruyas ni los reinventes por tu cuenta.

REGLA DE ORO DE ESTA FASE (FASE 9, vigente):
NO ELIMINAR. NO ROMPER. NO DUPLICAR. NO REINVENTAR.
Objetivo actual: consolidar el ecosistema, no construir piezas nuevas.
Siempre preguntarse: ¿esto conecta mejor lo que ya existe?
Siempre priorizar en este orden: 1) Conservar 2) Organizar 3) Conectar
4) Jerarquizar 5) Optimizar.
NO priorizar: nuevos módulos, nuevos dashboards, nuevas arquitecturas.
Explícitamente PROHIBIDO en esta fase: rehacer Dashboard, rehacer
Laboratorios, rehacer Backend, rehacer IA, rehacer Arquitectura,
rehacer EIARC.

REGLAS DE OPERACIÓN QUE YA ESTABLECIMOS (no las repitas, solo cúmplelas):
- NUNCA hacer git add/commit/push/merge/rebase sin autorización
  explícita mía en el mensaje actual (una autorización pasada no
  aplica a mensajes futuros).
- Antes de cualquier cambio, mostrar git status; al final de cualquier
  fase de solo-lectura, mostrar git status de nuevo.
- Preservar historial de git (usar git mv, nunca borrar+recrear).
- Cuando yo diga "SOLO LECTURA" o "NO IMPLEMENTAR", eso significa
  literalmente cero archivos tocados, cero código propuesto.
- Cuando yo diga "IMPLEMENTACIÓN CONTROLADA" o dé una fase de
  ejecución, seguir exactamente el alcance permitido/prohibido que
  yo defina en ese mensaje, ni más ni menos.

MI FORMA DE TRABAJAR:
- Trabajo por fases numeradas (FASE 7X, FASE 8X, FASE 9X...). La
  última fase completada fue FASE 9B.1 (Knowledge Hub Stabilization).
  Las siguientes fases planeadas son FASE 9C (Ecosystem Consolidation),
  FASE 9D (Dashboard Repositioning), FASE 9E (Professional Telemetry),
  FASE 9F (Portal + Roles) y FASE 10 (Advanced Ecosystem Integration).
  Si te pido continuar sin especificar, la siguiente sería FASE 9C.
- Cada fase declara su MODO (solo lectura / auditoría / ejecución /
  diseño) al inicio — respeta ese modo estrictamente durante toda
  la fase.
- Espero respuestas fundamentadas en evidencia real del repositorio
  (código, commits, documentos), no en suposiciones.

ACCIÓN INMEDIATA AL RECIBIR ESTE PROMPT:
1. Confirma que entendiste el estado descrito arriba.
2. Pregúntame si tengo pendiente pegarte el contenido completo de los
   4 documentos de visión (V10, 2030, Blueprint, Visual System) antes
   de continuar, en caso de que la fase que te voy a pedir los necesite.
3. Pregúntame cuál es la fase o tarea que quiero abordar ahora.
NO empieces a auditar el proyecto desde cero. NO propongas un plan
todavía. Espera mi siguiente instrucción.
```

---

## 2. PROMPT 2 — Estado operativo detallado (pegar solo si Claude lo pide o si vas a trabajar en brechas técnicas)

```
SIGCT-RURAL — ESTADO OPERATIVO DETALLADO
(complemento del prompt de continuidad; úsalo como referencia de
brechas técnicas reales, no como plan de acción — el plan lo doy yo)

1. QUÉ ES SIGCT-RURAL
Proyecto productivo ADSO-SENA: plataforma híbrida Cloud/Edge que
integra IoT, IA y educación técnica para agricultura sostenible e
inclusión tecnológica rural en Colombia. Construido por un solo
estudiante con apoyo de IA. Su identidad real, descubierta durante
este proceso, no es "una app agrícola" sino un sistema que se
distingue por auditar y corregir sus propias afirmaciones
(arquitectura de gobernanza EIARC), en vez de prometer más de lo que
puede demostrar.

2. LO QUE YA ESTÁ CONSOLIDADO (no repetir, no re-auditar)
- Gobernanza documental: completo. Precedencia de fuentes de verdad
  resuelta en SYSTEM_BOOT §18; 42+ archivos raíz reorganizados con
  git mv; mergeado a main vía PR #13.
- README / diagramas Mermaid: completo. Leyenda, subgrafos y
  renderizado corregidos y verificados.
- AI Service (incidente Docker): recuperado. Diagnóstico forense
  confirmó imagen ya reconstruida y saludable; no requirió rebuild
  destructivo.
- Knowledge Hub (MVP): funcional, 49 documentos, 6 categorías,
  verificado con navegador real, cero CDN en código nuevo, y ahora
  además recuperado y estabilizado en Docker (FASE 9B.1: 49/49
  documentos operativos, Mermaid ✅ TOC ✅ Anclas ✅ Docker ✅ Build ✅).
- Docker: corregido. Causa raíz (Docker Build Context) identificada y
  resuelta — el código actual ya coincide con lo desplegado.
- Visión canónica de producto (V10): completo (diseño).
- Visión de ecosistema 2030: completo (diseño).
- Blueprint de experiencia V10: completo (diseño).
- Sistema visual de experiencia V10: completo (diseño, FASE 8J).
- Backend: operativo, estable, sin cambios estructurales.
- AI Service: operativo, integrado, no intervenido.

3. LO QUE FALTA — TÉCNICO (código real)
Basado en auditoría directa del repositorio (no solo documentación):
- Refactor hexagonal modular (contexts/{labs,telemetry,ai_advisory,
  identity}/): decisión tomada, 0% materializada en código en ninguna
  rama, incluida feature/refactor-modular-contexts. Hoy coexisten dos
  capas hexagonales paralelas (api/logic/ V2 y core/+infrastructure/
  V3) sin dividir aún por contexto.
- Capa Edge/IoT real (src/embedded/): los tres archivos clave
  (mqtt_broker.py, tflite_api.py, sensor_reader.py) están en 0 bytes.
  No existe ingestión real de hardware BeagleBone Black; no está en
  docker-compose.yml. Telemetría hoy es simulada con fallback honesto
  (source_mode), pero no hay pipeline real de campo.
- Identidad/Auth: sin JWT real, sin endpoints /api/auth/* operativos
  end-to-end; login funciona por token demo/mock.
- Seguridad de despliegue: DEBUG=True, ALLOWED_HOSTS=['*'], CORS
  abierto, credenciales en texto plano en .env — pendientes de
  endurecer para producción.
- Migraciones de base de datos: se detectaron históricamente hasta 20
  migraciones sin aplicar en el entorno vivo (causa raíz de errores
  ProgrammingError en telemetría) — verificar estado actual antes de
  continuar.
- schema_postgresql.sql: declarado obsoleto por EIARC (las
  migraciones son la fuente de verdad), pero el archivo no se ha
  regenerado/formalizado.
- Decisión técnica pendiente (KB-006): si las pruebas del backend
  deben arrancar Django globalmente o mantenerse desacopladas (test
  suite pura de dominio) — decisión de arquitectura sin resolver.

4. LO QUE FALTA — INVESTIGACIÓN EN IA (AI Research V2)
- Programa de investigación completamente diseñado, casi nada
  entrenado: taxonomía de 16 clases (tomate/papa/maíz), esquema de
  etiquetas, framework de calidad de datos y especificación de
  particiones ya definidos y en estado "GO".
- El dataset base (PlantVillage) no está materializado dentro del
  repositorio — vive en un disco local aparte del control de
  versiones.
- Ningún modelo multiclase ha sido entrenado todavía. Lo único
  desplegado en producción es un clasificador binario (sano/enfermo)
  que ya tuvo un bug grave de falsos diagnósticos específicos — bug
  ya corregido y auditado (cadena de 4 documentos: auditoría → diseño
  de corrección → auditoría de implementación → reporte de
  remediación, verificado como aplicado en el código de main).
- Fase 3 del plan de ejecución (benchmark real con 4 arquitecturas
  candidatas) no ha comenzado.
- Líneas de investigación adicionales (salud animal, telemetría IA,
  audio, señales, fusión multimodal) existen solo como diseño en
  documentos — 0% de código.

5. LO QUE FALTA — PRODUCTO/EXPERIENCIA (UX)
Todo lo diseñado en FASE 8F/8I sigue mayormente sin implementarse,
con avances parciales logrados en FASE 9A:
- TopNav: ya NO apunta a "Docs (v5.0)" legacy (resuelto en FASE 9A) —
  "Conocimiento" está integrado.
- Tarjeta "Documentación Técnica": ya NO aparece como categoría
  visible dentro de Laboratorios (resuelto en FASE 9A) — verificar que
  no queden enlaces externos sin relación (Web3, DevOps) mezclados con
  Laboratorios reales.
- Dashboard: sigue mostrando telemetría sobredimensionada, espacios
  desaprovechados y baja densidad informativa. Pendiente: compactación,
  jerarquía, optimización visual (FASE 9D).
- Páginas Docs*.jsx legacy: pendiente de confirmar si ya fueron
  retiradas tras la recuperación del Knowledge Hub en FASE 9B.1, o si
  aún coexisten generando llamadas a CDN externos.
- Ningún elemento de la interfaz muestra hoy, de forma visible, la
  procedencia (source_mode, confianza, alcance) que sí existe en el
  backend — la "capa de honestidad" está construida en el código pero
  invisible en pantalla.

6. ESTADO ACTUAL POR COMPONENTE (corte 19-jul-2026)
- Arquitectura: 95%
- Gobernanza: 95%
- Documentación: 90%
- Knowledge Hub: 95%
- Backend: 90%
- IA: 85%
- Laboratorios: 90%
- Dashboard: 75%
- Telemetría: 70%
- Integración global: 80%
- Estado general del ecosistema: ≈85% completado

7. ROADMAP SUGERIDO (orden de prioridad, sin ejecutar sin autorización)
1. FASE 9C — Ecosystem Consolidation: clasificación definitiva de
   Laboratorios, Conocimiento, Formación, Referencias, Investigación,
   IA y Telemetría. Estimado: 3-5 días / 2-4 días según documento base.
2. Portal de entrada con roles (Visitante, Estudiante, Investigador,
   Operador, Administrador) — FASE 9F. Estimado: 4-5 días.
3. FASE 9D — Dashboard Repositioning: NO es rediseño, solo
   compactación, jerarquía y aprovechamiento de espacio. Estimado:
   3-5 días.
4. FASE 9E — Professional Telemetry: estilo Grafana/Azure
   Monitor/Prometheus/NVIDIA, sin tocar backend. Estimado: 4-6 días.
5. FASE 10 — Advanced Ecosystem Integration: conectar IA, Conocimiento,
   Investigación, Laboratorios y Telemetría. Estimado: 5-7 días.
6. (Pendiente de decisión de orden con el bloque técnico: refactor
   hexagonal modular, hardening de seguridad de despliegue, y
   benchmark de las 4 arquitecturas de IA candidatas siguen abiertos
   y no están en la numeración FASE 9 — retomar solo si yo lo indico.)

Estimación global de estas 5 fases (FASE 9C a FASE 10): trabajando 8
horas diarias, 15 a 25 días hábiles (120 a 200 horas) para una primera
versión consolidada y coherente de SIGCT-Rural.

8. RECOMENDACIÓN PENDIENTE DE MI DECISIÓN
Antes de tocar Dashboard o Telemetría, se sugirió ejecutar una FASE 9C
FORENSIC DOCUMENTATION AUDIT para verificar que README, MASTERDOC,
AI Research V2, EIARC, Knowledge Base, Histórico, Bitácoras,
Governance, Runbooks y el commit 8b22f3e reflejen fielmente el estado
real. Esto NO se ha ejecutado — requiere mi autorización antes de
iniciar.

NO propongas empezar ninguna de estas fases todavía. Espera mi
instrucción sobre cuál abordar.
```

---

## 3. Resumen narrativo del estado del proyecto (respaldo — no pegar en Claude)

### 3.1 Situación inicial
El ecosistema había avanzado enormemente en arquitectura, refactorización por contextos, gobernanza, AI Research, Knowledge Base, Laboratorios y Dockerización — pero existía una brecha entre **lo construido** y **lo visible**. El sistema estaba técnicamente maduro; la experiencia aún no reflejaba esa madurez.

### 3.2 Fases ejecutadas recientemente

| Fase | Definió | Resultado |
|---|---|---|
| **8G** — Canonical Product Vision | Qué es SIGCT-Rural | Identidad oficial |
| **8H** — Ecosystem Vision 2030 | Qué puede llegar a ser | Visión estratégica |
| **8I** — Experience Blueprint | Cómo debe sentirse | Arquitectura emocional |
| **8J** — Visual Experience System | Cómo debe verse | Lenguaje visual |
| **9A** — UX Consolidation | Integrar "Conocimiento" en TopNav, retirar "Docs v5.0" y "Documentación Técnica" visibles, introducir gramática Verificado/Simulado/Planeado | Coherencia inicial |
| **9B** — Forensic Audit | Docker desplegaba una imagen antigua | Causa raíz identificada: Docker Build Context |
| **9B.1** — Knowledge Hub Stabilization | Recuperación completa | 49/49 documentos operativos; Mermaid, TOC, anclas, Docker y build verificados |

### 3.3 Estado actual del sistema por área

| Área | Estado | Pendiente |
|---|---|---|
| Backend | ✅ Operativo / estable | — |
| IA Predictiva | ✅ Operativa | — |
| AI Service | ✅ Operativo | — |
| Docker | ✅ Corregido | — |
| Knowledge Hub | ✅ Operativo (recuperado) | Banner README |
| Dashboard | 🟡 Funcional | Compactación, jerarquía, optimización visual |
| Telemetría | 🟡 Funcional | Visualización profesional, mejor aprovechamiento de espacio, mayor densidad informativa |
| Laboratorios | 🟡 Muy sólidos | Clasificación conceptual (mezclan Laboratorios, Cursos, Referencias, Blockchain, DevOps, OCW) |

### 3.4 Regla de oro vigente (FASE 9)

**Prohibido:** rehacer Dashboard, Laboratorios, Backend, IA, Arquitectura o EIARC.
**Sí hacer:** consolidar, organizar, clasificar, conectar, jerarquizar.
**Pregunta guía:** ¿esto conecta mejor lo que ya existe?
**Prioridad:** 1) Conservar 2) Organizar 3) Conectar 4) Jerarquizar 5) Optimizar.
**No priorizar:** nuevos módulos, nuevos dashboards, nuevas arquitecturas.

### 3.5 Matriz de finalización (fases futuras)

| Fase | Objetivo | Duración estimada |
|---|---|---|
| 9C — Ecosystem Consolidation | Clasificación definitiva de Laboratorios, Conocimiento, Investigación, IA, Formación, Referencias, Telemetría | 3-5 días |
| 9D — Dashboard Repositioning | Reducir espacio muerto, compactar telemetría, mostrar ecosistema, mantener identidad (no rediseño) | 3-4 días |
| 9E — Professional Telemetry | Estilo Grafana / Azure Monitor / Prometheus / NVIDIA, sin tocar backend | 4-6 días |
| 9F — Portal + Roles | Visitante, Estudiante, Investigador, Operador, Administrador | 4-5 días |
| 10 — Ecosystem Integration | Conectar IA, Conocimiento, Investigación, Laboratorios, Telemetría | 5-7 días |

**Estimación global (8h diarias):** 15 a 25 días hábiles ≈ 120 a 200 horas para una primera versión consolidada y coherente.

### 3.6 Valoración por componente (corte 19-jul-2026)

Arquitectura 95% · Gobernanza 95% · Documentación 90% · Knowledge Hub 95% · Backend 90% · IA 85% · Laboratorios 90% · Dashboard 75% · Telemetría 70% · Integración global 80%
**Estado general del ecosistema: ≈85% completado.**

### 3.7 Plan semanal sugerido (del informe técnico ejecutivo)

- **Semana 1:** FASE 9C — Consolidación Ecosistema (5 días)
- **Semana 2:** Portal de entrada, roles, acceso (5 días)
- **Semana 3:** Dashboard + Telemetría (5 días)
- **Semana 4:** Ajustes, pruebas, documentación (5 días)
- **Total:** 15 a 20 días hábiles ≈ 120 a 160 horas

### 3.8 Recomendación inmediata registrada (pendiente de tu decisión)

Antes de tocar Dashboard o Telemetría: ejecutar una **FASE 9C FORENSIC DOCUMENTATION AUDIT** que verifique README, MASTERDOC, AI Research V2, EIARC, Knowledge Base, Histórico, Bitácoras, Governance, Runbooks y el commit `8b22f3e`, junto con las bitácoras de FASE 9A, 9B y 9B.1 — y que genere `SIGCT_RURAL_FORENSIC_STATUS_REPORT_V1`.

---

## 4. Documentos de apoyo del repositorio (referencia rápida)

Estos documentos ya existen como archivos dentro del proyecto. No hace falta pegarlos en el chat — Claude Code puede leerlos directamente del disco si trabajas localmente. Se listan aquí para que sepas cuál citar si una fase los necesita.

| Documento | Contenido | Ruta de referencia |
|---|---|---|
| `AI_PIPELINE.md` | Flujo de entrenamiento e inferencia de IA (PlantVillage, FastAPI, notebooks, endpoints `/health` `/models` `/infer`) | raíz / `docs/` |
| `API_REFERENCE.md` | Endpoints backend Django/DRF: auth JWT, proyectos, sensores, IA (`/api/ia/classify/`), y API v2 hexagonal (`/api/v2/telemetry/history/`, `/api/v2/ai/crop-advice/`) | raíz / `docs/` |
| `CONTINUITY_RUNBOOK.md` | Checkpoint de continuidad técnica: `scripts/continuity_check.ps1`, `verify_refactor.ps1/.sh`, estado verificado 2026-07-04 (50 tests de dominio de laboratorios OK) | raíz / `docs/` |
| `DEPLOYMENT.md` | Desarrollo local (backend Django, frontend Vite), variables de entorno, plan de despliegue Cloud y Docker (aún no incluye `docker-compose.yml` según este doc — contrastar con estado FASE 9B que ya reporta Docker corregido) | raíz / `docs/` |
| `DEPLOYMENT_AWS.md` | Guía paso a paso AWS Free Tier: frontend en S3+CloudFront, IA en App Runner/EC2, backend opcional en Elastic Beanstalk | raíz / `docs/` |
| `EDGE_SETUP.md` | Configuración de los 3 nodos BeagleBone Black (Gateway MQTT, IA TFLite, Sensores) — **nota:** contrastar con la brecha técnica ya documentada de que `mqtt_broker.py`, `tflite_api.py` y `sensor_reader.py` están en 0 bytes | raíz / `docs/` |
| `puppeteer-config.json` | Configuración de Puppeteer para verificación con navegador real (Edge en Windows) usada en la validación del Knowledge Hub | raíz |
| `SIGCT_RURAL_SYSTEM_BOOT.md` | Fuente de verdad de precedencia documental (sección 18) | `docs/` |
| `MASTERDOC.md` | Bitácora oficial del proyecto | `docs/` |
| `PLAN_MAESTRO.md` | Autoridad sobre fases | `docs/` |
| `ADSO_GUIA_TECNICA_REFACTORIZACION_HEXAGONAL_SIGCTIARURAL.md` | Autoridad sobre detalle técnico del refactor hexagonal | raíz / `docs/` |
| `HEXAGONAL_REFACTOR_PLAN.md` | Plan del refactor hexagonal (citado también en `CONTINUITY_RUNBOOK.md`) | `docs/` |

⚠️ **Contradicción a verificar en una futura auditoría (no la resuelvas ahora, solo queda registrada):** `DEPLOYMENT.md` dice que el repositorio "actualmente no incluye `docker-compose.yml`" y que Docker está en fase de "Plan", mientras que el informe de estado FASE 9B/9B.1 (sección 3 de este documento) reporta Docker ya corregido y funcionando en producción con Build → Imagen → Contenedor. Esto sugiere que `DEPLOYMENT.md` quedó desactualizado respecto al avance real — es exactamente el tipo de brecha que la FASE 9C FORENSIC DOCUMENTATION AUDIT (sección 3.8) debería resolver.

---

## 5. Notas de organización de este documento

- Este archivo consolida: el reporte de estado de fecha 19-jul-2026 (secciones 1, 3), el "Documento 1" y "Documento 2" que ya habías redactado como prompts de continuidad (secciones 1 y 2), y un índice de los documentos de apoyo subidos (sección 4).
- No se alteró ninguna regla, cifra, ruta de archivo, nombre de fase ni contenido técnico de lo que ya habías escrito — solo se reorganizó el formato (se limpiaron los artefactos de copiado tipo "Plain Text" / "Mostrar más líneas" del export original) y se fusionaron los dos prompts que tenías sueltos en una secuencia clara de uso: PROMPT 1 primero, PROMPT 2 si hace falta profundidad técnica.
- Pendiente explícito, sin resolver por este documento: decidir si guardas este archivo dentro del repositorio (requiere tu autorización de escritura) y si pegas el contenido completo de los 4 documentos de visión (V10, 2030, Blueprint, Visual System) en una próxima sesión.
