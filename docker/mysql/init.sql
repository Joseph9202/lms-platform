-- ===========================================
-- MYSQL INIT SCRIPT - LMS PLATFORM
-- ===========================================
-- Script de inicialización para base de datos de desarrollo

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS lms_platform_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario de desarrollo
CREATE USER IF NOT EXISTS 'lms_user'@'%' IDENTIFIED BY 'lms_password';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON lms_platform_dev.* TO 'lms_user'@'%';

-- Crear base de datos de testing
CREATE DATABASE IF NOT EXISTS lms_platform_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON lms_platform_test.* TO 'lms_user'@'%';

-- Configuraciones de performance para desarrollo
SET GLOBAL innodb_buffer_pool_size = 256*1024*1024; -- 256MB
SET GLOBAL max_connections = 200;
SET GLOBAL innodb_log_file_size = 64*1024*1024; -- 64MB
SET GLOBAL slow_query_log = 1;
SET GLOBAL long_query_time = 2;

-- Flush privileges
FLUSH PRIVILEGES;

-- Crear tabla de health check
USE lms_platform_dev;

CREATE TABLE IF NOT EXISTS health_check (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(50) DEFAULT 'healthy',
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO health_check (status) VALUES ('initialized') ON DUPLICATE KEY UPDATE status='healthy';

-- Configurar timezone
SET time_zone = '+00:00';

-- Log de inicialización
SELECT 'Database initialized successfully' as message;
