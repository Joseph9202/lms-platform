@echo off
cls
echo ===============================================
echo         GESTOR DE VIDEOS - LMS PLATFORM
echo              SUBIDA AUTOMÁTICA
echo ===============================================
echo.

cd "C:\Users\josep\Desktop\IA Pacific Labs\lms-platform"

if "%1"=="" goto MENU
if "%1"=="--help" goto HELP
if "%1"=="-h" goto HELP

REM Si se pasan argumentos, ejecutar directamente
node upload-video.js %1 %2 %3 %4
goto END

:MENU
echo 🎬 OPCIONES DE SUBIDA DE VIDEOS:
echo.
echo 1. Subir video individual
echo 2. Subir múltiples videos  
echo 3. Ver estructura de cursos
echo 4. Listar videos existentes
echo 5. Crear carpetas organizadas
echo 6. Ayuda y ejemplos
echo 0. Salir
echo.
set /p option="Selecciona una opción (0-6): "

if "%option%"=="1" goto SINGLE_UPLOAD
if "%option%"=="2" goto BULK_UPLOAD
if "%option%"=="3" goto SHOW_STRUCTURE
if "%option%"=="4" goto LIST_VIDEOS
if "%option%"=="5" goto CREATE_FOLDERS
if "%option%"=="6" goto HELP
if "%option%"=="0" goto EXIT
goto INVALID

:SINGLE_UPLOAD
cls
echo ===============================================
echo            SUBIDA INDIVIDUAL
echo ===============================================
echo.
echo 📁 Arrastra tu archivo de video aquí y presiona Enter:
set /p video_path="Ruta del video: "

if "%video_path%"=="" (
    echo ❌ No se proporcionó ruta del video
    pause
    goto MENU
)

REM Remover comillas si las hay
set video_path=%video_path:"=%

echo.
echo 📚 CURSOS DISPONIBLES:
echo   ia-basico     (IA Básico - Certificación Profesional)
echo   ia-intermedio (IA Intermedio - Certificación Profesional)
echo.
set /p course="Curso: "

echo.
echo 📖 LECCIONES DISPONIBLES PARA %course%:
if "%course%"=="ia-basico" (
    echo   leccion-1 (Fundamentos de la Inteligencia Artificial)
    echo   leccion-2 (Tipos de Machine Learning)
)
if "%course%"=="ia-intermedio" (
    echo   leccion-1 (Deep Learning Avanzado)
)
echo.
set /p lesson="Lección: "

echo.
echo 🎯 SECCIONES DISPONIBLES:
if "%course%"=="ia-basico" if "%lesson%"=="leccion-1" (
    echo   video-principal (🎥 Video: Fundamentos de IA)
    echo   caso-tesla      (📖 Estudio de Caso: Tesla)
    echo   laboratorio     (🧪 Laboratorio: Google Cloud)
    echo   quiz            (📝 Quiz: Conceptos Fundamentales)
)
if "%course%"=="ia-basico" if "%lesson%"=="leccion-2" (
    echo   video-principal (🎥 Video: Tipos de ML)
    echo   caso-netflix    (📖 Estudio de Caso: Netflix)
)
if "%course%"=="ia-intermedio" if "%lesson%"=="leccion-1" (
    echo   video-principal (🎥 Video: Deep Learning Avanzado)
)
echo.
set /p section="Sección: "

echo.
echo 🚀 Subiendo video...
echo 📁 Archivo: %video_path%
echo 🎯 Destino: %course%/%lesson%/%section%
echo.

node upload-video.js "%video_path%" %course% %lesson% %section%

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ ¡Video subido exitosamente!
) else (
    echo.
    echo ❌ Error subiendo video
)

echo.
pause
goto MENU

:BULK_UPLOAD
cls
echo ===============================================
echo            SUBIDA MÚLTIPLE
echo ===============================================
echo.
echo 📁 Especifica la carpeta con videos:
set /p folder_path="Ruta de la carpeta: "

if "%folder_path%"=="" (
    echo ❌ No se proporcionó ruta de carpeta
    pause
    goto MENU
)

echo.
echo 🔄 Ejecutando subida múltiple...
node upload-multiple-videos.js "%folder_path%"

pause
goto MENU

:SHOW_STRUCTURE
cls
echo ===============================================
echo          ESTRUCTURA DE CURSOS
echo ===============================================
echo.
node upload-video.js --list
echo.
pause
goto MENU

:LIST_VIDEOS
cls
echo ===============================================
echo           VIDEOS EXISTENTES
echo ===============================================
echo.
node list-videos.js
echo.
pause
goto MENU

:CREATE_FOLDERS
cls
echo ===============================================
echo         CREAR CARPETAS ORGANIZADAS
echo ===============================================
echo.
echo 📁 Creando estructura de carpetas para organizar videos...
node create-video-folders.js
echo.
pause
goto MENU

:HELP
cls
echo ===============================================
echo              AYUDA Y EJEMPLOS
echo ===============================================
echo.
echo 📝 USO DESDE LÍNEA DE COMANDOS:
echo    upload-videos.bat "C:\Videos\mi-video.mp4" ia-basico leccion-1 video-principal
echo.
echo 📁 ESTRUCTURA RECOMENDADA DE ARCHIVOS:
echo    Videos/
echo    ├── IA-Basico/
echo    │   ├── Leccion-1/
echo    │   │   ├── video-principal.mp4
echo    │   │   ├── caso-tesla.mp4
echo    │   │   └── laboratorio.mp4
echo    │   └── Leccion-2/
echo    │       └── video-principal.mp4
echo    └── IA-Intermedio/
echo        └── Leccion-1/
echo            └── video-principal.mp4
echo.
echo 🎯 FORMATOS SOPORTADOS:
echo    • MP4 (recomendado)
echo    • WebM
echo    • MOV  
echo    • AVI
echo    • MKV
echo.
echo 📊 LÍMITES:
echo    • Tamaño máximo: 500MB por video
echo    • Resolución: Hasta 4K
echo    • Duración: Sin límite
echo.
echo 💡 CONSEJOS:
echo    • Usa nombres descriptivos para tus videos
echo    • Organiza los archivos en carpetas antes de subir
echo    • Verifica que la conexión a internet sea estable
echo    • Mantén backup de tus videos originales
echo.
pause
goto MENU

:INVALID
echo ❌ Opción inválida. Selecciona 0-6.
echo.
pause
goto MENU

:EXIT
echo.
echo 👋 ¡Gracias por usar el Gestor de Videos!
echo.
exit /b 0

:END
echo.
echo ✅ Operación completada.
pause