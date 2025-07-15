# 📹 CARPETA DE VIDEOS - ORGANIZACIÓN

## 📁 **ESTRUCTURA RECOMENDADA**

Organiza tus videos en esta carpeta con la siguiente estructura:

```
videos/
├── leccion-1/
│   ├── fundamentos-ia.mp4                 # Video principal (30 min)
│   ├── tesla-caso-estudio.mp4             # Estudio de caso (20 min)
│   ├── lab-google-cloud.mp4               # Laboratorio (15 min)
│   └── quiz-explicacion.mp4               # Quiz explicación (5 min)
│
├── leccion-2/
│   ├── tipos-machine-learning.mp4         # Video principal (35 min)
│   └── netflix-recomendaciones.mp4        # Estudio de caso (25 min)
│
└── curso-intermedio/
    └── leccion-1/
        └── deep-learning-avanzado.mp4     # Video avanzado (40 min)
```

## 🎯 **NOMBRES DE ARCHIVOS ESPERADOS**

### **Lección 1 - Fundamentos de IA:**
- `fundamentos-ia.mp4` → 🎥 Video: Fundamentos de IA
- `tesla-caso-estudio.mp4` → 📖 Estudio de Caso: Tesla  
- `lab-google-cloud.mp4` → 🧪 Laboratorio: Google Cloud
- `quiz-explicacion.mp4` → 📝 Quiz: Conceptos Fundamentales

### **Lección 2 - Tipos de ML (futuro):**
- `tipos-machine-learning.mp4` → 🎥 Video: Tipos de ML
- `netflix-recomendaciones.mp4` → 📖 Estudio de Caso: Netflix

## 📐 **ESPECIFICACIONES TÉCNICAS**

### **Formato Recomendado:**
- **Contenedor:** MP4
- **Video Codec:** H.264
- **Audio Codec:** AAC
- **Resolución:** 1920x1080 (Full HD)
- **Frame Rate:** 30 fps
- **Bitrate:** 2-5 Mbps
- **Tamaño máximo:** 500 MB por archivo

### **Configuraciones de Exportación:**

#### **Para OBS Studio:**
- Formato: MP4
- Encoder: x264
- Rate Control: CBR
- Bitrate: 3000 Kbps
- Keyframe Interval: 2

#### **Para Adobe Premiere:**
- Format: H.264
- Preset: YouTube 1080p Full HD
- Bitrate: VBR, 2 pass, Target 4 Mbps

#### **Para Camtasia:**
- Production preset: MP4 - Smart Player (HD)
- Video dimensions: 1920 x 1080
- Frame rate: 30 fps

## 🚀 **INSTRUCCIONES DE USO**

### **PASO 1: Colocar Videos**
Copia tus videos a las carpetas correspondientes con los nombres exactos especificados arriba.

### **PASO 2: Subir un Solo Video**
```bash
node upload-videos.js single "./videos/leccion-1/fundamentos-ia.mp4" ia-basico leccion-1 video-principal
```

### **PASO 3: Subir Todos los Videos de una Lección**
```bash
node upload-videos.js batch videos-config-leccion-1.json
```

### **PASO 4: Ver Estructura Disponible**
```bash
node upload-videos.js structure
```

## ✅ **CHECKLIST PRE-SUBIDA**

Antes de subir, verifica que tus videos cumplan:

- [ ] ✅ **Nombre correcto** según la tabla de nombres
- [ ] ✅ **Formato MP4** con H.264
- [ ] ✅ **Tamaño <500MB** por archivo
- [ ] ✅ **Calidad 1080p** o superior
- [ ] ✅ **Audio claro** sin ruido de fondo
- [ ] ✅ **Duración apropiada** según especificaciones

## 🎬 **CONSEJOS DE GRABACIÓN**

### **Para Videos Educativos:**
- **Habla claramente** y a ritmo moderado
- **Usa slides** con texto grande y contrastado
- **Incluye ejemplos prácticos** y demos
- **Agrega pausas** para reflexión
- **Termina con resumen** de puntos clave

### **Para Laboratorios:**
- **Muestra pantalla completa** durante demos
- **Explica cada paso** mientras lo haces
- **Incluye troubleshooting** de errores comunes
- **Usa zoom** para detalles importantes
- **Graba en resolución alta** para legibilidad

## 🔧 **TROUBLESHOOTING**

### **❌ "Archivo muy grande"**
- Reduce bitrate a 2-3 Mbps
- Comprime con HandBrake (preset: Fast 1080p30)
- Considera dividir videos >45 min en partes

### **❌ "Audio fuera de sincronía"**
- Re-exporta con frame rate constante
- Usa software de edición para sincronizar
- Verifica configuración de grabación

### **❌ "Calidad muy baja"**
- Aumenta bitrate a 4-5 Mbps
- Graba en resolución nativa de pantalla
- Usa buena iluminación para webcam

## 📞 **SOPORTE**

Si tienes problemas:
1. Verifica nombres de archivos exactos
2. Confirma formato y especificaciones
3. Prueba con un video pequeño primero
4. Revisa logs de consola para errores

---

**🎯 ¡Listo para crear contenido educativo de clase mundial!**

*Desarrollado por IA Pacific Labs - LMS Platform*