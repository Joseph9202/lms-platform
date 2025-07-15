@echo off
echo.
echo 🚀 CONFIGURADOR AUTOMATICO - PACIFIC LABS LMS PLATFORM
echo ========================================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js no está instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detectado
echo.

REM Verificar si estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: package.json no encontrado
    echo Asegúrate de ejecutar este script desde la raíz del proyecto LMS
    pause
    exit /b 1
)

echo ✅ Directorio del proyecto verificado
echo.

REM Instalar dependencias base
echo 📦 Instalando dependencias base...
call npm install

REM Instalar dependencias específicas para video
echo 📦 Instalando dependencias de video...
call npm install @google-cloud/storage ffmpeg-static sharp multer

REM Crear directorios necesarios
echo 📁 Creando estructura de directorios...
if not exist "temp-processing" mkdir temp-processing
if not exist "videos" mkdir videos
if not exist "videos\leccion-1" mkdir videos\leccion-1
if not exist "videos\leccion-2" mkdir videos\leccion-2
if not exist "lib" mkdir lib
if not exist "hooks" mkdir hooks

echo ✅ Directorios creados
echo.

REM Verificar archivo .env
if not exist ".env" (
    echo ⚠️  Archivo .env no encontrado. Creando plantilla...
    copy ".env.example" ".env" >nul 2>&1
    if not exist ".env.example" (
        echo # LMS Platform - Variables de Entorno > .env
        echo. >> .env
        echo # Base de datos >> .env
        echo DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/lms_db" >> .env
        echo. >> .env
        echo # Clerk Auth >> .env
        echo NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=tu_clerk_publishable_key >> .env
        echo CLERK_SECRET_KEY=tu_clerk_secret_key >> .env
        echo. >> .env
        echo # Google Cloud Storage >> .env
        echo GOOGLE_CLOUD_PROJECT_ID=tu-project-id >> .env
        echo GOOGLE_CLOUD_KEY_FILE=./google-cloud-credentials.json >> .env
        echo GOOGLE_CLOUD_BUCKET_NAME=lms-videos-bucket >> .env
        echo. >> .env
        echo # Mux (opcional) >> .env
        echo MUX_TOKEN_ID=tu_mux_token_id >> .env
        echo MUX_TOKEN_SECRET=tu_mux_token_secret >> .env
    )
    echo ✅ Archivo .env creado. IMPORTANTE: Configura las variables antes de continuar.
) else (
    echo ✅ Archivo .env encontrado
)
echo.

REM Verificar credenciales de Google Cloud
if not exist "google-cloud-credentials.json" (
    echo ⚠️  Credenciales de Google Cloud no encontradas
    echo.
    echo Para configurar Google Cloud Storage:
    echo 1. Ve a console.cloud.google.com
    echo 2. Crea un proyecto o selecciona uno existente
    echo 3. Habilita la API de Cloud Storage
    echo 4. Crea una Service Account con rol Storage Admin
    echo 5. Descarga las credenciales como JSON
    echo 6. Guarda el archivo como 'google-cloud-credentials.json' en este directorio
    echo.
) else (
    echo ✅ Credenciales de Google Cloud encontradas
)

REM Generar esquema de base de datos
echo 🗄️  Generando esquema de Prisma...
call npx prisma generate >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Esquema de Prisma generado
) else (
    echo ⚠️  Error generando esquema de Prisma. Verifica tu configuración.
)
echo.

REM Crear configuraciones de video si no existen
if not exist "videos-config-leccion-1.json" (
    echo 📝 Creando configuración de videos para Lección 1...
    echo [ > videos-config-leccion-1.json
    echo   { >> videos-config-leccion-1.json
    echo     "videoPath": "./videos/leccion-1/fundamentos-ia.mp4", >> videos-config-leccion-1.json
    echo     "courseKey": "ia-basico", >> videos-config-leccion-1.json
    echo     "lessonKey": "leccion-1", >> videos-config-leccion-1.json
    echo     "videoKey": "video-principal" >> videos-config-leccion-1.json
    echo   }, >> videos-config-leccion-1.json
    echo   { >> videos-config-leccion-1.json
    echo     "videoPath": "./videos/leccion-1/tesla-caso-estudio.mp4", >> videos-config-leccion-1.json
    echo     "courseKey": "ia-basico", >> videos-config-leccion-1.json
    echo     "lessonKey": "leccion-1", >> videos-config-leccion-1.json
    echo     "videoKey": "tesla-caso" >> videos-config-leccion-1.json
    echo   } >> videos-config-leccion-1.json
    echo ] >> videos-config-leccion-1.json
    echo ✅ Configuración de Lección 1 creada
)

