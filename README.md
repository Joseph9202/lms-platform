# LMS Platform - Learning Management System

Este es un proyecto completo de una plataforma LMS (Learning Management System) construida con Next.js 13, React, TypeScript, Prisma, MySQL, Stripe y muchas otras tecnologías modernas.

## 🚀 Características

- 🎯 **Autenticación completa** con Clerk
- 📚 **Gestión de cursos** - Crear, editar, publicar cursos
- 🎥 **Videos con Mux o Google Cloud Storage** - Streaming optimizado y almacenamiento escalable
- 💳 **Pagos con Stripe** - Procesamiento seguro de pagos
- 📊 **Dashboard del estudiante** - Progreso y estadísticas
- 📱 **Diseño responsivo** - Compatible con todos los dispositivos
- 🔍 **Búsqueda y filtros** - Encuentra cursos fácilmente
- 📄 **Sistema de archivos adjuntos**
- 🏆 **Progreso del estudiante** - Seguimiento detallado
- 🎬 **Reproductor de video avanzado** - Controles personalizados, velocidad variable, fullscreen
- 📈 **Analytics de video** - Tracking de progreso automático
- 📈 **Cloud SQL Auto-Escalable** - Crece automáticamente con tus estudiantes

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Next.js 13, React, TypeScript, Tailwind CSS
- **Base de datos:** Cloud SQL (MySQL) con auto-escalado
- **Autenticación:** Clerk
- **Pagos:** Stripe
- **Video:** Mux + Google Cloud Storage (híbrido)
- **Archivos:** UploadThing
- **UI Components:** Radix UI, Lucide React
- **Formularios:** React Hook Form + Zod
- **Almacenamiento:** Google Cloud Storage para videos escalables

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- Node.js (versión 18 o superior)
- npm o yarn
- Cuenta de Google Cloud con Cloud SQL configurado
- Google Cloud CLI (para configuración)

