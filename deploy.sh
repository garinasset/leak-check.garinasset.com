#!/bin/bash

set -e

# 加载 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "==> Node: $(node -v)"
echo "==> npm: $(npm -v)"
echo "==> Node path: $(which node)"
echo "==> npm path: $(which npm)"

APP_DIR="/home/deploy/leak-check.garinasset.com"

cd "$APP_DIR"

echo "==> Pull latest code"
git pull

echo "==> Install dependencies"
npm ci

echo "==> Build"
npm run build

echo "==> Reload PM2"
pm2 reload leak-check.garinasset.com

echo "==> Deployment completed"