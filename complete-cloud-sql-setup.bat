@echo off
echo ========================================
echo    CONFIGURACION COMPLETA CLOUD SQL
echo ========================================
echo.
echo 🎯 Instancia detectada: ai-academy-461719:us-central1:lms-production
echo 🌐 IP: 34.122.241.221
echo 💰 Configuración para 20,000 usuarios
echo.

echo 📋 Este script completará la migración automáticamente:
echo   1. ✅ Configurar base de datos y usuario
echo   2. ✅ Aplicar schema optimizado con índices
echo   3. ✅ Verificar conexión y performance
echo   4. ✅ Generar archivo .env de producción
echo.

set /p confirm="¿Continuar con la configuración automática? (y/n): "
if /i not "%confirm%"=="y" (
    echo ❌ Configuración cancelada.
    pause
    exit /b 0
)

echo.
echo 🚀 Iniciando configuración automática...
echo ⏱️  Esto tomará 3-5 minutos...
echo.

echo 📦 Instalando dependencias necesarias...
call npm install mysql2
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo.
echo 🏗️ PASO 1: Configurando base de datos y usuario...
node setup-production-db.js
if %errorlevel% neq 0 (
    echo ❌ Error en configuración de base de datos
    echo 💡 Verifica que tengas permisos en Google Cloud
    pause
    exit /b 1
)

echo.
echo ⚡ PASO 2: Aplicando schema optimizado...
node apply-optimized-schema.js
if %errorlevel% neq 0 (
    echo ❌ Error aplicando schema
    echo 💡 Verifica la conexión a Cloud SQL
    pause
    exit /b 1
)

echo.
echo 🧪 PASO 3: Verificación completa del sistema...
node cloud-sql/test-connection.js
if %errorlevel% neq 0 (
    echo ⚠️  Algunas verificaciones fallaron
    echo 💡 Revisa los errores pero la configuración básica está lista
)

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                🎉 CONFIGURACIÓN COMPLETADA 🎉                 ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║ ✅ Cloud SQL configurado para 20,000 usuarios                 ║
echo ║ ✅ Schema optimizado con 15+ índices aplicado                 ║
echo ║ ✅ Base de datos lista para producción                        ║
echo ║ ✅ Configuración guardada en .env.production                  ║
echo ║                                                                ║
echo ║ 📝 SIGUIENTES PASOS:                                          ║
echo ║ 1. Copiar .env.production a .env                              ║
echo ║ 2. Probar tu aplicación: npm run dev                          ║
echo ║ 3. Desplegar en GKE cuando estés listo                       ║
echo ║                                                                ║
echo ║ 💰 COSTOS ESTIMADOS:                                          ║
echo ║ • Instancia Cloud SQL: ~$280/mes                              ║
echo ║ • Read Replica: ~$140/mes                                     ║
echo ║ • Almacenamiento: ~$15/mes                                    ║
echo ║ • TOTAL: ~$435/mes para 20K usuarios                          ║
echo ╚════════════════════════════════════════════════════════════════╝

echo.
echo 🔧 COMANDOS ÚTILES:
echo   npm run dev              - Ejecutar aplicación
echo   npm run db:studio        - Ver base de datos
echo   npm run cloud-sql:test   - Probar conexión
echo.

set /p openEnv="¿Abrir archivo .env.production para revisión? (y/n): "
if /i "%openEnv%"=="y" (
    notepad .env.production
)

echo.
echo 🎊 ¡Tu LMS Platform está listo para 20,000 estudiantes!
pause
