# 🎬 Guía Simple: Subir Videos a tu LMS

## 🚀 3 Formas Fáciles de Subir Videos

### 📁 **Método 1: Arrastra y Suelta (MÁS FÁCIL)**

1. **Encuentra tu video** en el explorador de Windows
2. **Arrastra el video** sobre el archivo `subir-video-express.bat`
3. **¡Listo!** El video se sube automáticamente

```
📂 Tu video.mp4 → 🎯 subir-video-express.bat → ☁️ Google Cloud → 🌐 LMS
```

### 💻 **Método 2: Menú Interactivo**

```bash
# Ejecutar el menú simple
subir-video.bat
```

Te guía paso a paso:
- Seleccionar video
- Elegir curso
- Definir sección y lección
- Agregar título y descripción

### ⚡ **Método 3: Línea de Comandos**

```bash
# Subida básica
node upload-express.js "C:\ruta\a\tu\video.mp4"

# Subida con opciones
node upload-video-simple.js
```

---

## 📋 Configuración Previa (Solo la Primera Vez)

### 1. **Variables de Entorno (.env)**
```env
GOOGLE_CLOUD_PROJECT_ID=tu-project-id
GOOGLE_CLOUD_KEY_FILE=./google-cloud-credentials.json
GOOGLE_CLOUD_BUCKET_NAME=tu-bucket-name
DATABASE_URL=tu-database-url
```

### 2. **Credenciales de Google Cloud**
- Descargar `google-cloud-credentials.json` desde Google Cloud Console
- Colocar en la raíz del proyecto

### 3. **Ejecutar Setup (Opcional)**
```bash
setup-complete-advanced.bat
```

---

## 🎯 Estructura Automática

Cuando subes un video, se organiza así:

```
☁️ Google Cloud Storage
└── 📦 tu-bucket/
    └── 📁 cursos/
        └── 📁 ia-basico/
            └── 📁 seccion-1/
                └── 📁 leccion-1/
                    └── 🎬 tu-video.mp4
```

Y en la base de datos:
- ✅ Se crea/actualiza el curso
- ✅ Se crea el capítulo con el video
- ✅ Se hace público automáticamente

---

## 📚 Cursos Disponibles

- `ia-basico` → IA Básico - Certificación Profesional
- `ia-intermedio` → IA Intermedio - Certificación Profesional
- `ia-avanzado` → IA Avanzado - Certificación Profesional
- `ml-fundamentals` → Machine Learning Fundamentals
- `deep-learning` → Deep Learning Especialización

---

## 🎬 Formatos Soportados

✅ **Recomendados:**
- `.mp4` (mejor compatibilidad)
- `.webm` (web optimizado)

✅ **Soportados:**
- `.avi`
- `.mov`
- `.mkv`

📏 **Límites:**
- Tamaño máximo: 500 MB por video
- Duración: Sin límite

---

## 🔧 Solución de Problemas

### ❌ "Error: Google Cloud credentials not found"
**Solución:**
1. Descargar credenciales desde Google Cloud Console
2. Guardar como `google-cloud-credentials.json`
3. Verificar que está en la raíz del proyecto

### ❌ "Error: Bucket does not exist"
**Solución:**
1. Crear bucket en Google Cloud Console
2. Actualizar `GOOGLE_CLOUD_BUCKET_NAME` en `.env`

### ❌ "Error: Database connection failed"
**Solución:**
1. Verificar `DATABASE_URL` en `.env`
2. Ejecutar `npx prisma db push`

### ❌ "Formato no soportado"
**Solución:**
1. Convertir video a `.mp4` usando herramientas como:
   - Handbrake (gratis)
   - VLC Media Player
   - Convertidores online

---

## ⚙️ Personalizar Configuración

### Cambiar Valores por Defecto

Edita `upload-express.js`:
```javascript
const CONFIG_RAPIDA = {
  curso: 'mi-curso',           // ← Cambiar aquí
  seccion: '2',                // ← Cambiar aquí
  leccion: '3',                // ← Cambiar aquí
  autoTitulo: true,            // ← Usar nombre de archivo
  autoPublicar: true           // ← Publicar automáticamente
};
```

### Agregar Nuevo Curso

Edita `upload-video-simple.js`:
```javascript
const CURSOS_DISPONIBLES = {
  'mi-nuevo-curso': 'Mi Nuevo Curso - Descripción',
  // ... otros cursos
};
```

---

## 📊 Verificar Videos Subidos

### En el LMS:
1. Abrir `http://localhost:3000`
2. Ir a cursos
3. Verificar que el video aparece

### En Google Cloud:
1. Google Cloud Console → Storage
2. Buscar tu bucket
3. Navegar a `cursos/[curso]/seccion-X/leccion-Y/`

### En Base de Datos:
```sql
SELECT title, videoUrl FROM "Chapter" 
WHERE videoUrl IS NOT NULL 
ORDER BY position;
```

---

## 💰 Costos

**Google Cloud Storage:**
- 📦 Almacenamiento: ~$0.02/GB/mes
- 🔄 Transferencia: Gratis (primeros GB)
- 💸 **Total estimado: <$1/mes para 20-30 videos**

**Comparación:**
- Vimeo Pro: $20/mes
- Wistia: $79/mes
- **Tu solución: <$1/mes** 💪

---

## 🎉 Ejemplo Completo

```bash
# 1. Tengo un video llamado "introduccion-ia.mp4"

# 2. Lo arrastro sobre "subir-video-express.bat"

# 3. El script hace automáticamente:
✅ Sube a: cursos/ia-basico/seccion-1/leccion-1/introduccion-ia.mp4
✅ Crea URL: https://storage.googleapis.com/mi-bucket/cursos/...
✅ Actualiza BD: Nuevo capítulo "S1L1: introduccion-ia"
✅ Hace público el video

# 4. ¡Ya está disponible en http://localhost:3000!
```

---

## 🚀 Próximos Pasos

1. **Sube tu primer video** con drag & drop
2. **Verifica en el LMS** que aparece correctamente
3. **Sube más videos** para completar tu curso
4. **Personaliza títulos** y descripciones según necesites

---

## 🆘 Soporte

Si tienes problemas:

1. **Verificar configuración:**
   ```bash
   node test-system-advanced.js
   ```

2. **Ver logs detallados:**
   ```bash
   node upload-video-simple.js
   ```

3. **Documentación completa:**
   - `README-COMPLETO.md`
   - `SISTEMA_VIDEOS_GUIA_COMPLETA.md`

---

**🎬 ¡A subir videos se ha dicho!** 

Tu LMS está listo para recibir todo tu contenido educativo de forma simple y automática.