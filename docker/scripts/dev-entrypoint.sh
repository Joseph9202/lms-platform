#!/bin/bash
# ===========================================
# ENTRYPOINT PARA DESARROLLO - LMS PLATFORM
# Script de inicio optimizado para desarrollo
# ===========================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[DEV] $1${NC}"
}

log_success() {
    echo -e "${GREEN}[DEV] $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}[DEV] $1${NC}"
}

log_error() {
    echo -e "${RED}[DEV] $1${NC}"
}

# ===========================================
# VERIFICACIONES INICIALES
# ===========================================

log_info "🚀 Iniciando entorno de desarrollo LMS Platform..."

# Verificar que estamos en modo desarrollo
if [ "$NODE_ENV" != "development" ]; then
    log_warning "NODE_ENV no está configurado como 'development'"
    export NODE_ENV=development
fi

# Mostrar información del entorno
log_info "📋 Información del entorno:"
echo "  Node.js: $(node --version)"
echo "  NPM: $(npm --version)"
echo "  Entorno: $NODE_ENV"
echo "  Usuario: $(whoami)"
echo "  Directorio: $(pwd)"

# ===========================================
# PREPARACIÓN DEL ENTORNO
# ===========================================

# Verificar e instalar dependencias si es necesario
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
    log_info "📦 Instalando/actualizando dependencias..."
    npm ci --prefer-offline --no-audit
else
    log_success "✅ Dependencias ya instaladas"
fi

# Generar cliente de Prisma si es necesario
if [ -d "prisma" ]; then
    log_info "🔧 Generando cliente de Prisma..."
    npx prisma generate || log_warning "Fallo la generación del cliente Prisma"
else
    log_info "⚠️ No se encontró directorio prisma"
fi

# ===========================================
# VERIFICACIÓN DE SERVICIOS
# ===========================================

# Función para verificar conectividad de servicios
check_service() {
    local service_name="$1"
    local host="$2"
    local port="$3"
    local max_attempts="${4:-30}"
    local attempt=1
    
    log_info "🔍 Verificando conectividad a $service_name ($host:$port)..."
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z "$host" "$port" 2>/dev/null; then
            log_success "✅ $service_name está disponible"
            return 0
        fi
        
        if [ $attempt -eq 1 ]; then
            log_info "⏳ Esperando a que $service_name esté disponible..."
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    log_warning "⚠️ $service_name no está disponible después de $max_attempts intentos"
    return 1
}

# Verificar base de datos si DATABASE_URL está configurada
if [ -n "$DATABASE_URL" ]; then
    # Extraer host y puerto de DATABASE_URL
    if [[ "$DATABASE_URL" =~ mysql://[^@]+@([^:]+):([0-9]+)/ ]]; then
        db_host="${BASH_REMATCH[1]}"
        db_port="${BASH_REMATCH[2]}"
        check_service "MySQL" "$db_host" "$db_port" 30
    elif [[ "$DATABASE_URL" =~ mysql://[^@]+@([^/]+)/ ]]; then
        db_host="${BASH_REMATCH[1]}"
        check_service "MySQL" "$db_host" 3306 30
    fi
fi

# Verificar Redis si REDIS_URL está configurada
if [ -n "$REDIS_URL" ]; then
    if [[ "$REDIS_URL" =~ redis://([^:]+):([0-9]+) ]]; then
        redis_host="${BASH_REMATCH[1]}"
        redis_port="${BASH_REMATCH[2]}"
        check_service "Redis" "$redis_host" "$redis_port" 15
    elif [[ "$REDIS_URL" =~ redis://([^/]+) ]]; then
        redis_host="${BASH_REMATCH[1]}"
        check_service "Redis" "$redis_host" 6379 15
    fi
fi

# ===========================================
# MIGRACIONES DE BASE DE DATOS
# ===========================================

# Ejecutar migraciones de base de datos en desarrollo
if [ -n "$DATABASE_URL" ] && [ -d "prisma" ]; then
    log_info "🔄 Verificando migraciones de base de datos..."
    
    # Verificar si hay migraciones pendientes
    if npx prisma migrate status 2>/dev/null | grep -q "Following migration.*have not yet been applied"; then
        log_info "📋 Aplicando migraciones pendientes..."
        npx prisma migrate deploy || log_warning "Algunas migraciones pueden haber fallado"
    else
        log_success "✅ Base de datos actualizada"
    fi
    
    # Poblar datos de desarrollo si está configurado
    if [ "$SEED_DATABASE" = "true" ] && [ -f "prisma/seed.ts" ]; then
        log_info "🌱 Poblando datos de desarrollo..."
        npx prisma db seed || log_warning "Fallo el seeding de la base de datos"
    fi
fi

# ===========================================
# CONFIGURACIÓN DE DESARROLLO
# ===========================================

# Crear directorios necesarios para desarrollo
mkdir -p .next/cache
mkdir -p tmp/uploads
mkdir -p logs

# Configurar permisos
chmod 755 .next/cache tmp/uploads logs

# Configurar variables específicas de desarrollo
export NEXT_TELEMETRY_DISABLED=1
export FAST_REFRESH=true

# ===========================================
# HOOKS DE DESARROLLO
# ===========================================

# Hook para ejecutar comandos personalizados antes del inicio
if [ -f "scripts/dev-pre-start.sh" ]; then
    log_info "🔧 Ejecutando hooks de pre-inicio..."
    bash scripts/dev-pre-start.sh || log_warning "Hook de pre-inicio falló"
fi

# ===========================================
# INFORMACIÓN DE DESARROLLO
# ===========================================

log_success "🎉 Entorno de desarrollo preparado!"
echo ""
log_info "📋 URLs disponibles:"
echo "  🌐 Aplicación: http://localhost:3000"
echo "  🔍 Health Check: http://localhost:3000/api/health"
echo "  📊 Métricas: http://localhost:3000/api/metrics"

if [ "$NODE_OPTIONS" = *"--inspect"* ]; then
    echo "  🐛 Debugger: http://localhost:9229"
fi

echo ""
log_info "💡 Comandos útiles:"
echo "  📦 Reinstalar deps: npm ci"
echo "  🔄 Reset DB: npx prisma migrate reset"
echo "  🌱 Seed DB: npx prisma db seed"
echo "  🧪 Run tests: npm test"

echo ""
log_info "🚀 Iniciando servidor de desarrollo..."

# ===========================================
# EJECUTAR COMANDO PRINCIPAL
# ===========================================

# Función de limpieza para shutdown graceful
cleanup() {
    log_info "🛑 Recibida señal de shutdown, limpiando..."
    
    # Matar procesos hijos
    jobs -p | xargs -r kill
    
    # Ejecutar hook de post-shutdown si existe
    if [ -f "scripts/dev-post-shutdown.sh" ]; then
        bash scripts/dev-post-shutdown.sh || true
    fi
    
    log_success "✅ Cleanup completado"
    exit 0
}

# Configurar trap para shutdown graceful
trap cleanup SIGTERM SIGINT

# Ejecutar comando principal
exec "$@"
