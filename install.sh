#!/bin/bash
# ===========================================
# LMS PLATFORM - INSTALACIÓN COMPLETA
# ===========================================
# Script de instalación automatizada para containerización

set -e

# Configuración
SCRIPT_VERSION="2.0.0"
PROJECT_NAME="lms-platform"
NAMESPACE="lms-platform"
CLUSTER_NAME="lms-cluster"
REGION="us-central1-a"
PROJECT_ID=""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variables de estado
INSTALL_LOG="lms_installation_$(date +%Y%m%d_%H%M%S).log"
REQUIREMENTS_PASSED=true
DOCKER_INSTALLED=false
KUBECTL_INSTALLED=false
GCLOUD_INSTALLED=false

# Función para logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$INSTALL_LOG"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$INSTALL_LOG"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$INSTALL_LOG"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$INSTALL_LOG"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$INSTALL_LOG"
}

title() {
    echo -e "${CYAN}
╔════════════════════════════════════════════════════════════════════╗
║ $1
╚════════════════════════════════════════════════════════════════════╝${NC}"
}

# Función para mostrar banner
show_banner() {
    clear
    echo -e "${PURPLE}
    ██╗     ███╗   ███╗███████╗    ██████╗ ██╗      █████╗ ████████╗███████╗ ██████╗ ██████╗ ███╗   ███╗
    ██║     ████╗ ████║██╔════╝    ██╔══██╗██║     ██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██╔══██╗████╗ ████║
    ██║     ██╔████╔██║███████╗    ██████╔╝██║     ███████║   ██║   █████╗  ██║   ██║██████╔╝██╔████╔██║
    ██║     ██║╚██╔╝██║╚════██║    ██╔═══╝ ██║     ██╔══██║   ██║   ██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║
    ███████╗██║ ╚═╝ ██║███████║    ██║     ███████╗██║  ██║   ██║   ██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║
    ╚══════╝╚═╝     ╚═╝╚══════╝    ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝
    
    ╔════════════════════════════════════════════════════════════════════════════════════════════════════╗
    ║                             🚀 INSTALACIÓN COMPLETA DE CONTAINERIZACIÓN                           ║
    ║                                                                                                    ║
    ║  🎯 Versión: $SCRIPT_VERSION                                                                            ║
    ║  📅 Fecha: $(date)                                                                   ║
    ║  🖥️  Sistema: $(uname -s)                                                                              ║
    ║                                                                                                    ║
    ║  Este script configurará automáticamente:                                                         ║
    ║  • ✅ Herramientas necesarias (Docker, kubectl, gcloud)                                          ║
    ║  • ✅ Configuración de desarrollo local                                                           ║
    ║  • ✅ Cluster de Kubernetes en GKE                                                                ║
    ║  • ✅ Pipeline CI/CD completo                                                                     ║
    ║  • ✅ Sistema de monitoreo y alertas                                                              ║
    ║  • ✅ Configuración de seguridad empresarial                                                      ║
    ║                                                                                                    ║
    ╚════════════════════════════════════════════════════════════════════════════════════════════════════╝${NC}
    "
}

# Función para mostrar ayuda
show_help() {
    cat << EOF
╔════════════════════════════════════════════════════════════════════╗
║                   🚀 LMS PLATFORM SETUP SCRIPT                    ║
╚════════════════════════════════════════════════════════════════════╝

Uso: $0 [opciones]

OPCIONES:
  -p, --project-id ID      ID del proyecto de Google Cloud
  -r, --region REGION      Región para el cluster (default: us-central1-a)
  -n, --namespace NAME     Namespace de Kubernetes (default: lms-platform)
  -c, --cluster NAME       Nombre del cluster (default: lms-cluster)
  -f, --force             Forzar instalación sin confirmación
  -s, --skip-tools        Saltar instalación de herramientas
  -d, --dev-only          Solo configurar entorno de desarrollo
  -q, --quick             Instalación rápida (configuración mínima)
  --dry-run               Mostrar qué se haría sin ejecutar
  --help                  Mostrar esta ayuda

EJEMPLOS:
  $0 -p mi-proyecto-gcp                    # Instalación básica
  $0 -p mi-proyecto -r europe-west1-b     # Región específica
  $0 -d                                    # Solo desarrollo local
  $0 -q -p mi-proyecto                     # Instalación rápida
  $0 --dry-run                             # Simular instalación

PREREQUISITOS:
  • Sistema operativo: Linux/macOS/WSL
  • Acceso de administrador (sudo)
  • Conexión a internet
  • Cuenta de Google Cloud activa

EOF
}

