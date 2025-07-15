@echo off
cls
echo ===============================================
echo      SISTEMA DE SUBIDA AUTOMATIZADA DE VIDEOS
echo            LMS PLATFORM - IA PACIFIC LABS
echo ===============================================
echo.

cd "C:\Users\josep\Desktop\IA Pacific Labs\lms-platform"

:MENU
echo.
echo Selecciona una opcion:
echo.
echo 1. Ver estructura de videos disponible
echo 2. Subir un video individual
echo 3. Subir todos los videos de Leccion 1
echo 4. Subir videos con archivo de configuracion
echo 5. Crear carpetas de ejemplo para videos
echo 6. Ver guia de uso
echo 7. Salir
echo.
echo ===============================================
set /p option="Ingresa tu opcion (1-7): "

if "%option%"=="1" goto STRUCTURE
if "%option%"=="2" goto SINGLE
if "%option%"=="3" goto BATCH_LECCION1
if "%option%"=="4" goto BATCH_CUSTOM
if "%option%"=="5" goto CREATE_FOLDERS
if "%option%"=="6" goto HELP
if "%option%"=="7" goto EXIT
goto INVALID

:STRUCTURE
cls
echo ===============================================
echo           ESTRUCTURA DE VIDEOS DISPONIBLE
echo ===============================================
echo.
node upload-videos.js structure
echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:SINGLE
cls
echo ===============================================
echo             SUBIR VIDEO INDIVIDUAL
echo ===============================================
echo.
echo Formato: node upload-videos.js single <ruta-video> <curso> <leccion> <video>
echo.
echo EJEMPLOS:
echo   Curso IA Basico, Leccion 1, Video Principal:
echo   node upload-videos.js single "./videos/leccion-1/fundamentos-ia.mp4" ia-basico leccion-1 video-principal
echo.
echo   Curso IA Basico, Leccion 1, Caso Tesla:
echo   node upload-videos.js single "./videos/leccion-1/tesla-caso.mp4" ia-basico leccion-1 tesla-caso
echo.
set /p video_path="Ruta del video (ej: ./videos/leccion-1/fundamentos-ia.mp4): "
set /p course_key="Clave del curso (ej: ia-basico): "
set /p lesson_key="Clave de leccion (ej: leccion-1): "
set /p video_key="Clave del video (ej: video-principal): "

echo.
echo Subiendo video...
node upload-videos.js single "%video_path%" %course_key% %lesson_key% %video_key%

echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:BATCH_LECCION1
cls
echo ===============================================
echo          SUBIR TODOS LOS VIDEOS LECCION 1
echo ===============================================
echo.
echo Este comando subira todos los videos de la Leccion 1 usando el archivo:
echo videos-config-leccion-1.json
echo.
echo Asegurate de que tengas estos archivos en ./videos/leccion-1/:
echo   • fundamentos-ia.mp4
echo   • tesla-caso-estudio.mp4  
echo   • lab-google-cloud.mp4
echo   • quiz-explicacion.mp4
echo.
set /p confirm="¿Continuar con la subida? (s/n): "

if /i "%confirm%"=="s" (
    echo.
    echo Subiendo videos de Leccion 1...
    node upload-videos.js batch videos-config-leccion-1.json
) else (
    echo Operacion cancelada.
)

echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:BATCH_CUSTOM
cls
echo ===============================================
echo       SUBIR VIDEOS CON ARCHIVO CONFIGURACION
echo ===============================================
echo.
echo Ingresa la ruta del archivo JSON de configuracion:
echo (Ejemplo: videos-config-leccion-1.json)
echo.
set /p config_file="Archivo de configuracion: "

if exist "%config_file%" (
    echo.
    echo Subiendo videos usando %config_file%...
    node upload-videos.js batch "%config_file%"
) else (
    echo.
    echo ❌ Archivo no encontrado: %config_file%
)

echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:CREATE_FOLDERS
cls
echo ===============================================
echo            CREAR ESTRUCTURA DE CARPETAS
echo ===============================================
echo.
echo Creando carpetas de ejemplo para organizar videos...

mkdir "videos\leccion-1" 2>nul
mkdir "videos\leccion-2" 2>nul
mkdir "videos\curso-intermedio" 2>nul
mkdir "videos\curso-intermedio\leccion-1" 2>nul

echo.
echo ✅ Carpetas creadas:
echo    • videos\leccion-1\
echo    • videos\leccion-2\  
echo    • videos\curso-intermedio\leccion-1\
echo.
echo 📋 Ahora puedes colocar tus videos MP4 en estas carpetas.
echo 📖 Lee videos\README.md para nombres exactos de archivos.

echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:HELP
cls
echo ===============================================
echo                  GUIA DE USO
echo ===============================================
echo.
echo 🎯 PASOS PARA SUBIR VIDEOS:
echo.
echo 1. PREPARAR VIDEOS:
echo    • Coloca tus videos MP4 en la carpeta ./videos/
echo    • Usa nombres exactos segun videos\README.md
echo    • Formato recomendado: MP4, 1080p, H.264
echo.
echo 2. SUBIR UN VIDEO:
echo    • Opcion 2: Subir video individual
echo    • Especifica ruta, curso, leccion y tipo de video
echo.
echo 3. SUBIR MULTIPLES VIDEOS:
echo    • Opcion 3: Usar configuracion predefinida Leccion 1
echo    • Opcion 4: Usar tu propio archivo de configuracion JSON
echo.
echo 4. VERIFICAR SUBIDA:
echo    • Los videos se organizan automaticamente en Google Cloud
echo    • Se actualiza la base de datos automaticamente
echo    • URLs se asignan a capitulos correspondientes
echo.
echo 📁 ESTRUCTURA EN GOOGLE CLOUD:
echo    gs://bucket/courses/ia-basico/lessons/leccion-1/videos/video-principal/
echo.
echo 🔗 RESULTADO:
echo    • Videos disponibles en tu LMS inmediatamente
echo    • URLs optimizadas para streaming
echo    • Organizacion automatica por curso/leccion/video
echo.
echo ❓ TROUBLESHOOTING:
echo    • Verifica que Google Cloud Storage este configurado
echo    • Confirma que archivo .env tiene credenciales correctas
echo    • Revisa que nombres de archivos sean exactos
echo    • Ejecuta: node test-gcs-final.js para probar conexion
echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:INVALID
cls
echo ===============================================
echo                   ERROR
echo ===============================================
echo.
echo ❌ Opcion invalida. Por favor selecciona 1-7.
echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:EXIT
cls
echo ===============================================
echo                  ADIOS
echo ===============================================
echo.
echo 👋 Gracias por usar el sistema de subida de videos!
echo.
echo 🎬 Tus videos estan organizados automaticamente en:
echo    • Google Cloud Storage (streaming optimizado)
echo    • Base de datos (URLs actualizadas)
echo    • LMS Platform (disponible inmediatamente)
echo.
echo 📈 Beneficios del sistema automatizado:
echo    • Organizacion estructurada por curso/leccion
echo    • URLs optimizadas para reproduccion
echo    • Actualizacion automatica de base de datos
echo    • Costos ultra-bajos (~$0.02/GB/mes)
echo.
echo 🚀 ¡Listo para revolucionar la educacion en IA!
echo.
pause
exit

REM Fin del script