# 🎬 SISTEMA DE SUBIDA AUTOMATIZADA DE VIDEOS

## 🎯 **¿QUÉ ES ESTO?**

Un sistema completo y automatizado para subir videos a tu LMS Platform que:

✅ **Organiza automáticamente** videos por curso → lección → tipo  
✅ **Sube a Google Cloud Storage** con URLs optimizadas  
✅ **Actualiza la base de datos** automáticamente  
✅ **Estructura jerárquica** escalable y profesional  
✅ **Scripts fáciles de usar** con menús interactivos  

---

## 🚀 **INICIO RÁPIDO - 3 PASOS**

### **PASO 1: Preparar Videos**
```bash
# Crear estructura de carpetas
upload-videos-menu.bat → Opción 5

# Colocar videos en:
videos/leccion-1/fundamentos-ia.mp4
videos/leccion-1/tesla-caso-estudio.mp4
videos/leccion-1/lab-google-cloud.mp4
videos/leccion-1/quiz-explicacion.mp4
```

### **PASO 2: Probar Sistema**
```bash
# Verificar que todo esté configurado
node test-video-upload-system.js
```

### **PASO 3: Subir Videos**
```bash
# Menú interactivo (RECOMENDADO)
upload-videos-menu.bat

# O subida por lotes
node upload-videos.js batch videos-config-leccion-1.json
```

---

## 📁 **ESTRUCTURA AUTOMATIZADA**

### **En tu Computadora:**
```
videos/
├── leccion-1/
│   ├── fundamentos-ia.mp4           # → 🎥 Video: Fundamentos de IA
│   ├── tesla-caso-estudio.mp4       # → 📖 Estudio de Caso: Tesla
│   ├── lab-google-cloud.mp4         # → 🧪 Laboratorio: Google Cloud
│   └── quiz-explicacion.mp4         # → 📝 Quiz: Conceptos Fundamentales
│
└── leccion-2/
    ├── tipos-machine-learning.mp4   # → 🎥 Video: Tipos de ML
    └── netflix-recomendaciones.mp4  # → 📖 Estudio de Caso: Netflix
```

### **En Google Cloud Storage:**
```
gs://tu-bucket/
└── courses/
    └── ia-basico/
        └── lessons/
            ├── leccion-1/
            │   └── videos/
            │       ├── video-principal/fundamentos-ia.mp4
            │       ├── tesla-caso/tesla-caso-estudio.mp4
            │       ├── laboratorio-intro/lab-google-cloud.mp4
            │       └── quiz-explicacion/quiz-explicacion.mp4
            │
            └── leccion-2/
                └── videos/
                    ├── ml-tipos/tipos-machine-learning.mp4
                    └── netflix-caso/netflix-recomendaciones.mp4
```

### **En la Base de Datos:**
```sql
UPDATE chapters 
SET videoUrl = 'https://storage.googleapis.com/bucket/courses/ia-basico/...'
WHERE title LIKE '%Fundamentos de IA%';
```

---

## 🛠️ **COMANDOS DISPONIBLES**

### **📺 Subida Individual:**
```bash
node upload-videos.js single "./videos/leccion-1/fundamentos-ia.mp4" ia-basico leccion-1 video-principal
```

### **📦 Subida por Lotes:**
```bash
# Todos los videos de Lección 1
node upload-videos.js batch videos-config-leccion-1.json

# Todos los videos de Lección 2  
node upload-videos.js batch videos-config-leccion-2.json
```

### **🗂️ Ver Estructura:**
```bash
node upload-videos.js structure
```

### **🧪 Testing:**
```bash
node test-video-upload-system.js
```

### **🎛️ Menú Interactivo:**
```bash
upload-videos-menu.bat
```

---

## ⚙️ **CONFIGURACIÓN DE VIDEOS**

### **Archivo: `videos-config-leccion-1.json`**
```json
[
  {
    "videoPath": "./videos/leccion-1/fundamentos-ia.mp4",
    "courseKey": "ia-basico",
    "lessonKey": "leccion-1", 
    "videoKey": "video-principal"
  },
  {
    "videoPath": "./videos/leccion-1/tesla-caso-estudio.mp4",
    "courseKey": "ia-basico",
    "lessonKey": "leccion-1",
    "videoKey": "tesla-caso"
  }
]
```

### **Mapeado Automático:**
- `courseKey: "ia-basico"` → Curso "IA Básico - Certificación Profesional"
- `lessonKey: "leccion-1"` → Lección 1: Fundamentos de IA
- `videoKey: "video-principal"` → Capítulo "🎥 Video: Fundamentos de IA"

---

## 📋 **ESPECIFICACIONES TÉCNICAS**

### **Formatos Soportados:**
- ✅ **MP4** (recomendado)
- ✅ **WebM**
- ✅ **MOV**

### **Especificaciones Recomendadas:**
- **Resolución:** 1920x1080 (Full HD)
- **Codec:** H.264 + AAC
- **Frame Rate:** 30 fps
- **Bitrate:** 2-5 Mbps
- **Tamaño máximo:** 500 MB

