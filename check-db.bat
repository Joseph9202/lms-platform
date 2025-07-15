@echo off
echo ========================================
echo    VERIFICAR ESTADO BASE DE DATOS
echo ========================================
echo.
echo 🔍 Verificando tu base de datos Cloud SQL...
echo 📊 Instancia: ai-academy-461719:us-central1:lms-production
echo 🌐 IP: 34.122.241.221
echo.

echo 📦 Verificando dependencias...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js no encontrado
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

echo 🔍 Ejecutando verificación completa...
node check-database-status.js

echo.
echo 📋 COMANDOS ÚTILES:
echo   npm run db:studio     - Ver base de datos visualmente
echo   START-HERE.bat        - Configurar Cloud SQL
echo   npm run dev           - Ejecutar aplicación
echo.

pause
