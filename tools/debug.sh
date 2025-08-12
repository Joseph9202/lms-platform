#!/bin/bash
# ===========================================
# LMS PLATFORM DEBUG TOOLKIT
# ===========================================
# Herramienta completa de debugging y troubleshooting

set -e

# Configuración
NAMESPACE="lms-platform"
APP_NAME="lms-platform"
LOG_FILE="debug_session_$(date +%Y%m%d_%H%M%S).log"
TEMP_DIR="/tmp/lms-debug-$$"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Función para logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

debug() {
    echo -e "${PURPLE}[DEBUG]${NC} $1" | tee -a "$LOG_FILE"
}

title() {
    echo -e "${CYAN}
╔════════════════════════════════════════════════════════════════════╗
║ $1
╚════════════════════════════════════════════════════════════════════╝${NC}"
}

# Función para mostrar ayuda
show_help() {
    cat << EOF
╔════════════════════════════════════════════════════════════════════╗
║                   🔧 LMS PLATFORM DEBUG TOOLKIT                   ║
╚════════════════════════════════════════════════════════════════════╝

Uso: $0 [opción]

OPCIONES DE DEBUGGING:
  -a, --all              Ejecutar todos los diagnósticos
  -c, --containers       Diagnosticar contenedores Docker
  -k, --kubernetes       Diagnosticar cluster Kubernetes
  -n, --network          Diagnosticar conectividad de red
  -l, --logs             Analizar logs de aplicación
  -p, --performance      Analizar performance del sistema
  -d, --database         Diagnosticar conexión de base de datos
  -s, --security         Verificar configuración de seguridad
  -h, --health           Verificar health checks
  -m, --monitoring       Verificar sistema de monitoreo
  -r, --resources        Analizar uso de recursos
  -t, --troubleshoot     Troubleshooting interactivo
  --help                 Mostrar esta ayuda

OPCIONES DE FILTRADO:
  --namespace NAME       Especificar namespace (default: lms-platform)
  --pod NAME             Diagnosticar pod específico
  --container NAME       Diagnosticar contenedor específico
  --since TIME           Analizar logs desde tiempo específico (ej: 1h, 30m)
  --follow               Seguir logs en tiempo real

EJEMPLOS:
  $0 -a                  # Diagnóstico completo
  $0 -k -l              # Kubernetes + logs
  $0 --pod lms-pod-123  # Diagnosticar pod específico
  $0 -l --since 1h      # Logs de última hora
  $0 -t                 # Modo interactivo

EOF
}

# Configurar entorno
setup_environment() {
    log "🔧 Configurando entorno de debugging..."
    
    # Crear directorio temporal
    mkdir -p "$TEMP_DIR"
    
    # Verificar herramientas necesarias
    local tools=("docker" "kubectl" "curl" "jq")
    
    for tool in "${tools[@]}"; do
        if command -v "$tool" &> /dev/null; then
            debug "✅ $tool disponible"
        else
            error "❌ $tool no encontrado"
        fi
    done
    
    # Crear archivo de log
    echo "# LMS Platform Debug Session - $(date)" > "$LOG_FILE"
    echo "=====================================" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
    
    log "✅ Entorno configurado"
}

# Función para cleanup
cleanup() {
    log "🧹 Limpiando archivos temporales..."
    rm -rf "$TEMP_DIR"
    log "✅ Cleanup completado"
    log "📋 Log de sesión guardado en: $LOG_FILE"
}

trap cleanup EXIT

