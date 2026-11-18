# 🗄️ UBTN — Evolución de Persistencia (Base de Datos) — ADR-18

## Universal Biological Telemetry Node — Camino de almacenamiento de lecturas y ráfagas

| Campo | Valor |
|-------|-------|
| **Versión** | 1.0.0 (diseño — sin implementación) |
| **Fecha** | 2026-09-13 |
| **Rama** | `feature/ubtn-biological-telemetry` |
| **Estado** | 🔷 Diseño — formaliza `ADR-UBTN-18` |
| **Decisión** | Línea base: PostgreSQL para catálogo y resúmenes + bucket de objetos para ráfagas (denormalizado); C (away de la tabla relacional) solo si el volumen de series lo exige |

---

## 1. Propósito y Alcance

Definir **qué se persiste, dónde y evoluciona** cada artefacto del dominio UBTN en el tiempo. Respeta tres realidades:

1. `BiologicalReading` es el agregado de mayor tasa de escritura.
2. `burst` (ráfagas de SPS alto) es volumétricamente insostenible en filas relacionales normales.
3. El ecosistema ya tiene un esquema (V1–V3); UBTN no debe contaminarlo, pero aprovecha la misma infraestructura.

---

## 2. Artefactos Persistidos

| Artefacto | Persistencia | Forma | Nota |
|---|---|---|---|
| `AnimalSubject` | relacional | fila `subject` (id, species, perfil, active) | catálogo de corto/largo plazo |
| `BiologicalNode` | relacional | fila `node` + `node_channel` | inventario + vínculo + estado |
| `BiologicalReading` | relacional + objeto | fila resumen en `subset_reading` + **bucket de objetos** para burst | resumen semántico SIEMPRE en PG |
| Ráfagas `burst` | object store | JSON de muestras (comprimida) con `samples_uri` | columna `samples_uri` referencia el blob |
| Export/cache de IA | object store / cache | series de ventana preparadas | evita reformatear cada vez |

> `subset_reading` es el nombre propuesto de la tabla bio (sin conflicto con `sensor_reading`).

---

## 3. Estructura Táctica por Artefacto

### `subset_reading` (BiologicalReading — resumen)

```text
- id             uuid pk
- subject_id     fk subject.id        (referencia, no objeto)
- node_id        fk node.id           (referencia)
- captured_at    timestamptz          (eje binning)
- metrics        jsonb                (channels → {value, unit} ejemplo: HR, RR, temp)
- reading_signature  text unique      (dedup ADR-10)
- placement      text                 (neck/ear/body)
- burst_token    uuid null            (link a ráfaga si es de burst)
- created_at     timestamptz default now()
- quality_flags  jsonb default '{}'   (QualityPolicy: low_quality, flat_line...)
```

Índices: btree `(node_id, captured_at)`, `(subject_id, captured_at)`, unique `(reading_signature)`, hash `subject_id`.

### `burst` (ráfaga — objeto en bucket)

```text
samples_uri:  s3://ubtn/burst/{year}/{month}/{node_id}/{burst_token}.json.gz
n_samples:    3000
sps:          125            (Hz del canal)
channels:     [ecg, ppg]
compression:  gzip
```

La fila es solo **puntero + metadatos** (burst_token, n_samples, sps). El blob se descarga a demanda (análisis forense; se invierte la regla "datos pesados no se siguen en cada query").

---

## 4. Línea Base vs Evolución (Rutas por ADR)

| Etapa | Almacén | Motivo | Costo de migración |
|---|---|---|---|
| **B** (base, U1/U2) | PG relacional jsonb + bucket | desarrollo, MVP, instrumentación | nulo (nativo) |
| **C** (U4–U5 si volumen) | timeseries columnar (Citus/Timescale/similar) para `subset_reading` | series largas de SPS medio | ASÍNCRONA: replicación + ventana, nunca corte |
| **D** (U6) | event sourcing de SOLO eventos (auditoría) | trazabilidad de nodos/sujetos | read-only: no reemplaza B/C |

> Regla audaz: NO "migrar a Wikidata/columnar porque sí". La puerta C se abre **solo con umbral**: > 10 M filas en `subset_reading` o > 60% de query de analítica tardando > 2 s. Ver criterios en §6.

---

## 5. Escalado Físico (Volumen Referencial)

| Escenario (fase) | Lecturas/día | Filas/día | Estrategia |
|---|---|---|---|
| Finca pequeña (U1) | 2 nodos × 300 | 600 | PG simple, sin tuning |
| Finca mediana (U2) | 10 nodos × 300 | 3 000 | índice + partición mensual |
| Finca grande (U3) | 40 nodos × 300 | 12 000 | partición + read replica (analítica) |
| Scale (U5) | 600+ nodos | 180 000+ | read replica + shard primera (hash) |

**Particionameniento base:** por mes en `captured_at`(bucketing) desde U2.

> Regla de particionado: partición por **ventana temporal** SIEMPRE que la analítica sea por "sujeto×ventana"; particionar por `node_id` solo si se consulta por nodo exclusivamente.

---

## 6. Criterios para Abrir la Puerta C (Timeseries Columnar)

| Umbral | Medida | Acción |
|---|---|---|
| 1 M | | nada (optimizar índice) |
| 5–10 M filas | conteo `subset_reading` | evaluar replica + ventana |
| >10 M o analítica >2s en >60% queries | benchmark | ADR-18 apertura C + partición + import asíncrono |

> Apertura SIEMPRE es ADR con reader-writer: se replica a nuevo store conservando PG como historial fuente. **Nunca un `ALTER` de masa en caliente.**

---

## 7. Integración con el ecosistema (lo COMPARTIDO vs lo NO)

| Elemento | Comparte infra | Comparte modelo/propiedad |
|---|---|---|
| PostgreSQL | ✅ (pool de conexiones, migración gestionada) | ❌ NO colateral al esquema V1 |
| Bucket S3/minio | ✅ | ❌ llave `ubtn/...` separada |
| Redis/cache | ✅ (pero bio NO escribe en caché de `SensorReading`) | silo solo interno de bio |

**Anti-patrón prohibido:** escribir en `sensor_reading` "por rapidez" y luego enmendar → reintroduce acoplamiento, rompe ADR-UBTN-17 P1 (no-migración retroactiva).

---

## 8. Monitoreo de Persistencia

| Métrica | Instrumento |
|---|---|
| Latencias p95/p99 de INSERT `subset_reading` | DB perf / métricas |
| `samples_uri` resolubles | object store health |
| Tamaño de particiones | auto-maintenance (vacuum/reindex) |
| Queries de analítica > 2 s | alerta de performance (cuidado antes de abrir C) |

---

## 9. Referencias

- [`UBTN_ADR_INDEX.md`](UBTN_ADR_INDEX.md) — ADR-UBTN-18 (esta decisión) y decálogo de no-regresión.
- [`UBTN_AGGREGATE_DESIGN.md`](UBTN_AGGREGATE_DESIGN.md) §3.1 — lectura inmutable, firma.
- [`UBTN_DATA_CONTRACTS.md`](UBTN_DATA_CONTRACTS.md) — burst_token y reading_signature.
- [`UBTN_MQTT_ARCHITECTURE.md`](UBTN_MQTT_ARCHITECTURE.md) — ingestión que alimenta estos almacenes.
- [`UBTN_TELEMETRY_EVOLUTION_STRATEGY.md`](UBTN_TELEMETRY_EVOLUTION_STRATEGY.md) §6 — rutas.

---

*Evolución de persistencia — diseño sin implementación. PG + bucket es la línea base; columnar es una evolución medida, no una premisa.*