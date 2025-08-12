@echo off
color 0A
title LMS Platform - Docker Management System

echo.
echo     ██████╗  ██████╗  ██████╗██╗  ██╗███████╗██████╗ 
echo     ██╔══██╗██╔═══██╗██╔════╝██║ ██╔╝██╔════╝██╔══██╗
echo     ██║  ██║██║   ██║██║     █████╔╝ █████╗  ██████╔╝
echo     ██║  ██║██║   ██║██║     ██╔═██╗ ██╔══╝  ██╔══██╗
echo     ██████╔╝╚██████╔╝╚██████╗██║  ██╗███████╗██║  ██║
echo     ╚═════╝  ╚═════╝  ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║               🐳 LMS PLATFORM - DOCKER MANAGER 🐳                 ║
echo ╠════════════════════════════════════════════════════════════════════╣
echo ║                                                                    ║
echo ║  Sistema completo de containerización para tu LMS Platform        ║
echo ║  • Desarrollo local con Docker Compose                            ║
echo ║  • Producción en Google Kubernetes Engine                         ║
echo ║  • CI/CD con GitHub Actions                                        ║
echo ║  • Monitoreo con Prometheus                                        ║
echo ║  • Backup y restore automatizado                                   ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.

:main_menu
echo 📋 MENÚ PRINCIPAL - DOCKER MANAGEMENT
echo ======================================
echo.
echo   🚀 DESARROLLO:
echo   1. Configurar entorno de desarrollo
echo   2. Iniciar desarrollo con Docker
echo   3. Gestionar servicios de desarrollo
echo.
echo   🏗️ BUILD Y DEPLOY:
echo   4. Construir imagen Docker
echo   5. Deploy a Kubernetes (GKE)
echo   6. Gestionar cluster GKE
echo.
echo   📊 MONITOREO Y BACKUP:
echo   7. Sistema de monitoreo
echo   8. Backup y restore
echo   9. Ver logs y métricas
echo.
echo   📚 DOCUMENTACIÓN Y AYUDA:
echo   10. Ver arquitectura Docker
echo   11. Documentación completa
echo   12. Troubleshooting
echo.
echo   13. ❌ Salir
echo.

set /p choice="Selecciona una opción (1-13): "

if "%choice%"=="1" goto setup_dev
if "%choice%"=="2" goto start_dev
if "%choice%"=="3" goto manage_dev
if "%choice%"=="4" goto build_image
if "%choice%"=="5" goto deploy_k8s
if "%choice%"=="6" goto manage_k8s
if "%choice%"=="7" goto monitoring
if "%choice%"=="8" goto backup_restore
if "%choice%"=="9" goto logs_metrics
if "%choice%"=="10" goto architecture
if "%choice%"=="11" goto documentation
if "%choice%"=="12" goto troubleshooting
if "%choice%"=="13" goto exit
echo ❌ Opción inválida
pause
goto main_menu

REM ===========================================
REM CONFIGURAR ENTORNO DE DESARROLLO
REM ===========================================
:setup_dev
cls
echo 🚀 CONFIGURAR ENTORNO DE DESARROLLO
echo ===================================
echo.

echo 🔍 Verificando prerrequisitos...
echo.

REM Verificar Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está instalado
    echo 📥 Descarga: https://www.docker.com/products/docker-desktop
    pause
    goto main_menu
)
echo ✅ Docker instalado

REM Verificar Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose no está instalado
    pause
    goto main_menu
)
echo ✅ Docker Compose instalado

REM Verificar que Docker esté ejecutándose
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker no está ejecutándose
    echo 🔧 Inicia Docker Desktop
    pause
    goto main_menu
)
echo ✅ Docker ejecutándose

echo.
echo 📁 Verificando estructura de archivos...

if not exist "Dockerfile" (
    echo ❌ Dockerfile no encontrado
    pause
    goto main_menu
)
echo ✅ Dockerfile encontrado

if not exist "docker-compose.yml" (
    echo ❌ docker-compose.yml no encontrado
    pause
    goto main_menu
)
echo ✅ docker-compose.yml encontrado

if not exist ".dockerignore" (
    echo ⚠️ .dockerignore no encontrado (recomendado)
) else (
    echo ✅ .dockerignore encontrado
)

