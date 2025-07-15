# 📚 Scripts de Creación de Cursos de IA - LMS Platform

Este directorio contiene varios scripts para crear cursos de Inteligencia Artificial en la plataforma LMS.

## 🎯 Cursos Incluidos

Los siguientes 8 cursos serán creados:

1. **Inteligencia Artificial Intermedio** - $299.99
2. **Inteligencia Artificial Avanzado** - $499.99  
3. **Análisis y Visualización de Datos I** - $249.99
4. **Análisis y Visualización de Datos II** - $349.99
5. **Matemáticas Básicas para IA** - $199.99
6. **Álgebra Lineal y NLP** - $379.99
7. **Cálculo Avanzado para IA** - $359.99
8. **Estadística Avanzada y Análisis Multivariado** - $429.99

## 📁 Scripts Disponibles

### 1. `verify-courses.js`
**Propósito:** Verificar cursos y categorías existentes
```bash
node scripts/verify-courses.js
```

### 2. `create-new-ai-courses.js`
**Propósito:** Crear todos los 8 cursos de una vez
```bash
node scripts/create-new-ai-courses.js
```

### 3. `create-courses-individual.js`
**Propósito:** Crear cursos de forma individual
```bash
# Ver opciones disponibles
node scripts/create-courses-individual.js

# Crear un curso específico (ejemplo: curso #1)
node scripts/create-courses-individual.js 1

# Crear todos los cursos
node scripts/create-courses-individual.js 9
```

## 🚀 Archivos de Ejecución (.bat)

### `run-new-courses-safe.bat`
Script interactivo que:
1. Muestra cursos existentes
2. Pregunta si deseas continuar
3. Crea todos los cursos nuevos

### `run-new-courses.bat`
Script directo que crea todos los cursos inmediatamente.

## 📋 Instrucciones de Uso

### Opción 1: Ejecución Segura (Recomendada)
```bash
# Doble clic en el archivo o ejecutar en CMD:
run-new-courses-safe.bat
```

### Opción 2: Verificar Primero
```bash
# 1. Verificar estado actual
node scripts/verify-courses.js

# 2. Crear cursos según necesidad
node scripts/create-new-ai-courses.js
```

### Opción 3: Creación Individual
```bash
# Crear solo el curso de IA Intermedio
node scripts/create-courses-individual.js 1

# Crear solo Matemáticas Básicas
node scripts/create-courses-individual.js 5
```

## 🔧 Requisitos Previos

1. **Base de datos configurada:** Asegúrate de que tu archivo `.env` contenga la URL correcta de la base de datos
2. **Prisma configurado:** Ejecuta `npx prisma generate` si es necesario
3. **Dependencias instaladas:** `npm install`

## 📊 Estructura de Cursos Creados

Cada curso incluye:
- **Información básica:** Título, descripción, precio, imagen
- **Categorías automáticas:** Se crean si no existen
- **Módulos estructurados:** Cada curso tiene módulos específicos según su nivel
- **Estado publicado:** Todos los cursos se crean como publicados
- **Primer módulo gratuito:** Para permitir vista previa

## ⚠️ Notas Importantes

1. **UserID:** Los scripts usan el ID `user_2zX61BkxmcroSdpzKbsGpB9rLaE`. Cambia esto en los scripts si necesitas usar otro usuario.

2. **Imágenes:** Se usan URLs de Unsplash. Puedes cambiarlas por URLs propias editando los scripts.

3. **Precios:** Están en USD. Modifica según tu moneda local si es necesario.

4. **Categorías:** Se crean automáticamente:
   - Inteligencia Artificial
   - Ciencia de Datos  
   - Matemáticas para IA
   - Estadística y Análisis

## 🐛 Solución de Problemas

### Error de conexión a BD
```bash
# Verifica tu archivo .env
# Asegúrate de que DATABASE_URL esté correctamente configurada
```

### Error de Prisma
```bash
# Regenera el cliente de Prisma
npx prisma generate

# Si es necesario, ejecuta migraciones
npx prisma db push
```

### Cursos duplicados
```bash
# Usar el script de verificación primero
node scripts/verify-courses.js

# Eliminar cursos duplicados desde la interfaz web o base de datos
```

## 📞 Soporte

Si encuentras algún problema:
1. Verifica que la base de datos esté funcionando
2. Revisa los logs de error en la consola
3. Asegúrate de que todas las dependencias estén instaladas
4. Verifica que el userID en los scripts sea válido

---

**Autor:** José Pablo  
**Fecha:** Julio 2025  
**Proyecto:** LMS Platform - IA Pacific Labs