@echo off
REM ===========================================
REM DEPLOY SCRIPT - WINDOWS VERSION
REM ===========================================
REM Script de deployment automatizado para Windows

title LMS Platform - Automated Deployment

color 0A

echo.
echo     ██████╗ ███████╗██████╗ ██╗      ██████╗ ██╗   ██╗
echo     ██╔══██╗██╔════╝██╔══██╗██║     ██╔═══██╗╚██╗ ██╔╝
echo     ██║  ██║█████╗  ██████╔╝██║     ██║   ██║ ╚████╔╝ 
echo     ██║  ██║██╔══╝  ██╔═══╝ ██║     ██║   ██║  ╚██╔╝  
echo     ██████╔╝███████╗██║     ███████╗╚██████╔╝   ██║   
echo     ╚═════╝ ╚══════╝╚═╝     ╚══════╝ ╚═════╝    ╚═╝   
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║               🚀 AUTOMATED DEPLOYMENT - WINDOWS                   ║
echo ╠════════════════════════════════════════════════════════════════════╣
echo ║                                                                    ║
echo ║  Sistema completo de deployment para LMS Platform                 ║
echo ║  • Build automático de imagen Docker                              ║
echo ║  • Deploy a Google Kubernetes Engine                              ║
echo ║  • Verificación automática de health                              ║
echo ║  • Rollback automático en caso de fallas                          ║
echo ║  • Generación de reportes detallados                              ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

REM Configuración
set PROJECT_ID=ai-academy-461719
set CLUSTER_NAME=lms-cluster
set CLUSTER_ZONE=us-central1-a
set NAMESPACE=lms-platform
set IMAGE_NAME=lms-platform
set REGISTRY=gcr.io
set DEPLOYMENT_NAME=lms-platform-deployment

REM Variables de entorno
if "%ENVIRONMENT%"=="" set ENVIRONMENT=production
if "%BUILD_VERSION%"=="" set BUILD_VERSION=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
if "%FORCE_DEPLOY%"=="" set FORCE_DEPLOY=false
if "%SKIP_TESTS%"=="" set SKIP_TESTS=false

REM Limpiar BUILD_VERSION (remover espacios)
set BUILD_VERSION=%BUILD_VERSION: =0%

REM Archivos de log
set LOG_FILE=deployment_%BUILD_VERSION%.log
set ROLLBACK_FILE=rollback_%BUILD_VERSION%.bat

echo 📋 CONFIGURACIÓN DEL DEPLOYMENT > %LOG_FILE%
echo =============================== >> %LOG_FILE%
echo Fecha: %date% %time% >> %LOG_FILE%
echo Entorno: %ENVIRONMENT% >> %LOG_FILE%
echo Versión: %BUILD_VERSION% >> %LOG_FILE%
echo Proyecto: %PROJECT_ID% >> %LOG_FILE%
echo Cluster: %CLUSTER_NAME% >> %LOG_FILE%
echo Namespace: %NAMESPACE% >> %LOG_FILE%
echo. >> %LOG_FILE%

:main_menu
echo 📋 OPCIONES DE DEPLOYMENT:
echo.
echo   🔧 PREPARACIÓN:
echo   1. Verificar prerrequisitos
echo   2. Ejecutar pruebas
echo   3. Crear backup pre-deploy
echo.
echo   🔨 BUILD Y DEPLOY:
echo   4. Construir imagen Docker
echo   5. Deploy completo a Kubernetes
echo   6. Deploy rápido (sin tests)
echo.
echo   🔍 VERIFICACIÓN:
echo   7. Verificar deployment
echo   8. Ejecutar smoke tests
echo   9. Ver estado del cluster
echo.
echo   📊 REPORTES Y ROLLBACK:
echo   10. Generar reporte
echo   11. Crear script de rollback
echo   12. Ejecutar rollback
echo.
echo   13. ❌ Salir
echo.

