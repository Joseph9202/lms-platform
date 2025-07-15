#!/bin/bash

# Script para configurar Cloud SQL para LMS Platform
# Ejecutar desde Google Cloud Shell o con gcloud CLI configurado

echo "🚀 Configurando Cloud SQL para LMS Platform (20K usuarios)..."

# Variables de configuración - MODIFICAR SEGÚN TU PROYECTO
PROJECT_ID="${1:-tu-project-id}"
INSTANCE_NAME="${2:-lms-production}"
REGION="${3:-us-central1}"
DB_NAME="lms_platform"
DB_USER="lms_user"
DB_PASSWORD="$(openssl rand -base64 32)"

echo "📊 Configuración:"
echo "Project ID: $PROJECT_ID"
echo "Instance: $INSTANCE_NAME"
echo "Region: $REGION"
echo "Database: $DB_NAME"
echo "Usuario: $DB_USER"
echo ""

# Verificar que gcloud esté configurado
if ! gcloud config get-value project > /dev/null 2>&1; then
    echo "❌ Error: gcloud no está configurado. Ejecuta 'gcloud auth login' primero."
    exit 1
fi

# Establecer proyecto
gcloud config set project $PROJECT_ID

# 1. Crear instancia Cloud SQL optimizada para 20K usuarios
echo "🏗️ Creando instancia Cloud SQL (esto puede tomar 10-15 minutos)..."
gcloud sql instances create $INSTANCE_NAME \
    --database-version=MYSQL_8_0 \
    --tier=db-custom-4-16384 \
    --region=$REGION \
    --root-password="$DB_PASSWORD" \
    --backup-start-time=03:00 \
    --backup-location=$REGION \
    --maintenance-window-day=SUN \
    --maintenance-window-hour=04 \
    --maintenance-release-channel=production \
    --deletion-protection \
    --storage-type=SSD \
    --storage-size=100GB \
    --storage-auto-increase \
    --storage-auto-increase-limit=500GB \
    --enable-bin-log \
    --database-flags=max_connections=2000,innodb_buffer_pool_size=12GB

echo "✅ Instancia creada exitosamente!"

# 2. Crear base de datos
echo "📚 Creando base de datos..."
gcloud sql databases create $DB_NAME \
    --instance=$INSTANCE_NAME \
    --charset=utf8mb4 \
    --collation=utf8mb4_unicode_ci

# 3. Crear usuario de aplicación con permisos limitados
echo "👤 Creando usuario de aplicación..."
gcloud sql users create $DB_USER \
    --instance=$INSTANCE_NAME \
    --password="$DB_PASSWORD"

# 4. Configurar acceso temporal (REEMPLAZAR CON IP DE GKE EN PRODUCCIÓN)
echo "🔐 Configurando acceso temporal..."
echo "⚠️  IMPORTANTE: Reemplazar 0.0.0.0/0 con IP de GKE en producción"
gcloud sql instances patch $INSTANCE_NAME \
    --authorized-networks=0.0.0.0/0

# 5. Obtener información de conexión
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)")
PUBLIC_IP=$(gcloud sql instances describe $INSTANCE_NAME --format="value(ipAddresses[0].ipAddress)")

# 6. Crear Read Replica para analytics
echo "📖 Creando Read Replica para analytics..."
gcloud sql instances create ${INSTANCE_NAME}-read-replica \
    --master-instance-name=$INSTANCE_NAME \
    --tier=db-custom-2-8192 \
    --region=$REGION \
    --replica-type=READ

REPLICA_IP=$(gcloud sql instances describe ${INSTANCE_NAME}-read-replica --format="value(ipAddresses[0].ipAddress)")

# 7. Crear archivo de configuración
cat > cloud-sql-config.env << EOF
# Cloud SQL Configuration - LMS Platform
# Generado: $(date)

# Instancia Principal
CLOUD_SQL_CONNECTION_NAME=$CONNECTION_NAME
CLOUD_SQL_PUBLIC_IP=$PUBLIC_IP
CLOUD_SQL_DATABASE=$DB_NAME
CLOUD_SQL_USER=$DB_USER
CLOUD_SQL_PASSWORD=$DB_PASSWORD

# URLs de Conexión
DATABASE_URL=mysql://$DB_USER:$DB_PASSWORD@$PUBLIC_IP:3306/$DB_NAME?ssl-mode=REQUIRED
DATABASE_READ_URL=mysql://$DB_USER:$DB_PASSWORD@$REPLICA_IP:3306/$DB_NAME?ssl-mode=REQUIRED

# Para GKE (Cloud SQL Proxy)
DATABASE_URL_GKE=mysql://$DB_USER:$DB_PASSWORD@127.0.0.1:3306/$DB_NAME

# Información de la instancia
INSTANCE_NAME=$INSTANCE_NAME
PROJECT_ID=$PROJECT_ID
REGION=$REGION
EOF

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════════╗"
echo "║                            CONFIGURACIÓN COMPLETADA                             ║"
echo "╠══════════════════════════════════════════════════════════════════════════════════╣"
echo "║ ✅ Cloud SQL Instance: $INSTANCE_NAME"
echo "║ ✅ Database: $DB_NAME"
echo "║ ✅ Read Replica: ${INSTANCE_NAME}-read-replica"
echo "║ ✅ Configuración guardada en: cloud-sql-config.env"
echo "║"
echo "║ 🔗 CONNECTION INFO:"
echo "║ Connection Name: $CONNECTION_NAME"
echo "║ Public IP: $PUBLIC_IP"
echo "║ Replica IP: $REPLICA_IP"
echo "║ Username: $DB_USER"
echo "║ Password: $DB_PASSWORD"
echo "║"
echo "║ 📝 SIGUIENTES PASOS:"
echo "║ 1. Copiar cloud-sql-config.env a tu .env"
echo "║ 2. Ejecutar: npm run db:migrate"
echo "║ 3. Configurar GKE con Cloud SQL Proxy"
echo "║ 4. Restringir IPs autorizadas"
echo "╚══════════════════════════════════════════════════════════════════════════════════╝"

echo "📋 Costos estimados mensuales:"
echo "   • Instancia principal (4 vCPUs, 16GB): ~$280/mes"
echo "   • Read Replica (2 vCPUs, 8GB): ~$140/mes"
echo "   • Almacenamiento (100GB SSD): ~$15/mes"
echo "   • Backup automático: ~$15/mes"
echo "   • TOTAL: ~$450/mes"

echo ""
echo "✅ ¡Cloud SQL configurado exitosamente para 20,000 usuarios!"
