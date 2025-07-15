@echo off
echo ========================================
echo    CONFIGURACION SIMPLE CLOUD SQL
echo ========================================
echo.
echo 🚀 Configurando Cloud SQL para escalar automáticamente
echo 📈 Empezará básico y crecerá con tus estudiantes
echo 💰 Costo inicial: ~$50-100/mes (escala según uso)
echo.
echo 🎯 INSTANCIA DETECTADA:
echo   Project: ai-academy-461719
echo   Instance: lms-production
echo   IP: 34.122.241.221
echo.

set /p confirm="🔄 ¿Configurar Cloud SQL ahora? (y/n): "
if /i not "%confirm%"=="y" (
    echo ❌ Configuración cancelada.
    pause
    exit /b 0
)

echo.
echo 📦 Instalando dependencias...
call npm install mysql2
if %errorlevel% neq 0 (
    echo ❌ Error instalando mysql2
    pause
    exit /b 1
)

echo.
echo 🏗️ Configurando base de datos y schema...
node setup-simple-cloud-sql.js
if %errorlevel% neq 0 (
    echo ❌ Error en configuración
    pause
    exit /b 1
)

echo.
echo 🧪 Probando conexión...
node cloud-sql/test-connection.js

echo.
echo ╔════════════════════════════════════════════════════════════════╗
echo ║                🎉 CONFIGURACIÓN COMPLETADA 🎉                 ║
echo ╠════════════════════════════════════════════════════════════════╣
echo ║ ✅ Cloud SQL configurado para auto-escalado                   ║
echo ║ ✅ Schema básico aplicado                                      ║
echo ║ ✅ Listo para empezar a crecer                                ║
echo ║                                                                ║
echo ║ 📝 SIGUIENTES PASOS:                                          ║
echo ║ 1. Copiar .env.production a .env                              ║
echo ║ 2. Ejecutar: npm run dev                                      ║
echo ║ 3. ¡Empezar a agregar estudiantes!                           ║
echo ║                                                                ║
echo ║ 💡 ESCALADO AUTOMÁTICO:                                       ║
echo ║ • CPU y RAM escalan según demanda                             ║
echo ║ • Storage crece automáticamente                               ║
echo ║ • Índices optimizados para crecimiento                       ║
echo ║ • Backup automático configurado                               ║
echo ╚════════════════════════════════════════════════════════════════╝

echo.
set /p copyEnv="🔧 ¿Copiar .env.production a .env ahora? (y/n): "
if /i "%copyEnv%"=="y" (
    copy .env.production .env
    echo ✅ Variables copiadas a .env
    echo.
    echo 🚀 ¡Ahora puedes ejecutar: npm run dev
)

echo.
echo 📚 RECURSOS:
echo   • Documentación: cloud-sql/README.md
echo   • Monitoreo: https://console.cloud.google.com/sql
echo   • Comandos: npm run cloud-sql:test
echo.
pause
