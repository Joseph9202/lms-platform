#!/usr/bin/env node

// 🎬 SUBIDA DINÁMICA DE VIDEOS CON CURSOS EXISTENTES
// Pacific Labs LMS - Usa cursos reales de la base de datos
// Uso: node upload-video-dynamic.js

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

function generateCourseKey(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30);
}

async function obtenerCursosExistentes() {
  try {
    colorLog('📚 Obteniendo cursos de la base de datos...', 'blue');

    const cursos = await database.course.findMany({
      where: {
        isPublished: true
      },
      include: {
        chapters: {
          where: {
            isPublished: true
          },
          orderBy: {
            position: 'asc'
          }
        },
        category: true
      },
      orderBy: {
        title: 'asc'
      }
    });

    if (cursos.length === 0) {
      throw new Error('No se encontraron cursos publicados. Crea cursos en tu LMS primero.');
    }

    // Filtrar duplicados de IA Básico
    const cursosUnicos = [];
    const ياBasicoFound = false;

    for (const curso of cursos) {
      const esIABasico = curso.title.toLowerCase().includes('ia basico') || 
                        curso.title.toLowerCase().includes('ia básico');
      
      if (esIABasico) {
        if (!cursosUnicos.some(c => 
          c.title.toLowerCase().includes('ia basico') || 
          c.title.toLowerCase().includes('ia básico')
        )) {
          cursosUnicos.push(curso);
        }
      } else {
        cursosUnicos.push(curso);
      }
    }

    const cursosDisponibles = {};
    cursosUnicos.forEach(curso => {
      const key = generateCourseKey(curso.title);
      cursosDisponibles[key] = {
        id: curso.id,
        title: curso.title,
        description: curso.description || '',
        totalChapters: curso.chapters.length,
        chapters: curso.chapters
      };
    });

    return cursosDisponibles;

  } catch (error) {
    throw new Error(`Error obteniendo cursos: ${error.message}`);
  }
}

async function mostrarCursosDisponibles(cursos) {
  colorLog('\n📚 CURSOS DISPONIBLES EN TU LMS:', 'yellow');
  colorLog('='.repeat(50), 'yellow');

  Object.entries(cursos).forEach(([key, curso], index) => {
    console.log(`${index + 1}. ${key}`);
    console.log(`   📖 ${curso.title}`);
    console.log(`   📝 ${curso.totalChapters} capítulos existentes`);
    console.log('');
  });
}

async function determinarPosicionCapitulo(cursoSeleccionado, seccionNum, leccionNum) {
  try {
    // Calcular posición basada en sección y lección
    // Cada sección tiene máximo 10 lecciones
    const posicionBase = ((seccionNum - 1) * 10) + leccionNum;
    
    // Verificar si ya existe un capítulo en esa posición
    const capituloExistente = await database.chapter.findFirst({
      where: {
        courseId: cursoSeleccionado.id,
        position: posicionBase
      }
    });

    if (capituloExistente) {
      // Buscar próxima posición disponible
      const ultimoCapitulo = await database.chapter.findFirst({
        where: {
          courseId: cursoSeleccionado.id
        },
        orderBy: {
          position: 'desc'
        }
      });

      return ultimoCapitulo ? ultimoCapitulo.position + 1 : posicionBase;
    }

    return posicionBase;
  } catch (error) {
    // Si hay error, usar posición al final
    const ultimoCapitulo = await database.chapter.findFirst({
      where: {
        courseId: cursoSeleccionado.id
      },
      orderBy: {
        position: 'desc'
      }
    });

    return ultimoCapitulo ? ultimoCapitulo.position + 1 : 1;
  }
}

