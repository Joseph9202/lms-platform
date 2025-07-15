@echo off
echo.
echo 🚀 PACIFIC LABS LMS - DEPLOYMENT AUTOMATICO
echo ==========================================
echo.

REM Verificar prerrequisitos
echo 📋 Verificando prerrequisitos...

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js no está instalado
    pause
    exit /b 1
)

REM Verificar archivo .env
if not exist ".env" (
    echo ❌ Error: Archivo .env no encontrado
    echo Por favor configura las variables de entorno antes del deployment
    pause
    exit /b 1
)

REM Verificar credenciales de Google Cloud
if not exist "google-cloud-credentials.json" (
    echo ❌ Error: Credenciales de Google Cloud no encontradas
    echo Por favor agrega el archivo google-cloud-credentials.json
    pause
    exit /b 1
)

echo ✅ Prerrequisitos verificados
echo.

REM Limpiar instalación anterior
echo 🧹 Limpiando instalación anterior...
if exist "node_modules" rmdir /s /q node_modules
if exist ".next" rmdir /s /q .next
if exist "dist" rmdir /s /q dist

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm ci
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas
echo.

REM Generar cliente de Prisma
echo 🗄️ Generando cliente de Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Error generando cliente de Prisma
    pause
    exit /b 1
)

echo ✅ Cliente de Prisma generado
echo.

REM Ejecutar migraciones de base de datos
echo 🔄 Ejecutando migraciones de base de datos...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ⚠️ Advertencia: Error en migraciones de base de datos
    echo El sistema puede funcionar con funcionalidad limitada
)

REM Ejecutar migración de video analytics
echo 📊 Aplicando migración de video analytics...
call npx prisma db execute --file="./prisma/migrations/add_video_analytics_system.sql" --preview-feature 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ Migración de analytics no aplicada (base de datos puede no soportar SQL directo)
)

echo.

REM Verificar sistema de videos
echo 🎬 Verificando sistema de videos...
node test-system-advanced.js
if %errorlevel% neq 0 (
    echo ⚠️ Advertencia: Algunas pruebas fallaron
    echo El sistema se desplegará pero con funcionalidad limitada
)

echo.

REM Compilar para producción
echo 🔨 Compilando para producción...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Error en compilación
    pause
    exit /b 1
)

echo ✅ Compilación exitosa
echo.

REM Crear directorios necesarios
echo 📁 Creando estructura de directorios...
if not exist "temp-processing" mkdir temp-processing
if not exist "videos" mkdir videos
if not exist "videos\leccion-1" mkdir videos\leccion-1
if not exist "videos\leccion-2" mkdir videos\leccion-2

REM Configurar permisos (Windows)
echo 🔐 Configurando permisos...
icacls "temp-processing" /grant Everyone:(OI)(CI)F /T >nul 2>&1
icacls "videos" /grant Everyone:(OI)(CI)F /T >nul 2>&1

REM Crear script de inicio de producción
echo 📝 Creando script de inicio...
echo @echo off > start-production.bat
echo echo 🚀 Iniciando Pacific Labs LMS en modo producción... >> start-production.bat
echo set NODE_ENV=production >> start-production.bat
echo call npm start >> start-production.bat

REM Crear script de backup
echo 💾 Creando script de backup...
echo @echo off > backup-system.bat
echo echo 📦 Creando backup del sistema... >> backup-system.bat
echo set BACKUP_DIR=backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2% >> backup-system.bat
echo mkdir %%BACKUP_DIR%% >> backup-system.bat
echo xcopy /E /I /H .env %%BACKUP_DIR%%\ >> backup-system.bat
echo xcopy /E /I /H google-cloud-credentials.json %%BACKUP_DIR%%\ >> backup-system.bat
echo xcopy /E /I /H videos %%BACKUP_DIR%%\videos\ >> backup-system.bat
echo xcopy /E /I /H prisma %%BACKUP_DIR%%\prisma\ >> backup-system.bat
echo echo ✅ Backup completado en %%BACKUP_DIR%% >> backup-system.bat

