# 🐚 Configuración con Google Cloud Shell (Bash)

## 🚀 Acceder a Google Cloud Shell

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en el ícono **Cloud Shell** (>_) en la barra superior
3. Espera a que se active la terminal

## 📋 Script Completo para Configurar LMS Videos

Copia y pega este script completo en Google Cloud Shell:

```bash
#!/bin/bash

# 🎯 Script de configuración automática para LMS Platform
# Configura Google Cloud Storage para videos

echo "🚀 Configurando Google Cloud Storage para LMS Platform..."
echo "=================================================="

# Variables de configuración
PROJECT_ID=$(gcloud config get-value project)
BUCKET_NAME="lms-videos-$(date +%s)"  # Nombre único con timestamp
SERVICE_ACCOUNT_NAME="lms-video-storage"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="lms-credentials.json"

echo "📊 Información del proyecto:"
echo "   • Project ID: $PROJECT_ID"
echo "   • Bucket Name: $BUCKET_NAME"
echo "   • Service Account: $SERVICE_ACCOUNT_EMAIL"
echo ""

# Paso 1: Habilitar APIs necesarias
echo "🔧 Paso 1: Habilitando APIs necesarias..."
gcloud services enable storage-api.googleapis.com
gcloud services enable storage-component.googleapis.com
gcloud services enable iam.googleapis.com
echo "✅ APIs habilitadas"
echo ""

# Paso 2: Crear Service Account
echo "👤 Paso 2: Creando Service Account..."
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --description="Service account for LMS video storage" \
    --display-name="LMS Video Storage"

# Asignar rol de Storage Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/storage.admin"

echo "✅ Service Account creado y configurado"
echo ""

# Paso 3: Crear credenciales JSON
echo "🔑 Paso 3: Generando credenciales JSON..."
gcloud iam service-accounts keys create $KEY_FILE \
    --iam-account=$SERVICE_ACCOUNT_EMAIL

echo "✅ Credenciales generadas: $KEY_FILE"
echo ""

# Paso 4: Crear bucket de storage
echo "🪣 Paso 4: Creando bucket de storage..."
gsutil mb -l us-central1 gs://$BUCKET_NAME

# Configurar CORS para el bucket (permitir acceso desde web)
cat > cors-config.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "responseHeader": ["Content-Type", "Access-Control-Allow-Origin"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors-config.json gs://$BUCKET_NAME

# Hacer el bucket público para lectura (opcional)
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

echo "✅ Bucket creado y configurado: gs://$BUCKET_NAME"
echo ""

# Paso 5: Crear estructura de carpetas
echo "📁 Paso 5: Creando estructura de carpetas..."
echo "Estructura de videos para LMS" | gsutil cp - gs://$BUCKET_NAME/videos/README.txt
echo "✅ Estructura creada"
echo ""

# Paso 6: Probar configuración
echo "🧪 Paso 6: Probando configuración..."
echo "Archivo de prueba" | gsutil cp - gs://$BUCKET_NAME/videos/test.txt

if gsutil ls gs://$BUCKET_NAME/videos/test.txt > /dev/null 2>&1; then
    echo "✅ Prueba exitosa: Bucket funcionando correctamente"
    gsutil rm gs://$BUCKET_NAME/videos/test.txt
else
    echo "❌ Error: Problemas con el bucket"
fi
echo ""

# Paso 7: Mostrar información de configuración
echo "📋 Paso 7: Información para tu aplicación"
echo "=================================================="
echo ""
echo "📄 Variables de entorno para tu archivo .env:"
echo ""
echo "GOOGLE_CLOUD_PROJECT_ID=\"$PROJECT_ID\""
echo "GOOGLE_CLOUD_BUCKET_NAME=\"$BUCKET_NAME\""
echo "GOOGLE_CLOUD_KEY_FILE=\"./google-cloud-credentials.json\""
echo ""
echo "📁 URLs de tus videos serán:"
echo "https://storage.googleapis.com/$BUCKET_NAME/videos/nombre-archivo.mp4"
echo ""

# Paso 8: Preparar descarga de credenciales
echo "⬇️  Paso 8: Preparando descarga de credenciales..."
echo ""
echo "🔴 IMPORTANTE: Debes descargar el archivo de credenciales"
echo ""
echo "Para descargar las credenciales, ejecuta:"
echo "cloudshell download $KEY_FILE"
echo ""
echo "O usa el editor de Cloud Shell para copiar el contenido:"
echo "cat $KEY_FILE"
echo ""

# Mostrar contenido del archivo de credenciales
echo "📄 Contenido del archivo de credenciales:"
echo "=================================================="
cat $KEY_FILE
echo ""
echo "=================================================="
echo ""

# Paso 9: Limpiar archivos temporales
rm -f cors-config.json

echo "🎉 ¡Configuración completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Copia las variables de entorno a tu archivo .env"
echo "2. Descarga el archivo de credenciales JSON"
echo "3. Coloca el archivo en tu proyecto como 'google-cloud-credentials.json'"
echo "4. Ejecuta 'npm install @google-cloud/storage' en tu proyecto"
echo "5. Usa los componentes de video en tu LMS"
echo ""
echo "🚀 ¡Tu LMS está listo para almacenar videos!"
```