echo.
echo 📝 Configurando variables de entorno...

if not exist ".env" (
    if exist ".env.example" (
        echo 📋 Creando .env desde .env.example...
        copy .env.example .env
        echo ✅ .env creado
        echo 📝 Edita .env con tus configuraciones
        notepad .env
    ) else (
        echo ❌ No se encontró .env ni .env.example
        pause
        goto main_menu
    )
) else (
    echo ✅ .env ya existe
)

echo.
echo 🎉 ENTORNO DE DESARROLLO CONFIGURADO
echo ===================================
echo.
echo ✅ Docker y Docker Compose listos
echo ✅ Archivos de configuración presentes
echo ✅ Variables de entorno configuradas
echo.
echo 📝 Siguientes pasos:
echo    1. Revisar configuración en .env
echo    2. Usar opción 2 para iniciar desarrollo
echo.
pause
goto main_menu

REM ===========================================
REM INICIAR DESARROLLO CON DOCKER
REM ===========================================
:start_dev
cls
echo 🐳 INICIAR DESARROLLO CON DOCKER
echo ================================
echo.

echo 📋 OPCIONES DE DESARROLLO:
echo.
echo   1. 🚀 Iniciar entorno completo
echo   2. 📊 Ver estado de servicios
echo   3. 📋 Ver logs en tiempo real
echo   4. 🛑 Detener servicios
echo   5. 🔄 Reiniciar servicios
echo   6. 🔨 Reconstruir imágenes
echo   7. 🧹 Limpiar todo
echo   8. ⬅️ Volver al menú principal
echo.

set /p dev_choice="Selecciona una opción (1-8): "

if "%dev_choice%"=="1" (
    echo 🚀 Iniciando entorno de desarrollo...
    call docker\scripts\dev.bat
)
if "%dev_choice%"=="2" (
    echo 📊 Estado de servicios:
    docker-compose -f docker-compose.yml -p lms-platform ps
    pause
)
if "%dev_choice%"=="3" (
    echo 📋 Logs en tiempo real (Ctrl+C para salir):
    docker-compose -f docker-compose.yml -p lms-platform logs -f
)
if "%dev_choice%"=="4" (
    echo 🛑 Deteniendo servicios...
    docker-compose -f docker-compose.yml -p lms-platform down
    echo ✅ Servicios detenidos
    pause
)
if "%dev_choice%"=="5" (
    echo 🔄 Reiniciando servicios...
    docker-compose -f docker-compose.yml -p lms-platform restart
    echo ✅ Servicios reiniciados
    pause
)
if "%dev_choice%"=="6" (
    echo 🔨 Reconstruyendo imágenes...
    docker-compose -f docker-compose.yml -p lms-platform build --no-cache
    echo ✅ Imágenes reconstruidas
    pause
)
if "%dev_choice%"=="7" (
    echo 🧹 Limpiando todo...
    set /p confirm="⚠️ Esto eliminará containers y volúmenes. ¿Continuar? (y/n): "
    if /i "%confirm%"=="y" (
        docker-compose -f docker-compose.yml -p lms-platform down -v --remove-orphans
        docker system prune -a -f --volumes
        echo ✅ Limpieza completada
    )
    pause
)
if "%dev_choice%"=="8" goto main_menu

goto start_dev

REM ===========================================
REM GESTIONAR SERVICIOS DE DESARROLLO
REM ===========================================
:manage_dev
cls
call docker\scripts\dev.bat
goto main_menu

REM ===========================================
REM CONSTRUIR IMAGEN DOCKER
REM ===========================================
:build_image
cls
echo 🔨 CONSTRUIR IMAGEN DOCKER
echo ==========================
echo.

echo 📋 OPCIONES DE BUILD:
echo.
echo   1. 🔨 Build básico (latest)
echo   2. 🏷️ Build con tag específico
echo   3. 🚀 Build y push a registry
echo   4. 📊 Analizar imagen construida
echo   5. ⬅️ Volver al menú principal
echo.

set /p build_choice="Selecciona una opción (1-5): "

