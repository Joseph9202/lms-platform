-- ===========================================
-- MYSQL TESTING INITIALIZATION
-- Script de inicialización rápida para testing
-- ===========================================

-- Configurar timezone
SET GLOBAL time_zone = '+00:00';

-- Crear base de datos de testing
CREATE DATABASE IF NOT EXISTS lms_platform_test 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario de testing
CREATE USER IF NOT EXISTS 'lms_user'@'%' IDENTIFIED BY 'lms_password';
GRANT ALL PRIVILEGES ON lms_platform_test.* TO 'lms_user'@'%';

-- Configuraciones específicas para testing rápido
SET GLOBAL innodb_stats_on_metadata = 0;
SET GLOBAL performance_schema = OFF;
SET GLOBAL general_log = OFF;
SET GLOBAL slow_query_log = OFF;

-- Usar la base de datos de testing
USE lms_platform_test;

-- Tabla para health checks de testing
CREATE TABLE IF NOT EXISTS test_health_check (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'ready',
    test_run_id VARCHAR(100),
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    details JSON
) ENGINE=InnoDB;

-- Insertar registro inicial
INSERT INTO test_health_check (status, test_run_id, details) VALUES 
('ready', 'init', JSON_OBJECT('message', 'Test database ready', 'timestamp', NOW()));

-- Tabla para datos de prueba
CREATE TABLE IF NOT EXISTS test_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla para cursos de prueba
CREATE TABLE IF NOT EXISTS test_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id INT,
    category VARCHAR(100),
    price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_instructor (instructor_id),
    INDEX idx_category (category)
) ENGINE=InnoDB;

-- Tabla para métricas de testing
CREATE TABLE IF NOT EXISTS test_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_suite VARCHAR(100) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    test_run_id VARCHAR(100),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_test_suite (test_suite),
    INDEX idx_test_run (test_run_id)
) ENGINE=InnoDB;

-- Insertar datos de prueba básicos
INSERT INTO test_users (email, name, role) VALUES
('test.student@example.com', 'Test Student', 'student'),
('test.instructor@example.com', 'Test Instructor', 'instructor'),
('test.admin@example.com', 'Test Admin', 'admin');

INSERT INTO test_courses (title, description, instructor_id, category, price) VALUES
('Test Course 1', 'A test course for automated testing', 2, 'programming', 99.99),
('Test Course 2', 'Another test course', 2, 'design', 149.99),
('Free Test Course', 'A free course for testing', 2, 'general', 0.00);

-- Aplicar permisos
GRANT ALL PRIVILEGES ON lms_platform_test.* TO 'lms_user'@'%';
FLUSH PRIVILEGES;

-- Configuración final para testing
SET GLOBAL innodb_fast_shutdown = 1;
SET GLOBAL innodb_doublewrite = 0;

-- Verificación final
SELECT 'MySQL Test Environment Ready' AS status;
SELECT COUNT(*) as test_users FROM test_users;
SELECT COUNT(*) as test_courses FROM test_courses;

-- Mostrar configuración
SELECT 
    'Test Configuration Applied' as message,
    @@character_set_server as charset,
    @@collation_server as collation,
    @@time_zone as timezone,
    @@innodb_buffer_pool_size as buffer_pool_size;