## 🎯 Ejecución Paso a Paso

### 1. Ejecutar el Script Completo
```bash
# Copiar y pegar todo el script anterior en Cloud Shell
# Se ejecutará automáticamente
```

### 2. O Ejecutar Comandos Individuales

```bash
# Verificar proyecto actual
gcloud config get-value project

# Habilitar APIs
gcloud services enable storage-api.googleapis.com storage-component.googleapis.com

# Crear Service Account
gcloud iam service-accounts create lms-video-storage \
    --description="Service account for LMS video storage"

# Asignar permisos
PROJECT_ID=$(gcloud config get-value project)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:lms-video-storage@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

# Generar credenciales
gcloud iam service-accounts keys create lms-credentials.json \
    --iam-account="lms-video-storage@${PROJECT_ID}.iam.gserviceaccount.com"

# Crear bucket único
BUCKET_NAME="lms-videos-$(date +%s)"
gsutil mb -l us-central1 gs://$BUCKET_NAME

# Configurar acceso público
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Mostrar configuración
echo "GOOGLE_CLOUD_PROJECT_ID=\"$PROJECT_ID\""
echo "GOOGLE_CLOUD_BUCKET_NAME=\"$BUCKET_NAME\""
```

### 3. Descargar Credenciales

```bash
# Opción 1: Descargar archivo
cloudshell download lms-credentials.json

# Opción 2: Mostrar contenido para copiar
cat lms-credentials.json
```

## 🔧 Comandos Útiles para Gestión

### Listar archivos en el bucket
```bash
gsutil ls gs://tu-bucket-name/videos/
```

### Subir archivo de prueba
```bash
echo "Video de prueba" | gsutil cp - gs://tu-bucket-name/videos/test.mp4
```

### Verificar permisos
```bash
gsutil iam get gs://tu-bucket-name
```

### Configurar CORS (si es necesario)
```bash
cat > cors.json << EOF
[{
  "origin": ["*"],
  "method": ["GET", "POST", "PUT"],
  "responseHeader": ["Content-Type"],
  "maxAgeSeconds": 3600
}]
EOF

gsutil cors set cors.json gs://tu-bucket-name
```

### Hacer bucket privado (si quieres cambiar)
```bash
gsutil iam ch -d allUsers:objectViewer gs://tu-bucket-name
```

## 📋 Variables de Entorno Resultantes

Después de ejecutar el script, tendrás:

```env
# Google Cloud Storage para Videos
GOOGLE_CLOUD_PROJECT_ID="tu-project-id-123456"
GOOGLE_CLOUD_BUCKET_NAME="lms-videos-1234567890"
GOOGLE_CLOUD_KEY_FILE="./google-cloud-credentials.json"
```

## 🚨 Notas Importantes

1. **Copia las credenciales JSON** a tu proyecto local
2. **Guarda las variables de entorno** que aparecen al final
3. **No subas las credenciales** a GitHub (agrega al .gitignore)
4. **El bucket tendrá un nombre único** con timestamp para evitar conflictos

## ✅ Verificación

Para verificar que todo funciona:

```bash
# Probar subida
gsutil cp /dev/null gs://tu-bucket-name/videos/test.txt

# Probar acceso público
curl https://storage.googleapis.com/tu-bucket-name/videos/test.txt

# Limpiar
gsutil rm gs://tu-bucket-name/videos/test.txt
```

¡Listo! Con esto tendrás Google Cloud Storage configurado completamente desde la consola bash de Google Cloud. 🚀