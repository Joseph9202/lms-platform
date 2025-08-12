#!/bin/sh
# ===========================================
# NGINX DOCKER ENTRYPOINT
# ===========================================
# Script de inicio personalizado para Nginx

set -e

# Función para logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Función para verificar configuración
check_config() {
    log "Verificando configuración de Nginx..."
    nginx -t
    if [ $? -eq 0 ]; then
        log "✅ Configuración de Nginx válida"
    else
        log "❌ Error en configuración de Nginx"
        exit 1
    fi
}

# Función para configurar SSL
setup_ssl() {
    log "Configurando SSL..."
    
    # Verificar si existen certificados reales
    if [ ! -f "/etc/nginx/ssl/lms.ai-academy.com.crt" ] || [ ! -f "/etc/nginx/ssl/lms.ai-academy.com.key" ]; then
        log "⚠️  Certificados SSL no encontrados, generando certificados auto-firmados..."
        
        # Generar certificados auto-firmados
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout /etc/nginx/ssl/lms.ai-academy.com.key \
            -out /etc/nginx/ssl/lms.ai-academy.com.crt \
            -subj "/C=US/ST=State/L=City/O=LMS Platform/CN=lms.ai-academy.com"
        
        log "✅ Certificados SSL generados"
    else
        log "✅ Certificados SSL encontrados"
    fi
    
    # Configurar permisos
    chmod 600 /etc/nginx/ssl/lms.ai-academy.com.key
    chmod 644 /etc/nginx/ssl/lms.ai-academy.com.crt
}

# Función para configurar logs
setup_logs() {
    log "Configurando logs..."
    
    # Crear directorios de logs si no existen
    mkdir -p /var/log/nginx
    
    # Configurar log rotation
    if [ -f "/etc/logrotate.d/nginx" ]; then
        log "✅ Log rotation configurado"
    else
        log "⚠️  Configurando log rotation..."
        cat > /etc/logrotate.d/nginx << 'EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nginx nginx
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF
    fi
}

# Función para configurar cache
setup_cache() {
    log "Configurando cache..."
    
    # Crear directorios de cache
    mkdir -p /var/cache/nginx/client_temp
    mkdir -p /var/cache/nginx/proxy_temp
    mkdir -p /var/cache/nginx/fastcgi_temp
    mkdir -p /var/cache/nginx/uwsgi_temp
    mkdir -p /var/cache/nginx/scgi_temp
    
    # Configurar permisos
    chown -R nginx:nginx /var/cache/nginx
    chmod -R 755 /var/cache/nginx
    
    log "✅ Cache configurado"
}

# Función para health check
health_check() {
    log "Configurando health check..."
    
    # Crear endpoint de health check
    mkdir -p /usr/share/nginx/html
    cat > /usr/share/nginx/html/health << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Nginx Health Check</title>
</head>
<body>
    <h1>Nginx is running</h1>
    <p>Status: OK</p>
    <p>Time: $(date)</p>
</body>
</html>
EOF
    
    log "✅ Health check configurado"
}

# Función principal
main() {
    log "🚀 Iniciando Nginx para LMS Platform..."
    
    # Verificar permisos
    log "Verificando permisos..."
    if [ "$(id -u)" -eq 0 ]; then
        log "⚠️  Ejecutándose como root, cambiando a usuario nginx..."
        # Cambiar propietario de archivos necesarios
        chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/ssl
        # Ejecutar nginx como usuario nginx
        exec su-exec nginx "$0" "$@"
    fi
    
    # Configurar componentes
    setup_ssl
    setup_logs
    setup_cache
    health_check
    
    # Verificar configuración
    check_config
    
    log "✅ Nginx configurado y listo para iniciar"
    
    # Iniciar nginx
    exec "$@"
}

# Capturar señales para shutdown graceful
trap 'log "Recibida señal SIGTERM, cerrando Nginx..."; nginx -s quit; exit 0' TERM

# Ejecutar función principal
main "$@"
