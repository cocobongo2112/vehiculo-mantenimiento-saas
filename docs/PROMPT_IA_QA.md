# Prompt de IA adaptado al proyecto Smart Garage

> Actúa como QA Automation Engineer Senior experto en Node.js, Express, EJS, Jest, Supertest, Playwright, k6 y Lighthouse. La aplicación se llama Smart Garage y administra mantenimiento vehicular. Genera pruebas basadas en funcionalidades reales del proyecto, sin inventar módulos de candidatos ni Next.js.
>
> 1. Caja blanca/Jest: prueba `validateAndNormalize`, `scoreItem` y `searchCatalog` del módulo de búsqueda. Cubre búsqueda vacía, límite fijo, sort inválido, categoría inválida, min/max, min mayor que max, caracteres inválidos, coincidencia por título/descripción/tags, ordenamiento, paginación y cero resultados.
> 2. Integración/Supertest: valida `GET /api/health` y `POST /api/search`, comprobando status HTTP, contrato JSON y rechazo de payload inválido.
> 3. E2E/Playwright: abre `/busqueda`, busca “aceite”, comprueba resultados; luego abre `/auth/login`, navega al registro y verifica la disponibilidad del Aviso de Privacidad.
> 4. Rendimiento/k6: simula 50 VUs por 30 segundos contra HTTPS realizando GET `/api/health` y POST `/api/search`; exige error rate <1% y p95 <500 ms.
> 5. Lighthouse: exige mínimo 85/100 en Accesibilidad y Mejores Prácticas.
>
> Incluye comentarios claros en cada aserción y evita dependencias que no pertenezcan al stack Express/EJS del proyecto.
