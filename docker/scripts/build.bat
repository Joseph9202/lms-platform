@echo off
REM ===========================================
REM DOCKER BUILD SCRIPT - WINDOWS
REM ===========================================
REM Script para construir imagen Docker en Windows

echo =====================================
echo   DOCKER BUILD - LMS PLATFORM
echo =====================================
echo.

REM Configuración
set PROJECT_ID=ai-academy-461719
set IMAGE_NAME=lms-platform
set REGISTRY=gcr.io
set TAG=%1
if "%TAG%"=="" set TAG=latest

echo 📊 Configuración:
echo    Project ID: %PROJECT_ID%
echo    Image: %IMAGE_NAME%
echo    Tag: %TAG%
echo    Registry: %REGISTRY%
echo.

REM Verificar Docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está ejecutándose
    pause
    exit /b 1
)

REM Verificar gcloud
gcloud config get-value project >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: gcloud no está configurado
    echo    Ejecuta: gcloud auth login
    pause
    exit /b 1
)

REM Configurar Docker para gcloud
echo 🔐 Configurando autenticación Docker...
call gcloud auth configure-docker --quiet

REM Limpiar builds anteriores
echo 🧹 Limpiando builds anteriores...
docker system prune -f --filter "until=24h"

REM Build de la imagen
echo 🔨 Construyendo imagen...
docker build ^
    --platform linux/amd64 ^
    --tag %REGISTRY%/%PROJECT_ID%/%IMAGE_NAME%:%TAG% ^
    --tag %REGISTRY%/%PROJECT_ID%/%IMAGE_NAME%:latest ^
    --file Dockerfile ^
    .

if %errorlevel% equ 0 (
    echo ✅ Imagen construida exitosamente
) else (
    echo ❌ Error construyendo imagen
    pause
    exit /b 1
)

REM Verificar tamaño
echo 📦 Información de imagen:
docker images %REGISTRY%/%PROJECT_ID%/%IMAGE_NAME%:%TAG%

echo.
echo ✅ Build completado exitosamente
echo.
echo 📋 Siguiente paso:
echo    Para push: docker push %REGISTRY%/%PROJECT_ID%/%IMAGE_NAME%:%TAG%
echo    Para deploy: kubectl apply -f k8s/
echo.

set /p push="🚀 ¿Push de imagen a registry? (y/n): "
if /i "%push%"=="y" (
    echo 📤 Haciendo push de imagen...
    docker push %REGISTRY%/%PROJECT_ID%/%IMAGE_NAME%:%TAG%
    docker push %REGISTRY%/%PROJECT_ID%/%IMAGE_NAME%:latest
    echo ✅ Push completado
)

pause
