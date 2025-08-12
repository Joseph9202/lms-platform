#!/bin/bash
# ===========================================
# SISTEMA DE BACKUP AVANZADO - LMS PLATFORM
# Backup completo automatizado con múltiples destinos
# ===========================================

set -euo pipefail

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="lms-platform-backup-${TIMESTAMP}"

# Configuración de Google Cloud
GCS_BUCKET="${GCS_BACKUP_BUCKET:-lms-platform-backups}"
GCP_PROJECT="${GCP_PROJECT_ID:-ai-academy-461719}"

# Configuración de Kubernetes
NAMESPACE="${K8S_NAMESPACE:-lms-platform}"
CLUSTER_NAME="${K8S_CLUSTER:-lms-cluster}"
CLUSTER_ZONE="${K8S_ZONE:-us-central1-a}"

# Configuración de retención
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
LOCAL_RETENTION_DAYS="${LOCAL_RETENTION_DAYS:-7}"

# Configuración de notificaciones
SLACK_WEBHOOK="${SLACK_WEBHOOK_URL:-}"
EMAIL_RECIPIENT="${BACKUP_EMAIL:-}"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# ===========================================
# FUNCIONES AUXILIARES
# ===========================================

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}[$(date +'%Y-%m-%d %H:%M:%S')] 🔄 $1${NC}"
}

send_notification() {
    local status="$1"
    local message="$2"
    local details="${3:-}"
    
    # Slack notification
    if [[ -n "$SLACK_WEBHOOK" ]]; then
        local emoji="✅"
        local color="good"
        
        case "$status" in
            "error")
                emoji="❌"
                color="danger"
                ;;
            "warning")
                emoji="⚠️"
                color="warning"
                ;;
        esac
        
        curl -X POST "$SLACK_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{
                \"text\": \"$emoji LMS Platform Backup\",
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"fields\": [
                        {\"title\": \"Status\", \"value\": \"$message\", \"short\": true},
                        {\"title\": \"Timestamp\", \"value\": \"$(date)\", \"short\": true},
                        {\"title\": \"Backup Name\", \"value\": \"$BACKUP_NAME\", \"short\": true},
                        {\"title\": \"Details\", \"value\": \"$details\", \"short\": false}
                    ]
                }]
            }" \
            --silent --show-error || log_warning "Failed to send Slack notification"
    fi
    
    # Email notification (si está configurado)
    if [[ -n "$EMAIL_RECIPIENT" ]] && command -v mail &> /dev/null; then
        echo -e "Status: $message\nTimestamp: $(date)\nDetails: $details" | \
        mail -s "LMS Platform Backup - $status" "$EMAIL_RECIPIENT" || \
        log_warning "Failed to send email notification"
    fi
}

check_prerequisites() {
    log_step "Verificando prerrequisitos..."
    
    # Verificar kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl no está instalado"
        exit 1
    fi
    
    # Verificar gcloud
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI no está instalado"
        exit 1
    fi
    
    # Verificar conexión al cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_warning "No conectado al cluster, intentando conectar..."
        gcloud container clusters get-credentials "$CLUSTER_NAME" --zone "$CLUSTER_ZONE" || {
            log_error "No se puede conectar al cluster de Kubernetes"
            exit 1
        }
    fi
    
    # Crear directorio de backup
    mkdir -p "$BACKUP_DIR"
    
    log_success "Prerrequisitos verificados"
}

