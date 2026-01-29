# Script de mantenimiento seguro para Docker
# Elimina recursos no utilizados sin borrar imágenes base o volúmenes de datos importantes

Write-Host "=== MANTENIMIENTO DE DOCKER (MODO SEGURO) ===" -ForegroundColor Cyan

# 1. Eliminar contenedores detenidos (no borra los que están corriendo)
Write-Host "`n1. Eliminando contenedores detenidos..." -ForegroundColor Yellow
docker container prune -f

# 2. Eliminar redes no usadas (networks)
Write-Host "`n2. Eliminando redes no usadas..." -ForegroundColor Yellow
docker network prune -f

# 3. Eliminar imágenes 'dangling' (imágenes intermedias <none> que ya no sirven)
# NOTA: No usamos '-a' para no borrar imágenes descargadas que podrían usarse en el futuro
Write-Host "`n3. Eliminando imágenes huérfanas (dangling)..." -ForegroundColor Yellow
docker image prune -f

# 4. Eliminar cache de construcción (opcional, ayuda si hay errores de build)
Write-Host "`n4. Eliminando cache de construcción antiguo..." -ForegroundColor Yellow
docker builder prune -f

Write-Host "`n=== LIMPIEZA COMPLETADA ===" -ForegroundColor Green
Write-Host "NOTA: El espacio en disco de Windows (ext4.vhdx) NO se recupera automáticamente."
Write-Host "Para recuperar los GBs en Windows, sigue las instrucciones de 'diskpart' en el chat." -ForegroundColor Gray
