@echo off
title Pacific Labs LMS - Centro de Videos Actualizado
color 0B

:inicio
cls
echo.
echo   🎬 PACIFIC LABS LMS - CENTRO DE VIDEOS ACTUALIZADO
echo   ================================================
echo.
echo   ✨ NUEVO: Sistema integrado con tus cursos existentes
echo   🎯 Detecta automáticamente la estructura de tu LMS
echo   🗑️ Limpieza automática de duplicados
echo.
echo   📋 OPCIONES DISPONIBLES:
echo.
echo      1. 🚀 Subir video (Drag ^& Drop Automático)
echo      2. 📤 Subir video (Selección de curso)  
echo      3. 🔍 Detectar cursos existentes
echo      4. 🗑️ Limpiar cursos duplicados
echo      5. 🧪 Verificar sistema completo
echo      6. 📂 Ver estructura actualizada
echo      7. 🌐 Abrir LMS en navegador
echo      8. 📚 Guía de uso actualizada
echo      9. ❓ Ayuda y soporte
echo      0. 🚪 Salir
echo.

set /p opcion="Selecciona una opción (0-9): "

if "%opcion%"=="1" goto drag_drop_auto
if "%opcion%"=="2" goto seleccion_curso
if "%opcion%"=="3" goto detectar_cursos
if "%opcion%"=="4" goto limpiar_duplicados
if "%opcion%"=="5" goto verificar_completo
if "%opcion%"=="6" goto estructura_actualizada
if "%opcion%"=="7" goto abrir_lms
if "%opcion%"=="8" goto guia_actualizada
if "%opcion%"=="9" goto ayuda
if "%opcion%"=="0" goto salir

echo ❌ Opción no válida
timeout /t 2 >nul
goto inicio

:drag_drop_auto
cls
echo.
echo   🚀 SUBIDA AUTOMÁTICA (DRAG ^& DROP)
echo   ==================================
echo.
echo   ✨ NUEVO: Detección automática de cursos
echo.
echo   📁 PASO 1: Encuentra tu video en el explorador
echo   🎯 PASO 2: Arrastra el video sobre: subir-video-express-updated.bat
echo   ⚡ PASO 3: ¡Se sube automáticamente al curso correcto!
echo.
echo   🎓 CARACTERÍSTICAS AUTOMÁTICAS:
echo      • Detecta cursos existentes en tu LMS
echo      • Elimina duplicados como "IA Básico" repetidos
echo      • Posiciona capítulos en orden correcto
echo      • Organiza en secciones/lecciones inteligentemente
echo.
echo   ⚙️  CONFIGURACIÓN AUTOMÁTICA:
echo      • Curso: Primer curso disponible en tu LMS
echo      • Sección: 1 (incrementa automáticamente)
echo      • Lección: 1 (incrementa automáticamente)
echo      • Título: Nombre del archivo (limpio)
echo.

echo   💡 ¿Es tu primera vez? Ejecuta primero la opción 3
echo      para detectar tus cursos existentes.
echo.
pause
goto inicio

:seleccion_curso
cls
echo.
echo   📤 SUBIDA CON SELECCIÓN DE CURSO
echo   ===============================
echo.
echo   Proceso guiado que te permite elegir específicamente:
echo.

REM Verificar que los archivos necesarios existen
if not exist "upload-video-dynamic.js" (
    echo   ❌ Error: Script dinámico no encontrado
    echo      Ejecuta primero: detect-existing-courses.js
    pause
    goto inicio
)

if not exist ".env" (
    echo   ❌ Error: Configuración no encontrada
    echo      Necesitas configurar el archivo .env primero
    echo.
    echo   💡 Ejecuta la opción 5 para verificar el sistema
    pause
    goto inicio
)

echo   🎓 Este script te permitirá:
echo      • Ver todos tus cursos existentes
echo      • Seleccionar curso específico
echo      • Elegir sección y lección
echo      • Personalizar título y descripción
echo.
pause
echo.
echo   🚀 Iniciando proceso de selección...
echo.

node upload-video-dynamic.js

echo.
echo   ✅ Proceso completado
pause
goto inicio

:detectar_cursos
cls
echo.
echo   🔍 DETECTAR CURSOS EXISTENTES
echo   ============================
echo.
echo   Este proceso analizará tu base de datos y:
echo      • Detectará todos los cursos publicados
echo      • Identificará duplicados (ej: IA Básico repetido)
echo      • Creará estructura automática para videos
echo      • Generará configuración para scripts
echo.

if not exist "detect-existing-courses.js" (
    echo   ❌ Error: Script de detección no encontrado
    pause
    goto inicio
)

echo   🚀 Iniciando detección...
echo.

node detect-existing-courses.js

echo.
echo   ✅ Detección completada
echo.
echo   📄 Revisa los archivos generados:
echo      • cursos-existentes-config.json
echo      • cursos-mapping.json  
echo      • REPORTE-CURSOS-EXISTENTES.md
echo.
pause
goto inicio

