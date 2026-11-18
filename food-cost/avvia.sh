#!/bin/sh
# Avvio di Food cost su Mac e Linux:  sh avvia.sh
cd "$(dirname "$0")" || exit 1
command -v node >/dev/null || { echo "Node.js non è installato: scaricalo da https://nodejs.org (versione LTS)."; exit 1; }
[ -d node_modules ] || npm install || exit 1
[ -f .env ] || cp .env.example .env
npm run db:setup || exit 1
[ -f .next/BUILD_ID ] || npm run build || exit 1
echo "Food cost è in funzione: http://localhost:3100  (Ctrl+C per spegnere)"
npm start
