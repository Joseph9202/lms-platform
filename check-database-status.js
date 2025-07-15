const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Script para verificar el estado actual de tu base de datos Cloud SQL
// Ejecutar: node check-database-status.js

class DatabaseChecker {
    constructor() {
        // Tu configuración específica detectada
        this.config = {
            connectionName: 'ai-academy-461719:us-central1:lms-production',
            publicIP: '34.122.241.221',
            projectId: 'ai-academy-461719'
        };
        
        // Intentar conexión con diferentes configuraciones
        this.connectionStrings = [
            process.env.DATABASE_URL,
            process.env.DATABASE_URL_PRODUCTION,
            `mysql://root:@${this.config.publicIP}:3306/lms_platform?ssl-mode=REQUIRED`,
            `mysql://lms_user:@${this.config.publicIP}:3306/lms_platform?ssl-mode=REQUIRED`
        ].filter(Boolean);
    }

    async checkDatabaseExists() {
        console.log('🔍 Verificando si la base de datos existe...');
        
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        
        try {
            // Listar bases de datos en la instancia
            const listDbCommand = `gcloud sql databases list --instance=lms-production --format="value(name)"`;
            const { stdout } = await execPromise(listDbCommand);
            
            const databases = stdout.trim().split('\n').filter(db => db.length > 0);
            
            console.log('📊 Bases de datos encontradas:');
            databases.forEach(db => {
                console.log(`   - ${db}`);
            });
            
            const hasLmsPlatform = databases.includes('lms_platform');
            
            if (hasLmsPlatform) {
                console.log('✅ Base de datos "lms_platform" existe');
                return true;
            } else {
                console.log('❌ Base de datos "lms_platform" NO existe');
                console.log('💡 Necesitas ejecutar la configuración primero');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Error verificando bases de datos:', error.message);
            console.log('💡 Asegúrate de tener gcloud configurado y permisos');
            return false;
        }
    }

    async tryConnection(connectionString, label) {
        console.log(`🔍 Probando conexión ${label}...`);
        
        try {
            const prisma = new PrismaClient({
                datasources: {
                    db: { url: connectionString }
                }
            });
            
            await prisma.$connect();
            console.log(`✅ Conexión ${label} exitosa`);
            
            // Probar query básica
            const result = await prisma.$queryRaw`SELECT DATABASE() as current_db, VERSION() as version`;
            console.log(`   Database: ${result[0].current_db || 'No seleccionada'}`);
            console.log(`   MySQL Version: ${result[0].version}`);
            
            await prisma.$disconnect();
            return { success: true, prisma: null };
            
        } catch (error) {
            console.log(`❌ Conexión ${label} falló: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    async checkTablesAndData() {
        console.log('\n🔍 Verificando tablas y datos...');
        
        // Intentar con las diferentes configuraciones de conexión
        for (let i = 0; i < this.connectionStrings.length; i++) {
            const connectionString = this.connectionStrings[i];
            const label = `(${i + 1}/${this.connectionStrings.length})`;
            
            try {
                const prisma = new PrismaClient({
                    datasources: {
                        db: { url: connectionString }
                    }
                });
                
                await prisma.$connect();
                console.log(`✅ Conectado con configuración ${label}`);
                
                // Verificar si las tablas existen
                const tables = await prisma.$queryRaw`
                    SELECT TABLE_NAME 
                    FROM information_schema.TABLES 
                    WHERE TABLE_SCHEMA = DATABASE()
                `;
                
                if (tables.length === 0) {
                    console.log('📋 Base de datos vacía - sin tablas');
                    console.log('💡 Necesitas aplicar el schema Prisma');
                    await prisma.$disconnect();
                    return { hasData: false, needsSchema: true };
                }
                
                console.log(`📊 Encontradas ${tables.length} tablas:`);
                tables.forEach(table => {
                    console.log(`   - ${table.TABLE_NAME}`);
                });
                
                // Contar registros en tablas principales
                const counts = {};
                const mainTables = ['Course', 'Category', 'Chapter', 'UserProgress', 'Purchase'];
                
                for (const tableName of mainTables) {
                    const tableExists = tables.some(t => t.TABLE_NAME.toLowerCase() === tableName.toLowerCase());
                    if (tableExists) {
                        try {
                            const count = await prisma[tableName.toLowerCase()].count();
                            counts[tableName] = count;
                        } catch (error) {
                            counts[tableName] = 'Error';
                        }
                    } else {
                        counts[tableName] = 'No existe';
                    }
                }
                
                console.log('\n📈 Registros por tabla:');
                Object.entries(counts).forEach(([table, count]) => {
                    const status = count === 0 ? '(vacía)' : 
                                  count === 'No existe' ? '(no existe)' :
                                  count === 'Error' ? '(error)' : '';
                    console.log(`   ${table}: ${count} ${status}`);
                });
                
                const hasData = Object.values(counts).some(count => typeof count === 'number' && count > 0);
                
                if (hasData) {
                    console.log('\n✅ Base de datos tiene datos existentes');
                } else {
                    console.log('\n📋 Base de datos existe pero está vacía');
                }
                
                await prisma.$disconnect();
                return { hasData, needsSchema: false, counts };
                
            } catch (error) {
                console.log(`❌ Error con configuración ${label}: ${error.message}`);
                continue;
            }
        }
        
        console.log('❌ No se pudo conectar con ninguna configuración');
        return { hasData: false, needsSchema: true, error: 'Sin conexión' };
    }

    async runCompleteCheck() {
        console.log('╔══════════════════════════════════════════════════════════════╗');
        console.log('║              VERIFICACIÓN DE BASE DE DATOS                  ║');
        console.log('╚══════════════════════════════════════════════════════════════╝\n');
        
        console.log('🎯 Tu instancia Cloud SQL:');
        console.log(`   Connection: ${this.config.connectionName}`);
        console.log(`   IP: ${this.config.publicIP}\n`);
        
        // 1. Verificar si la base de datos existe
        const dbExists = await this.checkDatabaseExists();
        
        if (!dbExists) {
            console.log('\n╔══════════════════════════════════════════════════════════════╗');
            console.log('║                     RESULTADO FINAL                         ║');
            console.log('╠══════════════════════════════════════════════════════════════╣');
            console.log('║ ❌ Base de datos NO configurada                             ║');
            console.log('║                                                              ║');
            console.log('║ 📝 SIGUIENTES PASOS:                                        ║');
            console.log('║ 1. Ejecutar: START-HERE.bat                                 ║');
            console.log('║ 2. O ejecutar: npm run cloud-sql:setup                     ║');
            console.log('║                                                              ║');
            console.log('║ ⏱️  Tiempo estimado: 3-5 minutos                           ║');
            console.log('╚══════════════════════════════════════════════════════════════╝');
            return;
        }
        
        // 2. Verificar conexión y datos
        const result = await this.checkTablesAndData();
        
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║                     RESULTADO FINAL                         ║');
        console.log('╠══════════════════════════════════════════════════════════════╣');
        
        if (result.hasData) {
            console.log('║ ✅ Base de datos configurada con datos                      ║');
            console.log('║ ✅ Tablas existentes con registros                          ║');
            console.log('║                                                              ║');
            console.log('║ 🎉 ¡Todo listo para usar!                                   ║');
            console.log('║                                                              ║');
            console.log('║ 📝 SIGUIENTES PASOS:                                        ║');
            console.log('║ 1. Verificar variables en .env                              ║');
            console.log('║ 2. Ejecutar: npm run dev                                    ║');
            console.log('║ 3. Ver datos: npm run db:studio                             ║');
        } else if (result.needsSchema) {
            console.log('║ ⚠️  Base de datos existe pero sin schema                    ║');
            console.log('║                                                              ║');
            console.log('║ 📝 SIGUIENTES PASOS:                                        ║');
            console.log('║ 1. Ejecutar: npm run db:migrate                             ║');
            console.log('║ 2. O ejecutar configuración completa: START-HERE.bat       ║');
        } else {
            console.log('║ ⚠️  Base de datos existe pero está vacía                    ║');
            console.log('║                                                              ║');
            console.log('║ 📝 SIGUIENTES PASOS:                                        ║');
            console.log('║ 1. Aplicar schema: npm run db:migrate                       ║');
            console.log('║ 2. Agregar cursos: node add-courses.js                      ║');
            console.log('║ 3. Ver resultado: npm run db:studio                         ║');
        }
        
        console.log('╚══════════════════════════════════════════════════════════════╝');
    }
}

// Ejecutar verificación
if (require.main === module) {
    const checker = new DatabaseChecker();
    
    checker.runCompleteCheck()
        .catch((error) => {
            console.error('\n❌ Error fatal:', error);
            console.log('\n💡 Soluciones:');
            console.log('   1. Verificar que gcloud esté configurado');
            console.log('   2. Verificar permisos en Cloud SQL');
            console.log('   3. Ejecutar configuración: START-HERE.bat');
            process.exit(1);
        });
}

module.exports = DatabaseChecker;
