const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Script para probar conexión a Cloud SQL
// Ejecutar: node cloud-sql/test-connection.js

class CloudSQLTester {
    constructor() {
        this.prisma = new PrismaClient();
        this.config = {
            host: process.env.CLOUD_SQL_PUBLIC_IP || 'localhost',
            user: process.env.CLOUD_SQL_USER || 'lms_user',
            password: process.env.CLOUD_SQL_PASSWORD,
            database: process.env.CLOUD_SQL_DATABASE_NAME || 'lms_platform',
            port: 3306,
            ssl: {
                rejectUnauthorized: false
            }
        };
    }

    async testPrismaConnection() {
        console.log('🔍 Probando conexión Prisma...');
        
        try {
            await this.prisma.$connect();
            console.log('✅ Prisma conectado exitosamente');
            
            // Probar query básica
            const result = await this.prisma.$queryRaw`SELECT VERSION() as version`;
            console.log(`✅ MySQL Version: ${result[0].version}`);
            
            return true;
        } catch (error) {
            console.error('❌ Error Prisma:', error.message);
            return false;
        }
    }

    async testDirectConnection() {
        console.log('🔍 Probando conexión directa MySQL...');
        
        try {
            const connection = await mysql.createConnection(this.config);
            console.log('✅ Conexión directa exitosa');
            
            const [rows] = await connection.execute('SELECT @@version as version, @@version_comment as comment');
            console.log(`✅ MySQL: ${rows[0].version} (${rows[0].comment})`);
            
            await connection.end();
            return true;
        } catch (error) {
            console.error('❌ Error conexión directa:', error.message);
            return false;
        }
    }

    async testDatabaseStructure() {
        console.log('🔍 Verificando estructura de base de datos...');
        
        try {
            // Verificar que las tablas existen
            const tables = await this.prisma.$queryRaw`
                SELECT TABLE_NAME 
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = DATABASE()
            `;
            
            console.log(`✅ Encontradas ${tables.length} tablas:`);
            tables.forEach(table => {
                console.log(`   - ${table.TABLE_NAME}`);
            });

            // Verificar índices críticos
            const indexes = await this.prisma.$queryRaw`
                SELECT TABLE_NAME, INDEX_NAME, COLUMN_NAME
                FROM information_schema.STATISTICS 
                WHERE TABLE_SCHEMA = DATABASE()
                AND INDEX_NAME != 'PRIMARY'
                ORDER BY TABLE_NAME, INDEX_NAME
            `;
            
            console.log(`✅ Encontrados ${indexes.length} índices personalizados`);
            
            return true;
        } catch (error) {
            console.error('❌ Error verificando estructura:', error.message);
            return false;
        }
    }

    async testPerformance() {
        console.log('🔍 Probando performance de queries...');
        
        try {
            const startTime = Date.now();
            
            // Query simple
            await this.prisma.course.findMany({
                take: 10,
                include: {
                    category: true,
                    chapters: {
                        take: 5
                    }
                }
            });
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`✅ Query compleja ejecutada en ${duration}ms`);
            
            if (duration < 100) {
                console.log('🚀 Performance EXCELENTE (< 100ms)');
            } else if (duration < 500) {
                console.log('✅ Performance BUENA (< 500ms)');
            } else {
                console.log('⚠️  Performance MEJORABLE (> 500ms)');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error en test de performance:', error.message);
            return false;
        }
    }

    async testDataCounts() {
        console.log('🔍 Contando registros...');
        
        try {
            const counts = {
                courses: await this.prisma.course.count(),
                categories: await this.prisma.category.count(),
                chapters: await this.prisma.chapter.count(),
                userProgress: await this.prisma.userProgress.count(),
                purchases: await this.prisma.purchase.count()
            };

            console.log('📊 Registros en la base de datos:');
            Object.entries(counts).forEach(([table, count]) => {
                console.log(`   ${table}: ${count}`);
            });

            return counts;
        } catch (error) {
            console.error('❌ Error contando registros:', error.message);
            return false;
        }
    }

    async runFullTest() {
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║              PRUEBA DE CONEXIÓN CLOUD SQL                   ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');

        console.log('🔧 Configuración:');
        console.log(`   Host: ${this.config.host}`);
        console.log(`   User: ${this.config.user}`);
        console.log(`   Database: ${this.config.database}`);
        console.log(`   SSL: ${this.config.ssl ? 'Habilitado' : 'Deshabilitado'}\n`);

        const tests = [
            { name: 'Conexión Prisma', test: () => this.testPrismaConnection() },
            { name: 'Conexión Directa', test: () => this.testDirectConnection() },
            { name: 'Estructura DB', test: () => this.testDatabaseStructure() },
            { name: 'Performance', test: () => this.testPerformance() },
            { name: 'Conteo de Datos', test: () => this.testDataCounts() }
        ];

        let passed = 0;
        let failed = 0;

        for (const { name, test } of tests) {
            console.log(`\n🧪 ${name}:`);
            
            try {
                const result = await test();
                if (result) {
                    passed++;
                    console.log(`✅ ${name} - PASÓ\n`);
                } else {
                    failed++;
                    console.log(`❌ ${name} - FALLÓ\n`);
                }
            } catch (error) {
                failed++;
                console.error(`❌ ${name} - ERROR: ${error.message}\n`);
            }
        }

        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║                      RESULTADOS FINALES                     ║');
        console.log('╠══════════════════════════════════════════════════════════════╣');
        console.log(`║ ✅ Pruebas pasadas: ${passed}`);
        console.log(`║ ❌ Pruebas fallidas: ${failed}`);
        console.log(`║ 📊 Total: ${passed + failed}`);
        
        if (failed === 0) {
            console.log('║');
            console.log('║ 🎉 ¡TODAS LAS PRUEBAS PASARON!');
            console.log('║ ✅ Cloud SQL está listo para 20K usuarios');
        } else {
            console.log('║');
            console.log('║ ⚠️  Algunas pruebas fallaron');
            console.log('║ 🔧 Revisar configuración antes de producción');
        }
        
        console.log('╚══════════════════════════════════════════════════════════════╝');

        return failed === 0;
    }

    async disconnect() {
        await this.prisma.$disconnect();
    }
}

// Ejecutar pruebas
if (require.main === module) {
    const tester = new CloudSQLTester();
    
    tester.runFullTest()
        .then((success) => {
            tester.disconnect();
            process.exit(success ? 0 : 1);
        })
        .catch(async (error) => {
            console.error('❌ Error fatal:', error);
            await tester.disconnect();
            process.exit(1);
        });
}

module.exports = CloudSQLTester;
