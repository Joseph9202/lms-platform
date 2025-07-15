@echo off
echo 🚀 Configurando el proyecto LMS Platform...

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Por favor, instala Node.js primero.
    pause
    exit /b 1
)

REM Verificar si npm está instalado
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está instalado. Por favor, instala npm primero.
    pause
    exit /b 1
)

echo ✅ Node.js y npm están instalados

REM Instalar dependencias
echo 📦 Instalando dependencias...
npm install

if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas correctamente

REM Generar cliente de Prisma
echo 🗄️ Generando cliente de Prisma...
npx prisma generate

if %errorlevel% neq 0 (
    echo ❌ Error al generar cliente de Prisma
    pause
    exit /b 1
)

echo ✅ Cliente de Prisma generado correctamente

echo.
echo 🎉 ¡Proyecto configurado exitosamente!
echo.
echo 📋 Próximos pasos:
echo 1. Configura las variables de entorno en el archivo .env
echo 2. Ejecuta 'npx prisma db push' para configurar la base de datos
echo 3. Ejecuta 'npm run dev' para iniciar el servidor de desarrollo
echo.
echo 📖 Lee el README.md para instrucciones detalladas
pause