# Verificar sistema operativo
check_os() {
    log "🔍 Verificando sistema operativo..."
    
    case "$(uname -s)" in
        Linux*)
            OS="Linux"
            PACKAGE_MANAGER=""
            if command -v apt-get &> /dev/null; then
                PACKAGE_MANAGER="apt"
            elif command -v yum &> /dev/null; then
                PACKAGE_MANAGER="yum"
            elif command -v dnf &> /dev/null; then
                PACKAGE_MANAGER="dnf"
            elif command -v pacman &> /dev/null; then
                PACKAGE_MANAGER="pacman"
            fi
            ;;
        Darwin*)
            OS="macOS"
            PACKAGE_MANAGER="brew"
            ;;
        CYGWIN*|MINGW*|MSYS*)
            OS="Windows"
            warning "Windows detectado. Se recomienda usar WSL2."
            ;;
        *)
            error "Sistema operativo no soportado: $(uname -s)"
            exit 1
            ;;
    esac
    
    info "Sistema detectado: $OS"
    [ -n "$PACKAGE_MANAGER" ] && info "Package manager: $PACKAGE_MANAGER"
    
    # Verificar si es WSL
    if [ "$OS" = "Linux" ] && grep -qi microsoft /proc/version 2>/dev/null; then
        info "WSL detectado"
        OS="WSL"
    fi
}

# Verificar prerrequisitos
check_requirements() {
    title "🔍 VERIFICANDO PRERREQUISITOS"
    
    log "Verificando herramientas necesarias..."
    
    # Verificar Docker
    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')
        info "✅ Docker encontrado: v$docker_version"
        DOCKER_INSTALLED=true
        
        # Verificar que Docker esté ejecutándose
        if docker info &> /dev/null; then
            info "✅ Docker daemon ejecutándose"
        else
            warning "⚠️ Docker daemon no está ejecutándose"
            info "💡 Inicia Docker con: sudo systemctl start docker"
        fi
    else
        warning "❌ Docker no encontrado"
        DOCKER_INSTALLED=false
        REQUIREMENTS_PASSED=false
    fi
    
    # Verificar kubectl
    if command -v kubectl &> /dev/null; then
        local kubectl_version=$(kubectl version --client --short 2>/dev/null | grep -oE 'v[0-9]+\.[0-9]+\.[0-9]+')
        info "✅ kubectl encontrado: $kubectl_version"
        KUBECTL_INSTALLED=true
    else
        warning "❌ kubectl no encontrado"
        KUBECTL_INSTALLED=false
        REQUIREMENTS_PASSED=false
    fi
    
    # Verificar gcloud
    if command -v gcloud &> /dev/null; then
        local gcloud_version=$(gcloud version --format='value(Google Cloud SDK)' 2>/dev/null)
        info "✅ gcloud CLI encontrado: v$gcloud_version"
        GCLOUD_INSTALLED=true
        
        # Verificar autenticación
        if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
            local active_account=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
            info "✅ Autenticado como: $active_account"
        else
            warning "⚠️ No hay autenticación activa con gcloud"
            info "💡 Autentica con: gcloud auth login"
        fi
    else
        warning "❌ gcloud CLI no encontrado"
        GCLOUD_INSTALLED=false
        REQUIREMENTS_PASSED=false
    fi
    
    # Verificar Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version)
        info "✅ Node.js encontrado: $node_version"
        
        # Verificar npm
        if command -v npm &> /dev/null; then
            local npm_version=$(npm --version)
            info "✅ npm encontrado: v$npm_version"
        else
            warning "❌ npm no encontrado"
        fi
    else
        warning "❌ Node.js no encontrado"
    fi
    
    # Verificar herramientas adicionales
    local tools=("curl" "jq" "git" "openssl")
    for tool in "${tools[@]}"; do
        if command -v "$tool" &> /dev/null; then
            info "✅ $tool encontrado"
        else
            warning "❌ $tool no encontrado"
        fi
    done
    
    # Verificar permisos
    if [ "$EUID" -eq 0 ]; then
        warning "⚠️ Ejecutándose como root. Se recomienda usar usuario normal."
    fi
    
    # Resumen
    if [ "$REQUIREMENTS_PASSED" = true ]; then
        success "✅ Todos los prerrequisitos están cumplidos"
    else
        error "❌ Faltan herramientas necesarias"
        info "💡 Ejecuta la instalación de herramientas primero"
    fi
}

