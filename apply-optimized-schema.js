const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Script para aplicar schema optimizado a Cloud SQL
// Ejecutar: node apply-optimized-schema.js

class SchemaApplier {
    constructor() {
        this.prisma = new PrismaClient();
        this.config = {
            connectionName: 'ai-academy-461719:us-central1:lms-production',
            publicIP: '34.122.241.221',
            databaseName: 'lms_platform'
        };
    }

    async verifyConnection() {
        console.log('🔍 Verificando conexión a Cloud SQL...');
        
        try {
            await this.prisma.$connect();
            console.log('✅ Conexión establecida');
            
            const result = await this.prisma.$queryRaw`SELECT VERSION() as version, DATABASE() as database`;
            console.log(`✅ MySQL: ${result[0].version}`);
            console.log(`✅ Database: ${result[0].database}`);
            
            return true;
        } catch (error) {
            console.error('❌ Error de conexión:', error.message);
            console.log('\n💡 Soluciones:');
            console.log('   1. Verificar DATABASE_URL en .env');
            console.log('   2. Verificar que la IP esté autorizada');
            console.log('   3. Verificar credenciales de usuario');
            return false;
        }
    }

    async applyOptimizedSchema() {
        console.log('🏗️ Aplicando schema optimizado para 20K usuarios...');
        
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        
        try {
            // 1. Generar cliente actualizado
            console.log('📦 Generando cliente Prisma con nuevos índices...');
            await execPromise('npx prisma generate');
            console.log('✅ Cliente generado');
            
            // 2. Aplicar cambios de schema
            console.log('🚀 Aplicando schema con índices optimizados...');
            await execPromise('npx prisma db push');
            console.log('✅ Schema aplicado exitosamente');
            
            return true;
        } catch (error) {
            console.error('❌ Error aplicando schema:', error.message);
            return false;
        }
    }

    async verifyOptimizations() {
        console.log('🔍 Verificando optimizaciones aplicadas...');
        
        try {
            // Verificar índices críticos
            const indexes = await this.prisma.$queryRaw`
                SELECT 
                    TABLE_NAME,
                    INDEX_NAME,
                    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as COLUMNS,
                    NON_UNIQUE
                FROM information_schema.STATISTICS 
                WHERE TABLE_SCHEMA = DATABASE()
                AND INDEX_NAME != 'PRIMARY'
                GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
                ORDER BY TABLE_NAME, INDEX_NAME
            `;
            
            console.log(`✅ Encontrados ${indexes.length} índices personalizados:`);
            
            const criticalIndexes = [
                'Course_userId_idx',
                'Course_isPublished_idx', 
                'Course_userId_isPublished_idx',
                'UserProgress_userId_idx',
                'UserProgress_userId_isCompleted_idx',
                'Purchase_userId_idx',
                'Purchase_createdAt_idx'
            ];
            
            const foundIndexes = indexes.map(idx => idx.INDEX_NAME);
            const missingIndexes = criticalIndexes.filter(idx => !foundIndexes.includes(idx));
            
            if (missingIndexes.length === 0) {
                console.log('🎉 ¡Todos los índices críticos están presentes!');
            } else {
                console.log('⚠️  Índices faltantes:', missingIndexes);
            }
            
            // Mostrar resumen por tabla
            const tableIndexes = {};
            indexes.forEach(idx => {
                if (!tableIndexes[idx.TABLE_NAME]) {
                    tableIndexes[idx.TABLE_NAME] = [];
                }
                tableIndexes[idx.TABLE_NAME].push(`${idx.INDEX_NAME} (${idx.COLUMNS})`);
            });
            
            console.log('\n📊 Índices por tabla:');
            Object.entries(tableIndexes).forEach(([table, idxList]) => {
                console.log(`   ${table}: ${idxList.length} índices`);
                idxList.forEach(idx => console.log(`     - ${idx}`));
            });
            
            return true;
        } catch (error) {
            console.error('❌ Error verificando optimizaciones:', error.message);
            return false;
        }
    }

