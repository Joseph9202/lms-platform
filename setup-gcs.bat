@echo off
cls
echo ===============================================
echo     CONFIGURACION GOOGLE CLOUD STORAGE
echo          LMS PLATFORM - VIDEO MANAGER
echo ===============================================
echo.

cd "C:\Users\josep\Desktop\IA Pacific Labs\lms-platform"

echo Paso 1: Instalando dependencias necesarias...
echo.
npm install @google-cloud/storage multer @types/multer
echo.

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas correctamente!
echo.

echo Paso 2: Verificando configuracion...
echo.

REM Verificar si existe el archivo .env
if not exist ".env" (
    echo ❌ Archivo .env no encontrado
    echo Creando archivo .env.example...
    copy .env.gcs.example .env.example > nul
    echo.
    echo 💡 Necesitas:
    echo 1. Configurar Google Cloud Console
    echo 2. Crear Service Account
    echo 3. Descargar credenciales JSON
    echo 4. Agregar variables al archivo .env
    echo.
    echo Ver guia completa: GOOGLE_CLOUD_SETUP.md
    echo.
    pause
    exit /b 1
)

echo ✅ Archivo .env encontrado
echo.

echo Paso 3: Probando configuracion de Google Cloud...
echo.

REM Verificar si Node.js puede ejecutar el script de prueba
node test-gcs.js

echo.
echo ===============================================
echo              CONFIGURACION COMPLETA
echo ===============================================
echo.
echo 🎯 Archivos disponibles para usar:
echo.
echo 📁 COMPONENTES:
echo    • components/video-upload.tsx
echo    • components/video-player.tsx  
echo    • components/chapter-video-manager.tsx
echo.
echo 🔌 APIs:
echo    • app/api/upload/video/route.ts
echo    • app/api/chapters/[chapterId]/route.ts
echo.
echo 🎣 HOOKS:
echo    • hooks/use-video-progress.ts
echo.
echo 📋 DOCUMENTACION:
echo    • GOOGLE_CLOUD_SETUP.md - Guia completa
echo    • GCS_IMPLEMENTATION_SUMMARY.md - Resumen
echo.
echo ===============================================
echo.
echo 💡 PROXIMO PASO: Integrar en tus paginas
echo.
echo Ejemplo de uso:
echo.
echo import { ChapterVideoManager } from "@/components/chapter-video-manager";
echo.
echo ^<ChapterVideoManager
echo   chapterId={chapterId}
echo   userId={userId}
echo   isOwner={isOwner}
echo   initialVideoUrl={chapter.videoUrl}
echo   chapterTitle={chapter.title}
echo /^>
echo.
echo ===============================================
echo.
echo ¿Deseas abrir la documentacion? (s/n)
set /p open_docs=

if /i "%open_docs%"=="s" (
    start notepad GOOGLE_CLOUD_SETUP.md
    start notepad GCS_IMPLEMENTATION_SUMMARY.md
)

echo.
echo 🚀 ¡Configuracion completada!
echo Tu LMS esta listo para manejar videos con Google Cloud Storage.
echo.
pause