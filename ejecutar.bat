@echo off
echo Agregando cursos al LMS...
cd "C:\Users\josep\Desktop\IA Pacific Labs\lms-platform"
node add-courses.js
echo.
echo Presiona cualquier tecla para salir...
pause > nul