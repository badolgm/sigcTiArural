# DOCUMENT RETENTION POLICY

## Fecha

2026-07-15

## Objetivo

Definir la politica minima de retencion para el respaldo archivistico integral de SIGCT-Rural y su coleccion documental asociada.

## Politica de retencion por clasificacion

| Clasificacion | Regla de retencion | Disposicion recomendada |
|---|---|---|
| CRITICO | Retencion permanente | Mantener en almacenamiento principal y en al menos una copia adicional offline o externa. |
| IMPORTANTE | Retencion de largo plazo | Conservar junto al archivo principal y revisar vigencia por version o cierre de fase. |
| HISTORICO | Retencion permanente | Mantener como evidencia de evolucion, auditoria y contexto institucional. |
| TEMPORAL | No archivar en respaldo maestro | Regenerar bajo demanda desde dependencias declaradas y codigo fuente. |

## Alcance operativo de esta politica

Aplica a:

- `PROJECT_ARCHIVE_MANIFEST.md`
- `PROJECT_RECORDS_REGISTER.md`
- `PROJECT_STRUCTURE_SNAPSHOT.md`
- documentacion bajo `docs/`
- codigo fuente bajo `src/`
- configuracion y scripts archivados en el respaldo

## Exclusiones justificadas

Los siguientes artefactos quedan fuera del archivo maestro por ser regenerables, cacheados o no ser fuente de verdad:

- `node_modules`
- `venv`
- `.venv`
- `__pycache__`
- `dist`
- `build`
- `.cache`

## Recomendaciones de custodia

1. Mantener intactos los backups previos ya existentes.
2. Preservar este archivo como snapshot integral del cierre.
3. No mezclar este respaldo con artefactos temporales posteriores.
4. Si se crea una nueva version de archivo, usar un nuevo directorio fechado y no sobrescribir este.
