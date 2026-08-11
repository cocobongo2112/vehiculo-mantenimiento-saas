#!/usr/bin/env sh
set -eu

if [ "$#" -ne 1 ]; then
  echo "Uso: ./scripts/rollback.sh <tag-anterior>"
  echo "Ejemplo: ./scripts/rollback.sh v1.0.0-release"
  exit 1
fi

TARGET_TAG="$1"
APP_DIR="${APP_DIR:-/opt/smart-garage}"
cd "$APP_DIR"

echo "==> Rollback a $TARGET_TAG"
git fetch --all --tags
git checkout "$TARGET_TAG"
export APP_VERSION="$TARGET_TAG"

docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build app
docker compose -f docker-compose.prod.yml up -d --remove-orphans

docker compose -f docker-compose.prod.yml ps
curl -fsS "https://${DOMAIN}/api/health" >/dev/null
echo "✅ Rollback completado: $TARGET_TAG"
