# BACKUP VERIFICATION REPORT

## Fecha

2026-07-15

## Objetivo

Verificar que el respaldo `sigcTiArural_backup_2026_07_15` contiene la totalidad del alcance solicitado y que la copia coincide con el origen a nivel de conteo de archivos y volumen total por segmento.

## Respaldo verificado

- Ruta: `C:\Users\Devbadolgm\Development\research-ai\ProjectsAndDatasets\sigcTiArural_backup_2026_07_15`

## Resultado de verificacion comparativa

| Segmento | Archivos origen | Bytes origen | Archivos respaldo | Bytes respaldo | Coincide |
|---|---:|---:|---:|---:|---|
| `docs/eiarc` | 26 | 213068 | 26 | 213068 | Si |
| `docs/project_knowledge_base` | 6 | 33680 | 6 | 33680 | Si |
| `src` | 21970 | 336365038 | 21970 | 336365038 | Si |
| `docker-compose.yml` | 1 | 2395 | 1 | 2395 | Si |

## Verificacion fisica del respaldo

Elementos presentes en la raiz del backup:

- `docs/`
- `src/`
- `docker-compose.yml`
- `PROJECT_BACKUP_MANIFEST.md`
- `BACKUP_CONTENT_INDEX.md`
- `BACKUP_VERIFICATION_REPORT.md`

## Hallazgos

1. El respaldo nuevo fue creado exitosamente en el directorio hermano donde ya existen respaldos anteriores.
2. El alcance solicitado fue copiado completo.
3. La verificacion por conteo y bytes coincide en todos los segmentos respaldados.
4. No se elimino ni altero ningun backup preexistente durante la operacion.

## Riesgo residual

- Bajo: el respaldo nuevo existe y coincide con el origen para el alcance definido.
- Riesgo residual operativo:
  - el reporte valida integridad basica por conteo y volumen, no checksum criptografico por archivo
  - el respaldo captura tambien estados locales no confirmados de la rama de trabajo actual

## Conclusion

El respaldo `sigcTiArural_backup_2026_07_15` queda verificado como copia completa y consistente del alcance solicitado previo al cierre del proyecto.