backup_kubernetes_manifests() {
    log_step "Respaldando manifests de Kubernetes..."
    
    local k8s_backup_dir="${BACKUP_DIR}/${BACKUP_NAME}/kubernetes"
    mkdir -p "$k8s_backup_dir"
    
    # Backup de recursos específicos del namespace
    local resources=(
        "deployments"
        "services"
        "ingresses"
        "configmaps"
        "secrets"
        "persistentvolumeclaims"
        "horizontalpodautoscalers"
        "servicemonitors"
    )
    
    for resource in "${resources[@]}"; do
        log_info "Respaldando $resource..."
        if kubectl get "$resource" -n "$NAMESPACE" -o yaml > "${k8s_backup_dir}/${resource}.yaml" 2>/dev/null; then
            log_success "$resource respaldado"
        else
            log_warning "No se encontraron $resource o error en el backup"
        fi
    done
    
    # Backup de recursos cluster-wide relacionados
    log_info "Respaldando recursos cluster-wide..."
    kubectl get nodes -o yaml > "${k8s_backup_dir}/nodes.yaml" 2>/dev/null || true
    kubectl get persistentvolumes -o yaml > "${k8s_backup_dir}/persistentvolumes.yaml" 2>/dev/null || true
    kubectl get storageclasses -o yaml > "${k8s_backup_dir}/storageclasses.yaml" 2>/dev/null || true
    
    # Backup de Helm releases
    if command -v helm &> /dev/null; then
        log_info "Respaldando Helm releases..."
        helm list -n "$NAMESPACE" -o yaml > "${k8s_backup_dir}/helm-releases.yaml" 2>/dev/null || true
        
        # Obtener values de cada release
        local releases=$(helm list -n "$NAMESPACE" -q 2>/dev/null || true)
        if [[ -n "$releases" ]]; then
            while IFS= read -r release; do
                if [[ -n "$release" ]]; then
                    helm get values "$release" -n "$NAMESPACE" > "${k8s_backup_dir}/helm-values-${release}.yaml" 2>/dev/null || true
                fi
            done <<< "$releases"
        fi
    fi
    
    log_success "Backup de Kubernetes completado"
}

