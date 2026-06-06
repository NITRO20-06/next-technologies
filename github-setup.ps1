# Configura GitHub CLI (gh) y sube el repositorio
# Uso: .\github-setup.ps1

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

$gh = "C:\Program Files\GitHub CLI\gh.exe"
if (-not (Test-Path $gh)) {
    Write-Host "GitHub CLI no encontrado. Instalalo con:" -ForegroundColor Red
    Write-Host "  winget install GitHub.cli" -ForegroundColor Yellow
    exit 1
}

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "  NEXT TECHNOLOGIES - subir a GitHub" -ForegroundColor Cyan
Write-Host ""

& $gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Paso 1: Inicia sesion en GitHub (se abrira el navegador)" -ForegroundColor Green
    & $gh auth login --hostname github.com --git-protocol https --web
    if ($LASTEXITCODE -ne 0) { exit 1 }
}

$repoName = "next-technologies"
Write-Host ""
Write-Host "Paso 2: Crear repo '$repoName' y subir codigo..." -ForegroundColor Green

if (git remote get-url origin 2>$null) {
    Write-Host "Ya existe remote 'origin'. Subiendo cambios..." -ForegroundColor Yellow
    git push -u origin main
} else {
    & $gh repo create $repoName --public --description "Sitio corporativo NEXT TECHNOLOGIES - soporte tecnico Jaen" --source=. --remote=origin --push
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Listo. Repo en GitHub." -ForegroundColor Green
    & $gh repo view --web
} else {
    Write-Host ""
    Write-Host "Si el nombre '$repoName' ya existe, edita github-setup.ps1 y cambia `$repoName." -ForegroundColor Yellow
}
