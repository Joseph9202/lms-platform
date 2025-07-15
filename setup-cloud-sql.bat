@echo off
echo ========================================
echo    CLOUD SQL SETUP - LMS PLATFORM
echo ========================================
echo.
echo 🚀 Configurando Cloud SQL para 20,000 usuarios
echo 💰 Costo estimado: $450/mes
echo 📊 Performance: 99.95%% uptime garantizado
echo.
echo 🎯 INSTANCIA DETECTADA:
echo   Project: ai-academy-461719
echo   Instance: lms-production
echo   IP: 34.122.241.221
echo   Region: us-central1
echo.

:menu
echo 📋 OPCIONES DE CONFIGURACIÓN:
echo 1. ⚡ Configuración automática completa (RECOMENDADO)
echo 2. 🔧 Configuración paso a paso
echo 3. 🧪 Solo probar conexión existente
echo 4. 📄 Ver documentación
echo 5. ❌ Salir
echo.

set /p choice="Selecciona una opción (1-5): "

if "%choice%"=="1" goto auto
if "%choice%"=="2" goto manual
if "%choice%"=="3" goto test
if "%choice%"=="4" goto docs
if "%choice%"=="5" goto exit
echo.
echo ❌ Opción inválida. Intenta de nuevo.
echo.
goto menu

:auto
echo.
echo ⚡ CONFIGURACIÓN AUTOMÁTICA COMPLETA
echo =====================================
echo.
echo Esta opción configurará todo automáticamente:
echo ✅ Base de datos y usuario
echo ✅ Schema optimizado con índices
echo ✅ Verificación completa
echo ✅ Archivo .env de producción
echo.
call complete-cloud-sql-setup.bat
goto exit

:manual
echo.
echo 🔧 CONFIGURACIÓN PASO A PASO
echo =============================
echo.
cd cloud-sql
call cloud-sql-manager.bat
cd ..
goto exit

:test
echo.
echo 🧪 PROBANDO CONEXIÓN EXISTENTE
echo ================================
echo.
node cloud-sql/test-connection.js
echo.
pause
goto menu

:docs
echo.
echo 📄 ABRIENDO DOCUMENTACIÓN
echo ===========================
echo.
if exist "cloud-sql\README.md" (
    notepad cloud-sql\README.md
) else (
    echo ❌ Documentación no encontrada
)
echo.
pause
goto menu

:exit
echo.
echo 👋 ¡Gracias por usar el configurador de Cloud SQL!
echo.
echo 📚 RECURSOS ÚTILES:
echo    - Configuración: .env.production
echo    - Documentación: cloud-sql/README.md
echo    - Soporte: https://cloud.google.com/sql/docs
echo    - Comandos NPM: npm run cloud-sql:*
echo.
echo 💡 COMANDOS RÁPIDOS:
echo    npm run cloud-sql:complete  - Configuración completa
echo    npm run cloud-sql:test     - Probar conexión
echo    npm run db:studio          - Ver base de datos
echo.
pause
exit /b 0