## ⚡ Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   # o
   yarn install
   ```

2. **Configurar Cloud SQL (NUEVO - Auto-escalable):**
   
   ```bash
   # Opción 1: Configuración automática
   .\START-HERE.bat
   
   # Opción 2: NPM script
   npm run cloud-sql:auto-scale
   
   # Opción 3: Manual
   node setup-simple-cloud-sql.js
   ```

3. **Configurar variables de entorno:**
   
   ```bash
   # El script anterior genera .env.production
   # Copiarlo a .env principal
   copy .env.production .env
   
   # Agregar tu configuración existente:
   # - Clerk keys
   # - Stripe keys  
   # - Google Cloud Storage
   # - Mux (opcional)
   # - UploadThing
   ```

4. **Aplicar schema a Cloud SQL:**
   ```bash
   # Ya incluido en la configuración automática
   # O ejecutar manualmente:
   npx prisma db push
   ```

5. **Ejecutar el proyecto:**
   ```bash
   npm run dev
   # o
   yarn dev
   ```

6. **Abrir en el navegador:**
   
   Ve a [http://localhost:3000](http://localhost:3000)

## 🔧 Configuración de Servicios

### Google Cloud Storage (Videos) - NUEVO ⭐
1. **Configuración automática:**
   ```bash
   ./setup-gcs.bat  # Instalación y configuración guiada
   ```

2. **Configuración manual:**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un proyecto nuevo
   - Habilita Cloud Storage API
   - Crea Service Account con rol Storage Admin
   - Descarga credenciales JSON
   - Crea bucket para videos
   - Ver guía completa: `GOOGLE_CLOUD_SETUP.md`

3. **Probar configuración:**
   ```bash
   node test-gcs.js
   ```

### Clerk (Autenticación)
1. Ve a [clerk.com](https://clerk.com)
2. Crea una cuenta y una nueva aplicación
3. Copia las claves API al archivo `.env`

### Mux (Videos - Opcional)
1. Ve a [mux.com](https://mux.com)
2. Crea una cuenta
3. Genera tokens de API en la sección de configuración
4. Agrega las claves al archivo `.env`

### Stripe (Pagos)
1. Ve a [stripe.com](https://stripe.com)
2. Crea una cuenta
3. Obtén las claves de API en el dashboard
4. Configura webhooks para eventos de pagos

### UploadThing (Archivos)
1. Ve a [uploadthing.com](https://uploadthing.com)
2. Crea una cuenta
3. Obtén las claves de API

### Base de datos MySQL

Puedes usar:
- **Local:** Instala MySQL en tu máquina
- **En la nube:** 
  - [PlanetScale](https://planetscale.com)
  - [MySQL en Railway](https://railway.app)
  - [Amazon RDS](https://aws.amazon.com/rds/)

## 📚 Estructura del Proyecto

```
lms-platform/
├── app/
│   ├── (auth)/                     # Rutas de autenticación
│   ├── (dashboard)/                # Dashboard principal
│   ├── api/
│   │   ├── upload/video/           # API subida de videos (NUEVO)
│   │   └── chapters/[id]/          # API progreso capítulos (NUEVO)
│   ├── globals.css                 # Estilos globales
│   ├── layout.tsx                  # Layout principal
│   └── page.tsx                    # Página de inicio
├── components/
│   ├── video-upload.tsx            # Subida de videos (NUEVO)
│   ├── video-player.tsx            # Reproductor avanzado (NUEVO)
│   ├── chapter-video-manager.tsx   # Gestor completo (NUEVO)
│   └── ...                         # Otros componentes
├── lib/
│   ├── google-cloud/               # Configuración GCS (NUEVO)
│   └── ...                         # Otras utilidades
├── hooks/
│   ├── use-video-progress.ts       # Hook progreso video (NUEVO)
│   └── ...                         # Otros hooks
├── prisma/                         # Esquema de base de datos
├── scripts/                        # Scripts de cursos
├── public/                         # Archivos estáticos
├── GOOGLE_CLOUD_SETUP.md          # Guía GCS (NUEVO)
├── GCS_IMPLEMENTATION_SUMMARY.md  # Resumen GCS (NUEVO)
└── ...
```

## 🎯 Funcionalidades Principales

### Para Instructores:
- ✅ Crear y gestionar cursos
- ✅ **Subir videos a Google Cloud Storage** (NUEVO)
- ✅ **Reproductor con controles avanzados** (NUEVO)
- ✅ Configurar precios
- ✅ Ver analytics y ventas
- ✅ Gestionar capítulos
- ✅ **Seguimiento de progreso de video** (NUEVO)

### Para Estudiantes:
- ✅ Explorar cursos disponibles
- ✅ Comprar cursos
- ✅ **Ver progreso de video automático** (NUEVO)
- ✅ **Reproductor con velocidad variable** (NUEVO)
- ✅ Acceder a materiales
- ✅ Marcar lecciones como completadas

## 🎥 Sistema de Videos Híbrido (NUEVO)

### Opciones de Video:
1. **Google Cloud Storage** (Recomendado para nuevos videos)
   - ✅ Costo ultra-bajo (~$0.02/GB/mes)
   - ✅ Escalabilidad global
   - ✅ Control total de archivos
   - ✅ URLs directas optimizadas

2. **Mux** (Compatible con videos existentes)
   - ✅ Procesamiento automático
   - ✅ Streaming adaptivo
   - ✅ Analytics avanzados

### Uso en Componentes:
```tsx
import { ChapterVideoManager } from "@/components/chapter-video-manager";

// En tu página de capítulo:
<ChapterVideoManager
  chapterId={chapterId}
  userId={userId}
  isOwner={isOwner}
  initialVideoUrl={chapter.videoUrl}
  chapterTitle={chapter.title}
/>
```

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run start

# Linting
npm run lint

# Cloud SQL (NUEVO - Auto-escalable)
npm run cloud-sql:setup      # Configurar Cloud SQL
npm run cloud-sql:auto-scale # Script completo con menú
npm run cloud-sql:test       # Probar conexión

# Base de datos
npm run db:migrate           # Aplicar cambios
npm run db:studio            # Interfaz visual
npm run db:generate          # Generar cliente

# Scripts Windows
.\START-HERE.bat             # Configuración principal
.\setup-auto-scale.bat       # Auto-escalado
.\curso-manager.bat          # Gestionar cursos
```

