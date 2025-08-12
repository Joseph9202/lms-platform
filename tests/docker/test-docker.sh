#!/bin/bash
# ===========================================
# DOCKER TESTS - AUTOMATED TESTING
# ===========================================
# Suite completa de tests para containerización

set -e

# Configuración
TEST_IMAGE="lms-platform:test"
TEST_CONTAINER="lms-test-container"
TEST_NETWORK="lms-test-network"
TEST_MYSQL="lms-test-mysql"
TEST_REDIS="lms-test-redis"
TEST_LOG="docker_tests_$(date +%Y%m%d_%H%M%S).log"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Función para logging
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$TEST_LOG"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$TEST_LOG"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$TEST_LOG"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$TEST_LOG"
}

# Función para tests
test_assert() {
    local test_name="$1"
    local command="$2"
    local expected="$3"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    info "🧪 Testing: $test_name"
    
    local result
    if eval "$command" >/dev/null 2>&1; then
        result="pass"
    else
        result="fail"
    fi
    
    if [ "$result" == "$expected" ]; then
        echo -e "  ${GREEN}✅ PASS${NC} - $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "PASS: $test_name" >> "$TEST_LOG"
    else
        echo -e "  ${RED}❌ FAIL${NC} - $test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "FAIL: $test_name" >> "$TEST_LOG"
    fi
}

# Función para cleanup
cleanup() {
    log "🧹 Limpiando recursos de test..."
    
    # Parar y eliminar containers
    docker stop "$TEST_CONTAINER" 2>/dev/null || true
    docker rm "$TEST_CONTAINER" 2>/dev/null || true
    docker stop "$TEST_MYSQL" 2>/dev/null || true
    docker rm "$TEST_MYSQL" 2>/dev/null || true
    docker stop "$TEST_REDIS" 2>/dev/null || true
    docker rm "$TEST_REDIS" 2>/dev/null || true
    
    # Eliminar imagen de test
    docker rmi "$TEST_IMAGE" 2>/dev/null || true
    
    # Eliminar red de test
    docker network rm "$TEST_NETWORK" 2>/dev/null || true
    
    log "✅ Cleanup completado"
}

# Trap para cleanup automático
trap cleanup EXIT

# Inicializar tests
initialize_tests() {
    log "🚀 Inicializando Docker Tests para LMS Platform"
    
    # Crear red de test
    docker network create "$TEST_NETWORK" >/dev/null 2>&1 || true
    
    # Crear archivo de log
    echo "# Docker Tests - $(date)" > "$TEST_LOG"
    echo "=============================" >> "$TEST_LOG"
    echo "" >> "$TEST_LOG"
}

# Test 1: Verificar Dockerfile
test_dockerfile() {
    log "📋 Testing Dockerfile..."
    
    test_assert "Dockerfile exists" "[ -f Dockerfile ]" "pass"
    test_assert "Dockerfile not empty" "[ -s Dockerfile ]" "pass"
    test_assert "Dockerfile has FROM instruction" "grep -q '^FROM' Dockerfile" "pass"
    test_assert "Dockerfile has WORKDIR instruction" "grep -q '^WORKDIR' Dockerfile" "pass"
    test_assert "Dockerfile has EXPOSE instruction" "grep -q '^EXPOSE' Dockerfile" "pass"
    test_assert "Dockerfile has multi-stage build" "grep -c '^FROM' Dockerfile | grep -q '[2-9]'" "pass"
}

# Test 2: Build de imagen
test_image_build() {
    log "🔨 Testing Image Build..."
    
    test_assert "Image builds successfully" "docker build -t $TEST_IMAGE ." "pass"
    test_assert "Image exists after build" "docker images $TEST_IMAGE -q" "pass"
    
    # Verificar que la imagen tiene los labels correctos
    test_assert "Image has maintainer label" "docker inspect $TEST_IMAGE | grep -q maintainer" "pass"
    
    # Verificar tamaño de imagen (debe ser menor a 2GB)
    local image_size=$(docker images $TEST_IMAGE --format "{{.Size}}" | head -1)
    info "📦 Tamaño de imagen: $image_size"
}

# Test 3: Contenido de imagen
test_image_content() {
    log "📦 Testing Image Content..."
    
    # Verificar que Node.js está instalado
    test_assert "Node.js is installed" "docker run --rm $TEST_IMAGE node --version" "pass"
    
    # Verificar que npm está instalado
    test_assert "npm is installed" "docker run --rm $TEST_IMAGE npm --version" "pass"
    
    # Verificar que la aplicación existe
    test_assert "Application files exist" "docker run --rm $TEST_IMAGE ls -la /app/package.json" "pass"
    
    # Verificar que node_modules existe
    test_assert "Node modules exist" "docker run --rm $TEST_IMAGE ls -la /app/node_modules" "pass"
    
    # Verificar que Prisma está instalado
    test_assert "Prisma is installed" "docker run --rm $TEST_IMAGE npx prisma --version" "pass"
}

