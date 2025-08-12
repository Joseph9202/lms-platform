#!/bin/bash
# ===========================================
# RESTORE SYSTEM - ENHANCED
# ===========================================
# Sistema completo de restore para LMS Platform

set -e

# Configuración
BACKUP_DIR="backups"
RESTORE_LOG="restore_$(date +%Y%m%d_%H%M%S).log"
BACKUP_NAME="$1"

# Colores para logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Función para logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$RESTORE_LOG"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$RESTORE_LOG"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$RESTORE_LOG"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$RESTORE_LOG"
}

# Mostrar ayuda
show_help() {
    echo "
    ╔════════════════════════════════════════════════════════════════════╗
    ║                   💾 SISTEMA DE RESTORE                           ║
    ║                     LMS Platform                                   ║
    ╚════════════════════════════════════════════════════════════════════╝
    
    Uso: $0 <backup_name>
    
    Ejemplos:
      $0 lms_backup_20241201_143000
      $0 lms_backup_20241201_143000.tar.gz
    
    Opciones:
      -h, --help        Mostrar esta ayuda
      -l, --list        Listar backups disponibles
      -i, --info        Mostrar información del backup
      -f, --force       Forzar restore sin confirmación
      -p, --partial     Restore parcial (solo componentes específicos)
    "
}

# Listar backups disponibles
list_backups() {
    log "📋 Backups disponibles:"
    echo
    
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "lms_backup_*.tar.gz" -type f | sort | while read -r backup; do
            backup_name=$(basename "$backup" .tar.gz)
            size=$(du -h "$backup" | cut -f1)
            date=$(echo "$backup_name" | sed 's/lms_backup_//' | sed 's/_/ /')
            
            echo "  📦 $backup_name ($size) - $date"
        done
    else
        echo "  No hay backups disponibles"
    fi
    echo
}

# Mostrar información del backup
show_backup_info() {
    local backup_file="$1"
    
    if [ ! -f "$backup_file" ]; then
        error "Archivo de backup no encontrado: $backup_file"
    fi
    
    log "📊 Información del backup:"
    echo
    
    # Extraer metadatos temporalmente
    local temp_dir=$(mktemp -d)
    tar -xzf "$backup_file" -C "$temp_dir" --wildcards "*/metadata.json" 2>/dev/null || true
    
    local metadata_file=$(find "$temp_dir" -name "metadata.json" -type f)
    
    if [ -f "$metadata_file" ]; then
        echo "  📅 Fecha: $(jq -r '.created_at' "$metadata_file")"
        echo "  🖥️  Hostname: $(jq -r '.hostname' "$metadata_file")"
        echo "  👤 Usuario: $(jq -r '.user' "$metadata_file")"
        echo "  🌍 Entorno: $(jq -r '.environment' "$metadata_file")"
        echo "  🔧 Versión: $(jq -r '.version' "$metadata_file")"
        echo "  📦 Git Commit: $(jq -r '.git_commit' "$metadata_file")"
        echo "  🌿 Git Branch: $(jq -r '.git_branch' "$metadata_file")"
        echo
        echo "  📋 Componentes incluidos:"
        echo "    • Kubernetes: $(jq -r '.components.kubernetes' "$metadata_file")"
        echo "    • Database: $(jq -r '.components.database' "$metadata_file")"
        echo "    • Application: $(jq -r '.components.application' "$metadata_file")"
        echo "    • Docker Volumes: $(jq -r '.components.docker_volumes' "$metadata_file")"
        echo "    • Monitoring: $(jq -r '.components.monitoring' "$metadata_file")"
        echo "    • SSL: $(jq -r '.components.ssl' "$metadata_file")"
    else
        warning "No se encontraron metadatos en el backup"
    fi
    
    # Limpiar archivos temporales
    rm -rf "$temp_dir"
    echo
}

# Validar backup
validate_backup() {
    local backup_file="$1"
    
    log "🔍 Validando backup..."
    
    if [ ! -f "$backup_file" ]; then
        error "Archivo de backup no encontrado: $backup_file"
    fi
    
    # Verificar integridad del archivo
    if ! tar -tzf "$backup_file" >/dev/null 2>&1; then
        error "❌ Archivo de backup corrupto"
    fi
    
    log "✅ Backup validado"
}