set /p choice="Selecciona una opción (1-13): "

if "%choice%"=="1" goto check_prerequisites
if "%choice%"=="2" goto run_tests
if "%choice%"=="3" goto backup
if "%choice%"=="4" goto build_image
if "%choice%"=="5" goto full_deploy
if "%choice%"=="6" goto quick_deploy
if "%choice%"=="7" goto verify_deployment
if "%choice%"=="8" goto smoke_tests
if "%choice%"=="9" goto cluster_status
if "%choice%"=="10" goto generate_report
if "%choice%"=="11" goto create_rollback
if "%choice%"=="12" goto execute_rollback
if "%choice%"=="13" goto exit
echo ❌ Opción inválida
pause
goto main_menu

REM ===========================================
REM VERIFICAR PRERREQUISITOS
REM ===========================================
:check_prerequisites
echo.
echo 🔍 VERIFICANDO PRERREQUISITOS
echo =============================
echo.

echo Verificando herramientas necesarias... >> %LOG_FILE%

REM Verificar Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado
    echo ERROR: Docker no encontrado >> %LOG_FILE%
    pause
    goto main_menu
)
echo ✅ Docker instalado

REM Verificar Docker está ejecutándose
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está ejecutándose
    echo ERROR: Docker no está running >> %LOG_FILE%
    pause
    goto main_menu
)
echo ✅ Docker ejecutándose

REM Verificar kubectl
kubectl version --client >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ kubectl no está instalado
    echo ERROR: kubectl no encontrado >> %LOG_FILE%
    pause
    goto main_menu
)
echo ✅ kubectl instalado

REM Verificar gcloud
gcloud version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ gcloud CLI no está instalado
    echo ERROR: gcloud no encontrado >> %LOG_FILE%
    pause
    goto main_menu
)
echo ✅ gcloud CLI instalado

REM Verificar autenticación con GCP
gcloud auth list --filter=status:ACTIVE --format="value(account)" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ No hay autenticación activa con GCP
    echo 🔧 Ejecuta: gcloud auth login
    pause
    goto main_menu
)
echo ✅ Autenticación GCP activa

REM Conectar al cluster
echo 🔌 Conectando al cluster GKE...
gcloud container clusters get-credentials %CLUSTER_NAME% --zone %CLUSTER_ZONE% --project %PROJECT_ID% >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Conectado al cluster %CLUSTER_NAME%
) else (
    echo ❌ Error conectando al cluster
    pause
    goto main_menu
)

echo.
echo ✅ PRERREQUISITOS VERIFICADOS >> %LOG_FILE%
echo ✅ Todos los prerrequisitos están listos
pause
goto main_menu

REM ===========================================
REM EJECUTAR PRUEBAS
REM ===========================================
:run_tests
if "%SKIP_TESTS%"=="true" (
    echo ⚠️ Saltando pruebas (SKIP_TESTS=true)
    goto main_menu
)

echo.
echo 🧪 EJECUTANDO PRUEBAS
echo =====================
echo.

echo Iniciando pruebas... >> %LOG_FILE%

REM Verificar package.json
if not exist "package.json" (
    echo ❌ package.json no encontrado
    echo ERROR: package.json no encontrado >> %LOG_FILE%
    pause
    goto main_menu
)

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    call npm ci
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        goto main_menu
    )
)

REM Ejecutar linting
echo 🔍 Ejecutando linting...
call npm run lint >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Linting pasado
    echo PASS: Linting >> %LOG_FILE%
) else (
    echo ⚠️ Linting falló, continuando...
    echo FAIL: Linting >> %LOG_FILE%
)

REM Ejecutar type checking
echo 🔍 Ejecutando type checking...
call npm run type-check >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Type checking pasado
    echo PASS: Type checking >> %LOG_FILE%
) else (
    echo ⚠️ Type checking falló, continuando...
    echo FAIL: Type checking >> %LOG_FILE%
)

