@echo off
:MENU
cls
echo ===============================================
echo        GESTION DE CURSOS DE IA - LMS PLATFORM
echo ===============================================
echo.
echo Selecciona una opcion:
echo.
echo 1. Verificar cursos existentes
echo 2. Crear TODOS los cursos nuevos de IA
echo 3. Crear cursos de forma individual
echo 4. Ver lista de cursos disponibles
echo 5. Leer documentacion (README)
echo 6. Salir
echo.
echo ===============================================
set /p option="Ingresa tu opcion (1-6): "

cd "C:\Users\josep\Desktop\IA Pacific Labs\lms-platform"

if "%option%"=="1" goto VERIFY
if "%option%"=="2" goto CREATE_ALL
if "%option%"=="3" goto CREATE_INDIVIDUAL
if "%option%"=="4" goto LIST_COURSES
if "%option%"=="5" goto READ_DOCS
if "%option%"=="6" goto EXIT
goto INVALID

:VERIFY
cls
echo ===============================================
echo              VERIFICANDO CURSOS
echo ===============================================
echo.
node scripts/verify-courses.js
echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:CREATE_ALL
cls
echo ===============================================
echo            CREANDO TODOS LOS CURSOS
echo ===============================================
echo.
echo ⚠️  ATENCION: Se crearan 8 cursos nuevos de IA
echo.
set /p confirm="¿Estas seguro? (s/n): "
if /i "%confirm%"=="s" (
    echo.
    echo Creando cursos...
    node scripts/create-new-ai-courses.js
) else (
    echo Operacion cancelada.
)
echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:CREATE_INDIVIDUAL
cls
echo ===============================================
echo           CREACION INDIVIDUAL DE CURSOS
echo ===============================================
echo.
echo Cursos disponibles:
echo 1. Inteligencia Artificial Intermedio ($299.99)
echo 2. Inteligencia Artificial Avanzado ($499.99)
echo 3. Analisis y Visualizacion de Datos I ($249.99)
echo 4. Analisis y Visualizacion de Datos II ($349.99)
echo 5. Matematicas Basicas para IA ($199.99)
echo 6. Algebra Lineal y NLP ($379.99)
echo 7. Calculo Avanzado para IA ($359.99)
echo 8. Estadistica Avanzada y Analisis Multivariado ($429.99)
echo 9. Crear TODOS los cursos
echo 0. Volver al menu principal
echo.
set /p course_num="Selecciona el numero del curso: "

if "%course_num%"=="0" goto MENU
if "%course_num%"=="9" (
    echo.
    echo Creando todos los cursos...
    node scripts/create-courses-individual.js 9
) else (
    echo.
    echo Creando curso #%course_num%...
    node scripts/create-courses-individual.js %course_num%
)
echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:LIST_COURSES
cls
echo ===============================================
echo              CURSOS DISPONIBLES
echo ===============================================
echo.
echo Los siguientes 8 cursos seran creados:
echo.
echo 📚 INTELIGENCIA ARTIFICIAL:
echo    • IA Intermedio - $299.99 (6 semanas)
echo    • IA Avanzado - $499.99 (8 semanas)
echo.
echo 📊 CIENCIA DE DATOS:
echo    • Analisis y Viz de Datos I - $249.99 (5 semanas)
echo    • Analisis y Viz de Datos II - $349.99 (6 semanas)
echo.
echo 🔢 MATEMATICAS PARA IA:
echo    • Matematicas Basicas - $199.99 (4 semanas)
echo    • Algebra Lineal y NLP - $379.99 (7 semanas)
echo    • Calculo Avanzado - $359.99 (6 semanas)
echo.
echo 📈 ESTADISTICA:
echo    • Estadistica Avanzada y Multivariado - $429.99 (8 semanas)
echo.
echo 💰 VALOR TOTAL DEL CATALOGO: $2,662.92
echo 🎯 TOTAL DE SEMANAS DE CONTENIDO: 50 semanas
echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:READ_DOCS
cls
echo ===============================================
echo               DOCUMENTACION
echo ===============================================
echo.
echo Abriendo README con instrucciones detalladas...
echo.
start notepad "scripts\README.md"
echo.
echo El archivo README se ha abierto en el Bloc de notas.
echo Contiene instrucciones detalladas sobre como usar los scripts.
echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:INVALID
cls
echo ===============================================
echo                   ERROR
echo ===============================================
echo.
echo ❌ Opcion invalida. Por favor selecciona 1-6.
echo.
echo Presiona cualquier tecla para volver al menu...
pause > nul
goto MENU

:EXIT
cls
echo ===============================================
echo                  ADIOS
echo ===============================================
echo.
echo 👋 Gracias por usar el gestor de cursos de IA!
echo.
echo Proyecto: LMS Platform
echo Autor: Jose Pablo
echo Fecha: Julio 2025
echo.
echo 🚀 IA Pacific Labs
echo.
pause
exit

REM Fin del script