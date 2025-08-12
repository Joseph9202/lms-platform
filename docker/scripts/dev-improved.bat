@echo off
color 0A
title LMS Platform - Development Environment

echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║                   🐳 LMS PLATFORM DEVELOPMENT                        ║
echo ║                     Advanced Docker Environment                       ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.

REM ===========================================
REM VERIFICACIONES PREVIAS
REM ===========================================
echo 🔍 Verificando prerrequisitos...

REM Verificar Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado
    echo 📥 Instala Docker Desktop: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)
echo ✅ Docker disponible

REM Verificar Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose no está instalado
    pause
    exit /b 1
)
echo ✅ Docker Compose disponible

REM Verificar que Docker esté ejecutándose
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está ejecutándose
    echo 🔧 Inicia Docker Desktop y espera que esté listo
    pause
    exit /b 1
)
echo ✅ Docker ejecutándose

echo.
echo 🔧 Configurando entorno de desarrollo...

REM ===========================================
REM CONFIGURACIÓN DE AMBIENTE
REM ===========================================

REM Verificar archivo .env
if not exist ".env" (
    echo 📝 Creando archivo .env...
    if exist ".env.example" (
        copy .env.example .env
        echo ✅ .env creado desde .env.example
    ) else (
        echo ⚠️ No se encontró .env.example
        echo 📝 Creando .env básico...
        (
            echo # LMS Platform Development Environment
            echo NODE_ENV=development
            echo DATABASE_URL="mysql://lms_user:lms_password@mysql-dev:3306/lms_platform_dev"
            echo REDIS_URL="redis://redis-dev:6379"
            echo NEXT_PUBLIC_APP_URL="http://localhost:3000"
            echo # Agrega tus variables específicas aquí
        ) > .env
        echo ✅ .env básico creado
    )
) else (
    echo ✅ .env ya existe
)

REM Crear networks si no existen
echo 🌐 Configurando redes Docker...
docker network create lms-network 2>nul || echo ✅ Red lms-network ya existe

REM ===========================================
REM LIMPIAR CONTAINERS ANTERIORES (OPCIONAL)
REM ===========================================
echo.
echo 🧹 ¿Deseas limpiar containers anteriores? (recomendado para fresh start)
set /p clean_choice="[y/N]: "

if /i "%clean_choice%"=="y" (
    echo 🛑 Deteniendo containers existentes...
    docker-compose -f docker-compose.yml -p lms-platform down --remove-orphans
    
    echo 🧹 Limpiando volúmenes huérfanos...
    docker volume prune -f
    
    echo ✅ Limpieza completada
)

REM ===========================================
REM INICIAR SERVICIOS DE DESARROLLO
REM ===========================================
echo.
echo 🚀 Iniciando entorno de desarrollo...
echo.

REM Iniciar servicios en orden específico
echo 📊 Iniciando base de datos MySQL...
docker-compose -f docker-compose.yml -p lms-platform up -d mysql-dev

echo ⏳ Esperando que MySQL esté listo...
:wait_mysql
docker-compose -f docker-compose.yml -p lms-platform exec mysql-dev mysqladmin ping -h localhost --silent 2>nul
if %errorlevel% neq 0 (
    echo    🔄 MySQL iniciando...
    timeout /t 2 >nul
    goto wait_mysql
)
echo ✅ MySQL listo

echo 🔴 Iniciando Redis...
docker-compose -f docker-compose.yml -p lms-platform up -d redis-dev
timeout /t 2 >nul
echo ✅ Redis iniciado

echo 🐳 Iniciando aplicación principal...
docker-compose -f docker-compose.yml -p lms-platform up -d lms-app

echo ⏳ Esperando que la aplicación esté lista...
:wait_app
curl -f http://localhost:3000/api/health >nul 2>&1
if %errorlevel% neq 0 (
    echo    🔄 Aplicación iniciando...
    timeout /t 3 >nul
    goto wait_app
)
echo ✅ Aplicación lista

echo 🌐 Iniciando Nginx (opcional)...
docker-compose -f docker-compose.yml -p lms-platform up -d nginx-dev 2>nul || echo ⚠️ Nginx no configurado (opcional)

REM ===========================================
REM VERIFICACIÓN FINAL
REM ===========================================
echo.
echo 📊 Estado final de servicios:
docker-compose -f docker-compose.yml -p lms-platform ps

echo.
echo ╔═══════════════════════════════════════════════════════════════════════╗
echo ║                         🎉 ¡ENTORNO LISTO! 🎉                        ║
echo ╠═══════════════════════════════════════════════════════════════════════╣
echo ║                                                                       ║
echo ║  🌐 Aplicación:      http://localhost:3000                           ║
echo ║  📊 Health Check:    http://localhost:3000/api/health                 ║
echo ║  🗄️ MySQL:           localhost:3306                                   ║
echo ║  🔴 Redis:           localhost:6379                                   ║
echo ║                                                                       ║
echo ║  📋 COMANDOS ÚTILES:                                                  ║
echo ║  • Ver logs:         docker-compose -p lms-platform logs -f          ║
echo ║  • Reiniciar:        docker-compose -p lms-platform restart          ║
echo ║  • Detener:          docker-compose -p lms-platform down             ║
echo ║  • Shell de app:     docker-compose -p lms-platform exec lms-app sh  ║
echo ║                                                                       ║
echo ╚═══════════════════════════════════════════════════════════════════════╝
echo.

REM ===========================================
REM OPCIONES POST-INICIO
REM ===========================================
echo 📋 ¿Qué deseas hacer ahora?
echo.
echo   1. 📋 Ver logs en tiempo real
echo   2. 🌐 Abrir aplicación en navegador
echo   3. 🐚 Acceder a shell de contenedor
echo   4. 📊 Ver estado de servicios
echo   5. 🔧 Ejecutar migraciones de DB
echo   6. ✅ Continuar en background
echo.

set /p post_choice="Selecciona una opción (1-6): "

if "%post_choice%"=="1" (
    echo 📋 Mostrando logs en tiempo real (Ctrl+C para salir)...
    docker-compose -f docker-compose.yml -p lms-platform logs -f
)

if "%post_choice%"=="2" (
    echo 🌐 Abriendo navegador...
    start http://localhost:3000
)

if "%post_choice%"=="3" (
    echo 🐚 Accediendo a shell del contenedor...
    docker-compose -f docker-compose.yml -p lms-platform exec lms-app /bin/sh
)

if "%post_choice%"=="4" (
    echo 📊 Estado de servicios:
    docker-compose -f docker-compose.yml -p lms-platform ps
    echo.
    echo 📈 Uso de recursos:
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    pause
)

if "%post_choice%"=="5" (
    echo 🔧 Ejecutando migraciones de base de datos...
    docker-compose -f docker-compose.yml -p lms-platform exec lms-app npm run db:migrate
    echo ✅ Migraciones completadas
    pause
)

if "%post_choice%"=="6" (
    echo ✅ Entorno ejecutándose en background
    echo 💡 Usa: docker-compose -p lms-platform logs -f para ver logs
)

echo.
echo 🎊 ¡Desarrollo con Docker configurado exitosamente!
echo.
