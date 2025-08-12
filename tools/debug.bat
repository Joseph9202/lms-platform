@echo off
REM ===========================================
REM LMS PLATFORM DEBUG TOOLKIT - WINDOWS
REM ===========================================
REM Herramienta completa de debugging para Windows

setlocal enabledelayedexpansion

title LMS Platform - Debug Toolkit

color 0A

echo.
echo     ██████╗ ███████╗██████╗ ██╗   ██╗ ██████╗ 
echo     ██╔══██╗██╔════╝██╔══██╗██║   ██║██╔════╝ 
echo     ██║  ██║█████╗  ██████╔╝██║   ██║██║  ███╗
echo     ██║  ██║██╔══╝  ██╔══██╗██║   ██║██║   ██║
echo     ██████╔╝███████╗██████╔╝╚██████╔╝╚██████╔╝
echo     ╚═════╝ ╚══════╝╚═════╝  ╚═════╝  ╚═════╝ 
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║               🔧 LMS PLATFORM DEBUG TOOLKIT                       ║
echo ╠════════════════════════════════════════════════════════════════════╣
echo ║                                                                    ║
echo ║  Herramienta completa de debugging y troubleshooting              ║
echo ║  • Diagnóstico de contenedores Docker                             ║
echo ║  • Análisis de cluster Kubernetes                                 ║
echo ║  • Verificación de conectividad de red                            ║
echo ║  • Análisis de logs y performance                                 ║
echo ║  • Troubleshooting interactivo                                    ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

REM Configuración
set NAMESPACE=lms-platform
set APP_NAME=lms-platform
set LOG_FILE=debug_session_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.log

REM Limpiar espacios en LOG_FILE
set LOG_FILE=%LOG_FILE: =0%

REM Inicializar log
echo # LMS Platform Debug Session - %date% %time% > %LOG_FILE%
echo ================================================= >> %LOG_FILE%
echo. >> %LOG_FILE%

:main_menu
echo 🔧 DEBUG TOOLKIT MENU:
echo.
echo   🐳 DIAGNÓSTICO DOCKER:
echo   1. Diagnosticar contenedores
echo   2. Analizar imágenes Docker
echo   3. Verificar redes Docker
echo   4. Verificar volúmenes Docker
echo.
echo   ☸️ DIAGNÓSTICO KUBERNETES:
echo   5. Estado del cluster
echo   6. Diagnosticar pods
echo   7. Verificar services
echo   8. Analizar eventos
echo.
echo   🌐 CONECTIVIDAD:
echo   9. Test de red
echo   10. Verificar DNS
echo   11. Test de endpoints
echo   12. Conectividad interna
echo.
echo   📊 ANÁLISIS:
echo   13. Analizar logs
echo   14. Performance del sistema
echo   15. Health checks
echo   16. Base de datos
echo.
echo   🔧 TROUBLESHOOTING:
echo   17. Troubleshooting interactivo
echo   18. Reiniciar servicios
echo   19. Limpiar recursos
echo   20. Ver documentación
echo.
echo   📋 UTILIDADES:
echo   21. Generar reporte completo
echo   22. Exportar logs
echo   23. Ver configuración
echo   24. ❌ Salir
echo.

set /p choice="Selecciona una opción (1-24): "

if "%choice%"=="1" goto diagnose_containers
if "%choice%"=="2" goto analyze_images
if "%choice%"=="3" goto verify_networks
if "%choice%"=="4" goto verify_volumes
if "%choice%"=="5" goto cluster_status
if "%choice%"=="6" goto diagnose_pods
if "%choice%"=="7" goto verify_services
if "%choice%"=="8" goto analyze_events
if "%choice%"=="9" goto test_network
if "%choice%"=="10" goto verify_dns
if "%choice%"=="11" goto test_endpoints
if "%choice%"=="12" goto internal_connectivity
if "%choice%"=="13" goto analyze_logs
if "%choice%"=="14" goto system_performance
if "%choice%"=="15" goto health_checks
if "%choice%"=="16" goto database_check
if "%choice%"=="17" goto interactive_troubleshooting
if "%choice%"=="18" goto restart_services
if "%choice%"=="19" goto cleanup_resources
if "%choice%"=="20" goto show_documentation
if "%choice%"=="21" goto generate_report
if "%choice%"=="22" goto export_logs
if "%choice%"=="23" goto show_config
if "%choice%"=="24" goto exit
echo ❌ Opción inválida
pause
goto main_menu

