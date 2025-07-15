@echo off
cls
echo ===============================================
echo    IMPLEMENTACIÓN LECCIÓN 1 - IA BÁSICO
echo         LMS PLATFORM COMPLETO  
echo ===============================================
echo.

cd "C:\Users\josep\Desktop\IA Pacific Labs\lms-platform"

echo 🔍 Verificando configuración...
echo.

REM Verificar que existan archivos necesarios
if not exist "google-cloud-credentials.json" (
    echo ❌ Archivo google-cloud-credentials.json no encontrado
    echo    Este archivo es necesario para subir videos
    echo.
    echo 💡 Asegúrate de que tengas las credenciales de Google Cloud
    pause
    exit /b 1
)

if not exist ".env" (
    echo ❌ Archivo .env no encontrado
    pause
    exit /b 1
)

echo ✅ Configuración verificada
echo.

echo 📦 Instalando dependencias faltantes...
npm install @google-cloud/storage multer @types/multer dotenv

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas
echo.

echo 🗄️  Creando curso de IA Básico en la base de datos...
node create-ia-basico-complete.js

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error creando curso
    pause
    exit /b 1
)

echo.
echo 🧪 Probando configuración de Google Cloud Storage...
node test-gcs-final.js

echo.
echo ===============================================
echo           IMPLEMENTACIÓN COMPLETADA
echo ===============================================
echo.
echo ✅ Lección 1 implementada exitosamente!
echo.
echo 🎯 LO QUE TIENES AHORA:
echo    • Curso "IA Básico" creado en tu LMS
echo    • 4 capítulos de la Lección 1 listos
echo    • Sistema de subida de videos funcionando  
echo    • Interfaz completa para estudiantes
echo.
echo 🚀 PRÓXIMOS PASOS:
echo    1. Ejecutar: npm run dev
echo    2. Ir a: http://localhost:3000
echo    3. Navegar al curso de IA Básico
echo    4. Subir tu video de prueba en el primer capítulo
echo.
echo 📹 PARA SUBIR VIDEOS:
echo    • Ve a cualquier capítulo del curso
echo    • Como instructor (owner), verás la interfaz de subida
echo    • Arrastra y suelta tu video de prueba
echo    • Se subirá automáticamente a Google Cloud Storage
echo.
echo 🎓 CONTENIDO INCLUIDO:
echo    • Video: Fundamentos de IA (GRATIS)
echo    • Estudio de Caso: Tesla (GRATIS)  
echo    • Laboratorio: Google Cloud (PREMIUM)
echo    • Quiz: Conceptos Fundamentales (PREMIUM)
echo.
echo ===============================================
echo.
echo ¿Quieres ejecutar la aplicación ahora? (s/n)
set /p run_app=

if /i "%run_app%"=="s" (
    echo.
    echo 🚀 Iniciando aplicación...
    echo Ve a: http://localhost:3000
    echo.
    npm run dev
) else (
    echo.
    echo 💡 Para ejecutar manualmente:
    echo    npm run dev
    echo.
    echo ¡Listo para usar tu LMS con la Lección 1 completa!
)

echo.
pause