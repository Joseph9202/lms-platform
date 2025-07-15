@echo off
echo ✅ Configurando Google Cloud Storage...
echo.

cd "C:\Users\josep\Desktop\IA Pacific Labs\lms-platform"

echo 📦 Instalando dependencias de Google Cloud...
npm install @google-cloud/storage multer @types/multer

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
)

echo.
echo ✅ ¡Dependencias instaladas!
echo.
echo 📋 CONFIGURACIÓN ACTUAL:
echo    • Credenciales: ✅ google-cloud-credentials.json
echo    • Project ID: ✅ ai-academy-461719
echo    • Variables .env: ✅ Configuradas
echo.
echo ⚠️  FALTA: Nombre del bucket
echo.
echo 🔍 Para obtener el nombre del bucket, ve a Google Cloud Shell y ejecuta:
echo    gsutil ls
echo.
echo 📝 Luego edita el archivo .env y reemplaza:
echo    GOOGLE_CLOUD_BUCKET_NAME="NECESITAS_AGREGAR_EL_NOMBRE_DEL_BUCKET"
echo    por:
echo    GOOGLE_CLOUD_BUCKET_NAME="lms-videos-1234567890"
echo.
echo 🧪 Después ejecuta: node test-gcs.js
echo.
pause