REM ===========================================
REM DIAGNOSTICAR CONTENEDORES
REM ===========================================
:diagnose_containers
echo.
echo 🐳 DIAGNÓSTICO DE CONTENEDORES DOCKER
echo =====================================
echo.

echo Diagnosticando contenedores... >> %LOG_FILE%

echo 📊 Estado de contenedores LMS:
echo === CONTENEDORES LMS === >> %LOG_FILE%
docker ps -a --filter name=lms --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | tee -a %LOG_FILE%

echo.
echo 📈 Uso de recursos:
echo === USO DE RECURSOS === >> %LOG_FILE%
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" | findstr lms | tee -a %LOG_FILE%

echo.
echo 🔍 Inspección detallada:
for /f "tokens=*" %%i in ('docker ps --filter name=lms --format "{{.Names}}"') do (
    echo.
    echo --- CONTAINER: %%i ---
    echo --- CONTAINER: %%i --- >> %LOG_FILE%
    docker inspect %%i --format "{{.State.Status}}: {{.State.Health.Status}}" | tee -a %LOG_FILE%
    
    echo Logs recientes:
    docker logs --tail=10 %%i | tee -a %LOG_FILE%
)

echo.
echo ✅ Diagnóstico de contenedores completado >> %LOG_FILE%
echo ✅ Diagnóstico completado
pause
goto main_menu

REM ===========================================
REM ANALIZAR IMÁGENES DOCKER
REM ===========================================
:analyze_images
echo.
echo 📦 ANÁLISIS DE IMÁGENES DOCKER
echo ==============================
echo.

echo Analizando imágenes... >> %LOG_FILE%

echo 📊 Imágenes LMS disponibles:
echo === IMÁGENES LMS === >> %LOG_FILE%
docker images | findstr lms | tee -a %LOG_FILE%

echo.
echo 📈 Tamaño de imágenes:
echo === TAMAÑO DE IMÁGENES === >> %LOG_FILE%
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | findstr lms | tee -a %LOG_FILE%

echo.
echo 🔍 Historial de capas (última imagen):
for /f "tokens=1" %%i in ('docker images --filter reference=*lms* --format "{{.Repository}}:{{.Tag}}" 2^>nul') do (
    echo --- IMAGEN: %%i ---
    echo --- IMAGEN: %%i --- >> %LOG_FILE%
    docker history %%i | tee -a %LOG_FILE%
    goto :break_image_loop
)
:break_image_loop

echo.
echo ✅ Análisis de imágenes completado >> %LOG_FILE%
echo ✅ Análisis completado
pause
goto main_menu

REM ===========================================
REM ESTADO DEL CLUSTER KUBERNETES
REM ===========================================
:cluster_status
echo.
echo ☸️ ESTADO DEL CLUSTER KUBERNETES
echo ================================
echo.

echo Verificando cluster... >> %LOG_FILE%

REM Verificar que kubectl esté disponible
kubectl version --client >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ kubectl no está disponible
    echo ERROR: kubectl no encontrado >> %LOG_FILE%
    pause
    goto main_menu
)

echo 📊 Información del cluster:
echo === INFORMACIÓN DEL CLUSTER === >> %LOG_FILE%
kubectl cluster-info | tee -a %LOG_FILE%

echo.
echo 🖥️ Estado de nodos:
echo === NODOS === >> %LOG_FILE%
kubectl get nodes -o wide | tee -a %LOG_FILE%

echo.
echo 📦 Namespace %NAMESPACE%:
echo === NAMESPACE === >> %LOG_FILE%
kubectl get namespace %NAMESPACE% | tee -a %LOG_FILE%

