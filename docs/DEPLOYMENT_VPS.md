# Despliegue VPS con Docker + Nginx + HTTPS

## Arquitectura
Internet → 80/443 → Nginx (TLS) → red Docker interna → `app:3000` → MySQL.
El puerto 3000 no se publica al exterior.

## Requisitos
- VPS Ubuntu 22.04/24.04.
- Dominio apuntando por registro A a la IP pública.
- Docker Engine + Docker Compose plugin.
- Certificado Let's Encrypt activo.
- Base MySQL accesible desde el contenedor (servicio administrado o servidor protegido).

## Firewall
No cerrar SSH mientras exista una sesión activa. Ejemplo:
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status numbered
```
Para la rúbrica, los únicos puertos de aplicación expuestos públicamente son 80 y 443; SSH queda restringido a administración.

## Primer despliegue
```bash
sudo mkdir -p /opt/smart-garage
sudo chown $USER:$USER /opt/smart-garage
git clone URL_DEL_REPOSITORIO /opt/smart-garage
cd /opt/smart-garage
cp .env.example .env
nano .env
```
Configurar `DOMAIN`, base de datos y un `SESSION_SECRET` fuerte.

## Certificado
Instalar Certbot en el host y emitir el certificado antes de iniciar el Nginx HTTPS definitivo. Una opción simple:
```bash
sudo apt update
sudo apt install -y certbot
sudo systemctl stop nginx 2>/dev/null || true
sudo certbot certonly --standalone -d TU-DOMINIO.com
```

## Levantar release
```bash
export DOMAIN=TU-DOMINIO.com
export APP_VERSION=v1.0.0-release
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
curl -I https://TU-DOMINIO.com
curl https://TU-DOMINIO.com/api/health
```

## Observabilidad para la demo
```bash
docker compose -f docker-compose.prod.yml logs -f --tail=100 app
```
En otra terminal:
```bash
docker stats smart-garage-app smart-garage-nginx
```

## Renovación TLS
Certbot renueva los archivos del host. Tras una renovación, recargar Nginx del contenedor:
```bash
sudo certbot renew
cd /opt/smart-garage
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```