# Instalar herramientas faltantes
install_tools() {
    title "🛠️ INSTALANDO HERRAMIENTAS NECESARIAS"
    
    if [ "$SKIP_TOOLS" = true ]; then
        warning "Saltando instalación de herramientas (--skip-tools)"
        return
    fi
    
    log "Instalando herramientas faltantes..."
    
    # Instalar Docker
    if [ "$DOCKER_INSTALLED" = false ]; then
        log "📦 Instalando Docker..."
        
        case "$OS" in
            "Linux"|"WSL")
                curl -fsSL https://get.docker.com -o get-docker.sh
                sudo sh get-docker.sh
                sudo usermod -aG docker $USER
                rm get-docker.sh
                ;;
            "macOS")
                if command -v brew &> /dev/null; then
                    brew install --cask docker
                else
                    error "Homebrew no encontrado. Instala Docker Desktop manualmente desde https://www.docker.com/products/docker-desktop"
                    exit 1
                fi
                ;;
        esac
        
        success "✅ Docker instalado"
    fi
    
    # Instalar kubectl
    if [ "$KUBECTL_INSTALLED" = false ]; then
        log "☸️ Instalando kubectl..."
        
        case "$OS" in
            "Linux"|"WSL")
                curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
                sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
                rm kubectl
                ;;
            "macOS")
                if command -v brew &> /dev/null; then
                    brew install kubectl
                else
                    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/amd64/kubectl"
                    sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
                    rm kubectl
                fi
                ;;
        esac
        
        success "✅ kubectl instalado"
    fi
    
    # Instalar gcloud CLI
    if [ "$GCLOUD_INSTALLED" = false ]; then
        log "☁️ Instalando gcloud CLI..."
        
        case "$OS" in
            "Linux"|"WSL")
                curl https://sdk.cloud.google.com | bash
                exec -l $SHELL
                ;;
            "macOS")
                if command -v brew &> /dev/null; then
                    brew install --cask google-cloud-sdk
                else
                    curl https://sdk.cloud.google.com | bash
                    exec -l $SHELL
                fi
                ;;
        esac
        
        success "✅ gcloud CLI instalado"
        info "💡 Ejecuta 'gcloud auth login' para autenticarte"
    fi
    
    # Instalar herramientas adicionales
    log "🔧 Instalando herramientas adicionales..."
    
    case "$PACKAGE_MANAGER" in
        "apt")
            sudo apt update
            sudo apt install -y curl jq git openssl unzip
            ;;
        "yum"|"dnf")
            sudo $PACKAGE_MANAGER install -y curl jq git openssl unzip
            ;;
        "pacman")
            sudo pacman -S --noconfirm curl jq git openssl unzip
            ;;
        "brew")
            brew install curl jq git openssl
            ;;
    esac
    
    success "✅ Herramientas adicionales instaladas"
}

# Configurar entorno de desarrollo
setup_development() {
    title "💻 CONFIGURANDO ENTORNO DE DESARROLLO"
    
    log "Configurando desarrollo local..."
    
    # Verificar estructura del proyecto
    if [ ! -f "package.json" ]; then
        error "package.json no encontrado. ¿Estás en el directorio correcto?"
        exit 1
    fi
    
    # Instalar dependencias
    log "📦 Instalando dependencias de Node.js..."
    npm install
    
    # Configurar variables de entorno
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            log "⚙️ Creando archivo .env desde .env.example..."
            cp .env.example .env
            info "📝 Edita .env con tus configuraciones"
        else
            log "⚙️ Creando archivo .env básico..."
            cat > .env << 'EOF'
# Database
DATABASE_URL="mysql://lms_user:lms_password@localhost:3306/lms_platform_dev"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_TELEMETRY_DISABLED=1

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=""
CLERK_SECRET_KEY=""

# File Storage
UPLOADTHING_SECRET=""
UPLOADTHING_APP_ID=""

# Video Processing (MUX)
MUX_TOKEN_ID=""
MUX_TOKEN_SECRET=""

# Payments (Stripe)
STRIPE_API_KEY=""
STRIPE_WEBHOOK_SECRET=""

# Google Cloud
GOOGLE_CLOUD_PROJECT_ID=""
GOOGLE_CLOUD_BUCKET_NAME=""
EOF
        fi
    fi
    
    # Configurar Docker para desarrollo
    log "🐳 Configurando Docker para desarrollo..."
    
    # Crear red Docker si no existe
    docker network create lms-network 2>/dev/null || true
    
    # Configurar VS Code si está disponible
    if command -v code &> /dev/null; then
        log "📝 Configurando VS Code workspace..."
        if [ -f ".vscode/lms-platform.code-workspace" ]; then
            info "💡 Abre VS Code con: code .vscode/lms-platform.code-workspace"
        fi
    fi
    
    success "✅ Entorno de desarrollo configurado"
}

