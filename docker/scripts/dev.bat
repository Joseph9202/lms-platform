@echo off
REM ===========================================
REM DOCKER DEV SCRIPT - WINDOWS
REM ===========================================
REM Script para desarrollo local con Docker

title LMS Platform - Docker Development

echo =====================================
echo   LMS PLATFORM - DESARROLLO DOCKER
echo =====================================
echo.

:menu
echo 📋 OPCIONES DISPONIBLES:
echo.
echo   1. 🚀 Iniciar entorno de desarrollo
echo   2. 🛑 Detener servicios
echo   3. 🔄 Reiniciar servicios
echo   4. 🔨 Reconstruir imágenes
echo   5. 📋 Ver logs en tiempo real
echo   6. 🐚 Abrir shell en container
echo   7. 🗄️  Acceder a base de datos
echo   8. 🔴 Acceder a Redis
echo   9. 📊 Ver estado de servicios
echo  10. 🧪 Ejecutar migraciones
echo  11. 🌱 Poblar base de datos
echo  12. 🧹 Limpiar todo
echo  13. ❌ Salir
echo.

set /p choice="Selecciona una opción (1-13): "

if "%choice%"=="1" goto start
if "%choice%"=="2" goto stop
if "%choice%"=="3" goto restart
if "%choice%"=="4" goto build
if "%choice%"=="5" goto logs
if "%choice%"=="6" goto shell
if "%choice%"=="7" goto database
if "%choice%"=="8" goto redis
if "%choice%"=="9" goto status
if "%choice%"=="10" goto migrate
if "%choice%"=="11" goto seed
if "%choice%"=="12" goto clean
if "%choice%"=="13" goto exit
goto menu

:start
echo.
echo 🚀 INICIANDO ENTORNO DE DESARROLLO
echo ===================================
echo.

REM Verificar Docker
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está ejecutándose
    echo    Inicia Docker Desktop y vuelve a intentar
    pause
    goto menu
)

REM Verificar archivo .env
if not exist ".env" (
    echo ⚠️  Archivo .env no encontrado
    if exist ".env.example" (
        echo 📋 Creando .env desde .env.example...
        copy .env.example .env
        echo ✅ Archivo .env creado
        echo 📝 Edita .env con tus configuraciones antes de continuar
        notepad .env
    ) else (
        echo ❌ .env.example no encontrado
        pause
        goto menu
    )
)

REM Crear red si no existe
docker network create lms-network >nul 2>&1

REM Iniciar servicios
echo 🐳 Iniciando servicios con Docker Compose...
docker-compose -f docker-compose.yml -p lms-platform up -d

if %errorlevel% equ 0 (
    echo ✅ Servicios iniciados exitosamente
    echo.
    echo ⏳ Esperando a que los servicios estén listos...
    timeout /t 10 /nobreak >nul
    
    echo.
    echo 🎉 ENTORNO DE DESARROLLO LISTO
    echo ==============================
    echo.
    echo 📋 URLs disponibles:
    echo    App:     http://localhost:3000
    echo    Nginx:   http://localhost:80
    echo    DB:      localhost:3306
    echo    Redis:   localhost:6379
    echo.
    echo 💡 Presiona cualquier tecla para volver al menú
    pause >nul
) else (
    echo ❌ Error iniciando servicios
    pause
)
goto menu

:stop
echo.
echo 🛑 DETENIENDO SERVICIOS
echo =======================
echo.
docker-compose -f docker-compose.yml -p lms-platform down
echo ✅ Servicios detenidos
pause
goto menu

:restart
echo.
echo 🔄 REINICIANDO SERVICIOS
echo ========================
echo.
docker-compose -f docker-compose.yml -p lms-platform restart
echo ✅ Servicios reiniciados
pause
goto menu

:build
echo.
echo 🔨 RECONSTRUYENDO IMÁGENES
echo ==========================
echo.
docker-compose -f docker-compose.yml -p lms-platform build --no-cache
echo ✅ Imágenes reconstruidas
pause
goto menu

:logs
echo.
echo 📋 LOGS EN TIEMPO REAL
echo ======================
echo.
echo (Ctrl+C para salir)
docker-compose -f docker-compose.yml -p lms-platform logs -f
goto menu

:shell
echo.
echo 🐚 ABRIENDO SHELL EN CONTAINER
echo ===============================
echo.
docker-compose -f docker-compose.yml -p lms-platform exec lms-app /bin/sh
goto menu

:database
echo.
echo 🗄️  ACCEDIENDO A BASE DE DATOS
echo ===============================
echo.
docker-compose -f docker-compose.yml -p lms-platform exec mysql-dev mysql -u lms_user -plms_password lms_platform_dev
goto menu

:redis
echo.
echo 🔴 ACCEDIENDO A REDIS CLI
echo =========================
echo.
docker-compose -f docker-compose.yml -p lms-platform exec redis-dev redis-cli
goto menu

:status
echo.
echo 📊 ESTADO DE SERVICIOS
echo ======================
echo.
docker-compose -f docker-compose.yml -p lms-platform ps
echo.
echo 💾 Volúmenes:
docker volume ls | findstr lms-platform
echo.
pause
goto menu

:migrate
echo.
echo 🧪 EJECUTANDO MIGRACIONES
echo =========================
echo.
docker-compose -f docker-compose.yml -p lms-platform exec lms-app npx prisma db push
docker-compose -f docker-compose.yml -p lms-platform exec lms-app npx prisma generate
echo ✅ Migraciones completadas
pause
goto menu

:seed
echo.
echo 🌱 POBLANDO BASE DE DATOS
echo =========================
echo.
docker-compose -f docker-compose.yml -p lms-platform exec lms-app node add-courses.js
echo ✅ Base de datos poblada
pause
goto menu

:clean
echo.
echo 🧹 LIMPIAR TODO
echo ===============
echo.
echo ⚠️  Esto eliminará containers, volúmenes e imágenes
set /p confirm="¿Estás seguro? (y/n): "
if /i not "%confirm%"=="y" goto menu

echo 🧹 Limpiando...
docker-compose -f docker-compose.yml -p lms-platform down -v --remove-orphans
docker system prune -a -f --volumes
echo ✅ Limpieza completada
pause
goto menu

:exit
echo.
echo 👋 ¡Gracias por usar LMS Platform Docker!
echo.
echo 📚 RECURSOS ÚTILES:
echo    - Documentación: README.md
echo    - Docker Hub: https://hub.docker.com
echo    - Kubernetes: k8s/
echo.
pause
exit /b 0
