@echo off
color 0A
title LMS Platform - Setup Rapido

echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                   🚀 LMS PLATFORM SETUP RAPIDO                   ║
echo ║                        ¡Todo en 1 click!                          ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 🔍 Verificando que todo este listo...

REM Verificar Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado
    echo 📥 Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker OK

REM Verificar Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose no disponible
    pause
    exit /b 1
)
echo ✅ Docker Compose OK

REM Verificar que Docker este corriendo
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está corriendo
    echo 🔧 Abre Docker Desktop y espera que inicie
    pause
    exit /b 1
)
echo ✅ Docker corriendo

echo.
echo 📋 ¿Qué quieres hacer?
echo.
echo   1. 🚀 Iniciar TODO (App + DB + Monitoreo)
echo   2. 💻 Solo desarrollo (App + DB)
echo   3. 📊 Solo la app
echo   4. 🛑 Parar todo
echo   5. 🧹 Limpiar todo
echo.

set /p choice="Elige opción (1-5): "

if "%choice%"=="1" (
    echo 🚀 Iniciando stack completo...
    docker-compose -f docker-compose.yml -f docker-compose.monitoring.yml up -d
    goto show_urls
)

if "%choice%"=="2" (
    echo 💻 Iniciando desarrollo...
    docker-compose up -d
    goto show_urls
)

if "%choice%"=="3" (
    echo 📊 Iniciando solo app...
    docker-compose up -d lms-app
    goto show_simple
)

if "%choice%"=="4" (
    echo 🛑 Parando servicios...
    docker-compose down
    echo ✅ Todo parado
    pause
    exit /b 0
)

if "%choice%"=="5" (
    echo 🧹 Limpiando todo...
    set /p confirm="⚠️ Esto borra TODO. ¿Seguro? (y/N): "
    if /i "%confirm%"=="y" (
        docker-compose down -v
        docker system prune -a -f
        echo ✅ Todo limpio
    )
    pause
    exit /b 0
)

echo ❌ Opción inválida
pause
exit /b 1

:show_urls
echo.
echo 🎉 ¡TODO LISTO! Aquí tienes las URLs:
echo.
echo   🌐 Tu App LMS:     http://localhost:3000
echo   ❤️ Health Check:    http://localhost:3000/api/health
echo   📊 Métricas:        http://localhost:3000/api/metrics
echo   📈 Grafana:         http://localhost:3001 (admin/admin)
echo   🔥 Prometheus:      http://localhost:9090
echo   🗄️ DB Admin:        http://localhost:8080
echo.
echo 💡 Consejos:
echo   - La app tarda ~30 segundos en estar lista
echo   - Usa Ctrl+C para ver logs en tiempo real
echo   - Para parar: docker-compose down
echo.
goto options

:show_simple
echo.
echo 🎉 ¡App Lista!
echo.
echo   🌐 Tu App LMS: http://localhost:3000
echo.
goto options

:options
echo 📋 ¿Qué quieres hacer ahora?
echo.
echo   1. 📋 Ver logs en tiempo real
echo   2. 🌐 Abrir la app en el navegador
echo   3. 📊 Ver estado de servicios
echo   4. ✅ Salir
echo.

set /p next="Elige opción (1-4): "

if "%next%"=="1" (
    echo 📋 Logs en tiempo real (Ctrl+C para salir):
    docker-compose logs -f
)

if "%next%"=="2" (
    echo 🌐 Abriendo navegador...
    start http://localhost:3000
)

if "%next%"=="3" (
    echo 📊 Estado de servicios:
    docker-compose ps
    echo.
    pause
    goto options
)

if "%next%"=="4" (
    echo ✅ ¡Disfruta tu LMS Platform!
    exit /b 0
)

goto options
