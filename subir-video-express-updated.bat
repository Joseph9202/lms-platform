@echo off
title Pacific Labs LMS - Subida Express Actualizada (Drag & Drop)
color 0A

REM ===================================================
REM 🎬 PACIFIC LABS LMS - DRAG & DROP VIDEO UPLOADER
REM Versión Actualizada - Usa cursos existentes de tu LMS
REM ===================================================

echo.
echo  🎬 PACIFIC LABS LMS - SUBIDA EXPRESS ACTUALIZADA
echo  ===============================================
echo  
echo  ✨ NUEVO: Detecta automáticamente tus cursos existentes
echo  🎯 Organiza videos en la estructura de tu LMS real
echo.

REM Verificar si se proporcionó un archivo
if "%~1"=="" (
    echo  ❓ CÓMO USAR:
    echo.
    echo     Opción 1: 📁 Arrastra tu video sobre este archivo
    echo     Opción 2: 💻 Ejecutar desde línea de comandos:
    echo               subir-video-express-updated.bat "C:\ruta\video.mp4"
    echo     Opción 3: 🖱️  Doble click para modo interactivo
    echo.
    
    set /p continuar="¿Quieres seleccionar un archivo manualmente? (s/N): "
    if /i "%continuar%"=="s" goto seleccionar_archivo
    
    echo.
    echo  💡 NUEVO EN ESTA VERSIÓN:
    echo     • Detecta automáticamente cursos de tu LMS
    echo     • Elimina duplicados como "IA Básico" repetidos
    echo     • Organiza en estructura real de tu base de datos
    echo     • Posicionamiento inteligente de capítulos
    echo.
    pause
    exit
)

REM Archivo proporcionado como parámetro
set "archivo_video=%~1"

REM Verificar que el archivo existe
if not exist "%archivo_video%" (
    echo ❌ Error: El archivo no existe
    echo    Ruta: %archivo_video%
    pause
    exit
)

REM Verificar que es un archivo de video
set "extension=%~x1"
set "es_video=NO"

if /i "%extension%"==".mp4" set "es_video=SI"
if /i "%extension%"==".avi" set "es_video=SI"
if /i "%extension%"==".mov" set "es_video=SI"
if /i "%extension%"==".mkv" set "es_video=SI"
if /i "%extension%"==".webm" set "es_video=SI"

if "%es_video%"=="NO" (
    echo ❌ Error: Formato no soportado
    echo    Archivo: %~nx1
    echo    Extensión: %extension%
    echo.
    echo    ✅ Formatos soportados: .mp4, .avi, .mov, .mkv, .webm
    pause
    exit
)

REM Mostrar información del archivo
echo  📁 Archivo seleccionado: %~nx1
echo  📏 Tamaño: %~z1 bytes
echo  📂 Ubicación: %~dp1
echo.

REM Verificar configuración
if not exist ".env" (
    echo ❌ Error: Archivo .env no encontrado
    echo    Configura las variables de Google Cloud primero
    pause
    exit
)

if not exist "google-cloud-credentials.json" (
    echo ❌ Error: Credenciales de Google Cloud no encontradas
    echo    Agrega el archivo google-cloud-credentials.json
    pause
    exit
)

if not exist "upload-express-updated.js" (
    echo ❌ Error: Script actualizado no encontrado
    echo    Ejecuta primero: detect-existing-courses.js
    pause
    exit
)

echo  ✅ Configuración verificada
echo.

echo  🔍 Detectando cursos existentes en tu LMS...
echo.

REM Verificar conexión a base de datos
node -e "const {PrismaClient} = require('@prisma/client'); const db = new PrismaClient(); db.$connect().then(() => {console.log('✅ Conexión a BD exitosa'); db.$disconnect();}).catch(e => {console.log('❌ Error BD:', e.message); process.exit(1);});"

if %errorlevel% neq 0 (
    echo.
    echo ❌ Error de conexión a base de datos
    echo    Verifica que tu LMS esté funcionando
    echo    y que DATABASE_URL esté configurado en .env
    pause
    exit
)

echo  ⚙️  CONFIGURACIÓN AUTOMÁTICA:
echo     🎓 Curso: Se detectará automáticamente el primer curso disponible
echo     📖 Sección: 1 (automática)
echo     📝 Lección: 1 (automática)  
echo     🏷️  Título: %~n1 (nombre del archivo)
echo     📢 Publicar: Automático
echo     🗂️  Organización: Según estructura de tu LMS
echo.

set /p continuar="¿Proceder con la subida automática? (S/n): "
if /i "%continuar%"=="n" (
    echo.
    echo 💡 Para subida personalizada, usa:
    echo    node upload-video-dynamic.js
    echo.
    pause
    exit
)

echo.
echo  🚀 Iniciando subida con detección automática...
echo  =============================================
echo.

REM Ejecutar script actualizado
node upload-express-updated.js "%archivo_video%"

if %errorlevel% equ 0 (
    echo.
    echo  🎉 ¡SUBIDA COMPLETADA EXITOSAMENTE!
    echo  ==================================
    echo.
    echo     ✅ Video subido a Google Cloud Storage
    echo     ✅ Curso detectado automáticamente
    echo     ✅ Capítulo creado en posición correcta
    echo     ✅ Base de datos actualizada
    echo     ✅ Video disponible en el LMS
    echo.
    echo     🌐 Accede a tu LMS en: http://localhost:3000
    echo.
    
    set /p abrir="¿Abrir el LMS en el navegador? (S/n): "
    if /i not "%abrir%"=="n" (
        start http://localhost:3000
    )
    
    echo.
    echo  📋 PRÓXIMOS VIDEOS:
    echo     • Usa este mismo método (arrastra y suelta)
    echo     • Los videos se organizarán automáticamente
    echo     • No necesitas configurar nada más
    echo.
) else (
    echo.
    echo  ❌ Error en la subida
    echo  ====================
    echo.
    echo     Posibles causas:
    echo     • No hay cursos en tu LMS
    echo     • Error de conexión a Google Cloud
    echo     • Problema con la base de datos
    echo.
    echo     💡 Soluciones:
    echo     1. Crear al menos un curso en tu LMS
    echo     2. Ejecutar: detect-existing-courses.js
    echo     3. Verificar configuración con: test-upload-ready.js
    echo.
)

echo.
pause
exit

:seleccionar_archivo
echo.
echo  📂 SELECCIÓN MANUAL DE ARCHIVO
echo  ==============================
echo.
echo  Por favor, proporciona la ruta completa de tu video:
echo  (Ejemplo: C:\Videos\mi-video.mp4)
echo.

set /p ruta_manual="📁 Ruta del archivo: "

if "%ruta_manual%"=="" (
    echo ❌ No se proporcionó ninguna ruta
    pause
    exit
)

REM Quitar comillas si las hay
set ruta_manual=%ruta_manual:"=%

if not exist "%ruta_manual%" (
    echo ❌ Error: El archivo no existe en la ruta especificada
    pause
    exit
)

REM Ejecutar con la ruta manual
call "%~f0" "%ruta_manual%"
exit