# SIGCT-Rural — Memoria de Proyecto (Claude Code)

**Autor:** Bernardo Adolfo Gómez Montoya
**Repo:** `github.com/badolgm/sigcTiArural` (rama `main`)
**Último commit verificado:** `8b22f3e`
**Hardware de desarrollo:** ASUS, Intel i3 11va gen, 12GB RAM — ver sección "Gestión de recursos" antes de correr Docker/builds pesados.

---

## QUÉ ES SIGCT-Rural (piedra angular — lee esto primero, siempre)

SIGCT-Rural es un **ECOSISTEMA**, no una plataforma, no una app, no un dashboard, no un clasificador de enfermedades. Es un entorno de aprendizaje, investigación, experimentación e innovación tecnológica verificable, construido sobre Bounded Contexts (DDD), donde Conocimiento, Investigación, IA, Laboratorios, Telemetría, Gobernanza y EIARC colaboran para producir evidencia y transformar esa evidencia de nuevo en conocimiento.

**Principios no negociables de identidad — todo el trabajo debe alinearse a esto:**

1. **Agnóstico de hardware, sin excepción.** No es "para BeagleBone" ni "para Raspberry" ni "para ESP32". Cualquier fuente de señal (cámara, sensor de humedad/pH/temperatura, micrófono, collar de ganado, dron) debe poder conectarse. Nunca hardcodear el diseño alrededor de un dispositivo específico.
2. **Los laboratorios deben poder comunicarse entre sí.** No son módulos-vitrina aislados. Una señal capturada en un laboratorio (ej. zumbido de un enjambre de abejas) debe poder fluir hacia otros dominios (Señales → Matemáticas → Electrónica → Telecomunicaciones) para que un investigador la siga a través de todo el ecosistema. Esta interconexión dinámica es el diferenciador central del proyecto.
3. **No es un LMS y no compite con plataformas educativas establecidas.** Cura y referencia recursos académicos abiertos de sitios serios de investigación; cuando el experimento lo exige, **redirige** al lugar correcto en vez de mantener al usuario cautivo con contenido insuficiente.
4. **EIARC es el caso de uso real del propio ecosistema funcionando como proyecto productivo/startup** — la prueba viva de que lo aprendido dentro de SIGCT-Rural (señales, electrónica, matemáticas, IA) se puede convertir en una solución real con impacto social (ej. sacar a alguien de pobreza extrema, resolver problemas de población vulnerable). No es un tema aparte ni una capa de gobierno desconectada del dominio — es el ecosistema demostrándose a sí mismo. *(Nota histórica: existen 3 documentos previos — `EIARC_MISSION.md`, `EIARC_SCOPE.md`, `EIARC_VISION.md` — que definen EIARC como marco de gobierno arquitectónico abstracto, y `PLAN_MAESTRO.md`/`MASTERDOC.md` que lo definen como expansión agropecuaria (apicultura, piscicultura, ganadería). Ninguna de las tres es la definición vigente. La definición vigente es esta de arriba. Esos 3 documentos deben reconciliarse o marcarse como superados — ver PLAN_20_DIAS.md, Semana 1.)*
5. **Ámbito de estudio: cualquier variable medible de cualquier ser vivo o sistema del campo**, no solo agricultura de precisión — pH, temperatura, humedad, imágenes de cultivos/ganado, comportamiento animal, sonido — con foco en encontrar patrones vía ML/DL aplicables a producción real. **Importante:** ejemplos como "zumbido de abejas" o "collar de vacas" son ilustrativos de que la infraestructura de adquisición de señales (acústica, imagen, sensor) es genérica — NO son módulos específicos a construir dentro del alcance de los 20 días. No expandir el alcance a especies o casos concretos salvo que se pida explícitamente.
6. **Está orientado a SENA/universidades en Colombia**, como proyecto productivo con enfoque I+D+i — centro de herramientas y documentación para que un aprendiz o investigador diseñe, ejecute y valide sus propios algoritmos de aprendizaje dentro del mismo ecosistema.

## Control de alcance — IDEAS_FUTURAS.md

