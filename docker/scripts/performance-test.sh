#!/bin/bash
# ===========================================
# PERFORMANCE TESTING SCRIPT - LMS PLATFORM
# Script completo de testing de carga y performance
# ===========================================

set -euo pipefail

# Configuración
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
RESULTS_DIR="${PROJECT_ROOT}/performance-results"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TEST_NAME="lms-platform-perf-${TIMESTAMP}"

# Configuración de testing
TARGET_URL="${TARGET_URL:-http://localhost:3000}"
CONCURRENT_USERS="${CONCURRENT_USERS:-50}"
TEST_DURATION="${TEST_DURATION:-300}"  # 5 minutos
RAMP_UP_TIME="${RAMP_UP_TIME:-60}"     # 1 minuto
VIRTUAL_USERS="${VIRTUAL_USERS:-100}"

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

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "OPTIONS:"
    echo "  --url URL           Target URL for testing (default: http://localhost:3000)"
    echo "  --users NUMBER      Number of concurrent users (default: 50)"
    echo "  --duration SECONDS  Test duration in seconds (default: 300)"
    echo "  --ramp-up SECONDS   Ramp up time in seconds (default: 60)"
    echo "  --virtual NUMBER    Virtual users for K6 (default: 100)"
    echo "  --type TYPE         Test type: load|stress|spike|volume (default: load)"
    echo "  --report            Generate detailed HTML report"
    echo "  --monitor           Enable real-time monitoring"
    echo "  --help              Show this help message"
    echo ""
    echo "EXAMPLES:"
    echo "  $0 --users 100 --duration 600 --type stress"
    echo "  $0 --url https://lms.yourdomain.com --report --monitor"
}

check_prerequisites() {
    log_step "Verificando herramientas de testing..."
    
    # Verificar k6
    if ! command -v k6 &> /dev/null; then
        log_warning "k6 no está instalado, instalando..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y k6
        elif command -v brew &> /dev/null; then
            brew install k6
        else
            log_error "Por favor instala k6 manualmente: https://k6.io/docs/getting-started/installation/"
            exit 1
        fi
    fi
    log_success "k6 disponible: $(k6 version --short)"
    
    # Verificar Apache Bench (opcional)
    if command -v ab &> /dev/null; then
        log_success "Apache Bench disponible"
    else
        log_warning "Apache Bench no disponible (opcional)"
    fi
    
    # Verificar curl
    if ! command -v curl &> /dev/null; then
        log_error "curl no está instalado"
        exit 1
    fi
    log_success "curl disponible"
    
    # Crear directorio de resultados
    mkdir -p "$RESULTS_DIR"
}

