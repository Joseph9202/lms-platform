#!/usr/bin/env node

// 🎬 SCRIPT SIMPLE PARA SUBIR VIDEOS A GOOGLE CLOUD
// Pacific Labs LMS - Subida Directa de Videos
// Uso: node upload-video-simple.js

const { Storage } = require('@google-cloud/storage');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
require('dotenv').config();

// Configuración de Google Cloud
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const database = new PrismaClient();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

// Interfaz de línea de comandos
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

function colorLog(message, color = 'white') {
  const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  console.log(colors[color] + message + colors.reset);
}

// Estructura de cursos disponibles
const CURSOS_DISPONIBLES = {
  'ia-basico': 'IA Básico - Certificación Profesional',
  'ia-intermedio': 'IA Intermedio - Certificación Profesional', 
  'ia-avanzado': 'IA Avanzado - Certificación Profesional',
  'ml-fundamentals': 'Machine Learning Fundamentals',
  'deep-learning': 'Deep Learning Especialización'
};

async function main() {
  try {
    console.clear();
    colorLog('🎬 SUBIDA SIMPLE DE VIDEOS A GOOGLE CLOUD', 'cyan');
    colorLog('='.repeat(50), 'cyan');
    console.log('');

    // 1. Solicitar ruta del video
    const videoPath = await question('📁 Ruta completa del video en tu PC: ');
    
    if (!fs.existsSync(videoPath)) {
      colorLog('❌ Error: El archivo no existe en la ruta especificada', 'red');
      process.exit(1);
    }

    // Verificar que es un archivo de video
    const ext = path.extname(videoPath).toLowerCase();
    if (!['.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(ext)) {
      colorLog('❌ Error: Formato de video no soportado. Usa: mp4, avi, mov, mkv, webm', 'red');
      process.exit(1);
    }

    const fileName = path.basename(videoPath);
    const fileSize = fs.statSync(videoPath).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);

    colorLog(`✅ Video encontrado: ${fileName} (${fileSizeMB} MB)`, 'green');
    console.log('');

    // 2. Mostrar cursos disponibles
    colorLog('📚 Cursos disponibles:', 'yellow');
    Object.entries(CURSOS_DISPONIBLES).forEach(([key, name]) => {
      console.log(`   ${key} → ${name}`);
    });
    console.log('');

    const cursoKey = await question('🎓 Selecciona el curso (ej: ia-basico): ');
    
    if (!CURSOS_DISPONIBLES[cursoKey]) {
      colorLog('❌ Error: Curso no válido', 'red');
      process.exit(1);
    }

    // 3. Solicitar información de la lección
    const seccionNumero = await question('📖 Número de sección (ej: 1, 2, 3): ');
    const leccionNumero = await question('📝 Número de lección (ej: 1, 2, 3): ');
    
    // 4. Solicitar información del video
    const tituloVideo = await question('🎬 Título del video: ');
    const descripcion = await question('📄 Descripción (opcional): ') || '';
    const duracion = await question('⏱️  Duración estimada (ej: 15 min): ') || 'N/A';

    console.log('');
    colorLog('📋 RESUMEN DE LA SUBIDA:', 'cyan');
    console.log(`📁 Archivo: ${fileName}`);
    console.log(`📏 Tamaño: ${fileSizeMB} MB`);
    console.log(`🎓 Curso: ${CURSOS_DISPONIBLES[cursoKey]}`);
    console.log(`📖 Sección: ${seccionNumero}`);
    console.log(`📝 Lección: ${leccionNumero}`);
    console.log(`🎬 Título: ${tituloVideo}`);
    console.log(`📄 Descripción: ${descripcion}`);
    console.log(`⏱️  Duración: ${duracion}`);
    console.log('');

    const confirmar = await question('¿Confirmar subida? (s/N): ');
    if (confirmar.toLowerCase() !== 's') {
      colorLog('❌ Subida cancelada', 'yellow');
      process.exit(0);
    }

    // 5. Subir el video
    await subirVideo({
      videoPath,
      fileName,
      cursoKey,
      seccionNumero,
      leccionNumero,
      tituloVideo,
      descripcion,
      duracion,
      fileSize
    });

    colorLog('\n🎉 ¡Video subido exitosamente!', 'green');
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
  } finally {
    rl.close();
    await database.$disconnect();
  }
}

