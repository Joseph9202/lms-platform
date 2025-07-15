@echo off
echo Instalando dependencias de Google Cloud Storage...
echo.

cd "C:\Users\josep\Desktop\IA Pacific Labs\lms-platform"

echo Instalando @google-cloud/storage...
npm install @google-cloud/storage

echo Instalando multer para subida de archivos...
npm install multer @types/multer

echo.
echo ✅ Dependencias instaladas correctamente!
echo.
echo Siguiente paso: Configurar las variables de entorno
echo 1. Crea un proyecto en Google Cloud Console
echo 2. Habilita la API de Cloud Storage
echo 3. Crea una Service Account y descarga el archivo JSON
echo 4. Crea un bucket en Cloud Storage
echo 5. Agrega las variables al archivo .env
echo.
pause