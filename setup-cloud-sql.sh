#!/bin/bash

# Script para configurar Cloud SQL para LMS Platform
# Ejecutar desde Google Cloud Shell o con gcloud CLI configurado

echo "🚀 Configurando Cloud SQL para LMS Platform..."

# Variables de configuración
PROJECT_ID="tu-project-id"
INSTANCE_NAME="lms-production"
REGION="us-central1"
DB_NAME="lms_platform"
DB_USER="lms_user"
DB_PASSWORD="$(openssl rand -base64 32)"

echo "📊 Configuración:"
echo "Project ID: $PROJECT_ID"
echo "Instance: $INSTANCE_NAME"
echo "Region: $REGION"
echo "Database: $DB_NAME"
echo "Usuario: $DB_USER"

# 1. Crear instancia Cloud SQL
echo "🏗️ Creando instancia Cloud SQL..."
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
    --storage-auto-increase-limit=500GB

# 2. Crear base de datos
echo "📚 Creando base de datos..."
gcloud sql databases create $DB_NAME \
    --instance=$INSTANCE_NAME

# 3. Crear usuario de aplicación
echo "👤 Creando usuario de aplicación..."
gcloud sql users create $DB_USER \
    --instance=$INSTANCE_NAME \
    --password="$DB_PASSWORD"

# 4. Configurar conexiones autorizadas (temporal - reemplazar con IP de GKE)
echo "🔐 Configurando acceso temporal..."
gcloud sql instances patch $INSTANCE_NAME \
    --authorized-networks=0.0.0.0/0

# 5. Obtener información de conexión
echo "📋 Información de conexión:"
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)")
PUBLIC_IP=$(gcloud sql instances describe $INSTANCE_NAME --format="value(ipAddresses[0].ipAddress)")

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    CONFIGURACIÓN COMPLETADA                     ║"
echo "╠══════════════════════════════════════════════════════════════════╣"
echo "║ Connection Name: $CONNECTION_NAME"
echo "║ Public IP: $PUBLIC_IP"
echo "║ Database: $DB_NAME"
echo "║ Username: $DB_USER"
echo "║ Password: $DB_PASSWORD"
echo "║"
echo "║ DATABASE_URL para .env:"
echo "║ mysql://$DB_USER:$DB_PASSWORD@$PUBLIC_IP:3306/$DB_NAME"
echo "║"
echo "║ Para GKE (Cloud SQL Proxy):"
echo "║ mysql://$DB_USER:$DB_PASSWORD@127.0.0.1:3306/$DB_NAME"
echo "╚══════════════════════════════════════════════════════════════════╝"

# 6. Crear Read Replica (opcional pero recomendado)
echo "🔄 ¿Crear Read Replica? (y/n)"
read -r CREATE_REPLICA

if [ "$CREATE_REPLICA" = "y" ]; then
    echo "📖 Creando Read Replica..."
    gcloud sql instances create ${INSTANCE_NAME}-read-replica \
        --master-instance-name=$INSTANCE_NAME \
        --tier=db-custom-2-8192 \
        --region=$REGION
    
    REPLICA_IP=$(gcloud sql instances describe ${INSTANCE_NAME}-read-replica --format="value(ipAddresses[0].ipAddress)")
    echo "║ Read Replica IP: $REPLICA_IP"
    echo "║ Read Replica URL: mysql://$DB_USER:$DB_PASSWORD@$REPLICA_IP:3306/$DB_NAME"
fi

echo "✅ Cloud SQL configurado exitosamente!"
echo "🔄 Siguiente paso: Actualizar .env y ejecutar prisma migrate"
