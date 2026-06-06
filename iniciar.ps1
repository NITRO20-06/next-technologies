# Inicia el servidor local de NEXT TECHNOLOGIES
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Host "PHP no esta instalado. Instalalo con:" -ForegroundColor Red
    Write-Host "  winget install PHP.PHP.8.3" -ForegroundColor Yellow
    Write-Host "Luego cierra y abre una terminal nueva." -ForegroundColor Yellow
    exit 1
}

Set-Location $PSScriptRoot
Write-Host ""
Write-Host "  NEXT TECHNOLOGIES - servidor local" -ForegroundColor Cyan
Write-Host "  Abre: http://localhost:8000/index.php" -ForegroundColor Green
Write-Host "  Ctrl+C para detener" -ForegroundColor DarkGray
Write-Host ""

php -S localhost:8000
