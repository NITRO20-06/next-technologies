# Regenerar assets minificados (local / antes de commit)
Set-Location $PSScriptRoot
if (Test-Path "node_modules/terser") {
  npm run build:assets
} else {
  npx --yes terser js/fog-ambient.js js/main.js -c -m --toplevel -o js/app.min.js
  npx --yes clean-css-cli -o css/app.min.css css/fog-ambient.css css/style.css
}
Write-Host "Listo: js/app.min.js y css/app.min.css"
