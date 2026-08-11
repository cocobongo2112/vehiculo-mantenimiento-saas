$ErrorActionPreference = "Stop"
Write-Host "Instalando dependencias QA..."
npm install
Write-Host "Instalando Chromium para Playwright..."
npx playwright install chromium
Write-Host "Listo. Ejecuta: npm run test:unit; npm run test:integration; npm run test:e2e"
Write-Host "k6 se instala aparte. En Windows puedes usar: winget install k6.k6"