# Diagnosticar contenedores Docker
diagnose_containers() {
    title "🐳 DIAGNÓSTICO DE CONTENEDORES DOCKER"
    
    log "📊 Estado de contenedores..."
    
    # Listar contenedores relacionados con LMS
    echo "=== CONTENEDORES LMS ===" >> "$LOG_FILE"
    docker ps -a --filter name=lms --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" | tee -a "$LOG_FILE"
    
    # Verificar uso de recursos
    echo -e "\n=== USO DE RECURSOS ===" >> "$LOG_FILE"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" | grep lms | tee -a "$LOG_FILE"
    
    # Verificar imágenes
    echo -e "\n=== IMÁGENES LMS ===" >> "$LOG_FILE"
    docker images | grep lms | tee -a "$LOG_FILE"
    
    # Verificar redes
    echo -e "\n=== REDES DOCKER ===" >> "$LOG_FILE"
    docker network ls | grep lms | tee -a "$LOG_FILE"
    
    # Verificar volúmenes
    echo -e "\n=== VOLÚMENES DOCKER ===" >> "$LOG_FILE"
    docker volume ls | grep lms | tee -a "$LOG_FILE"
    
    log "✅ Diagnóstico de contenedores completado"
}

# Diagnosticar Kubernetes
diagnose_kubernetes() {
    title "☸️ DIAGNÓSTICO DE KUBERNETES"
    
    if ! command -v kubectl &> /dev/null; then
        error "kubectl no encontrado, saltando diagnóstico de Kubernetes"
        return
    fi
    
    log "📊 Estado del cluster Kubernetes..."
    
    # Información del cluster
    echo "=== INFORMACIÓN DEL CLUSTER ===" >> "$LOG_FILE"
    kubectl cluster-info >> "$LOG_FILE" 2>&1
    
    # Estado de nodos
    echo -e "\n=== NODOS ===" >> "$LOG_FILE"
    kubectl get nodes -o wide >> "$LOG_FILE" 2>&1
    
    # Estado del namespace
    echo -e "\n=== NAMESPACE $NAMESPACE ===" >> "$LOG_FILE"
    kubectl get namespace "$NAMESPACE" -o yaml >> "$LOG_FILE" 2>&1
    
    # Pods en el namespace
    echo -e "\n=== PODS ===" >> "$LOG_FILE"
    kubectl get pods -n "$NAMESPACE" -o wide >> "$LOG_FILE" 2>&1
    
    # Deployments
    echo -e "\n=== DEPLOYMENTS ===" >> "$LOG_FILE"
    kubectl get deployments -n "$NAMESPACE" -o wide >> "$LOG_FILE" 2>&1
    
    # Services
    echo -e "\n=== SERVICES ===" >> "$LOG_FILE"
    kubectl get services -n "$NAMESPACE" -o wide >> "$LOG_FILE" 2>&1
    
    # Ingress
    echo -e "\n=== INGRESS ===" >> "$LOG_FILE"
    kubectl get ingress -n "$NAMESPACE" -o wide >> "$LOG_FILE" 2>&1
    
    # ConfigMaps
    echo -e "\n=== CONFIGMAPS ===" >> "$LOG_FILE"
    kubectl get configmaps -n "$NAMESPACE" >> "$LOG_FILE" 2>&1
    
    # Secrets (sin valores)
    echo -e "\n=== SECRETS ===" >> "$LOG_FILE"
    kubectl get secrets -n "$NAMESPACE" >> "$LOG_FILE" 2>&1
    
    # PersistentVolumes
    echo -e "\n=== PERSISTENT VOLUMES ===" >> "$LOG_FILE"
    kubectl get pv >> "$LOG_FILE" 2>&1
    
    # PersistentVolumeClaims
    echo -e "\n=== PERSISTENT VOLUME CLAIMS ===" >> "$LOG_FILE"
    kubectl get pvc -n "$NAMESPACE" >> "$LOG_FILE" 2>&1
    
    # Events recientes
    echo -e "\n=== EVENTOS RECIENTES ===" >> "$LOG_FILE"
    kubectl get events -n "$NAMESPACE" --sort-by=.metadata.creationTimestamp | tail -20 >> "$LOG_FILE" 2>&1
    
    # Describir pods con problemas
    local problematic_pods=$(kubectl get pods -n "$NAMESPACE" --field-selector=status.phase!=Running -o jsonpath='{.items[*].metadata.name}')
    
    if [ -n "$problematic_pods" ]; then
        echo -e "\n=== DESCRIPCIÓN DE PODS CON PROBLEMAS ===" >> "$LOG_FILE"
        for pod in $problematic_pods; do
            echo -e "\n--- POD: $pod ---" >> "$LOG_FILE"
            kubectl describe pod "$pod" -n "$NAMESPACE" >> "$LOG_FILE" 2>&1
        done
    fi
    
    log "✅ Diagnóstico de Kubernetes completado"
}

