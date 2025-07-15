const { PrismaClient } = require('@prisma/client');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Script para migrar datos de la BD actual a Cloud SQL
// Ejecutar: node cloud-sql/migrate-data.js

class DataMigration {
    constructor() {
        this.sourceDB = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL_SOURCE || process.env.DATABASE_URL
                }
            }
        });
        
        this.targetDB = new PrismaClient({
            datasources: {
                db: {
                    url: process.env.DATABASE_URL_TARGET || process.env.DATABASE_URL_CLOUD_SQL
                }
            }
        });
    }

    async validateConnection() {
        console.log('🔍 Validando conexiones...');
        
        try {
            await this.sourceDB.$connect();
            console.log('✅ Conexión fuente establecida');
        } catch (error) {
            console.error('❌ Error conectando a BD fuente:', error.message);
            process.exit(1);
        }

        try {
            await this.targetDB.$connect();
            console.log('✅ Conexión destino (Cloud SQL) establecida');
        } catch (error) {
            console.error('❌ Error conectando a Cloud SQL:', error.message);
            process.exit(1);
        }
    }

    async getDataCounts() {
        console.log('📊 Contando registros en BD fuente...');
        
        const counts = {
            courses: await this.sourceDB.course.count(),
            categories: await this.sourceDB.category.count(),
            chapters: await this.sourceDB.chapter.count(),
            attachments: await this.sourceDB.attachment.count(),
            userProgress: await this.sourceDB.userProgress.count(),
            purchases: await this.sourceDB.purchase.count(),
            stripeCustomers: await this.sourceDB.stripeCustomer.count(),
            muxData: await this.sourceDB.muxData.count()
        };

        console.log('📈 Registros a migrar:');
        Object.entries(counts).forEach(([table, count]) => {
            console.log(`   ${table}: ${count}`);
        });

        return counts;
    }

    async migrateTable(tableName, batchSize = 100) {
        console.log(`🚚 Migrando ${tableName}...`);
        
        const sourceCount = await this.sourceDB[tableName].count();
        let migrated = 0;
        let errors = 0;

        for (let offset = 0; offset < sourceCount; offset += batchSize) {
            try {
                const batch = await this.sourceDB[tableName].findMany({
                    skip: offset,
                    take: batchSize
                });

                if (batch.length === 0) break;

                // Usar createMany para mejor performance
                await this.targetDB[tableName].createMany({
                    data: batch,
                    skipDuplicates: true
                });

                migrated += batch.length;
                console.log(`   ✅ ${migrated}/${sourceCount} registros migrados`);
            } catch (error) {
                errors++;
                console.error(`   ❌ Error en lote ${offset}: ${error.message}`);
                
                // Si createMany falla, intentar uno por uno
                try {
                    const batch = await this.sourceDB[tableName].findMany({
                        skip: offset,
                        take: batchSize
                    });

                    for (const record of batch) {
                        try {
                            await this.targetDB[tableName].create({
                                data: record
                            });
                            migrated++;
                        } catch (individualError) {
                            console.error(`     ❌ Error individual: ${individualError.message}`);
                        }
                    }
                } catch (retryError) {
                    console.error(`   ❌ Error en retry: ${retryError.message}`);
                }
            }
        }

        console.log(`✅ ${tableName} completado: ${migrated} migrados, ${errors} errores\n`);
        return { migrated, errors };
    }

    async migrate() {
        console.log('🚀 Iniciando migración de datos a Cloud SQL...\n');
        
        await this.validateConnection();
        const sourceCounts = await this.getDataCounts();
        
        console.log('\n⚠️  ADVERTENCIA: Esto sobreescribirá datos en Cloud SQL.');
        const confirm = process.argv.includes('--confirm');
        
        if (!confirm) {
            console.log('❌ Usa --confirm para proceder con la migración');
            console.log('   Ejemplo: node cloud-sql/migrate-data.js --confirm');
            process.exit(0);
        }

        console.log('\n🚀 Iniciando migración...\n');
        const startTime = Date.now();

        // Migrar en orden de dependencias
        const migrationOrder = [
            'category',
            'course',
            'chapter',
            'attachment',
            'muxData',
            'userProgress',
            'purchase',
            'stripeCustomer'
        ];

        const results = {};

        for (const table of migrationOrder) {
            if (sourceCounts[table + 's'] || sourceCounts[table]) {
                results[table] = await this.migrateTable(table);
            }
        }

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║                     MIGRACIÓN COMPLETADA                    ║');
        console.log('╠══════════════════════════════════════════════════════════════╣');
        console.log(`║ ⏱️  Duración: ${duration.toFixed(2)} segundos`);
        console.log('║');
        
        Object.entries(results).forEach(([table, result]) => {
            console.log(`║ ${table}: ${result.migrated} migrados, ${result.errors} errores`);
        });
        
        console.log('║');
        console.log('║ 📝 SIGUIENTES PASOS:');
        console.log('║ 1. Verificar datos en Cloud SQL');
        console.log('║ 2. Actualizar DATABASE_URL en .env');
        console.log('║ 3. Probar aplicación con nueva BD');
        console.log('║ 4. Hacer backup de BD original');
        console.log('╚══════════════════════════════════════════════════════════════╝');
    }

    async disconnect() {
        await this.sourceDB.$disconnect();
        await this.targetDB.$disconnect();
    }
}

// Ejecutar migración
if (require.main === module) {
    const migration = new DataMigration();
    
    migration.migrate()
        .then(() => migration.disconnect())
        .catch(async (error) => {
            console.error('❌ Error en migración:', error);
            await migration.disconnect();
            process.exit(1);
        });
}

module.exports = DataMigration;
