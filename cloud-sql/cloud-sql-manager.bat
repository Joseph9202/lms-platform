@echo off
echo ================================================
echo      MIGRACION A CLOUD SQL - LMS PLATFORM
echo ================================================
echo.

echo 📋 Este script te ayudará a migrar a Cloud SQL paso a paso.
echo.

:menu
echo ============ MENU PRINCIPAL ============
echo 1. Configurar Cloud SQL
echo 2. Probar conexión
echo 3. Aplicar schema Prisma
echo 4. Migrar datos existentes
echo 5. Ver configuración ejemplo
echo 6. Instalar dependencias
echo 7. Salir
echo.
set /p choice="Selecciona una opción (1-7): "

if "%choice%"=="1" goto setup
if "%choice%"=="2" goto test
if "%choice%"=="3" goto schema
if "%choice%"=="4" goto migrate
if "%choice%"=="5" goto config
if "%choice%"=="6" goto install
if "%choice%"=="7" goto exit
goto menu

:setup
echo.
echo 🚀 CONFIGURAR CLOUD SQL
echo ========================
echo.
echo Este paso creará la instancia de Cloud SQL en Google Cloud.
echo Necesitas tener gcloud CLI instalado y autenticado.
echo.
set /p confirm="¿Continuar? (y/n): "
if /i not "%confirm%"=="y" goto menu

echo 📂 Abriendo Google Cloud Shell...
start https://shell.cloud.google.com

echo.
echo 📋 INSTRUCCIONES PARA CLOUD SHELL:
echo 1. Clonar tu repositorio o subir los archivos de cloud-sql/
echo 2. Ejecutar: chmod +x setup-cloud-sql.sh
echo 3. Ejecutar: ./setup-cloud-sql.sh TU_PROJECT_ID
echo 4. Copiar la configuración generada a tu .env local
echo.
pause
goto menu

:test
echo.
echo 🔍 PROBAR CONEXIÓN A CLOUD SQL
echo ===============================
echo.
echo Verificando que Node.js puede conectar a Cloud SQL...
node cloud-sql/test-connection.js
echo.
pause
goto menu

:schema
echo.
echo 🏗️ APLICAR SCHEMA PRISMA
echo =========================
echo.
echo Aplicando el nuevo schema optimizado a Cloud SQL...
echo.

echo 📚 Generando cliente Prisma...
call npx prisma generate

echo 🚀 Aplicando cambios a la base de datos...
call npx prisma db push

echo ✅ Schema aplicado exitosamente!
echo.
pause
goto menu

:migrate
echo.
echo 🚚 MIGRAR DATOS EXISTENTES
echo ===========================
echo.
echo ⚠️  ADVERTENCIA: Este proceso copiará todos los datos
echo    de tu base de datos actual a Cloud SQL.
echo.
echo 📋 Asegúrate de tener configurado:
echo    - DATABASE_URL_SOURCE (BD actual)
echo    - DATABASE_URL_TARGET (Cloud SQL)
echo.
set /p confirm="¿Continuar con la migración? (y/n): "
if /i not "%confirm%"=="y" goto menu

echo 🚀 Iniciando migración...
node cloud-sql/migrate-data.js --confirm
echo.
pause
goto menu

:config
echo.
echo 📄 CONFIGURACIÓN DE EJEMPLO
echo ============================
echo.
echo Abriendo archivo de configuración ejemplo...
notepad cloud-sql\.env.example
echo.
echo 📋 Copia las variables necesarias a tu archivo .env
echo.
pause
goto menu

:install
echo.
echo 📦 INSTALAR DEPENDENCIAS
echo =========================
echo.
echo Instalando mysql2 para conexiones directas...
call npm install mysql2
echo.
echo ✅ Dependencias instaladas!
echo.
pause
goto menu

:exit
echo.
echo 👋 ¡Gracias por usar el configurador de Cloud SQL!
echo.
echo 📚 RECURSOS ÚTILES:
echo    - Documentación: cloud-sql/README.md
echo    - Soporte: https://cloud.google.com/sql/docs
echo    - Precios: https://cloud.google.com/sql/pricing
echo.
pause
exit /b 0
