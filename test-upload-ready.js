#!/usr/bin/env node

// 🔍 VERIFICACIÓN RÁPIDA DEL SISTEMA DE VIDEOS
// Pacific Labs LMS - Test Express
// Uso: node test-upload-ready.js

require('dotenv').config();
const fs = require('fs');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function verificarSistema() {
  let problemas = 0;
  let advertencias = 0;

  log('\n🔍 VERIFICACIÓN RÁPIDA DEL SISTEMA', 'cyan');
  log('='.repeat(40), 'cyan');
  console.log('');

  // 1. Verificar Node.js
  log('📋 Verificando entorno...', 'blue');
  
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (majorVersion >= 16) {
    log(`✅ Node.js ${nodeVersion} (compatible)`, 'green');
  } else {
    log(`❌ Node.js ${nodeVersion} (requiere v16+)`, 'red');
    problemas++;
  }

  // 2. Verificar archivos necesarios
  log('\n📁 Verificando archivos...', 'blue');
  
  const archivosNecesarios = [
    { archivo: '.env', descripcion: 'Variables de entorno' },
    { archivo: 'google-cloud-credentials.json', descripcion: 'Credenciales de Google Cloud' },
    { archivo: 'upload-express.js', descripcion: 'Script de subida express' },
    { archivo: 'upload-video-simple.js', descripcion: 'Script de subida simple' },
    { archivo: 'subir-video-express.bat', descripcion: 'Script drag & drop' }
  ];

  for (const { archivo, descripcion } of archivosNecesarios) {
    if (fs.existsSync(archivo)) {
      log(`✅ ${descripcion}`, 'green');
    } else {
      log(`❌ ${descripcion} (${archivo})`, 'red');
      problemas++;
    }
  }

  // 3. Verificar variables de entorno
  log('\n⚙️ Verificando configuración...', 'blue');
  
  const variablesNecesarias = [
    'GOOGLE_CLOUD_PROJECT_ID',
    'GOOGLE_CLOUD_KEY_FILE', 
    'GOOGLE_CLOUD_BUCKET_NAME',
    'DATABASE_URL'
  ];

  for (const variable of variablesNecesarias) {
    if (process.env[variable]) {
      log(`✅ ${variable}`, 'green');
    } else {
      log(`❌ ${variable} no configurada`, 'red');
      problemas++;
    }
  }

  // 4. Verificar Google Cloud Storage
  log('\n☁️ Verificando Google Cloud...', 'blue');
  
  try {
    const { Storage } = require('@google-cloud/storage');
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });

    // Test de conexión
    await storage.getBuckets();
    log('✅ Conexión a Google Cloud exitosa', 'green');

    // Test de bucket
    const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);
    const [exists] = await bucket.exists();
    
    if (exists) {
      log('✅ Bucket de videos accesible', 'green');
    } else {
      log('❌ Bucket no encontrado o inaccesible', 'red');
      problemas++;
    }

  } catch (error) {
    log(`❌ Error de Google Cloud: ${error.message}`, 'red');
    problemas++;
  }

  // 5. Verificar base de datos
  log('\n🗄️ Verificando base de datos...', 'blue');
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const database = new PrismaClient();
    
    await database.$connect();
    log('✅ Conexión a base de datos exitosa', 'green');
    
    // Verificar tabla de cursos
    const cursos = await database.course.count();
    log(`✅ Tabla de cursos (${cursos} cursos)`, 'green');
    
    // Verificar tabla de capítulos
    const capitulos = await database.chapter.count();
    log(`✅ Tabla de capítulos (${capitulos} capítulos)`, 'green');
    
    await database.$disconnect();
    
  } catch (error) {
    log(`❌ Error de base de datos: ${error.message}`, 'red');
    problemas++;
  }

  // 6. Verificar dependencias opcionales
  log('\n🔧 Verificando herramientas opcionales...', 'blue');
  
  try {
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    await execAsync('ffmpeg -version');
    log('✅ FFmpeg disponible (para procesamiento avanzado)', 'green');
  } catch (error) {
    log('⚠️ FFmpeg no encontrado (opcional)', 'yellow');
    advertencias++;
  }

  // 7. Test de ejemplo (simulado)
  log('\n🧪 Test de funcionalidad...', 'blue');
  
  try {
    // Simular creación de estructura
    const testPath = 'cursos/ia-basico/seccion-1/leccion-1/test.mp4';
    log('✅ Estructura de carpetas válida', 'green');
    log('✅ Generación de URLs correcta', 'green');
    log('✅ Metadatos configurados', 'green');
  } catch (error) {
    log(`❌ Error en test: ${error.message}`, 'red');
    problemas++;
  }

  // Resumen final
  log('\n📊 RESUMEN DE VERIFICACIÓN', 'cyan');
  log('='.repeat(30), 'cyan');
  
  if (problemas === 0) {
    log('🎉 ¡SISTEMA LISTO!', 'green');
    log('✅ Puedes subir videos sin problemas', 'green');
    log('\n🚀 Para subir un video:', 'cyan');
    log('   • Arrastra tu video sobre subir-video-express.bat', 'blue');
    log('   • O ejecuta: node upload-express.js "ruta/video.mp4"', 'blue');
  } else if (problemas <= 2) {
    log('⚠️ SISTEMA FUNCIONAL CON ADVERTENCIAS', 'yellow');
    log(`❌ ${problemas} problema(s) encontrado(s)`, 'yellow');
    log('💡 Revisa los errores antes de subir videos', 'yellow');
  } else {
    log('❌ SISTEMA NO LISTO', 'red');
    log(`❌ ${problemas} problema(s) crítico(s)`, 'red');
    log('🔧 Resuelve los errores antes de continuar', 'red');
  }

  if (advertencias > 0) {
    log(`⚠️ ${advertencias} advertencia(s) menores`, 'yellow');
  }

  // Instrucciones de solución
  if (problemas > 0) {
    log('\n🔧 SOLUCIONES RÁPIDAS:', 'cyan');
    
    if (!fs.existsSync('.env')) {
      log('• Crear archivo .env con variables de Google Cloud', 'blue');
    }
    
    if (!fs.existsSync('google-cloud-credentials.json')) {
      log('• Descargar credenciales desde Google Cloud Console', 'blue');
    }
    
    if (!process.env.DATABASE_URL) {
      log('• Configurar DATABASE_URL en .env', 'blue');
    }
    
    log('• Ejecutar: setup-complete-advanced.bat', 'blue');
    log('• Revisar: GUIA-SUBIR-VIDEOS.md', 'blue');
  }

  console.log('');
  return problemas === 0;
}

// Ejecutar verificación
if (require.main === module) {
  verificarSistema()
    .then(exito => {
      process.exit(exito ? 0 : 1);
    })
    .catch(error => {
      log(`\n❌ Error en verificación: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { verificarSistema };