#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

mode="${1:-}"
case "$mode" in
    http|https) ;;
    *) echo "Usage: sudo bash deploy/enotdev/nginx.sh http|https" >&2; exit 1 ;;
esac

# This directory is already mounted in the existing nginx container.
destination=/var/www/certbot/nginx/enotdev
site="$destination/site.conf"
if ! docker exec nginx grep -Fq 'include /var/www/certbot/nginx/enotdev/*.conf;' /etc/nginx/nginx.conf; then
    echo "The running nginx container must see the updated nginx.conf first (see README)." >&2
    exit 1
fi
if [[ "$mode" == https ]]; then
    docker exec nginx test -s /etc/letsencrypt/live/enotdev.su/fullchain.pem
    docker exec nginx test -s /etc/letsencrypt/live/enotdev.su/privkey.pem
fi

mkdir -p "$destination"
backup="$(mktemp)"
had_site=false
if [[ -f "$site" ]]; then
    cp "$site" "$backup"
    had_site=true
fi
committed=false
cleanup() {
    if [[ "$committed" != true ]]; then
        if [[ "$had_site" == true ]]; then
            cp "$backup" "$site"
        else
            rm -f "$site"
        fi
        echo "Configuration was not applied; previous enotdev config restored." >&2
    fi
    rm -f "$backup"
}
trap cleanup EXIT
# Only this site's config changes. Test before a graceful reload.
cp "deploy/enotdev/nginx/enotdev.$mode.conf" "$site"
docker exec nginx nginx -t
docker exec nginx nginx -s reload
committed=true
echo "enotdev.su: $mode configuration applied."