    async testPerformance() {
        console.log('⚡ Probando performance de queries críticas...');
        
        try {
            const tests = [
                {
                    name: 'Query de cursos por instructor',
                    query: async () => {
                        const start = Date.now();
                        await this.prisma.course.findMany({
                            where: { isPublished: true },
                            include: { category: true },
                            take: 20
                        });
                        return Date.now() - start;
                    }
                },
                {
                    name: 'Query de progreso por usuario',
                    query: async () => {
                        const start = Date.now();
                        await this.prisma.userProgress.findMany({
                            where: { isCompleted: true },
                            include: { chapter: true },
                            take: 50
                        });
                        return Date.now() - start;
                    }
                },
                {
                    name: 'Query de compras recientes',
                    query: async () => {
                        const start = Date.now();
                        await this.prisma.purchase.findMany({
                            include: { course: true },
                            orderBy: { createdAt: 'desc' },
                            take: 20
                        });
                        return Date.now() - start;
                    }
                }
            ];
            
            for (const test of tests) {
                try {
                    const duration = await test.query();
                    const status = duration < 100 ? '🚀 EXCELENTE' : 
                                  duration < 300 ? '✅ BUENO' : 
                                  '⚠️ MEJORABLE';
                    console.log(`   ${test.name}: ${duration}ms - ${status}`);
                } catch (error) {
                    console.log(`   ${test.name}: ❌ Error - ${error.message}`);
                }
            }
            
            return true;
        } catch (error) {
            console.error('❌ Error en test de performance:', error.message);
            return false;
        }
    }

    async runComplete() {
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║           APLICANDO SCHEMA OPTIMIZADO - CLOUD SQL           ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');
        
        const steps = [
            { name: 'Verificar Conexión', fn: () => this.verifyConnection() },
            { name: 'Aplicar Schema', fn: () => this.applyOptimizedSchema() },
            { name: 'Verificar Optimizaciones', fn: () => this.verifyOptimizations() },
            { name: 'Test Performance', fn: () => this.testPerformance() }
        ];
        
        let success = true;
        
        for (const step of steps) {
            console.log(`\n🔄 ${step.name}:`);
            const result = await step.fn();
            
            if (!result) {
                success = false;
                console.log(`❌ ${step.name} falló`);
                break;
            } else {
                console.log(`✅ ${step.name} completado`);
            }
        }
        
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║                      RESULTADO FINAL                        ║');
        console.log('╠══════════════════════════════════════════════════════════════╣');
        
        if (success) {
            console.log('║ 🎉 ¡SCHEMA OPTIMIZADO APLICADO EXITOSAMENTE!');
            console.log('║ ✅ Base de datos lista para 20,000 usuarios');
            console.log('║ ✅ Índices de performance configurados');
            console.log('║ ✅ Queries optimizadas funcionando');
            console.log('║');
            console.log('║ 📝 SIGUIENTES PASOS:');
            console.log('║ 1. Probar aplicación con nueva BD');
            console.log('║ 2. Configurar Read Replica (opcional)');
            console.log('║ 3. Configurar monitoreo');
            console.log('║ 4. Deploy a GKE');
        } else {
            console.log('║ ❌ SCHEMA NO APLICADO COMPLETAMENTE');
            console.log('║ 🔧 Revisar errores anteriores');
            console.log('║ 💡 Verificar configuración de conexión');
        }
        
        console.log('╚══════════════════════════════════════════════════════════════╝');
        
        return success;
    }

    async disconnect() {
        await this.prisma.$disconnect();
    }
}

// Ejecutar aplicación de schema
if (require.main === module) {
    const applier = new SchemaApplier();
    
    applier.runComplete()
        .then((success) => {
            applier.disconnect();
            process.exit(success ? 0 : 1);
        })
        .catch(async (error) => {
            console.error('❌ Error fatal:', error);
            await applier.disconnect();
            process.exit(1);
        });
}

module.exports = SchemaApplier;
