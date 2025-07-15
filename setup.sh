#!/bin/bash

echo "🚀 Configurando el proyecto LMS Platform..."

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instala Node.js primero."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor, instala npm primero."
    exit 1
fi

echo "✅ Node.js y npm están instalados"

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error al instalar dependencias"
    exit 1
fi

# Generar cliente de Prisma
echo "🗄️ Generando cliente de Prisma..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Cliente de Prisma generado correctamente"
else
    echo "❌ Error al generar cliente de Prisma"
    exit 1
fi

echo ""
echo "🎉 ¡Proyecto configurado exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura las variables de entorno en el archivo .env"
echo "2. Ejecuta 'npx prisma db push' para configurar la base de datos"
echo "3. Ejecuta 'npm run dev' para iniciar el servidor de desarrollo"
echo ""
echo "📖 Lee el README.md para instrucciones detalladas"