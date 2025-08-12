#!/bin/bash
# ===========================================
# DEPLOYMENT SCRIPT COMPLETO - LMS PLATFORM
# Deploy automatizado con Helm y validaciones
# ===========================================

set -e  # Exit on any error

# Configuración
CHART_PATH="./helm/lms-platform"
NAMESPACE="lms-platform"
RELEASE_NAME="lms-platform"
TIMEOUT="10m"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                   🚀 LMS PLATFORM DEPLOYMENT                         ║"
echo "║                  Advanced Helm Deployment System                     ║"
echo "╚═══════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ===========================================
# FUNCIONES AUXILIARES
# ===========================================

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🔄 $1${NC}"
}

show_help() {
    echo "Usage: $0 [ENVIRONMENT] [OPTIONS]"
    echo ""
    echo "ENVIRONMENTS:"
    echo "  dev         Deploy to development environment"
    echo "  staging     Deploy to staging environment"  
    echo "  prod        Deploy to production environment"
    echo ""
    echo "OPTIONS:"
    echo "  --dry-run   Show what would be deployed without actually deploying"
    echo "  --upgrade   Upgrade existing deployment"
    echo "  --rollback  Rollback to previous version"
    echo "  --debug     Enable debug output"
    echo "  --help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev                    # Deploy to development"
    echo "  $0 prod --upgrade         # Upgrade production"
    echo "  $0 staging --dry-run      # Dry run for staging"
}

check_prerequisites() {
    log_step "Verificando prerrequisitos..."
    
    # Verificar Helm
    if ! command -v helm &> /dev/null; then
        log_error "Helm no está instalado"
        log_info "Instala Helm: https://helm.sh/docs/intro/install/"
        exit 1
    fi
    log_success "Helm disponible: $(helm version --short)"
    
    # Verificar kubectl
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl no está instalado"
        exit 1
    fi
    log_success "kubectl disponible"
    
    # Verificar conexión al cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "No se puede conectar al cluster de Kubernetes"
        log_info "Configura kubectl con: gcloud container clusters get-credentials CLUSTER_NAME --zone ZONE"
        exit 1
    fi
    log_success "Conectado al cluster: $(kubectl config current-context)"
    
    # Verificar chart de Helm
    if [ ! -f "$CHART_PATH/Chart.yaml" ]; then
        log_error "Chart de Helm no encontrado en $CHART_PATH"
        exit 1
    fi
    log_success "Chart de Helm encontrado"
}

validate_environment() {
    local env=$1
    
    case $env in
        dev|development)
            ENVIRONMENT="development"
            VALUES_FILE="$CHART_PATH/values-dev.yaml"
            ;;
        staging)
            ENVIRONMENT="staging"
            VALUES_FILE="$CHART_PATH/values-staging.yaml"
            ;;
        prod|production)
            ENVIRONMENT="production"
            VALUES_FILE="$CHART_PATH/values-prod.yaml"
            ;;
        *)
            log_error "Entorno inválido: $env"
            log_info "Entornos válidos: dev, staging, prod"
            exit 1
            ;;
    esac
    
    log_info "Entorno seleccionado: $ENVIRONMENT"
    
    # Usar values.yaml por defecto si no existe archivo específico
    if [ ! -f "$VALUES_FILE" ]; then
        log_warning "Archivo $VALUES_FILE no encontrado, usando values.yaml"
        VALUES_FILE="$CHART_PATH/values.yaml"
    fi
}

check_secrets() {
    log_step "Verificando secrets requeridos..."
    
    local required_secrets=(
        "lms-platform-secrets"
        "google-cloud-credentials"
    )
    
    for secret in "${required_secrets[@]}"; do
        if kubectl get secret "$secret" -n "$NAMESPACE" &> /dev/null; then
            log_success "Secret '$secret' encontrado"
        else
            log_warning "Secret '$secret' no encontrado"
            log_info "Crea el secret con: kubectl create secret generic $secret --from-literal=key=value -n $NAMESPACE"
        fi
    done
}

