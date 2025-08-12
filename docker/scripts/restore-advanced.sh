#!/bin/bash
# ===========================================
# SISTEMA DE RESTORE AVANZADO - LMS PLATFORM
# Restauración completa automatizada desde backups
# ===========================================

set -euo pipefail

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
BACKUP_DIR="${PROJECT_ROOT}/backups"
RESTORE_DIR="${PROJECT_ROOT}/restore"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Configuración de Google Cloud
GCS_BUCKET="${GCS_BACKUP_BUCKET:-lms-platform-backups}"
GCP_PROJECT="${GCP_PROJECT_ID:-ai-academy-461719}"

# Configuración de Kubernetes
NAMESPACE="${K8S_NAMESPACE:-lms-platform}"
CLUSTER_NAME="${K8S_CLUSTER:-lms-cluster}"
CLUSTER_ZONE="${K8S_ZONE:-us-central1-a}"

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

# Variables globales
BACKUP_NAME=""
BACKUP_PATH=""
DRY_RUN=false
FORCE_RESTORE=false
RESTORE_COMPONENTS=()

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

show_help() {
    echo "Usage: $0 [BACKUP_NAME] [OPTIONS]"
    echo ""
    echo "ARGUMENTS:"
    echo "  BACKUP_NAME     Name of backup to restore (optional if --list is used)"
    echo ""
    echo "OPTIONS:"
    echo "  --list          List available backups"
    echo "  --dry-run       Show what would be restored without actually restoring"
    echo "  --force         Force restore without confirmation prompts"
    echo "  --components    Comma-separated list of components to restore"
    echo "                  (kubernetes,database,volumes,application)"
    echo "  --from-gcs      Download backup from Google Cloud Storage"
    echo "  --help          Show this help message"
    echo ""
    echo "COMPONENTS:"
    echo "  kubernetes      Restore Kubernetes manifests and configurations"
    echo "  database        Restore MySQL database"
    echo "  volumes         Restore persistent volumes from snapshots"
    echo "  application     Restore application configurations"
    echo ""
    echo "Examples:"
    echo "  $0 --list                                    # List available backups"
    echo "  $0 lms-platform-backup-20240115_143022      # Restore specific backup"
    echo "  $0 latest --components=database,application  # Restore only DB and app configs"
    echo "  $0 --from-gcs latest --dry-run              # Dry run restore from GCS"
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
                \"text\": \"$emoji LMS Platform Restore\",
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"fields\": [
                        {\"title\": \"Status\", \"value\": \"$message\", \"short\": true},
                        {\"title\": \"Timestamp\", \"value\": \"$(date)\", \"short\": true},
                        {\"title\": \"Backup\", \"value\": \"$BACKUP_NAME\", \"short\": true},
                        {\"title\": \"Details\", \"value\": \"$details\", \"short\": false}
                    ]
                }]
            }" \
            --silent --show-error || log_warning "Failed to send Slack notification"
    fi
}