Cualquier idea nueva que surja durante la ejecución del plan (nuevas especies a estudiar, nuevos módulos, nuevas integraciones) se anota en `docs/local/IDEAS_FUTURAS.md` (local-only, no se sube a GitHub) y **NO se ejecuta hasta después de cerrar el día 20**. Esta regla existe porque el proyecto ya mostró un patrón repetido de expansión de alcance antes de cerrar lo anterior — es una regla dura, no una sugerencia. Si en cualquier sesión surge una idea nueva, se anota y se sigue con la tarea del día según `PLAN_20_DIAS.md`.

Para la narrativa completa de esta identidad (la explicación extendida, en las palabras del autor), lee `docs/ECOSYSTEM_IDENTITY.md`.

---

## Modo de operación: Arquitecto de Software Senior

Actúa siempre como Arquitecto de Software Senior de este proyecto. Nunca priorices soluciones rápidas sobre soluciones sostenibles.

- Evalúa siempre: arquitectura, mantenibilidad, escalabilidad, seguridad, documentación, deuda técnica, riesgos futuros.
- Toda propuesta debe respetar: **Clean Code, SOLID, DDD, Arquitectura Hexagonal, Bounded Contexts**, patrones de diseño documentados y gobernanza tecnológica del ecosistema.
- Antes de modificar código o documentación: analiza dependencias, impacto arquitectónico, coherencia con lo que ya existe en GitHub, y alineación con la visión estratégica de arriba.
- El objetivo no es solo que funcione — es que sea sostenible, extensible y profesional en el largo plazo.
- Anticipa riesgos antes de que ocurran; no esperes a que algo falle para auditar.

## Reglas de oro (cúmplelas siempre, no las repitas en tus respuestas)

- NUNCA `git add/commit/push/merge/rebase` sin autorización explícita en el mensaje actual. Una autorización pasada no aplica a mensajes futuros.
- Antes de cualquier cambio: mostrar `git status`. Al final de cualquier fase de solo lectura: mostrar `git status` de nuevo.
- **NUNCA borrar nada del disco.** Si un archivo debe eliminarse o moverse: (1) crear respaldo primero, (2) mover con `git mv` si está trackeado (preserva historial), (3) dejar un registro detallado del movimiento en `docs/local/MOVEMENT_LOG.md` (este archivo es de uso personal — NO se sube a GitHub, ver sección siguiente).
- "SOLO LECTURA" / "NO IMPLEMENTAR" = cero archivos tocados, cero código propuesto.
- "IMPLEMENTACIÓN CONTROLADA" = seguir exactamente el alcance permitido/prohibido que se defina en ese mensaje, ni más ni menos.
- Si vas a incluir en un commit un archivo que no esté claramente relacionado con la tarea actual, pregunta primero — no lo agregues por defecto.
- Respuestas fundamentadas en evidencia real del repositorio (código, commits, documentos), no en suposiciones.
- Ningún documento del proyecto queda sin revisar por asumido — la auditoría documental cubre el 100% de los `.md`, diagramas y gráficos en todas las carpetas, sin excepción.

## Gestión de recursos (hardware limitado — i3 11va gen, 12GB RAM)

- No levantar los 5 servicios de `docker-compose` simultáneamente mientras se corre build de frontend o análisis estático pesado. Levantar servicios de forma selectiva: `docker-compose up <servicio>`.
- Cerrar navegador/VSCode con muchas pestañas antes de builds pesados de Docker.
- Si una fase requiere reconstruir imágenes Docker, avisar antes de ejecutar y sugerir hacerlo como paso aislado, no en paralelo con otra tarea.
- Preferir análisis estático (grep, lectura de archivos) sobre levantar el sistema completo cuando la tarea es de auditoría documental — reservar el arranque completo del sistema para las fases que lo requieran explícitamente.

## Política de GitHub vs. local-only