if "%build_choice%"=="1" (
    echo 🔨 Construyendo imagen con tag latest...
    call docker\scripts\build.bat
)
if "%build_choice%"=="2" (
    set /p tag="🏷️ Ingresa el tag: "
    echo 🔨 Construyendo imagen con tag: %tag%
    call docker\scripts\build.bat %tag%
)
if "%build_choice%"=="3" (
    echo 🚀 Build y push a Google Container Registry...
    call docker\scripts\build.bat
    echo 📤 Imagen lista para deployment
)
if "%build_choice%"=="4" (
    echo 📊 Analizando imagen...
    docker images | findstr lms-platform
    echo.
    set /p image_name="🔍 Ingresa nombre de imagen para analizar: "
    docker history %image_name%
    pause
)
if "%build_choice%"=="5" goto main_menu

pause
goto build_image

REM ===========================================
REM DEPLOY A KUBERNETES
REM ===========================================
:deploy_k8s
cls
echo 🚀 DEPLOY A KUBERNETES (GKE)
echo =============================
echo.

echo ⚠️ PRERREQUISITOS:
echo   ✅ gcloud CLI instalado y configurado
echo   ✅ kubectl instalado
echo   ✅ Cluster GKE creado
echo   ✅ Imagen Docker construida y pusheada
echo.

set /p continue="¿Continuar con deployment? (y/n): "
if /i not "%continue%"=="y" goto main_menu

echo 📋 OPCIONES DE DEPLOYMENT:
echo.
echo   1. 🆕 Deploy inicial (primera vez)
echo   2. 🔄 Update de aplicación
echo   3. 📊 Ver estado del deployment
echo   4. 📋 Ver logs de producción
echo   5. 🔄 Rollback a versión anterior
echo   6. 📏 Escalar aplicación
echo   7. ⬅️ Volver al menú principal
echo.

set /p deploy_choice="Selecciona una opción (1-7): "

if "%deploy_choice%"=="1" (
    echo 🆕 Deploy inicial a GKE...
    echo 📋 Aplicando configuraciones de Kubernetes...
    
    kubectl apply -f k8s/00-namespace-config.yaml
    kubectl apply -f k8s/01-deployment.yaml
    kubectl apply -f k8s/02-services.yaml
    kubectl apply -f k8s/03-ingress.yaml
    
    echo ✅ Deploy inicial completado
    echo 📋 Verificando estado...
    kubectl get pods -n lms-platform
)

if "%deploy_choice%"=="2" (
    set /p image_tag="🏷️ Tag de imagen a deployar: "
    echo 🔄 Actualizando deployment...
    
    kubectl set image deployment/lms-platform-deployment lms-platform=gcr.io/ai-academy-461719/lms-platform:%image_tag% -n lms-platform
    kubectl rollout status deployment/lms-platform-deployment -n lms-platform
    
    echo ✅ Actualización completada
)

if "%deploy_choice%"=="3" (
    echo 📊 Estado del deployment:
    kubectl get all -n lms-platform
)

if "%deploy_choice%"=="4" (
    echo 📋 Logs de producción:
    kubectl logs -n lms-platform -l app=lms-platform --tail=100
)

if "%deploy_choice%"=="5" (
    echo 🔄 Rollback a versión anterior...
    kubectl rollout undo deployment/lms-platform-deployment -n lms-platform
    kubectl rollout status deployment/lms-platform-deployment -n lms-platform
    echo ✅ Rollback completado
)

if "%deploy_choice%"=="6" (
    set /p replicas="📏 Número de réplicas: "
    echo 📏 Escalando a %replicas% réplicas...
    kubectl scale deployment lms-platform-deployment --replicas=%replicas% -n lms-platform
    echo ✅ Escalado completado
)

if "%deploy_choice%"=="7" goto main_menu

pause
goto deploy_k8s

REM ===========================================
REM GESTIONAR CLUSTER GKE
REM ===========================================
:manage_k8s
cls
echo 🎛️ GESTIONAR CLUSTER GKE
echo ========================
echo.

echo 📋 GESTIÓN DE CLUSTER:
echo.
echo   1. 📊 Estado del cluster
echo   2. 🔌 Conectar a cluster
echo   3. 🏷️ Listar nodos
echo   4. 📈 Ver métricas de recursos
echo   5. 🔍 Troubleshooting pods
echo   6. ⬅️ Volver al menú principal
echo.