## 🎬 Gestión de Cursos Automatizada (NUEVO)

### Cursos Pre-configurados:
- ✅ **Inteligencia Artificial Intermedio** - $299.99
- ✅ **Inteligencia Artificial Avanzado** - $499.99  
- ✅ **Análisis y Visualización de Datos I** - $249.99
- ✅ **Análisis y Visualización de Datos II** - $349.99
- ✅ **Matemáticas Básicas para IA** - $199.99
- ✅ **Álgebra Lineal y NLP** - $379.99
- ✅ **Cálculo Avanzado para IA** - $359.99
- ✅ **Estadística Avanzada y Análisis Multivariado** - $429.99

### Agregar cursos:
```bash
# Menú interactivo
./curso-manager.bat

# Agregar todos los cursos de una vez
node add-courses.js

# Verificar cursos existentes
node scripts/verify-courses.js
```

## 📈 Escalado Automático (NUEVO)

### Configuración Auto-Escalable:
- ✅ **Empieza pequeño** - ~$10-15/mes
- ✅ **Crece con demanda** - CPU/RAM/Storage automático
- ✅ **Sin sobre-provisioning** - Pagas solo lo que usas
- ✅ **Backup automático** incluido

### Configuración por Crecimiento:
```
0-1K estudiantes:    $10-15/mes
1K-5K estudiantes:   $60-80/mes  
5K+ estudiantes:     $120-350/mes
```

### Configurar Auto-Escalado:
```bash
# Configuración automática completa
.\START-HERE.bat

# O con NPM
npm run cloud-sql:auto-scale
```

## 🔄 Comandos Útiles de Prisma

```bash
# Ver la base de datos en interfaz visual
npx prisma studio

# Resetear la base de datos (¡CUIDADO!)
npx prisma migrate reset

# Generar el cliente después de cambios en schema
npx prisma generate
```

## 🐛 Solución de Problemas

### Error de conexión a la base de datos
- Verifica que MySQL esté ejecutándose
- Comprueba la cadena de conexión en `.env`
- Asegúrate de que la base de datos existe

### Problemas con Clerk
- Verifica las claves API
- Asegúrate de que las URLs de redirección estén configuradas

### Videos no se reproducen (Mux)
- Verifica las credenciales de Mux
- Comprueba que los videos estén procesados en Mux

### Problemas con Google Cloud Storage (NUEVO)
```bash
# Ejecutar diagnóstico automático
node test-gcs.js

# Verificar configuración paso a paso
./setup-gcs.bat
```

**Errores comunes:**
- ❌ Bucket no existe → Crear bucket en Google Cloud Console
- ❌ Permisos insuficientes → Verificar Service Account tiene rol Storage Admin
- ❌ Credenciales incorrectas → Verificar archivo JSON y variables de entorno

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 🆕 Novedades Recientes

### v2.0.0 - Video Management System
- ✅ **Google Cloud Storage** para videos escalables y económicos
- ✅ **Reproductor avanzado** con controles profesionales
- ✅ **Tracking automático** de progreso de video
- ✅ **Gestión híbrida** Mux + GCS
- ✅ **8 cursos pre-configurados** de IA y Data Science
- ✅ **Scripts automatizados** para gestión de cursos
- ✅ **Documentación completa** de configuración

## 👨‍💻 Autor

Desarrollado por **José Pablo** para **IA Pacific Labs**  
Basado en el tutorial de **Code With Antonio**

## 🙏 Agradecimientos

- Code With Antonio por el excelente tutorial base
- La comunidad de Next.js
- Google Cloud por las herramientas de almacenamiento
- Todos los desarrolladores de las librerías utilizadas

---

## 🚀 ¡Comienza Ahora!

```bash
# Clonar repositorio
git clone [tu-repo]

# Instalar dependencias
npm install

# Configurar videos con Google Cloud
./setup-gcs.bat

# Agregar cursos pre-configurados
node add-courses.js

# Iniciar desarrollo
npm run dev
```

**¡Tu plataforma LMS está lista para escalar! 🎓**