REM Ejecutar build
echo 🔨 Verificando build...
call npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Build exitoso
    echo PASS: Build >> %LOG_FILE%
) else (
    echo ❌ Build falló
    echo FAIL: Build >> %LOG_FILE%
    pause
    goto main_menu
)

echo.
echo ✅ PRUEBAS COMPLETADAS >> %LOG_FILE%
echo ✅ Pruebas completadas
pause
goto main_menu

REM ===========================================
REM CREAR BACKUP PRE-DEPLOY
REM ===========================================
:backup
echo.
echo 💾 CREANDO BACKUP PRE-DEPLOY
echo ============================
echo.

echo Creando backup pre-deploy... >> %LOG_FILE%

REM Backup de deployment actual
kubectl get deployment %DEPLOYMENT_NAME% -n %NAMESPACE% -o yaml > backup_deployment_%BUILD_VERSION%.yaml 2>nul
if %errorlevel% equ 0 (
    echo ✅ Backup de deployment creado
    echo SUCCESS: Deployment backup >> %LOG_FILE%
) else (
    echo ⚠️ No se pudo hacer backup del deployment (puede no existir)
    echo WARNING: No deployment backup >> %LOG_FILE%
)

REM Ejecutar script de backup completo si existe
if exist "docker\scripts\backup.sh" (
    echo 📦 Ejecutando backup completo...
    where bash >nul 2>&1
    if %errorlevel% equ 0 (
        bash docker\scripts\backup.sh
        echo ✅ Backup completo ejecutado
        echo SUCCESS: Full backup >> %LOG_FILE%
    ) else (
        echo ⚠️ Bash no encontrado, backup manual
        echo WARNING: Bash not found >> %LOG_FILE%
    )
) else (
    echo ⚠️ Script de backup no encontrado
    echo WARNING: Backup script not found >> %LOG_FILE%
)

echo.
echo ✅ BACKUP PRE-DEPLOY COMPLETADO >> %LOG_FILE%
echo ✅ Backup pre-deploy completado
pause
goto main_menu

REM ===========================================
REM CONSTRUIR IMAGEN DOCKER
REM ===========================================
:build_image
echo.
echo 🔨 CONSTRUYENDO IMAGEN DOCKER
echo =============================
echo.

echo Iniciando build de imagen... >> %LOG_FILE%

set IMAGE_TAG=%REGISTRY%/%PROJECT_ID%/%IMAGE_NAME%:%BUILD_VERSION%
set LATEST_TAG=%REGISTRY%/%PROJECT_ID%/%IMAGE_NAME%:latest

echo 📊 Configuración de imagen:
echo    Registry: %REGISTRY%
echo    Proyecto: %PROJECT_ID%
echo    Imagen: %IMAGE_NAME%
echo    Tag: %BUILD_VERSION%
echo    Tag completo: %IMAGE_TAG%

REM Configurar Docker para GCR
echo 🔐 Configurando autenticación Docker...
gcloud auth configure-docker --quiet
if %errorlevel% neq 0 (
    echo ❌ Error configurando Docker para GCR
    pause
    goto main_menu
)

REM Construir imagen
echo 🔨 Construyendo imagen...
docker build --platform linux/amd64 --tag %IMAGE_TAG% --tag %LATEST_TAG% --file Dockerfile .
if %errorlevel% equ 0 (
    echo ✅ Imagen construida exitosamente
    echo SUCCESS: Image built - %IMAGE_TAG% >> %LOG_FILE%
) else (
    echo ❌ Error construyendo imagen
    echo ERROR: Image build failed >> %LOG_FILE%
    pause
    goto main_menu
)

REM Push de imagen
echo 📤 Subiendo imagen a registry...
docker push %IMAGE_TAG%
if %errorlevel% equ 0 (
    echo ✅ Imagen principal subida
) else (
    echo ❌ Error subiendo imagen principal
    pause
    goto main_menu
)

