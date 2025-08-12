#!/bin/bash
# ===========================================
# BUILD SCRIPT AVANZADO - LMS PLATFORM
# ===========================================

set -e  # Exit on any error

# Configuración
PROJECT_NAME="lms-platform"
REGISTRY="gcr.io/ai-academy-461719"
IMAGE_NAME="$REGISTRY/$PROJECT_NAME"
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
VERSION=${1:-"latest"}

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════════════╗"
echo "║                    🐳 LMS PLATFORM BUILD SYSTEM                      ║"
echo "║                     Advanced Docker Image Builder                    ║"
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

check_dependencies() {
    log_info "Verificando dependencias..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi
    log_success "Docker disponible"
    
    if ! command -v git &> /dev/null; then
        log_warning "Git no disponible (tags de commit limitados)"
    else
        log_success "Git disponible"
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker no está ejecutándose"
        exit 1
    fi
    log_success "Docker ejecutándose"
}

cleanup_build_artifacts() {
    log_info "Limpiando artefactos de build anteriores..."
    
    # Limpiar imágenes dangling
    docker image prune -f > /dev/null 2>&1 || true
    
    # Limpiar build cache si es muy grande (>5GB)
    BUILD_CACHE_SIZE=$(docker system df --format "table {{.Size}}" | grep "Build Cache" | awk '{print $3}' | sed 's/GB//' || echo "0")
    if (( $(echo "$BUILD_CACHE_SIZE > 5" | bc -l 2>/dev/null || echo "0") )); then
        log_warning "Build cache muy grande (${BUILD_CACHE_SIZE}GB), limpiando..."
        docker builder prune -f
    fi
    
    log_success "Limpieza completada"
}

perform_security_scan() {
    log_info "Realizando escaneo de seguridad..."
    
    if command -v trivy &> /dev/null; then
        log_info "Ejecutando Trivy security scan..."
        trivy image --severity HIGH,CRITICAL "$IMAGE_NAME:$VERSION" || log_warning "Vulnerabilidades encontradas"
    else
        log_warning "Trivy no instalado, saltando escaneo de seguridad"
    fi
}

build_image() {
    log_info "Construyendo imagen Docker..."
    
    # Build arguments
    BUILD_ARGS=(
        --build-arg BUILD_DATE="$BUILD_DATE"
        --build-arg VCS_REF="$GIT_COMMIT"
        --build-arg VERSION="$VERSION"
        --label "org.opencontainers.image.created=$BUILD_DATE"
        --label "org.opencontainers.image.source=https://github.com/your-org/lms-platform"
        --label "org.opencontainers.image.version=$VERSION"
        --label "org.opencontainers.image.revision=$GIT_COMMIT"
        --label "org.opencontainers.image.title=LMS Platform"
        --label "org.opencontainers.image.description=Learning Management System"
    )
    
    # Multi-platform build si BuildKit está disponible
    if docker buildx version &> /dev/null; then
        log_info "Usando BuildKit para build multi-plataforma..."
        docker buildx build \
            "${BUILD_ARGS[@]}" \
            --platform linux/amd64,linux/arm64 \
            --tag "$IMAGE_NAME:$VERSION" \
            --tag "$IMAGE_NAME:latest" \
            --push \
            . || {
                log_error "Build con BuildKit falló, intentando build tradicional..."
                docker build \
                    "${BUILD_ARGS[@]}" \
                    --tag "$IMAGE_NAME:$VERSION" \
                    --tag "$IMAGE_NAME:latest" \
                    .
            }
    else
        log_info "Usando Docker build tradicional..."
        docker build \
            "${BUILD_ARGS[@]}" \
            --tag "$IMAGE_NAME:$VERSION" \
            --tag "$IMAGE_NAME:latest" \
            .
    fi
    
    log_success "Imagen construida: $IMAGE_NAME:$VERSION"
}

analyze_image() {
    log_info "Analizando imagen construida..."
    
    # Información básica de la imagen
    echo "📊 Información de la imagen:"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | grep "$PROJECT_NAME" | head -5
    
    # Layers de la imagen
    echo "📋 Layers de la imagen:"
    docker history --format "table {{.CreatedBy}}\t{{.Size}}" "$IMAGE_NAME:$VERSION" | head -10
    
    # Tamaño de la imagen
    IMAGE_SIZE=$(docker images "$IMAGE_NAME:$VERSION" --format "{{.Size}}")
    echo "📏 Tamaño final: $IMAGE_SIZE"
    
    # Verificar que la imagen funciona
    log_info "Verificando que la imagen funciona..."
    docker run --rm "$IMAGE_NAME:$VERSION" node --version || log_warning "Verificación básica falló"
}

push_image() {
    read -p "¿Deseas hacer push de la imagen a $REGISTRY? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Haciendo push de la imagen..."
        
        # Verificar autenticación
        if ! docker pull $REGISTRY/hello-world:latest &> /dev/null; then
            log_warning "No autenticado en $REGISTRY"
            log_info "Ejecuta: gcloud auth configure-docker"
        fi
        
        docker push "$IMAGE_NAME:$VERSION"
        docker push "$IMAGE_NAME:latest"
        
        log_success "Push completado"
        log_info "Imagen disponible en: $IMAGE_NAME:$VERSION"
    else
        log_info "Push cancelado"
    fi
}

# ===========================================
# EJECUCIÓN PRINCIPAL
# ===========================================

main() {
    echo "🚀 Iniciando build de $PROJECT_NAME:$VERSION"
    echo "📅 Build date: $BUILD_DATE"
    echo "🔄 Git commit: $GIT_COMMIT"
    echo
    
    check_dependencies
    cleanup_build_artifacts
    build_image
    analyze_image
    perform_security_scan
    push_image
    
    echo
    log_success "Build completado exitosamente!"
    echo
    echo "📋 Comandos útiles:"
    echo "  🐳 Ejecutar imagen: docker run -p 3000:3000 $IMAGE_NAME:$VERSION"
    echo "  🔍 Inspeccionar: docker inspect $IMAGE_NAME:$VERSION"
    echo "  🧹 Limpiar: docker rmi $IMAGE_NAME:$VERSION"
    echo
}

# Ejecutar función principal
main "$@"
