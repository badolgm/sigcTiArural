# KNOWLEDGE HUB MIGRATION PLAN

## Propósito

Definir el plan exacto de migración desde el sistema documental actual `Docs v5.0` hacia `SIGCT-Rural Knowledge Hub`, preservando el comportamiento de `Dashboard`, `Laboratorios`, `Telemetría`, el frontend actual y la navegación existente.

---

## SECCIÓN 1

## Estado Actual

### 1.1 Estado funcional actual

El frontend actual utiliza un modelo documental basado en páginas React independientes:

- `DocsMasterdoc.jsx`
- `DocsReadme.jsx`
- `DocsPlanMaestro.jsx`
- `DocsApiReference.jsx`
- `DocsEdgeSetup.jsx`

Estas páginas están registradas en `App.jsx` mediante rutas explícitas:

- `/docs/masterdoc`
- `/docs/readme`
- `/docs/plan`
- `/docs/api`
- `/docs/edge-setup`

### 1.2 Estado de navegación actual

- `TopNav.jsx` expone `Docs (v5.0)` apuntando a `/docs/masterdoc`
- `App.jsx` contiene un `routeMap` donde `docs` también apunta a `/docs/masterdoc`
- `lab-data.js` contiene referencias internas antiguas como:
  - `MASTERDOC v4.3`
  - `Plan Maestro v4.2`
  - rutas tipo `docs-masterdoc` y `docs-plan`

### 1.3 Estado técnico actual del sistema Docs

El sistema documental actual presenta estas características:

1. contenido remoto vía `raw.githubusercontent.com`
2. dependencias documentales por CDN (`marked`, Mermaid, CSS)
3. una página React por documento
4. sin registry documental
5. sin búsqueda
6. sin timeline
7. sin integración de `docs/eiarc/`, `docs/project_knowledge_base/` y `docs/sena_artifacts/`

### 1.4 Restricción de migración

La migración debe ser:

- aditiva al inicio
- reversible por fases
- sin romper rutas actuales hasta tener reemplazo funcional
- aislada del comportamiento de `Dashboard`, `Laboratorios`, `AIPredictiva`, `VoiceAssistant`, telemetría y flujo principal del frontend

---

## SECCIÓN 2

## Estrategia de Migración

### 2.1 Estrategia general

La migración será una **migración controlada por convivencia**, no por reemplazo directo.

### 2.2 Principio operativo

Primero se construye el `Knowledge Hub` en paralelo, luego se conecta, luego se redirige y solo al final se deprecan las páginas Docs v5.0.

### 2.3 Estrategia de bajo impacto

La estrategia exacta será:

1. crear infraestructura documental nueva sin tocar rutas existentes
2. introducir rutas nuevas del Knowledge Hub
3. validar navegación sin modificar el resto de la app
4. actualizar puntos de entrada controlados
5. redirigir rutas viejas cuando el nuevo portal ya sea equivalente
6. retirar las páginas antiguas solo al final

### 2.4 Principio de no afectación

No se debe tocar inicialmente:

- rutas del dashboard
- rutas de laboratorios
- `AIPredictiva`
- `DataScienceLab`
- flujo de `VoiceAssistant`
- carga de telemetría
- topología principal de navegación

---

## SECCIÓN 3

## Fases de Migración

### FASE 0. Preparación controlada

#### Objetivo

Congelar el perímetro de migración y definir la lista exacta de archivos a intervenir.

#### Archivos involucrados en la migración

1. `src/frontend/src/App.jsx`
2. `src/frontend/src/components/TopNav.jsx`
3. `src/frontend/src/pages/DocsMasterdoc.jsx`
4. `src/frontend/src/pages/DocsReadme.jsx`
5. `src/frontend/src/pages/DocsPlanMaestro.jsx`
6. `src/frontend/src/pages/DocsApiReference.jsx`
7. `src/frontend/src/pages/DocsEdgeSetup.jsx`
8. `src/frontend/src/data/lab-data.js`