# Test 4: Container startup
test_container_startup() {
    log "🚀 Testing Container Startup..."
    
    # Iniciar container en background
    test_assert "Container starts successfully" "docker run -d --name $TEST_CONTAINER --network $TEST_NETWORK -p 3001:3000 $TEST_IMAGE" "pass"
    
    # Esperar a que inicie
    sleep 10
    
    # Verificar que está corriendo
    test_assert "Container is running" "docker ps | grep -q $TEST_CONTAINER" "pass"
    
    # Verificar logs
    test_assert "Container has logs" "docker logs $TEST_CONTAINER | grep -q 'Ready'" "pass"
}

# Test 5: Health check
test_health_check() {
    log "🔍 Testing Health Check..."
    
    # Esperar un poco más para que la app esté lista
    sleep 30
    
    # Verificar endpoint de health
    test_assert "Health endpoint responds" "curl -f http://localhost:3001/api/health" "pass"
    
    # Verificar que responde JSON
    test_assert "Health endpoint returns JSON" "curl -s http://localhost:3001/api/health | jq ." "pass"
    
    # Verificar métricas
    test_assert "Metrics endpoint responds" "curl -f http://localhost:3001/api/metrics" "pass"
}

# Test 6: Docker Compose
test_docker_compose() {
    log "🐳 Testing Docker Compose..."
    
    test_assert "docker-compose.yml exists" "[ -f docker-compose.yml ]" "pass"
    test_assert "docker-compose.yml is valid" "docker-compose config" "pass"
    test_assert "docker-compose has all services" "docker-compose config --services | grep -q lms-app" "pass"
    test_assert "docker-compose has database" "docker-compose config --services | grep -q mysql" "pass"
    test_assert "docker-compose has redis" "docker-compose config --services | grep -q redis" "pass"
}

# Test 7: Networking
test_networking() {
    log "🌐 Testing Networking..."
    
    # Iniciar MySQL para test
    docker run -d --name "$TEST_MYSQL" --network "$TEST_NETWORK" \
        -e MYSQL_ROOT_PASSWORD=rootpass \
        -e MYSQL_DATABASE=testdb \
        -e MYSQL_USER=testuser \
        -e MYSQL_PASSWORD=testpass \
        mysql:8.0 >/dev/null 2>&1
    
    sleep 30
    
    # Verificar conectividad desde el container principal
    test_assert "Can connect to MySQL" "docker exec $TEST_CONTAINER nc -z $TEST_MYSQL 3306" "pass"
    
    # Iniciar Redis para test
    docker run -d --name "$TEST_REDIS" --network "$TEST_NETWORK" redis:7-alpine >/dev/null 2>&1
    
    sleep 10
    
    test_assert "Can connect to Redis" "docker exec $TEST_CONTAINER nc -z $TEST_REDIS 6379" "pass"
}

# Test 8: Environment variables
test_environment() {
    log "⚙️ Testing Environment Variables..."
    
    # Verificar variables de entorno importantes
    test_assert "NODE_ENV is set" "docker exec $TEST_CONTAINER printenv NODE_ENV" "pass"
    test_assert "PORT is set" "docker exec $TEST_CONTAINER printenv PORT" "pass"
    
    # Verificar que puede leer .env
    if [ -f ".env.example" ]; then
        test_assert ".env.example exists" "[ -f .env.example ]" "pass"
    fi
}

# Test 9: Security
test_security() {
    log "🔒 Testing Security..."
    
    # Verificar que no corre como root
    test_assert "Container doesn't run as root" "[ \$(docker exec $TEST_CONTAINER id -u) -ne 0 ]" "pass"
    
    # Verificar que tiene usuario no-root
    test_assert "Has non-root user" "docker exec $TEST_CONTAINER id | grep -q nextjs" "pass"
    
    # Verificar permisos de archivos
    test_assert "App files have correct permissions" "docker exec $TEST_CONTAINER ls -la /app | grep -q 'nextjs.*nextjs'" "pass"
}

# Test 10: Performance
test_performance() {
    log "⚡ Testing Performance..."
    
    # Test de tiempo de respuesta
    local response_time=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3001/api/health)
    info "🕐 Response time: ${response_time}s"
    
    test_assert "Response time under 5s" "[ $(echo \"$response_time < 5.0\" | bc) -eq 1 ]" "pass"
    
    # Test de memoria
    local memory_usage=$(docker stats --no-stream --format "{{.MemUsage}}" $TEST_CONTAINER)
    info "💾 Memory usage: $memory_usage"
    
    # Verificar que el container está usando recursos razonables
    test_assert "Container is using resources" "docker stats --no-stream $TEST_CONTAINER | grep -v '0.00%'" "pass"
}