echo.
echo 📊 Recursos en namespace:
echo === RECURSOS === >> %LOG_FILE%
kubectl get all -n %NAMESPACE% | tee -a %LOG_FILE%

echo.
echo ✅ Estado del cluster verificado >> %LOG_FILE%
echo ✅ Verificación completada
pause
goto main_menu

REM ===========================================
REM DIAGNOSTICAR PODS
REM ===========================================
:diagnose_pods
echo.
echo 📦 DIAGNÓSTICO DE PODS
echo ======================
echo.

echo Diagnosticando pods... >> %LOG_FILE%

echo 📊 Estado de pods:
echo === PODS === >> %LOG_FILE%
kubectl get pods -n %NAMESPACE% -o wide | tee -a %LOG_FILE%

echo.
echo 🔍 Pods con problemas:
echo === PODS CON PROBLEMAS === >> %LOG_FILE%
kubectl get pods -n %NAMESPACE% --field-selector=status.phase!=Running | tee -a %LOG_FILE%

echo.
echo 📊 Descripción detallada:
for /f "tokens=1" %%i in ('kubectl get pods -n %NAMESPACE% -o name 2^>nul') do (
    echo.
    echo --- POD: %%i ---
    echo --- POD: %%i --- >> %LOG_FILE%
    kubectl describe %%i -n %NAMESPACE% | tee -a %LOG_FILE%
)

echo.
echo ✅ Diagnóstico de pods completado >> %LOG_FILE%
echo ✅ Diagnóstico completado
pause
goto main_menu

REM ===========================================
REM TEST DE RED
REM ===========================================
:test_network
echo.
echo 🌐 TEST DE CONECTIVIDAD DE RED
echo ==============================
echo.

echo Testing conectividad... >> %LOG_FILE%

echo 📊 Test de conectividad externa:
echo === CONECTIVIDAD EXTERNA === >> %LOG_FILE%

REM Test de conectividad básica
set endpoints=google.com github.com registry.hub.docker.com gcr.io

for %%e in (%endpoints%) do (
    ping -n 1 %%e >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Conectividad a %%e: OK
        echo ✅ %%e: OK >> %LOG_FILE%
    ) else (
        echo ❌ Conectividad a %%e: FAIL
        echo ❌ %%e: FAIL >> %LOG_FILE%
    )
)

echo.
echo 🔍 Test de puertos específicos:
echo === TEST DE PUERTOS === >> %LOG_FILE%

REM Test con telnet (si está disponible)
where telnet >nul 2>&1
if %errorlevel% equ 0 (
    echo Testing puerto 443 en google.com...
    echo exit | telnet google.com 443 >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Puerto 443 (HTTPS): OK
        echo ✅ Port 443: OK >> %LOG_FILE%
    ) else (
        echo ❌ Puerto 443 (HTTPS): FAIL
        echo ❌ Port 443: FAIL >> %LOG_FILE%
    )
) else (
    echo ℹ️ Telnet no disponible para test de puertos
    echo INFO: Telnet not available >> %LOG_FILE%
)

echo.
echo ✅ Test de red completado >> %LOG_FILE%
echo ✅ Test completado
pause
goto main_menu

REM ===========================================
REM ANALIZAR LOGS
REM ===========================================
:analyze_logs
echo.
echo 📋 ANÁLISIS DE LOGS
echo ==================
echo.

echo Analizando logs... >> %LOG_FILE%

echo 📊 Opciones de análisis:
echo.
echo   1. Logs de Docker
echo   2. Logs de Kubernetes
echo   3. Logs con filtros
echo   4. Logs en tiempo real
echo   5. Volver al menú principal
echo.

set /p log_choice="Selecciona opción (1-5): "

if "%log_choice%"=="1" (
    echo.
    echo 📋 Logs de contenedores Docker:
    echo === LOGS DOCKER === >> %LOG_FILE%
    
    for /f "tokens=*" %%i in ('docker ps --filter name=lms --format "{{.Names}}"') do (
        echo.
        echo --- LOGS DE %%i ---
        echo --- LOGS DE %%i --- >> %LOG_FILE%
        docker logs --tail=50 %%i | tee -a %LOG_FILE%
    )
)

