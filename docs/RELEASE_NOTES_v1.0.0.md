# Release Candidate v1.0.0 — Unidad IV

## Incluye
- Dockerfile de producción para Node 20.
- Docker Compose de producción con Nginx como reverse proxy y terminación TLS.
- Endpoint `/api/health` para readiness y carga.
- Registro restaurado con consentimiento de privacidad obligatorio.
- Endurecimiento básico de cookies y encabezados HTTP.
- Lógica de búsqueda separada en servicio testeable.
- Jest: unitarias y caja blanca con cobertura.
- Supertest: integración HTTP.
- Playwright: E2E.
- k6: 50/100 usuarios virtuales y thresholds.
- Lighthouse CI: Accesibilidad/Best Practices >=85.
- Política SemVer, checklist de release y rollback automatizado.
- Guía de deployment VPS y evidencias requeridas.
- Workflow de QA en GitHub Actions.

## Pendiente antes de marcar release estable
- Ejecutar `npm install` para sincronizar `package-lock.json` con las nuevas dependencias de QA.
- Ejecutar toda la suite y corregir cualquier regresión real del entorno del equipo.
- Definir dominio/VPS y emitir certificado Let's Encrypt.
- Ejecutar k6 contra el VPS y Lighthouse contra HTTPS.
- Adjuntar evidencias reales al Documento de Release.