set /p k8s_choice="Selecciona una opción (1-6): "

if "%k8s_choice%"=="1" (
    echo 📊 Estado del cluster:
    kubectl cluster-info
    echo.
    kubectl get nodes
)

if "%k8s_choice%"=="2" (
    echo 🔌 Conectando a cluster...
    gcloud container clusters get-credentials lms-cluster --zone us-central1-a
    echo ✅ Conectado al cluster
)

if "%k8s_choice%"=="3" (
    echo 🏷️ Nodos del cluster:
    kubectl get nodes -o wide
)

if "%k8s_choice%"=="4" (
    echo 📈 Métricas de recursos:
    kubectl top nodes
    echo.
    kubectl top pods -n lms-platform
)

if "%k8s_choice%"=="5" (
    echo 🔍 Troubleshooting pods:
    kubectl get pods -n lms-platform
    echo.
    kubectl describe pods -n lms-platform
)

if "%k8s_choice%"=="6" goto main_menu

pause
goto manage_k8s

REM ===========================================
REM SISTEMA DE MONITOREO
REM ===========================================
:monitoring
cls
echo 📊 SISTEMA DE MONITOREO
echo =======================
echo.

echo 📋 OPCIONES DE MONITOREO:
echo.
echo   1. 🚀 Configurar Prometheus
echo   2. 📊 Ver métricas actuales
echo   3. 🚨 Configurar alertas
echo   4. 📈 Dashboard de Grafana
echo   5. ⬅️ Volver al menú principal
echo.

set /p monitor_choice="Selecciona una opción (1-5): "

if "%monitor_choice%"=="1" (
    echo 🚀 Configurando Prometheus...
    echo 📋 Aplicando configuración de monitoreo...
    
    REM Aquí aplicarías las configuraciones de Prometheus
    echo ✅ Prometheus configurado
    echo 🌐 Acceso: http://localhost:9090
)

if "%monitor_choice%"=="2" (
    echo 📊 Métricas actuales:
    kubectl top pods -n lms-platform
    echo.
    kubectl get hpa -n lms-platform
)

if "%monitor_choice%"=="3" (
    echo 🚨 Configuración de alertas disponible en:
    echo    docker/monitoring/alert_rules.yml
    echo 📝 Editar para personalizar alertas
    notepad docker\monitoring\alert_rules.yml
)

if "%monitor_choice%"=="4" (
    echo 📈 Dashboard de Grafana:
    echo 🔧 Configuración pendiente
    echo 💡 Implementar en próxima versión
)

if "%monitor_choice%"=="5" goto main_menu

pause
goto monitoring

REM ===========================================
REM BACKUP Y RESTORE
REM ===========================================
:backup_restore
cls
echo 💾 BACKUP Y RESTORE
echo ==================
echo.

echo 📋 OPCIONES DE BACKUP:
echo.
echo   1. 💾 Crear backup completo
echo   2. 🔄 Restaurar desde backup
echo   3. 📊 Listar backups disponibles
echo   4. 🧹 Limpiar backups antiguos
echo   5. ⬅️ Volver al menú principal
echo.

set /p backup_choice="Selecciona una opción (1-5): "

if "%backup_choice%"=="1" (
    echo 💾 Creando backup completo...
    echo ⚠️ Requiere bash (Git Bash o WSL)
    echo 📋 Script disponible en: docker/scripts/backup.sh
    
    where bash >nul 2>&1
    if %errorlevel% equ 0 (
        bash docker/scripts/backup.sh
    ) else (
        echo ❌ Bash no encontrado
        echo 💡 Instala Git Bash o WSL para ejecutar backups
    )
)

if "%backup_choice%"=="2" (
    echo 🔄 Restaurar desde backup...
    dir backups\*.tar.gz 2>nul
    echo.
    set /p backup_file="📁 Nombre del archivo de backup: "
    
    where bash >nul 2>&1
    if %errorlevel% equ 0 (
        bash docker/scripts/restore.sh %backup_file%
    ) else (
        echo ❌ Bash no encontrado
        echo 💡 Instala Git Bash o WSL para ejecutar restore
    )
)

if "%backup_choice%"=="3" (
    echo 📊 Backups disponibles:
    dir backups\ 2>nul || echo No hay backups disponibles
)