if "%log_choice%"=="2" (
    echo.
    echo 📋 Logs de pods Kubernetes:
    echo === LOGS KUBERNETES === >> %LOG_FILE%
    
    for /f "tokens=1" %%i in ('kubectl get pods -n %NAMESPACE% -o name 2^>nul') do (
        echo.
        echo --- LOGS DE %%i ---
        echo --- LOGS DE %%i --- >> %LOG_FILE%
        kubectl logs --tail=50 %%i -n %NAMESPACE% | tee -a %LOG_FILE%
    )
)

if "%log_choice%"=="3" (
    echo.
    set /p filter="Ingresa patrón a buscar: "
    echo.
    echo 🔍 Buscando patrón: !filter!
    echo === BÚSQUEDA: !filter! === >> %LOG_FILE%
    
    REM Buscar en logs de Docker
    for /f "tokens=*" %%i in ('docker ps --filter name=lms --format "{{.Names}}"') do (
        docker logs %%i 2>&1 | findstr /i "!filter!" | tee -a %LOG_FILE%
    )
)

if "%log_choice%"=="4" (
    echo.
    echo 📋 Logs en tiempo real (Ctrl+C para salir):
    
    REM Logs en tiempo real de Docker
    for /f "tokens=*" %%i in ('docker ps --filter name=lms --format "{{.Names}}"') do (
        echo Siguiendo logs de %%i...
        docker logs -f %%i
        goto :break_realtime
    )
    :break_realtime
)

if "%log_choice%"=="5" (
    goto main_menu
)

echo.
echo ✅ Análisis de logs completado >> %LOG_FILE%
echo ✅ Análisis completado
pause
goto main_menu

REM ===========================================
REM PERFORMANCE DEL SISTEMA
REM ===========================================
:system_performance
echo.
echo ⚡ ANÁLISIS DE PERFORMANCE
echo =========================
echo.

echo Analizando performance... >> %LOG_FILE%

echo 📊 Performance de contenedores:
echo === PERFORMANCE CONTENEDORES === >> %LOG_FILE%
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" | findstr lms | tee -a %LOG_FILE%

echo.
echo 📈 Performance de Kubernetes:
echo === PERFORMANCE KUBERNETES === >> %LOG_FILE%
kubectl top nodes 2>nul | tee -a %LOG_FILE%
kubectl top pods -n %NAMESPACE% 2>nul | tee -a %LOG_FILE%

echo.
echo 🕐 Test de response time:
echo === RESPONSE TIME === >> %LOG_FILE%

set endpoints=http://localhost:3000/api/health

for %%e in (%endpoints%) do (
    echo Testing %%e...
    curl -o nul -s -w "Response time: %%{time_total}s\n" %%e 2>nul | tee -a %LOG_FILE%
    
    if !errorlevel! neq 0 (
        echo ❌ No se pudo conectar a %%e
        echo ERROR: Could not connect to %%e >> %LOG_FILE%
    )
)

echo.
echo 💾 Uso de disco:
echo === DISK USAGE === >> %LOG_FILE%
docker system df | tee -a %LOG_FILE%

echo.
echo ✅ Análisis de performance completado >> %LOG_FILE%
echo ✅ Análisis completado
pause
goto main_menu

REM ===========================================
REM HEALTH CHECKS
REM ===========================================
:health_checks
echo.
echo 🔍 VERIFICACIÓN DE HEALTH CHECKS
echo ================================
echo.

echo Verificando health checks... >> %LOG_FILE%

echo 📊 Health endpoints:
echo === HEALTH CHECKS === >> %LOG_FILE%

set health_endpoints=http://localhost:3000/api/health https://lms.ai-academy.com/api/health

for %%e in (%health_endpoints%) do (
    echo.
    echo Testing %%e...
    
    curl -s %%e >nul 2>&1
    if !errorlevel! equ 0 (
        echo ✅ Health check %%e: OK
        echo ✅ %%e: OK >> %LOG_FILE%
        
        REM Obtener detalles del health check
        curl -s %%e | tee -a %LOG_FILE%
    ) else (
        echo ❌ Health check %%e: FAIL
        echo ❌ %%e: FAIL >> %LOG_FILE%
    )
)