backup_database() {
    log_step "Respaldando base de datos..."
    
    local db_backup_dir="${BACKUP_DIR}/${BACKUP_NAME}/database"
    mkdir -p "$db_backup_dir"
    
    # Obtener credenciales de la base de datos desde secrets
    local db_url
    if db_url=$(kubectl get secret lms-platform-secrets -n "$NAMESPACE" -o jsonpath='{.data.DATABASE_URL}' 2>/dev/null | base64 -d); then
        log_info "Credenciales de DB obtenidas desde Kubernetes secret"
    else
        log_warning "No se pudieron obtener credenciales de DB desde Kubernetes"
        # Intentar desde variables de entorno locales
        db_url="${DATABASE_URL:-}"
        if [[ -z "$db_url" ]]; then
            log_error "No se encontraron credenciales de base de datos"
            return 1
        fi
    fi
    
    # Parsear URL de conexión
    local db_user db_pass db_host db_port db_name
    if [[ "$db_url" =~ mysql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
        db_user="${BASH_REMATCH[1]}"
        db_pass="${BASH_REMATCH[2]}"
        db_host="${BASH_REMATCH[3]}"
        db_port="${BASH_REMATCH[4]}"
        db_name="${BASH_REMATCH[5]}"
    else
        log_error "Formato de URL de base de datos inválido"
        return 1
    fi
    
    # Realizar backup usando Cloud SQL Proxy si es necesario
    if [[ "$db_host" == *"cloudsql"* ]] || [[ "$db_host" == *"googleapis.com"* ]]; then
        log_info "Detectado Cloud SQL, usando gcloud para backup..."
        
        # Obtener instance name desde el host
        local instance_name
        if [[ "$db_host" =~ ([^.]+)\. ]]; then
            instance_name="${BASH_REMATCH[1]}"
        else
            log_error "No se pudo determinar el nombre de la instancia de Cloud SQL"
            return 1
        fi
        
        # Crear backup usando gcloud
        gcloud sql backups create --instance="$instance_name" --project="$GCP_PROJECT" || {
            log_error "Fallo el backup de Cloud SQL"
            return 1
        }
        
        # También crear un dump local
        log_info "Creando dump local adicional..."
        gcloud sql export sql "$instance_name" "gs://${GCS_BUCKET}/manual-dumps/${BACKUP_NAME}.sql" \
            --database="$db_name" --project="$GCP_PROJECT" || {
            log_warning "Fallo el dump manual de Cloud SQL"
        }
        
    else
        log_info "Creando dump de MySQL..."
        
        # Dump directo con mysqldump
        mysqldump \
            --host="$db_host" \
            --port="$db_port" \
            --user="$db_user" \
            --password="$db_pass" \
            --single-transaction \
            --routines \
            --triggers \
            --add-drop-database \
            --databases "$db_name" \
            --result-file="${db_backup_dir}/database-dump.sql" || {
            log_error "Fallo el backup de base de datos"
            return 1
        }
        
        # Comprimir el dump
        gzip "${db_backup_dir}/database-dump.sql"
    fi
    
    log_success "Backup de base de datos completado"
}

backup_persistent_volumes() {
    log_step "Respaldando volúmenes persistentes..."
    
    local pv_backup_dir="${BACKUP_DIR}/${BACKUP_NAME}/volumes"
    mkdir -p "$pv_backup_dir"
    
    # Obtener lista de PVCs
    local pvcs
    if pvcs=$(kubectl get pvc -n "$NAMESPACE" -o jsonpath='{.items[*].metadata.name}' 2>/dev/null); then
        if [[ -n "$pvcs" ]]; then
            for pvc in $pvcs; do
                log_info "Respaldando PVC: $pvc"
                
                # Crear snapshot del volumen si es Google Cloud
                local pv_name
                pv_name=$(kubectl get pvc "$pvc" -n "$NAMESPACE" -o jsonpath='{.spec.volumeName}' 2>/dev/null || true)
                
                if [[ -n "$pv_name" ]]; then
                    # Intentar crear snapshot
                    local snapshot_name="${BACKUP_NAME}-${pvc}-snapshot"
                    
                    # Para Google Cloud Persistent Disks
                    local disk_name
                    disk_name=$(kubectl get pv "$pv_name" -o jsonpath='{.spec.gcePersistentDisk.pdName}' 2>/dev/null || true)
                    
                    if [[ -n "$disk_name" ]]; then
                        gcloud compute disks snapshot "$disk_name" \
                            --snapshot-names="$snapshot_name" \
                            --zone="$CLUSTER_ZONE" \
                            --project="$GCP_PROJECT" || {
                            log_warning "Fallo el snapshot del disco $disk_name"
                        }
                    else
                        log_warning "No se pudo determinar el disco para PVC $pvc"
                    fi
                fi
            done
        else
            log_info "No se encontraron PVCs para respaldar"
        fi
    else
        log_warning "Error obteniendo lista de PVCs"
    fi
    
    log_success "Backup de volúmenes completado"
}

backup_application_data() {
    log_step "Respaldando datos específicos de la aplicación..."
    
    local app_backup_dir="${BACKUP_DIR}/${BACKUP_NAME}/application"
    mkdir -p "$app_backup_dir"
    
    # Backup de configuraciones de la aplicación
    if [[ -f "${PROJECT_ROOT}/.env.production" ]]; then
        cp "${PROJECT_ROOT}/.env.production" "${app_backup_dir}/" || true
    fi
    
    if [[ -f "${PROJECT_ROOT}/next.config.js" ]]; then
        cp "${PROJECT_ROOT}/next.config.js" "${app_backup_dir}/" || true
    fi
    
    # Backup de archivos de Prisma
    if [[ -d "${PROJECT_ROOT}/prisma" ]]; then
        cp -r "${PROJECT_ROOT}/prisma" "${app_backup_dir}/" || true
    fi
    
    # Backup de configuraciones Docker y Kubernetes
    if [[ -d "${PROJECT_ROOT}/k8s" ]]; then
        cp -r "${PROJECT_ROOT}/k8s" "${app_backup_dir}/" || true
    fi
    
    if [[ -d "${PROJECT_ROOT}/helm" ]]; then
        cp -r "${PROJECT_ROOT}/helm" "${app_backup_dir}/" || true
    fi
    
    # Backup de scripts importantes
    if [[ -d "${PROJECT_ROOT}/scripts" ]]; then
        cp -r "${PROJECT_ROOT}/scripts" "${app_backup_dir}/" || true
    fi
    
    log_success "Backup de datos de aplicación completado"
}

create_backup_manifest() {
    log_step "Creando manifiesto de backup..."
    
    local manifest_file="${BACKUP_DIR}/${BACKUP_NAME}/backup-manifest.json"
    
    cat > "$manifest_file" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "version": "1.0",
  "cluster": {
    "name": "$CLUSTER_NAME",
    "zone": "$CLUSTER_ZONE",
    "namespace": "$NAMESPACE"
  },
  "components": {
    "kubernetes_manifests": true,
    "database": true,
    "persistent_volumes": true,
    "application_data": true
  },
  "retention": {
    "local_days": $LOCAL_RETENTION_DAYS,
    "remote_days": $RETENTION_DAYS
  },
  "tools_versions": {
    "kubectl": "$(kubectl version --client --short 2>/dev/null | cut -d' ' -f3 || echo 'unknown')",
    "helm": "$(helm version --short 2>/dev/null || echo 'not installed')",
    "gcloud": "$(gcloud version --format='value(Google Cloud SDK)' 2>/dev/null || echo 'unknown')"
  },
  "backup_size_mb": $(du -sm "${BACKUP_DIR}/${BACKUP_NAME}" | cut -f1),
  "files_count": $(find "${BACKUP_DIR}/${BACKUP_NAME}" -type f | wc -l)
}
EOF
    
    log_success "Manifiesto de backup creado"
}

compress_backup() {
    log_step "Comprimiendo backup..."
    
    cd "$BACKUP_DIR"
    
    # Crear archivo comprimido
    tar -czf "${BACKUP_NAME}.tar.gz" "$BACKUP_NAME/" || {
        log_error "Fallo la compresión del backup"
        return 1
    }
    
    # Verificar integridad
    if tar -tzf "${BACKUP_NAME}.tar.gz" > /dev/null; then
        log_success "Backup comprimido y verificado"
        
        # Eliminar directorio no comprimido
        rm -rf "$BACKUP_NAME/"
        
        # Mostrar información del archivo
        local file_size
        file_size=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
        log_info "Tamaño del backup: $file_size"
    else
        log_error "El backup comprimido está corrupto"
        return 1
    fi
}

upload_to_gcs() {
    log_step "Subiendo backup a Google Cloud Storage..."
    
    local backup_file="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    local gcs_path="gs://${GCS_BUCKET}/backups/$(date +%Y/%m)/${BACKUP_NAME}.tar.gz"
    
    if gsutil cp "$backup_file" "$gcs_path"; then
        log_success "Backup subido a GCS: $gcs_path"
        
        # Configurar lifecycle de objeto si es necesario
        gsutil lifecycle set - "$gcs_path" << EOF || true
{
  "rule": [{
    "action": {"type": "Delete"},
    "condition": {"age": $RETENTION_DAYS}
  }]
}
EOF
        
        return 0
    else
        log_error "Fallo la subida a GCS"
        return 1
    fi
}

cleanup_old_backups() {
    log_step "Limpiando backups antiguos..."
    
    # Limpiar backups locales antiguos
    find "$BACKUP_DIR" -name "lms-platform-backup-*.tar.gz" -mtime +$LOCAL_RETENTION_DAYS -delete || true
    
    # Limpiar backups en GCS (se hace automáticamente con lifecycle policies)
    log_info "Backups locales antiguos eliminados (>$LOCAL_RETENTION_DAYS días)"
    
    log_success "Limpieza completada"
}

# ===========================================
# FUNCIÓN PRINCIPAL
# ===========================================

main() {
    local start_time=$(date +%s)
    
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════════════╗"
    echo "║                    💾 LMS PLATFORM BACKUP SYSTEM                     ║"
    echo "║                     Advanced Automated Backup                        ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log_info "Iniciando backup: $BACKUP_NAME"
    log_info "Timestamp: $(date)"
    log_info "Cluster: $CLUSTER_NAME ($CLUSTER_ZONE)"
    log_info "Namespace: $NAMESPACE"
    echo
    
    # Ejecutar backup
    if check_prerequisites && \
       backup_kubernetes_manifests && \
       backup_database && \
       backup_persistent_volumes && \
       backup_application_data && \
       create_backup_manifest && \
       compress_backup && \
       upload_to_gcs; then
        
        # Limpiar backups antiguos
        cleanup_old_backups
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_success "¡Backup completado exitosamente!"
        log_info "Duración: ${duration} segundos"
        log_info "Archivo: ${BACKUP_NAME}.tar.gz"
        
        send_notification "success" "Backup completado exitosamente" "Duración: ${duration}s"
        
        exit 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_error "Backup falló después de ${duration} segundos"
        send_notification "error" "Backup falló" "Revisa los logs para más detalles"
        
        exit 1
    fi
}

# Ejecutar función principal
main "$@"
