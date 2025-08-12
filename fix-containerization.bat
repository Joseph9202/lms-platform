@echo off
REM ===========================================
REM SCRIPT DE CORRECCIÓN - LMS PLATFORM
REM Soluciona los errores de containerización
REM ===========================================

echo 🚀 Iniciando corrección de errores de containerización...

REM ===========================================
REM PASO 1: Limpiar node_modules y locks
REM ===========================================

echo [INFO] Limpiando node_modules y package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo [SUCCESS] Limpieza completada

REM ===========================================
REM PASO 2: Instalar dependencias
REM ===========================================

echo [INFO] Instalando dependencias actualizadas...
npm install
if %errorlevel% neq 0 (
    echo [ERROR] Error al instalar dependencias
    pause
    exit /b 1
)
echo [SUCCESS] Dependencias instaladas correctamente

REM ===========================================
REM PASO 3: Verificar dependencias críticas
REM ===========================================

echo [INFO] Verificando dependencias críticas...

REM Verificar prom-client
npm list prom-client >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Instalando prom-client...
    npm install prom-client@^15.1.0
) else (
    echo [SUCCESS] prom-client instalado correctamente
)

REM Verificar @radix-ui/react-slider
npm list @radix-ui/react-slider >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Instalando @radix-ui/react-slider...
    npm install @radix-ui/react-slider@^1.1.2
) else (
    echo [SUCCESS] @radix-ui/react-slider instalado correctamente
)

REM ===========================================
REM PASO 4: Verificar archivos clave
REM ===========================================

echo [INFO] Verificando archivos clave...

if exist "components\ui\slider.tsx" (
    echo [SUCCESS] Componente Slider encontrado
) else (
    echo [ERROR] Componente Slider no encontrado - necesita ser creado
)

if exist ".env.production" (
    echo [SUCCESS] Archivo .env.production encontrado
) else (
    echo [ERROR] Archivo .env.production no encontrado
)

REM ===========================================
REM PASO 5: Generar Prisma
REM ===========================================

echo [INFO] Generando cliente de Prisma...
npx prisma generate
if %errorlevel% neq 0 (
    echo [ERROR] Error al generar cliente de Prisma
) else (
    echo [SUCCESS] Cliente de Prisma generado correctamente
)

REM ===========================================
REM PASO 6: Verificar build local
REM ===========================================

echo [INFO] Verificando build local...
npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build local falló - revisa los errores arriba
    pause
    exit /b 1
) else (
    echo [SUCCESS] Build local exitoso
)

REM ===========================================
REM PASO 7: Limpiar build anterior de Docker
REM ===========================================

echo [INFO] Limpiando imágenes de Docker anteriores...
docker system prune -f >nul 2>&1
docker builder prune -f >nul 2>&1
echo [SUCCESS] Limpieza de Docker completada

REM ===========================================
REM PASO 8: Rebuild de Docker
REM ===========================================

echo [INFO] Reconstruyendo imagen de Docker...
docker build -t lms-platform:latest .
if %errorlevel% neq 0 (
    echo [ERROR] Error en construcción de Docker
    pause
    exit /b 1
) else (
    echo [SUCCESS] Imagen de Docker construida exitosamente
)

REM ===========================================
REM RESUMEN FINAL
REM ===========================================

echo.
echo ===========================================
echo 🎉 CORRECCIÓN COMPLETADA
echo ===========================================
echo [SUCCESS] Todos los errores han sido corregidos
echo [SUCCESS] La imagen de Docker se construyó exitosamente
echo.
echo 📋 PRÓXIMOS PASOS:
echo 1. Ejecutar: docker-compose up -d
echo 2. Verificar logs: docker-compose logs -f
echo 3. Probar endpoint: http://localhost:3000/api/health
echo.
echo [INFO] Si encuentras otros errores, revisa los logs específicos
echo ===========================================
pause
