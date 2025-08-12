# ===========================================
# NGINX DOCKERFILE - LMS PLATFORM
# Imagen optimizada para load balancing
# ===========================================

FROM nginx:alpine

# Metadata
LABEL maintainer="LMS Platform Team"
LABEL description="Nginx load balancer for LMS Platform"
LABEL version="1.0.0"

# Instalar dependencias adicionales
RUN apk add --no-cache \
    curl \
    openssl \
    nginx-mod-http-headers-more \
    && rm -rf /var/cache/apk/*

# Crear usuario nginx si no existe
RUN addgroup -g 101 -S nginx || true
RUN adduser -S -D -H -u 101 -h /var/cache/nginx -s /sbin/nologin -G nginx -g nginx nginx || true

# Crear directorios necesarios
RUN mkdir -p /var/cache/nginx/lms_cache \
    && mkdir -p /etc/nginx/ssl \
    && mkdir -p /var/log/nginx \
    && mkdir -p /usr/share/nginx/html

# Configurar permisos
RUN chown -R nginx:nginx /var/cache/nginx \
    && chown -R nginx:nginx /var/log/nginx \
    && chown -R nginx:nginx /etc/nginx \
    && chmod -R 755 /var/cache/nginx \
    && chmod -R 755 /var/log/nginx

# Copiar configuraciones
COPY production.conf /etc/nginx/nginx.conf
COPY html/ /usr/share/nginx/html/

# Crear página de error personalizada
RUN echo '<!DOCTYPE html><html><head><title>LMS Platform - Error</title></head><body><h1>Servicio temporalmente no disponible</h1><p>Por favor, intenta nuevamente en unos momentos.</p></body></html>' > /usr/share/nginx/html/50x.html

# Crear certificados SSL auto-firmados para desarrollo
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/C=US/ST=CA/L=SanFrancisco/O=LMS/OU=Dev/CN=localhost"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Exponer puertos
EXPOSE 80 443

# Cambiar a usuario nginx
USER nginx

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
