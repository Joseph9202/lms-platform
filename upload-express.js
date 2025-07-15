#!/usr/bin/env node

// 🎬 SCRIPT ULTRA SIMPLE - ARRASTRA Y SUELTA TU VIDEO
// Pacific Labs LMS - Subida Express
// Uso: Arrastra tu video sobre este archivo o ejecuta desde línea de comandos

const { Storage } = require('@google-cloud/storage');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

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

// Configuración rápida por defecto
const CONFIG_RAPIDA = {
  curso: 'ia-basico',
  seccion: '1',
  leccion: '1',
  autoTitulo: true, // Usar nombre del archivo como título
  autoPublicar: true // Publicar automáticamente
};

async function subirVideoRapido(rutaVideo, config = CONFIG_RAPIDA) {
  try {
    // Verificar archivo
    if (!fs.existsSync(rutaVideo)) {
      throw new Error('El archivo no existe');
    }

    const nombreArchivo = path.basename(rutaVideo);
    const extension = path.extname(rutaVideo).toLowerCase();
    
    // Verificar formato
    if (!['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(extension)) {
      throw new Error('Formato no soportado. Usa: mp4, avi, mov, mkv, webm');
    }

    const tamaño = fs.statSync(rutaVideo).size;
    const tamañoMB = (tamaño / (1024 * 1024)).toFixed(2);

    log('\n🎬 SUBIDA EXPRESS DE VIDEO', 'cyan');
    log('='.repeat(40), 'cyan');
    log(`📁 Archivo: ${nombreArchivo}`, 'blue');
    log(`📏 Tamaño: ${tamañoMB} MB`, 'blue');
    log(`🎓 Curso: ${config.curso}`, 'blue');
    log(`📖 Sección: ${config.seccion}`, 'blue');
    log(`📝 Lección: ${config.leccion}`, 'blue');
    console.log('');

    // Configurar Google Cloud
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });

    const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

    // Crear ruta en el bucket
    const fechaHora = new Date().toISOString().replace(/[:.]/g, '-');
    const nombreLimpio = nombreArchivo.replace(/[^a-zA-Z0-9.-]/g, '_');
    const rutaBucket = `cursos/${config.curso}/seccion-${config.seccion}/leccion-${config.leccion}/${fechaHora}_${nombreLimpio}`;

    log('📤 Subiendo a Google Cloud Storage...', 'yellow');
    console.log(`🎯 Destino: gs://${bucket.name}/${rutaBucket}`);

    // Subir archivo
    const file = bucket.file(rutaBucket);
    
    await new Promise((resolve, reject) => {
      const stream = file.createWriteStream({
        metadata: {
          contentType: getContentType(extension),
          cacheControl: 'public, max-age=31536000',
          metadata: {
            curso: config.curso,
            seccion: config.seccion,
            leccion: config.leccion,
            fechaSubida: new Date().toISOString(),
            tamaño: tamaño.toString(),
            nombreOriginal: nombreArchivo
          }
        },
        public: true
      });

      let progreso = 0;
      const total = tamaño;

      stream.on('error', reject);
      
      stream.on('progress', (bytesWritten) => {
        const porcentaje = Math.round((bytesWritten / total) * 100);
        if (porcentaje > progreso + 10) { // Mostrar cada 10%
          progreso = porcentaje;
          process.stdout.write(`\r⏳ Progreso: ${porcentaje}%`);
        }
      });

      stream.on('finish', async () => {
        try {
          await file.makePublic();
          const urlPublica = `https://storage.googleapis.com/${bucket.name}/${rutaBucket}`;
          console.log('\n');
          log('✅ Video subido exitosamente!', 'green');
          log(`🔗 URL: ${urlPublica}`, 'cyan');
          resolve(urlPublica);
        } catch (error) {
          reject(error);
        }
      });

      const readStream = fs.createReadStream(rutaVideo);
      readStream.pipe(stream);
    });

    // Actualizar base de datos si está disponible
    try {
      const database = new PrismaClient();
      await actualizarBD(database, config, nombreArchivo, `https://storage.googleapis.com/${bucket.name}/${rutaBucket}`);
      await database.$disconnect();
      log('✅ Base de datos actualizada', 'green');
    } catch (error) {
      log('⚠️ Warning: No se pudo actualizar la base de datos', 'yellow');
      log(`   ${error.message}`, 'yellow');
    }

    log('\n🎉 ¡SUBIDA COMPLETADA!', 'green');
    log('🌐 Tu video ya está disponible en el LMS', 'green');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function actualizarBD(database, config, nombreArchivo, urlPublica) {
  // Buscar curso
  let curso = await database.course.findFirst({
    where: {
      title: { contains: 'IA Básico' } // Simplificado para demo
    }
  });

  if (!curso) {
    // Crear curso básico
    curso = await database.course.create({
      data: {
        userId: 'admin',
        title: 'IA Básico - Certificación Profesional',
        description: 'Curso básico de Inteligencia Artificial',
        isPublished: true,
        price: 0
      }
    });
  }

  // Crear título automático
  const titulo = config.autoTitulo 
    ? `S${config.seccion}L${config.leccion}: ${path.parse(nombreArchivo).name}`
    : `Lección ${config.seccion}.${config.leccion}`;

  // Obtener próxima posición
  const ultimoCapitulo = await database.chapter.findFirst({
    where: { courseId: curso.id },
    orderBy: { position: 'desc' }
  });

  const posicion = ultimoCapitulo ? ultimoCapitulo.position + 1 : 1;

  // Crear capítulo
  await database.chapter.create({
    data: {
      title: titulo,
      description: `Video subido automáticamente: ${nombreArchivo}`,
      videoUrl: urlPublica,
      position: posicion,
      isPublished: config.autoPublicar,
      courseId: curso.id
    }
  });
}

function getContentType(extension) {
  const tipos = {
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm'
  };
  return tipos[extension] || 'video/mp4';
}

function mostrarAyuda() {
  log('\n🎬 SUBIDA EXPRESS DE VIDEOS', 'cyan');
  log('='.repeat(40), 'cyan');
  log('\n📖 FORMAS DE USAR:', 'yellow');
  log('1. Arrastra tu video sobre este archivo', 'blue');
  log('2. node upload-express.js "ruta/a/tu/video.mp4"', 'blue');
  log('3. Ejecuta sin parámetros para modo interactivo', 'blue');
  
  log('\n⚙️ CONFIGURACIÓN ACTUAL:', 'yellow');
  log(`🎓 Curso por defecto: ${CONFIG_RAPIDA.curso}`, 'blue');
  log(`📖 Sección por defecto: ${CONFIG_RAPIDA.seccion}`, 'blue');
  log(`📝 Lección por defecto: ${CONFIG_RAPIDA.leccion}`, 'blue');
  log(`🏷️ Título automático: ${CONFIG_RAPIDA.autoTitulo ? 'SÍ' : 'NO'}`, 'blue');
  
  log('\n💡 PERSONALIZAR:', 'yellow');
  log('Edita CONFIG_RAPIDA al inicio del archivo para cambiar valores por defecto', 'blue');
  
  log('\n🔧 REQUISITOS:', 'yellow');
  log('• Archivo .env configurado', 'blue');
  log('• google-cloud-credentials.json', 'blue');
  log('• Conexión a internet', 'blue');
  console.log('');
}

async function modoInteractivo() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  function pregunta(texto) {
    return new Promise(resolve => {
      rl.question(texto, resolve);
    });
  }

  try {
    log('\n🎬 MODO INTERACTIVO', 'cyan');
    log('='.repeat(30), 'cyan');
    
    const rutaVideo = await pregunta('\n📁 Ruta completa de tu video: ');
    
    if (!fs.existsSync(rutaVideo)) {
      log('❌ Archivo no encontrado', 'red');
      return;
    }

    const usarDefecto = await pregunta('\n¿Usar configuración rápida? (s/N): ');
    
    let config = { ...CONFIG_RAPIDA };
    
    if (usarDefecto.toLowerCase() !== 's') {
      config.curso = await pregunta('🎓 Curso (ia-basico): ') || 'ia-basico';
      config.seccion = await pregunta('📖 Sección (1): ') || '1';
      config.leccion = await pregunta('📝 Lección (1): ') || '1';
    }

    rl.close();
    
    await subirVideoRapido(rutaVideo, config);
    
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
  } finally {
    rl.close();
  }
}

