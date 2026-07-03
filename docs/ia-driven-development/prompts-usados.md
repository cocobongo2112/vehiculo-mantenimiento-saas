# Prompts usados con Cursor

## 1. Análisis del proyecto

Analiza la estructura de este proyecto Node.js + Express + EJS + MySQL. Identifica rutas, controladores, modelos, middlewares, vistas, conexión a base de datos e integraciones externas. Después propón cómo esta arquitectura puede evolucionar hacia Next.js App Router.

## 2. Layout Next.js

Usando las reglas del proyecto y la documentación de @Next.js, crea un layout de dashboard para next-blueprint-demo usando App Router. Debe incluir una estructura para Smart Garage con navegación a Dashboard, Órdenes, Clientes, Vehículos y Reportes. Usa TypeScript y Tailwind. No modifiques archivos fuera de next-blueprint-demo.

## 3. API Route

Crea un Route Handler en Next.js para consultar órdenes de servicio de ejemplo. Debe estar en next-blueprint-demo/src/app/api/orders/route.ts. Usa TypeScript, retorna JSON y no conectes todavía a base de datos real.

## 4. ESLint

Revisa los errores de ESLint del proyecto next-blueprint-demo y corrígelos sin cambiar el comportamiento de la aplicación. Aplica las reglas .mdc de calidad y testing.

## 5. TDD

Primero crea una prueba con Vitest para una función getNextOrderStatus. Luego implementa el código mínimo para hacer pasar las pruebas.