:limpiar_duplicados
cls
echo.
echo   🗑️ LIMPIAR CURSOS DUPLICADOS
echo   ============================
echo.
echo   ⚠️  IMPORTANTE: Esta operación modificará tu base de datos
echo.
echo   El sistema:
echo      • Detectará cursos con nombres similares
echo      • Analizará cuál conservar (más contenido/actividad)
echo      • Migrará capítulos y compras del duplicado
echo      • Eliminará el curso duplicado
echo.

echo   🔍 Duplicados comunes detectados:
echo      • "IA Básico" y "IA Básico - Certificación"
echo      • Cursos con nombres muy similares
echo      • Cursos creados accidentalmente
echo.

set /p continuar="¿Proceder con la detección de duplicados? (s/N): "
if /i not "%continuar%"=="s" (
    echo   ⏭️ Operación cancelada
    pause
    goto inicio
)

echo.
echo   🚀 Iniciando limpieza de duplicados...
echo.

if not exist "cleanup-duplicate-courses.js" (
    echo   ❌ Error: Script de limpieza no encontrado
    pause
    goto inicio
)

node cleanup-duplicate-courses.js

echo.
echo   ✅ Limpieza completada
echo.
echo   💡 Después de limpiar duplicados, ejecuta la opción 3
echo      para regenerar la configuración de cursos.
echo.
pause
goto inicio

:verificar_completo
cls
echo.
echo   🧪 VERIFICACIÓN COMPLETA DEL SISTEMA
echo   ==================================
echo.
echo   Verificando todos los componentes:
echo.

if exist "test-upload-ready.js" (
    echo   🔧 Ejecutando verificación avanzada...
    echo.
    node test-upload-ready.js
) else (
    echo   📋 Verificación básica manual:
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
    
    if exist "upload-express-updated.js" (
        echo      ✅ Script de subida automática encontrado
    ) else (
        echo      ❌ Script de subida automática NO encontrado
    )
    
    if exist "upload-video-dynamic.js" (
        echo      ✅ Script de subida dinámica encontrado
    ) else (
        echo      ❌ Script de subida dinámica NO encontrado
    )
    
    if exist "detect-existing-courses.js" (
        echo      ✅ Detector de cursos encontrado
    ) else (
        echo      ❌ Detector de cursos NO encontrado
    )
    
    echo.
    echo   💡 Si hay archivos faltantes, ejecuta:
    echo      setup-complete-advanced.bat
)

echo.
echo   🔍 Verificando conexión a base de datos...
node -e "const {PrismaClient} = require('@prisma/client'); const db = new PrismaClient(); db.$connect().then(() => {console.log('✅ Base de datos conectada'); return db.course.count();}).then(count => {console.log('📚 Cursos encontrados:', count); db.$disconnect();}).catch(e => {console.log('❌ Error BD:', e.message)});"

echo.
pause
goto inicio

:estructura_actualizada
cls
echo.
echo   📂 ESTRUCTURA ACTUALIZADA DE CURSOS
echo   ==================================
echo.
echo   🎯 NUEVA ORGANIZACIÓN AUTOMÁTICA:
echo.
echo   📦 Google Cloud Storage Bucket
echo   └── 📁 cursos/
echo       ├── 📁 [curso-detectado-1]/        (Desde tu LMS)
echo       │   ├── 📁 seccion-1/
echo       │   │   ├── 📁 leccion-1/           → 🎬 videos aquí
echo       │   │   ├── 📁 leccion-2/           → 🎬 videos aquí
echo       │   │   └── 📁 leccion-3/           → 🎬 videos aquí
echo       │   ├── 📁 seccion-2/
echo       │   └── 📁 seccion-3/
echo       ├── 📁 [curso-detectado-2]/        (Desde tu LMS)
echo       └── 📁 [curso-detectado-3]/        (Desde tu LMS)
echo.
echo   ✨ CARACTERÍSTICAS NUEVAS:
echo      • Nombres de cursos tomados de tu base de datos real
echo      • Eliminación automática de duplicados
echo      • Posicionamiento inteligente de capítulos
echo      • Organización por secciones/lecciones
echo.

if exist "cursos-mapping.json" (
    echo   📋 CURSOS DETECTADOS EN TU LMS:
    echo.
    node -e "try{const data=require('./cursos-mapping.json'); Object.entries(data.cursosDisponibles||{}).forEach(([key,title],i)=>console.log('   '+(i+1)+'. '+key+' → '+title))}catch(e){console.log('   No se pudo leer la configuración')}"
    echo.
) else (
    echo   ⚠️ No se ha ejecutado la detección de cursos aún.
    echo      Ejecuta la opción 3 para generar la estructura.
)

echo   💡 Para actualizar esta lista, ejecuta la opción 3.
echo.
pause
goto inicio

:abrir_lms
cls
echo.
echo   🌐 ABRIENDO LMS EN NAVEGADOR
echo   ===========================
echo.
echo   Intentando abrir tu LMS actualizado...
echo.

