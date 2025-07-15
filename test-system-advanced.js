#!/usr/bin/env node

// 🧪 SISTEMA DE PRUEBAS AUTOMATIZADAS AVANZADAS
// Para LMS Platform - IA Pacific Labs
// Versión: 2.0.0

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(text, color = 'reset') {
  console.log(colors[color] + text + colors.reset);
}

// Estado global de pruebas
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

// 🔍 CLASE PRINCIPAL DE PRUEBAS
class AdvancedSystemTester {
  constructor() {
    this.startTime = Date.now();
    this.testCategories = [
      'environment',
      'dependencies', 
      'files',
      'database',
      'storage',
      'configuration',
      'integration'
    ];
  }

  async runAllTests() {
    colorLog('\n🧪 SISTEMA DE PRUEBAS AUTOMATIZADAS - PACIFIC LABS LMS', 'cyan');
    colorLog('═'.repeat(70), 'cyan');
    
    try {
      for (const category of this.testCategories) {
        await this.runCategoryTests(category);
      }
      
      await this.generateFinalReport();
      
    } catch (error) {
      colorLog(`\n❌ Error crítico en pruebas: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  async runCategoryTests(category) {
    colorLog(`\n📋 CATEGORÍA: ${category.toUpperCase()}`, 'yellow');
    colorLog('-'.repeat(50), 'yellow');
    
    switch (category) {
      case 'environment':
        await this.testEnvironment();
        break;
      case 'dependencies':
        await this.testDependencies();
        break;
      case 'files':
        await this.testFiles();
        break;
      case 'database':
        await this.testDatabase();
        break;
      case 'storage':
        await this.testStorage();
        break;
      case 'configuration':
        await this.testConfiguration();
        break;
      case 'integration':
        await this.testIntegration();
        break;
    }
  }

  // 🌍 PRUEBAS DE ENTORNO
  async testEnvironment() {
    // Node.js version
    await this.test('Node.js instalado', async () => {
      const { stdout } = await execAsync('node --version');
      const version = stdout.trim();
      const majorVersion = parseInt(version.split('.')[0].substring(1));
      
      if (majorVersion >= 16) {
        return { success: true, details: `Versión: ${version}` };
      } else {
        return { success: false, details: `Versión muy antigua: ${version}. Se requiere Node.js 16+` };
      }
    });

    // NPM version
    await this.test('NPM instalado', async () => {
      const { stdout } = await execAsync('npm --version');
      return { success: true, details: `Versión: ${stdout.trim()}` };
    });

    // Operating System
    await this.test('Sistema operativo compatible', async () => {
      const platform = process.platform;
      const arch = process.arch;
      return { 
        success: true, 
        details: `${platform} ${arch}`,
        warning: platform === 'win32' ? 'Windows detectado - algunos scripts pueden requerir ajustes' : null
      };
    });

    // Memory
    await this.test('Memoria disponible', async () => {
      const totalMem = Math.round(require('os').totalmem() / 1024 / 1024 / 1024);
      return { 
        success: totalMem >= 4, 
        details: `${totalMem} GB`,
        warning: totalMem < 8 ? 'Se recomienda al menos 8GB para mejor rendimiento' : null
      };
    });
  }

  // 📦 PRUEBAS DE DEPENDENCIAS
  async testDependencies() {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    await this.test('package.json existe', async () => {
      const exists = fs.existsSync(packageJsonPath);
      return { success: exists };
    });

    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Dependencias críticas
      const criticalDeps = [
        '@google-cloud/storage',
        '@prisma/client',
        'next',
        'react',
        'typescript'
      ];

      for (const dep of criticalDeps) {
        await this.test(`Dependencia ${dep}`, async () => {
          const hasInDeps = packageJson.dependencies && packageJson.dependencies[dep];
          const hasInDevDeps = packageJson.devDependencies && packageJson.devDependencies[dep];
          
          if (hasInDeps || hasInDevDeps) {
            const version = hasInDeps || hasInDevDeps;
            return { success: true, details: `Versión: ${version}` };
          } else {
            return { success: false, details: 'No instalada' };
          }
        });
      }

      // node_modules
      await this.test('node_modules instalado', async () => {
        const exists = fs.existsSync(path.join(process.cwd(), 'node_modules'));
        return { 
          success: exists,
          details: exists ? 'Dependencias instaladas' : 'Ejecutar: npm install'
        };
      });
    }

    // FFmpeg (opcional)
    await this.test('FFmpeg (opcional)', async () => {
      try {
        await execAsync('ffmpeg -version');
        return { success: true, details: 'Instalado y disponible' };
      } catch (error) {
        return { 
          success: false, 
          details: 'No instalado',
          warning: 'FFmpeg es necesario para procesamiento de video adaptivo'
        };
      }
    });
  }

  // 📁 PRUEBAS DE ARCHIVOS
  async testFiles() {
    const criticalFiles = [
      { path: '.env', description: 'Variables de entorno' },
      { path: 'google-cloud-credentials.json', description: 'Credenciales de Google Cloud' },
      { path: 'lib/video-analytics-system.js', description: 'Sistema de analytics' },
      { path: 'lib/video-optimization-system.js', description: 'Sistema de optimización' },
      { path: 'components/video-advanced-components.tsx', description: 'Componentes de video' },
      { path: 'hooks/use-video-advanced.ts', description: 'Hooks avanzados' },
      { path: 'upload-videos.js', description: 'Script de subida' },
      { path: 'video-admin-advanced.js', description: 'Administración avanzada' },
      { path: 'video-system-config.json', description: 'Configuración del sistema' }
    ];

    for (const file of criticalFiles) {
      await this.test(file.description, async () => {
        const exists = fs.existsSync(file.path);
        let details = exists ? 'Archivo encontrado' : 'Archivo faltante';
        
        if (exists) {
          const stats = fs.statSync(file.path);
          const sizeKB = Math.round(stats.size / 1024);
          details += ` (${sizeKB} KB)`;
        }
        
        return { 
          success: exists,
          details,
          warning: !exists && file.path === 'google-cloud-credentials.json' ? 
            'Necesario para Google Cloud Storage' : null
        };
      });
    }

    // Directorios necesarios
    const requiredDirs = ['videos', 'temp-processing', 'prisma'];
    
    for (const dir of requiredDirs) {
      await this.test(`Directorio ${dir}`, async () => {
        const exists = fs.existsSync(dir);
        return { 
          success: exists,
          details: exists ? 'Directorio existe' : 'Directorio faltante',
          warning: !exists ? `Crear con: mkdir ${dir}` : null
        };
      });
    }
  }

  // 🗄️ PRUEBAS DE BASE DE DATOS
  async testDatabase() {
    // Prisma schema
    await this.test('Esquema de Prisma', async () => {
      const schemaPath = path.join('prisma', 'schema.prisma');
      const exists = fs.existsSync(schemaPath);
      return { 
        success: exists,
        details: exists ? 'Schema encontrado' : 'Schema faltante'
      };
    });

    // Prisma client
    await this.test('Cliente de Prisma generado', async () => {
      try {
        await execAsync('npx prisma version');
        return { success: true, details: 'Prisma Client disponible' };
      } catch (error) {
        return { 
          success: false, 
          details: 'Ejecutar: npx prisma generate'
        };
      }
    });

    // Database connection
    await this.test('Conexión a base de datos', async () => {
      try {
        // Intentar conectar usando Prisma
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        await prisma.$connect();
        await prisma.$disconnect();
        
        return { success: true, details: 'Conexión exitosa' };
      } catch (error) {
        return { 
          success: false, 
          details: `Error: ${error.message}`,
          warning: 'Verificar DATABASE_URL en .env'
        };
      }
    });

    // Migraciones
    await this.test('Migraciones de video analytics', async () => {
      const migrationFile = path.join('prisma', 'migrations', 'add_video_analytics_system.sql');
      const exists = fs.existsSync(migrationFile);
      return { 
        success: exists,
        details: exists ? 'Migración disponible' : 'Migración faltante'
      };
    });
  }

  // ☁️ PRUEBAS DE ALMACENAMIENTO
  async testStorage() {
    // Variables de entorno de Google Cloud
    const requiredEnvVars = [
      'GOOGLE_CLOUD_PROJECT_ID',
      'GOOGLE_CLOUD_KEY_FILE', 
      'GOOGLE_CLOUD_BUCKET_NAME'
    ];

    for (const envVar of requiredEnvVars) {
      await this.test(`Variable ${envVar}`, async () => {
        const value = process.env[envVar];
        return { 
          success: !!value,
          details: value ? 'Configurada' : 'No configurada'
        };
      });
    }

    // Credenciales de Google Cloud
    await this.test('Credenciales de Google Cloud válidas', async () => {
      try {
        const { Storage } = require('@google-cloud/storage');
        const storage = new Storage({
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
          keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
        });

        // Test básico de conexión
        await storage.getBuckets();
        
        return { success: true, details: 'Credenciales válidas' };
      } catch (error) {
        return { 
          success: false, 
          details: `Error: ${error.message}`,
          warning: 'Verificar credenciales y configuración'
        };
      }
    });

    // Bucket de videos
    await this.test('Bucket de videos accesible', async () => {
      try {
        const { Storage } = require('@google-cloud/storage');
        const storage = new Storage({
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
          keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
        });

        const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);
        const [exists] = await bucket.exists();
        
        return { 
          success: exists,
          details: exists ? 'Bucket accesible' : 'Bucket no encontrado'
        };
      } catch (error) {
        return { 
          success: false, 
          details: `Error: ${error.message}`
        };
      }
    });
  }

  // ⚙️ PRUEBAS DE CONFIGURACIÓN
  async testConfiguration() {
    // Archivo de configuración del sistema
    await this.test('Configuración del sistema de videos', async () => {
      const configPath = 'video-system-config.json';
      const exists = fs.existsSync(configPath);
      
      if (exists) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          const hasRequiredFields = config.version && config.videoProcessing && config.storage;
          
          return { 
            success: hasRequiredFields,
            details: hasRequiredFields ? `Versión: ${config.version}` : 'Configuración incompleta'
          };
        } catch (error) {
          return { success: false, details: 'JSON inválido' };
        }
      }
      
      return { success: false, details: 'Archivo no encontrado' };
    });

    // Configuraciones de video
    const videoConfigs = ['videos-config-leccion-1.json', 'videos-config-leccion-2.json'];
    
    for (const config of videoConfigs) {
      await this.test(`Configuración ${config}`, async () => {
        const exists = fs.existsSync(config);
        
        if (exists) {
          try {
            const configData = JSON.parse(fs.readFileSync(config, 'utf8'));
            const isArray = Array.isArray(configData);
            const hasValidEntries = isArray && configData.length > 0;
            
            return { 
              success: hasValidEntries,
              details: hasValidEntries ? `${configData.length} videos configurados` : 'Configuración vacía'
            };
          } catch (error) {
            return { success: false, details: 'JSON inválido' };
          }
        }
        
        return { success: false, details: 'Archivo no encontrado' };
      });
    }
  }

  // 🔗 PRUEBAS DE INTEGRACIÓN
  async testIntegration() {
    // Test del sistema de analytics
    await this.test('Sistema de analytics', async () => {
      try {
        const { analytics } = require('./lib/video-analytics-system.js');
        
        // Test básico de funcionalidad
        const testEvent = await analytics.trackVideoEvent(
          'test_user', 
          'test_chapter', 
          'test_event', 
          Date.now(),
          { test: true }
        );
        
        return { 
          success: !!testEvent,
          details: 'Sistema funcional'
        };
      } catch (error) {
        return { 
          success: false, 
          details: `Error: ${error.message}`
        };
      }
    });

    // Test del sistema de optimización
    await this.test('Sistema de optimización', async () => {
      try {
        const { analyzeStorage } = require('./lib/video-optimization-system.js');
        
        // Test básico (sin ejecutar análisis real)
        const isFunction = typeof analyzeStorage === 'function';
        
        return { 
          success: isFunction,
          details: isFunction ? 'Sistema disponible' : 'Sistema no funcional'
        };
      } catch (error) {
        return { 
          success: false, 
          details: `Error: ${error.message}`
        };
      }
    });

    // Test de hooks de React
    await this.test('Hooks de React', async () => {
      try {
        const hooksModule = require('./hooks/use-video-advanced.ts');
        const hasHooks = hooksModule.useVideoProgress && hooksModule.useAdaptivePlayer;
        
        return { 
          success: hasHooks,
          details: hasHooks ? 'Hooks disponibles' : 'Hooks faltantes'
        };
      } catch (error) {
        return { 
          success: false, 
          details: `Error: ${error.message}`
        };
      }
    });

    // Test de componentes
    await this.test('Componentes de video', async () => {
      try {
        const componentsExist = fs.existsSync('./components/video-advanced-components.tsx');
        
        return { 
          success: componentsExist,
          details: componentsExist ? 'Componentes disponibles' : 'Componentes faltantes'
        };
      } catch (error) {
        return { 
          success: false, 
          details: `Error: ${error.message}`
        };
      }
    });
  }

  // 🧪 MÉTODO AUXILIAR PARA EJECUTAR PRUEBAS
  async test(name, testFunction) {
    testResults.total++;
    
    try {
      const result = await testFunction();
      
      if (result.success) {
        testResults.passed++;
        colorLog(`✅ ${name}`, 'green');
        if (result.details) {
          console.log(`   ${result.details}`);
        }
        if (result.warning) {
          testResults.warnings++;
          colorLog(`   ⚠️  ${result.warning}`, 'yellow');
        }
      } else {
        testResults.failed++;
        colorLog(`❌ ${name}`, 'red');
        if (result.details) {
          console.log(`   ${result.details}`);
        }
        testResults.errors.push(`${name}: ${result.details || 'Error desconocido'}`);
        
        if (result.warning) {
          colorLog(`   💡 ${result.warning}`, 'cyan');
        }
      }
    } catch (error) {
      testResults.failed++;
      colorLog(`❌ ${name}`, 'red');
      console.log(`   Error: ${error.message}`);
      testResults.errors.push(`${name}: ${error.message}`);
    }
  }

  // 📊 GENERAR REPORTE FINAL
  async generateFinalReport() {
    const endTime = Date.now();
    const duration = Math.round((endTime - this.startTime) / 1000);
    
    colorLog('\n📊 REPORTE FINAL DE PRUEBAS', 'cyan');
    colorLog('═'.repeat(50), 'cyan');
    
    console.log(`⏱️  Duración: ${duration} segundos`);
    console.log(`📋 Total de pruebas: ${testResults.total}`);
    colorLog(`✅ Exitosas: ${testResults.passed}`, 'green');
    colorLog(`❌ Fallidas: ${testResults.failed}`, 'red');
    colorLog(`⚠️  Advertencias: ${testResults.warnings}`, 'yellow');
    
    const successRate = Math.round((testResults.passed / testResults.total) * 100);
    console.log(`📈 Tasa de éxito: ${successRate}%`);
    
    if (testResults.failed > 0) {
      colorLog('\n🚨 ERRORES ENCONTRADOS:', 'red');
      testResults.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }
    
    colorLog('\n💡 RECOMENDACIONES:', 'cyan');
    
    if (successRate >= 90) {
      colorLog('🎉 ¡Excelente! El sistema está listo para producción.', 'green');
    } else if (successRate >= 70) {
      colorLog('⚠️  El sistema funciona pero tiene algunos problemas menores.', 'yellow');
      console.log('   Revisa las advertencias y errores antes de continuar.');
    } else {
      colorLog('❌ El sistema tiene problemas críticos que deben resolverse.', 'red');
      console.log('   Ejecuta setup-complete-advanced.bat para configurar automáticamente.');
    }
    
    colorLog('\n📚 DOCUMENTACIÓN:', 'cyan');
    console.log('   • SISTEMA_VIDEOS_GUIA_COMPLETA.md - Guía completa');
    console.log('   • GCS_IMPLEMENTATION_SUMMARY.md - Resumen de implementación');
    console.log('   • GOOGLE_CLOUD_SETUP.md - Configuración de Google Cloud');
    
    colorLog('\n🚀 PRÓXIMOS PASOS:', 'cyan');
    console.log('   1. Resolver errores críticos si los hay');
    console.log('   2. Ejecutar: npm run dev');
    console.log('   3. Usar upload-videos-menu.bat para subir videos');
    console.log('   4. Usar video-admin-advanced.js para administración');
    
    // Guardar reporte en archivo
    const reportPath = `test-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      duration: duration,
      results: testResults,
      successRate: successRate
    }, null, 2));
    
    colorLog(`\n💾 Reporte guardado en: ${reportPath}`, 'cyan');
    
    return successRate >= 70;
  }
}

// 🚀 EJECUTAR PRUEBAS
async function main() {
  const tester = new AdvancedSystemTester();
  
  try {
    const success = await tester.runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    colorLog(`\n❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { AdvancedSystemTester };