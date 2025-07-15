# 🎬 Resumen de Scripts para Subir Videos

## 🚀 Scripts Disponibles

### 📁 **1. Drag & Drop (MÁS FÁCIL)**
```
subir-video-express.bat
```
- **Uso:** Arrastra tu video sobre este archivo
- **Configuración:** Automática (IA Básico, Sección 1, Lección 1)
- **Ideal para:** Subidas rápidas y frecuentes

### 🎛️ **2. Centro de Control**
```
centro-videos.bat
```
- **Uso:** Doble click para abrir menú completo
- **Funciones:** Subir, verificar, estructuras, ayuda
- **Ideal para:** Gestión completa del sistema

### 📋 **3. Proceso Guiado**
```
subir-video.bat
```
- **Uso:** Te guía paso a paso
- **Configuración:** Personalizable por video
- **Ideal para:** Primera vez o videos específicos

### ⚡ **4. Línea de Comandos Express**
```bash
node upload-express.js "C:\ruta\video.mp4"
```
- **Uso:** Comando directo
- **Configuración:** Automática rápida
- **Ideal para:** Usuarios avanzados

### 🔧 **5. Línea de Comandos Completa**
```bash
node upload-video-simple.js
```
- **Uso:** Proceso interactivo completo
- **Configuración:** Totalmente personalizable
- **Ideal para:** Control total

### 🔍 **6. Verificación del Sistema**
```bash
node test-upload-ready.js
```
- **Uso:** Verifica que todo esté listo
- **Función:** Diagnóstico completo
- **Ideal para:** Antes de empezar

---

## 🎯 ¿Cuál Usar?

### 🆕 **¿Eres nuevo?**
1. ✅ Ejecuta: `centro-videos.bat`
2. ✅ Opción 3: Verificar sistema
3. ✅ Opción 1: Subir video drag & drop

### ⚡ **¿Quieres subir rápido?**
- 📁 Arrastra video sobre: `subir-video-express.bat`

### 🔧 **¿Necesitas control total?**
- 💻 Ejecuta: `node upload-video-simple.js`

### 🎛️ **¿Gestión completa?**
- 🎮 Doble click: `centro-videos.bat`

---

## 📋 Estructura Automática Generada

Todos los scripts crean esta estructura:

```
☁️ Google Cloud Storage
└── 📦 tu-bucket/
    └── 📁 cursos/
        └── 📁 [curso]/
            └── 📁 seccion-[num]/
                └── 📁 leccion-[num]/
                    └── 🎬 tu-video.mp4
```

**Y en la base de datos:**
- ✅ Curso creado/actualizado
- ✅ Capítulo con video URL
- ✅ Metadatos completos
- ✅ Archivo público

---

## ⚙️ Configuración por Defecto

```javascript
// En upload-express.js
const CONFIG_RAPIDA = {
  curso: 'ia-basico',           // IA Básico
  seccion: '1',                 // Sección 1
  leccion: '1',                 // Lección 1
  autoTitulo: true,             // Usar nombre archivo
  autoPublicar: true            // Publicar automático
};
```

**Para cambiar:** Edita `upload-express.js`

---

## 🎓 Cursos Disponibles

- `ia-basico` → IA Básico - Certificación Profesional
- `ia-intermedio` → IA Intermedio - Certificación Profesional
- `ia-avanzado` → IA Avanzado - Certificación Profesional
- `ml-fundamentals` → Machine Learning Fundamentals
- `deep-learning` → Deep Learning Especialización

**Para agregar:** Edita `CURSOS_DISPONIBLES` en `upload-video-simple.js`

---

## 🎬 Formatos Soportados

✅ **Recomendados:**
- `.mp4` (mejor compatibilidad)
- `.webm` (web optimizado)

✅ **Soportados:**
- `.avi`, `.mov`, `.mkv`

📏 **Límites:**
- Máximo: 500 MB por archivo
- Sin límite de duración

---

## 🔧 Archivos de Configuración Necesarios

### 📄 `.env`
```env
GOOGLE_CLOUD_PROJECT_ID=tu-project-id
GOOGLE_CLOUD_KEY_FILE=./google-cloud-credentials.json
GOOGLE_CLOUD_BUCKET_NAME=tu-bucket-name
DATABASE_URL=postgresql://...
```

### 🔑 `google-cloud-credentials.json`
Descarga desde Google Cloud Console → IAM → Service Accounts

---

## 🚨 Solución de Problemas

### ❌ **Script no funciona**
```bash
# Verificar sistema
node test-upload-ready.js

# O usar centro de control
centro-videos.bat → Opción 3
```

### ❌ **Error de Google Cloud**
1. Verificar credenciales en Google Cloud Console
2. Confirmar que el bucket existe
3. Verificar permisos del Service Account

### ❌ **Error de base de datos**
```bash
npx prisma db push
npx prisma generate
```

### ❌ **Video no aparece en LMS**
1. Verificar que el servidor esté corriendo: `npm run dev`
2. Revisar en: `http://localhost:3000`
3. Verificar curso y capítulo en base de datos

---

## 💡 Consejos

### 📹 **Preparar Videos**
- Usar formato .mp4 para mejor compatibilidad
- Resolución recomendada: 1920x1080 o 1280x720
- Compresión moderada para balance calidad/tamaño

### 📂 **Organización**
- Nombrar archivos descriptivamente
- Usar nombres sin espacios ni caracteres especiales
- Ejemplo: `introduccion-ia-conceptos-basicos.mp4`

### ⚡ **Eficiencia**
- Usar drag & drop para subidas frecuentes
- Agrupar videos del mismo curso/sección
- Verificar sistema antes de sesiones largas

---

## 📊 Monitoreo

### 💰 **Costos de Google Cloud**
- ~$0.02/GB/mes de almacenamiento
- Ejemplo: 20 videos (10GB) = ~$0.20/mes

### 📈 **Verificar Subidas**
1. **En LMS:** http://localhost:3000
2. **En Google Cloud:** Console → Storage → Tu bucket
3. **En BD:** Verificar tabla Chapter

---

## 🎉 ¡Listo para Empezar!

1. **Verifica:** `centro-videos.bat` → Opción 3
2. **Sube tu primer video:** Arrastra sobre `subir-video-express.bat`
3. **Confirma:** Abre http://localhost:3000

**¡Tu sistema está listo para manejar todo tu contenido educativo!** 🚀