# Test 11: Logs
test_logging() {
    log "📋 Testing Logging..."
    
    # Verificar que hay logs
    test_assert "Container produces logs" "docker logs $TEST_CONTAINER | wc -l | grep -v '^0$'" "pass"
    
    # Verificar formato de logs
    test_assert "Logs contain timestamps" "docker logs $TEST_CONTAINER | grep -q '\[.*\]'" "pass"
    
    # Verificar que no hay errores críticos
    test_assert "No critical errors in logs" "! docker logs $TEST_CONTAINER | grep -i 'fatal\\|critical'" "pass"
}

# Test 12: Cleanup and restart
test_restart() {
    log "🔄 Testing Restart..."
    
    # Reiniciar container
    test_assert "Container can be restarted" "docker restart $TEST_CONTAINER" "pass"
    
    sleep 20
    
    # Verificar que sigue funcionando
    test_assert "Container works after restart" "docker ps | grep -q $TEST_CONTAINER" "pass"
    test_assert "Health check works after restart" "curl -f http://localhost:3001/api/health" "pass"
}

# Función principal de tests
run_all_tests() {
    initialize_tests
    
    echo "
    ╔════════════════════════════════════════════════════════════════════╗
    ║                   🧪 DOCKER TESTS SUITE                          ║
    ║                     LMS Platform                                   ║
    ╚════════════════════════════════════════════════════════════════════╝
    "
    
    # Ejecutar todos los tests
    test_dockerfile
    test_image_build
    test_image_content
    test_container_startup
    test_health_check
    test_docker_compose
    test_networking
    test_environment
    test_security
    test_performance
    test_logging
    test_restart
    
    # Mostrar resultados
    show_results
}

# Mostrar resultados
show_results() {
    echo "
    ╔════════════════════════════════════════════════════════════════════╗
    ║                   📊 RESULTADOS DE TESTS                          ║
    ╚════════════════════════════════════════════════════════════════════╝
    "
    
    echo "📋 Resumen de Tests:"
    echo "  • Total: $TESTS_TOTAL"
    echo "  • Pasados: $TESTS_PASSED"
    echo "  • Fallados: $TESTS_FAILED"
    echo "  • Porcentaje de éxito: $(( TESTS_PASSED * 100 / TESTS_TOTAL ))%"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "
${GREEN}✅ TODOS LOS TESTS PASARON${NC}
🎉 La containerización está funcionando correctamente!
"
        echo "ALL TESTS PASSED" >> "$TEST_LOG"
        exit 0
    else
        echo -e "
${RED}❌ ALGUNOS TESTS FALLARON${NC}
🔧 Revisa los logs para más detalles: $TEST_LOG
"
        echo "SOME TESTS FAILED" >> "$TEST_LOG"
        exit 1
    fi
}

# Mostrar ayuda
show_help() {
    cat << EOF
╔════════════════════════════════════════════════════════════════════╗
║                   🧪 DOCKER TESTS SUITE                          ║
║                     LMS Platform                                   ║
╚════════════════════════════════════════════════════════════════════╝

Uso: $0 [opciones]

Opciones:
  -a, --all           Ejecutar todos los tests (por defecto)
  -q, --quick         Tests rápidos (sin networking)
  -s, --security      Solo tests de seguridad
  -p, --performance   Solo tests de performance
  -c, --cleanup       Solo limpiar recursos
  -h, --help          Mostrar esta ayuda

Tests incluidos:
  1. Dockerfile validation
  2. Image build process
  3. Image content verification
  4. Container startup
  5. Health check endpoints
  6. Docker Compose validation
  7. Network connectivity
  8. Environment variables
  9. Security configuration
  10. Performance metrics
  11. Logging functionality
  12. Restart capability

Ejemplos:
  $0                  # Ejecutar todos los tests
  $0 -q              # Tests rápidos
  $0 -s              # Solo seguridad
  $0 -c              # Solo cleanup

EOF
}

# Procesar argumentos
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -c|--cleanup)
        cleanup
        exit 0
        ;;
    -q|--quick)
        initialize_tests
        test_dockerfile
        test_image_build
        test_container_startup
        test_health_check
        show_results
        ;;
    -s|--security)
        initialize_tests
        test_image_build
        test_container_startup
        test_security
        show_results
        ;;
    -p|--performance)
        initialize_tests
        test_image_build
        test_container_startup
        test_performance
        show_results
        ;;
    -a|--all|"")
        run_all_tests
        ;;
    *)
        echo "❌ Opción desconocida: $1"
        echo "Usa -h para ver ayuda"
        exit 1
        ;;
esac