create_namespace() {
    log_step "Configurando namespace..."
    
    if kubectl get namespace "$NAMESPACE" &> /dev/null; then
        log_success "Namespace '$NAMESPACE' ya existe"
    else
        log_info "Creando namespace '$NAMESPACE'..."
        kubectl create namespace "$NAMESPACE"
        log_success "Namespace '$NAMESPACE' creado"
    fi
    
    # Aplicar labels al namespace
    kubectl label namespace "$NAMESPACE" name="$NAMESPACE" --overwrite
    kubectl label namespace "$NAMESPACE" environment="$ENVIRONMENT" --overwrite
}

lint_chart() {
    log_step "Validando chart de Helm..."
    
    if helm lint "$CHART_PATH" --values "$VALUES_FILE"; then
        log_success "Chart válido"
    else
        log_error "Chart tiene errores de validación"
        exit 1
    fi
}

dry_run_deployment() {
    log_step "Ejecutando dry run..."
    
    helm template "$RELEASE_NAME" "$CHART_PATH" \
        --namespace "$NAMESPACE" \
        --values "$VALUES_FILE" \
        --set environment="$ENVIRONMENT" \
        ${DEBUG_FLAG:+--debug} \
        > "/tmp/lms-platform-${ENVIRONMENT}-dry-run.yaml"
    
    log_success "Dry run completado. Output guardado en /tmp/lms-platform-${ENVIRONMENT}-dry-run.yaml"
    
    # Mostrar recursos que se van a crear
    echo -e "\n${YELLOW}📋 Recursos que se van a crear:${NC}"
    grep "^kind:" "/tmp/lms-platform-${ENVIRONMENT}-dry-run.yaml" | sort | uniq -c
}

deploy_application() {
    log_step "Desplegando aplicación..."
    
    local helm_command="helm"
    
    if helm list -n "$NAMESPACE" | grep -q "$RELEASE_NAME"; then
        log_info "Release existente encontrado, actualizando..."
        helm_command="helm upgrade"
    else
        log_info "Nuevo release, instalando..."
        helm_command="helm install"
    fi
    
    $helm_command "$RELEASE_NAME" "$CHART_PATH" \
        --namespace "$NAMESPACE" \
        --create-namespace \
        --values "$VALUES_FILE" \
        --set environment="$ENVIRONMENT" \
        --timeout "$TIMEOUT" \
        --wait \
        --atomic \
        ${DEBUG_FLAG:+--debug}
    
    log_success "Deployment completado"
}

verify_deployment() {
    log_step "Verificando deployment..."
    
    # Verificar status del deployment
    if kubectl rollout status deployment/"$RELEASE_NAME" -n "$NAMESPACE" --timeout=300s; then
        log_success "Deployment exitoso"
    else
        log_error "Deployment falló"
        show_troubleshooting_info
        exit 1
    fi
    
    # Verificar pods
    local pod_count=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=lms-platform --no-headers | wc -l)
    local ready_pods=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=lms-platform --no-headers | grep "Running" | wc -l)
    
    log_info "Pods: $ready_pods/$pod_count running"
    
    # Verificar servicios
    kubectl get services -n "$NAMESPACE"
    
    # Verificar ingress
    if kubectl get ingress -n "$NAMESPACE" &> /dev/null; then
        local ingress_ip=$(kubectl get ingress -n "$NAMESPACE" -o jsonpath='{.items[0].status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
        log_info "Ingress IP: $ingress_ip"
    fi
}

run_tests() {
    log_step "Ejecutando tests de humo..."
    
    # Test de conexión a la aplicación
    local app_url="http://$(kubectl get service "$RELEASE_NAME" -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}'):80"
    
    if kubectl run test-pod --image=curlimages/curl:latest --rm -i --restart=Never -- curl -f "$app_url/api/health" &> /dev/null; then
        log_success "Health check pasó"
    else
        log_warning "Health check falló"
    fi
    
    # Test de métricas
    if kubectl run test-metrics --image=curlimages/curl:latest --rm -i --restart=Never -- curl -f "$app_url/api/metrics" &> /dev/null; then
        log_success "Metrics endpoint funcionando"
    else
        log_warning "Metrics endpoint no disponible"
    fi
}