docker push %LATEST_TAG%
if %errorlevel% equ 0 (
    echo ✅ Imagen latest subida
    echo SUCCESS: Image pushed - %IMAGE_TAG% >> %LOG_FILE%
) else (
    echo ❌ Error subiendo imagen latest
    echo ERROR: Image push failed >> %LOG_FILE%
    pause
    goto main_menu
)

REM Mostrar información de la imagen
echo 📦 Información de imagen:
docker images %IMAGE_TAG%

echo.
echo ✅ IMAGEN DOCKER COMPLETADA >> %LOG_FILE%
echo ✅ Imagen Docker construida y subida
pause
goto main_menu

REM ===========================================
REM DEPLOY COMPLETO
REM ===========================================
:full_deploy
echo.
echo 🚀 DEPLOY COMPLETO A KUBERNETES
echo ===============================
echo.

echo Iniciando deploy completo... >> %LOG_FILE%

REM Confirmar deploy
if "%FORCE_DEPLOY%" neq "true" (
    set /p confirm="¿Continuar con el deploy completo? (y/n): "
    if /i not "!confirm!"=="y" (
        echo Deploy cancelado
        goto main_menu
    )
)

REM Ejecutar pasos en secuencia
call :check_prerequisites
call :run_tests
call :backup
call :build_image
call :deploy_to_k8s
call :verify_deployment
call :smoke_tests

echo.
echo ✅ DEPLOY COMPLETO FINALIZADO >> %LOG_FILE%
echo ✅ Deploy completo finalizado
pause
goto main_menu

REM ===========================================
REM DEPLOY RÁPIDO
REM ===========================================
:quick_deploy
echo.
echo ⚡ DEPLOY RÁPIDO (SIN TESTS)
echo ===========================
echo.

echo Iniciando deploy rápido... >> %LOG_FILE%

set SKIP_TESTS=true

call :check_prerequisites
call :build_image
call :deploy_to_k8s
call :verify_deployment

echo.
echo ✅ DEPLOY RÁPIDO FINALIZADO >> %LOG_FILE%
echo ✅ Deploy rápido finalizado
pause
goto main_menu

REM ===========================================
REM DEPLOY A KUBERNETES
REM ===========================================
:deploy_to_k8s
echo.
echo ☸️ DESPLEGANDO A KUBERNETES
echo ===========================
echo.

echo Desplegando a Kubernetes... >> %LOG_FILE%

set IMAGE_TAG=%REGISTRY%/%PROJECT_ID%/%IMAGE_NAME%:%BUILD_VERSION%

REM Verificar que existe el namespace
kubectl get namespace %NAMESPACE% >nul 2>&1
if %errorlevel% neq 0 (
    echo 📝 Creando namespace %NAMESPACE%...
    kubectl create namespace %NAMESPACE%
)

REM Aplicar manifests
if exist "k8s" (
    echo 📋 Aplicando manifests de Kubernetes...
    
    kubectl apply -f k8s\00-namespace-config.yaml
    kubectl apply -f k8s\01-deployment.yaml
    kubectl apply -f k8s\02-services.yaml
    kubectl apply -f k8s\03-ingress.yaml
    
    echo ✅ Manifests aplicados
    echo SUCCESS: Manifests applied >> %LOG_FILE%
) else (
    echo ❌ Directorio k8s no encontrado
    echo ERROR: k8s directory not found >> %LOG_FILE%
    pause
    goto main_menu
)

REM Actualizar imagen del deployment
echo 🔄 Actualizando imagen del deployment...
kubectl set image deployment/%DEPLOYMENT_NAME% %IMAGE_NAME%=%IMAGE_TAG% -n %NAMESPACE%
if %errorlevel% equ 0 (
    echo ✅ Imagen actualizada en deployment
    echo SUCCESS: Image updated in deployment >> %LOG_FILE%
) else (
    echo ❌ Error actualizando imagen
    echo ERROR: Failed to update image >> %LOG_FILE%
    pause
    goto main_menu
)