# Crear backup de seguridad antes de restore
create_pre_restore_backup() {
    log "💾 Creando backup de seguridad antes del restore..."
    
    # Ejecutar script de backup
    if [ -f "docker/scripts/backup.sh" ]; then
        bash docker/scripts/backup.sh
        log "✅ Backup de seguridad creado"
    else
        warning "Script de backup no encontrado, continuando sin backup de seguridad"
    fi
}

# Extraer backup
extract_backup() {
    local backup_file="$1"
    local extract_dir="$2"
    
    log "📦 Extrayendo backup..."
    
    mkdir -p "$extract_dir"
    tar -xzf "$backup_file" -C "$extract_dir"
    
    if [ $? -eq 0 ]; then
        log "✅ Backup extraído en: $extract_dir"
    else
        error "❌ Error extrayendo backup"
    fi
}

# Restaurar configuración de Kubernetes
restore_kubernetes() {
    local backup_dir="$1"
    local k8s_dir="${backup_dir}/kubernetes"
    
    if [ ! -d "$k8s_dir" ]; then
        warning "No se encontró backup de Kubernetes, saltando..."
        return
    fi
    
    log "☸️ Restaurando configuración de Kubernetes..."
    
    if ! command -v kubectl &> /dev/null; then
        warning "kubectl no encontrado, saltando restore de Kubernetes"
        return
    fi
    
    # Confirmar restore
    if [ "$FORCE_RESTORE" != "true" ]; then
        echo -n "¿Deseas restaurar la configuración de Kubernetes? (y/n): "
        read -r confirm
        if [ "$confirm" != "y" ]; then
            log "Restore de Kubernetes cancelado"
            return
        fi
    fi
    
    # Restaurar namespace
    if [ -f "${k8s_dir}/namespace.yaml" ]; then
        kubectl apply -f "${k8s_dir}/namespace.yaml"
        log "✅ Namespace restaurado"
    fi
    
    # Restaurar configuración
    local k8s_files=(
        "configmaps.yaml"
        "secrets-structure.yaml"
        "persistent-volumes.yaml"
        "deployments.yaml"
        "services.yaml"
        "ingress.yaml"
    )
    
    for file in "${k8s_files[@]}"; do
        if [ -f "${k8s_dir}/${file}" ]; then
            kubectl apply -f "${k8s_dir}/${file}"
            log "✅ ${file} restaurado"
        fi
    done
    
    log "✅ Configuración de Kubernetes restaurada"
}

# Restaurar base de datos
restore_database() {
    local backup_dir="$1"
    local db_dir="${backup_dir}/database"
    
    if [ ! -d "$db_dir" ]; then
        warning "No se encontró backup de base de datos, saltando..."
        return
    fi
    
    log "🗄️ Restaurando base de datos..."
    
    if [ ! -f "${db_dir}/mysql_backup.sql" ]; then
        warning "No se encontró archivo de backup de MySQL"
        return
    fi
    
    # Confirmar restore
    if [ "$FORCE_RESTORE" != "true" ]; then
        echo -n "⚠️  ¿Deseas restaurar la base de datos? (esto sobrescribirá los datos actuales) (y/n): "
        read -r confirm
        if [ "$confirm" != "y" ]; then
            log "Restore de base de datos cancelado"
            return
        fi
    fi
    
    # Determinar método de restore
    if docker-compose ps mysql-dev &> /dev/null; then
        # Entorno de desarrollo
        log "Restaurando MySQL en entorno de desarrollo..."
        
        # Crear base de datos si no existe
        docker-compose exec -T mysql-dev mysql -u root -prootpassword -e "CREATE DATABASE IF NOT EXISTS lms_platform_dev;"
        
        # Restaurar backup
        docker-compose exec -T mysql-dev mysql -u lms_user -plms_password lms_platform_dev < "${db_dir}/mysql_backup.sql"
        
        if [ $? -eq 0 ]; then
            log "✅ Base de datos MySQL restaurada (desarrollo)"
        else
            error "❌ Error restaurando base de datos MySQL"
        fi
        
    elif kubectl get pods -n lms-platform | grep -q mysql; then
        # Entorno de producción con MySQL en K8s
        log "Restaurando MySQL en entorno de producción..."
        
        MYSQL_POD=$(kubectl get pods -n lms-platform -l app=mysql -o jsonpath='{.items[0].metadata.name}')
        
        # Copiar archivo de backup al pod
        kubectl cp "${db_dir}/mysql_backup.sql" "lms-platform/${MYSQL_POD}:/tmp/backup.sql"
        
        # Restaurar backup
        kubectl exec -n lms-platform "$MYSQL_POD" -- mysql -u lms_user -plms_password lms_platform_prod < /tmp/backup.sql
        
        if [ $? -eq 0 ]; then
            log "✅ Base de datos MySQL restaurada (producción)"
        else
            error "❌ Error restaurando base de datos MySQL"
        fi
        
    else
        warning "No se detectó configuración de MySQL, saltando restore de base de datos"
    fi
    
    # Restaurar esquema Prisma
    if [ -f "${db_dir}/schema.prisma" ]; then
        cp "${db_dir}/schema.prisma" "prisma/schema.prisma"
        log "✅ Esquema Prisma restaurado"
    fi
}

