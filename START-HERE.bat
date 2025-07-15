@echo off
color 0A
echo.
echo     ███████╗ ██████╗ █████╗ ██╗     ███████╗
echo     ██╔════╝██╔════╝██╔══██╗██║     ██╔════╝
echo     ███████╗██║     ███████║██║     █████╗  
echo     ╚════██║██║     ██╔══██║██║     ██╔══╝  
echo     ███████║╚██████╗██║  ██║███████╗███████╗
echo     ╚══════╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚══════╝
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║            ✅ CLOUD SQL LISTO PARA AUTO-ESCALADO ✅                ║
echo ╠════════════════════════════════════════════════════════════════════╣
echo ║                                                                    ║
echo ║  🎯 INSTANCIA: ai-academy-461719:us-central1:lms-production        ║
echo ║  🌐 IP: 34.122.241.221                                            ║
echo ║  📈 ESCALADO: Automático según estudiantes                        ║
echo ║  💰 COSTO: Empieza ~$50/mes, crece según uso                      ║
echo ║                                                                    ║
echo ║  ✅ Schema simplificado y escalable                               ║
echo ║  ✅ Configuración básica optimizada                               ║
echo ║  ✅ Auto-escalado de CPU, RAM y Storage                          ║
echo ║  ✅ Backup automático                                             ║
echo ║                                                                    ║
echo ╠════════════════════════════════════════════════════════════════════╣
echo ║                    🚀 CONFIGURAR AHORA 🚀                         ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

set /p execute="🚀 ¿Configurar Cloud SQL para auto-escalado AHORA? (y/n): "
if /i "%execute%"=="y" (
    echo.
    echo 📈 Iniciando configuración escalable...
    call setup-auto-scale.bat
) else (
    echo.
    echo 📋 CONFIGURACIÓN CUANDO ESTÉS LISTO:
    echo.
    echo    🚀 Configuración automática:
    echo       .\setup-auto-scale.bat
    echo.
    echo    🔧 Configuración simple:
    echo       node setup-simple-cloud-sql.js
    echo.
    echo    📚 Ver documentación: CLOUD-SQL-READY.md
)

echo.
echo 📈 ¡Tu LMS escalará automáticamente con tus estudiantes!
pause