echo.
echo 📊 Health de pods Kubernetes:
echo === KUBERNETES HEALTH === >> %LOG_FILE%
kubectl get pods -n %NAMESPACE% -o custom-columns=NAME:.metadata.name,READY:.status.containerStatuses[*].ready,STATUS:.status.phase | tee -a %LOG_FILE%

echo.
echo ✅ Verificación completada >> %LOG_FILE%
echo ✅ Verificación completada
pause
goto main_menu

REM ===========================================
REM TROUBLESHOOTING INTERACTIVO
REM ===========================================
:interactive_troubleshooting
echo.
echo 🔧 TROUBLESHOOTING INTERACTIVO
echo ==============================
echo.

:troubleshoot_menu
echo 📋 TROUBLESHOOTING MENU:
echo.
echo   1. 📊 Ver estado general
echo   2. 📋 Logs en tiempo real
echo   3. 🐚 Acceder a container
echo   4. 🔄 Reiniciar deployment
echo   5. 📈 Monitorear recursos
echo   6. 🔍 Describir recurso específico
echo   7. 🌐 Test de conectividad
echo   8. ⬅️ Volver al menú principal
echo.

set /p trouble_choice="Selecciona opción (1-8): "

if "%trouble_choice%"=="1" (
    echo.
    echo 📊 Estado general:
    kubectl get all -n %NAMESPACE% 2>nul || docker ps --filter name=lms
    pause
    goto troubleshoot_menu
)

if "%trouble_choice%"=="2" (
    echo.
    echo 📋 Logs en tiempo real (Ctrl+C para salir):
    
    REM Obtener primer pod disponible
    for /f "tokens=1" %%i in ('kubectl get pods -n %NAMESPACE% -o name 2^>nul') do (
        kubectl logs -f %%i -n %NAMESPACE%
        goto troubleshoot_menu
    )
    
    REM Si no hay Kubernetes, usar Docker
    for /f "tokens=*" %%i in ('docker ps --filter name=lms --format "{{.Names}}"') do (
        docker logs -f %%i
        goto troubleshoot_menu
    )
)

if "%trouble_choice%"=="3" (
    echo.
    echo 🐚 Contenedores disponibles:
    docker ps --filter name=lms --format "{{.Names}}" 2>nul
    kubectl get pods -n %NAMESPACE% 2>nul
    
    set /p container_name="Ingresa nombre del container/pod: "
    
    REM Intentar con Docker primero
    docker exec -it !container_name! /bin/sh 2>nul || kubectl exec -it !container_name! -n %NAMESPACE% -- /bin/sh
    
    goto troubleshoot_menu
)

if "%trouble_choice%"=="4" (
    echo.
    set /p confirm="¿Reiniciar deployment? (y/n): "
    if /i "!confirm!"=="y" (
        kubectl rollout restart deployment/lms-platform-deployment -n %NAMESPACE%
        kubectl rollout status deployment/lms-platform-deployment -n %NAMESPACE%
    )
    goto troubleshoot_menu
)

if "%trouble_choice%"=="5" (
    echo.
    echo 📈 Monitoreando recursos (Ctrl+C para salir):
    
    :monitor_loop
    cls
    echo === RECURSOS EN TIEMPO REAL ===
    docker stats --no-stream | findstr lms
    kubectl top pods -n %NAMESPACE% 2>nul
    timeout /t 2 /nobreak >nul
    goto monitor_loop
)

if "%trouble_choice%"=="6" (
    echo.
    echo 🔍 Recursos disponibles:
    kubectl get all -n %NAMESPACE% 2>nul || docker ps --filter name=lms
    
    set /p resource_name="Ingresa nombre del recurso: "
    kubectl describe !resource_name! -n %NAMESPACE% 2>nul || docker inspect !resource_name!
    
    pause
    goto troubleshoot_menu
)

if "%trouble_choice%"=="7" (
    call :test_network
    goto troubleshoot_menu
)