# Configurar Google Cloud
setup_gcloud() {
    title "☁️ CONFIGURANDO GOOGLE CLOUD"
    
    if [ -z "$PROJECT_ID" ]; then
        error "PROJECT_ID no especificado. Usa -p o --project-id"
        exit 1
    fi
    
    log "Configurando proyecto: $PROJECT_ID"
    
    # Configurar proyecto por defecto
    gcloud config set project "$PROJECT_ID"
    
    # Habilitar APIs necesarias
    log "🔧 Habilitando APIs necesarias..."
    local apis=(
        "container.googleapis.com"
        "compute.googleapis.com"
        "sql-component.googleapis.com"
        "sqladmin.googleapis.com"
        "storage-component.googleapis.com"
        "monitoring.googleapis.com"
        "logging.googleapis.com"
        "cloudbuild.googleapis.com"
        "secretmanager.googleapis.com"
    )
    
    for api in "${apis[@]}"; do
        log "Habilitando $api..."
        gcloud services enable "$api"
    done
    
    # Verificar facturación
    if gcloud beta billing accounts list --format="value(name)" | grep -q .; then
        info "✅ Cuenta de facturación encontrada"
    else
        warning "⚠️ No se encontró cuenta de facturación activa"
        info "💡 Configura facturación en: https://console.cloud.google.com/billing"
    fi
    
    success "✅ Google Cloud configurado"
}

# Crear cluster GKE
create_gke_cluster() {
    title "☸️ CREANDO CLUSTER GKE"
    
    log "Creando cluster: $CLUSTER_NAME en $REGION"
    
    # Verificar si el cluster ya existe
    if gcloud container clusters describe "$CLUSTER_NAME" --zone "$REGION" &> /dev/null; then
        warning "El cluster $CLUSTER_NAME ya existe"
        read -p "¿Deseas recrearlo? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log "Eliminando cluster existente..."
            gcloud container clusters delete "$CLUSTER_NAME" --zone "$REGION" --quiet
        else
            info "Usando cluster existente"
            return
        fi
    fi
    
    # Crear cluster GKE
    log "🏗️ Creando cluster GKE (esto puede tomar varios minutos)..."
    
    gcloud container clusters create "$CLUSTER_NAME" \
        --zone "$REGION" \
        --machine-type "e2-standard-4" \
        --num-nodes 3 \
        --enable-autoscaling \
        --min-nodes 1 \
        --max-nodes 10 \
        --enable-autorepair \
        --enable-autoupgrade \
        --enable-ip-alias \
        --network "default" \
        --subnetwork "default" \
        --enable-stackdriver-kubernetes \
        --enable-autorepair \
        --enable-autoupgrade \
        --workload-pool="$PROJECT_ID.svc.id.goog"
    
    # Obtener credenciales
    log "🔑 Obteniendo credenciales del cluster..."
    gcloud container clusters get-credentials "$CLUSTER_NAME" --zone "$REGION"
    
    # Verificar conectividad
    if kubectl cluster-info &> /dev/null; then
        success "✅ Cluster GKE creado y conectado"
    else
        error "❌ Error conectando al cluster"
        exit 1
    fi
}

# Configurar Kubernetes
setup_kubernetes() {
    title "⚙️ CONFIGURANDO KUBERNETES"
    
    log "Configurando namespace y recursos..."
    
    # Aplicar configuraciones de Kubernetes
    if [ -d "k8s" ]; then
        log "📋 Aplicando manifests de Kubernetes..."
        
        kubectl apply -f k8s/00-namespace-config.yaml
        kubectl apply -f k8s/01-deployment.yaml
        kubectl apply -f k8s/02-services.yaml
        kubectl apply -f k8s/03-ingress.yaml
        
        # Aplicar configuraciones de seguridad
        if [ -d "security" ]; then
            log "🔒 Aplicando configuraciones de seguridad..."
            kubectl apply -f security/
        fi
        
        success "✅ Configuraciones de Kubernetes aplicadas"
    else
        warning "Directorio k8s no encontrado"
    fi
    
    # Esperar a que los pods estén listos
    log "⏳ Esperando a que los pods estén listos..."
    kubectl wait --for=condition=ready pod -l app=lms-platform -n "$NAMESPACE" --timeout=300s
    
    # Verificar estado
    kubectl get all -n "$NAMESPACE"
}

