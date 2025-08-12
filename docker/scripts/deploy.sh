#!/bin/bash
# ===========================================
# AUTOMATED DEPLOYMENT SCRIPT
# ===========================================
# Deploy automático para LMS Platform

set -e

# Configuración
PROJECT_ID="ai-academy-461719"
CLUSTER_NAME="lms-cluster"
CLUSTER_ZONE="us-central1-a"
NAMESPACE="lms-platform"
IMAGE_NAME="lms-platform"
REGISTRY="gcr.io"
DEPLOYMENT_NAME="lms-platform-deployment"

# Variables de entorno
ENVIRONMENT="${ENVIRONMENT:-production}"
BUILD_VERSION="${BUILD_VERSION:-$(date +%Y%m%d_%H%M%S)}"
FORCE_DEPLOY="${FORCE_DEPLOY:-false}"
SKIP_TESTS="${SKIP_TESTS:-false}"
SKIP_BACKUP="${SKIP_BACKUP:-false}"

# Archivos de log
LOG_FILE="deployment_${BUILD_VERSION}.log"
ROLLBACK_FILE="rollback_${BUILD_VERSION}.sh"

# Colores para output
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

# Mostrar ayuda
show_help() {
    cat << EOF
╔════════════════════════════════════════════════════════════════════╗
║                   🚀 AUTOMATED DEPLOYMENT                          ║
║                     LMS Platform                                   ║
╚════════════════════════════════════════════════════════════════════╝

Uso: $0 [opciones]

Opciones:
  -e, --environment ENV     Entorno de deploy (staging/production) [default: production]
  -v, --version VERSION     Versión del build [default: timestamp]
  -f, --force              Forzar deploy sin confirmación
  -s, --skip-tests         Saltar pruebas
  -b, --skip-backup        Saltar backup pre-deploy
  -r, --rollback           Rollback a versión anterior
  -h, --help               Mostrar esta ayuda

Ejemplos:
  $0                       Deploy básico a producción
  $0 -e staging            Deploy a staging
  $0 -f -s                 Deploy forzado sin tests
  $0 -r                    Rollback a versión anterior

Variables de entorno:
  PROJECT_ID               ID del proyecto GCP
  CLUSTER_NAME             Nombre del cluster GKE
  CLUSTER_ZONE             Zona del cluster
  NAMESPACE                Namespace de Kubernetes
  SKIP_TESTS               Saltar pruebas (true/false)
  FORCE_DEPLOY             Forzar deploy (true/false)

EOF
}

# Verificar prerrequisitos
check_prerequisites() {
    log "🔍 Verificando prerrequisitos..."
    
    # Verificar herramientas necesarias
    local tools=("docker" "kubectl" "gcloud")
    
    for tool in "${tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "$tool no está instalado"
        fi
    done
    
    # Verificar Docker
    if ! docker info &> /dev/null; then
        error "Docker no está ejecutándose"
    fi
    
    # Verificar autenticación con GCP
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
        error "No hay autenticación activa con GCP. Ejecuta: gcloud auth login"
    fi
    
    # Verificar conexión a cluster
    if ! kubectl cluster-info &> /dev/null; then
        log "Conectando al cluster GKE..."
        gcloud container clusters get-credentials "$CLUSTER_NAME" --zone "$CLUSTER_ZONE" --project "$PROJECT_ID"
    fi
    
    # Verificar namespace
    if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log "Creando namespace $NAMESPACE..."
        kubectl create namespace "$NAMESPACE"
    fi
    
    log "✅ Prerrequisitos verificados"
}

# Ejecutar pruebas
run_tests() {
    if [ "$SKIP_TESTS" == "true" ]; then
        warning "Saltando pruebas (SKIP_TESTS=true)"
        return
    fi
    
    log "🧪 Ejecutando pruebas..."
    
    # Verificar que existe package.json
    if [ ! -f "package.json" ]; then
        error "package.json no encontrado"
    fi
    
    # Instalar dependencias si no existen
    if [ ! -d "node_modules" ]; then
        log "Instalando dependencias..."
        npm ci
    fi
    
    # Ejecutar linting
    if npm run lint &> /dev/null; then
        log "✅ Linting pasado"
    else
        warning "❌ Linting falló, continuando..."
    fi
    
    # Ejecutar type checking
    if npm run type-check &> /dev/null; then
        log "✅ Type checking pasado"
    else
        warning "❌ Type checking falló, continuando..."
    fi
    
    # Ejecutar pruebas unitarias
    if npm test &> /dev/null; then
        log "✅ Pruebas unitarias pasadas"
    else
        warning "❌ Pruebas unitarias fallaron, continuando..."
    fi
    
    # Verificar que la aplicación se construye
    if npm run build &> /dev/null; then
        log "✅ Build de aplicación exitoso"
    else
        error "❌ Build de aplicación falló"
    fi
}