### **Estructura de Metadatos:**
```json
{
  "contentType": "video/mp4",
  "cacheControl": "public, max-age=31536000",
  "metadata": {
    "courseKey": "ia-basico",
    "lessonKey": "leccion-1", 
    "videoKey": "video-principal",
    "originalName": "fundamentos-ia.mp4",
    "uploadedAt": "2025-07-12T10:30:00.000Z",
    "duration": "30 min"
  }
}
```

---

## 🎯 **WORKFLOW COMPLETO**

### **1. Preparación (5 min):**
```bash
# Crear carpetas
upload-videos-menu.bat → Opción 5

# Verificar sistema
node test-video-upload-system.js
```

### **2. Organización (10 min):**
```bash
# Colocar videos con nombres exactos
cp mi-video-fundamentos.mp4 videos/leccion-1/fundamentos-ia.mp4
cp mi-video-tesla.mp4 videos/leccion-1/tesla-caso-estudio.mp4
# etc...
```

### **3. Subida (5-15 min dependiendo del tamaño):**
```bash
# Subida automática de toda la lección
node upload-videos.js batch videos-config-leccion-1.json
```

### **4. Verificación (2 min):**
```bash
# Verificar en tu LMS
npm run dev
# → Ir a curso IA Básico
# → Verificar que videos aparecen y se reproducen
```

---

## 🔧 **TROUBLESHOOTING**

### **❌ "Error: File not found"**
**Solución:**
- Verifica que el archivo existe en la ruta especificada
- Confirma nombres exactos (sensible a mayúsculas/minúsculas)
- Usa rutas relativas desde la raíz del proyecto

### **❌ "Error: Bucket does not exist"**
**Solución:**
```bash
# Verificar bucket en Google Cloud Shell
gsutil ls

# Actualizar .env con nombre correcto
GOOGLE_CLOUD_BUCKET_NAME="nombre-real-del-bucket"
```

### **❌ "Error: Permission denied"**
**Solución:**
- Verificar Service Account tiene rol "Storage Admin"
- Confirmar credenciales en google-cloud-credentials.json
- Ejecutar: `node test-gcs-final.js`

### **❌ "Chapter not found in database"**
**Solución:**
```bash
# Crear curso si no existe
node create-ia-basico-complete.js

# Verificar capítulos creados
# Revisar títulos en base de datos coincidan con configuración
```

---

## 💡 **MEJORES PRÁCTICAS**

### **📹 Grabación de Videos:**
- **Grabación en HD** (1920x1080 mínimo)
- **Audio claro** sin ruido de fondo
- **Ritmo moderado** para educación
- **Buena iluminación** para webcam
- **Screen recording** en resolución nativa

### **🗂️ Organización:**
- **Nombres consistentes** según tabla de mapeo
- **Una carpeta por lección** para fácil organización
- **Versionado** si necesitas actualizar videos
- **Backup local** antes de subir

### **⚡ Optimización:**
- **Compresión antes de subir** con HandBrake
- **Batches pequeños** para conexiones lentas
- **Test con video pequeño** primero
- **Cleanup de archivos temporales**

---

## 📊 **VENTAJAS DEL SISTEMA**

### **🚀 Para Desarrolladores:**
- **Automatización completa** - no más subida manual
- **Estructura escalable** - fácil agregar cursos/lecciones
- **URLs optimizadas** - streaming directo desde GCS
- **Metadatos estructurados** - fácil gestión y búsqueda

### **💰 Para el Negocio:**
- **Costos ultra-bajos** (~$0.02/GB/mes)
- **Escalabilidad ilimitada** - millones de estudiantes
- **Disponibilidad global** - CDN automático
- **Backup automático** - no pérdida de contenido

### **🎓 Para Estudiantes:**
- **Carga rápida** - optimizado para streaming
- **Disponibilidad 24/7** - infraestructura robusta
- **Calidad consistente** - especificaciones estandarizadas
- **Acceso móvil** - responsive en todos dispositivos

---

## 🎉 **RESULTADO FINAL**

Después de usar este sistema tendrás:

✅ **Videos organizados automáticamente** en Google Cloud Storage  
✅ **Base de datos actualizada** con URLs correctas  
✅ **LMS funcionando** con videos disponibles inmediatamente  
✅ **Estructura escalable** para futuras lecciones y cursos  
✅ **Costos optimizados** con la mejor relación calidad-precio  
✅ **Workflow profesional** comparable a plataformas líderes  

---

## 📞 **SOPORTE**

### **Documentación Relacionada:**
- `videos/README.md` - Especificaciones técnicas detalladas
- `IMPLEMENTACION_GUIA_RAPIDA.md` - Setup inicial completo
- `test-video-upload-system.js` - Diagnóstico automático

### **Comandos de Diagnóstico:**
```bash
# Test completo del sistema
node test-video-upload-system.js

# Test solo Google Cloud Storage  
node test-gcs-final.js

# Verificar estructura de videos
node upload-videos.js structure
```

### **Archivos Clave:**
- `upload-videos.js` - Script principal de subida
- `upload-videos-menu.bat` - Menú interactivo
- `videos-config-leccion-1.json` - Configuración de Lección 1
- `test-video-upload-system.js` - Testing automatizado

---

**🚀 ¡Tu sistema de videos automatizado está listo para escalar y revolucionar la educación en IA!**

---

*🎬 Desarrollado por IA Pacific Labs - LMS Platform*  
*© 2025 - Sistema de Subida Automatizada de Videos*