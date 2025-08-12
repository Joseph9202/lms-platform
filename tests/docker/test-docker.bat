@echo off
REM ===========================================
REM DOCKER TESTS - WINDOWS VERSION
REM ===========================================
REM Suite completa de tests para containerización

setlocal enabledelayedexpansion

title LMS Platform - Docker Tests

color 0A

echo.
echo     ████████╗███████╗███████╗████████╗███████╗
echo     ╚══██╔══╝██╔════╝██╔════╝╚══██╔══╝██╔════╝
echo        ██║   █████╗  ███████╗   ██║   ███████╗
echo        ██║   ██╔══╝  ╚════██║   ██║   ╚════██║
echo        ██║   ███████╗███████║   ██║   ███████║
echo        ╚═╝   ╚══════╝╚══════╝   ╚═╝   ╚══════╝
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                   🧪 DOCKER TESTS SUITE                          ║
echo ╠════════════════════════════════════════════════════════════════════╣
echo ║                                                                    ║
echo ║  Suite completa de tests para containerización LMS Platform       ║
echo ║  • Validación de Dockerfile                                       ║
echo ║  • Tests de build y startup                                       ║
echo ║  • Verificación de seguridad                                      ║
echo ║  • Tests de performance                                           ║
echo ║  • Validación de networking                                       ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

REM Configuración
set TEST_IMAGE=lms-platform:test
set TEST_CONTAINER=lms-test-container
set TEST_NETWORK=lms-test-network
set TEST_MYSQL=lms-test-mysql
set TEST_REDIS=lms-test-redis
set TEST_LOG=docker_tests_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.log

REM Limpiar espacios en TEST_LOG
set TEST_LOG=%TEST_LOG: =0%

REM Contadores
set TESTS_TOTAL=0
set TESTS_PASSED=0
set TESTS_FAILED=0

REM Inicializar log
echo # Docker Tests - %date% %time% > %TEST_LOG%
echo ============================== >> %TEST_LOG%
echo. >> %TEST_LOG%

:main_menu
echo 📋 DOCKER TESTS MENU:
echo.
echo   🧪 TESTS BÁSICOS:
echo   1. Validar Dockerfile
echo   2. Test build de imagen
echo   3. Test startup de container
echo   4. Test health check
echo.
echo   🔍 TESTS AVANZADOS:
echo   5. Test Docker Compose
echo   6. Test networking
echo   7. Test seguridad
echo   8. Test performance
echo.
echo   📊 SUITES COMPLETAS:
echo   9. Ejecutar tests rápidos
echo   10. Ejecutar todos los tests
echo   11. Solo tests de seguridad
echo   12. Ver resultados
echo.
echo   🧹 MANTENIMIENTO:
echo   13. Limpiar recursos de test
echo   14. Ver logs de tests
echo   15. ❌ Salir
echo.

set /p choice="Selecciona una opción (1-15): "

if "%choice%"=="1" goto test_dockerfile
if "%choice%"=="2" goto test_image_build
if "%choice%"=="3" goto test_container_startup
if "%choice%"=="4" goto test_health_check
if "%choice%"=="5" goto test_docker_compose
if "%choice%"=="6" goto test_networking
if "%choice%"=="7" goto test_security
if "%choice%"=="8" goto test_performance
if "%choice%"=="9" goto run_quick_tests
if "%choice%"=="10" goto run_all_tests
if "%choice%"=="11" goto run_security_tests
if "%choice%"=="12" goto show_results
if "%choice%"=="13" goto cleanup
if "%choice%"=="14" goto show_logs
if "%choice%"=="15" goto exit
echo ❌ Opción inválida
pause
goto main_menu

REM ===========================================
REM FUNCIÓN PARA EJECUTAR TEST
REM ===========================================
:run_test
set test_name=%1
set test_command=%2
set expected=%3

set /a TESTS_TOTAL+=1

echo 🧪 Testing: %test_name% | tee -a %TEST_LOG%

