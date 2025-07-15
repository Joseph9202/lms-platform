@echo off
title Pacific Labs LMS - Centro de Videos
color 0B

:inicio
cls
echo.
echo   🎬 PACIFIC LABS LMS - CENTRO DE VIDEOS
echo   ====================================
echo.
echo   Tu sistema completo para gestionar videos educativos
echo   con Google Cloud Storage y organización automática.
echo.
echo   📋 OPCIONES DISPONIBLES:
echo.
echo      1. 🚀 Subir video (Drag ^& Drop)
echo      2. 📤 Subir video (Paso a paso)  
echo      3. 🔍 Verificar sistema
echo      4. 📂 Ver estructura de cursos
echo      5. 🌐 Abrir LMS en navegador
echo      6. 📚 Ver guía de uso
echo      7. ❓ Ayuda y soporte
echo      0. 🚪 Salir
echo.

set /p opcion="Selecciona una opción (0-7): "

if "%opcion%"=="1" goto drag_drop
if "%opcion%"=="2" goto paso_a_paso  
if "%opcion%"=="3" goto verificar
if "%opcion%"=="4" goto estructura
if "%opcion%"=="5" goto abrir_lms
if "%opcion%"=="6" goto guia
if "%opcion%"=="7" goto ayuda
if "%opcion%"=="0" goto salir

echo ❌ Opción no válida
timeout /t 2 >nul
goto inicio

:drag_drop
cls
echo.
echo   🚀 SUBIDA RÁPIDA (DRAG ^& DROP)
echo   ==============================
echo.
echo   La forma MÁS FÁCIL de subir videos:
echo.
echo   📁 PASO 1: Encuentra tu video en el explorador
echo   🎯 PASO 2: Arrastra el video sobre: subir-video-express.bat
echo   ⚡ PASO 3: ¡Se sube automáticamente!
echo.
echo   ✨ CARACTERÍSTICAS:
echo      • Subida automática a Google Cloud
echo      • Organización en cursos/secciones/lecciones
echo      • Actualización automática de la base de datos
echo      • Título automático desde nombre del archivo
echo.
echo   🎓 CONFIGURACIÓN ACTUAL:
echo      • Curso por defecto: IA Básico
echo      • Sección por defecto: 1
echo      • Lección por defecto: 1
echo.

echo   📝 ¿Quieres cambiar la configuración por defecto?
set /p cambiar="   (s/N): "

if /i "%cambiar%"=="s" (
    echo.
    echo   ⚙️ Para cambiar la configuración:
    echo      1. Abre upload-express.js en un editor
    echo      2. Busca CONFIG_RAPIDA
    echo      3. Modifica curso, seccion, leccion
    echo      4. Guarda el archivo
    echo.
    pause
)

echo.
echo   💡 CONSEJO: Si es tu primer video, ejecuta primero
echo      la opción 3 (Verificar sistema) para asegurarte
echo      de que todo está configurado correctamente.
echo.
pause
goto inicio

:paso_a_paso
cls
echo.
echo   📤 SUBIDA PASO A PASO
echo   ====================
echo.
echo   Proceso guiado para subir videos con más control:
echo.

REM Verificar que los archivos necesarios existen
if not exist "upload-video-simple.js" (
    echo   ❌ Error: Script no encontrado
    echo      Asegúrate de tener upload-video-simple.js
    pause
    goto inicio
)

if not exist ".env" (
    echo   ❌ Error: Configuración no encontrada
    echo      Necesitas configurar el archivo .env primero
    echo.
    echo   💡 Ejecuta la opción 3 para verificar el sistema
    pause
    goto inicio
)

echo   🚀 Iniciando proceso guiado...
echo.
pause

REM Ejecutar script interactivo
node upload-video-simple.js

echo.
echo   ✅ Proceso completado
pause
goto inicio

:verificar
cls
echo.
echo   🔍 VERIFICACIÓN DEL SISTEMA
echo   ==========================
echo.
echo   Comprobando que todo está configurado correctamente...
echo.

