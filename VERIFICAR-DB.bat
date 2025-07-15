@echo off
color 0E
echo.
echo     ██╗   ██╗███████╗██████╗ ██╗███████╗██╗ ██████╗ █████╗ ██████╗ 
echo     ██║   ██║██╔════╝██╔══██╗██║██╔════╝██║██╔════╝██╔══██╗██╔══██╗
echo     ██║   ██║█████╗  ██████╔╝██║█████╗  ██║██║     ███████║██████╔╝
echo     ╚██╗ ██╔╝██╔══╝  ██╔══██╗██║██╔══╝  ██║██║     ██╔══██║██╔══██╗
echo      ╚████╔╝ ███████╗██║  ██║██║██║     ██║╚██████╗██║  ██║██║  ██║
echo       ╚═══╝  ╚══════╝╚═╝  ╚═╝╚═╝╚═╝     ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                 🔍 VERIFICAR BASE DE DATOS                        ║
echo ╠════════════════════════════════════════════════════════════════════╣
echo ║                                                                    ║
echo ║  🎯 INSTANCIA: ai-academy-461719:us-central1:lms-production        ║
echo ║  🌐 IP: 34.122.241.221                                            ║
echo ║                                                                    ║
echo ║  Esta verificación te dirá:                                       ║
echo ║  ✅ Si la base de datos existe                                     ║
echo ║  ✅ Si las tablas están creadas                                    ║
echo ║  ✅ Cuántos registros hay                                          ║
echo ║  ✅ Qué configuración necesitas                                    ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

set /p verify="🔍 ¿Verificar estado de la base de datos AHORA? (y/n): "
if /i "%verify%"=="y" (
    echo.
    echo 🚀 Iniciando verificación...
    call check-db.bat
) else (
    echo.
    echo 📋 COMANDOS PARA VERIFICAR DESPUÉS:
    echo.
    echo    🔍 Verificación completa:
    echo       .\check-db.bat
    echo.
    echo    📊 Solo registros:
    echo       npm run db:check
    echo.
    echo    👁️ Ver base de datos visualmente:
    echo       npm run db:studio
    echo.
    echo    ⚙️ Si necesitas configurar:
    echo       .\START-HERE.bat
)

echo.
pause