list_available_backups() {
    log_step "Listando backups disponibles..."
    
    echo ""
    echo "📁 BACKUPS LOCALES:"
    echo "==================="
    
    if ls "$BACKUP_DIR"/*.tar.gz &> /dev/null; then
        for backup in "$BACKUP_DIR"/*.tar.gz; do
            local filename=$(basename "$backup")
            local size=$(du -h "$backup" | cut -f1)
            local date=$(stat -c %y "$backup" | cut -d' ' -f1)
            echo "  📦 $filename (${size}, ${date})"
        done
    else
        echo "  No hay backups locales disponibles"
    fi
    
    echo ""
    echo "☁️ BACKUPS EN GOOGLE CLOUD STORAGE:"
    echo "===================================="
    
    if command -v gsutil &> /dev/null; then
        if gsutil ls "gs://${GCS_BUCKET}/backups/" &> /dev/null; then
            gsutil ls -l "gs://${GCS_BUCKET}/backups/**/*.tar.gz" | \
            head -20 | \
            while read -r line; do
                if [[ $line =~ gs://.*\.tar\.gz$ ]]; then
                    local gcs_path=$(echo "$line" | awk '{print $3}')
                    local filename=$(basename "$gcs_path")
                    local size=$(echo "$line" | awk '{print $1}')
                    local date=$(echo "$line" | awk '{print $2}')
                    echo "  ☁️ $filename (${size} bytes, ${date})"
                fi
            done
        else
            echo "  No se puede acceder a GCS o no hay backups disponibles"
        fi
    else
        echo "  gsutil no está instalado"
    fi
    
    echo ""
    echo "💡 Para restaurar un backup:"
    echo "   $0 [BACKUP_NAME]"
    echo "   $0 latest  # Para el backup más reciente"
}

validate_backup() {
    local backup_file="$1"
    
    log_step "Validando integridad del backup..."
    
    # Verificar que el archivo existe
    if [[ ! -f "$backup_file" ]]; then
        log_error "Archivo de backup no encontrado: $backup_file"
        return 1
    fi
    
    # Verificar integridad del archivo tar
    if ! tar -tzf "$backup_file" > /dev/null 2>&1; then
        log_error "El archivo de backup está corrupto o no es un tar válido"
        return 1
    fi
    
    # Verificar que contiene el manifiesto
    if ! tar -tzf "$backup_file" | grep -q "backup-manifest.json"; then
        log_error "El backup no contiene un manifiesto válido"
        return 1
    fi
    
    log_success "Backup validado exitosamente"
    return 0
}

extract_backup() {
    local backup_file="$1"
    
    log_step "Extrayendo backup..."
    
    # Crear directorio de restore
    mkdir -p "$RESTORE_DIR"
    cd "$RESTORE_DIR"
    
    # Limpiar extracción anterior
    rm -rf "${BACKUP_NAME:?}/"
    
    # Extraer backup
    tar -xzf "$backup_file" || {
        log_error "Fallo la extracción del backup"
        return 1
    }
    
    # Verificar extracción
    if [[ ! -d "$BACKUP_NAME" ]]; then
        log_error "El backup no se extrajo correctamente"
        return 1
    fi
    
    BACKUP_PATH="$RESTORE_DIR/$BACKUP_NAME"
    log_success "Backup extraído en: $BACKUP_PATH"
}

read_backup_manifest() {
    local manifest_file="$BACKUP_PATH/backup-manifest.json"
    
    if [[ ! -f "$manifest_file" ]]; then
        log_error "No se encontró el manifiesto del backup"
        return 1
    fi
    
    log_info "📋 Información del backup:"
    
    # Leer información del manifiesto usando jq si está disponible
    if command -v jq &> /dev/null; then
        echo "  📅 Fecha: $(jq -r '.timestamp' "$manifest_file")"
        echo "  📏 Tamaño: $(jq -r '.backup_size_mb' "$manifest_file") MB"
        echo "  📁 Archivos: $(jq -r '.files_count' "$manifest_file")"
        echo "  🏷️ Versión: $(jq -r '.version' "$manifest_file")"
        echo ""
        echo "  🧩 Componentes incluidos:"
        jq -r '.components | to_entries[] | "    \(.key): \(.value)"' "$manifest_file"
    else
        log_warning "jq no está instalado, mostrando manifiesto raw:"
        cat "$manifest_file"
    fi
    
    echo ""
}

confirm_restore() {
    if [[ "$FORCE_RESTORE" == "true" ]]; then
        return 0
    fi
    
    echo -e "${YELLOW}⚠️ ADVERTENCIA: La restauración sobrescribirá la configuración actual${NC}"
    echo ""
    echo "📋 Componentes que serán restaurados:"
    for component in "${RESTORE_COMPONENTS[@]}"; do
        echo "  ✅ $component"
    done
    echo ""
    
    if [[ "$DRY_RUN" == "true" ]]; then
        echo -e "${BLUE}🔍 Modo DRY RUN: No se realizarán cambios reales${NC}"
        return 0
    fi
    
    read -p "¿Estás seguro de que quieres continuar? (y/N): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Restauración cancelada por el usuario"
        exit 0
    fi
}

restore_kubernetes_manifests() {
    if [[ ! " ${RESTORE_COMPONENTS[@]} " =~ " kubernetes " ]]; then
        return 0
    fi
    
    log_step "Restaurando manifiestos de Kubernetes..."
    
    local k8s_backup_dir="$BACKUP_PATH/kubernetes"
    
    if [[ ! -d "$k8s_backup_dir" ]]; then
        log_warning "No se encontraron manifiestos de Kubernetes en el backup"
        return 0
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Se restaurarían los siguientes recursos:"
        find "$k8s_backup_dir" -name "*.yaml" -exec basename {} \;
        return 0
    fi
    
    # Verificar conexión al cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_warning "No conectado al cluster, intentando conectar..."
        gcloud container clusters get-credentials "$CLUSTER_NAME" --zone "$CLUSTER_ZONE" || {
            log_error "No se puede conectar al cluster de Kubernetes"
            return 1
        }
    fi
    
    # Crear namespace si no existe
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f - || true
    
    # Restaurar recursos en orden
    local resources=(
        "secrets"
        "configmaps"
        "persistentvolumeclaims"
        "services"
        "deployments"
        "ingresses"
        "horizontalpodautoscalers"
    )
    
    for resource in "${resources[@]}"; do
        local resource_file="$k8s_backup_dir/${resource}.yaml"
        
        if [[ -f "$resource_file" ]]; then
            log_info "Restaurando $resource..."
            
            if kubectl apply -f "$resource_file" -n "$NAMESPACE"; then
                log_success "$resource restaurado"
            else
                log_warning "Fallo la restauración de $resource"
            fi
        else
            log_info "No se encontró $resource en el backup"
        fi
    done
    
    # Restaurar Helm releases si existen
    if [[ -f "$k8s_backup_dir/helm-releases.yaml" ]] && command -v helm &> /dev/null; then
        log_info "Información de Helm releases disponible en el backup"
        log_info "Revisa helm-releases.yaml para restauración manual si es necesario"
    fi
    
    log_success "Restauración de Kubernetes completada"
}

restore_database() {
    if [[ ! " ${RESTORE_COMPONENTS[@]} " =~ " database " ]]; then
        return 0
    fi
    
    log_step "Restaurando base de datos..."
    
    local db_backup_dir="$BACKUP_PATH/database"
    
    if [[ ! -d "$db_backup_dir" ]]; then
        log_warning "No se encontró backup de base de datos"
        return 0
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Se restauraría la base de datos desde:"
        find "$db_backup_dir" -name "*.sql*" -exec basename {} \;
        return 0
    fi
    
    # Obtener credenciales de la base de datos
    local db_url
    if db_url=$(kubectl get secret lms-platform-secrets -n "$NAMESPACE" -o jsonpath='{.data.DATABASE_URL}' 2>/dev/null | base64 -d); then
        log_info "Credenciales de DB obtenidas desde Kubernetes secret"
    else
        log_warning "No se pudieron obtener credenciales de DB desde Kubernetes"
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
    
    # Buscar archivo de dump
    local dump_file
    if [[ -f "$db_backup_dir/database-dump.sql.gz" ]]; then
        dump_file="$db_backup_dir/database-dump.sql.gz"
        log_info "Encontrado dump comprimido"
    elif [[ -f "$db_backup_dir/database-dump.sql" ]]; then
        dump_file="$db_backup_dir/database-dump.sql"
        log_info "Encontrado dump sin comprimir"
    else
        log_error "No se encontró archivo de dump de base de datos"
        return 1
    fi
    
    # Crear backup de seguridad antes de restaurar
    log_info "Creando backup de seguridad de la base de datos actual..."
    local safety_backup="$db_backup_dir/pre-restore-backup-$(date +%Y%m%d_%H%M%S).sql"
    
    mysqldump \
        --host="$db_host" \
        --port="$db_port" \
        --user="$db_user" \
        --password="$db_pass" \
        --single-transaction \
        --routines \
        --triggers \
        "$db_name" > "$safety_backup" || {
        log_warning "No se pudo crear backup de seguridad"
    }
    
    # Restaurar base de datos
    log_info "Restaurando base de datos..."
    
    if [[ "$dump_file" == *.gz ]]; then
        zcat "$dump_file" | mysql \
            --host="$db_host" \
            --port="$db_port" \
            --user="$db_user" \
            --password="$db_pass" \
            "$db_name" || {
            log_error "Fallo la restauración de base de datos"
            return 1
        }
    else
        mysql \
            --host="$db_host" \
            --port="$db_port" \
            --user="$db_user" \
            --password="$db_pass" \
            "$db_name" < "$dump_file" || {
            log_error "Fallo la restauración de base de datos"
            return 1
        }
    fi
    
    log_success "Base de datos restaurada exitosamente"
}

restore_persistent_volumes() {
    if [[ ! " ${RESTORE_COMPONENTS[@]} " =~ " volumes " ]]; then
        return 0
    fi
    
    log_step "Restaurando volúmenes persistentes..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Se restaurarían los volúmenes persistentes desde snapshots"
        return 0
    fi
    
    # Listar snapshots disponibles del backup
    local snapshot_pattern="${BACKUP_NAME}-*-snapshot"
    
    log_info "Buscando snapshots con patrón: $snapshot_pattern"
    
    local snapshots
    if snapshots=$(gcloud compute snapshots list --filter="name~$snapshot_pattern" --format="value(name)" --project="$GCP_PROJECT" 2>/dev/null); then
        if [[ -n "$snapshots" ]]; then
            echo "$snapshots" | while read -r snapshot; do
                log_info "Snapshot disponible: $snapshot"
                # Aquí podrías implementar la lógica para restaurar desde snapshot
                # Por ejemplo, crear nuevos discos desde snapshots
            done
        else
            log_warning "No se encontraron snapshots para este backup"
        fi
    else
        log_warning "No se pueden listar snapshots o gcloud no está configurado"
    fi
    
    log_info "Restauración de volúmenes requiere intervención manual"
    log_info "Consulta la documentación para restaurar desde snapshots específicos"
}

restore_application_data() {
    if [[ ! " ${RESTORE_COMPONENTS[@]} " =~ " application " ]]; then
        return 0
    fi
    
    log_step "Restaurando datos de aplicación..."
    
    local app_backup_dir="$BACKUP_PATH/application"
    
    if [[ ! -d "$app_backup_dir" ]]; then
        log_warning "No se encontraron datos de aplicación en el backup"
        return 0
    fi
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN: Se restaurarían los siguientes archivos de aplicación:"
        find "$app_backup_dir" -type f -exec basename {} \;
        return 0
    fi
    
    # Restaurar configuraciones
    local files_to_restore=(
        ".env.production"
        "next.config.js"
    )
    
    for file in "${files_to_restore[@]}"; do
        if [[ -f "$app_backup_dir/$file" ]]; then
            log_info "Restaurando $file..."
            cp "$app_backup_dir/$file" "$PROJECT_ROOT/" || {
                log_warning "No se pudo restaurar $file"
            }
        fi
    done
    
    # Restaurar directorios
    local dirs_to_restore=(
        "prisma"
        "k8s"
        "helm"
        "scripts"
    )
    
    for dir in "${dirs_to_restore[@]}"; do
        if [[ -d "$app_backup_dir/$dir" ]]; then
            log_info "Restaurando directorio $dir..."
            
            # Crear backup del directorio actual si existe
            if [[ -d "$PROJECT_ROOT/$dir" ]]; then
                mv "$PROJECT_ROOT/$dir" "$PROJECT_ROOT/${dir}.backup.$(date +%Y%m%d_%H%M%S)" || true
            fi
            
            cp -r "$app_backup_dir/$dir" "$PROJECT_ROOT/" || {
                log_warning "No se pudo restaurar directorio $dir"
            }
        fi
    done
    
    log_success "Datos de aplicación restaurados"
}

verify_restore() {
    log_step "Verificando restauración..."
    
    local verification_failed=false
    
    # Verificar Kubernetes si fue restaurado
    if [[ " ${RESTORE_COMPONENTS[@]} " =~ " kubernetes " ]] && [[ "$DRY_RUN" != "true" ]]; then
        if kubectl get pods -n "$NAMESPACE" &> /dev/null; then
            local pod_count=$(kubectl get pods -n "$NAMESPACE" --no-headers | wc -l)
            log_info "✅ Kubernetes: $pod_count pods encontrados en namespace $NAMESPACE"
        else
            log_warning "❌ Kubernetes: No se pudieron verificar los pods"
            verification_failed=true
        fi
    fi
    
    # Verificar base de datos si fue restaurada
    if [[ " ${RESTORE_COMPONENTS[@]} " =~ " database " ]] && [[ "$DRY_RUN" != "true" ]]; then
        # Aquí podrías agregar verificaciones específicas de la DB
        log_info "ℹ️ Database: Verificación manual recomendada"
    fi
    
    # Verificar archivos de aplicación
    if [[ " ${RESTORE_COMPONENTS[@]} " =~ " application " ]] && [[ "$DRY_RUN" != "true" ]]; then
        if [[ -f "$PROJECT_ROOT/.env.production" ]] || [[ -d "$PROJECT_ROOT/prisma" ]]; then
            log_info "✅ Application: Archivos de configuración restaurados"
        else
            log_warning "❌ Application: No se verificaron archivos de configuración"
            verification_failed=true
        fi
    fi
    
    if [[ "$verification_failed" == "true" ]]; then
        log_warning "Algunas verificaciones fallaron. Revisa manualmente."
        return 1
    else
        log_success "Verificación completada exitosamente"
        return 0
    fi
}

cleanup_restore() {
    log_step "Limpiando archivos temporales..."
    
    if [[ -n "$RESTORE_DIR" ]] && [[ -d "$RESTORE_DIR" ]]; then
        # Conservar logs pero limpiar extracciones
        find "$RESTORE_DIR" -name "lms-platform-backup-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
    fi
    
    log_success "Limpieza completada"
}

# ===========================================
# PARSEAR ARGUMENTOS
# ===========================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --list)
            list_available_backups
            exit 0
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE_RESTORE=true
            shift
            ;;
        --components)
            IFS=',' read -ra RESTORE_COMPONENTS <<< "$2"
            shift 2
            ;;
        --from-gcs)
            FROM_GCS=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            if [[ -z "$BACKUP_NAME" ]]; then
                BACKUP_NAME="$1"
            else
                log_error "Argumento desconocido: $1"
                show_help
                exit 1
            fi
            shift
            ;;
    esac