// Verificar configuración
function verificarConfig() {
  const errores = [];
  
  if (!process.env.GOOGLE_CLOUD_PROJECT_ID) errores.push('GOOGLE_CLOUD_PROJECT_ID');
  if (!process.env.GOOGLE_CLOUD_KEY_FILE) errores.push('GOOGLE_CLOUD_KEY_FILE');
  if (!process.env.GOOGLE_CLOUD_BUCKET_NAME) errores.push('GOOGLE_CLOUD_BUCKET_NAME');
  
  if (process.env.GOOGLE_CLOUD_KEY_FILE && !fs.existsSync(process.env.GOOGLE_CLOUD_KEY_FILE)) {
    errores.push('Archivo de credenciales no encontrado');
  }

  if (errores.length > 0) {
    log('❌ Configuración incompleta:', 'red');
    errores.forEach(error => log(`   • ${error}`, 'red'));
    log('\n💡 Revisa tu archivo .env y credenciales de Google Cloud', 'yellow');
    process.exit(1);
  }
}

// Función principal
async function main() {
  verificarConfig();

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Modo interactivo
    await modoInteractivo();
  } else if (args[0] === '--help' || args[0] === '-h') {
    mostrarAyuda();
  } else {
    // Ruta de video proporcionada
    const rutaVideo = args[0];
    await subirVideoRapido(rutaVideo);
  }
}

// Manejo de errores
process.on('SIGINT', () => {
  log('\n\n👋 Proceso cancelado', 'yellow');
  process.exit(0);
});

// Ejecutar si es el archivo principal
if (require.main === module) {
  main().catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { subirVideoRapido, CONFIG_RAPIDA };