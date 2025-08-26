#!/usr/bin/env bash
set -euo pipefail

STAMP=$(date +%Y%m%d_%H%M%S)
OUT="./backups/inquiry2_${STAMP}.sql.gz"
mkdir -p ./backups

mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" \
  | gzip > "$OUT"

echo "Backup done: $OUT"