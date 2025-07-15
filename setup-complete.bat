@echo off
echo 🚀 Instalando dependencias para Google Cloud Storage...
echo.

cd "C:\Users\josep\Desktop\IA Pacific Labs\lms-platform"

echo 📦 Instalando dependencias básicas...
npm install dotenv

echo 📦 Instalando Google Cloud Storage...
npm install @google-cloud/storage

echo 📦 Instalando Multer para subida de archivos...
npm install multer @types/multer

echo.
echo ✅ ¡Dependencias instaladas!
echo.
echo 🧪 Probando configuración...
echo.
node test-gcs-final.js

echo.
echo Presiona cualquier tecla para continuar...
pause > nul