# Diagnosticar conectividad de red
diagnose_network() {
    title "🌐 DIAGNÓSTICO DE RED"
    
    log "📊 Verificando conectividad de red..."
    
    echo "=== CONECTIVIDAD DE RED ===" >> "$LOG_FILE"
    
    # Test de conectividad básica
    local endpoints=(
        "google.com:443"
        "github.com:443"
        "registry.hub.docker.com:443"
        "gcr.io:443"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local host=$(echo $endpoint | cut -d: -f1)
        local port=$(echo $endpoint | cut -d: -f2)
        
        if nc -z -w5 "$host" "$port" 2>/dev/null; then
            info "✅ Conectividad a $endpoint: OK"
            echo "✅ $endpoint: OK" >> "$LOG_FILE"
        else
            warning "❌ Conectividad a $endpoint: FAIL"
            echo "❌ $endpoint: FAIL" >> "$LOG_FILE"
        fi
    done
    
    # Test de DNS
    echo -e "\n=== RESOLUCIÓN DNS ===" >> "$LOG_FILE"
    local dns_tests=("google.com" "kubernetes.default.svc.cluster.local" "lms-platform-service.lms-platform.svc.cluster.local")
    
    for dns_test in "${dns_tests[@]}"; do
        if nslookup "$dns_test" &>/dev/null; then
            info "✅ DNS para $dns_test: OK"
            echo "✅ DNS $dns_test: OK" >> "$LOG_FILE"
        else
            warning "❌ DNS para $dns_test: FAIL"
            echo "❌ DNS $dns_test: FAIL" >> "$LOG_FILE"
        fi
    done
    
    # Test de conectividad interna (si estamos en K8s)
    if command -v kubectl &> /dev/null; then
        echo -e "\n=== CONECTIVIDAD INTERNA K8S ===" >> "$LOG_FILE"
        
        # Test de conectividad entre pods
        local test_pod=$(kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
        
        if [ -n "$test_pod" ]; then
            # Test de conectividad a service
            kubectl exec -n "$NAMESPACE" "$test_pod" -- nc -z lms-platform-service 80 &>/dev/null
            if [ $? -eq 0 ]; then
                info "✅ Conectividad interna a service: OK"
                echo "✅ Service connectivity: OK" >> "$LOG_FILE"
            else
                warning "❌ Conectividad interna a service: FAIL"
                echo "❌ Service connectivity: FAIL" >> "$LOG_FILE"
            fi
            
            # Test de conectividad a DNS interno
            kubectl exec -n "$NAMESPACE" "$test_pod" -- nslookup kubernetes.default.svc.cluster.local &>/dev/null
            if [ $? -eq 0 ]; then
                info "✅ DNS interno: OK"
                echo "✅ Internal DNS: OK" >> "$LOG_FILE"
            else
                warning "❌ DNS interno: FAIL"
                echo "❌ Internal DNS: FAIL" >> "$LOG_FILE"
            fi
        fi
    fi
    
    log "✅ Diagnóstico de red completado"
}

# Analizar logs
analyze_logs() {
    title "📋 ANÁLISIS DE LOGS"
    
    log "📊 Analizando logs de aplicación..."
    
    local since_flag=""
    if [ -n "$SINCE_TIME" ]; then
        since_flag="--since=$SINCE_TIME"
    fi
    
    echo "=== LOGS DE APLICACIÓN ===" >> "$LOG_FILE"
    
    # Logs de Docker (si está disponible)
    if command -v docker &> /dev/null; then
        local containers=$(docker ps --filter name=lms --format "{{.Names}}")
        
        for container in $containers; do
            echo -e "\n--- LOGS DE CONTAINER: $container ---" >> "$LOG_FILE"
            if [ -n "$FOLLOW_LOGS" ]; then
                docker logs -f $since_flag "$container" >> "$LOG_FILE" 2>&1 &
            else
                docker logs $since_flag --tail=100 "$container" >> "$LOG_FILE" 2>&1
            fi
        done
    fi
    
    # Logs de Kubernetes (si está disponible)
    if command -v kubectl &> /dev/null; then
        local pods=$(kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME" -o jsonpath='{.items[*].metadata.name}')
        
        for pod in $pods; do
            echo -e "\n--- LOGS DE POD: $pod ---" >> "$LOG_FILE"
            if [ -n "$FOLLOW_LOGS" ]; then
                kubectl logs -f $since_flag "$pod" -n "$NAMESPACE" >> "$LOG_FILE" 2>&1 &
            else
                kubectl logs $since_flag --tail=100 "$pod" -n "$NAMESPACE" >> "$LOG_FILE" 2>&1
            fi
        done
    fi
    
    # Análisis de patrones en logs
    echo -e "\n=== ANÁLISIS DE PATRONES ===" >> "$LOG_FILE"
    
    local patterns=(
        "ERROR"
        "FATAL"
        "WARN"
        "Exception"
        "timeout"
        "connection"
        "failed"
        "refused"
    )
    
    for pattern in "${patterns[@]}"; do
        local count=$(grep -c "$pattern" "$LOG_FILE" 2>/dev/null || echo 0)
        if [ "$count" -gt 0 ]; then
            warning "🔍 Patrón '$pattern': $count ocurrencias"
            echo "Pattern '$pattern': $count occurrences" >> "$LOG_FILE"
        fi
    done
    
    log "✅ Análisis de logs completado"
}

# Analizar performance
analyze_performance() {
    title "⚡ ANÁLISIS DE PERFORMANCE"
    
    log "📊 Analizando performance del sistema..."
    
    echo "=== ANÁLISIS DE PERFORMANCE ===" >> "$LOG_FILE"
    
    # Performance de contenedores Docker
    if command -v docker &> /dev/null; then
        echo -e "\n--- PERFORMANCE DOCKER ---" >> "$LOG_FILE"
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}" | grep lms >> "$LOG_FILE"
    fi
    
    # Performance de Kubernetes
    if command -v kubectl &> /dev/null; then
        echo -e "\n--- PERFORMANCE KUBERNETES ---" >> "$LOG_FILE"
        kubectl top nodes >> "$LOG_FILE" 2>&1
        kubectl top pods -n "$NAMESPACE" >> "$LOG_FILE" 2>&1
    fi
    
    # Test de response time
    echo -e "\n--- RESPONSE TIME TEST ---" >> "$LOG_FILE"
    
    local endpoints=(
        "http://localhost:3000/api/health"
        "https://lms.ai-academy.com/api/health"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local response_time=$(curl -o /dev/null -s -w '%{time_total}' "$endpoint" 2>/dev/null || echo "timeout")
        
        if [ "$response_time" != "timeout" ]; then
            info "🕐 Response time para $endpoint: ${response_time}s"
            echo "Response time $endpoint: ${response_time}s" >> "$LOG_FILE"
            
            # Evaluar si es lento
            if (( $(echo "$response_time > 2.0" | bc -l) )); then
                warning "⚠️ Response time lento para $endpoint"
            fi
        else
            warning "❌ Timeout para $endpoint"
            echo "Timeout $endpoint" >> "$LOG_FILE"
        fi
    done
    
    log "✅ Análisis de performance completado"
}

# Diagnosticar base de datos
diagnose_database() {
    title "🗄️ DIAGNÓSTICO DE BASE DE DATOS"
    
    log "📊 Verificando conectividad de base de datos..."
    
    echo "=== DIAGNÓSTICO DE BASE DE DATOS ===" >> "$LOG_FILE"
    
    # Test de conectividad desde container
    if command -v kubectl &> /dev/null; then
        local test_pod=$(kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
        
        if [ -n "$test_pod" ]; then
            # Test de conectividad básica
            kubectl exec -n "$NAMESPACE" "$test_pod" -- nc -z cloudsql-proxy 3307 &>/dev/null
            if [ $? -eq 0 ]; then
                info "✅ Conectividad a Cloud SQL Proxy: OK"
                echo "✅ Cloud SQL Proxy connectivity: OK" >> "$LOG_FILE"
            else
                warning "❌ Conectividad a Cloud SQL Proxy: FAIL"
                echo "❌ Cloud SQL Proxy connectivity: FAIL" >> "$LOG_FILE"
            fi
            
            # Test de query básico (si el pod tiene las herramientas)
            kubectl exec -n "$NAMESPACE" "$test_pod" -- node -e "
                const { PrismaClient } = require('@prisma/client');
                const prisma = new PrismaClient();
                prisma.\$queryRaw\`SELECT 1\`.then(() => {
                    console.log('Database query: OK');
                    process.exit(0);
                }).catch((err) => {
                    console.log('Database query: FAIL', err.message);
                    process.exit(1);
                });
            " &>/dev/null
            
            if [ $? -eq 0 ]; then
                info "✅ Query de base de datos: OK"
                echo "✅ Database query: OK" >> "$LOG_FILE"
            else
                warning "❌ Query de base de datos: FAIL"
                echo "❌ Database query: FAIL" >> "$LOG_FILE"
            fi
        fi
    fi
    
    log "✅ Diagnóstico de base de datos completado"
}

# Verificar health checks
verify_health_checks() {
    title "🔍 VERIFICACIÓN DE HEALTH CHECKS"
    
    log "📊 Verificando health checks..."
    
    echo "=== HEALTH CHECKS ===" >> "$LOG_FILE"
    
    local health_endpoints=(
        "http://localhost:3000/api/health"
        "https://lms.ai-academy.com/api/health"
    )
    
    for endpoint in "${health_endpoints[@]}"; do
        local response=$(curl -s "$endpoint" 2>/dev/null)
        local status_code=$(curl -o /dev/null -s -w '%{http_code}' "$endpoint" 2>/dev/null)
        
        if [ "$status_code" = "200" ]; then
            info "✅ Health check $endpoint: OK"
            echo "✅ Health check $endpoint: OK" >> "$LOG_FILE"
            
            # Parsear respuesta JSON si es posible
            if command -v jq &> /dev/null && echo "$response" | jq . &>/dev/null; then
                local status=$(echo "$response" | jq -r '.status' 2>/dev/null)
                local uptime=$(echo "$response" | jq -r '.uptime' 2>/dev/null)
                
                info "  Status: $status, Uptime: ${uptime}s"
                echo "  Status: $status, Uptime: ${uptime}s" >> "$LOG_FILE"
            fi
        else
            warning "❌ Health check $endpoint: FAIL (HTTP $status_code)"
            echo "❌ Health check $endpoint: FAIL (HTTP $status_code)" >> "$LOG_FILE"
        fi
    done
    
    log "✅ Verificación de health checks completada"
}

# Troubleshooting interactivo
interactive_troubleshooting() {
    title "🔧 TROUBLESHOOTING INTERACTIVO"
    
    while true; do
        echo -e "\n${CYAN}=== TROUBLESHOOTING MENU ===${NC}"
        echo "1. 📊 Ver estado general"
        echo "2. 📋 Ver logs en tiempo real"
        echo "3. 🐚 Abrir shell en container"
        echo "4. 🔍 Describir pod específico"
        echo "5. 📈 Monitorear recursos"
        echo "6. 🌐 Test de conectividad"
        echo "7. 🗄️ Test de base de datos"
        echo "8. 🔄 Reiniciar deployment"
        echo "9. ❌ Salir"
        
        read -p "Selecciona una opción (1-9): " choice
        
        case $choice in
            1)
                kubectl get all -n "$NAMESPACE"
                ;;
            2)
                local pod=$(kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME" -o jsonpath='{.items[0].metadata.name}')
                if [ -n "$pod" ]; then
                    kubectl logs -f "$pod" -n "$NAMESPACE"
                else
                    error "No se encontraron pods"
                fi
                ;;
            3)
                local pod=$(kubectl get pods -n "$NAMESPACE" -l app="$APP_NAME" -o jsonpath='{.items[0].metadata.name}')
                if [ -n "$pod" ]; then
                    kubectl exec -it "$pod" -n "$NAMESPACE" -- /bin/sh
                else
                    error "No se encontraron pods"
                fi
                ;;
            4)
                echo "Pods disponibles:"
                kubectl get pods -n "$NAMESPACE"
                read -p "Ingresa el nombre del pod: " pod_name
                kubectl describe pod "$pod_name" -n "$NAMESPACE"
                ;;
            5)
                watch kubectl top pods -n "$NAMESPACE"
                ;;
            6)
                diagnose_network
                ;;
            7)
                diagnose_database
                ;;
            8)
                read -p "¿Reiniciar deployment? (y/n): " confirm
                if [ "$confirm" = "y" ]; then
                    kubectl rollout restart deployment/lms-platform-deployment -n "$NAMESPACE"
                    kubectl rollout status deployment/lms-platform-deployment -n "$NAMESPACE"
                fi
                ;;
            9)
                break
                ;;
            *)
                error "Opción inválida"
                ;;
        esac
        
        echo -e "\nPresiona Enter para continuar..."
        read
    done
}

# Función principal
main() {
    # Procesar argumentos
    while [[ $# -gt 0 ]]; do
        case $1 in
            -a|--all)
                RUN_ALL=true
                shift
                ;;
            -c|--containers)
                RUN_CONTAINERS=true
                shift
                ;;
            -k|--kubernetes)
                RUN_KUBERNETES=true
                shift
                ;;
            -n|--network)
                RUN_NETWORK=true
                shift
                ;;
            -l|--logs)
                RUN_LOGS=true
                shift
                ;;
            -p|--performance)
                RUN_PERFORMANCE=true
                shift
                ;;
            -d|--database)
                RUN_DATABASE=true
                shift
                ;;
            -h|--health)
                RUN_HEALTH=true
                shift
                ;;
            -t|--troubleshoot)
                RUN_INTERACTIVE=true
                shift
                ;;
            --namespace)
                NAMESPACE="$2"
                shift 2
                ;;
            --since)
                SINCE_TIME="$2"
                shift 2
                ;;
            --follow)
                FOLLOW_LOGS=true
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
    
    # Configurar entorno
    setup_environment
    
    title "🔧 LMS PLATFORM DEBUG TOOLKIT"
    
    # Ejecutar diagnósticos según opciones
    if [ "$RUN_ALL" = true ]; then
        diagnose_containers
        diagnose_kubernetes
        diagnose_network
        analyze_logs
        analyze_performance
        diagnose_database
        verify_health_checks
    else
        [ "$RUN_CONTAINERS" = true ] && diagnose_containers
        [ "$RUN_KUBERNETES" = true ] && diagnose_kubernetes
        [ "$RUN_NETWORK" = true ] && diagnose_network
        [ "$RUN_LOGS" = true ] && analyze_logs
        [ "$RUN_PERFORMANCE" = true ] && analyze_performance
        [ "$RUN_DATABASE" = true ] && diagnose_database
        [ "$RUN_HEALTH" = true ] && verify_health_checks
    fi
    
    # Troubleshooting interactivo
    if [ "$RUN_INTERACTIVE" = true ]; then
        interactive_troubleshooting
    fi
    
    log "🎉 Sesión de debugging completada"
}

# Ejecutar función principal
main "$@"
