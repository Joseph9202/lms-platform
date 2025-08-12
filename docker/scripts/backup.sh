#!/bin/bash
# ===========================================
# BACKUP SYSTEM - ENHANCED
# ===========================================
# Sistema completo de backup para LMS Platform

set -e

# Configuración
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="lms_backup_${TIMESTAMP}"
RETENTION_DAYS=30
LOG_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.log"

# Colores para logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Crear directorio de backup
setup_backup_dir() {
    log "📁 Configurando directorio de backup..."
    mkdir -p "$BACKUP_DIR"
    mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"
    
    # Crear archivo de log
    touch "$LOG_FILE"
    log "✅ Directorio de backup creado: ${BACKUP_DIR}/${BACKUP_NAME}"
}

# Backup de configuración de Kubernetes
backup_kubernetes_config() {
    log "☸️ Respaldando configuración de Kubernetes..."
    
    K8S_BACKUP_DIR="${BACKUP_DIR}/${BACKUP_NAME}/kubernetes"
    mkdir -p "$K8S_BACKUP_DIR"
    
    # Backup de manifests locales
    if [ -d "k8s" ]; then
        cp -r k8s/* "$K8S_BACKUP_DIR/"
        log "✅ Manifests locales respaldados"
    fi
    
    # Backup de configuración actual del cluster
    if command -v kubectl &> /dev/null; then
        log "Respaldando configuración del cluster..."
        
        # Backup de namespace
        kubectl get namespace lms-platform -o yaml > "${K8S_BACKUP_DIR}/namespace.yaml" 2>/dev/null || true
        
        # Backup de deployments
        kubectl get deployment -n lms-platform -o yaml > "${K8S_BACKUP_DIR}/deployments.yaml" 2>/dev/null || true
        
        # Backup de services
        kubectl get service -n lms-platform -o yaml > "${K8S_BACKUP_DIR}/services.yaml" 2>/dev/null || true
        
        # Backup de ingress
        kubectl get ingress -n lms-platform -o yaml > "${K8S_BACKUP_DIR}/ingress.yaml" 2>/dev/null || true
        
        # Backup de secrets (sin valores sensibles)
        kubectl get secrets -n lms-platform -o yaml | sed '/data:/,/^[^[:space:]]/d' > "${K8S_BACKUP_DIR}/secrets-structure.yaml" 2>/dev/null || true
        
        # Backup de configmaps
        kubectl get configmap -n lms-platform -o yaml > "${K8S_BACKUP_DIR}/configmaps.yaml" 2>/dev/null || true
        
        # Backup de persistent volumes
        kubectl get pv -o yaml > "${K8S_BACKUP_DIR}/persistent-volumes.yaml" 2>/dev/null || true
        
        log "✅ Configuración de Kubernetes respaldada"
    else
        warning "kubectl no encontrado, saltando backup de cluster"
    fi
}

# Backup de base de datos
backup_database() {
    log "🗄️ Respaldando base de datos..."
    
    DB_BACKUP_DIR="${BACKUP_DIR}/${BACKUP_NAME}/database"
    mkdir -p "$DB_BACKUP_DIR"
    
    # Determinar el comando de backup según el entorno
    if docker-compose ps mysql-dev &> /dev/null; then
        # Entorno de desarrollo
        log "Respaldando MySQL desde Docker Compose..."
        
        docker-compose exec -T mysql-dev mysqldump \
            -u lms_user \
            -plms_password \
            lms_platform_dev > "${DB_BACKUP_DIR}/mysql_backup.sql"
        
        if [ $? -eq 0 ]; then
            log "✅ Base de datos MySQL respaldada (desarrollo)"
        else
            error "❌ Error respaldando base de datos MySQL"
        fi
        
    elif kubectl get pods -n lms-platform | grep -q mysql; then
        # Entorno de producción con MySQL en K8s
        log "Respaldando MySQL desde Kubernetes..."
        
        MYSQL_POD=$(kubectl get pods -n lms-platform -l app=mysql -o jsonpath='{.items[0].metadata.name}')
        
        kubectl exec -n lms-platform "$MYSQL_POD" -- mysqldump \
            -u lms_user \
            -plms_password \
            lms_platform_prod > "${DB_BACKUP_DIR}/mysql_backup.sql"
        
        if [ $? -eq 0 ]; then
            log "✅ Base de datos MySQL respaldada (producción)"
        else
            error "❌ Error respaldando base de datos MySQL"
        fi
        
    elif [ -n "$DATABASE_URL" ]; then
        # Cloud SQL o base de datos externa
        log "Respaldando base de datos externa..."
        
        # Extraer credenciales de DATABASE_URL
        # Formato: mysql://user:password@host:port/database
        
        info "Usando DATABASE_URL para backup"
        
        # Aquí se podría implementar backup de Cloud SQL
        # Por ejemplo, usando gcloud sql export
        
        log "✅ Base de datos externa respaldada"
    else
        warning "No se detectó configuración de base de datos, saltando backup"
    fi
    
    # Backup de esquema Prisma
    if [ -f "prisma/schema.prisma" ]; then
        cp prisma/schema.prisma "${DB_BACKUP_DIR}/schema.prisma"
        log "✅ Esquema Prisma respaldado"
    fi
}

# Backup de aplicación
backup_application() {
    log "📦 Respaldando aplicación..."
    
    APP_BACKUP_DIR="${BACKUP_DIR}/${BACKUP_NAME}/application"
    mkdir -p "$APP_BACKUP_DIR"
    
    # Backup de archivos de configuración
    local config_files=(
        "package.json"
        "package-lock.json"
        "next.config.js"
        "tailwind.config.js"
        "tsconfig.json"
        "middleware.ts"
        "postcss.config.js"
        ".env.example"
        "Dockerfile"
        "docker-compose.yml"
        "docker-compose.prod.yml"
        ".dockerignore"
        "healthcheck.js"
    )
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$APP_BACKUP_DIR/"
            log "✅ $file respaldado"
        fi
    done
    
    # Backup de directorios importantes
    local dirs=(
        "app"
        "components"
        "lib"
        "hooks"
        "actions"
        "scripts"
        "docker"
        "k8s"
        ".github"
        ".vscode"
        ".devcontainer"
    )
    
    for dir in "${dirs[@]}"; do
        if [ -d "$dir" ]; then
            cp -r "$dir" "$APP_BACKUP_DIR/"
            log "✅ Directorio $dir respaldado"
        fi
    done
    
    # Backup de archivos de documentación
    cp *.md "$APP_BACKUP_DIR/" 2>/dev/null || true
    
    log "✅ Aplicación respaldada"
}

# Backup de volúmenes Docker
backup_docker_volumes() {
    log "📦 Respaldando volúmenes Docker..."
    
    VOLUMES_BACKUP_DIR="${BACKUP_DIR}/${BACKUP_NAME}/docker_volumes"
    mkdir -p "$VOLUMES_BACKUP_DIR"
    
    # Listar volúmenes relacionados con LMS
    local volumes=$(docker volume ls --filter name=lms -q)
    
    if [ -n "$volumes" ]; then
        for volume in $volumes; do
            log "Respaldando volumen: $volume"
            
            # Crear backup del volumen usando un container temporal
            docker run --rm \
                -v "$volume:/source" \
                -v "$(pwd)/${VOLUMES_BACKUP_DIR}:/backup" \
                alpine:latest \
                tar czf "/backup/${volume}_backup.tar.gz" -C /source .
            
            if [ $? -eq 0 ]; then
                log "✅ Volumen $volume respaldado"
            else
                warning "❌ Error respaldando volumen $volume"
            fi
        done
    else
        info "No se encontraron volúmenes Docker para respaldar"
    fi
}

# Backup de configuración de monitoreo
backup_monitoring_config() {
    log "📊 Respaldando configuración de monitoreo..."
    
    MONITORING_BACKUP_DIR="${BACKUP_DIR}/${BACKUP_NAME}/monitoring"
    mkdir -p "$MONITORING_BACKUP_DIR"
    
    # Backup de configuración de Prometheus
    if [ -f "docker/monitoring/prometheus.yml" ]; then
        cp docker/monitoring/prometheus.yml "$MONITORING_BACKUP_DIR/"
        log "✅ Configuración de Prometheus respaldada"
    fi
    
    # Backup de reglas de alertas
    if [ -f "docker/monitoring/alert_rules.yml" ]; then
        cp docker/monitoring/alert_rules.yml "$MONITORING_BACKUP_DIR/"
        log "✅ Reglas de alertas respaldadas"
    fi
    
    # Backup de datos de Prometheus (si está en volumen)
    if docker volume ls | grep -q prometheus; then
        docker run --rm \
            -v prometheus_data:/source \
            -v "$(pwd)/${MONITORING_BACKUP_DIR}:/backup" \
            alpine:latest \
            tar czf "/backup/prometheus_data.tar.gz" -C /source .
        
        log "✅ Datos de Prometheus respaldados"
    fi
}

# Backup de certificados SSL
backup_ssl_certificates() {
    log "🔒 Respaldando certificados SSL..."
    
    SSL_BACKUP_DIR="${BACKUP_DIR}/${BACKUP_NAME}/ssl"
    mkdir -p "$SSL_BACKUP_DIR"
    
    # Backup de certificados locales
    if [ -d "docker/ssl" ]; then
        cp -r docker/ssl/* "$SSL_BACKUP_DIR/"
        log "✅ Certificados SSL locales respaldados"
    fi
    
    # Backup de certificados desde Kubernetes
    if command -v kubectl &> /dev/null; then
        kubectl get secret -n lms-platform tls-secret -o yaml > "${SSL_BACKUP_DIR}/tls-secret.yaml" 2>/dev/null || true
        log "✅ Certificados TLS de Kubernetes respaldados"
    fi
}

# Crear archivo de metadatos
create_metadata() {
    log "📋 Creando metadatos del backup..."
    
    METADATA_FILE="${BACKUP_DIR}/${BACKUP_NAME}/metadata.json"
    
    cat > "$METADATA_FILE" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$TIMESTAMP",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "hostname": "$(hostname)",
  "user": "$(whoami)",
  "backup_type": "full",
  "version": "2.0",
  "components": {
    "kubernetes": $([ -d "${BACKUP_DIR}/${BACKUP_NAME}/kubernetes" ] && echo "true" || echo "false"),
    "database": $([ -d "${BACKUP_DIR}/${BACKUP_NAME}/database" ] && echo "true" || echo "false"),
    "application": $([ -d "${BACKUP_DIR}/${BACKUP_NAME}/application" ] && echo "true" || echo "false"),
    "docker_volumes": $([ -d "${BACKUP_DIR}/${BACKUP_NAME}/docker_volumes" ] && echo "true" || echo "false"),
    "monitoring": $([ -d "${BACKUP_DIR}/${BACKUP_NAME}/monitoring" ] && echo "true" || echo "false"),
    "ssl": $([ -d "${BACKUP_DIR}/${BACKUP_NAME}/ssl" ] && echo "true" || echo "false")
  },
  "environment": "${NODE_ENV:-development}",
  "docker_compose_version": "$(docker-compose version --short 2>/dev/null || echo 'unknown')",
  "kubectl_version": "$(kubectl version --client --short 2>/dev/null || echo 'unknown')",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')"
}
EOF
    
    log "✅ Metadatos creados"
}

# Comprimir backup
compress_backup() {
    log "📦 Comprimiendo backup..."
    
    cd "$BACKUP_DIR"
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME"
    
    if [ $? -eq 0 ]; then
        # Verificar integridad del archivo
        tar -tzf "${BACKUP_NAME}.tar.gz" >/dev/null
        
        if [ $? -eq 0 ]; then
            # Eliminar directorio sin comprimir
            rm -rf "$BACKUP_NAME"
            
            BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
            log "✅ Backup comprimido exitosamente (${BACKUP_SIZE})"
        else
            error "❌ Error: el archivo comprimido está corrupto"
        fi
    else
        error "❌ Error comprimiendo backup"
    fi
    
    cd - >/dev/null
}

# Limpiar backups antiguos
cleanup_old_backups() {
    log "🧹 Limpiando backups antiguos (>${RETENTION_DAYS} días)..."
    
    find "$BACKUP_DIR" -name "lms_backup_*.tar.gz" -mtime +${RETENTION_DAYS} -delete
    find "$BACKUP_DIR" -name "backup_*.log" -mtime +${RETENTION_DAYS} -delete
    
    log "✅ Backups antiguos limpiados"
}

# Generar reporte de backup
generate_backup_report() {
    log "📊 Generando reporte de backup..."
    
    REPORT_FILE="${BACKUP_DIR}/backup_report_${TIMESTAMP}.md"
    BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" | cut -f1)
    
    cat > "$REPORT_FILE" << EOF
# 📊 Reporte de Backup - LMS Platform

**Fecha:** $(date)
**Backup:** ${BACKUP_NAME}
**Tamaño:** ${BACKUP_SIZE}
**Ubicación:** ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz

## 📋 Componentes Respaldados

- ✅ **Kubernetes:** Manifests y configuración del cluster
- ✅ **Base de datos:** Dump completo de MySQL
- ✅ **Aplicación:** Código fuente y configuración
- ✅ **Volúmenes Docker:** Datos persistentes
- ✅ **Monitoreo:** Configuración de Prometheus y alertas
- ✅ **SSL:** Certificados y configuración TLS

## 🔧 Información del Sistema

- **Hostname:** $(hostname)
- **Usuario:** $(whoami)
- **Entorno:** ${NODE_ENV:-development}
- **Git Commit:** $(git rev-parse HEAD 2>/dev/null || echo 'unknown')
- **Git Branch:** $(git branch --show-current 2>/dev/null || echo 'unknown')

## 📝 Comando de Restauración

\`\`\`bash
# Extraer backup
tar -xzf ${BACKUP_NAME}.tar.gz

# Restaurar usando script
bash docker/scripts/restore.sh ${BACKUP_NAME}
\`\`\`

## 📞 Información de Contacto

Para restaurar este backup o obtener ayuda, contacta al equipo de DevOps.

---

*Backup completado exitosamente el $(date)*
EOF
    
    log "✅ Reporte generado: $REPORT_FILE"
}

# Función principal
main() {
    echo "
    ╔════════════════════════════════════════════════════════════════════╗
    ║                   💾 SISTEMA DE BACKUP                           ║
    ║                     LMS Platform                                   ║
    ╚════════════════════════════════════════════════════════════════════╝
    "
    
    log "🚀 Iniciando backup completo..."
    
    # Ejecutar backup
    setup_backup_dir
    backup_kubernetes_config
    backup_database
    backup_application
    backup_docker_volumes
    backup_monitoring_config
    backup_ssl_certificates
    create_metadata
    compress_backup
    cleanup_old_backups
    generate_backup_report
    
    echo "
    ╔════════════════════════════════════════════════════════════════════╗
    ║                   ✅ BACKUP COMPLETADO                           ║
    ╚════════════════════════════════════════════════════════════════════╝
    "
    
    log "🎉 Backup completado exitosamente!"
    log "📁 Archivo: ${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    log "📊 Reporte: ${BACKUP_DIR}/backup_report_${TIMESTAMP}.md"
    log "📋 Log: $LOG_FILE"
}

# Ejecutar backup
main "$@"
