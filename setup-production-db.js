const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Script para configurar base de datos en tu instancia Cloud SQL existente
// Ejecutar: node setup-production-db.js

class ProductionDBSetup {
    constructor() {
        this.config = {
            connectionName: 'ai-academy-461719:us-central1:lms-production',
            publicIP: '34.122.241.221',
            projectId: 'ai-academy-461719',
            region: 'us-central1',
            instanceName: 'lms-production',
            databaseName: 'lms_platform',
            user: 'lms_user'
        };
    }

    async createDatabase() {
        console.log('🚀 Configurando base de datos en Cloud SQL...');
        console.log(`📊 Instancia: ${this.config.connectionName}`);
        console.log(`🌐 IP: ${this.config.publicIP}`);
        
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);

        try {
            // 1. Crear base de datos si no existe
            console.log('📚 Creando base de datos lms_platform...');
            
            const createDbCommand = `gcloud sql databases create ${this.config.databaseName} ` +
                                  `--instance=${this.config.instanceName} ` +
                                  `--charset=utf8mb4 ` +
                                  `--collation=utf8mb4_unicode_ci`;
            
            try {
                await execPromise(createDbCommand);
                console.log('✅ Base de datos creada exitosamente');
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log('✅ Base de datos ya existe');
                } else {
                    console.error('❌ Error creando base de datos:', error.message);
                }
            }

            // 2. Crear usuario si no existe
            console.log('👤 Configurando usuario lms_user...');
            
            // Generar password seguro
            const crypto = require('crypto');
            const password = crypto.randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + 'Aa1!';
            
            const createUserCommand = `gcloud sql users create ${this.config.user} ` +
                                    `--instance=${this.config.instanceName} ` +
                                    `--password="${password}"`;
            
            try {
                await execPromise(createUserCommand);
                console.log('✅ Usuario creado exitosamente');
                console.log(`🔑 Password generado: ${password}`);
                
                // Guardar configuración
                this.saveConfiguration(password);
                
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log('✅ Usuario ya existe');
                    console.log('⚠️  Usa la contraseña existente o cambiala con:');
                    console.log(`   gcloud sql users set-password ${this.config.user} --instance=${this.config.instanceName} --password="NUEVA_PASSWORD"`);
                } else {
                    console.error('❌ Error creando usuario:', error.message);
                }
            }

            // 3. Verificar permisos de acceso
            console.log('🔐 Verificando acceso autorizado...');
            
            const listNetworksCommand = `gcloud sql instances describe ${this.config.instanceName} --format="value(settings.ipConfiguration.authorizedNetworks[].value)"`;
            
            try {
                const { stdout } = await execPromise(listNetworksCommand);
                if (stdout.trim()) {
                    console.log('✅ Redes autorizadas configuradas');
                } else {
                    console.log('⚠️  No hay redes autorizadas. Configurando acceso temporal...');
                    
                    const authorizeCommand = `gcloud sql instances patch ${this.config.instanceName} --authorized-networks=0.0.0.0/0`;
                    await execPromise(authorizeCommand);
                    console.log('✅ Acceso temporal configurado (cambiar en producción)');
                }
            } catch (error) {
                console.log('⚠️  No se pudo verificar redes autorizadas:', error.message);
            }

            return true;
        } catch (error) {
            console.error('❌ Error en configuración:', error);
            return false;
        }
    }

    saveConfiguration(password) {
        const fs = require('fs');
        
        const envConfig = `# CONFIGURACIÓN CLOUD SQL GENERADA - ${new Date().toISOString()}

# ============ BASE DE DATOS CLOUD SQL ============
DATABASE_URL="mysql://${this.config.user}:${password}@${this.config.publicIP}:3306/${this.config.databaseName}?ssl-mode=REQUIRED"

# Para GKE (Cloud SQL Proxy)
DATABASE_URL_PRODUCTION="mysql://${this.config.user}:${password}@127.0.0.1:3306/${this.config.databaseName}"

# Con Unix Socket (máximo performance)
DATABASE_URL_SOCKET="mysql://${this.config.user}:${password}@localhost/${this.config.databaseName}?socket=/cloudsql/${this.config.connectionName}"

# Información de la instancia
CLOUD_SQL_CONNECTION_NAME="${this.config.connectionName}"
CLOUD_SQL_PUBLIC_IP="${this.config.publicIP}"
CLOUD_SQL_USER="${this.config.user}"
CLOUD_SQL_PASSWORD="${password}"
CLOUD_SQL_DATABASE="${this.config.databaseName}"
CLOUD_SQL_PROJECT_ID="${this.config.projectId}"
CLOUD_SQL_INSTANCE_NAME="${this.config.instanceName}"
`;

        fs.writeFileSync('.env.production', envConfig);
        console.log('💾 Configuración guardada en .env.production');
        
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║               CONFIGURACIÓN COMPLETADA                      ║');
        console.log('╠══════════════════════════════════════════════════════════════╣');
        console.log(`║ 🔗 Connection: ${this.config.connectionName}`);
        console.log(`║ 🌐 IP: ${this.config.publicIP}`);
        console.log(`║ 📚 Database: ${this.config.databaseName}`);
        console.log(`║ 👤 User: ${this.config.user}`);
        console.log(`║ 🔑 Password: ${password}`);
        console.log('║');
        console.log('║ 📝 SIGUIENTES PASOS:');
        console.log('║ 1. Copiar .env.production a .env');
        console.log('║ 2. Ejecutar: npm run db:setup');
        console.log('║ 3. Ejecutar: npm run cloud-sql:test');
        console.log('╚══════════════════════════════════════════════════════════════╝');
    }

    async setupPrismaSchema() {
        console.log('\n🏗️ Configurando schema de Prisma...');
        
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        
        try {
            // Generar cliente Prisma
            console.log('📦 Generando cliente Prisma...');
            await execPromise('npx prisma generate');
            console.log('✅ Cliente Prisma generado');
            
            // Aplicar schema a Cloud SQL
            console.log('🚀 Aplicando schema a Cloud SQL...');
            await execPromise('npx prisma db push');
            console.log('✅ Schema aplicado exitosamente');
            
            return true;
        } catch (error) {
            console.error('❌ Error aplicando schema:', error.message);
            return false;
        }
    }
}

// Ejecutar configuración
if (require.main === module) {
    const setup = new ProductionDBSetup();
    
    setup.createDatabase()
        .then(async (success) => {
            if (success) {
                console.log('\n🔄 ¿Aplicar schema de Prisma ahora? (y/n)');
                
                // En un entorno real, podrías usar readline para input
                // Por ahora, aplica automáticamente
                const shouldApplySchema = true;
                
                if (shouldApplySchema) {
                    await setup.setupPrismaSchema();
                }
                
                console.log('\n🎉 ¡Configuración de producción completada!');
                console.log('🔄 Siguiente: npm run cloud-sql:test');
            }
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = ProductionDBSetup;
