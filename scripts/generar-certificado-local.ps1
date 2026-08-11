# Genera un certificado local confiable para HTTPS en localhost usando mkcert.
# Ejecuta PowerShell como usuario normal. Si mkcert pide permisos para instalar la CA,
# acepta la ventana de permisos.

Write-Host "== Generando certificado local confiable para https://localhost ==" -ForegroundColor Cyan

if (-not (Get-Command mkcert -ErrorAction SilentlyContinue)) {
    Write-Host "mkcert no está instalado." -ForegroundColor Yellow
    Write-Host "Instálalo con uno de estos comandos y vuelve a ejecutar este script:" -ForegroundColor Yellow
    Write-Host "winget install FiloSottile.mkcert" -ForegroundColor Green
    Write-Host "choco install mkcert" -ForegroundColor Green
    exit 1
}

New-Item -ItemType Directory -Force -Path ".\nginx\certs" | Out-Null

Write-Host "Instalando autoridad certificadora local de mkcert..." -ForegroundColor Cyan
mkcert -install

Write-Host "Creando certificado para localhost, 127.0.0.1 y ::1..." -ForegroundColor Cyan
mkcert -cert-file ".\nginx\certs\localhost.pem" -key-file ".\nginx\certs\localhost-key.pem" localhost 127.0.0.1 ::1

Write-Host ""
Write-Host "Certificados generados correctamente en nginx\certs\" -ForegroundColor Green
Write-Host "Archivos creados:" -ForegroundColor Green
Write-Host " - nginx\certs\localhost.pem"
Write-Host " - nginx\certs\localhost-key.pem"
Write-Host ""
Write-Host "IMPORTANTE: no subas esos archivos al repositorio." -ForegroundColor Yellow
