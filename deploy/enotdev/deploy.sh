#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

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
compose build enotdev
compose up -d --wait enotdev-postgres
# If migrations fail, existing web/chat containers remain running.
compose run --rm --no-deps enotdev-migrate
compose up -d --no-deps enotdev enotdev-chat
compose ps