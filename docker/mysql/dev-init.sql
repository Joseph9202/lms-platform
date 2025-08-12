-- ===========================================
-- MYSQL DEVELOPMENT INITIALIZATION
-- Script de inicialización para desarrollo
-- ===========================================

-- Configurar timezone global
SET GLOBAL time_zone = '+00:00';

-- Crear base de datos principal si no existe
CREATE DATABASE IF NOT EXISTS lms_platform_dev 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear base de datos de testing
CREATE DATABASE IF NOT EXISTS lms_platform_test 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario de desarrollo con todos los permisos
CREATE USER IF NOT EXISTS 'lms_user'@'%' IDENTIFIED BY 'lms_password';
GRANT ALL PRIVILEGES ON lms_platform_dev.* TO 'lms_user'@'%';
GRANT ALL PRIVILEGES ON lms_platform_test.* TO 'lms_user'@'%';

-- Crear usuario de solo lectura para monitoring
CREATE USER IF NOT EXISTS 'lms_monitor'@'%' IDENTIFIED BY 'monitor_password';
GRANT SELECT, PROCESS, REPLICATION CLIENT ON *.* TO 'lms_monitor'@'%';

-- Configuraciones específicas para desarrollo
SET GLOBAL innodb_stats_on_metadata = 0;
SET GLOBAL performance_schema = ON;

-- Crear tablas de utilidad para desarrollo
USE lms_platform_dev;

-- Tabla para health checks
CREATE TABLE IF NOT EXISTS health_check (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'healthy',
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    details JSON
) ENGINE=InnoDB;

-- Insertar registro inicial de health check
INSERT INTO health_check (status, details) VALUES 
('healthy', JSON_OBJECT('message', 'Database initialized successfully', 'timestamp', NOW()));

-- Tabla para métricas de desarrollo
CREATE TABLE IF NOT EXISTS dev_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    labels JSON,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_metric_name (metric_name),
    INDEX idx_recorded_at (recorded_at)
) ENGINE=InnoDB;

-- Tabla para logs de desarrollo
CREATE TABLE IF NOT EXISTS dev_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    level ENUM('debug', 'info', 'warn', 'error') NOT NULL,
    message TEXT NOT NULL,
    metadata JSON,
    source VARCHAR(100),
    logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_source (source),
    INDEX idx_logged_at (logged_at)
) ENGINE=InnoDB;

-- Configurar permisos para las tablas de utilidad
GRANT ALL PRIVILEGES ON lms_platform_dev.health_check TO 'lms_user'@'%';
GRANT ALL PRIVILEGES ON lms_platform_dev.dev_metrics TO 'lms_user'@'%';
GRANT ALL PRIVILEGES ON lms_platform_dev.dev_logs TO 'lms_user'@'%';

-- Aplicar cambios
FLUSH PRIVILEGES;

-- Mostrar configuración final
SELECT 'MySQL Development Environment Initialized Successfully' AS status;
SELECT user, host FROM mysql.user WHERE user LIKE 'lms_%';
SHOW DATABASES LIKE 'lms_%';

-- Configuraciones adicionales para desarrollo
SET GLOBAL general_log = 'ON';
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Información útil para desarrollo
SELECT 
    'Development Configuration Applied' as message,
    @@character_set_server as charset,
    @@collation_server as collation,
    @@time_zone as timezone,
    @@max_connections as max_connections,
    @@innodb_buffer_pool_size as buffer_pool_size;
