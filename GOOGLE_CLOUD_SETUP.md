# 🎥 Configuración de Google Cloud Storage para Videos

Esta guía te ayudará a configurar Google Cloud Storage para almacenar los videos de tu LMS platform.

## 🚀 Pasos de Configuración

### 1. Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Anota el **Project ID** (lo necesitarás después)

### 2. Habilitar APIs Necesarias

```bash
# Habilita las APIs necesarias
gcloud services enable storage-api.googleapis.com
gcloud services enable storage-component.googleapis.com
```

O desde la consola:
- Ve a **APIs & Services > Library**
- Busca "Cloud Storage API"
- Haz clic en **Enable**

### 3. Crear Service Account

1. Ve a **IAM & Admin > Service Accounts**
2. Clic en **Create Service Account**
3. Nombre: `lms-video-storage`
4. Descripción: `Service account for LMS video storage`
5. Clic en **Create and Continue**
6. Asigna el rol: **Storage Admin**
7. Clic en **Continue** y **Done**

### 4. Generar Credenciales

1. En la lista de Service Accounts, encuentra la cuenta creada
2. Clic en los 3 puntos > **Manage keys**
3. Clic en **Add Key > Create new key**
4. Selecciona **JSON**
5. Descarga el archivo y guárdalo como `google-cloud-credentials.json` en tu proyecto

### 5. Crear Bucket de Storage

```bash
# Crear bucket (reemplaza con un nombre único)
gsutil mb gs://tu-lms-videos-bucket

# Configurar permisos públicos (opcional, para videos públicos)
gsutil iam ch allUsers:objectViewer gs://tu-lms-videos-bucket
```

O desde la consola:
1. Ve a **Cloud Storage > Buckets**
2. Clic en **Create bucket**
3. Nombre: `tu-lms-videos-bucket` (debe ser único globalmente)
4. Location: Elige la región más cercana a tus usuarios
5. Storage class: **Standard**
6. Access control: **Fine-grained** (para control granular)

### 6. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=tu-project-id
GOOGLE_CLOUD_KEY_FILE=./google-cloud-credentials.json
GOOGLE_CLOUD_BUCKET_NAME=tu-lms-videos-bucket
```

**Para producción (más seguro):**
```env
# Codifica tu archivo JSON en base64
# En Linux/Mac: base64 -i google-cloud-credentials.json
# En Windows: certutil -encode google-cloud-credentials.json temp.b64

GOOGLE_CLOUD_PROJECT_ID=tu-project-id
GOOGLE_CLOUD_CREDENTIALS_BASE64=tu-credencial-en-base64
GOOGLE_CLOUD_BUCKET_NAME=tu-lms-videos-bucket
```

### 7. Instalar Dependencias

```bash
# Ejecutar en tu proyecto
npm install @google-cloud/storage multer @types/multer
```

O usar el script:
```bash
./install-gcs.bat
```

## 🔧 Estructura de Archivos Creados

```
lms-platform/
├── lib/google-cloud/
│   ├── storage.ts                 # Configuración básica
│   └── storage-enhanced.ts        # Versión mejorada con más funciones
├── components/
│   ├── video-upload.tsx          # Componente para subir videos
│   ├── video-player.tsx          # Reproductor personalizado
│   └── chapter-video-manager.tsx # Gestor completo de videos
├── app/api/
│   ├── upload/video/route.ts     # API para subir videos
│   └── chapters/[chapterId]/route.ts # API para progreso
├── hooks/
│   └── use-video-progress.ts     # Hook para manejar progreso
└── google-cloud-credentials.json # Credenciales (no subir a git)
```

## 🎯 Uso en Componentes

### En una página de capítulo:

```tsx
import { ChapterVideoManager } from "@/components/chapter-video-manager";

export default function ChapterPage({ params }) {
  return (
    <ChapterVideoManager
      chapterId={params.chapterId}
      userId={currentUser.id}
      isOwner={isOwner}
      initialVideoUrl={chapter.videoUrl}
      chapterTitle={chapter.title}
    />
  );
}
```

## 🔒 Seguridad

### Para videos públicos:
- Los videos se almacenan con acceso público
- URLs directas: `https://storage.googleapis.com/bucket/videos/filename.mp4`

### Para videos privados:
- Usa URLs firmadas que expiran
- Control de acceso por usuario
- Ejemplo: `getSignedVideoUrl(fileName, 1)` // Expira en 1 hora

## 💰 Costos Estimados

- **Storage**: ~$0.02/GB por mes
- **Bandwidth**: ~$0.12/GB de salida
- **Operations**: ~$0.05 por 10,000 operaciones

Para un LMS con 100 videos de 100MB cada uno:
- Storage: ~$0.20/mes
- Bandwidth (1000 reproducciones/mes): ~$12/mes

## 🚨 Notas Importantes

1. **Nunca subas** `google-cloud-credentials.json` a tu repositorio
2. **Agrega** al `.gitignore`:
   ```
   google-cloud-credentials.json
   .env.local
   ```
3. **En producción** usa variables de entorno en lugar de archivos
4. **Considera** usar CDN para mejor rendimiento
5. **Configura** CORS si necesitas acceso desde el frontend

## 🔧 Troubleshooting

### Error: "Bucket does not exist"
- Verifica que el bucket esté creado
- Confirma el nombre en GOOGLE_CLOUD_BUCKET_NAME

### Error: "Insufficient permissions"
- Verifica que la Service Account tenga rol Storage Admin
- Confirma que las credenciales son correctas

### Error: "File too large"
- Verifica límites de tu servidor (por defecto 50MB en Vercel)
- Considera implementar subida por chunks para archivos grandes

## ✅ Verificación de Configuración

Ejecuta este script para verificar tu configuración:

```bash
node -e "
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: './google-cloud-credentials.json'
});
storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME).exists()
  .then(([exists]) => console.log('Bucket exists:', exists))
  .catch(console.error);
"
```

¡Listo! Ahora tu LMS puede almacenar videos en Google Cloud Storage de forma segura y escalable.