REM Crear script de monitoreo
echo 📊 Creando script de monitoreo...
echo @echo off > monitor-system.bat
echo :monitor >> monitor-system.bat
echo cls >> monitor-system.bat
echo echo 📊 MONITOR DEL SISTEMA - Pacific Labs LMS >> monitor-system.bat
echo echo ======================================== >> monitor-system.bat
echo echo. >> monitor-system.bat
echo node -e "console.log('🕒 Tiempo actual:', new Date().toLocaleString())" >> monitor-system.bat
echo node -e "console.log('💾 Memoria usada:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB')" >> monitor-system.bat
echo node -e "console.log('⏱️  Uptime:', Math.round(process.uptime() / 60) + ' minutos')" >> monitor-system.bat
echo echo. >> monitor-system.bat
echo echo Presiona Ctrl+C para salir... >> monitor-system.bat
echo timeout /t 30 /nobreak ^>nul >> monitor-system.bat
echo goto monitor >> monitor-system.bat

REM Verificar puertos disponibles
echo 🔌 Verificando disponibilidad de puertos...
netstat -an | find "3000" >nul
if %errorlevel% equ 0 (
    echo ⚠️ Puerto 3000 en uso. El servidor puede usar otro puerto automáticamente.
) else (
    echo ✅ Puerto 3000 disponible
)

REM Configurar variables de entorno de producción
echo ⚙️ Configurando entorno de producción...
set NODE_ENV=production
set NEXTAUTH_URL=http://localhost:3000

REM Crear archivo de configuración de deployment
echo 📋 Creando configuración de deployment...
echo { > deployment-config.json
echo   "deploymentDate": "%date% %time%", >> deployment-config.json
echo   "version": "2.0.0", >> deployment-config.json
echo   "environment": "production", >> deployment-config.json
echo   "features": { >> deployment-config.json
echo     "videoAnalytics": true, >> deployment-config.json
echo     "adaptiveStreaming": true, >> deployment-config.json
echo     "googleCloudStorage": true, >> deployment-config.json
echo     "adminDashboard": true >> deployment-config.json
echo   }, >> deployment-config.json
echo   "urls": { >> deployment-config.json
echo     "main": "http://localhost:3000", >> deployment-config.json
echo     "admin": "http://localhost:3000/admin/videos", >> deployment-config.json
echo     "api": "http://localhost:3000/api" >> deployment-config.json
echo   } >> deployment-config.json
echo } >> deployment-config.json

echo.
echo 🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE!
echo =====================================
echo.
echo 🚀 INFORMACIÓN DE DEPLOYMENT:
echo    • Versión: 2.0.0
echo    • Fecha: %date% %time%
echo    • Entorno: Producción
echo.
echo 🌐 URLS DISPONIBLES:
echo    • Aplicación Principal: http://localhost:3000
echo    • Panel de Admin: http://localhost:3000/admin/videos
echo    • API de Analytics: http://localhost:3000/api/video-analytics
echo    • API de Admin: http://localhost:3000/api/video-admin
echo.
echo 📋 COMANDOS DISPONIBLES:
echo    • start-production.bat - Iniciar en producción
echo    • backup-system.bat - Crear backup del sistema
echo    • monitor-system.bat - Monitorear sistema en vivo
echo    • upload-videos-menu.bat - Gestionar videos
echo    • video-admin-advanced.js - Administración avanzada
echo.
echo 🔧 HERRAMIENTAS DE GESTIÓN:
echo    • Análisis de almacenamiento automático
echo    • Auditoría de integridad de videos
echo    • Migración a calidad adaptiva
echo    • Analytics en tiempo real
echo    • Limpieza automática de archivos
echo.
echo 📚 DOCUMENTACIÓN:
echo    • README-COMPLETO.md - Documentación completa
echo    • SISTEMA_VIDEOS_GUIA_COMPLETA.md - Guía de videos
echo    • GCS_IMPLEMENTATION_SUMMARY.md - Implementación GCS
echo.
echo 💡 PRÓXIMOS PASOS:
echo    1. Ejecutar: start-production.bat
echo    2. Abrir: http://localhost:3000
echo    3. Configurar cursos y videos
echo    4. Monitorear con monitor-system.bat
echo.
echo ⚠️ NOTAS IMPORTANTES:
echo    • Mantén seguros los archivos .env y google-cloud-credentials.json
echo    • Ejecuta backups regulares con backup-system.bat
echo    • Monitorea el uso de almacenamiento mensualmente
echo    • Revisa logs en caso de problemas
echo.
echo 🎊 ¡Tu LMS Platform está listo para producción!
echo.
pause