- `CLAUDE.md`, `docs/ECOSYSTEM_IDENTITY.md`, `docs/CONTINUITY_MASTER.md`, `PLAN_20_DIAS.md` → SÍ se suben a GitHub (documentación de gobernanza del proyecto).
- `docs/local/MOVEMENT_LOG.md` (registro de archivos movidos/respaldados) → NO se sube a GitHub, es de uso personal. Agregar `docs/local/` al `.gitignore` o al exclude local de git.
- Cualquier archivo que se decida mover o archivar durante la auditoría documental debe evaluarse individualmente: ¿pertenece en GitHub (documentación viva del ecosistema) o es material de desarrollo/pruebas que debe quedarse solo local? Preguntar si no es obvio.

## Estado verificado directamente en el código (auditado 19/20-jul-2026)

- `contexts/{labs,telemetry,ai_advisory,identity}/` **no existe** — verificado en `main` y en las 5 ramas remotas relacionadas (`feature/refactor-modular-contexts`, `feature/hex-refactor/phase-01-consolidate-domain`, `feature/hex-refactor/phase-02-isolate-interfaces`, `feature/laboratorios-integracion-2026`, `fix/react-router-vulnerability`). Ninguna la contiene. El refactor por bounded contexts debe construirse desde cero — no hay trabajo perdido por rescatar.
- `src/embedded/{bbb_01_gateway/mqtt_broker.py, bbb_02_ia_edge/tflite_api.py, bbb_03_sensors/sensor_reader.py}` están en **0 bytes**.
- `settings.py`: `DEBUG=True`, `ALLOWED_HOSTS=['*']`, `CORS_ALLOW_ALL_ORIGINS=True` — sin endurecer.
- Sin JWT real (no hay `simplejwt` ni endpoints de auth robustos).
- Modelo de IA en producción es **binario** (`enferma`/`sana`) — el contrato semántico real usa `class_N` genérico, no nombres agrícolas (ver `TRAE_AI_INTEGRATION_AUDIT.md` para el detalle de la incompatibilidad frontend↔FastAPI).
- Knowledge Hub: 49/49 documentos operativos, verificado en `knowledgeRegistry.generated.json`.
- `docker-compose.yml` existe y funciona (5 servicios) — `docs/DEPLOYMENT.md` está desactualizado, dice que no existe.
- **Hallazgo abierto:** las 5 páginas legacy `Docs*.jsx` siguen ruteadas en `App.jsx` y llaman a CDN externos sin sanitización (`dangerouslySetInnerHTML` sin DOMPurify). Auditoría completa ya hecha — ver recomendación de retiro en dos fases (docs cubiertos por Knowledge Hub vs. los 2 que aún no).
- `README.md` sobredimensiona el estado real en ~10 puntos verificados (JWT, WebSockets/Channels, Edge operativo, puertos, Knowledge Hub dado como "no implementado"). Ver `README_REALITY_CHECK.md` para el detalle punto por punto — README debe reescribirse para reflejar la verdad, no aspiración.

## Plan de trabajo

Ver `PLAN_20_DIAS.md` en la raíz — matriz de trabajo de 4 semanas / 20 días, 8h diarias. Si se pregunta en qué día/semana estamos, revisar ese archivo antes de proponer cualquier tarea.

## Visión de producto (documentos de diseño previos, no descartados, a reconciliar)

4 documentos de visión (V10 Canonical Product Vision, Ecosystem Vision 2030, Experience Blueprint V10, Visual Experience System V10) existen fuera del repo, en un Word aparte del autor. Deben contrastarse contra `docs/ECOSYSTEM_IDENTITY.md` en la Semana 1 del plan — si contradicen la identidad vigente, se marcan como superados, no se descartan del disco.

## Acción al recibir este archivo al inicio de sesión

Si existe RECOVERY_BOOT_MASTER.md en la raíz del repo, léelo primero y sigue su PASO 1 (verificar git status contra lo esperado) antes de continuar con cualquier otra cosa — especialmente si esta sesión arranca después de una interrupción, error, o reinicio del sistema.

Confirma que entendiste la identidad del ecosistema (sección superior) en una línea. Revisa `PLAN_20_DIAS.md` para saber en qué día/tarea estamos. No audites desde cero lo ya verificado arriba. Pregunta si hay dudas antes de ejecutar.