show_deployment_info() {
    echo -e "\n${GREEN}🎉 DEPLOYMENT COMPLETADO EXITOSAMENTE${NC}"
    echo -e "${GREEN}═══════════════════════════════════════${NC}\n"
    
    echo -e "${BLUE}📋 Información del Deployment:${NC}"
    echo "  Environment: $ENVIRONMENT"
    echo "  Namespace: $NAMESPACE"
    echo "  Release: $RELEASE_NAME"
    echo "  Chart: $CHART_PATH"
    echo ""
    
    echo -e "${BLUE}🔗 Recursos desplegados:${NC}"
    kubectl get all -n "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME"
    echo ""
    
    echo -e "${BLUE}💡 Comandos útiles:${NC}"
    echo "  📋 Ver logs:         kubectl logs -f deployment/$RELEASE_NAME -n $NAMESPACE"
    echo "  📊 Ver status:       kubectl get pods -n $NAMESPACE"
    echo "  🔍 Describir pod:    kubectl describe pod <pod-name> -n $NAMESPACE"
    echo "  🚀 Port forward:     kubectl port-forward service/$RELEASE_NAME 8080:80 -n $NAMESPACE"
    echo "  🔄 Restart deploy:   kubectl rollout restart deployment/$RELEASE_NAME -n $NAMESPACE"
    echo "  📈 Ver HPA:          kubectl get hpa -n $NAMESPACE"
    echo ""
    
    if [ "$ENVIRONMENT" != "development" ]; then
        echo -e "${BLUE}🌐 URLs de acceso:${NC}"
        if kubectl get ingress -n "$NAMESPACE" &> /dev/null; then
            kubectl get ingress -n "$NAMESPACE" -o custom-columns=NAME:.metadata.name,HOSTS:.spec.rules[*].host,PORTS:.spec.rules[*].http.paths[*].backend.service.port.number
        fi
    fi
}

show_troubleshooting_info() {
    echo -e "\n${RED}🔧 TROUBLESHOOTING INFORMATION${NC}"
    echo -e "${RED}════════════════════════════════${NC}\n"
    
    echo -e "${YELLOW}📋 Pod Status:${NC}"
    kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/instance="$RELEASE_NAME"
    echo ""
    
    echo -e "${YELLOW}📊 Events:${NC}"
    kubectl get events -n "$NAMESPACE" --sort-by='.lastTimestamp' | tail -10
    echo ""
    
    echo -e "${YELLOW}🔍 Logs (últimas 20 líneas):${NC}"
    kubectl logs -l app.kubernetes.io/instance="$RELEASE_NAME" -n "$NAMESPACE" --tail=20
}

rollback_deployment() {
    log_step "Realizando rollback..."
    
    if helm rollback "$RELEASE_NAME" -n "$NAMESPACE"; then
        log_success "Rollback completado"
        verify_deployment
    else
        log_error "Rollback falló"
        exit 1
    fi
}

# ===========================================
# PARSEAR ARGUMENTOS
# ===========================================

ENVIRONMENT=""
DRY_RUN=false
UPGRADE=false
ROLLBACK=false
DEBUG_FLAG=""

while [[ $# -gt 0 ]]; do
    case $1 in
        dev|development|staging|prod|production)
            ENVIRONMENT="$1"
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --upgrade)
            UPGRADE=true
            shift
            ;;
        --rollback)
            ROLLBACK=true
            shift
            ;;
        --debug)
            DEBUG_FLAG="--debug"
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            log_error "Opción desconocida: $1"
            show_help
            exit 1
            ;;
    esac
done

# Verificar que se especificó un entorno
if [ -z "$ENVIRONMENT" ] && [ "$ROLLBACK" = false ]; then
    log_error "Debes especificar un entorno"
    show_help
    exit 1
fi

# ===========================================
# EJECUCIÓN PRINCIPAL
# ===========================================

main() {
    log_info "Iniciando deployment de LMS Platform..."
    echo "🎯 Entorno: $ENVIRONMENT"
    echo "📅 Fecha: $(date)"
    echo "👤 Usuario: $(whoami)"
    echo "🌐 Cluster: $(kubectl config current-context)"
    echo ""
    
    check_prerequisites
    
    if [ "$ROLLBACK" = true ]; then
        rollback_deployment
        exit 0
    fi
    
    validate_environment "$ENVIRONMENT"
    create_namespace
    check_secrets
    lint_chart
    
    if [ "$DRY_RUN" = true ]; then
        dry_run_deployment
    else
        deploy_application
        verify_deployment
        run_tests
        show_deployment_info
    fi
    
    log_success "¡Deployment completado exitosamente! 🎉"
}

# Ejecutar función principal
main "$@"
