#!/usr/bin/env sh
set -eu

APP_DIR="${APP_DIR:-/opt/smart-garage}"
cd "$APP_DIR"

echo "==> Actualizando repositorio"
git fetch --all --tags
git pull --ff-only

APP_VERSION="${APP_VERSION:-$(git describe --tags --always)}"
export APP_VERSION

echo "==> Construyendo imagen $APP_VERSION"
docker compose -f docker-compose.prod.yml build --pull app

echo "==> Levantando servicios"
docker compose -f docker-compose.prod.yml up -d --remove-orphans

echo "==> Estado"
docker compose -f docker-compose.prod.yml ps

curl -fsS "https://${DOMAIN}/api/health" >/dev/null
echo "✅ Deployment saludable en https://${DOMAIN}"
