#!/usr/bin/env node

// 🎬 SCRIPT EXPRESS ACTUALIZADO - USA CURSOS EXISTENTES
// Pacific Labs LMS - Subida rápida con cursos reales
// Uso: node upload-express-updated.js "video.mp4"

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

function generateCourseKey(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
}

// Cache para cursos (evitar consultas repetidas)
let cursosCache = null;

async function obtenerCursosPorDefecto() {
  if (cursosCache) {
    return cursosCache;
  }

  try {
    const database = new PrismaClient();
    
    const cursos = await database.course.findMany({
      where: {
        isPublished: true
      },
      include: {
        chapters: {
          where: {
            isPublished: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    await database.$disconnect();

    if (cursos.length === 0) {
      throw new Error('No hay cursos disponibles. Crea cursos en tu LMS primero.');
    }

    // Filtrar duplicados y mapear
    const cursosUnicos = [];
    const iaBasicoFound = false;

    for (const curso of cursos) {
      const esIABasico = curso.title.toLowerCase().includes('ia basico') || 
                        curso.title.toLowerCase().includes('ia básico');
      
      if (esIABasico && !iaBasicoFound) {
        cursosUnicos.push(curso);
      } else if (!esIABasico) {
        cursosUnicos.push(curso);
      }
    }

    const cursosDisponibles = {};
    cursosUnicos.forEach(curso => {
      const key = generateCourseKey(curso.title);
      cursosDisponibles[key] = {
        id: curso.id,
        title: curso.title,
        chapters: curso.chapters.length
      };
    });

    cursosCache = cursosDisponibles;
    return cursosDisponibles;

  } catch (error) {
    // Fallback a cursos por defecto si hay error
    log(`⚠️ No se pudieron obtener cursos de BD: ${error.message}`, 'yellow');
    return {
      'curso-nuevo': {
        id: 'new',
        title: 'Curso Nuevo',
        chapters: 0
      }
    };
  }
}

// Configuración rápida automática
async function obtenerConfigRapida() {
  const cursosDisponibles = await obtenerCursosPorDefecto();
  
  // Usar el primer curso disponible como predeterminado
  const primerCurso = Object.keys(cursosDisponibles)[0];
  
  return {
    curso: primerCurso,
    cursoData: cursosDisponibles[primerCurso],
    seccion: '1',
    leccion: '1',
    autoTitulo: true,
    autoPublicar: true,
    cursosDisponibles: cursosDisponibles
  };
}

async function subirVideoRapidoActualizado(rutaVideo, configCustom = null) {
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

    // Obtener configuración
    const config = configCustom || await obtenerConfigRapida();

    log('\n🎬 SUBIDA EXPRESS ACTUALIZADA', 'cyan');
    log('='.repeat(40), 'cyan');
    log(`📁 Archivo: ${nombreArchivo}`, 'blue');
    log(`📏 Tamaño: ${tamañoMB} MB`, 'blue');
    log(`🎓 Curso: ${config.cursoData.title}`, 'blue');
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
    
    const urlPublica = await new Promise((resolve, reject) => {
      const stream = file.createWriteStream({
        metadata: {
          contentType: getContentType(extension),
          cacheControl: 'public, max-age=31536000',
          metadata: {
            cursoId: config.cursoData.id,
            cursoKey: config.curso,
            cursoTitulo: config.cursoData.title,
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
        if (porcentaje > progreso + 10) {
          progreso = porcentaje;
          process.stdout.write(`\r⏳ Progreso: ${porcentaje}%`);
        }
      });

      stream.on('finish', async () => {
        try {
          await file.makePublic();
          const url = `https://storage.googleapis.com/${bucket.name}/${rutaBucket}`;
          console.log('\n');
          log('✅ Video subido exitosamente!', 'green');
          log(`🔗 URL: ${url}`, 'cyan');
          resolve(url);
        } catch (error) {
          reject(error);
        }
      });

      const readStream = fs.createReadStream(rutaVideo);
      readStream.pipe(stream);
    });

    // Actualizar base de datos
    try {
      await actualizarBDConCursoReal(config, nombreArchivo, urlPublica);
      log('✅ Base de datos actualizada', 'green');
    } catch (error) {
      log(`⚠️ Warning: No se pudo actualizar la BD: ${error.message}`, 'yellow');
    }

    log('\n🎉 ¡SUBIDA COMPLETADA!', 'green');
    log('🌐 Tu video ya está disponible en el LMS', 'green');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

async function actualizarBDConCursoReal(config, nombreArchivo, urlPublica) {
  const database = new PrismaClient();
  
  try {
    // Si es un curso nuevo, crearlo
    let cursoId = config.cursoData.id;
    
    if (cursoId === 'new') {
      const nuevoCurso = await database.course.create({
        data: {
          userId: 'admin', // TODO: usar usuario real
          title: 'Curso Nuevo - Videos Subidos',
          description: 'Curso creado automáticamente para videos subidos',
          isPublished: true,
          price: 0
        }
      });
      cursoId = nuevoCurso.id;
      log(`📚 Nuevo curso creado: ${nuevoCurso.title}`, 'green');
    }

    // Crear título automático
    const titulo = config.autoTitulo 
      ? `S${config.seccion}L${config.leccion}: ${path.parse(nombreArchivo).name}`
      : `Lección ${config.seccion}.${config.leccion}`;

    // Obtener próxima posición
    const ultimoCapitulo = await database.chapter.findFirst({
      where: { courseId: cursoId },
      orderBy: { position: 'desc' }
    });

    const posicion = ultimoCapitulo ? ultimoCapitulo.position + 1 : 1;

    // Verificar si ya existe
    const capituloExistente = await database.chapter.findFirst({
      where: {
        courseId: cursoId,
        title: titulo
      }
    });

    if (capituloExistente) {
      // Actualizar existente
      await database.chapter.update({
        where: { id: capituloExistente.id },
        data: {
          videoUrl: urlPublica,
          description: `Video actualizado: ${nombreArchivo}`,
          isPublished: config.autoPublicar
        }
      });
      log(`📖 Capítulo actualizado: ${titulo}`, 'blue');
    } else {
      // Crear nuevo
      await database.chapter.create({
        data: {
          title: titulo,
          description: `Video subido automáticamente: ${nombreArchivo}`,
          videoUrl: urlPublica,
          position: posicion,
          isPublished: config.autoPublicar,
          courseId: cursoId
        }
      });
      log(`📖 Capítulo creado: ${titulo}`, 'blue');
    }

  } finally {
    await database.$disconnect();
  }
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
  log('\n🎬 SUBIDA EXPRESS ACTUALIZADA', 'cyan');
  log('='.repeat(40), 'cyan');
  log('\n📖 FORMAS DE USAR:', 'yellow');
  log('1. Arrastra tu video sobre subir-video-express.bat', 'blue');
  log('2. node upload-express-updated.js "ruta/video.mp4"', 'blue');
  log('3. Ejecuta sin parámetros para modo interactivo', 'blue');
  
  log('\n🎓 CURSOS AUTOMÁTICOS:', 'yellow');
  log('El sistema detecta automáticamente los cursos de tu LMS', 'blue');
  log('y usa el primer curso disponible como predeterminado', 'blue');
  
  log('\n💡 VENTAJAS:', 'yellow');
  log('• Usa cursos reales de tu base de datos', 'blue');
  log('• No más cursos hardcodeados', 'blue');
  log('• Detecta y elimina duplicados automáticamente', 'blue');
  log('• Organiza videos en estructura existente', 'blue');
  
  log('\n🔧 CONFIGURACIÓN AUTOMÁTICA:', 'yellow');
  log('• Curso: Primer curso disponible en tu LMS', 'blue');
  log('• Sección: 1', 'blue');
  log('• Lección: 1', 'blue');
  log('• Título: Nombre del archivo', 'blue');
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
    log('\n🎬 MODO INTERACTIVO ACTUALIZADO', 'cyan');
    log('='.repeat(35), 'cyan');
    
    const rutaVideo = await pregunta('\n📁 Ruta completa de tu video: ');
    
    if (!fs.existsSync(rutaVideo)) {
      log('❌ Archivo no encontrado', 'red');
      return;
    }

    // Obtener cursos disponibles
    const cursosDisponibles = await obtenerCursosPorDefecto();
    
    log('\n📚 Cursos disponibles:', 'yellow');
    Object.entries(cursosDisponibles).forEach(([key, curso], index) => {
      console.log(`${index + 1}. ${key} → ${curso.title} (${curso.chapters} capítulos)`);
    });

    const usarDefecto = await pregunta('\n¿Usar configuración automática? (S/n): ');
    
    let config = await obtenerConfigRapida();
    
    if (usarDefecto.toLowerCase() === 'n') {
      const cursoSeleccionado = await pregunta('🎓 Clave del curso: ') || config.curso;
      config.curso = cursoSeleccionado;
      config.cursoData = cursosDisponibles[cursoSeleccionado] || config.cursoData;
      config.seccion = await pregunta('📖 Sección (1): ') || '1';
      config.leccion = await pregunta('📝 Lección (1): ') || '1';
    }

    rl.close();
    
    await subirVideoRapidoActualizado(rutaVideo, config);
    
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
    await modoInteractivo();
  } else if (args[0] === '--help' || args[0] === '-h') {
    mostrarAyuda();
  } else {
    const rutaVideo = args[0];
    await subirVideoRapidoActualizado(rutaVideo);
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

module.exports = { 
  subirVideoRapidoActualizado, 
  obtenerCursosPorDefecto,
  obtenerConfigRapida 
};