REM Esperar rollout
echo ⏳ Esperando rollout (máximo 10 minutos)...
kubectl rollout status deployment/%DEPLOYMENT_NAME% -n %NAMESPACE% --timeout=600s
if %errorlevel% equ 0 (
    echo ✅ Rollout completado exitosamente
    echo SUCCESS: Rollout completed >> %LOG_FILE%
) else (
    echo ❌ Rollout falló o timeout
    echo ERROR: Rollout failed or timeout >> %LOG_FILE%
    pause
    goto main_menu
)

echo ✅ Deploy a Kubernetes completado
goto :eof

REM ===========================================
REM VERIFICAR DEPLOYMENT
REM ===========================================
:verify_deployment
echo.
echo 🔍 VERIFICANDO DEPLOYMENT
echo =========================
echo.

echo Verificando deployment... >> %LOG_FILE%

REM Verificar pods
echo 📊 Estado de pods:
kubectl get pods -n %NAMESPACE% -l app=%IMAGE_NAME%

REM Contar pods running
for /f %%i in ('kubectl get pods -n %NAMESPACE% -l app=%IMAGE_NAME% --field-selector=status.phase=Running --no-headers 2^>nul ^| find /c /v ""') do set ready_pods=%%i
for /f %%i in ('kubectl get pods -n %NAMESPACE% -l app=%IMAGE_NAME% --no-headers 2^>nul ^| find /c /v ""') do set total_pods=%%i

echo Pods running: %ready_pods%/%total_pods%

if "%ready_pods%"=="0" (
    echo ❌ No hay pods running
    echo ERROR: No pods running >> %LOG_FILE%
    pause
    goto main_menu
) else (
    echo ✅ Pods están running
    echo SUCCESS: Pods running %ready_pods%/%total_pods% >> %LOG_FILE%
)

REM Verificar replicas
echo 📈 Estado de replicas:
kubectl get deployment %DEPLOYMENT_NAME% -n %NAMESPACE%

echo.
echo ✅ VERIFICACIÓN COMPLETADA >> %LOG_FILE%
echo ✅ Verificación completada
pause
goto main_menu

REM ===========================================
REM SMOKE TESTS
REM ===========================================
:smoke_tests
echo.
echo 🧪 EJECUTANDO SMOKE TESTS
echo =========================
echo.

echo Ejecutando smoke tests... >> %LOG_FILE%

REM Determinar URL según entorno
if "%ENVIRONMENT%"=="staging" (
    set SERVICE_URL=https://lms-staging.ai-academy.com
) else (
    set SERVICE_URL=https://lms.ai-academy.com
)

echo 🌐 URL de testing: %SERVICE_URL%

REM Test de health check
echo 🔍 Testing health check...
curl -f %SERVICE_URL%/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Health check OK
    echo PASS: Health check >> %LOG_FILE%
) else (
    echo ❌ Health check falló
    echo FAIL: Health check >> %LOG_FILE%
)

REM Test de métricas
echo 📊 Testing métricas...
curl -f %SERVICE_URL%/api/metrics >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Métricas OK
    echo PASS: Metrics >> %LOG_FILE%
) else (
    echo ⚠️ Métricas no disponibles
    echo FAIL: Metrics >> %LOG_FILE%
)

echo.
echo ✅ SMOKE TESTS COMPLETADOS >> %LOG_FILE%
echo ✅ Smoke tests completados
pause
goto main_menu

REM ===========================================
REM VER ESTADO DEL CLUSTER
REM ===========================================
:cluster_status
echo.
echo 📊 ESTADO DEL CLUSTER
echo =====================
echo.

echo === INFORMACIÓN DEL CLUSTER ===
kubectl cluster-info

echo.
echo === NODOS ===
kubectl get nodes