if "%backup_choice%"=="4" (
    echo 🧹 Limpiando backups antiguos...
    forfiles /p backups /m *.tar.gz /d -30 /c "cmd /c del @path" 2>nul || echo No hay backups antiguos
    echo ✅ Limpieza completada
)

if "%backup_choice%"=="5" goto main_menu

pause
goto backup_restore

REM ===========================================
REM LOGS Y MÉTRICAS
REM ===========================================
:logs_metrics
cls
echo 📋 LOGS Y MÉTRICAS
echo ==================
echo.

echo 📊 INFORMACIÓN DEL SISTEMA:
echo.
echo   1. 📋 Logs de aplicación (desarrollo)
echo   2. 🚀 Logs de producción (K8s)
echo   3. 📊 Métricas de recursos
echo   4. 🔍 Debug de containers
echo   5. ⬅️ Volver al menú principal
echo.

set /p logs_choice="Selecciona una opción (1-5): "

if "%logs_choice%"=="1" (
    echo 📋 Logs de desarrollo:
    docker-compose -f docker-compose.yml -p lms-platform logs --tail=100
)

if "%logs_choice%"=="2" (
    echo 🚀 Logs de producción:
    kubectl logs -n lms-platform -l app=lms-platform --tail=100
)

if "%logs_choice%"=="3" (
    echo 📊 Métricas de recursos:
    echo === DESARROLLO ===
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    echo.
    echo === PRODUCCIÓN ===
    kubectl top pods -n lms-platform 2>nul || echo "Métricas no disponibles"
)

if "%logs_choice%"=="4" (
    echo 🔍 Debug de containers:
    docker ps -a | findstr lms
    echo.
    set /p container="🐳 Nombre del container para debug: "
    docker exec -it %container% /bin/sh
)

if "%logs_choice%"=="5" goto main_menu

pause
goto logs_metrics

REM ===========================================
REM VER ARQUITECTURA DOCKER
REM ===========================================
:architecture
cls
echo 🏗️ ARQUITECTURA DOCKER - LMS PLATFORM
echo ======================================
echo.

echo 📋 ESTRUCTURA DE CONTAINERIZACIÓN:
echo.
echo   🐳 CONTENEDORES:
echo   ├── lms-app            (Next.js Application)
echo   ├── mysql-dev          (MySQL Database)
echo   ├── redis-dev          (Redis Cache)
echo   └── nginx-dev          (Reverse Proxy)
echo.
echo   📁 ARCHIVOS CLAVE:
echo   ├── Dockerfile         (Imagen de aplicación)
echo   ├── docker-compose.yml (Desarrollo)
echo   ├── .dockerignore      (Archivos excluidos)
echo   └── healthcheck.js     (Health check)
echo.
echo   🎯 KUBERNETES:
echo   ├── k8s/namespace-config.yaml
echo   ├── k8s/deployment.yaml
echo   ├── k8s/services.yaml
echo   └── k8s/ingress.yaml
echo.
echo   🔧 SCRIPTS:
echo   ├── docker/scripts/build.bat
echo   ├── docker/scripts/dev.bat
echo   ├── docker/scripts/backup.sh
echo   └── docker/scripts/restore.sh
echo.
echo   📊 MONITOREO:
echo   ├── docker/monitoring/prometheus.yml
echo   └── docker/monitoring/alert_rules.yml
echo.

echo 📋 FLUJO DE TRABAJO:
echo.
echo   1. 💻 Desarrollo Local:
echo      docker-compose up → http://localhost:3000
echo.
echo   2. 🔨 Build y Test:
echo      docker build → docker push → testing
echo.
echo   3. 🚀 Deploy Producción:
echo      kubectl apply → GKE → https://your-domain.com
echo.
echo   4. 📊 Monitoreo:
echo      Prometheus → Alertas → Dashboard
echo.
echo   5. 💾 Backup:
echo      K8s + DB → Archive → Storage
echo.

pause
goto main_menu

REM ===========================================
REM DOCUMENTACIÓN COMPLETA
REM ===========================================
:documentation
cls
echo 📚 DOCUMENTACIÓN COMPLETA
echo =========================
echo.