done

# Configurar componentes por defecto si no se especificaron
if [[ ${#RESTORE_COMPONENTS[@]} -eq 0 ]]; then
    RESTORE_COMPONENTS=("kubernetes" "database" "volumes" "application")
fi

# Verificar que se especificó un backup
if [[ -z "$BACKUP_NAME" ]]; then
    log_error "Debes especificar un backup para restaurar"
    echo ""
    show_help
    exit 1
fi

# ===========================================
# FUNCIÓN PRINCIPAL
# ===========================================

main() {
    local start_time=$(date +%s)
    
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════════════╗"
    echo "║                    🔄 LMS PLATFORM RESTORE SYSTEM                    ║"
    echo "║                     Advanced Automated Recovery                      ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log_info "Iniciando restore: $BACKUP_NAME"
    log_info "Timestamp: $(date)"
    log_info "Componentes: ${RESTORE_COMPONENTS[*]}"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "Modo: DRY RUN (no se harán cambios reales)"
    fi
    
    echo ""
    
    # Determinar ruta del backup
    if [[ "$BACKUP_NAME" == "latest" ]]; then
        # Buscar el backup más reciente
        if [[ "${FROM_GCS:-false}" == "true" ]]; then
            log_error "Búsqueda de 'latest' en GCS no implementada aún"
            exit 1
        else
            local latest_backup=$(ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -1)
            if [[ -z "$latest_backup" ]]; then
                log_error "No se encontraron backups locales"
                exit 1
            fi
            BACKUP_NAME=$(basename "$latest_backup" .tar.gz)
            BACKUP_PATH="$latest_backup"
        fi
    elif [[ "${FROM_GCS:-false}" == "true" ]]; then
        # Descargar desde GCS
        log_step "Descargando backup desde GCS..."
        local gcs_path="gs://${GCS_BUCKET}/backups/${BACKUP_NAME}.tar.gz"
        local local_path="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
        
        if gsutil cp "$gcs_path" "$local_path"; then
            BACKUP_PATH="$local_path"
            log_success "Backup descargado desde GCS"
        else
            log_error "No se pudo descargar el backup desde GCS"
            exit 1
        fi
    else
        # Backup local
        BACKUP_PATH="$BACKUP_DIR/${BACKUP_NAME}.tar.gz"
    fi
    
    # Ejecutar restore
    if validate_backup "$BACKUP_PATH" && \
       extract_backup "$BACKUP_PATH" && \
       read_backup_manifest && \
       confirm_restore && \
       restore_kubernetes_manifests && \
       restore_database && \
       restore_persistent_volumes && \
       restore_application_data && \
       verify_restore; then
        
        cleanup_restore
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_success "¡Restore completado exitosamente!"
        log_info "Duración: ${duration} segundos"
        log_info "Backup restaurado: $BACKUP_NAME"
        
        send_notification "success" "Restore completado exitosamente" "Duración: ${duration}s"
        
        if [[ "$DRY_RUN" != "true" ]]; then
            echo ""
            log_info "📋 Próximos pasos recomendados:"
            echo "  1. Verificar funcionamiento de la aplicación"
            echo "  2. Revisar logs de aplicación"
            echo "  3. Verificar integridad de datos"
            echo "  4. Realizar pruebas funcionales"
        fi
        
        exit 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        log_error "Restore falló después de ${duration} segundos"
        send_notification "error" "Restore falló" "Revisa los logs para más detalles"
        
        cleanup_restore
        exit 1
    fi
}

# Ejecutar función principal
main "$@"