if not exist "test-upload-ready.js" (
    echo   ⚠️ Script de verificación no encontrado
    echo      Creando verificación básica...
    echo.
    
    REM Verificación básica manual
    echo   📋 Verificación Manual:
    echo.
    
    if exist ".env" (
        echo      ✅ Archivo .env encontrado
    ) else (
        echo      ❌ Archivo .env NO encontrado
    )
    
    if exist "google-cloud-credentials.json" (
        echo      ✅ Credenciales de Google Cloud encontradas
    ) else (
        echo      ❌ Credenciales de Google Cloud NO encontradas
    )
    
    if exist "upload-express.js" (
        echo      ✅ Script de subida express encontrado
    ) else (
        echo      ❌ Script de subida express NO encontrado
    )
    
    echo.
    echo   💡 Si hay archivos faltantes, ejecuta:
    echo      setup-complete-advanced.bat
    
) else (
    echo   🧪 Ejecutando verificación completa...
    echo.
    node test-upload-ready.js
)

echo.
pause
goto inicio

:estructura
cls
echo.
echo   📂 ESTRUCTURA DE CURSOS
echo   ======================
echo.
echo   Organización automática de videos:
echo.
echo   📦 Google Cloud Storage Bucket
echo   └── 📁 cursos/
echo       ├── 📁 ia-basico/               (IA Básico)
echo       │   ├── 📁 seccion-1/
echo       │   │   ├── 📁 leccion-1/       → 🎬 videos aquí
echo       │   │   ├── 📁 leccion-2/       → 🎬 videos aquí
echo       │   │   └── 📁 leccion-3/       → 🎬 videos aquí
echo       │   ├── 📁 seccion-2/
echo       │   └── 📁 seccion-3/
echo       ├── 📁 ia-intermedio/           (IA Intermedio)
echo       ├── 📁 ia-avanzado/             (IA Avanzado)
echo       ├── 📁 ml-fundamentals/         (ML Fundamentals)
echo       └── 📁 deep-learning/           (Deep Learning)
echo.
echo   🎓 CURSOS DISPONIBLES:
echo      • ia-basico      → IA Básico - Certificación Profesional
echo      • ia-intermedio  → IA Intermedio - Certificación Profesional
echo      • ia-avanzado    → IA Avanzado - Certificación Profesional
echo      • ml-fundamentals → Machine Learning Fundamentals  
echo      • deep-learning  → Deep Learning Especialización
echo.
echo   📝 EJEMPLO DE URL GENERADA:
echo      https://storage.googleapis.com/tu-bucket/
echo      cursos/ia-basico/seccion-1/leccion-1/introduccion-ia.mp4
echo.
pause
goto inicio

:abrir_lms
cls
echo.
echo   🌐 ABRIENDO LMS EN NAVEGADOR
echo   ===========================
echo.
echo   Intentando abrir tu LMS...
echo.

REM Verificar si el servidor está corriendo
echo   🔍 Verificando si el servidor está activo...

REM Intentar hacer ping a localhost:3000
for /f %%i in ('powershell -command "try{(Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5).StatusCode}catch{404}"') do set status=%%i

if "%status%"=="200" (
    echo   ✅ Servidor activo en http://localhost:3000
    echo   🚀 Abriendo en navegador...
    start http://localhost:3000
) else (
    echo   ⚠️ Servidor no detectado en puerto 3000
    echo.
    echo   💡 Para iniciar tu LMS:
    echo      1. Abre una terminal
    echo      2. Ejecuta: npm run dev
    echo      3. Espera a que inicie
    echo      4. Abre: http://localhost:3000
    echo.
    set /p iniciar="¿Quieres intentar iniciarlo ahora? (s/N): "
    
    if /i "%iniciar%"=="s" (
        echo.
        echo   🚀 Iniciando servidor LMS...
        echo   (Esto puede tomar unos momentos)
        echo.
        start cmd /k "npm run dev"
        
        echo   ⏳ Esperando que el servidor inicie...
        timeout /t 10 >nul
        
        echo   🌐 Intentando abrir navegador...
        start http://localhost:3000
    )
)

