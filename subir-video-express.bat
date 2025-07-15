@echo off
title Pacific Labs LMS - Subida Express (Drag & Drop)
color 0A

REM ===================================================
REM 🎬 PACIFIC LABS LMS - DRAG & DROP VIDEO UPLOADER
REM ===================================================
REM 
REM INSTRUCCIONES:
REM 1. Arrastra tu video sobre este archivo .bat
REM 2. El script subirá automáticamente el video
REM 3. Se organizará en la estructura de cursos
REM
REM ===================================================

echo.
echo  🎬 PACIFIC LABS LMS - SUBIDA EXPRESS
echo  ===================================
echo.

REM Verificar si se proporcionó un archivo
if "%~1"=="" (
    echo  ❓ CÓMO USAR:
    echo.
    echo     Opción 1: 📁 Arrastra tu video sobre este archivo
    echo     Opción 2: 💻 Ejecutar desde línea de comandos:
    echo               subir-video-express.bat "C:\ruta\a\tu\video.mp4"
    echo     Opción 3: 🖱️  Doble click para modo interactivo
    echo.
    
    set /p continuar="¿Quieres seleccionar un archivo manualmente? (s/N): "
    if /i "%continuar%"=="s" goto seleccionar_archivo
    
    echo.
    echo  💡 Para subir un video rápidamente:
    echo     1. Busca tu video en el explorador
    echo     2. Arrástralo sobre este archivo .bat
    echo     3. ¡Listo! Se subirá automáticamente
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

if not exist "upload-express.js" (
    echo ❌ Error: Script de subida no encontrado
    echo    Asegúrate de tener upload-express.js
    pause
    exit
)

echo  ✅ Configuración verificada
echo.

REM Mostrar configuración rápida actual
echo  ⚙️  CONFIGURACIÓN RÁPIDA:
echo     🎓 Curso: IA Básico (ia-basico)
echo     📖 Sección: 1
echo     📝 Lección: 1
echo     🏷️  Título: Automático (nombre del archivo)
echo     📢 Publicar: Automático
echo.

set /p continuar="¿Proceder con la subida? (S/n): "
if /i "%continuar%"=="n" (
    echo ❌ Subida cancelada
    pause
    exit
)

echo.
echo  🚀 Iniciando subida express...
echo  ===============================
echo.

REM Ejecutar script de subida
node upload-express.js "%archivo_video%"

if %errorlevel% equ 0 (
    echo.
    echo  🎉 ¡SUBIDA COMPLETADA EXITOSAMENTE!
    echo  ==================================
    echo.
    echo     ✅ Video subido a Google Cloud Storage
    echo     ✅ Base de datos actualizada
    echo     ✅ Video disponible en el LMS
    echo.
    echo     🌐 Accede a tu LMS en: http://localhost:3000
    echo.
    
    set /p abrir="¿Abrir el LMS en el navegador? (S/n): "
    if /i not "%abrir%"=="n" (
        start http://localhost:3000
    )
) else (
    echo.
    echo  ❌ Error en la subida
    echo  ====================
    echo.
    echo     Revisa:
    echo     • Conexión a internet
    echo     • Configuración de Google Cloud
    echo     • Permisos del bucket
    echo     • Variables en .env
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