async function subirVideoConCursoExistente(datos) {
  const {
    videoPath,
    fileName,
    cursoKey,
    cursoData,
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
    const bucketPath = `cursos/${cursoKey}/seccion-${seccionNumero}/leccion-${leccionNumero}/${fechaActual}_${nombreLimpio}`;

    colorLog('\n📤 Subiendo video a Google Cloud Storage...', 'blue');
    console.log(`🎯 Destino: gs://${bucket.name}/${bucketPath}`);

    // Crear stream de subida con progress
    const file = bucket.file(bucketPath);
    
    const stream = file.createWriteStream({
      metadata: {
        contentType: getContentType(fileName),
        cacheControl: 'public, max-age=31536000',
        metadata: {
          cursoId: cursoData.id,
          cursoKey: cursoKey,
          cursoTitulo: cursoData.title,
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

          // 2. Actualizar base de datos
          await actualizarBaseDatosConCursoExistente({
            cursoData,
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

async function actualizarBaseDatosConCursoExistente(datos) {
  const {
    cursoData,
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

    // Crear título del capítulo
    const tituloCapitulo = `S${seccionNumero}L${leccionNumero}: ${tituloVideo}`;
    
    // Determinar posición correcta
    const posicion = await determinarPosicionCapitulo(cursoData, parseInt(seccionNumero), parseInt(leccionNumero));

    // Verificar si ya existe un capítulo con el mismo título
    const capituloExistente = await database.chapter.findFirst({
      where: {
        courseId: cursoData.id,
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
      
      const nuevoCapitulo = await database.chapter.create({
        data: {
          title: tituloCapitulo,
          description: descripcion,
          videoUrl: publicUrl,
          position: posicion,
          isPublished: true,
          courseId: cursoData.id
        }
      });
      
      colorLog(`✅ Capítulo creado: ${nuevoCapitulo.title} (Posición: ${posicion})`, 'green');
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

async function main() {
  try {
    console.clear();
    colorLog('🎬 SUBIDA DINÁMICA DE VIDEOS', 'cyan');
    colorLog('Usando cursos existentes de tu LMS', 'cyan');
    colorLog('='.repeat(50), 'cyan');
    console.log('');

    // 1. Obtener cursos existentes
    const cursosDisponibles = await obtenerCursosExistentes();
    
    if (Object.keys(cursosDisponibles).length === 0) {
      colorLog('❌ No se encontraron cursos. Crea cursos en tu LMS primero.', 'red');
      process.exit(1);
    }

    // 2. Solicitar ruta del video
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

    // 3. Mostrar cursos disponibles
    await mostrarCursosDisponibles(cursosDisponibles);

    const cursoSeleccionadoInput = await question('🎓 Selecciona el curso (escribe la clave): ');
    
    if (!cursosDisponibles[cursoSeleccionadoInput]) {
      colorLog('❌ Error: Curso no válido', 'red');
      process.exit(1);
    }

    const cursoSeleccionado = cursosDisponibles[cursoSeleccionadoInput];

    // 4. Solicitar información de la lección
    const seccionNumero = await question('📖 Número de sección (ej: 1, 2, 3): ');
    const leccionNumero = await question('📝 Número de lección (ej: 1, 2, 3): ');
    
    // 5. Solicitar información del video
    const tituloVideo = await question('🎬 Título del video: ');
    const descripcion = await question('📄 Descripción (opcional): ') || '';
    const duracion = await question('⏱️  Duración estimada (ej: 15 min): ') || 'N/A';

    console.log('');
    colorLog('📋 RESUMEN DE LA SUBIDA:', 'cyan');
    console.log(`📁 Archivo: ${fileName}`);
    console.log(`📏 Tamaño: ${fileSizeMB} MB`);
    console.log(`🎓 Curso: ${cursoSeleccionado.title}`);
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

    // 6. Subir el video
    await subirVideoConCursoExistente({
      videoPath,
      fileName,
      cursoKey: cursoSeleccionadoInput,
      cursoData: cursoSeleccionado,
      seccionNumero,
      leccionNumero,
      tituloVideo,
      descripcion,
      duracion,
      fileSize
    });

    colorLog('\n🎉 ¡Video subido exitosamente!', 'green');
    colorLog('🌐 Ve a tu LMS para verificar que aparece correctamente', 'cyan');
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
  } finally {
    rl.close();
    await database.$disconnect();
  }
}

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

// Manejo de errores
process.on('SIGINT', () => {
  colorLog('\n\n👋 Proceso cancelado por el usuario', 'yellow');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  colorLog(`\n❌ Error crítico: ${error.message}`, 'red');
  process.exit(1);
});

// Iniciar script
if (require.main === module) {
  verificarConfiguracion().then(() => {
    main();
  });
}

module.exports = { 
  subirVideoConCursoExistente, 
  obtenerCursosExistentes,
  generateCourseKey 
};