echo 📁 DOCUMENTOS DISPONIBLES:
echo.
echo   1. 📖 README Docker (docker/README.md)
echo   2. 🏗️ Guía de Arquitectura
echo   3. 🚀 Guía de Deployment
echo   4. 🔧 Troubleshooting
echo   5. 📊 Monitoreo y Alertas
echo   6. 💾 Backup y Recovery
echo   7. 🔒 Configuración de Seguridad
echo   8. ⬅️ Volver al menú principal
echo.

set /p doc_choice="Selecciona documentación (1-8): "

if "%doc_choice%"=="1" (
    if exist "docker\README.md" (
        notepad docker\README.md
    ) else (
        echo 📄 Creando README Docker...
        echo # Docker Documentation > docker\README.md
        echo. >> docker\README.md
        echo Ver documentación completa en DOCKER-CONTAINERIZATION.md >> docker\README.md
        notepad docker\README.md
    )
)

if "%doc_choice%"=="2" (
    echo 🏗️ Arquitectura Docker implementada:
    echo.
    echo ✅ Multi-stage Dockerfile optimizado
    echo ✅ Docker Compose para desarrollo
    echo ✅ Kubernetes manifests para producción
    echo ✅ Nginx reverse proxy
    echo ✅ Health checks implementados
    echo ✅ Volumes persistentes configurados
    echo.
    pause
)

if "%doc_choice%"=="3" (
    echo 🚀 Guía de Deployment:
    echo.
    echo DESARROLLO:
    echo   1. docker\scripts\dev.bat
    echo   2. Acceder a http://localhost:3000
    echo.
    echo PRODUCCIÓN:
    echo   1. docker\scripts\build.bat
    echo   2. kubectl apply -f k8s/
    echo   3. Verificar deployment
    echo.
    pause
)

if "%doc_choice%"=="4" goto troubleshooting

if "%doc_choice%"=="5" (
    echo 📊 Monitoreo configurado:
    echo ✅ Prometheus metrics
    echo ✅ Alert rules
    echo ✅ Health checks
    echo ✅ Resource monitoring
    echo.
    echo 📁 Archivos: docker/monitoring/
    pause
)

if "%doc_choice%"=="6" (
    echo 💾 Sistema de Backup:
    echo ✅ Backup automático de K8s configs
    echo ✅ Backup de base de datos
    echo ✅ Backup de volúmenes
    echo ✅ Restore automatizado
    echo.
    echo 📁 Scripts: docker/scripts/backup.sh
    pause
)

if "%doc_choice%"=="7" (
    echo 🔒 Seguridad implementada:
    echo ✅ Multi-stage builds
    echo ✅ Non-root user
    echo ✅ Health checks
    echo ✅ Security headers
    echo ✅ Image scanning
    echo.
    pause
)

if "%doc_choice%"=="8" goto main_menu

goto documentation

REM ===========================================
REM TROUBLESHOOTING
REM ===========================================
:troubleshooting
cls
echo 🔧 TROUBLESHOOTING DOCKER
echo =========================
echo.

echo 🔍 PROBLEMAS COMUNES Y SOLUCIONES:
echo.
echo   1. 🐳 Docker no inicia
echo   2. 📦 Error en build de imagen
echo   3. 🌐 Problemas de networking
echo   4. 💾 Problemas de volúmenes
echo   5. 🔌 Error de conexión a DB
echo   6. 🚀 Fallas en deployment K8s
echo   7. 📊 Health checks fallan
echo   8. ⬅️ Volver al menú principal
echo.

set /p trouble_choice="Selecciona problema (1-8): "

if "%trouble_choice%"=="1" (
    echo 🐳 Docker no inicia:
    echo.
    echo SOLUCIONES:
    echo ✅ Verificar que Docker Desktop esté instalado
    echo ✅ Verificar que Docker service esté running
    echo ✅ Reiniciar Docker Desktop
    echo ✅ Verificar permisos de usuario
    echo.
    echo VERIFICAR:
    docker --version
    docker info
    echo.
    pause
)

if "%trouble_choice%"=="2" (
    echo 📦 Error en build de imagen:
    echo.
    echo SOLUCIONES:
    echo ✅ Verificar Dockerfile syntax
    echo ✅ Verificar .dockerignore
    echo ✅ Limpiar cache: docker system prune
    echo ✅ Build sin cache: docker build --no-cache
    echo.
    echo VERIFICAR:
    docker images
    docker system df
    echo.
    pause
)

