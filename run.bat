@echo off
title VoltGhost Dev Server
cd /d "%~dp0"
echo ===================================================
echo   Starting VoltGhost - Hunt your energy ghosts
echo ===================================================
echo.
echo Opening http://localhost:5173 in browser...
start http://localhost:5173
echo Starting Vite server...
call npm run dev
pause
