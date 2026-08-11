# Directiva de Liberación — Smart Garage

## Estrategia de versiones
Se utilizará SemVer `MAJOR.MINOR.PATCH` y un sufijo de liberación para la evidencia académica.

- PATCH: correcciones compatibles (`v1.0.1-release`).
- MINOR: nuevas funciones compatibles (`v1.1.0-release`).
- MAJOR: cambios incompatibles (`v2.0.0-release`).

Una versión de producción debe salir de `main`, tener QA aprobado y tag firmado/anotado:
```bash
git tag -a v1.0.0-release -m "Release estable Unidad IV"
git push origin v1.0.0-release
```

## Checklist de liberación
1. Working tree limpio y cambios revisados.
2. Secretos fuera del repositorio (`.env` ignorado).
3. Unitarias/caja blanca aprobadas.
4. Integración y E2E aprobadas.
5. Imagen Docker construida sin errores.
6. Despliegue por Nginx sobre HTTPS.
7. k6 dentro de umbrales.
8. Lighthouse >=85 en Accesibilidad y Mejores Prácticas.
9. Aviso y política de privacidad visibles.
10. Tag de versión creado solo después de aceptar la release candidate.

## Protocolo de rollback
Si la versión nueva produce errores críticos:
```bash
cd /opt/smart-garage
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=100 app
./scripts/rollback.sh v1.0.0-release
curl -fsS https://TU-DOMINIO.com/api/health
```
No se elimina la versión anterior hasta validar la nueva. La base de datos debe respaldarse antes de migraciones destructivas.

## Protección de datos
Smart Garage trata nombres, correos, datos de vehículos, placas, historial y órdenes de servicio. El tratamiento debe ser legítimo, informado y limitado a las finalidades descritas en el aviso de privacidad. La interfaz incluye aviso/política y consentimiento obligatorio en registro. Se contemplan derechos de acceso, rectificación, cancelación y oposición (ARCO), controles por rol, hash de contraseñas, sesiones HTTP-only, HTTPS y consultas parametrizadas.

La política mexicana debe referenciar la Ley Federal de Protección de Datos Personales en Posesión de los Particulares vigente, expedida en 2025 y sus reformas vigentes. GDPR se considera como referencia adicional únicamente cuando el tratamiento entre en su ámbito territorial/material.

## Gestión de incidentes
Ante una brecha o incidente: contener, preservar logs, identificar datos afectados, rotar credenciales, evaluar impacto, restaurar desde una versión estable y documentar acciones. Cuando corresponda legalmente, se realizarán las notificaciones aplicables a titulares y autoridades.
