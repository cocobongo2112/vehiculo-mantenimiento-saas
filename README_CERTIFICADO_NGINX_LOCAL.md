# Certificado local con Nginx como proxy inverso

Este parche agrega una configuración para mostrar el proyecto por HTTPS usando Nginx en Docker como proxy inverso.

## Archivos agregados

- `docker-compose.nginx-ssl.yml`: levanta Nginx en Docker.
- `nginx/nginx.conf`: configura Nginx para redirigir HTTP a HTTPS y reenviar tráfico a `http://localhost:3000`.
- `scripts/generar-certificado-local.ps1`: genera certificado local confiable con mkcert.
- `scripts/iniciar-nginx-ssl.ps1`: inicia Nginx con Docker Compose.
- `nginx/certs/README_CERTIFICADOS.txt`: indica dónde van los certificados.
- `AGREGAR_A_GITIGNORE.txt`: líneas que deben agregarse al `.gitignore`.

## Cómo probar

1. Instalar mkcert, si no está instalado:

```powershell
winget install FiloSottile.mkcert
```

2. Generar certificado local:

```powershell
.\scripts\generar-certificado-local.ps1
```

3. En otra terminal, correr el proyecto:

```powershell
node app.js
```

4. Levantar Nginx:

```powershell
.\scripts\iniciar-nginx-ssl.ps1
```

5. Abrir:

```text
https://localhost
```

Debe verse conexión segura/candado porque el certificado local fue generado por mkcert y confiado en el equipo.

## Explicación técnica

El navegador se conecta por HTTPS a Nginx en el puerto 443. Nginx termina TLS usando el certificado local y reenvía la solicitud al backend Node/Express en `http://localhost:3000`. Es decir, el tráfico externo navegador -> Nginx viaja cifrado, mientras que Nginx -> Node queda como comunicación interna de desarrollo.