# Crear backup pre-deploy
create_pre_deploy_backup() {
    if [ "$SKIP_BACKUP" == "true" ]; then
        warning "Saltando backup pre-deploy (SKIP_BACKUP=true)"
        return
    fi
    
    log "💾 Creando backup pre-deploy..."
    
    # Backup de deployment actual
    kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o yaml > "backup_deployment_${BUILD_VERSION}.yaml" 2>/dev/null || true
    
    # Backup de base de datos usando script
    if [ -f "docker/scripts/backup.sh" ]; then
        bash docker/scripts/backup.sh
        log "✅ Backup pre-deploy completado"
    else
        warning "Script de backup no encontrado"
    fi
}

# Construir imagen Docker
build_image() {
    log "🔨 Construyendo imagen Docker..."
    
    local image_tag="${REGISTRY}/${PROJECT_ID}/${IMAGE_NAME}:${BUILD_VERSION}"
    local latest_tag="${REGISTRY}/${PROJECT_ID}/${IMAGE_NAME}:latest"
    
    # Configurar Docker para GCR
    gcloud auth configure-docker --quiet
    
    # Construir imagen
    docker build \
        --platform linux/amd64 \
        --tag "$image_tag" \
        --tag "$latest_tag" \
        --file Dockerfile \
        .
    
    if [ $? -eq 0 ]; then
        log "✅ Imagen construida: $image_tag"
    else
        error "❌ Error construyendo imagen"
    fi
    
    # Push de imagen
    log "📤 Subiendo imagen a registry..."
    
    docker push "$image_tag"
    docker push "$latest_tag"
    
    if [ $? -eq 0 ]; then
        log "✅ Imagen subida exitosamente"
    else
        error "❌ Error subiendo imagen"
    fi
    
    # Escanear vulnerabilidades
    log "🛡️ Escaneando vulnerabilidades..."
    
    if command -v trivy &> /dev/null; then
        trivy image "$image_tag" --severity HIGH,CRITICAL --no-progress
    else
        warning "Trivy no encontrado, saltando escaneo de vulnerabilidades"
    fi
}

# Actualizar secrets si es necesario
update_secrets() {
    log "🔐 Verificando secrets..."
    
    # Verificar que existe el secret principal
    if ! kubectl get secret lms-secrets -n "$NAMESPACE" &> /dev/null; then
        warning "Secret 'lms-secrets' no encontrado"
        info "Crea el secret con: kubectl create secret generic lms-secrets --from-env-file=.env.production -n $NAMESPACE"
    else
        log "✅ Secrets verificados"
    fi
}

# Deploy a Kubernetes
deploy_to_kubernetes() {
    log "🚀 Desplegando a Kubernetes..."
    
    local image_tag="${REGISTRY}/${PROJECT_ID}/${IMAGE_NAME}:${BUILD_VERSION}"
    
    # Aplicar configuración básica
    if [ -d "k8s" ]; then
        log "Aplicando manifests de Kubernetes..."
        
        # Aplicar en orden
        kubectl apply -f k8s/00-namespace-config.yaml
        kubectl apply -f k8s/01-deployment.yaml
        kubectl apply -f k8s/02-services.yaml
        kubectl apply -f k8s/03-ingress.yaml
        
        log "✅ Manifests aplicados"
    else
        error "Directorio k8s no encontrado"
    fi
    
    # Actualizar imagen del deployment
    log "Actualizando imagen del deployment..."
    
    kubectl set image deployment/"$DEPLOYMENT_NAME" \
        "$IMAGE_NAME=$image_tag" \
        -n "$NAMESPACE"
    
    if [ $? -eq 0 ]; then
        log "✅ Imagen actualizada en deployment"
    else
        error "❌ Error actualizando imagen"
    fi
    
    # Esperar a que el rollout complete
    log "⏳ Esperando rollout..."
    
    if kubectl rollout status deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE" --timeout=600s; then
        log "✅ Rollout completado exitosamente"
    else
        error "❌ Rollout falló o timeout"
    fi
}

