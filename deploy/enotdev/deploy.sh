#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

# Also prevent overlapping manual deployments on this server.
exec 9>.enotdev-deploy.lock
flock -n 9 || { echo "Another enotdev deployment is running." >&2; exit 1; }

for file in .env.enotdev deploy/enotdev/app.env; do
    if [[ ! -f "$file" ]]; then
        echo "Missing $file; see deploy/enotdev/README.md" >&2
        exit 1
    fi
    if grep -q 'CHANGE_ME' "$file"; then
        echo "Replace placeholders in $file before deployment." >&2
        exit 1
    fi
done

compose() {
    docker compose -p enotdev --env-file .env.enotdev -f docker-compose.enotdev.yml "$@"
}

compose config --quiet
case "${1:-}" in
    "") docker image inspect enotdev-app:local >/dev/null ;;
    --build) compose build enotdev ;;
    *) echo "Usage: bash deploy/enotdev/deploy.sh [--build]" >&2; exit 1 ;;
esac
compose up -d --wait enotdev-postgres
# If migrations fail, existing web/chat containers remain running.
compose run --rm --no-deps --pull never enotdev-migrate
compose up -d --no-deps --no-build --pull never enotdev enotdev-chat
compose ps