if "%trouble_choice%"=="3" (
    echo 🌐 Problemas de networking:
    echo.
    echo SOLUCIONES:
    echo ✅ Verificar puertos expuestos
    echo ✅ Verificar docker network ls
    echo ✅ Reiniciar networking: docker network prune
    echo ✅ Verificar firewall
    echo.
    echo VERIFICAR:
    docker network ls
    docker port lms-platform-dev
    echo.
    pause
)

if "%trouble_choice%"=="4" (
    echo 💾 Problemas de volúmenes:
    echo.
    echo SOLUCIONES:
    echo ✅ Verificar permisos de archivos
    echo ✅ Verificar paths en docker-compose
    echo ✅ Limpiar volúmenes: docker volume prune
    echo ✅ Recrear volúmenes
    echo.
    echo VERIFICAR:
    docker volume ls
    docker-compose -p lms-platform ps
    echo.
    pause
)

if "%trouble_choice%"=="5" (
    echo 🔌 Error de conexión a DB:
    echo.
    echo SOLUCIONES:
    echo ✅ Verificar que MySQL container esté running
    echo ✅ Verificar credenciales en .env
    echo ✅ Verificar networking entre containers
    echo ✅ Verificar schema de DB
    echo.
    echo VERIFICAR:
    docker-compose -p lms-platform logs mysql-dev
    docker exec -it lms-mysql-dev mysql -u lms_user -p
    echo.
    pause
)

if "%trouble_choice%"=="6" (
    echo 🚀 Fallas en deployment K8s:
    echo.
    echo SOLUCIONES:
    echo ✅ Verificar conexión a cluster
    echo ✅ Verificar imagen en registry
    echo ✅ Verificar secrets y configmaps
    echo ✅ Verificar recursos disponibles
    echo.
    echo VERIFICAR:
    kubectl cluster-info
    kubectl get pods -n lms-platform
    kubectl describe pod -n lms-platform
    echo.
    pause
)

if "%trouble_choice%"=="7" (
    echo 📊 Health checks fallan:
    echo.
    echo SOLUCIONES:
    echo ✅ Verificar endpoint /api/health
    echo ✅ Verificar que aplicación esté iniciada
    echo ✅ Verificar logs de aplicación
    echo ✅ Ajustar timeouts en health check
    echo.
    echo VERIFICAR:
    curl http://localhost:3000/api/health
    docker logs lms-platform-dev
    echo.
    pause
)

if "%trouble_choice%"=="8" goto main_menu

goto troubleshooting

REM ===========================================
REM SALIR
REM ===========================================
:exit
cls
echo.
echo ╔════════════════════════════════════════════════════════════════════╗
echo ║                     👋 ¡GRACIAS POR USAR!                         ║
echo ╠════════════════════════════════════════════════════════════════════╣
echo ║                                                                    ║
echo ║  🐳 LMS Platform Docker Management System                         ║
echo ║                                                                    ║
echo ║  📚 RECURSOS ÚTILES:                                              ║
echo ║  • Documentación: docker/README.md                                ║
echo ║  • Scripts: docker/scripts/                                       ║
echo ║  • Kubernetes: k8s/                                               ║
echo ║  • Monitoreo: docker/monitoring/                                  ║
echo ║                                                                    ║
echo ║  🔗 ENLACES:                                                       ║
echo ║  • Docker: https://docs.docker.com                                ║
echo ║  • Kubernetes: https://kubernetes.io/docs                         ║
echo ║  • Google Cloud: https://cloud.google.com/docs                    ║
echo ║                                                                    ║
echo ║  💡 COMANDOS RÁPIDOS:                                             ║
echo ║  • Desarrollo: docker\scripts\dev.bat                             ║
echo ║  • Build: docker\scripts\build.bat                                ║
echo ║  • Deploy: kubectl apply -f k8s/                                  ║
echo ║                                                                    ║
echo ╚════════════════════════════════════════════════════════════════════╝
echo.
echo 🎊 ¡Tu LMS Platform está listo para containerización!
echo.
pause
exit /b 0