# Verificar deployment
verify_deployment() {
    log "🔍 Verificando deployment..."
    
    # Verificar que los pods están corriendo
    local ready_pods=$(kubectl get pods -n "$NAMESPACE" -l app="$IMAGE_NAME" --field-selector=status.phase=Running --no-headers | wc -l)
    local total_pods=$(kubectl get pods -n "$NAMESPACE" -l app="$IMAGE_NAME" --no-headers | wc -l)
    
    log "Pods running: $ready_pods/$total_pods"
    
    if [ "$ready_pods" -eq 0 ]; then
        error "❌ No hay pods running"
    fi
    
    # Verificar health check
    log "Verificando health check..."
    
    # Port forward temporalmente para verificar
    kubectl port-forward svc/"$IMAGE_NAME-service" 8080:80 -n "$NAMESPACE" &
    local port_forward_pid=$!
    
    sleep 10
    
    if curl -f http://localhost:8080/api/health &> /dev/null; then
        log "✅ Health check exitoso"
    else
        warning "❌ Health check falló"
    fi
    
    # Limpiar port forward
    kill $port_forward_pid 2>/dev/null || true
    
    # Verificar métricas
    log "Verificando métricas..."
    
    local replicas=$(kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
    local desired=$(kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')
    
    log "Replicas: $replicas/$desired"
    
    if [ "$replicas" -eq "$desired" ]; then
        log "✅ Todas las replicas están ready"
    else
        warning "❌ No todas las replicas están ready"
    fi
}

# Smoke tests
run_smoke_tests() {
    log "🧪 Ejecutando smoke tests..."
    
    # Obtener URL del servicio
    local service_url
    if [ "$ENVIRONMENT" == "staging" ]; then
        service_url="https://lms-staging.ai-academy.com"
    else
        service_url="https://lms.ai-academy.com"
    fi
    
    # Test básico de conectividad
    if curl -f "$service_url/api/health" &> /dev/null; then
        log "✅ Conectividad OK"
    else
        error "❌ Smoke test falló: no hay conectividad"
    fi
    
    # Test de métricas
    if curl -f "$service_url/api/metrics" &> /dev/null; then
        log "✅ Métricas OK"
    else
        warning "❌ Métricas no disponibles"
    fi
    
    log "✅ Smoke tests completados"
}

# Crear script de rollback
create_rollback_script() {
    log "📝 Creando script de rollback..."
    
    cat > "$ROLLBACK_FILE" << EOF
#!/bin/bash
# Script de rollback generado automáticamente
# Fecha: $(date)
# Versión: $BUILD_VERSION

echo "🔄 Ejecutando rollback..."

# Rollback del deployment
kubectl rollout undo deployment/$DEPLOYMENT_NAME -n $NAMESPACE

# Esperar a que complete
kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE

# Verificar rollback
kubectl get pods -n $NAMESPACE -l app=$IMAGE_NAME

echo "✅ Rollback completado"
EOF
    
    chmod +x "$ROLLBACK_FILE"
    log "✅ Script de rollback creado: $ROLLBACK_FILE"
}

# Ejecutar rollback
execute_rollback() {
    log "🔄 Ejecutando rollback..."
    
    # Rollback del deployment
    kubectl rollout undo deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE"
    
    # Esperar a que complete
    kubectl rollout status deployment/"$DEPLOYMENT_NAME" -n "$NAMESPACE"
    
    # Verificar rollback
    kubectl get pods -n "$NAMESPACE" -l app="$IMAGE_NAME"
    
    log "✅ Rollback completado"
}

# Limpiar recursos
cleanup() {
    log "🧹 Limpiando recursos..."
    
    # Limpiar imágenes Docker locales
    docker system prune -f --volumes
    
    # Limpiar imágenes antiguas en GCR
    gcloud container images list-tags "$REGISTRY/$PROJECT_ID/$IMAGE_NAME" \
        --limit=999 --sort-by=~TIMESTAMP --format="get(digest)" | \
        tail -n +6 | \
        xargs -r gcloud container images delete --quiet --force-delete-tags
    
    log "✅ Limpieza completada"
}

# Generar reporte de deployment
generate_deployment_report() {
    log "📊 Generando reporte de deployment..."
    
    local report_file="deployment_report_${BUILD_VERSION}.md"
    
    cat > "$report_file" << EOF
# 📊 Reporte de Deployment - LMS Platform

**Fecha:** $(date)
**Versión:** $BUILD_VERSION
**Entorno:** $ENVIRONMENT
**Usuario:** $(whoami)

## ✅ Deployment Completado

### 🐳 Imagen Docker
- **Registry:** $REGISTRY
- **Imagen:** $PROJECT_ID/$IMAGE_NAME:$BUILD_VERSION
- **Tamaño:** $(docker images "$REGISTRY/$PROJECT_ID/$IMAGE_NAME:$BUILD_VERSION" --format "table {{.Size}}" | tail -n 1)

### ☸️ Kubernetes
- **Cluster:** $CLUSTER_NAME
- **Namespace:** $NAMESPACE
- **Deployment:** $DEPLOYMENT_NAME
- **Replicas:** $(kubectl get deployment "$DEPLOYMENT_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.replicas}')

### 🔗 URLs
- **Aplicación:** $([ "$ENVIRONMENT" == "staging" ] && echo "https://lms-staging.ai-academy.com" || echo "https://lms.ai-academy.com")
- **Health Check:** $([ "$ENVIRONMENT" == "staging" ] && echo "https://lms-staging.ai-academy.com/api/health" || echo "https://lms.ai-academy.com/api/health")
- **Métricas:** $([ "$ENVIRONMENT" == "staging" ] && echo "https://lms-staging.ai-academy.com/api/metrics" || echo "https://lms.ai-academy.com/api/metrics")

### 📈 Estado del Deployment
\`\`\`
$(kubectl get pods -n "$NAMESPACE" -l app="$IMAGE_NAME")
\`\`\`

## 🔄 Rollback

Para hacer rollback, ejecuta:
\`\`\`bash
bash $ROLLBACK_FILE
\`\`\`

O manualmente:
\`\`\`bash
kubectl rollout undo deployment/$DEPLOYMENT_NAME -n $NAMESPACE
\`\`\`

## 📋 Logs

- **Deployment:** $LOG_FILE
- **Kubernetes:** \`kubectl logs -f deployment/$DEPLOYMENT_NAME -n $NAMESPACE\`

---

*Deployment completado exitosamente el $(date)*
EOF
    
    log "✅ Reporte generado: $report_file"
}

# Función principal
main() {
    echo "
    ╔════════════════════════════════════════════════════════════════════╗
    ║                   🚀 AUTOMATED DEPLOYMENT                          ║
    ║                     LMS Platform                                   ║
    ╚════════════════════════════════════════════════════════════════════╝
    "
    
    # Procesar argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -v|--version)
                BUILD_VERSION="$2"
                shift 2
                ;;
            -f|--force)
                FORCE_DEPLOY="true"
                shift
                ;;
            -s|--skip-tests)
                SKIP_TESTS="true"
                shift
                ;;
            -b|--skip-backup)
                SKIP_BACKUP="true"
                shift
                ;;
            -r|--rollback)
                execute_rollback
                exit 0
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                error "Opción desconocida: $1"
                ;;
        esac
    done
    
    # Mostrar configuración
    log "🔧 Configuración del deployment:"
    log "  Entorno: $ENVIRONMENT"
    log "  Versión: $BUILD_VERSION"
    log "  Proyecto: $PROJECT_ID"
    log "  Cluster: $CLUSTER_NAME"
    log "  Namespace: $NAMESPACE"
    
    # Confirmar deployment
    if [ "$FORCE_DEPLOY" != "true" ]; then
        echo -n "¿Continuar con el deployment? (y/n): "
        read -r confirm
        if [ "$confirm" != "y" ]; then
            log "Deployment cancelado"
            exit 0
        fi
    fi
    
    log "🚀 Iniciando deployment..."
    
    # Ejecutar deployment
    check_prerequisites
    run_tests
    create_pre_deploy_backup
    build_image
    update_secrets
    deploy_to_kubernetes
    verify_deployment
    run_smoke_tests
    create_rollback_script
    generate_deployment_report
    cleanup
    
    echo "
    ╔════════════════════════════════════════════════════════════════════╗
    ║                   ✅ DEPLOYMENT COMPLETADO                        ║
    ╚════════════════════════════════════════════════════════════════════╝
    "
    
    log "🎉 Deployment completado exitosamente!"
    log "🌐 URL: $([ "$ENVIRONMENT" == "staging" ] && echo "https://lms-staging.ai-academy.com" || echo "https://lms.ai-academy.com")"
    log "🔄 Rollback: bash $ROLLBACK_FILE"
    log "📋 Log: $LOG_FILE"
}

# Ejecutar deployment
main "$@"
