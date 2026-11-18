@echo off
rem Avvio di Food cost su Windows: doppio clic su questo file.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js non e installato. Scaricalo da https://nodejs.org ^(versione LTS^), installalo e riprova.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Prima installazione: qualche minuto di pazienza...
  call npm install || goto errore
)
if not exist .env copy .env.example .env >nul
call npm run db:setup || goto errore
if not exist .next\BUILD_ID (
  call npm run build || goto errore
)
echo.
echo Food cost e in funzione: http://localhost:3100
echo Lascia aperta questa finestra. Per spegnere: chiudila.
start "" cmd /c "timeout /t 5 >nul & start http://localhost:3100"
call npm start
goto fine
:errore
echo.
echo Qualcosa non ha funzionato: copia il messaggio qui sopra.
:fine
pause
