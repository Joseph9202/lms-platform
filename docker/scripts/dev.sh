#!/bin/bash

# ===========================================
# DOCKER DEV SCRIPT - LMS PLATFORM
# ===========================================
# Script para desarrollo local con Docker

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
COMPOSE_FILE="docker-compose.yml"
PROJECT_NAME="lms-platform"

echo -e "${BLUE}🐳 LMS Platform - Entorno de Desarrollo Docker${NC}"
echo ""

# Función para mostrar ayuda
show_help() {
    echo -e "${YELLOW}📋 Comandos disponibles:${NC}"
    echo ""
    echo "  up        - Iniciar todos los servicios"
    echo "  down      - Detener todos los servicios"
    echo "  restart   - Reiniciar todos los servicios"
    echo "  build     - Reconstruir imágenes"
    echo "  logs      - Ver logs en tiempo real"
    echo "  shell     - Abrir shell en el container de la app"
    echo "  clean     - Limpiar containers, volúmenes e imágenes"
    echo "  status    - Ver estado de los servicios"
    echo "  db        - Acceder a la base de datos MySQL"
    echo "  redis     - Acceder a Redis CLI"
    echo "  test      - Ejecutar tests"
    echo "  migrate   - Ejecutar migraciones de Prisma"
    echo "  seed      - Poblar base de datos con datos de prueba"
    echo "  help      - Mostrar esta ayuda"
    echo ""
}

# Función para verificar dependencias
check_dependencies() {
    echo -e "${BLUE}🔍 Verificando dependencias...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker no está instalado${NC}"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose no está instalado${NC}"
        exit 1
    fi
    
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker no está ejecutándose${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Dependencias verificadas${NC}"
}

# Función para verificar archivo .env
check_env_file() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  Archivo .env no encontrado${NC}"
        echo -e "${BLUE}📋 Creando .env desde .env.example...${NC}"
        
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo -e "${GREEN}✅ Archivo .env creado${NC}"
            echo -e "${YELLOW}📝 Edita .env con tus configuraciones antes de continuar${NC}"
        else
            echo -e "${RED}❌ .env.example no encontrado${NC}"
            exit 1
        fi
    fi
}

# Función para iniciar servicios
start_services() {
    echo -e "${BLUE}🚀 Iniciando servicios de desarrollo...${NC}"
    
    check_dependencies
    check_env_file
    
    # Crear red si no existe
    docker network create lms-network 2>/dev/null || true
    
    # Iniciar servicios
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d
    
    echo -e "${GREEN}✅ Servicios iniciados${NC}"
    echo ""
    
    # Esperar a que los servicios estén listos
    echo -e "${BLUE}⏳ Esperando a que los servicios estén listos...${NC}"
    sleep 10
    
    # Verificar estado
    show_status
    
    echo ""
    echo -e "${GREEN}🎉 Entorno de desarrollo listo${NC}"
    echo -e "${BLUE}📋 URLs disponibles:${NC}"
    echo "   App:     http://localhost:3000"
    echo "   Nginx:   http://localhost:80"
    echo "   DB:      localhost:3306"
    echo "   Redis:   localhost:6379"
    echo ""
    echo -e "${YELLOW}📝 Comandos útiles:${NC}"
    echo "   Ver logs:  ./docker/scripts/dev.sh logs"
    echo "   Shell:     ./docker/scripts/dev.sh shell"
    echo "   Migrate:   ./docker/scripts/dev.sh migrate"
}

# Función para detener servicios
stop_services() {
    echo -e "${BLUE}🛑 Deteniendo servicios...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down
    echo -e "${GREEN}✅ Servicios detenidos${NC}"
}

# Función para reiniciar servicios
restart_services() {
    echo -e "${BLUE}🔄 Reiniciando servicios...${NC}"
    stop_services
    sleep 2
    start_services
}

# Función para reconstruir imágenes
rebuild_images() {
    echo -e "${BLUE}🔨 Reconstruyendo imágenes...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME build --no-cache
    echo -e "${GREEN}✅ Imágenes reconstruidas${NC}"
}

# Función para ver logs
show_logs() {
    echo -e "${BLUE}📋 Mostrando logs en tiempo real...${NC}"
    echo -e "${YELLOW}(Ctrl+C para salir)${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME logs -f
}

# Función para abrir shell
open_shell() {
    echo -e "${BLUE}🐚 Abriendo shell en container de la app...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec lms-app /bin/sh
}

# Función para limpiar
clean_all() {
    echo -e "${YELLOW}⚠️  Esto eliminará containers, volúmenes e imágenes${NC}"
    echo -e "${RED}¿Estás seguro? (y/n)${NC}"
    read -r -n 1 CONFIRM
    echo ""
    
    if [[ $CONFIRM =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🧹 Limpiando...${NC}"
        
        # Detener servicios
        docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME down -v --remove-orphans
        
        # Limpiar imágenes del proyecto
        docker images | grep "$PROJECT_NAME" | awk '{print $3}' | xargs docker rmi -f 2>/dev/null || true
        
        # Limpiar sistema
        docker system prune -a -f --volumes
        
        echo -e "${GREEN}✅ Limpieza completada${NC}"
    else
        echo -e "${YELLOW}❌ Limpieza cancelada${NC}"
    fi
}

# Función para mostrar estado
show_status() {
    echo -e "${BLUE}📊 Estado de los servicios:${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME ps
    
    echo ""
    echo -e "${BLUE}💾 Uso de volúmenes:${NC}"
    docker volume ls | grep "$PROJECT_NAME" || echo "No hay volúmenes"
    
    echo ""
    echo -e "${BLUE}🌐 Puertos expuestos:${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME port lms-app 3000 2>/dev/null || echo "App no está corriendo"
}

# Función para acceder a base de datos
access_database() {
    echo -e "${BLUE}🗄️  Accediendo a base de datos MySQL...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec mysql-dev mysql -u lms_user -plms_password lms_platform_dev
}

# Función para acceder a Redis
access_redis() {
    echo -e "${BLUE}🔴 Accediendo a Redis CLI...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec redis-dev redis-cli
}

# Función para ejecutar tests
run_tests() {
    echo -e "${BLUE}🧪 Ejecutando tests...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec lms-app npm test
}

# Función para ejecutar migraciones
run_migrations() {
    echo -e "${BLUE}🗄️  Ejecutando migraciones de Prisma...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec lms-app npx prisma db push
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec lms-app npx prisma generate
    echo -e "${GREEN}✅ Migraciones completadas${NC}"
}

# Función para poblar base de datos
seed_database() {
    echo -e "${BLUE}🌱 Poblando base de datos con datos de prueba...${NC}"
    docker-compose -f $COMPOSE_FILE -p $PROJECT_NAME exec lms-app node add-courses.js
    echo -e "${GREEN}✅ Base de datos poblada${NC}"
}

# Main script
case "${1:-help}" in
    "up")
        start_services
        ;;
    "down")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "build")
        rebuild_images
        ;;
    "logs")
        show_logs
        ;;
    "shell")
        open_shell
        ;;
    "clean")
        clean_all
        ;;
    "status")
        show_status
        ;;
    "db")
        access_database
        ;;
    "redis")
        access_redis
        ;;
    "test")
        run_tests
        ;;
    "migrate")
        run_migrations
        ;;
    "seed")
        seed_database
        ;;
    "help"|*)
        show_help
        ;;
esac