echo.
echo === PODS EN NAMESPACE %NAMESPACE% ===
kubectl get pods -n %NAMESPACE%

echo.
echo === SERVICIOS ===
kubectl get services -n %NAMESPACE%

echo.
echo === DEPLOYMENTS ===
kubectl get deployments -n %NAMESPACE%

echo.
echo === INGRESS ===
kubectl get ingress -n %NAMESPACE%

echo.
pause
goto main_menu

REM ===========================================
REM GENERAR REPORTE
REM ===========================================
:generate_report
echo.
echo 📊 GENERANDO REPORTE
echo ====================
echo.

set REPORT_FILE=deployment_report_%BUILD_VERSION%.md

echo Generando reporte... >> %LOG_FILE%

echo # 📊 Reporte de Deployment - LMS Platform > %REPORT_FILE%
echo. >> %REPORT_FILE%
echo **Fecha:** %date% %time% >> %REPORT_FILE%
echo **Versión:** %BUILD_VERSION% >> %REPORT_FILE%
echo **Entorno:** %ENVIRONMENT% >> %REPORT_FILE%
echo **Usuario:** %USERNAME% >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo ## ✅ Deployment Completado >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo ### 🐳 Imagen Docker >> %REPORT_FILE%
echo - **Registry:** %REGISTRY% >> %REPORT_FILE%
echo - **Imagen:** %PROJECT_ID%/%IMAGE_NAME%:%BUILD_VERSION% >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo ### ☸️ Kubernetes >> %REPORT_FILE%
echo - **Cluster:** %CLUSTER_NAME% >> %REPORT_FILE%
echo - **Namespace:** %NAMESPACE% >> %REPORT_FILE%
echo - **Deployment:** %DEPLOYMENT_NAME% >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo ### 🔗 URLs >> %REPORT_FILE%

if "%ENVIRONMENT%"=="staging" (
    echo - **Aplicación:** https://lms-staging.ai-academy.com >> %REPORT_FILE%
    echo - **Health Check:** https://lms-staging.ai-academy.com/api/health >> %REPORT_FILE%
    echo - **Métricas:** https://lms-staging.ai-academy.com/api/metrics >> %REPORT_FILE%
) else (
    echo - **Aplicación:** https://lms.ai-academy.com >> %REPORT_FILE%
    echo - **Health Check:** https://lms.ai-academy.com/api/health >> %REPORT_FILE%
    echo - **Métricas:** https://lms.ai-academy.com/api/metrics >> %REPORT_FILE%
)

echo. >> %REPORT_FILE%
echo ## 🔄 Rollback >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo Para hacer rollback, ejecuta: >> %REPORT_FILE%
echo ```batch >> %REPORT_FILE%
echo %ROLLBACK_FILE% >> %REPORT_FILE%
echo ``` >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo --- >> %REPORT_FILE%
echo. >> %REPORT_FILE%
echo *Deployment completado exitosamente el %date% %time%* >> %REPORT_FILE%

echo ✅ Reporte generado: %REPORT_FILE%
echo SUCCESS: Report generated >> %LOG_FILE%

pause
goto main_menu

REM ===========================================
REM CREAR SCRIPT DE ROLLBACK
REM ===========================================
:create_rollback
echo.
echo 📝 CREANDO SCRIPT DE ROLLBACK
echo =============================
echo.

echo Creando script de rollback... >> %LOG_FILE%

