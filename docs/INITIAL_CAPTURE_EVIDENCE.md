# INITIAL CAPTURE EVIDENCE

**Fecha:** 2026-10-05  
**Misión:** `CMSC_ORCHESTRATION_V2_FIELD_CAPTURE_RUN_001`  
**Tipo:** Evidencia de infraestructura (no de campo)

---

## 1. EVIDENCIA DE INFRAESTRUCTURA

### 1.1 Selftest del CLI

```
RESULTADO: 21/21 comprobaciones correctas
SELFTEST OK — el pipeline funciona de punta a punta.
El dataset real sigue intacto: 0 muestras.
```

**Qué prueba:** El flujo completo `WAV → decode → resample → QC → features → metadata → gates` funciona correctamente con audio sintético.

**Qué NO prueba:** No prueba que la captura real de campo haya ocurrido.

### 1.2 Build del frontend

```
npm run build → EXIT CODE = 0
```

**Qué prueba:** El frontend compila sin errores.

### 1.3 Estado del dataset

```
estado      : PREPARADO_VACIO
filas       : 0 en metadata.csv
WAV         : 0 en raw/
```

**Qué prueba:** El dataset está vacío y lo dice honestamente.

---

## 2. EVIDENCIA DE CAPTURA REAL

| Métrica | Valor | Estado |
|---|---|---|
| Muestras capturadas | 0 | ⏳ PENDIENTE |
| Muestras aceptadas | 0 | ⏳ PENDIENTE |
| Muestras rechazadas | 0 | ⏳ PENDIENTE |
| Muestras en cuarentena | 0 | ⏳ PENDIENTE |
| WAV en `raw/` | 0 | ⏳ PENDIENTE |
| Features generadas | 0 | ⏳ PENDIENTE |

---

## 3. EVIDENCIA DE PIPELINE

| Etapa | Comando | Resultado |
|---|---|---|
| WAV encode/decode | `selftest` | ✅ OK |
| Contrato de frames | `selftest` | ✅ OK |
| Agregación 44 dims | `selftest` | ✅ OK |
| AC-1..AC-10 | `selftest` | ✅ OK |
| Gates G-DS-1..6 | `selftest` | ✅ OK |
| Remuestreo 48k→44.1k | `selftest` | ✅ OK |

---

## 4. EVIDENCIA DE PILOTO

| Criterio | Estado | Evidencia |
|---|---|---|
| PILOT-1 | ⏳ PENDING | 0/100 muestras |
| PILOT-2 | ⏳ PENDING | 0/3 places |
| PILOT-3 | ⏳ PENDING | 0% doble revisión |
| PILOT-4 | ⏳ PENDING | Sin datos |
| PILOT-5 | ⏳ PENDING | Sin datos |
| PILOT-6 | ⏳ PENDING | Split no ejecutado |
| PILOT-7 | ⏳ PENDING | `PREPARADO_VACIO` |

---

## 5. CONCLUSIÓN

**La infraestructura está verificada. La captura real no ha ocurrido. PILOT-1..7 están PENDING.**

**NO se afirma que existen muestras reales. Se afirma que el pipeline está probado y listo.**

**El selftest es evidencia de software. El campo es evidencia de sistema.**

---

**Estado:** Infraestructura verificada · Captura real pendiente  
**Fecha:** 2026-10-05