# Configurar monitoreo
setup_monitoring() {
    title "📊 CONFIGURANDO MONITOREO"
    
    log "Configurando Prometheus y Grafana..."
    
    # Instalar Prometheus usando Helm (si está disponible)
    if command -v helm &> /dev/null; then
        log "🎯 Instalando Prometheus con Helm..."
        
        # Agregar repositorio de Helm
        helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
        helm repo update
        
        # Instalar Prometheus
        helm install prometheus prometheus-community/kube-prometheus-stack \
            --namespace monitoring \
            --create-namespace \
            --set grafana.adminPassword=admin123 \
            --set prometheus.prometheusSpec.retention=30d
        
        success "✅ Prometheus y Grafana instalados"
        
        # Mostrar información de acceso
        info "📊 Acceso a Grafana:"
        info "   kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring"
        info "   Usuario: admin"
        info "   Password: admin123"
        
    else
        warning "Helm no encontrado. Instala manualmente Prometheus y Grafana"
        info "💡 Configuraciones disponibles en docker/monitoring/"
    fi
}

# Configurar CI/CD
setup_cicd() {
    title "🚀 CONFIGURANDO CI/CD"
    
    log "Configurando GitHub Actions..."
    
    if [ -f ".github/workflows/ci-cd.yml" ]; then
        info "✅ Pipeline CI/CD ya configurado"
        
        # Verificar secrets necesarios
        warning "⚠️ Configura los siguientes secrets en GitHub:"
        echo "   - GCP_PROJECT_ID: $PROJECT_ID"
        echo "   - GCP_SA_KEY: (Service Account key JSON)"
        echo "   - SLACK_WEBHOOK_URL: (opcional)"
        
        info "💡 Configura secrets en: https://github.com/tu-usuario/lms-platform/settings/secrets"
    else
        warning "Pipeline CI/CD no encontrado"
        info "💡 Archivo esperado: .github/workflows/ci-cd.yml"
    fi
}

# Ejecutar tests
run_tests() {
    title "🧪 EJECUTANDO TESTS"
    
    log "Ejecutando tests de containerización..."
    
    if [ -f "tests/docker/test-docker.sh" ]; then
        bash tests/docker/test-docker.sh --quick
        
        if [ $? -eq 0 ]; then
            success "✅ Tests pasaron exitosamente"
        else
            warning "⚠️ Algunos tests fallaron"
        fi
    else
        warning "Tests no encontrados"
    fi
}