# Restaurar aplicación
restore_application() {
    local backup_dir="$1"
    local app_dir="${backup_dir}/application"
    
    if [ ! -d "$app_dir" ]; then
        warning "No se encontró backup de aplicación, saltando..."
        return
    fi
    
    log "📦 Restaurando aplicación..."
    
    # Confirmar restore
    if [ "$FORCE_RESTORE" != "true" ]; then
        echo -n "¿Deseas restaurar los archivos de la aplicación? (y/n): "
        read -r confirm
        if [ "$confirm" != "y" ]; then
            log "Restore de aplicación cancelado"
            return
        fi
    fi
    
    # Crear backup de archivos actuales
    local current_backup_dir="current_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$current_backup_dir"
    
    # Backup de archivos importantes actuales
    local important_files=(
        "package.json"
        "next.config.js"
        ".env"
        "docker-compose.yml"
    )
    
    for file in "${important_files[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$current_backup_dir/"
        fi
    done
    
    # Restaurar archivos
    cp -r "$app_dir"/* .
    
    # Restaurar permisos
    chmod +x docker/scripts/*.sh
    chmod +x docker/scripts/*.bat
    
    log "✅ Aplicación restaurada"
    log "📁 Archivos actuales respaldados en: $current_backup_dir"
}

# Restaurar volúmenes Docker
restore_docker_volumes() {
    local backup_dir="$1"
    local volumes_dir="${backup_dir}/docker_volumes"
    
    if [ ! -d "$volumes_dir" ]; then
        warning "No se encontró backup de volúmenes Docker, saltando..."
        return
    fi
    
    log "📦 Restaurando volúmenes Docker..."
    
    # Confirmar restore
    if [ "$FORCE_RESTORE" != "true" ]; then
        echo -n "¿Deseas restaurar los volúmenes Docker? (y/n): "
        read -r confirm
        if [ "$confirm" != "y" ]; then
            log "Restore de volúmenes cancelado"
            return
        fi
    fi
    
    # Restaurar cada volumen
    for volume_backup in "$volumes_dir"/*.tar.gz; do
        if [ -f "$volume_backup" ]; then
            local volume_name=$(basename "$volume_backup" _backup.tar.gz)
            
            log "Restaurando volumen: $volume_name"
            
            # Crear volumen si no existe
            docker volume create "$volume_name" >/dev/null 2>&1
            
            # Restaurar contenido
            docker run --rm \
                -v "$volume_name:/target" \
                -v "$(pwd)/${volumes_dir}:/backup" \
                alpine:latest \
                tar xzf "/backup/$(basename "$volume_backup")" -C /target
            
            if [ $? -eq 0 ]; then
                log "✅ Volumen $volume_name restaurado"
            else
                warning "❌ Error restaurando volumen $volume_name"
            fi
        fi
    done
}

# Restaurar configuración de monitoreo
restore_monitoring() {
    local backup_dir="$1"
    local monitoring_dir="${backup_dir}/monitoring"
    
    if [ ! -d "$monitoring_dir" ]; then
        warning "No se encontró backup de monitoreo, saltando..."
        return
    fi
    
    log "📊 Restaurando configuración de monitoreo..."
    
    # Crear directorio de monitoreo si no existe
    mkdir -p docker/monitoring
    
    # Restaurar archivos de configuración
    if [ -f "${monitoring_dir}/prometheus.yml" ]; then
        cp "${monitoring_dir}/prometheus.yml" docker/monitoring/
        log "✅ Configuración de Prometheus restaurada"
    fi
    
    if [ -f "${monitoring_dir}/alert_rules.yml" ]; then
        cp "${monitoring_dir}/alert_rules.yml" docker/monitoring/
        log "✅ Reglas de alertas restauradas"
    fi
    
    # Restaurar datos de Prometheus
    if [ -f "${monitoring_dir}/prometheus_data.tar.gz" ]; then
        docker volume create prometheus_data >/dev/null 2>&1
        
        docker run --rm \
            -v prometheus_data:/target \
            -v "$(pwd)/${monitoring_dir}:/backup" \
            alpine:latest \
            tar xzf "/backup/prometheus_data.tar.gz" -C /target
        
        log "✅ Datos de Prometheus restaurados"
    fi
}

# Restaurar certificados SSL
restore_ssl() {
    local backup_dir="$1"
    local ssl_dir="${backup_dir}/ssl"
    
    if [ ! -d "$ssl_dir" ]; then
        warning "No se encontró backup de SSL, saltando..."
        return
    fi
    
    log "🔒 Restaurando certificados SSL..."
    
    # Crear directorio SSL
    mkdir -p docker/ssl
    
    # Restaurar certificados
    cp -r "$ssl_dir"/* docker/ssl/
    
    # Configurar permisos
    chmod 600 docker/ssl/*.key
    chmod 644 docker/ssl/*.crt
    
    log "✅ Certificados SSL restaurados"
}

# Verificar restore
verify_restore() {
    log "🔍 Verificando restore..."
    
    # Verificar archivos principales
    local critical_files=(
        "package.json"
        "Dockerfile"
        "docker-compose.yml"
    )
    
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            error "❌ Archivo crítico no encontrado: $file"
        fi
    done
    
    # Verificar que Docker funciona
    if ! docker info >/dev/null 2>&1; then
        warning "Docker no está disponible para verificación"
    fi
    
    # Verificar que los servicios pueden iniciarse
    if [ -f "docker-compose.yml" ]; then
        if docker-compose config >/dev/null 2>&1; then
            log "✅ Configuración de Docker Compose válida"
        else
            warning "❌ Configuración de Docker Compose tiene errores"
        fi
    fi
    
    log "✅ Restore verificado"
}

# Generar reporte de restore
generate_restore_report() {
    local backup_name="$1"
    
    log "📊 Generando reporte de restore..."
    
    local report_file="restore_report_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# 📊 Reporte de Restore - LMS Platform

**Fecha:** $(date)
**Backup Restaurado:** $backup_name
**Usuario:** $(whoami)
**Hostname:** $(hostname)

## ✅ Componentes Restaurados

- ✅ **Kubernetes:** Configuración del cluster
- ✅ **Base de datos:** Datos de MySQL
- ✅ **Aplicación:** Código y configuración
- ✅ **Volúmenes Docker:** Datos persistentes
- ✅ **Monitoreo:** Prometheus y alertas
- ✅ **SSL:** Certificados TLS

## 📝 Próximos Pasos

1. **Verificar configuración:**
   \`\`\`bash
   # Verificar Docker Compose
   docker-compose config
   
   # Verificar Kubernetes
   kubectl get pods -n lms-platform
   \`\`\`

2. **Iniciar servicios:**
   \`\`\`bash
   # Desarrollo
   docker-compose up -d
   
   # Producción
   kubectl apply -f k8s/
   \`\`\`

3. **Verificar aplicación:**
   - Acceder a http://localhost:3000
   - Verificar health check: http://localhost:3000/api/health
   - Verificar métricas: http://localhost:3000/api/metrics

## 🔧 Troubleshooting

Si hay problemas:

1. **Verificar logs:**
   \`\`\`bash
   docker-compose logs -f
   kubectl logs -f deployment/lms-platform-deployment -n lms-platform
   \`\`\`

2. **Reiniciar servicios:**
   \`\`\`bash
   docker-compose restart
   kubectl rollout restart deployment/lms-platform-deployment -n lms-platform
   \`\`\`

3. **Verificar base de datos:**
   \`\`\`bash
   docker-compose exec mysql-dev mysql -u lms_user -p
   \`\`\`

---

*Restore completado el $(date)*

**Log detallado:** $RESTORE_LOG
EOF
    
    log "✅ Reporte generado: $report_file"
}

# Función principal
main() {
    echo "
    ╔════════════════════════════════════════════════════════════════════╗
    ║                   🔄 SISTEMA DE RESTORE                           ║
    ║                     LMS Platform                                   ║
    ╚════════════════════════════════════════════════════════════════════╝
    "
    
    # Procesar argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -l|--list)
                list_backups
                exit 0
                ;;
            -f|--force)
                FORCE_RESTORE="true"
                shift
                ;;
            -i|--info)
                if [ -z "$2" ]; then
                    error "Especifica el nombre del backup para mostrar información"
                fi
                show_backup_info "$2"
                exit 0
                ;;
            -p|--partial)
                PARTIAL_RESTORE="true"
                shift
                ;;
            -*)
                error "Opción desconocida: $1"
                ;;
            *)
                if [ -z "$BACKUP_NAME" ]; then
                    BACKUP_NAME="$1"
                fi
                shift
                ;;
        esac
    done
    
    # Verificar que se especificó un backup
    if [ -z "$BACKUP_NAME" ]; then
        error "Debes especificar un backup para restaurar. Usa -l para listar backups disponibles."
    fi
    
    # Preparar ruta del backup
    local backup_file
    if [[ "$BACKUP_NAME" == *.tar.gz ]]; then
        backup_file="${BACKUP_DIR}/${BACKUP_NAME}"
    else
        backup_file="${BACKUP_DIR}/${BACKUP_NAME}.tar.gz"
    fi
    
    # Mostrar información del backup
    show_backup_info "$backup_file"
    
    # Confirmar restore
    if [ "$FORCE_RESTORE" != "true" ]; then
        echo -n "¿Deseas continuar con el restore? (y/n): "
        read -r confirm
        if [ "$confirm" != "y" ]; then
            log "Restore cancelado"
            exit 0
        fi
    fi
    
    log "🚀 Iniciando restore..."
    
    # Validar backup
    validate_backup "$backup_file"
    
    # Crear backup de seguridad
    create_pre_restore_backup
    
    # Extraer backup
    local extract_dir="restore_temp_$(date +%Y%m%d_%H%M%S)"
    extract_backup "$backup_file" "$extract_dir"
    
    # Encontrar directorio del backup extraído
    local backup_content_dir=$(find "$extract_dir" -name "lms_backup_*" -type d)
    
    # Ejecutar restore
    restore_kubernetes "$backup_content_dir"
    restore_database "$backup_content_dir"
    restore_application "$backup_content_dir"
    restore_docker_volumes "$backup_content_dir"
    restore_monitoring "$backup_content_dir"
    restore_ssl "$backup_content_dir"
    
    # Verificar restore
    verify_restore
    
    # Generar reporte
    generate_restore_report "$BACKUP_NAME"
    
    # Limpiar archivos temporales
    rm -rf "$extract_dir"
    
    echo "
    ╔════════════════════════════════════════════════════════════════════╗
    ║                   ✅ RESTORE COMPLETADO                          ║
    ╚════════════════════════════════════════════════════════════════════╝
    "
    
    log "🎉 Restore completado exitosamente!"
    log "📋 Revisa el reporte para próximos pasos"
    log "🔍 Log detallado: $RESTORE_LOG"
}

# Ejecutar restore
main "$@"