REM Verificar si el servidor está corriendo
echo   🔍 Verificando si el servidor está activo...

for /f %%i in ('powershell -command "try{(Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 5).StatusCode}catch{404}"') do set status=%%i

if "%status%"=="200" (
    echo   ✅ Servidor activo en http://localhost:3000
    echo   🚀 Abriendo en navegador...
    start http://localhost:3000
    echo.
    echo   🎓 Verifica que tus cursos aparezcan correctamente
    echo      con los videos organizados por secciones/lecciones.
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

:guia_actualizada
cls
echo.
echo   📚 GUÍA DE USO ACTUALIZADA
echo   =========================
echo.
echo   🎬 CÓMO USAR EL NUEVO SISTEMA:
echo.
echo   1️⃣ PREPARACIÓN INICIAL (Solo una vez):
echo      • Ejecuta opción 3: Detectar cursos existentes
echo      • Ejecuta opción 4: Limpiar duplicados (si los hay)
echo      • Ejecuta opción 5: Verificar sistema
echo.
echo   2️⃣ SUBIR VIDEOS - MÉTODO AUTOMÁTICO:
echo      • Arrastra video sobre: subir-video-express-updated.bat
echo      • El sistema detecta automáticamente tu primer curso
echo      • Se organiza en secciones/lecciones inteligentemente
echo.
echo   3️⃣ SUBIR VIDEOS - MÉTODO PERSONALIZADO:
echo      • Usa opción 2 de este menú
echo      • Selecciona curso específico de tu LMS
echo      • Elige sección y lección manualmente
echo.
echo   🎯 VENTAJAS DEL NUEVO SISTEMA:
echo      ✅ Usa tus cursos REALES (no ficticios)
echo      ✅ Elimina duplicados automáticamente
echo      ✅ Posicionamiento inteligente de capítulos
echo      ✅ Organización por secciones coherente
echo      ✅ URLs optimizadas en Google Cloud
echo.
echo   📏 LÍMITES Y FORMATOS:
echo      • Formatos: .mp4, .avi, .mov, .mkv, .webm
echo      • Tamaño máximo: 500 MB por video
echo      • Sin límite de duración
echo.
pause
goto inicio

:ayuda
cls
echo.
echo   ❓ AYUDA Y SOPORTE ACTUALIZADO
echo   =============================
echo.
echo   🆘 PROBLEMAS COMUNES Y SOLUCIONES:
echo.
echo   ❌ "No se encontraron cursos publicados"
echo      → Crea al menos un curso en tu LMS
echo      → Asegúrate de que esté marcado como "Publicado"
echo      → Ejecuta opción 3 para detectar cursos
echo.
echo   ❌ "Error: Curso duplicado detectado"  
echo      → Ejecuta opción 4 para limpiar duplicados
echo      → El sistema conservará el curso con más contenido
echo      → Migrará capítulos automáticamente
echo.
echo   ❌ "Error: Database connection failed"
echo      → Verifica DATABASE_URL en .env
echo      → Ejecuta: npx prisma db push
echo      → Inicia tu servidor LMS: npm run dev
echo.
echo   ❌ "Error: Google Cloud bucket"
echo      → Verifica credenciales en Google Cloud Console
echo      → Confirma que el bucket existe
echo      → Revisa permisos del Service Account
echo.
echo   🔧 HERRAMIENTAS DE DIAGNÓSTICO:
echo      • Opción 5: Verificación completa del sistema
echo      • detect-existing-courses.js: Detectar cursos
echo      • cleanup-duplicate-courses.js: Limpiar duplicados
echo      • test-upload-ready.js: Verificación detallada
echo.
echo   📚 DOCUMENTACIÓN ACTUALIZADA:
echo      • GUIA-INTEGRACION-CURSOS.md - Nueva guía
echo      • REPORTE-CURSOS-EXISTENTES.md - Estado actual
echo      • README-COMPLETO.md - Documentación completa
echo.
pause
goto inicio

:salir
cls
echo.
echo   👋 ¡GRACIAS POR USAR PACIFIC LABS LMS ACTUALIZADO!
echo   =================================================
echo.
echo   ✨ NUEVO SISTEMA INTEGRADO:
echo      • Cursos reales de tu LMS
echo      • Sin duplicados molestos
echo      • Organización inteligente
echo      • Posicionamiento automático
echo.
echo   🎬 Tu sistema de videos está listo para:
echo      • Gestionar cursos existentes automáticamente
echo      • Subir contenido con estructura real
echo      • Eliminar duplicados que confunden
echo      • Organizar miles de estudiantes
echo.
echo   💡 RECORDATORIOS:
echo      • Ejecuta detección de cursos periódicamente
echo      • Limpia duplicados cuando aparezcan
echo      • Verifica la estructura en tu LMS
echo      • Haz backups regulares
echo.
echo   🌐 Tu LMS estará en: http://localhost:3000
echo.
echo   📚 Para más información consulta:
echo      GUIA-INTEGRACION-CURSOS.md
echo.
pause
exit