echo.
pause
goto inicio

:guia
cls
echo.
echo   📚 GUÍA DE USO RÁPIDA
echo   ====================
echo.
echo   🎬 CÓMO SUBIR TU PRIMER VIDEO:
echo.
echo   1️⃣ PREPARACIÓN:
echo      • Asegúrate de que tu video esté en formato .mp4
echo      • Verifica que el sistema esté configurado (opción 3)
echo.
echo   2️⃣ SUBIDA RÁPIDA:
echo      • Arrastra tu video sobre: subir-video-express.bat
echo      • O usa la opción 1 de este menú
echo.
echo   3️⃣ SUBIDA PERSONALIZADA:
echo      • Usa la opción 2 para elegir curso/sección/lección
echo      • Agrega título y descripción personalizados
echo.
echo   4️⃣ VERIFICACIÓN:
echo      • Abre tu LMS (opción 5)
echo      • Ve a cursos y verifica que aparece tu video
echo.
echo   🎯 FORMATOS SOPORTADOS:
echo      ✅ .mp4 (recomendado)     ✅ .webm
echo      ✅ .avi                   ✅ .mov
echo      ✅ .mkv
echo.
echo   📏 LÍMITES:
echo      • Tamaño máximo: 500 MB por video
echo      • Sin límite de duración
echo.
echo   💰 COSTOS:
echo      • Google Cloud Storage: ~$0.02/GB/mes
echo      • Ejemplo: 20 videos = ~$1/mes
echo.
pause
goto inicio

:ayuda
cls
echo.
echo   ❓ AYUDA Y SOPORTE
echo   =================
echo.
echo   🆘 PROBLEMAS COMUNES:
echo.
echo   ❌ "Error: Google Cloud credentials not found"
echo      → Agrega google-cloud-credentials.json
echo      → Descarga desde Google Cloud Console
echo.
echo   ❌ "Error: Bucket does not exist"  
echo      → Crea bucket en Google Cloud Console
echo      → Actualiza GOOGLE_CLOUD_BUCKET_NAME en .env
echo.
echo   ❌ "Error: Database connection failed"
echo      → Verifica DATABASE_URL en .env
echo      → Ejecuta: npx prisma db push
echo.
echo   ❌ "Formato no soportado"
echo      → Convierte tu video a .mp4
echo      → Usa Handbrake (gratis) o VLC
echo.
echo   📚 DOCUMENTACIÓN COMPLETA:
echo      • GUIA-SUBIR-VIDEOS.md - Guía específica de videos
echo      • README-COMPLETO.md - Documentación completa
echo      • SISTEMA_VIDEOS_GUIA_COMPLETA.md - Guía técnica
echo.
echo   🔧 HERRAMIENTAS DE DIAGNÓSTICO:
echo      • test-upload-ready.js - Verificación completa
echo      • test-system-advanced.js - Test del sistema
echo.
echo   💬 CONTACTO:
echo      • Email: soporte@pacificlabs.com
echo      • Documentación: README-COMPLETO.md
echo.
pause
goto inicio

:salir
cls
echo.
echo   👋 ¡GRACIAS POR USAR PACIFIC LABS LMS!
echo   ====================================
echo.
echo   🎬 Tu sistema de videos está listo para:
echo      • Subir contenido educativo
echo      • Organizar cursos automáticamente  
echo      • Gestionar miles de estudiantes
echo.
echo   💡 RECORDATORIOS:
echo      • Haz backups regulares de tus videos
echo      • Monitorea el uso de Google Cloud Storage
echo      • Mantén actualizado tu LMS
echo.
echo   🌐 Tu LMS estará en: http://localhost:3000
echo.
echo   📚 Para más información consulta:
echo      GUIA-SUBIR-VIDEOS.md
echo.
pause
exit