#### Primer archivo que debe modificarse

`src/frontend/src/App.jsx`

Motivo:

- es el punto de registro de rutas
- permite introducir el Knowledge Hub en paralelo sin afectar las rutas existentes
- controla el `routeMap` usado por navegación interna

#### Segundo archivo que debe modificarse

`src/frontend/src/components/TopNav.jsx`

Motivo:

- es el primer punto visible para exponer el nuevo portal
- su cambio puede hacerse después de que existan rutas nuevas funcionales

#### DONE de Fase 0

- perímetro de archivos congelado
- orden de intervención aprobado
- sin cambios funcionales todavía

---

### FASE 1. Introducción del Knowledge Hub en paralelo

#### Objetivo

Agregar el nuevo árbol de rutas del Knowledge Hub sin retirar Docs v5.0.

#### Acción principal

- añadir rutas `knowledge/*` en `App.jsx`
- no eliminar rutas `/docs/*`

#### Impacto esperado

- coexistencia de ambos sistemas
- cero impacto sobre Dashboard y Laboratorios

#### Riesgo principal

- colisión o mala jerarquía de rutas en `App.jsx`

#### Validaciones obligatorias

- `/dashboard` sigue abriendo normalmente
- `/labs` sigue abriendo normalmente
- `/ai-predictive` sigue abriendo normalmente
- `/docs/masterdoc` sigue funcionando exactamente igual que antes
- las nuevas rutas `/knowledge/*` resuelven sin 404

#### Punto de rollback

- revertir únicamente cambios en `App.jsx`

#### DONE de Fase 1

- rutas `knowledge/*` registradas
- rutas `docs/*` intactas
- navegación principal sin regresión

---

### FASE 2. Integración del acceso principal

#### Objetivo

Cambiar el punto de entrada documental principal para que el usuario entre al Knowledge Hub sin retirar compatibilidad con Docs v5.0.

#### Archivo principal

- `src/frontend/src/components/TopNav.jsx`

#### Acción principal

- reemplazar el acceso `Docs (v5.0)` por el acceso al Knowledge Hub

#### Riesgo principal

- que el botón principal apunte a una ruta no estable

#### Validaciones obligatorias

- clic en la opción documental del nav abre el portal nuevo
- `Dashboard`, `Laboratorios` y `IA Predictiva` siguen resolviendo
- el estado visual del nav sigue marcando la ruta activa correctamente

#### Punto de rollback

- revertir solo `TopNav.jsx`

#### DONE de Fase 2

- el nav principal entra al Knowledge Hub
- Docs v5.0 sigue accesible por URL directa

---

### FASE 3. Reencaminamiento del mapa interno de navegación

#### Objetivo

Actualizar la navegación interna usada por `handleNavigation` y por enlaces documentales antiguos.

#### Archivos principales

- `src/frontend/src/App.jsx`
- `src/frontend/src/data/lab-data.js`

#### Acción principal

- actualizar el `routeMap` para que `docs` apunte al nuevo portal
- actualizar enlaces internos documentales en `lab-data.js`

#### Riesgo principal

- romper enlaces desde laboratorios
- generar rutas internas inválidas tipo `docs-masterdoc`

#### Qué puede romper Laboratorios

1. enlaces internos definidos en `lab-data.js`
2. accesos a documentación técnica desde el catálogo de laboratorios
3. navegación disparada desde botones que esperan nombres antiguos

#### Qué puede romper la navegación

1. `handleNavigation` con claves viejas
2. `TopNav` si la ruta activa deja de coincidir con `startsWith`
3. enlaces internos `to` no alineados con `react-router-dom`

#### Validaciones obligatorias

- desde `LabCatalog`, los accesos documentales siguen navegando
- comandos que usan `docs` siguen resolviendo
- no quedan referencias activas a `docs-masterdoc` y `docs-plan` como rutas internas rotas

#### Punto de rollback