async function subirVideo(datos) {
  const {
    videoPath,
    fileName,
    cursoKey,
    seccionNumero,
    leccionNumero,
    tituloVideo,
    descripcion,
    duracion,
    fileSize
  } = datos;

  try {
    // 1. Crear estructura en Google Cloud Storage
    const fechaActual = new Date().toISOString().split('T')[0];
    const nombreLimpio = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const bucketPath = `cursos/${cursoKey}/seccion-${seccionNumero}/leccion-${leccionNumero}/${nombreLimpio}`;

    colorLog('\n📤 Subiendo video a Google Cloud Storage...', 'blue');
    console.log(`🎯 Destino: gs://${bucket.name}/${bucketPath}`);

    // Crear stream de subida con progress
    const file = bucket.file(bucketPath);
    
    const stream = file.createWriteStream({
      metadata: {
        contentType: getContentType(fileName),
        cacheControl: 'public, max-age=31536000',
        metadata: {
          curso: cursoKey,
          seccion: seccionNumero,
          leccion: leccionNumero,
          titulo: tituloVideo,
          descripcion: descripcion,
          duracion: duracion,
          fechaSubida: fechaActual,
          tamaño: fileSize.toString()
        }
      },
      public: true
    });

    // Progress tracking
    let uploadedBytes = 0;
    const totalBytes = fileSize;

    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(new Error(`Error subiendo archivo: ${error.message}`));
      });

      stream.on('progress', (bytesWritten) => {
        uploadedBytes = bytesWritten;
        const progress = Math.round((uploadedBytes / totalBytes) * 100);
        process.stdout.write(`\r⏳ Progreso: ${progress}% (${(uploadedBytes / (1024 * 1024)).toFixed(1)} MB de ${(totalBytes / (1024 * 1024)).toFixed(1)} MB)`);
      });

      stream.on('finish', async () => {
        try {
          console.log('\n');
          
          // Hacer el archivo público
          await file.makePublic();
          
          // URL pública del video
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${bucketPath}`;
          
          colorLog('✅ Video subido a Google Cloud Storage', 'green');
          colorLog(`🔗 URL: ${publicUrl}`, 'cyan');

          // 2. Buscar o crear curso en la base de datos
          await actualizarBaseDatos({
            cursoKey,
            seccionNumero,
            leccionNumero,
            tituloVideo,
            descripcion,
            duracion,
            publicUrl,
            bucketPath
          });

          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });

      // Leer y escribir el archivo
      const readStream = fs.createReadStream(videoPath);
      readStream.pipe(stream);
    });

  } catch (error) {
    throw new Error(`Error en subida: ${error.message}`);
  }
}

async function actualizarBaseDatos(datos) {
  const {
    cursoKey,
    seccionNumero,
    leccionNumero,
    tituloVideo,
    descripcion,
    duracion,
    publicUrl,
    bucketPath
  } = datos;

  try {
    colorLog('\n📝 Actualizando base de datos...', 'blue');

    // 1. Buscar o crear curso
    const nombreCurso = CURSOS_DISPONIBLES[cursoKey];
    let curso = await database.course.findFirst({
      where: {
        title: {
          contains: nombreCurso.split(' - ')[0] // "IA Básico"
        }
      }
    });

    if (!curso) {
      colorLog('📚 Creando nuevo curso...', 'yellow');
      curso = await database.course.create({
        data: {
          userId: 'admin', // TODO: Usar usuario real
          title: nombreCurso,
          description: `Curso completo de ${nombreCurso}`,
          imageUrl: '/default-course.jpg',
          price: 0,
          isPublished: true,
          categoryId: null // TODO: Agregar categoría
        }
      });
      colorLog(`✅ Curso creado: ${curso.title}`, 'green');
    } else {
      colorLog(`✅ Curso encontrado: ${curso.title}`, 'green');
    }

    // 2. Crear capítulo (video)
    const tituloCapitulo = `S${seccionNumero}L${leccionNumero}: ${tituloVideo}`;
    
    // Verificar si ya existe
    const capituloExistente = await database.chapter.findFirst({
      where: {
        courseId: curso.id,
        title: tituloCapitulo
      }
    });

    if (capituloExistente) {
      colorLog('⚠️ Actualizando capítulo existente...', 'yellow');
      await database.chapter.update({
        where: { id: capituloExistente.id },
        data: {
          videoUrl: publicUrl,
          description: descripcion,
          isPublished: true
        }
      });
      colorLog('✅ Capítulo actualizado', 'green');
    } else {
      colorLog('📖 Creando nuevo capítulo...', 'yellow');
      
      // Obtener posición siguiente
      const ultimaPosicion = await database.chapter.findFirst({
        where: { courseId: curso.id },
        orderBy: { position: 'desc' }
      });
      
      const nuevaPosicion = ultimaPosicion ? ultimaPosicion.position + 1 : 1;

      const nuevoCapitulo = await database.chapter.create({
        data: {
          title: tituloCapitulo,
          description: descripcion,
          videoUrl: publicUrl,
          position: nuevaPosicion,
          isPublished: true,
          courseId: curso.id
        }
      });
      
      colorLog(`✅ Capítulo creado: ${nuevoCapitulo.title}`, 'green');
    }

    colorLog('✅ Base de datos actualizada correctamente', 'green');

  } catch (error) {
    throw new Error(`Error actualizando base de datos: ${error.message}`);
  }
}

function getContentType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const contentTypes = {
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm'
  };
  return contentTypes[ext] || 'video/mp4';
}

// Manejo de errores
process.on('SIGINT', () => {
  colorLog('\n\n👋 Proceso cancelado por el usuario', 'yellow');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  colorLog(`\n❌ Error crítico: ${error.message}`, 'red');
  process.exit(1);
});

// Verificar configuración antes de iniciar
async function verificarConfiguracion() {
  const errores = [];

  if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
    errores.push('GOOGLE_CLOUD_PROJECT_ID no configurado en .env');
  }

  if (!process.env.GOOGLE_CLOUD_KEY_FILE) {
    errores.push('GOOGLE_CLOUD_KEY_FILE no configurado en .env');
  }

  if (!process.env.GOOGLE_CLOUD_BUCKET_NAME) {
    errores.push('GOOGLE_CLOUD_BUCKET_NAME no configurado en .env');
  }

  if (!fs.existsSync(process.env.GOOGLE_CLOUD_KEY_FILE || '')) {
    errores.push('Archivo de credenciales de Google Cloud no encontrado');
  }

  if (errores.length > 0) {
    colorLog('❌ Errores de configuración:', 'red');
    errores.forEach(error => console.log(`   • ${error}`));
    console.log('');
    colorLog('💡 Configura las variables en .env y agrega google-cloud-credentials.json', 'cyan');
    process.exit(1);
  }
}

// Iniciar script
if (require.main === module) {
  verificarConfiguracion().then(() => {
    main();
  });
}

module.exports = { subirVideo, actualizarBaseDatos };