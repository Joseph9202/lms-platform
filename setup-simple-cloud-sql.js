const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Script simplificado para configurar Cloud SQL con auto-escalado
// Ejecutar: node setup-simple-cloud-sql.js

class SimpleCloudSQLSetup {
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
        console.log('🚀 Configurando Cloud SQL con auto-escalado...');
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
            
            // Generar password seguro pero simple
            const crypto = require('crypto');
            const password = crypto.randomBytes(16).toString('base64').replace(/[^a-zA-Z0-9]/g, '') + 'Aa1!';
            
            const createUserCommand = `gcloud sql users create ${this.config.user} ` +
                                    `--instance=${this.config.instanceName} ` +
                                    `--password="${password}"`;
            
            try {
                await execPromise(createUserCommand);
                console.log('✅ Usuario creado exitosamente');
                console.log(`🔑 Password generado: ${password}`);
                
                // Guardar configuración simple
                this.saveSimpleConfiguration(password);
                
            } catch (error) {
                if (error.message.includes('already exists')) {
                    console.log('✅ Usuario ya existe');
                    console.log('⚠️  Usa la contraseña existente o cambiala con:');
                    console.log(`   gcloud sql users set-password ${this.config.user} --instance=${this.config.instanceName} --password="NUEVA_PASSWORD"`);
                } else {
                    console.error('❌ Error creando usuario:', error.message);
                }
            }

            return true;
        } catch (error) {
            console.error('❌ Error en configuración:', error);
            return false;
        }
    }

    saveSimpleConfiguration(password) {
        const fs = require('fs');
        
        const envConfig = `# CONFIGURACIÓN CLOUD SQL SIMPLE - ${new Date().toISOString()}

# ============ BASE DE DATOS CLOUD SQL ============
# Para desarrollo
DATABASE_URL="mysql://${this.config.user}:${password}@${this.config.publicIP}:3306/${this.config.databaseName}?ssl-mode=REQUIRED"

# Para producción con GKE
DATABASE_URL_PRODUCTION="mysql://${this.config.user}:${password}@127.0.0.1:3306/${this.config.databaseName}"

# Información de la instancia
CLOUD_SQL_CONNECTION_NAME="${this.config.connectionName}"
CLOUD_SQL_PUBLIC_IP="${this.config.publicIP}"
CLOUD_SQL_USER="${this.config.user}"
CLOUD_SQL_PASSWORD="${password}"
CLOUD_SQL_DATABASE="${this.config.databaseName}"
CLOUD_SQL_PROJECT_ID="${this.config.projectId}"

# ============ MANTENER CONFIGURACIÓN EXISTENTE ============
# Copiar de tu .env actual:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
# CLERK_SECRET_KEY=
# GOOGLE_CLOUD_PROJECT_ID=
# GOOGLE_CLOUD_BUCKET_NAME=
# STRIPE_API_KEY=
# MUX_TOKEN_ID=
# UPLOADTHING_SECRET=
`;

        fs.writeFileSync('.env.production', envConfig);
        console.log('💾 Configuración simple guardada en .env.production');
        
        console.log('\n╔══════════════════════════════════════════════════════════════╗');
        console.log('║               CONFIGURACIÓN SIMPLE COMPLETADA               ║');
        console.log('╠══════════════════════════════════════════════════════════════╣');
        console.log(`║ 🔗 Connection: ${this.config.connectionName}`);
        console.log(`║ 🌐 IP: ${this.config.publicIP}`);
        console.log(`║ 📚 Database: ${this.config.databaseName}`);
        console.log(`║ 👤 User: ${this.config.user}`);
        console.log(`║ 🔑 Password: ${password}`);
        console.log('║');
        console.log('║ 📝 SIGUIENTES PASOS SIMPLES:');
        console.log('║ 1. Copiar .env.production a .env');
        console.log('║ 2. Ejecutar: npm run db:migrate');
        console.log('║ 3. Ejecutar: npm run dev');
        console.log('║ 4. ¡Listo para empezar a crecer!');
        console.log('╚══════════════════════════════════════════════════════════════╝');
    }

    async applySimpleSchema() {
        console.log('\n🏗️ Aplicando schema básico escalable...');
        
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);
        
        try {
            // Generar cliente Prisma
            console.log('📦 Generando cliente Prisma...');
            await execPromise('npx prisma generate');
            console.log('✅ Cliente Prisma generado');
            
            // Aplicar schema básico
            console.log('🚀 Aplicando schema escalable...');
            await execPromise('npx prisma db push');
            console.log('✅ Schema aplicado - listo para escalar automáticamente');
            
            return true;
        } catch (error) {
            console.error('❌ Error aplicando schema:', error.message);
            return false;
        }
    }
}

// Ejecutar configuración simple
if (require.main === module) {
    const setup = new SimpleCloudSQLSetup();
    
    setup.createDatabase()
        .then(async (success) => {
            if (success) {
                console.log('\n🔄 Aplicando schema escalable...');
                await setup.applySimpleSchema();
                
                console.log('\n🎉 ¡Cloud SQL configurado para auto-escalado!');
                console.log('📈 Empezará pequeño y crecerá con tus estudiantes');
                console.log('🔄 Siguiente: copiar .env.production a .env y ejecutar npm run dev');
            }
        })
        .catch((error) => {
            console.error('❌ Error fatal:', error);
            process.exit(1);
        });
}

module.exports = SimpleCloudSQLSetup;
