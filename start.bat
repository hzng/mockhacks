@echo off
setlocal
set "ROOT_DIR=%~dp0"

where node >nul 2>nul || goto :missing_node
where npm >nul 2>nul || goto :missing_npm
where uv >nul 2>nul || goto :missing_uv

if not exist "%ROOT_DIR%node_modules\next\dist\bin\next" (
    echo Installing web app dependencies...
    cd /d "%ROOT_DIR%"
    call npm install
    if errorlevel 1 goto :failed
)

echo Preparing the local API environment...
pushd "%ROOT_DIR%backend"
call uv sync --no-dev --locked
if errorlevel 1 goto :failed_backend
popd

start "Hackathon API" /D "%ROOT_DIR%backend" cmd.exe /k uv run --no-sync fastapi dev --host 127.0.0.1 --port 8000
start "Hackathon Web" /D "%ROOT_DIR%" cmd.exe /k npm run dev -- --hostname 127.0.0.1

echo Starting both servers. The web app will open at http://localhost:3000.
timeout /t 4 /nobreak >nul
start "" "http://localhost:3000"
echo Close the Hackathon API and Hackathon Web windows to stop the servers.
exit /b 0

:missing_node
echo Node.js is required but was not found on PATH.
exit /b 1

:missing_npm
echo npm is required but was not found on PATH.
exit /b 1

:missing_uv
echo uv is required but was not found on PATH.
exit /b 1

:failed_backend
popd
goto :failed

:failed
echo Startup preparation failed. Review the message above and try again.
exit /b 1