# Generar reporte final
generate_final_report() {
    title "📋 GENERANDO REPORTE FINAL"
    
    local report_file="installation_report_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# 🎓 Reporte de Instalación - LMS Platform

**Fecha:** $(date)
**Versión:** $SCRIPT_VERSION
**Usuario:** $(whoami)
**Sistema:** $(uname -a)

## ✅ Instalación Completada

### 🔧 Herramientas Instaladas
- **Docker:** $(docker --version 2>/dev/null || echo "No instalado")
- **kubectl:** $(kubectl version --client --short 2>/dev/null || echo "No instalado")
- **gcloud:** $(gcloud version --format='value(Google Cloud SDK)' 2>/dev/null || echo "No instalado")

### ☁️ Google Cloud
- **Proyecto:** $PROJECT_ID
- **Cluster:** $CLUSTER_NAME
- **Región:** $REGION
- **Namespace:** $NAMESPACE

### 🌐 URLs de Acceso
- **Aplicación:** http://localhost:3000 (desarrollo)
- **Grafana:** kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
- **Prometheus:** kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring

### 📝 Próximos Pasos

1. **Configurar variables de entorno:**
   - Edita el archivo \`.env\` con tus credenciales
   - Configura Clerk, Stripe, y otros servicios

2. **Iniciar desarrollo:**
   \`\`\`bash
   # Desarrollo local
   ./docker-manager.bat
   
   # O manualmente
   docker-compose up -d
   \`\`\`

3. **Deploy a producción:**
   \`\`\`bash
   # Build y deploy
   ./docker/scripts/deploy.sh
   \`\`\`

4. **Configurar monitoreo:**
   - Accede a Grafana y configura dashboards
   - Revisa alertas en Prometheus

5. **Configurar CI/CD:**
   - Agrega secrets en GitHub
   - Haz push para trigger el pipeline

### 🆘 Soporte

- **Documentación:** CONTAINERIZATION-FINAL.md
- **Logs de instalación:** $INSTALL_LOG
- **Troubleshooting:** ./tools/debug.sh

---

**¡Instalación completada exitosamente!** 🎉
EOF
    
    success "✅ Reporte generado: $report_file"
}

# Función principal
main() {
    # Variables por defecto
    local FORCE=false
    local SKIP_TOOLS=false
    local DEV_ONLY=false
    local QUICK_INSTALL=false
    local DRY_RUN=false
    
    # Procesar argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--project-id)
                PROJECT_ID="$2"
                shift 2
                ;;
            -r|--region)
                REGION="$2"
                shift 2
                ;;
            -n|--namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            -c|--cluster)
                CLUSTER_NAME="$2"
                shift 2
                ;;
            -f|--force)
                FORCE=true
                shift
                ;;
            -s|--skip-tools)
                SKIP_TOOLS=true
                shift
                ;;
            -d|--dev-only)
                DEV_ONLY=true
                shift
                ;;
            -q|--quick)
                QUICK_INSTALL=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                error "Opción desconocida: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Mostrar banner
    show_banner
    
    # Crear log de instalación
    echo "# LMS Platform Installation Log - $(date)" > "$INSTALL_LOG"
    echo "# Version: $SCRIPT_VERSION" >> "$INSTALL_LOG"
    echo "# Arguments: $*" >> "$INSTALL_LOG"
    echo "" >> "$INSTALL_LOG"
    
    # Verificar sistema
    check_os
    
    # Verificar prerrequisitos
    check_requirements
    
    # Confirmar instalación
    if [ "$DRY_RUN" = true ]; then
        info "🔍 MODO DRY-RUN - No se ejecutarán cambios"
        info "Se ejecutarían los siguientes pasos:"
        echo "  1. Verificar prerrequisitos"
        echo "  2. Instalar herramientas faltantes"
        echo "  3. Configurar entorno de desarrollo"
        [ "$DEV_ONLY" != true ] && echo "  4. Crear cluster GKE"
        [ "$DEV_ONLY" != true ] && echo "  5. Configurar Kubernetes"
        [ "$QUICK_INSTALL" != true ] && echo "  6. Configurar monitoreo"
        echo "  7. Ejecutar tests"
        echo "  8. Generar reporte final"
        exit 0
    fi
    
    if [ "$FORCE" != true ]; then
        echo
        warning "⚠️ Esta instalación configurará automáticamente:"
        echo "   • Herramientas de containerización"
        echo "   • Cluster GKE en Google Cloud"
        echo "   • Sistema de monitoreo"
        echo "   • Configuraciones de seguridad"
        echo
        read -p "¿Deseas continuar? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            info "Instalación cancelada"
            exit 0
        fi
    fi
    
    # Ejecutar instalación
    log "🚀 Iniciando instalación de LMS Platform..."
    
    # Instalar herramientas si es necesario
    if [ "$REQUIREMENTS_PASSED" != true ]; then
        install_tools
        check_requirements  # Re-verificar después de la instalación
    fi
    
    # Configurar desarrollo
    setup_development
    
    # Solo desarrollo local
    if [ "$DEV_ONLY" = true ]; then
        success "✅ Configuración de desarrollo completada"
        info "💡 Inicia con: docker-compose up -d"
        exit 0
    fi
    
    # Configuración de producción
    if [ -n "$PROJECT_ID" ]; then
        setup_gcloud
        create_gke_cluster
        setup_kubernetes
        
        # Configuración completa (no quick)
        if [ "$QUICK_INSTALL" != true ]; then
            setup_monitoring
        fi
        
        setup_cicd
    else
        warning "PROJECT_ID no especificado. Saltando configuración de GKE"
    fi
    
    # Ejecutar tests
    run_tests
    
    # Generar reporte final
    generate_final_report
    
    echo
    success "🎉 ¡Instalación completada exitosamente!"
    echo
    info "📋 Próximos pasos:"
    echo "   1. Edita .env con tus configuraciones"
    echo "   2. Inicia desarrollo: docker-compose up -d"
    echo "   3. Accede a: http://localhost:3000"
    echo "   4. Revisa el reporte de instalación"
    echo
    info "📚 Documentación completa en: CONTAINERIZATION-FINAL.md"
    info "🔧 Para troubleshooting: ./tools/debug.sh"
    
    log "Instalación finalizada exitosamente"
}

# Ejecutar función principal
main "$@"