- revertir `lab-data.js`
- revertir ajuste puntual de `routeMap` en `App.jsx`

#### DONE de Fase 3

- la navegación interna ya usa el Knowledge Hub
- los links documentales desde laboratorios no rompen

---

### FASE 4. Wrappers y redirección controlada de Docs v5.0

#### Objetivo

Mantener compatibilidad hacia atrás mientras las rutas viejas empiezan a delegar al nuevo portal.

#### Archivos principales

- `src/frontend/src/pages/DocsMasterdoc.jsx`
- `src/frontend/src/pages/DocsReadme.jsx`
- `src/frontend/src/pages/DocsPlanMaestro.jsx`
- `src/frontend/src/pages/DocsApiReference.jsx`
- `src/frontend/src/pages/DocsEdgeSetup.jsx`

#### Acción principal

Convertir estas páginas en wrappers, redirects o shells de compatibilidad hacia:

- `/knowledge/doc/masterdoc`
- `/knowledge/doc/readme`
- `/knowledge/doc/plan_maestro`
- `/knowledge/doc/api_reference`
- `/knowledge/doc/edge_setup`

#### Riesgo principal

- romper URLs ya conocidas
- crear bucles de redirección

#### Qué puede romper Dashboard

Indirectamente:

- si el bundle falla por errores de import en páginas docs
- si se altera `App.jsx` rompiendo el árbol de rutas general

No debe haber impacto directo en lógica de telemetría o charts, porque la migración documental no toca `Dashboard.jsx`.

#### Validaciones obligatorias

- `/docs/masterdoc` abre contenido correcto
- `/docs/readme` abre contenido correcto
- `/docs/plan` abre contenido correcto
- `/docs/api` abre contenido correcto
- `/docs/edge-setup` abre contenido correcto
- no hay loops
- no hay pantalla en blanco

#### Punto de rollback

- restaurar las páginas Docs v5.0 originales individualmente

#### DONE de Fase 4

- todas las rutas `/docs/*` siguen vivas
- el contenido servido ya proviene del nuevo sistema o wrapper estable

---

### FASE 5. Deprecación funcional de Docs v5.0

#### Objetivo

Dejar Docs v5.0 fuera del flujo principal, manteniéndolo solo como compatibilidad transitoria.

#### Archivos principales

- `App.jsx`
- `TopNav.jsx`
- páginas `Docs*.jsx`

#### Acción principal

- el flujo principal y visible queda 100% en `knowledge/*`
- `/docs/*` solo queda como compatibilidad

#### Riesgo principal

- dejar documentación dual y confusa demasiado tiempo

#### Validaciones obligatorias

- todos los accesos visibles del sistema apuntan a `knowledge/*`
- `/docs/*` sigue resolviendo para usuarios que tengan enlaces viejos

#### Punto de rollback

- reactivar acceso visible desde `TopNav`
- revertir wrappers a páginas antiguas

#### DONE de Fase 5

- Knowledge Hub es la experiencia documental oficial
- Docs v5.0 dejó de ser la ruta principal

---

### FASE 6. Retiro de páginas antiguas como solución principal

#### Objetivo

Completar la migración y dejar solo el nuevo portal como solución documental activa.

#### Acción principal

- retirar dependencia lógica de las páginas antiguas
- dejar su destino exclusivamente de compatibilidad o eliminarlas en una fase posterior separada

#### Riesgo principal

- perder cobertura de alguna ruta vieja no inventariada

#### Validaciones obligatorias

- no hay referencias activas a:
  - `raw.githubusercontent.com`
  - `MASTERDOC v4.3`
  - `Plan Maestro v4.2`
  - `/docs/masterdoc` como entrada principal

#### Punto de rollback

- reintroducir wrappers viejos

#### DONE de Fase 6

- Knowledge Hub es el único sistema documental principal
- la compatibilidad está controlada
- no quedan dependencias documentales remotas en el flujo oficial

---

## SECCIÓN 4

## Mapa de Riesgos

