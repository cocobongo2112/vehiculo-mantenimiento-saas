# Plan de ejecución QA — Smart Garage

## Objetivo
Validar la versión candidata a liberación mediante pruebas unitarias, caja blanca, integración, E2E, rendimiento, usabilidad y accesibilidad.

## 1. Preparación
```bash
npm install
npx playwright install chromium
```
Instalar k6 por separado según el sistema operativo. Para Lighthouse CI se utiliza `@lhci/cli` incluido en devDependencies.

## 2. Pruebas unitarias y caja blanca
```bash
npm run test:unit
```
Evidencia: salida de Jest y carpeta `qa-reports/jest-coverage/`.
Criterio interno: cobertura global mínima de 70% en el módulo bajo prueba y 100% de éxito de casos ejecutados.

## 3. Integración
```bash
npm run test:integration
```
Valida Express + middleware JSON + `/api/health` + `/api/search` + servicio de búsqueda + catálogo.

## 4. E2E con Playwright
```bash
npm run test:e2e
```
Prueba la navegación real del usuario, búsqueda y acceso al flujo de registro/privacidad.
Reporte HTML: `qa-reports/playwright/`.

## 5. Rendimiento con k6
Contra producción HTTPS:
```bash
k6 run -e BASE_URL=https://TU-DOMINIO.com -e VUS=50 -e DURATION=30s tests/performance/k6-smoke.js
```
Stress opcional de 100 usuarios:
```bash
k6 run -e BASE_URL=https://TU-DOMINIO.com -e VUS=100 -e DURATION=30s tests/performance/k6-smoke.js
```
Criterios: errores <1% y p95 <500 ms.

Para evidencia de recursos, en otra terminal del VPS:
```bash
docker stats smart-garage-app smart-garage-nginx
```

## 6. Lighthouse / WCAG
Local:
```bash
npm start
npm run qa:lighthouse
```
Producción:
```bash
LIGHTHOUSE_URL=https://TU-DOMINIO.com npm run qa:lighthouse
```
Criterios obligatorios de la práctica: Accesibilidad >=85 y Mejores Prácticas >=85.

## 7. Evidencias a conservar
- captura de `npm run test:unit`;
- captura de `npm run test:integration`;
- captura de Playwright aprobado;
- salida completa de k6 con p95, requests/s y checks;
- captura de `docker stats` durante k6;
- reporte Lighthouse con Accessibility y Best Practices;
- captura del navegador mostrando HTTPS válido;
- `docker compose ps` del VPS;
- `ufw status` mostrando únicamente SSH administrativo y 80/443 públicos.
