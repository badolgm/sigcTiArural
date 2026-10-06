# PILOT CAPTURE CHECKLIST

**Misión:** `CMSC_ORCHESTRATION_V2_FIELD_PILOT_EXECUTION`  
**Fecha:** 2026-10-05  
**Estado:** CHECKLIST · NO EJECUTADO  
**Base:** `FIELD_PILOT_EXECUTION_PLAN.md` + `FIELD_DATA_COLLECTION_PROTOCOL.md`

---

## 0. ESTADO HONESTO

| Elemento | Estado |
|---|---|
| Checklist definido | ✅ |
| **Capturas ejecutadas** | ⏳ **PENDIENTE** |
| **100 muestras reales** | ⏳ **PENDIENTE** |

---

## 1. PRE-SESION

- [ ] Micrófono conectado y funcionando
- [ ] Batería del dispositivo verificada
- [ ] `session_id` definido (convención: `pilot_YYYY_MM_DD_<lugar>_<secuencia>`)
- [ ] `place_id` definido (`site_a`, `site_b` o `site_c`)
- [ ] `operator_id` definido
- [ ] `device_id` definido
- [ ] Clase objetivo seleccionada
- [ ] Entorno seleccionado (`campo`, `invernadero`, `lab`, `interior`)
- [ ] Clima verificado (especialmente para `lluvia`)

---

## 2. CONFIGURACIÓN

- [ ] S30 (SpectralAnalysisInstrument) iniciado
- [ ] Badge `S30 OK` visible
- [ ] Campos obligatorios completos:
  - [ ] `class_id`
  - [ ] `session_id`
  - [ ] `place_id`
  - [ ] `operator_id`
  - [ ] `device_id`
- [ ] Entorno seleccionado
- [ ] `hour_local` verificado

---

## 3. CAPTURA

- [ ] Botón "Iniciar captura" habilitado
- [ ] Captura iniciada
- [ ] Progreso verificado (muestras/tiempo)
- [ ] 3.0s exactos alcanzados
- [ ] Paquete WAV+JSON generado
- [ ] Paquete en cola con estado `ingest_pending`

---

## 4. POST-CAPTURA

- [ ] Paquete verificado en cola
- [ ] Estado `ingest_pending` confirmado
- [ ] Incidencias anotadas en `notes` (si aplica)
- [ ] Si la toma no es válida: descartada (no guardada)
- [ ] Si la toma es válida: guardada para ingesta

---

## 5. CLASES ESPECÍFICAS

### 5.1 Silencio

- [ ] Sin evento dominante > 0.05 en 3s
- [ ] Piso de ruido del entorno registrado

### 5.2 Viento

- [ ] Flujo audible continuo
- [ ] Banda ancha baja
- [ ] Sin lluvia/agua/voz dominantes

### 5.3 Lluvia

- [ ] Precipitación audible natural
- [ ] **JAMÁS simular con aspersor**
- [ ] `weather_note` con hora e intensidad

### 5.4 Agua

- [ ] Goteo, curso u oleaje
- [ ] Sin precipitación dispersa simultánea

### 5.5 Insectos

- [ ] Estruidulación audible
- [ ] `hour_local` registrado (típicamente nocturno)
- [ ] Sin voz o motor dominantes

### 5.6 Ave

- [ ] Vocalización registrada
- [ ] Sin estruidulación dominante
- [ ] Especie anotada en `notes` si es identificable

### 5.7 Voz

- [ ] Habla, no música
- [ ] **Consentimiento explícito obtenido**
- [ ] Sin retención de habla identificable

### 5.8 Motor

- [ ] Motor/maquinaria en operación
- [ ] `hour_local` registrado
- [ ] Sin voz o lluvia dominantes

---

## 6. FIN DE SESIÓN

- [ ] Todas las tomas de la sesión verificadas
- [ ] Paquetes guardados para ingesta
- [ ] Notas de sesión completadas
- [ ] Próxima sesión planificada

---

## 7. CRITERIOS DE NO CAPTURA

| Criterio | Acción |
|---|---|
| Micrófono no disponible | No capturar, reprogramar |
| Batería agotada | No capturar, recargar |
| Clima adverso (viento extrema) | No capturar, reprogramar |
| Voz sin consentimiento | **JAMÁS capturar** |
| Lluvia no natural | **JAMÁS simular** |

---

## CONCLUSIÓN

**El checklist está definido. La infraestructura está lista. El campo decide.**

**NO se afirma que las capturas existen. Se afirma que el checklist está listo para ejecutarlas.**

---

**Estado del documento:** CHECKLIST · LISTO PARA EJECUCIÓN  
**No autoriza:** captura real, commits, push, merge  
**Próximo paso:** Ejecución del piloto en campo
