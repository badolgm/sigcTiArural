# SIGCTiArural — Alineación de Visión durante la Refactorización Global

> **Estado:** U0.5 (Gate 0 → Spanish refactoring workflow). Diseño. Cero código.
> **Versión:** 1.0.0 | **Fecha:** 2026-09-14
> **Familia:** Refactorización Global (Gate U0.5)
> **Documento raíz canónico de identidad:** [`docs/ECOSYSTEM_IDENTITY.md`](ECOSYSTEM_IDENTITY.md) — este documento **no lo reemplaza**, lo operacionaliza.

---

## 1. Propósito

Definir **qué es SIGCTiArural** y cómo preservar esa identidad mientras se refactoriza el frontend/dashboard, el Hardware Catalog, la navegación y la línea UBTN.

La tentación recurrente de cualquier proyecto con telemetría es converger hacia un "dashboard IoT genérico". Este documento fija la respuesta defensiva: **SIGCTiArural es una plataforma educativa + científica + tecnológica + experimental**, y toda decisión de refactorización se evalúa contra esa definición.

---

## 2. La relación que es el corazón del sistema

```
Conocimiento
   │  (aprendizaje que se evidencia, no contenido que se consume)
   ▼
Laboratorios
   │  (contexto donde el conocimiento se convierte en evidencia)
   ▼
Hardware
   │  (instrumentos que producen señal real)
   ▼
Protocolos
   │  (el contrato honesto entre hardware y software)
   ▼
Telemetría
   │  (la señal se vuelve dato trazable)
   ▼
IA
   │  (el dato se vuelve interpretación con trazabilidad científica)
   ▼
Proyectos Reales
   │  (la interpretación se vuelve decisión de campo)
   ▼
Impacto (agricultor, estudiante, investigador)
```

**Regla de oro:** si una propuesta de refactorización **corta, salta o difumina** alguno de estos eslabones, se rechaza — sin importar cuán bonita sea la interfaz.

---

## 3. Principios de identidad (derivados de `ECOSYSTEM_IDENTITY.md`)

| # | Principio | Implicación operacional para el frontend |
|---|---|---|
| P1 | **No es una plataforma IoT** | El dashboard NO se limita a estados de nodos ni métricas en vivo. Eso es un componente mínimo, nunca la identidad de la página principal. |
| P2 | **Los laboratorios se comunican entre sí** | La navegación debe exponer que la señal fluye entre labs (Señales → Electrónica → Matemáticas → Telecom), no mostrar labs como cajas aisladas. |
| P3 | **No es un LMS** | El Knowledge Hub organiza documentación, pero "aprender haciendo" es evidencia generada en los labs, no contenido consumido. La interfaz debe privilegiar la generación de evidencia sobre la lectura. |
| P4 | **Agnosticismo hardware/software** | La capacidad se representa por rol (gateway, inferencia, adquisición), NO por marca/modelo. Un nodo se describe por lo que hace, no por ser "BBB-01". |
| P5 | **EIARC es la prueba, no el discurso** | La refactorización no menciona EIARC como slogan; lo demuestra con proyectos reales trazables (UBTN, agricultura, labs). |
| P6 | **La trazabilidad es evidencia** | Cada dato mostrado debe poder decir de dónde salió (laboratorio, sensor, experimento). Un dato sin procedencia es decoración. |

---

## 4. Elementos NO negociables

Estos no se negocian ni siquiera "temporalmente para avanzar más rápido":

1. **El flujo Conocimiento → ... → Proyectos Reales** se mantiene íntegro y visible.
2. **Los 4 laboratorios canónicos** (Agricultura, Electrónica, Robótica, Telecomunicaciones) continúan siendo estrategias de negocio con evidencia real (pattern Strategy/Factory/Port).
3. **El contexto `telemetry` y `SensorReading`** no se modifican ni reutilizan para biometrías (mandato ADR-UBTN-01..20).
4. **El Knowledge Hub** continúa siendo el portal documental local gobernado, fuente de dotación del RAG de Knowledge AI.
5. **El aprendizaje STEM y la evidencia del estudiante** (ADSO/SENA) prevalecen sobre cualquier feature cosmético.
6. **La no-regresión funcional** de los tres flujos coexistentes (V1/V2/V3) y de los 58 tests de dominio.
7. **Cero fotos falsas de salud:** el dashboard no puede presentar estado de hardware como si fuera capacidad operativa cuando no lo es (los scripts de borde = 0 bytes, integración física "en progreso").

---

## 5. Restricciones de diseño derivadas

- **Nada de Grafana, ThingsBoard, Home Assistant ni "dashboard IoT genérico":** se prohíbe copiar su IA (último estado a la izquierda, tiles de nodos, alertas automáticas sin contexto educativo).
- **Información de infraestructura = subordinada:** la infraestructura se muestra en una sección de operación (dónde vive la señal), NUNCA como la primera impresión del sistema.
- **Hardware Catalog ≠ inventario:** es un modelo de aprendizaje ("¿qué puedo aprender con esto?"), no una lista de SKUs ni un estado de disponibilidad.
- **Toda novedad de dashboard debe responder:** ¿ayuda a un estudiante a producir evidencia, a un investigador a trazar datos, o a un agricultor a decidir? Si ninguna → descartar.

---

## 6. Criterio de decisión (árbol de alineación)

```
Propuesta de refactorización
   ├─ ¿Fortalece o crea un eslabón de la cadena? → NO → RECHAZAR
   ├─ ¿Reproduce identidad de plataforma IoT genérica? → SÍ → REDISEÑAR
   ├─ ¿Depende de una marca de hardware para tener sentido? → SÍ → GENERALIZAR
   ├─ ¿Añade una fuente de datos sin procedencia? → SÍ → QUITAR o ANCLAR
   ├─ ¿Oculta estado verdadero (fallback → "online")? → SÍ → CORREGIR honestidad
   └─ ¿Produce evidencia educativa/científica trazable? → NO → DESCARTAR
```

---

## 7. Definición de "hecho" para la refactorización orientada a identidad

- La página principal representa **capacidades y conocimiento**, no los 3 BBB.
- Un estudiante ADSO puede trazar su evidencia desde un lab hasta un proyecto.
- Un investigador puede trazar cualquier dato mostrado hasta su fuente (lab/sensor/experimento).
- Un agricultor toma una decisión con la interpretación explicable (alerta ≠ diagnóstico).
- Los 4 labs canónicos y la cadena completa tienen representación de navegación explícita.
- El agnosticismo H/W se cumple en UI Y en el modelo mental (un gateway se llama "gateway", no "BBB-01").

---

## 8. Referencias

- [`docs/ECOSYSTEM_IDENTITY.md`](ECOSYSTEM_IDENTITY.md) — identidad canónica del ecosistema.
- [`SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md`](SIGCTIARURAL_LAB_CONNECTIVITY_MODEL.md) — mapa de laboratorios y flujos.
- [`SIGCTIARURAL_CAPABILITIES_VS_HARDWARE.md`](SIGCTIARURAL_CAPABILITIES_VS_HARDWARE.md) — hardware ≠ capacidad.
- [`SIGCTIARURAL_REFACTORING_GUARDRAILS.md`](SIGCTIARURAL_REFACTORING_GUARDRAILS.md) — qué no se rompe.
- [`SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md`](SIGCTIARURAL_DASHBOARD_REIMAGINED_V2.md) — propuesta de diseño del dashboard.
- [`docs/UBTN_INDEX.md`](UBTN_INDEX.md) — familia UBTN (26 documentos) alineada a esta visión.