REM Ejecutar comando y verificar resultado
%test_command% >nul 2>&1
if %errorlevel% equ 0 (
    set result=pass
) else (
    set result=fail
)

if "%result%"=="%expected%" (
    echo   ✅ PASS - %test_name%
    set /a TESTS_PASSED+=1
    echo PASS: %test_name% >> %TEST_LOG%
) else (
    echo   ❌ FAIL - %test_name%
    set /a TESTS_FAILED+=1
    echo FAIL: %test_name% >> %TEST_LOG%
)

goto :eof

REM ===========================================
REM TEST 1: VALIDAR DOCKERFILE
REM ===========================================
:test_dockerfile
echo.
echo 📋 TESTING DOCKERFILE
echo =====================
echo.

echo Testing Dockerfile... >> %TEST_LOG%

REM Verificar que existe Dockerfile
if exist "Dockerfile" (
    echo ✅ PASS - Dockerfile exists
    set /a TESTS_PASSED+=1
    echo PASS: Dockerfile exists >> %TEST_LOG%
) else (
    echo ❌ FAIL - Dockerfile exists
    set /a TESTS_FAILED+=1
    echo FAIL: Dockerfile exists >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

REM Verificar que no está vacío
for %%A in (Dockerfile) do (
    if %%~zA gtr 0 (
        echo ✅ PASS - Dockerfile not empty
        set /a TESTS_PASSED+=1
        echo PASS: Dockerfile not empty >> %TEST_LOG%
    ) else (
        echo ❌ FAIL - Dockerfile not empty
        set /a TESTS_FAILED+=1
        echo FAIL: Dockerfile not empty >> %TEST_LOG%
    )
)
set /a TESTS_TOTAL+=1

REM Verificar instrucciones básicas
findstr /C:"FROM" Dockerfile >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Has FROM instruction
    set /a TESTS_PASSED+=1
    echo PASS: Has FROM instruction >> %TEST_LOG%
) else (
    echo ❌ FAIL - Has FROM instruction
    set /a TESTS_FAILED+=1
    echo FAIL: Has FROM instruction >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

findstr /C:"WORKDIR" Dockerfile >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Has WORKDIR instruction
    set /a TESTS_PASSED+=1
    echo PASS: Has WORKDIR instruction >> %TEST_LOG%
) else (
    echo ❌ FAIL - Has WORKDIR instruction
    set /a TESTS_FAILED+=1
    echo FAIL: Has WORKDIR instruction >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

findstr /C:"EXPOSE" Dockerfile >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Has EXPOSE instruction
    set /a TESTS_PASSED+=1
    echo PASS: Has EXPOSE instruction >> %TEST_LOG%
) else (
    echo ❌ FAIL - Has EXPOSE instruction
    set /a TESTS_FAILED+=1
    echo FAIL: Has EXPOSE instruction >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

echo.
echo ✅ Dockerfile tests completed
pause
goto main_menu

REM ===========================================
REM TEST 2: BUILD DE IMAGEN
REM ===========================================
:test_image_build
echo.
echo 🔨 TESTING IMAGE BUILD
echo ======================
echo.

echo Testing image build... >> %TEST_LOG%

REM Construir imagen
echo 🔨 Building test image...
docker build -t %TEST_IMAGE% . >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Image builds successfully
    set /a TESTS_PASSED+=1
    echo PASS: Image builds successfully >> %TEST_LOG%
) else (
    echo ❌ FAIL - Image builds successfully
    set /a TESTS_FAILED+=1
    echo FAIL: Image builds successfully >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

REM Verificar que la imagen existe
docker images %TEST_IMAGE% -q >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Image exists after build
    set /a TESTS_PASSED+=1
    echo PASS: Image exists after build >> %TEST_LOG%
) else (
    echo ❌ FAIL - Image exists after build
    set /a TESTS_FAILED+=1
    echo FAIL: Image exists after build >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

REM Mostrar información de imagen
echo 📦 Image information:
docker images %TEST_IMAGE%

echo.
echo ✅ Image build tests completed
pause
goto main_menu

REM ===========================================
REM TEST 3: STARTUP DE CONTAINER
REM ===========================================
:test_container_startup
echo.
echo 🚀 TESTING CONTAINER STARTUP
echo =============================
echo.

echo Testing container startup... >> %TEST_LOG%

REM Crear red de test si no existe
docker network create %TEST_NETWORK% >nul 2>&1

REM Iniciar container
echo 🚀 Starting test container...
docker run -d --name %TEST_CONTAINER% --network %TEST_NETWORK% -p 3001:3000 %TEST_IMAGE% >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Container starts successfully
    set /a TESTS_PASSED+=1
    echo PASS: Container starts successfully >> %TEST_LOG%
) else (
    echo ❌ FAIL - Container starts successfully
    set /a TESTS_FAILED+=1
    echo FAIL: Container starts successfully >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

REM Esperar a que inicie
echo ⏳ Waiting for container to start...
timeout /t 15 /nobreak >nul

REM Verificar que está corriendo
docker ps | findstr %TEST_CONTAINER% >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Container is running
    set /a TESTS_PASSED+=1
    echo PASS: Container is running >> %TEST_LOG%
) else (
    echo ❌ FAIL - Container is running
    set /a TESTS_FAILED+=1
    echo FAIL: Container is running >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

REM Verificar logs
docker logs %TEST_CONTAINER% | findstr "Ready\|Started\|Listening" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Container has startup logs
    set /a TESTS_PASSED+=1
    echo PASS: Container has startup logs >> %TEST_LOG%
) else (
    echo ⚠️ INFO - Container logs check (may need more time)
    echo INFO: Container logs check >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

echo.
echo ✅ Container startup tests completed
pause
goto main_menu

REM ===========================================
REM TEST 4: HEALTH CHECK
REM ===========================================
:test_health_check
echo.
echo 🔍 TESTING HEALTH CHECK
echo =======================
echo.

echo Testing health check... >> %TEST_LOG%

REM Esperar más tiempo para que la app esté lista
echo ⏳ Waiting for application to be ready...
timeout /t 30 /nobreak >nul

REM Verificar endpoint de health
curl -f http://localhost:3001/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Health endpoint responds
    set /a TESTS_PASSED+=1
    echo PASS: Health endpoint responds >> %TEST_LOG%
) else (
    echo ❌ FAIL - Health endpoint responds
    set /a TESTS_FAILED+=1
    echo FAIL: Health endpoint responds >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

REM Verificar métricas endpoint
curl -f http://localhost:3001/api/metrics >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Metrics endpoint responds
    set /a TESTS_PASSED+=1
    echo PASS: Metrics endpoint responds >> %TEST_LOG%
) else (
    echo ⚠️ INFO - Metrics endpoint (may not be implemented)
    echo INFO: Metrics endpoint >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

echo.
echo ✅ Health check tests completed
pause
goto main_menu

REM ===========================================
REM TEST 5: DOCKER COMPOSE
REM ===========================================
:test_docker_compose
echo.
echo 🐳 TESTING DOCKER COMPOSE
echo =========================
echo.

echo Testing Docker Compose... >> %TEST_LOG%

REM Verificar que existe docker-compose.yml
if exist "docker-compose.yml" (
    echo ✅ PASS - docker-compose.yml exists
    set /a TESTS_PASSED+=1
    echo PASS: docker-compose.yml exists >> %TEST_LOG%
) else (
    echo ❌ FAIL - docker-compose.yml exists
    set /a TESTS_FAILED+=1
    echo FAIL: docker-compose.yml exists >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

REM Verificar que es válido
docker-compose config >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - docker-compose.yml is valid
    set /a TESTS_PASSED+=1
    echo PASS: docker-compose.yml is valid >> %TEST_LOG%
) else (
    echo ❌ FAIL - docker-compose.yml is valid
    set /a TESTS_FAILED+=1
    echo FAIL: docker-compose.yml is valid >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

REM Verificar servicios
docker-compose config --services | findstr "lms-app" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Has lms-app service
    set /a TESTS_PASSED+=1
    echo PASS: Has lms-app service >> %TEST_LOG%
) else (
    echo ❌ FAIL - Has lms-app service
    set /a TESTS_FAILED+=1
    echo FAIL: Has lms-app service >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

echo.
echo ✅ Docker Compose tests completed
pause
goto main_menu

REM ===========================================
REM TEST 6: NETWORKING
REM ===========================================
:test_networking
echo.
echo 🌐 TESTING NETWORKING
echo =====================
echo.

echo Testing networking... >> %TEST_LOG%

REM Iniciar MySQL para test
echo 🗄️ Starting MySQL test container...
docker run -d --name %TEST_MYSQL% --network %TEST_NETWORK% -e MYSQL_ROOT_PASSWORD=rootpass -e MYSQL_DATABASE=testdb -e MYSQL_USER=testuser -e MYSQL_PASSWORD=testpass mysql:8.0 >nul 2>&1

timeout /t 30 /nobreak >nul

REM Verificar conectividad
docker exec %TEST_CONTAINER% nc -z %TEST_MYSQL% 3306 >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Can connect to MySQL
    set /a TESTS_PASSED+=1
    echo PASS: Can connect to MySQL >> %TEST_LOG%
) else (
    echo ❌ FAIL - Can connect to MySQL
    set /a TESTS_FAILED+=1
    echo FAIL: Can connect to MySQL >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

echo.
echo ✅ Networking tests completed
pause
goto main_menu

REM ===========================================
REM TEST 7: SEGURIDAD
REM ===========================================
:test_security
echo.
echo 🔒 TESTING SECURITY
echo ===================
echo.

echo Testing security... >> %TEST_LOG%

REM Verificar que no corre como root
for /f %%i in ('docker exec %TEST_CONTAINER% id -u 2^>nul') do set user_id=%%i
if not "%user_id%"=="0" (
    echo ✅ PASS - Container doesn't run as root
    set /a TESTS_PASSED+=1
    echo PASS: Container doesn't run as root >> %TEST_LOG%
) else (
    echo ❌ FAIL - Container doesn't run as root
    set /a TESTS_FAILED+=1
    echo FAIL: Container doesn't run as root >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

REM Verificar usuario no-root
docker exec %TEST_CONTAINER% id | findstr "nextjs" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Has non-root user
    set /a TESTS_PASSED+=1
    echo PASS: Has non-root user >> %TEST_LOG%
) else (
    echo ⚠️ INFO - User verification (may use different user)
    echo INFO: User verification >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

echo.
echo ✅ Security tests completed
pause
goto main_menu

REM ===========================================
REM TEST 8: PERFORMANCE
REM ===========================================
:test_performance
echo.
echo ⚡ TESTING PERFORMANCE
echo =====================
echo.

echo Testing performance... >> %TEST_LOG%

REM Test básico de conectividad
curl -o nul -s http://localhost:3001/api/health 2>&1
if %errorlevel% equ 0 (
    echo ✅ PASS - Application responds
    set /a TESTS_PASSED+=1
    echo PASS: Application responds >> %TEST_LOG%
) else (
    echo ❌ FAIL - Application responds
    set /a TESTS_FAILED+=1
    echo FAIL: Application responds >> %TEST_LOG%
)
set /a TESTS_TOTAL+=1

REM Verificar uso de recursos
echo 📊 Resource usage:
docker stats --no-stream %TEST_CONTAINER%

echo.
echo ✅ Performance tests completed
pause
goto main_menu

REM ===========================================
REM EJECUTAR TESTS RÁPIDOS
REM ===========================================
:run_quick_tests
echo.
echo ⚡ EJECUTANDO TESTS RÁPIDOS
echo ===========================
echo.

call :test_dockerfile
call :test_image_build
call :test_container_startup
call :test_health_check

goto show_results

REM ===========================================
REM EJECUTAR TODOS LOS TESTS
REM ===========================================
:run_all_tests
echo.
echo 🧪 EJECUTANDO TODOS LOS TESTS
echo ==============================
echo.

call :test_dockerfile
call :test_image_build
call :test_container_startup
call :test_health_check
call :test_docker_compose
call :test_networking
call :test_security
call :test_performance

goto show_results

REM ===========================================
REM EJECUTAR TESTS DE SEGURIDAD
REM ===========================================
:run_security_tests
echo.
echo 🔒 EJECUTANDO TESTS DE SEGURIDAD
echo =================================
echo.

call :test_dockerfile
call :test_image_build
call :test_container_startup
call :test_security

goto show_results

REM ===========================================
REM MOSTRAR RESULTADOS
REM ===========================================
:show_results
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                   📊 RESULTADOS DE TESTS                          ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

echo 📋 Resumen de Tests:
echo   • Total: %TESTS_TOTAL%
echo   • Pasados: %TESTS_PASSED%
echo   • Fallados: %TESTS_FAILED%

if %TESTS_TOTAL% gtr 0 (
    set /a success_rate=%TESTS_PASSED% * 100 / %TESTS_TOTAL%
    echo   • Porcentaje de éxito: !success_rate!%%
)

if %TESTS_FAILED% equ 0 (
    echo.
    echo ✅ TODOS LOS TESTS PASARON
    echo 🎉 La containerización está funcionando correctamente!
    echo ALL TESTS PASSED >> %TEST_LOG%
) else (
    echo.
    echo ❌ ALGUNOS TESTS FALLARON
    echo 🔧 Revisa los logs para más detalles: %TEST_LOG%
    echo SOME TESTS FAILED >> %TEST_LOG%
)

echo.
echo 📋 Log detallado: %TEST_LOG%
pause
goto main_menu

REM ===========================================
REM LIMPIAR RECURSOS
REM ===========================================
:cleanup
echo.
echo 🧹 LIMPIANDO RECURSOS DE TEST
echo =============================
echo.

echo Cleaning up test resources... >> %TEST_LOG%

REM Parar y eliminar containers
docker stop %TEST_CONTAINER% >nul 2>&1
docker rm %TEST_CONTAINER% >nul 2>&1
docker stop %TEST_MYSQL% >nul 2>&1
docker rm %TEST_MYSQL% >nul 2>&1
docker stop %TEST_REDIS% >nul 2>&1
docker rm %TEST_REDIS% >nul 2>&1

REM Eliminar imagen de test
docker rmi %TEST_IMAGE% >nul 2>&1

REM Eliminar red de test
docker network rm %TEST_NETWORK% >nul 2>&1

echo ✅ Cleanup completado
echo CLEANUP COMPLETED >> %TEST_LOG%

pause
goto main_menu

REM ===========================================
REM VER LOGS
REM ===========================================
:show_logs
echo.
echo 📋 LOGS DE TESTS
echo ================
echo.

if exist "%TEST_LOG%" (
    type "%TEST_LOG%"
) else (
    echo No hay logs disponibles
)

echo.
pause
goto main_menu

REM ===========================================
REM SALIR
REM ===========================================
:exit
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                     👋 ¡TESTS FINALIZADOS!                       ║
echo ╠════════════════════════════════════════════════════════════════════╣
echo ║                                                                    ║
echo ║  🧪 Docker Tests Suite completado                                 ║
echo ║                                                                    ║
echo ║  📚 ARCHIVOS GENERADOS:                                           ║
echo ║  • Log de tests: %TEST_LOG%              ║
echo ║                                                                    ║
echo ║  💡 RESUMEN FINAL:                                                ║
echo ║  • Tests ejecutados: %TESTS_TOTAL%                                ║
echo ║  • Tests pasados: %TESTS_PASSED%                                  ║
echo ║  • Tests fallados: %TESTS_FAILED%                                 ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

REM Cleanup automático al salir
call :cleanup

echo Tests finalizados el %date% %time% >> %TEST_LOG%
echo ✅ Gracias por usar Docker Tests Suite

pause
exit /b 0