### 4.1 Riesgos por fase

| Fase | Riesgo | Impacto | Mitigación |
|---|---|---|---|
| Fase 1 | colisión de rutas nuevas en `App.jsx` | Medio | añadir rutas nuevas sin tocar las existentes |
| Fase 2 | enlace principal del nav apunta a ruta inmadura | Medio | cambiar `TopNav` solo después de tener rutas nuevas estables |
| Fase 3 | ruptura de enlaces en laboratorios | Alto | actualizar `lab-data.js` con validación manual de todos los links internos |
| Fase 4 | bucles de redirect en páginas docs | Alto | usar mapeo uno a uno y probar cada ruta `/docs/*` |
| Fase 5 | dualidad prolongada de sistemas documentales | Medio | definir claramente el nuevo portal como fuente principal |
| Fase 6 | referencias residuales a versiones viejas | Medio | búsquedas por texto previas al cierre |

### 4.2 Riesgos específicos por área

#### Qué puede romper Dashboard

- errores globales en `App.jsx`
- colisiones de rutas que afecten el árbol completo
- fallos de bundle causados por imports documentales nuevos

#### Qué puede romper Laboratorios

- cambios en `lab-data.js`
- enlaces internos documentales mal migrados
- targets de navegación antigua no resueltos

#### Qué puede romper la navegación

- cambios en `routeMap`
- cambios en `TopNav`
- rutas antiguas removidas demasiado pronto

---

## SECCIÓN 5

## Mapa de Rollback

### 5.1 Principio de rollback

Cada fase debe poder revertirse con el menor número posible de archivos.

### 5.2 Rollback por fase

| Fase | Archivos a revertir | Resultado esperado |
|---|---|---|
| Fase 1 | `App.jsx` | desaparecen rutas `knowledge/*`, Docs v5.0 sigue intacto |
| Fase 2 | `TopNav.jsx` | el acceso principal vuelve a `Docs (v5.0)` |
| Fase 3 | `App.jsx`, `lab-data.js` | navegación interna vuelve al modelo anterior |
| Fase 4 | `DocsMasterdoc.jsx`, `DocsReadme.jsx`, `DocsPlanMaestro.jsx`, `DocsApiReference.jsx`, `DocsEdgeSetup.jsx` | las rutas viejas recuperan su implementación original |
| Fase 5 | `TopNav.jsx`, `App.jsx` | Docs v5.0 vuelve a ser visible como portal principal |
| Fase 6 | wrapper/redirects de compatibilidad | se reabre convivencia prolongada si hace falta |

### 5.3 Puntos de rollback obligatorios

Debe existir un checkpoint funcional al cierre de:

- Fase 1
- Fase 3
- Fase 4
- Fase 5

Estos son los hitos donde cambia realmente la navegación percibida por el usuario.

---

## SECCIÓN 6

## Checklists de Validación

### 6.1 Checklist global obligatorio

- [ ] `Dashboard` carga
- [ ] `Laboratorios` carga
- [ ] `IA Predictiva` carga
- [ ] `Data Science` carga
- [ ] `VoiceAssistant` no pierde navegación
- [ ] `TopNav` no rompe estilos ni ruta activa
- [ ] no aparecen 404 nuevos
- [ ] no aparecen errores de import

### 6.2 Checklist por fase

#### Fase 1

- [ ] existen rutas `knowledge/*`
- [ ] siguen existiendo rutas `/docs/*`
- [ ] `/dashboard` no se afecta

#### Fase 2

- [ ] el botón documental del nav abre el nuevo portal
- [ ] el nav sigue resaltando correctamente
- [ ] no se afecta el estado del cluster

#### Fase 3

- [ ] `handleNavigation('docs')` resuelve correctamente
- [ ] `lab-data.js` no deja enlaces internos rotos
- [ ] navegación desde catálogo de laboratorios funciona

#### Fase 4

