# 🖥️ DÓNDE EJECUTAR CADA COMANDO

## 🌐 En Google Cloud Shell (Consola web de Google Cloud)

### ✅ Para acceder:
1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Haz clic en el ícono **Cloud Shell** (>_) arriba a la derecha
3. Espera que cargue la terminal web

### 🔧 Comandos que van en Cloud Shell:

```bash
# ===== EJECUTAR EN GOOGLE CLOUD SHELL =====

# Verificar proyecto
gcloud config get-value project

# Habilitar APIs
gcloud services enable storage-api.googleapis.com
gcloud services enable iam.googleapis.com

# Crear Service Account
gcloud iam service-accounts create lms-video-storage \
    --display-name="LMS Video Storage"

# Asignar permisos
PROJECT_ID=$(gcloud config get-value project)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:lms-video-storage@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Generar credenciales JSON
gcloud iam service-accounts keys create lms-credentials.json \
    --iam-account="lms-video-storage@${PROJECT_ID}.iam.gserviceaccount.com"

# Crear bucket
BUCKET_NAME="lms-videos-$(date +%s)"
gsutil mb -l us-central1 gs://$BUCKET_NAME

# Hacer público
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Ver contenido de credenciales (para copiar)
cat lms-credentials.json

# Descargar archivo
cloudshell download lms-credentials.json
```

---

## 💻 En tu Terminal Local (Windows/Mac/Linux)

### ✅ Para acceder:
- **Windows**: CMD, PowerShell, o Git Bash
- **Mac/Linux**: Terminal

### 🔧 Comandos que van en Terminal Local:

```bash
# ===== EJECUTAR EN TU COMPUTADORA LOCAL =====

# Ir a tu proyecto
cd "C:\Users\josep\Desktop\IA Pacific Labs\lms-platform"

# Instalar dependencias de Google Cloud
npm install @google-cloud/storage multer @types/multer

# Probar configuración (después de configurar .env)
node test-gcs.js

# Crear cursos
node add-courses.js

# Ejecutar proyecto
npm run dev

# Scripts de Windows
./setup-gcs.bat
./curso-manager.bat
```

---

## 🎯 PROCESO PASO A PASO COMPLETO

### Paso 1: En Google Cloud Shell 🌐
```bash
# Script completo para Cloud Shell
#!/bin/bash
PROJECT_ID=$(gcloud config get-value project)
BUCKET_NAME="lms-videos-$(date +%s)"

# Habilitar APIs
gcloud services enable storage-api.googleapis.com iam.googleapis.com

# Crear Service Account
gcloud iam service-accounts create lms-video-storage

# Asignar permisos
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:lms-video-storage@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Generar credenciales
gcloud iam service-accounts keys create lms-credentials.json \
    --iam-account="lms-video-storage@${PROJECT_ID}.iam.gserviceaccount.com"

# Crear bucket
gsutil mb gs://$BUCKET_NAME
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Mostrar configuración
echo "=== COPIAR ESTAS VARIABLES A TU .env ==="
echo "GOOGLE_CLOUD_PROJECT_ID=\"$PROJECT_ID\""
echo "GOOGLE_CLOUD_BUCKET_NAME=\"$BUCKET_NAME\""
echo "GOOGLE_CLOUD_KEY_FILE=\"./google-cloud-credentials.json\""

# Mostrar credenciales para copiar
echo ""
echo "=== CONTENIDO DEL ARCHIVO JSON (copiar y guardar) ==="
cat lms-credentials.json
```

### Paso 2: Descargar credenciales 📥
En Cloud Shell:
```bash
# Descargar archivo
cloudshell download lms-credentials.json
```

### Paso 3: En tu computadora local 💻
```bash
# 1. Guardar el archivo JSON descargado como:
# google-cloud-credentials.json

# 2. Agregar variables al archivo .env
# GOOGLE_CLOUD_PROJECT_ID="tu-project-id"
# GOOGLE_CLOUD_BUCKET_NAME="tu-bucket-name"
# GOOGLE_CLOUD_KEY_FILE="./google-cloud-credentials.json"

# 3. Instalar dependencias
npm install @google-cloud/storage

# 4. Probar configuración
node test-gcs.js

# 5. Ejecutar proyecto
npm run dev
```

---

## 🎯 RESUMEN VISUAL

```
┌─────────────────────────┐    ┌─────────────────────────┐
│   GOOGLE CLOUD SHELL    │    │    TU COMPUTADORA       │
│        (Web Browser)    │    │      (Terminal)         │
├─────────────────────────┤    ├─────────────────────────┤
│ • gcloud commands       │    │ • npm install           │
│ • gsutil commands       │    │ • node scripts          │
│ • Create service account│    │ • npm run dev           │
│ • Create bucket         │    │ • Edit .env file        │
│ • Generate JSON         │    │ • Save JSON file        │
└─────────────────────────┘    └─────────────────────────┘
           │                              ▲
           │        Download JSON         │
           └──────────────────────────────┘
```

---

## ⚠️ IMPORTANTE

### ✅ En Google Cloud Shell:
- Todos los comandos `gcloud`
- Todos los comandos `gsutil` 
- Generar credenciales
- Configurar buckets

### ✅ En tu Terminal Local:
- Comandos `npm`
- Comandos `node`
- Editar archivos del proyecto
- Ejecutar la aplicación

### ❌ NO mezclar:
- ❌ No ejecutes `gcloud` en tu terminal local (a menos que tengas SDK instalado)
- ❌ No ejecutes `npm` en Cloud Shell (no tienes tu proyecto ahí)

---

## 🚀 Script de Una Línea para Cloud Shell

Copia y pega esto completo en Google Cloud Shell:

```bash
PROJECT_ID=$(gcloud config get-value project) && BUCKET_NAME="lms-videos-$(date +%s)" && gcloud services enable storage-api.googleapis.com iam.googleapis.com && gcloud iam service-accounts create lms-video-storage && gcloud projects add-iam-policy-binding $PROJECT_ID --member="serviceAccount:lms-video-storage@${PROJECT_ID}.iam.gserviceaccount.com" --role="roles/storage.admin" && gcloud iam service-accounts keys create lms-credentials.json --iam-account="lms-video-storage@${PROJECT_ID}.iam.gserviceaccount.com" && gsutil mb gs://$BUCKET_NAME && gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME && echo "GOOGLE_CLOUD_PROJECT_ID=\"$PROJECT_ID\"" && echo "GOOGLE_CLOUD_BUCKET_NAME=\"$BUCKET_NAME\"" && echo "Credenciales:" && cat lms-credentials.json
```

¡Esto responde tu pregunta! ¿Quieres que te ayude con algún paso específico?