# Levanta Nginx como proxy inverso HTTPS en Docker.
# Antes de ejecutar este script:
# 1) Corre tu app con: node app.js
# 2) Verifica que abra en http://localhost:3000
# 3) Genera certificados con: .\scripts\generar-certificado-local.ps1

Write-Host "== Iniciando Nginx SSL en Docker ==" -ForegroundColor Cyan

if (-not (Test-Path ".\nginx\certs\localhost.pem") -or -not (Test-Path ".\nginx\certs\localhost-key.pem")) {
    Write-Host "No existen los certificados en nginx\certs\" -ForegroundColor Red
    Write-Host "Primero ejecuta: .\scripts\generar-certificado-local.ps1" -ForegroundColor Yellow
    exit 1
}

docker compose -f docker-compose.nginx-ssl.yml up -d

Write-Host ""
Write-Host "Nginx iniciado. Abre en el navegador:" -ForegroundColor Green
Write-Host "https://localhost" -ForegroundColor Green
Write-Host ""
Write-Host "Para detenerlo usa:" -ForegroundColor Yellow
Write-Host "docker compose -f docker-compose.nginx-ssl.yml down"
