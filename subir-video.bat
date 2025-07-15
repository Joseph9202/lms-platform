@echo off
title Pacific Labs LMS - Subida Simple de Videos
color 0B

:inicio
cls
echo.
echo  🎬 PACIFIC LABS LMS - SUBIDA SIMPLE DE VIDEOS
echo  =============================================
echo.
echo  Este script te permite subir videos de tu PC directamente 
echo  a Google Cloud Storage con la estructura de cursos organizada.
echo.
echo  📁 Estructura generada:
echo     cursos/[curso]/seccion-[num]/leccion-[num]/video.mp4
echo.
echo  ⚙️  Asegurate de tener configurado:
echo     • .env con variables de Google Cloud
echo     • google-cloud-credentials.json
echo     • Base de datos funcionando
echo.

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js no está instalado
    echo    Por favor instala Node.js desde https://nodejs.org/
    pause
    goto inicio
)

REM Verificar archivo .env
if not exist ".env" (
    echo ❌ Error: Archivo .env no encontrado
    echo    Por favor configura las variables de entorno
    pause
    goto inicio
)

REM Verificar credenciales
if not exist "google-cloud-credentials.json" (
    echo ❌ Error: Credenciales de Google Cloud no encontradas
    echo    Por favor agrega el archivo google-cloud-credentials.json
    pause
    goto inicio
)

echo ✅ Configuración verificada
echo.

REM Mostrar opciones
echo  📋 OPCIONES DISPONIBLES:
echo.
echo     1. 📤 Subir un video nuevo
echo     2. 📂 Ver estructura de cursos
echo     3. 🔧 Verificar configuración
echo     4. 📚 Ver videos subidos
echo     5. ❓ Ayuda
echo     0. 🚪 Salir
echo.

set /p opcion="Selecciona una opción (0-5): "

if "%opcion%"=="1" goto subir_video
if "%opcion%"=="2" goto ver_estructura
if "%opcion%"=="3" goto verificar_config
if "%opcion%"=="4" goto ver_videos
if "%opcion%"=="5" goto ayuda
if "%opcion%"=="0" goto salir

echo ❌ Opción no válida
pause
goto inicio

:subir_video
cls
echo.
echo  📤 SUBIR VIDEO NUEVO
echo  ===================
echo.
echo  El script te guiará paso a paso para subir tu video.
echo  Prepara la siguiente información:
echo.
echo     • 📁 Ruta completa del video en tu PC
echo     • 🎓 Curso al que pertenece
echo     • 📖 Número de sección (1, 2, 3...)
echo     • 📝 Número de lección (1, 2, 3...)
echo     • 🎬 Título del video
echo.
pause
echo.
echo  🚀 Iniciando proceso de subida...
echo.

node upload-video-simple.js

echo.
echo  ✅ Proceso completado
pause
goto inicio

:ver_estructura
cls
echo.
echo  📂 ESTRUCTURA DE CURSOS
echo  ======================
echo.
echo  Estructura automática que se crea:
echo.
echo  📦 Google Cloud Storage Bucket
echo  └── 📁 cursos/
echo      ├── 📁 ia-basico/
echo      │   ├── 📁 seccion-1/
echo      │   │   ├── 📁 leccion-1/
echo      │   │   │   └── 🎬 video.mp4
echo      │   │   └── 📁 leccion-2/
echo      │   └── 📁 seccion-2/
echo      ├── 📁 ia-intermedio/
echo      └── 📁 ia-avanzado/
echo.
echo  📚 Cursos disponibles:
echo     • ia-basico      → IA Básico - Certificación Profesional
echo     • ia-intermedio  → IA Intermedio - Certificación Profesional  
echo     • ia-avanzado    → IA Avanzado - Certificación Profesional
echo     • ml-fundamentals → Machine Learning Fundamentals
echo     • deep-learning  → Deep Learning Especialización
echo.
pause
goto inicio

:verificar_config
cls
echo.
echo  🔧 VERIFICACIÓN DE CONFIGURACIÓN
echo  ================================
echo.

echo  📋 Verificando archivos necesarios...
echo.

if exist ".env" (
    echo  ✅ .env encontrado
) else (
    echo  ❌ .env NO encontrado
)

if exist "google-cloud-credentials.json" (
    echo  ✅ google-cloud-credentials.json encontrado
) else (
    echo  ❌ google-cloud-credentials.json NO encontrado
)

if exist "upload-video-simple.js" (
    echo  ✅ Script de subida encontrado
) else (
    echo  ❌ Script de subida NO encontrado
)

echo.
echo  📋 Verificando conectividad...
echo.

node -e "console.log('✅ Node.js funcionando')"

echo.
echo  💡 Si hay errores, revisa:
echo     • Variables en .env correctas
echo     • Credenciales de Google Cloud válidas
echo     • Conexión a internet activa
echo     • Permisos del bucket de Google Cloud
echo.
pause
goto inicio

:ver_videos
cls
echo.
echo  📚 VIDEOS SUBIDOS
echo  ================
echo.
echo  Para ver los videos subidos, puedes:
echo.
echo     1. 🌐 Abrir tu LMS en: http://localhost:3000
echo     2. ☁️  Ver en Google Cloud Storage Console
echo     3. 🗄️  Consultar la base de datos
echo.
echo  💡 Los videos se organizan automáticamente en:
echo     • Cursos → Secciones → Lecciones
echo.
pause
goto inicio

:ayuda
cls
echo.
echo  ❓ AYUDA Y GUÍA DE USO
echo  =====================
echo.
echo  📖 CÓMO USAR ESTE SCRIPT:
echo.
echo  1. 📤 SUBIR UN VIDEO:
echo     • Selecciona opción 1
echo     • Proporciona la ruta completa del video
echo     • Selecciona curso, sección y lección
echo     • Agrega título y descripción
echo     • Confirma la subida
echo.
echo  2. 📁 FORMATOS SOPORTADOS:
echo     • .mp4 (recomendado)
echo     • .avi
echo     • .mov
echo     • .mkv
echo     • .webm
echo.
echo  3. 🎯 ESTRUCTURA AUTOMÁTICA:
echo     • Se crea automáticamente en Google Cloud
echo     • Se actualiza la base de datos
echo     • Se hace público el video
echo.
echo  4. ⚠️ REQUISITOS:
echo     • Archivo .env configurado
echo     • Credenciales de Google Cloud
echo     • Conexión a internet
echo     • Base de datos activa
echo.
echo  📞 SOPORTE:
echo     • README-COMPLETO.md - Documentación completa
echo     • SISTEMA_VIDEOS_GUIA_COMPLETA.md - Guía detallada
echo.
pause
goto inicio

:salir
cls
echo.
echo  👋 ¡Gracias por usar Pacific Labs LMS!
echo.
echo  📚 Tus videos están seguros en Google Cloud Storage
echo  🌐 Accede a tu LMS en: http://localhost:3000
echo.
echo  💡 Para más funciones avanzadas, ejecuta:
echo     video-admin-advanced.js
echo.
pause
exit

REM Manejo de errores
:error
echo.
echo ❌ Ha ocurrido un error. Revisa:
echo    • Configuración de .env
echo    • Credenciales de Google Cloud  
echo    • Conexión a internet
echo    • Permisos de archivos
echo.
pause
goto inicio