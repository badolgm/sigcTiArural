# Docker Maintenance Script for Windows (PowerShell)

Write-Host "Starting Docker Maintenance..." -ForegroundColor Cyan

# 1. Check current usage
Write-Host "`n[1] Checking Disk Usage..." -ForegroundColor Yellow
docker system df

# 2. Prune unused data (safe prune)
# Removes: stopped containers, networks not used by at least one container, dangling images, build cache
Write-Host "`n[2] Pruning unused Docker objects..." -ForegroundColor Yellow
docker system prune -f

# Optional: Prune ALL unused images (not just dangling)
# Uncomment the line below if you want to be aggressive
# docker system prune -a -f

# 3. Compact WSL2 Disk (Manual Instructions)
Write-Host "`n[3] WSL2 Disk Compaction Instructions" -ForegroundColor Yellow
Write-Host "To compact the WSL2 virtual disk (ext4.vhdx), follow these steps manually:"
Write-Host "1. Shut down WSL: wsl --shutdown"
Write-Host "2. Open diskpart as Admin: diskpart"
Write-Host "3. Run: select vdisk file='C:\Users\bagm2\AppData\Local\Docker\wsl\data\ext4.vhdx'"
Write-Host "4. Run: compact vdisk"
Write-Host "5. Run: exit"

Write-Host "`nMaintenance Complete." -ForegroundColor Green
