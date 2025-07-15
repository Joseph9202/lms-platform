@echo off
echo Ejecutando script para crear nuevos cursos de IA...
echo.

cd "C:\Users\josep\Desktop\IA Pacific Labs\lms-platform"
node scripts/create-new-ai-courses.js

echo.
echo Script completado. Presiona cualquier tecla para salir...
pause > nul