if not exist "videos-config-leccion-2.json" (
    echo 📝 Creando configuración de videos para Lección 2...
    echo [ > videos-config-leccion-2.json
    echo   { >> videos-config-leccion-2.json
    echo     "videoPath": "./videos/leccion-2/tipos-machine-learning.mp4", >> videos-config-leccion-2.json
    echo     "courseKey": "ia-basico", >> videos-config-leccion-2.json
    echo     "lessonKey": "leccion-2", >> videos-config-leccion-2.json
    echo     "videoKey": "ml-tipos" >> videos-config-leccion-2.json
    echo   } >> videos-config-leccion-2.json
    echo ] >> videos-config-leccion-2.json
    echo ✅ Configuración de Lección 2 creada
)

REM Verificar FFmpeg
echo 🎬 Verificando FFmpeg...
ffmpeg -version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ FFmpeg instalado y disponible
) else (
    echo ⚠️  FFmpeg no encontrado. Para funcionalidad completa de video:
    echo    1. Descarga FFmpeg desde https://ffmpeg.org/download.html
    echo    2. Agrega FFmpeg al PATH del sistema
    echo    3. O instala con: npm install ffmpeg-static
)
echo.

REM Crear script de prueba
echo 📋 Creando script de prueba del sistema...
echo console.log^('🧪 Probando sistema LMS...'^^^); > test-setup.js
echo. >> test-setup.js
echo const fs = require^('fs'^^^); >> test-setup.js
echo. >> test-setup.js
echo // Verificar archivos críticos >> test-setup.js
echo const criticalFiles = [ >> test-setup.js
echo   'package.json', >> test-setup.js
echo   '.env', >> test-setup.js
echo   'lib/video-analytics-system.js', >> test-setup.js
echo   'lib/video-optimization-system.js', >> test-setup.js
echo   'components/video-advanced-components.tsx', >> test-setup.js
echo   'hooks/use-video-advanced.ts' >> test-setup.js
echo ]; >> test-setup.js
echo. >> test-setup.js
echo let allFilesExist = true; >> test-setup.js
echo criticalFiles.forEach^(file =^> { >> test-setup.js
echo   if ^(fs.existsSync^(file^^^)^^^ { >> test-setup.js
echo     console.log^(`✅ ${file}`^^^); >> test-setup.js
echo   } else { >> test-setup.js
echo     console.log^(`❌ ${file} - FALTANTE`^^^); >> test-setup.js
echo     allFilesExist = false; >> test-setup.js
echo   } >> test-setup.js
echo }^^^); >> test-setup.js
echo. >> test-setup.js
echo if ^(allFilesExist^^^ { >> test-setup.js
echo   console.log^('\\n🎉 ¡Sistema LMS configurado correctamente!'^^^); >> test-setup.js
echo } else { >> test-setup.js
echo   console.log^('\\n⚠️  Algunos archivos faltan. Ejecuta setup-complete.bat'^^^); >> test-setup.js
echo } >> test-setup.js

echo ✅ Script de prueba creado
echo.

REM Ejecutar prueba
echo 🧪 Ejecutando prueba del sistema...
node test-setup.js
echo.

REM Resumen final
echo 🎯 CONFIGURACIÓN COMPLETADA
echo ================================
echo.
echo ✅ Dependencias instaladas
echo ✅ Estructura de directorios creada
echo ✅ Archivos de configuración generados
echo ✅ Scripts de video configurados
echo.
echo 📋 PRÓXIMOS PASOS:
echo.
echo 1. 🔧 Configura las variables en el archivo .env
echo 2. 🔑 Agrega credenciales de Google Cloud (google-cloud-credentials.json)
echo 3. 🗄️  Ejecuta: npx prisma db push (para configurar la base de datos)
echo 4. 🎥 Coloca tus videos en las carpetas videos/leccion-X/
echo 5. 🚀 Ejecuta: npm run dev (para iniciar el servidor)
echo.
echo 🎛️  HERRAMIENTAS DISPONIBLES:
echo    - upload-videos-menu.bat (menú interactivo)
echo    - video-admin-advanced.js (administración avanzada)
echo    - test-video-upload-system.js (pruebas del sistema)
echo.
echo Para más información, consulta:
echo    - SISTEMA_VIDEOS_GUIA_COMPLETA.md
echo    - GCS_IMPLEMENTATION_SUMMARY.md
echo.

REM Limpiar archivo de prueba
del test-setup.js >nul 2>&1

echo 💡 TIP: Ejecuta 'upload-videos-menu.bat' para comenzar a subir videos
echo.
pause