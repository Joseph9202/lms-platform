@echo off
echo ================================================
echo    CONFIGURACION CLOUD SQL - LMS PLATFORM
echo ================================================
echo.

:: Verificar si gcloud está instalado
where gcloud >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Google Cloud CLI no está instalado.
    echo 📥 Descarga desde: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

:: Solicitar información del proyecto
set /p PROJECT_ID="🔧 Ingresa tu PROJECT_ID de Google Cloud: "
set /p INSTANCE_NAME="🏗️  Nombre de la instancia (default: lms-production): " || set INSTANCE_NAME=lms-production
set /p REGION="🌎 Region (default: us-central1): " || set REGION=us-central1

echo.
echo 📊 Configuración:
echo    Project ID: %PROJECT_ID%
echo    Instance: %INSTANCE_NAME%
echo    Region: %REGION%
echo.

set /p CONFIRM="¿Continuar con la configuración? (y/n): "
if /i not "%CONFIRM%"=="y" (
    echo ❌ Configuración cancelada.
    pause
    exit /b 0
)

echo.
echo 🚀 Iniciando configuración de Cloud SQL...
echo ⏱️  Esto puede tomar 15-20 minutos...

:: Ejecutar script de bash usando Git Bash si está disponible
where bash >nul 2>nul
if %errorlevel% equ 0 (
    echo 📂 Ejecutando con Bash...
    bash setup-cloud-sql.sh "%PROJECT_ID%" "%INSTANCE_NAME%" "%REGION%"
) else (
    echo ❌ Bash no encontrado. Usa Google Cloud Shell o instala Git Bash.
    echo 🔗 Google Cloud Shell: https://shell.cloud.google.com
    echo.
    echo 📋 Comando para ejecutar en Cloud Shell:
    echo    bash setup-cloud-sql.sh %PROJECT_ID% %INSTANCE_NAME% %REGION%
)

echo.
pause