test_basic_connectivity() {
    log_step "Verificando conectividad básica..."
    
    if curl -f -s "$TARGET_URL/api/health" > /dev/null; then
        log_success "Aplicación accesible en $TARGET_URL"
    else
        log_error "No se puede acceder a $TARGET_URL"
        exit 1
    fi
    
    # Verificar endpoints importantes
    local endpoints=(
        "/api/health"
        "/api/metrics"
        "/"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local url="${TARGET_URL}${endpoint}"
        local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
        
        if [[ "$status" =~ ^[23] ]]; then
            log_success "✅ $endpoint (HTTP $status)"
        else
            log_warning "⚠️ $endpoint (HTTP $status)"
        fi
    done
}

create_k6_script() {
    local test_type="$1"
    local script_path="$RESULTS_DIR/k6-${test_type}-test.js"
    
    log_step "Creando script K6 para test tipo: $test_type"
    
    cat > "$script_path" << 'EOF'
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');

// Test configuration
export let options = {
  stages: [
    { duration: '${RAMP_UP_TIME}s', target: ${VIRTUAL_USERS} },
    { duration: '${TEST_DURATION}s', target: ${VIRTUAL_USERS} },
    { duration: '60s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.05'],    // Error rate must be below 5%
    errors: ['rate<0.1'],              // Custom error rate
  },
};

const BASE_URL = '${TARGET_URL}';

export default function() {
  group('Homepage Load Test', function() {
    let response = http.get(`${BASE_URL}/`);
    check(response, {
      'homepage status is 200': (r) => r.status === 200,
      'homepage response time < 2s': (r) => r.timings.duration < 2000,
    }) || errorRate.add(1);
  });

  group('API Health Check', function() {
    let response = http.get(`${BASE_URL}/api/health`);
    check(response, {
      'health check status is 200': (r) => r.status === 200,
      'health check response time < 500ms': (r) => r.timings.duration < 500,
      'health check returns healthy': (r) => r.json('status') === 'healthy',
    }) || errorRate.add(1);
  });

  group('API Metrics', function() {
    let response = http.get(`${BASE_URL}/api/metrics`);
    check(response, {
      'metrics status is 200': (r) => r.status === 200,
      'metrics response time < 1s': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);
  });

  // Simulate user behavior
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}

export function handleSummary(data) {
  return {
    'summary.html': htmlReport(data),
    'summary.json': JSON.stringify(data),
  };
}

function htmlReport(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>K6 Performance Test Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .pass { background-color: #d4edda; }
        .fail { background-color: #f8d7da; }
      </style>
    </head>
    <body>
      <h1>LMS Platform Performance Test Report</h1>
      <h2>Test Summary</h2>
      <div class="metric">
        <strong>Duration:</strong> ${data.state.testRunDurationMs}ms
      </div>
      <div class="metric">
        <strong>Virtual Users:</strong> ${data.options.stages ? data.options.stages[1].target : 'N/A'}
      </div>
      <div class="metric">
        <strong>Total Requests:</strong> ${data.metrics.http_reqs ? data.metrics.http_reqs.count : 'N/A'}
      </div>
      <div class="metric">
        <strong>Failed Requests:</strong> ${data.metrics.http_req_failed ? data.metrics.http_req_failed.count : 'N/A'}
      </div>
      <div class="metric">
        <strong>Average Response Time:</strong> ${data.metrics.http_req_duration ? data.metrics.http_req_duration.avg.toFixed(2) : 'N/A'}ms
      </div>
      <div class="metric">
        <strong>95th Percentile:</strong> ${data.metrics.http_req_duration ? data.metrics.http_req_duration['p(95)'].toFixed(2) : 'N/A'}ms
      </div>
    </body>
    </html>
  `;
}
EOF

    # Reemplazar variables en el script
    sed -i "s/\${RAMP_UP_TIME}/$RAMP_UP_TIME/g" "$script_path"
    sed -i "s/\${TEST_DURATION}/$TEST_DURATION/g" "$script_path"
    sed -i "s/\${VIRTUAL_USERS}/$VIRTUAL_USERS/g" "$script_path"
    sed -i "s|\${TARGET_URL}|$TARGET_URL|g" "$script_path"
    
    echo "$script_path"
}

run_k6_test() {
    local test_type="$1"
    local script_path=$(create_k6_script "$test_type")
    local output_file="$RESULTS_DIR/k6-${test_type}-results-${TIMESTAMP}.json"
    local html_file="$RESULTS_DIR/k6-${test_type}-report-${TIMESTAMP}.html"
    
    log_step "Ejecutando test K6 tipo: $test_type"
    log_info "Script: $script_path"
    log_info "Usuarios virtuales: $VIRTUAL_USERS"
    log_info "Duración: $TEST_DURATION segundos"
    log_info "Ramp-up: $RAMP_UP_TIME segundos"
    
    # Ejecutar K6
    if k6 run \
        --out json="$output_file" \
        --summary-export="$html_file" \
        "$script_path"; then
        
        log_success "Test K6 completado"
        log_info "Resultados guardados en: $output_file"
        log_info "Reporte HTML: $html_file"
        
        # Mostrar resumen básico
        if [[ -f "$output_file" ]]; then
            echo ""
            log_info "📊 Resumen de resultados:"
            
            # Extraer métricas principales usando jq si está disponible
            if command -v jq &> /dev/null; then
                local http_reqs=$(jq -r '.metrics.http_reqs.count // "N/A"' "$output_file")
                local avg_duration=$(jq -r '.metrics.http_req_duration.avg // "N/A"' "$output_file")
                local p95_duration=$(jq -r '.metrics.http_req_duration."p(95)" // "N/A"' "$output_file")
                local error_rate=$(jq -r '.metrics.http_req_failed.rate // "N/A"' "$output_file")
                
                echo "  📈 Total requests: $http_reqs"
                echo "  ⏱️ Average response time: $avg_duration ms"
                echo "  📊 95th percentile: $p95_duration ms"
                echo "  ❌ Error rate: $error_rate"
            fi
        fi
        
        return 0
    else
        log_error "Test K6 falló"
        return 1
    fi
}

run_apache_bench_test() {
    if ! command -v ab &> /dev/null; then
        log_warning "Apache Bench no disponible, saltando test"
        return 0
    fi
    
    log_step "Ejecutando test con Apache Bench..."
    
    local output_file="$RESULTS_DIR/ab-results-${TIMESTAMP}.txt"
    local requests=$((CONCURRENT_USERS * 10))
    
    log_info "Requests totales: $requests"
    log_info "Concurrencia: $CONCURRENT_USERS"
    
    if ab -n "$requests" -c "$CONCURRENT_USERS" -g "$RESULTS_DIR/ab-gnuplot-${TIMESTAMP}.tsv" "$TARGET_URL/" > "$output_file" 2>&1; then
        log_success "Test Apache Bench completado"
        log_info "Resultados guardados en: $output_file"
        
        # Mostrar resumen
        echo ""
        log_info "📊 Resumen Apache Bench:"
        grep -E "(Requests per second|Time per request|Transfer rate)" "$output_file" || true
        
        return 0
    else
        log_error "Test Apache Bench falló"
        return 1
    fi
}

monitor_system_resources() {
    if [[ "${ENABLE_MONITORING:-false}" != "true" ]]; then
        return 0
    fi
    
    log_step "Iniciando monitoreo de recursos del sistema..."
    
    local monitor_file="$RESULTS_DIR/system-monitor-${TIMESTAMP}.log"
    
    # Función de monitoreo en background
    (
        echo "timestamp,cpu_percent,memory_percent,load_avg" > "$monitor_file"
        
        while true; do
            local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
            local cpu_percent=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
            local memory_percent=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
            local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
            
            echo "$timestamp,$cpu_percent,$memory_percent,$load_avg" >> "$monitor_file"
            sleep 5
        done
    ) &
    
    local monitor_pid=$!
    echo "$monitor_pid" > "$RESULTS_DIR/monitor.pid"
    
    log_info "Monitoreo iniciado (PID: $monitor_pid)"
    log_info "Archivo de monitoreo: $monitor_file"
}

stop_monitoring() {
    if [[ -f "$RESULTS_DIR/monitor.pid" ]]; then
        local monitor_pid=$(cat "$RESULTS_DIR/monitor.pid")
        
        if kill "$monitor_pid" 2>/dev/null; then
            log_success "Monitoreo detenido"
        fi
        
        rm -f "$RESULTS_DIR/monitor.pid"
    fi
}

generate_report() {
    log_step "Generando reporte consolidado..."
    
    local report_file="$RESULTS_DIR/performance-report-${TIMESTAMP}.html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>LMS Platform Performance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .metric { margin: 10px 0; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        .warn { color: orange; font-weight: bold; }
        .code { background-color: #f8f8f8; padding: 10px; border-radius: 3px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 LMS Platform Performance Test Report</h1>
        <p><strong>Test Date:</strong> $(date)</p>
        <p><strong>Target URL:</strong> $TARGET_URL</p>
        <p><strong>Test Duration:</strong> $TEST_DURATION seconds</p>
        <p><strong>Virtual Users:</strong> $VIRTUAL_USERS</p>
    </div>
    
    <div class="section">
        <h2>📊 Test Configuration</h2>
        <div class="metric"><strong>Concurrent Users:</strong> $CONCURRENT_USERS</div>
        <div class="metric"><strong>Ramp Up Time:</strong> $RAMP_UP_TIME seconds</div>
        <div class="metric"><strong>Test Type:</strong> ${TEST_TYPE:-load}</div>
    </div>
    
    <div class="section">
        <h2>📁 Generated Files</h2>
        <ul>
EOF

    # Listar archivos generados
    for file in "$RESULTS_DIR"/*"$TIMESTAMP"*; do
        if [[ -f "$file" ]]; then
            local filename=$(basename "$file")
            echo "            <li><a href=\"$filename\">$filename</a></li>" >> "$report_file"
        fi
    done
    
    cat >> "$report_file" << EOF
        </ul>
    </div>
    
    <div class="section">
        <h2>🔧 Recommendations</h2>
        <ul>
            <li>Monitor response times during peak hours</li>
            <li>Set up alerts for response times > 2 seconds</li>
            <li>Consider scaling if error rate > 1%</li>
            <li>Optimize database queries if needed</li>
        </ul>
    </div>
    
    <div class="section">
        <h2>📝 Test Commands</h2>
        <div class="code">
# Recreate this test:<br>
$0 --url $TARGET_URL --users $CONCURRENT_USERS --duration $TEST_DURATION --virtual $VIRTUAL_USERS
        </div>
    </div>
</body>
</html>
EOF
    
    log_success "Reporte consolidado generado: $report_file"
}

# ===========================================
# PARSEAR ARGUMENTOS
# ===========================================

TEST_TYPE="load"
GENERATE_REPORT=false
ENABLE_MONITORING=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --url)
            TARGET_URL="$2"
            shift 2
            ;;
        --users)
            CONCURRENT_USERS="$2"
            shift 2
            ;;
        --duration)
            TEST_DURATION="$2"
            shift 2
            ;;
        --ramp-up)
            RAMP_UP_TIME="$2"
            shift 2
            ;;
        --virtual)
            VIRTUAL_USERS="$2"
            shift 2
            ;;
        --type)
            TEST_TYPE="$2"
            shift 2
            ;;
        --report)
            GENERATE_REPORT=true
            shift
            ;;
        --monitor)
            ENABLE_MONITORING=true
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

# ===========================================
# FUNCIÓN PRINCIPAL
# ===========================================

main() {
    local start_time=$(date +%s)
    
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════════════╗"
    echo "║                  🚀 LMS PLATFORM PERFORMANCE TESTING                 ║"
    echo "║                      Advanced Load Testing Suite                     ║"
    echo "╚═══════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    log_info "Iniciando performance testing: $TEST_NAME"
    log_info "Target URL: $TARGET_URL"
    log_info "Test Type: $TEST_TYPE"
    log_info "Virtual Users: $VIRTUAL_USERS"
    log_info "Duration: $TEST_DURATION seconds"
    echo ""
    
    # Ejecutar testing
    if check_prerequisites && \
       test_basic_connectivity; then
        
        # Iniciar monitoreo si está habilitado
        if [[ "$ENABLE_MONITORING" == "true" ]]; then
            monitor_system_resources
        fi
        
        # Ejecutar tests
        local test_failed=false
        
        if ! run_k6_test "$TEST_TYPE"; then
            test_failed=true
        fi
        
        if ! run_apache_bench_test; then
            test_failed=true
        fi
        
        # Detener monitoreo
        stop_monitoring
        
        # Generar reporte si se solicita
        if [[ "$GENERATE_REPORT" == "true" ]]; then
            generate_report
        fi
        
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        if [[ "$test_failed" == "true" ]]; then
            log_warning "Algunos tests fallaron, revisa los resultados"
        else
            log_success "¡Performance testing completado exitosamente!"
        fi
        
        log_info "Duración total: ${duration} segundos"
        log_info "Resultados guardados en: $RESULTS_DIR"
        
        echo ""
        log_info "📋 Archivos generados:"
        ls -la "$RESULTS_DIR"/*"$TIMESTAMP"* 2>/dev/null || echo "No hay archivos específicos de este test"
        
        exit 0
    else
        log_error "Falló la verificación inicial"
        exit 1
    fi
}

# Cleanup en caso de señal
trap 'stop_monitoring; log_info "Test interrumpido por usuario"; exit 130' INT TERM

# Ejecutar función principal
main "$@"
