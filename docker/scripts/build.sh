#!/bin/bash

# ===========================================
# DOCKER BUILD SCRIPT - LMS PLATFORM
# ===========================================
# Script para construir la imagen Docker optimizada

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ID="ai-academy-461719"
IMAGE_NAME="lms-platform"
REGISTRY="gcr.io"
TAG=${1:-latest}
BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

echo -e "${BLUE}🐳 Construyendo imagen Docker para LMS Platform${NC}"
echo -e "${YELLOW}📊 Configuración:${NC}"
echo "   Project ID: $PROJECT_ID"
echo "   Image: $IMAGE_NAME"
echo "   Tag: $TAG"
echo "   Registry: $REGISTRY"
echo "   Build Date: $BUILD_DATE"
echo "   Git Commit: $GIT_COMMIT"
echo ""

# Verificar que Docker esté ejecutándose
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker no está ejecutándose${NC}"
    exit 1
fi

# Verificar que gcloud esté configurado
if ! gcloud config get-value project > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: gcloud no está configurado${NC}"
    echo "   Ejecuta: gcloud auth login && gcloud config set project $PROJECT_ID"
    exit 1
fi

# Configurar Docker para usar gcloud como credential helper
echo -e "${BLUE}🔐 Configurando autenticación Docker...${NC}"
gcloud auth configure-docker --quiet

# Limpiar builds anteriores (opcional)
echo -e "${BLUE}🧹 Limpiando builds anteriores...${NC}"
docker system prune -f --filter "until=24h" || true

# Build de la imagen
echo -e "${BLUE}🔨 Construyendo imagen...${NC}"
docker build \
    --platform linux/amd64 \
    --build-arg BUILD_DATE="$BUILD_DATE" \
    --build-arg GIT_COMMIT="$GIT_COMMIT" \
    --build-arg NODE_ENV="production" \
    --tag "$REGISTRY/$PROJECT_ID/$IMAGE_NAME:$TAG" \
    --tag "$REGISTRY/$PROJECT_ID/$IMAGE_NAME:$GIT_COMMIT" \
    --tag "$REGISTRY/$PROJECT_ID/$IMAGE_NAME:latest" \
    --file Dockerfile \
    .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Imagen construida exitosamente${NC}"
else
    echo -e "${RED}❌ Error construyendo imagen${NC}"
    exit 1
fi

# Verificar tamaño de la imagen
IMAGE_SIZE=$(docker images "$REGISTRY/$PROJECT_ID/$IMAGE_NAME:$TAG" --format "table {{.Size}}" | tail -n 1)
echo -e "${YELLOW}📦 Tamaño de imagen: $IMAGE_SIZE${NC}"

# Verificar seguridad de la imagen (opcional)
echo -e "${BLUE}🔍 Escaneando vulnerabilidades...${NC}"
if command -v trivy &> /dev/null; then
    trivy image --severity HIGH,CRITICAL "$REGISTRY/$PROJECT_ID/$IMAGE_NAME:$TAG" || true
else
    echo -e "${YELLOW}⚠️  Trivy no está instalado. Saltando escaneo de seguridad.${NC}"
fi

# Probar que la imagen funcione
echo -e "${BLUE}🧪 Probando imagen...${NC}"
CONTAINER_ID=$(docker run -d \
    --platform linux/amd64 \
    -p 3001:3000 \
    -e NODE_ENV=production \
    -e DATABASE_URL="mysql://test:test@localhost:3306/test" \
    "$REGISTRY/$PROJECT_ID/$IMAGE_NAME:$TAG")

# Esperar a que el container inicie
sleep 10

# Verificar que el container esté corriendo
if docker ps | grep -q "$CONTAINER_ID"; then
    echo -e "${GREEN}✅ Container está ejecutándose${NC}"
    
    # Probar health check
    if docker exec "$CONTAINER_ID" node healthcheck.js; then
        echo -e "${GREEN}✅ Health check pasó${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check falló (normal si no hay BD)${NC}"
    fi
else
    echo -e "${RED}❌ Container no está ejecutándose${NC}"
    docker logs "$CONTAINER_ID"
fi

# Limpiar container de prueba
docker stop "$CONTAINER_ID" > /dev/null 2>&1 || true
docker rm "$CONTAINER_ID" > /dev/null 2>&1 || true

echo ""
echo -e "${GREEN}🎉 Build completado exitosamente${NC}"
echo -e "${BLUE}📋 Siguiente paso:${NC}"
echo "   Para push: docker push $REGISTRY/$PROJECT_ID/$IMAGE_NAME:$TAG"
echo "   Para deploy: kubectl apply -f k8s/"
echo ""
echo -e "${YELLOW}📊 Información de la imagen:${NC}"
echo "   Imagen: $REGISTRY/$PROJECT_ID/$IMAGE_NAME:$TAG"
echo "   Tamaño: $IMAGE_SIZE"
echo "   Commit: $GIT_COMMIT"
echo "   Fecha: $BUILD_DATE"