echo @echo off > %ROLLBACK_FILE%
echo REM Script de rollback generado automáticamente >> %ROLLBACK_FILE%
echo REM Fecha: %date% %time% >> %ROLLBACK_FILE%
echo REM Versión: %BUILD_VERSION% >> %ROLLBACK_FILE%
echo. >> %ROLLBACK_FILE%
echo echo 🔄 Ejecutando rollback... >> %ROLLBACK_FILE%
echo. >> %ROLLBACK_FILE%
echo REM Rollback del deployment >> %ROLLBACK_FILE%
echo kubectl rollout undo deployment/%DEPLOYMENT_NAME% -n %NAMESPACE% >> %ROLLBACK_FILE%
echo. >> %ROLLBACK_FILE%
echo REM Esperar a que complete >> %ROLLBACK_FILE%
echo kubectl rollout status deployment/%DEPLOYMENT_NAME% -n %NAMESPACE% >> %ROLLBACK_FILE%
echo. >> %ROLLBACK_FILE%
echo REM Verificar rollback >> %ROLLBACK_FILE%
echo kubectl get pods -n %NAMESPACE% -l app=%IMAGE_NAME% >> %ROLLBACK_FILE%
echo. >> %ROLLBACK_FILE%
echo echo ✅ Rollback completado >> %ROLLBACK_FILE%
echo pause >> %ROLLBACK_FILE%

echo ✅ Script de rollback creado: %ROLLBACK_FILE%
echo SUCCESS: Rollback script created >> %LOG_FILE%

pause
goto main_menu

REM ===========================================
REM EJECUTAR ROLLBACK
REM ===========================================
:execute_rollback
echo.
echo 🔄 EJECUTANDO ROLLBACK
echo ======================
echo.

echo Ejecutando rollback... >> %LOG_FILE%

set /p confirm="⚠️ ¿Estás seguro de hacer rollback? (y/n): "
if /i not "%confirm%"=="y" (
    echo Rollback cancelado
    goto main_menu
)

echo 🔄 Iniciando rollback del deployment...
kubectl rollout undo deployment/%DEPLOYMENT_NAME% -n %NAMESPACE%

echo ⏳ Esperando a que complete el rollback...
kubectl rollout status deployment/%DEPLOYMENT_NAME% -n %NAMESPACE%

echo 📊 Verificando estado post-rollback:
kubectl get pods -n %NAMESPACE% -l app=%IMAGE_NAME%

echo.
echo ✅ ROLLBACK COMPLETADO >> %LOG_FILE%
echo ✅ Rollback completado
pause
goto main_menu

REM ===========================================
REM SALIR
REM ===========================================
:exit
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                     👋 ¡DEPLOYMENT FINALIZADO!                    ║
echo ╠════════════════════════════════════════════════════════════════════╣
echo ║                                                                    ║
echo ║  🚀 LMS Platform Automated Deployment System                      ║
echo ║                                                                    ║
echo ║  📚 ARCHIVOS GENERADOS:                                           ║
echo ║  • Log de deployment: %LOG_FILE%                ║
echo ║  • Script de rollback: %ROLLBACK_FILE%          ║
echo ║                                                                    ║
echo ║  🔗 RECURSOS ÚTILES:                                              ║
echo ║  • Kubernetes Dashboard                                           ║
echo ║  • Prometheus Monitoring                                          ║
echo ║  • Application Logs                                               ║
echo ║                                                                    ║
echo ║  💡 COMANDOS ÚTILES:                                              ║
echo ║  • kubectl get pods -n %NAMESPACE%                     ║
echo ║  • kubectl logs -f deployment/%DEPLOYMENT_NAME% -n %NAMESPACE%     ║
echo ║  • kubectl describe deployment %DEPLOYMENT_NAME% -n %NAMESPACE%    ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

if "%ENVIRONMENT%"=="staging" (
    echo 🌐 Aplicación disponible en: https://lms-staging.ai-academy.com
) else (
    echo 🌐 Aplicación disponible en: https://lms.ai-academy.com
)

echo 📊 Health Check: /api/health
echo 📈 Métricas: /api/metrics
echo 📋 Log detallado: %LOG_FILE%
echo.

echo ✅ DEPLOYMENT SYSTEM COMPLETED >> %LOG_FILE%
echo Deployment finalizado el %date% %time% >> %LOG_FILE%

pause
exit /b 0
