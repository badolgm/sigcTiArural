# CMSC — Procedimiento Operativo de Regeneración del Signal Registry (V1)

| Campo | Valor |
|---|---|
| Documento | SIGNAL_REGISTRY_V1_OPERATIONAL_PROCEDURE |
| Fecha | 2026-09-29 |
| Misión | CMSC_GOVERNANCE_GATE_CLOSURE_V1 |
| Naturaleza | Gobernanza · procedimiento operativo. Sin código, sin commits. |
| Resuelve | Condición 4 del READINESS (regeneración del registry) y contradicción C7 (promesa de registry en F3B no cumplida) |

---

## 1. Objeto

Definir el proceso operativo V1 para regenerar el índice de conocimiento y señales del ecosistema sin escritura ad-hoc, cerrando las condiciones DF4 y C7 del READINESS_REVIEW. NO regenera hoy: define el procedimiento que una misión futura (F3E) ejecutará con orden.

## 2. Principios inmutables

| Principio | Regla |
|---|---|
| Fuente única | El registry es un archivo generado desde la fuente de documentos y el SIGNAL_MAP; jamás se edita a mano |
| Lectura-derivada | `docsBySignal` es una vista derivada; nunca se escriben punteros en ambos lados (F3E) |
| Cero escritura en el slice | Durante F3C v1 el registry permanece intacto (hash inmutable, Blueprint §12) |
| Gobernanza | La regeneración solo ocurre con orden de misión y responsable definido |

## 3. Responsables

| Rol | Función |
|---|---|
| Bernardo | Autoriza cada regeneración con misión explícita |
| Agente de gobernanza | Ejecuta el procedimiento y verifica invariantes |
| Agente de conocimiento (futuro, F3E) | Valida categorías y enlaces de evidencia |

## 4. Cadencia

1. Bajo demanda, con orden explícita (NUNCA automática ni periódica sin orden).
2. Antes de F3E implementación (requisito READINESS cond 4).
3. Después de promoción gobernada de evidencia a knowledge-base/research-v2/eiarc-architecture (F3E Hangar de Autenticidad).

## 5. Pasos del procedimiento V1

| Paso | Acción | Verificación |
|---|---|---|
| 1 | Registrar hash del registry vigente (SHA-256) | línea base inmutable |
| 2 | Inventariar entradas nuevas (docs CMSC, docs IA, señales del mapa) con su categoría canónica | clasificar con canon único (apéndice C5/C6) |
| 3 | Regenerar el índice desde la fuente única de markdown | estructura `generated_at`, `source_version`, `documents` conservada |
| 4 | Validar conteos por categoría (project-core 7 · eiarc-foundation 3 · eiarc-architecture 13 · knowledge-base 6 · historical 4 · research-v2 18 = 51) | no se pierde ni se duplica documento |
| 5 | Regenerar la vista `docsBySignal` derivada | sin punteros escritos adicionales |
| 6 | Smoke test del visor `/knowledge` y del catálogo de señales | rutas y fichas operativas |
| 7 | Commit controlado con orden de Bernardo | mensaje gobernanza |

## 6. Criterios de aceptación

1. Hash previo quedó registrado y es verificable.
2. Conteos finales por categoría iguales o mayores, nunca menores sin justificación.
3. Ningún documento borrado (invariante NADA DESAPARECE).
4. `docsBySignal` se regenera derivada, no se completa a mano.
5. El visor muestra los docs sin inflación ni duplicación (F3E).

## 7. Prohibiciones

1. NO escribir directo en `knowledgeRegistry.generated.json`.
2. NO inventar categorías ni estados fuera del canon.
3. NO regenerar sin misión ni responsable.
4. NO modificar el registry durante el slice F3C v1.

## 8. Cierre

Procedimiento V1 definido y aceptable. Su ejecución queda a un gate F3E explícito; entre tanto, el registry vigente (51 docs, 6 categorías) permanece como fuente legítima de lectura.

---

*Procedimiento operativo. Sin ejecución. Sin código. Head de referencia: `18b95b1`.*