if "%trouble_choice%"=="8" (
    goto main_menu
)

goto troubleshoot_menu

REM ===========================================
REM GENERAR REPORTE COMPLETO
REM ===========================================
:generate_report
echo.
echo 📊 GENERANDO REPORTE COMPLETO
echo =============================
echo.

set REPORT_FILE=lms_debug_report_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.html
set REPORT_FILE=%REPORT_FILE: =0%

echo Generando reporte... >> %LOG_FILE%

echo ^<!DOCTYPE html^> > %REPORT_FILE%
echo ^<html^>^<head^>^<title^>LMS Platform Debug Report^</title^> >> %REPORT_FILE%
echo ^<style^>body{font-family:Arial,sans-serif;margin:20px;}pre{background:#f4f4f4;padding:10px;border-radius:5px;}^</style^> >> %REPORT_FILE%
echo ^</head^>^<body^> >> %REPORT_FILE%
echo ^<h1^>🔧 LMS Platform Debug Report^</h1^> >> %REPORT_FILE%
echo ^<p^>Generado: %date% %time%^</p^> >> %REPORT_FILE%

echo ^<h2^>📊 Estado de Contenedores^</h2^>^<pre^> >> %REPORT_FILE%
docker ps -a --filter name=lms >> %REPORT_FILE% 2>&1
echo ^</pre^> >> %REPORT_FILE%

echo ^<h2^>☸️ Estado de Kubernetes^</h2^>^<pre^> >> %REPORT_FILE%
kubectl get all -n %NAMESPACE% >> %REPORT_FILE% 2>&1
echo ^</pre^> >> %REPORT_FILE%

echo ^<h2^>📈 Performance^</h2^>^<pre^> >> %REPORT_FILE%
docker stats --no-stream >> %REPORT_FILE% 2>&1
echo ^</pre^> >> %REPORT_FILE%

echo ^<h2^>📋 Logs Recientes^</h2^>^<pre^> >> %REPORT_FILE%
type %LOG_FILE% >> %REPORT_FILE%
echo ^</pre^> >> %REPORT_FILE%

echo ^</body^>^</html^> >> %REPORT_FILE%

echo ✅ Reporte generado: %REPORT_FILE%
echo SUCCESS: Report generated >> %LOG_FILE%

REM Abrir reporte en browser
start %REPORT_FILE%

pause
goto main_menu

REM ===========================================
REM MOSTRAR CONFIGURACIÓN
REM ===========================================
:show_config
echo.
echo ⚙️ CONFIGURACIÓN ACTUAL
echo =======================
echo.

echo 📊 Configuración de debugging:
echo   • Namespace: %NAMESPACE%
echo   • App Name: %APP_NAME%
echo   • Log File: %LOG_FILE%
echo.

echo 🐳 Configuración Docker:
docker version 2>nul || echo Docker no disponible

echo.
echo ☸️ Configuración Kubernetes:
kubectl version --client 2>nul || echo kubectl no disponible

echo.
echo 🌐 Configuración de red:
ipconfig | findstr "IPv4"

pause
goto main_menu

REM ===========================================
REM SALIR
REM ===========================================
:exit
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                     👋 ¡DEBUG FINALIZADO!                        ║
echo ╠════════════════════════════════════════════════════════════════════╣
echo ║                                                                    ║
echo ║  🔧 LMS Platform Debug Toolkit completado                         ║
echo ║                                                                    ║
echo ║  📚 ARCHIVOS GENERADOS:                                           ║
echo ║  • Log de sesión: %LOG_FILE%               ║
echo ║                                                                    ║
echo ║  💡 HERRAMIENTAS DISPONIBLES:                                     ║
echo ║  • Docker debug toolkit                                           ║
echo ║  • Kubernetes troubleshooting                                     ║
echo ║  • Network connectivity tests                                     ║
echo ║  • Performance analysis                                           ║
echo ║  • Log analysis tools                                             ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo Debug finalizado el %date% %time% >> %LOG_FILE%
echo ✅ Sesión de debugging completada
echo 📋 Log detallado disponible en: %LOG_FILE%

pause
exit /b 0