- [ ] `/docs/masterdoc` redirige o envuelve sin error
- [ ] `/docs/readme` redirige o envuelve sin error
- [ ] `/docs/plan` redirige o envuelve sin error
- [ ] `/docs/api` redirige o envuelve sin error
- [ ] `/docs/edge-setup` redirige o envuelve sin error

#### Fase 5

- [ ] el flujo visible ya usa `knowledge/*`
- [ ] `/docs/*` permanece como compatibilidad

#### Fase 6

- [ ] no quedan referencias activas a `raw.githubusercontent.com` en el flujo oficial
- [ ] no quedan etiquetas visibles `MASTERDOC v4.3`
- [ ] no quedan etiquetas visibles `Plan Maestro v4.2`

---

## SECCIÓN 7

## Definición de DONE

### DONE Fase 0

- perímetro de migración congelado
- orden exacto aprobado

### DONE Fase 1

- rutas `knowledge/*` añadidas
- rutas actuales sin regresión

### DONE Fase 2

- `TopNav` abre el Knowledge Hub
- navegación principal intacta

### DONE Fase 3

- `routeMap` y `lab-data.js` ya apuntan correctamente al nuevo portal
- no hay links documentales internos rotos

### DONE Fase 4

- todas las rutas `docs/*` funcionan a través del nuevo sistema o wrappers equivalentes
- no existe pérdida de acceso documental

### DONE Fase 5

- Knowledge Hub es la experiencia documental principal
- Docs v5.0 queda solo como compatibilidad

### DONE Fase 6

- el flujo oficial ya no depende del sistema documental antiguo
- el portal nuevo es el punto único de acceso principal

---

## SECCIÓN 8

## Orden exacto de implementación

### 8.1 Orden exacto de archivos a modificar

1. `src/frontend/src/App.jsx`
2. `src/frontend/src/components/TopNav.jsx`
3. `src/frontend/src/data/lab-data.js`
4. `src/frontend/src/pages/DocsMasterdoc.jsx`
5. `src/frontend/src/pages/DocsReadme.jsx`
6. `src/frontend/src/pages/DocsPlanMaestro.jsx`
7. `src/frontend/src/pages/DocsApiReference.jsx`
8. `src/frontend/src/pages/DocsEdgeSetup.jsx`

### 8.2 Razón del orden

#### 1. `App.jsx`

Primero, porque controla el router y el `routeMap`; sin esto no existe coexistencia segura.

#### 2. `TopNav.jsx`

Segundo, porque es el primer acceso visible y solo debe cambiar cuando ya exista portal nuevo.

#### 3. `lab-data.js`

Tercero, porque reencamina enlaces internos documentales desde laboratorios, pero solo debe tocarse cuando el portal ya sea navegable.

#### 4 a 8. Páginas `Docs*.jsx`

Al final, porque deben migrarse cuando ya exista destino nuevo estable; antes de eso tocarlas genera riesgo innecesario.

### 8.3 Dependencias necesarias

#### Dependencias técnicas previas

- rutas `knowledge/*` operativas
- componentes nuevos del Knowledge Hub disponibles
- registry documental generado
- navegación básica funcional

#### Dependencias de control

- checklist por fase definido
- rollback por fase identificado
- validación manual de rutas críticas después de cada fase

### 8.4 Regla de ejecución

No se debe iniciar una fase si la fase anterior no cumple su definición de DONE y su checklist de validación.

## Cierre

La migración controlada desde Docs v5.0 hacia SIGCT-Rural Knowledge Hub debe ejecutarse como una sustitución progresiva de punto de entrada, navegación interna y compatibilidad de rutas, no como un reemplazo brusco. El orden correcto de intervención comienza por el router (`App.jsx`), sigue por la entrada visible (`TopNav.jsx`), luego reencamina los enlaces documentales (`lab-data.js`) y solo al final transforma las páginas documentales antiguas en wrappers o compatibilidad. Así se protege el dashboard, los laboratorios, la navegación y el frontend existente durante toda la transición.
