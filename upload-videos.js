const { Storage } = require('@google-cloud/storage');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const database = new PrismaClient();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

// Configuración de la estructura de videos
const VIDEO_STRUCTURE = {
  'ia-basico': {
    courseTitle: 'IA Básico - Certificación Profesional',
    lessons: {
      'leccion-1': {
        lessonTitle: 'Fundamentos de IA',
        videos: {
          'video-principal': {
            chapterTitle: '🎥 Video: Fundamentos de IA',
            filename: 'fundamentos-ia.mp4',
            duration: '30 min'
          },
          'tesla-caso': {
            chapterTitle: '📖 Estudio de Caso: Tesla',
            filename: 'tesla-caso-estudio.mp4',
            duration: '20 min'
          },
          'laboratorio-intro': {
            chapterTitle: '🧪 Laboratorio: Google Cloud',
            filename: 'lab-google-cloud-intro.mp4', 
            duration: '15 min'
          },
          'quiz-explicacion': {
            chapterTitle: '📝 Quiz: Conceptos Fundamentales',
            filename: 'quiz-explicacion.mp4',
            duration: '5 min'
          }
        }
      },
      'leccion-2': {
        lessonTitle: 'Tipos de Machine Learning',
        videos: {
          'ml-tipos': {
            chapterTitle: '🎥 Video: Tipos de ML',
            filename: 'tipos-machine-learning.mp4',
            duration: '35 min'
          },
          'netflix-caso': {
            chapterTitle: '📖 Estudio de Caso: Netflix',
            filename: 'netflix-recomendaciones.mp4',
            duration: '25 min'
          }
        }
      }
    }
  },
  'ia-intermedio': {
    courseTitle: 'IA Intermedio - Certificación Profesional',
    lessons: {
      'leccion-1': {
        lessonTitle: 'Deep Learning Avanzado',
        videos: {
          'deep-learning': {
            chapterTitle: '🎥 Video: Deep Learning',
            filename: 'deep-learning-avanzado.mp4',
            duration: '40 min'
          }
        }
      }
    }
  }
};

async function uploadVideoWithStructure(localVideoPath, courseKey, lessonKey, videoKey) {
  try {
    console.log(`\n📹 Subiendo: ${path.basename(localVideoPath)}`);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(localVideoPath)) {
      throw new Error(`❌ Archivo no encontrado: ${localVideoPath}`);
    }

    // Obtener información de la estructura
    const courseInfo = VIDEO_STRUCTURE[courseKey];
    const lessonInfo = courseInfo.lessons[lessonKey];
    const videoInfo = lessonInfo.videos[videoKey];

    if (!videoInfo) {
      throw new Error(`❌ Configuración no encontrada para: ${courseKey}/${lessonKey}/${videoKey}`);
    }

    // Crear path estructurado en el bucket
    const bucketPath = `courses/${courseKey}/lessons/${lessonKey}/videos/${videoKey}/${videoInfo.filename}`;
    
    console.log(`📁 Destino: gs://${bucket.name}/${bucketPath}`);

    // Subir archivo a Google Cloud Storage
    const file = bucket.file(bucketPath);
    
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'video/mp4',
        cacheControl: 'public, max-age=31536000',
        metadata: {
          courseKey: courseKey,
          lessonKey: lessonKey,
          videoKey: videoKey,
          originalName: path.basename(localVideoPath),
          uploadedAt: new Date().toISOString(),
          duration: videoInfo.duration
        },
      },
      public: true,
    });

    return new Promise((resolve, reject) => {
      const fileSize = fs.statSync(localVideoPath).size;
      let uploadedBytes = 0;

      stream.on('error', (error) => {
        console.error(`❌ Error subiendo ${videoInfo.filename}:`, error.message);
        reject(error);
      });

      stream.on('progress', (bytesWritten) => {
        uploadedBytes = bytesWritten;
        const progress = Math.round((uploadedBytes / fileSize) * 100);
        process.stdout.write(`\r⏳ Progreso: ${progress}%`);
      });

      stream.on('finish', async () => {
        try {
          // Hacer el archivo público
          await file.makePublic();
          
          // URL pública del video
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${bucketPath}`;
          
          console.log(`\n✅ Video subido exitosamente!`);
          console.log(`🔗 URL: ${publicUrl}`);
          
          resolve({
            publicUrl,
            bucketPath,
            videoInfo,
            courseInfo,
            lessonInfo
          });
        } catch (error) {
          reject(error);
        }
      });

      // Leer y escribir el archivo
      const readStream = fs.createReadStream(localVideoPath);
      readStream.pipe(stream);
    });

  } catch (error) {
    console.error(`❌ Error en uploadVideoWithStructure:`, error.message);
    throw error;
  }
}

async function updateDatabaseWithVideo(uploadResult) {
  try {
    console.log(`📝 Actualizando base de datos...`);

    const { publicUrl, videoInfo, courseInfo } = uploadResult;

    // Buscar el curso por título
    const course = await database.course.findFirst({
      where: {
        title: {
          contains: courseInfo.courseTitle.split(' - ')[0] // "IA Básico"
        }
      }
    });

    if (!course) {
      throw new Error(`❌ Curso no encontrado: ${courseInfo.courseTitle}`);
    }

    // Buscar el capítulo por título
    const chapter = await database.chapter.findFirst({
      where: {
        courseId: course.id,
        title: {
          contains: videoInfo.chapterTitle.split(':')[1]?.trim() || videoInfo.chapterTitle
        }
      }
    });

    if (!chapter) {
      throw new Error(`❌ Capítulo no encontrado: ${videoInfo.chapterTitle}`);
    }

    // Actualizar capítulo con URL del video
    const updatedChapter = await database.chapter.update({
      where: { id: chapter.id },
      data: { videoUrl: publicUrl }
    });

    console.log(`✅ Base de datos actualizada`);
    console.log(`📚 Curso: ${course.title}`);
    console.log(`📖 Capítulo: ${chapter.title}`);
    console.log(`🆔 Chapter ID: ${chapter.id}`);

    return updatedChapter;

  } catch (error) {
    console.error(`❌ Error actualizando BD:`, error.message);
    throw error;
  }
}

async function uploadSingleVideo(videoPath, courseKey, lessonKey, videoKey) {
  try {
    console.log(`\n🚀 Iniciando subida de video...`);
    console.log(`📁 Archivo: ${videoPath}`);
    console.log(`🎯 Destino: ${courseKey}/${lessonKey}/${videoKey}`);

    // Subir video a Google Cloud Storage
    const uploadResult = await uploadVideoWithStructure(videoPath, courseKey, lessonKey, videoKey);
    
    // Actualizar base de datos
    await updateDatabaseWithVideo(uploadResult);

    console.log(`\n🎉 ¡Video procesado exitosamente!`);
    return uploadResult;

  } catch (error) {
    console.error(`\n❌ Error procesando video:`, error.message);
    throw error;
  }
}

async function uploadMultipleVideos(videosConfig) {
  console.log(`\n🚀 Subiendo múltiples videos...`);
  
  const results = [];
  let successCount = 0;
  let errorCount = 0;

  for (const config of videosConfig) {
    try {
      console.log(`\n📹 Procesando: ${config.videoPath}`);
      const result = await uploadSingleVideo(
        config.videoPath,
        config.courseKey,
        config.lessonKey, 
        config.videoKey
      );
      results.push({ ...config, result, success: true });
      successCount++;
    } catch (error) {
      console.error(`❌ Error con ${config.videoPath}:`, error.message);
      results.push({ ...config, error: error.message, success: false });
      errorCount++;
    }
  }

  console.log(`\n📊 RESUMEN DE SUBIDA:`);
  console.log(`✅ Exitosos: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log(`📹 Total: ${videosConfig.length}`);

  return results;
}

async function showAvailableStructure() {
  console.log(`\n📋 ESTRUCTURA DISPONIBLE:`);
  console.log(`=`.repeat(50));

  for (const [courseKey, courseInfo] of Object.entries(VIDEO_STRUCTURE)) {
    console.log(`\n🎓 CURSO: ${courseKey}`);
    console.log(`   Título: ${courseInfo.courseTitle}`);
    
    for (const [lessonKey, lessonInfo] of Object.entries(courseInfo.lessons)) {
      console.log(`\n   📚 LECCIÓN: ${lessonKey}`);
      console.log(`      Título: ${lessonInfo.lessonTitle}`);
      
      for (const [videoKey, videoInfo] of Object.entries(lessonInfo.videos)) {
        console.log(`\n      🎬 VIDEO: ${videoKey}`);
        console.log(`         Capítulo: ${videoInfo.chapterTitle}`);
        console.log(`         Archivo: ${videoInfo.filename}`);
        console.log(`         Duración: ${videoInfo.duration}`);
      }
    }
    console.log(`\n` + `-`.repeat(40));
  }
}

// Función principal para ejecutar desde línea de comandos
async function main() {
  try {
    console.log(`🎬 SISTEMA DE SUBIDA AUTOMATIZADA DE VIDEOS`);
    console.log(`=`.repeat(50));

    const args = process.argv.slice(2);

    if (args.length === 0) {
      console.log(`\n💡 USO DEL SCRIPT:`);
      console.log(`\n📹 SUBIR UN VIDEO:`);
      console.log(`   node upload-videos.js single <ruta-video> <curso> <leccion> <video>`);
      console.log(`\n📁 EJEMPLO:`);
      console.log(`   node upload-videos.js single "./videos/fundamentos.mp4" ia-basico leccion-1 video-principal`);
      
      console.log(`\n📚 SUBIR MÚLTIPLES VIDEOS:`);
      console.log(`   node upload-videos.js batch <archivo-config.json>`);
      
      console.log(`\n🗂️  VER ESTRUCTURA DISPONIBLE:`);
      console.log(`   node upload-videos.js structure`);
      
      await showAvailableStructure();
      return;
    }

    const command = args[0];

    switch (command) {
      case 'single':
        if (args.length !== 5) {
          console.log(`❌ Uso: node upload-videos.js single <ruta-video> <curso> <leccion> <video>`);
          return;
        }
        await uploadSingleVideo(args[1], args[2], args[3], args[4]);
        break;

      case 'batch':
        if (args.length !== 2) {
          console.log(`❌ Uso: node upload-videos.js batch <archivo-config.json>`);
          return;
        }
        const configPath = args[1];
        if (!fs.existsSync(configPath)) {
          console.log(`❌ Archivo de configuración no encontrado: ${configPath}`);
          return;
        }
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        await uploadMultipleVideos(config);
        break;

      case 'structure':
        await showAvailableStructure();
        break;

      default:
        console.log(`❌ Comando no reconocido: ${command}`);
        console.log(`✅ Comandos disponibles: single, batch, structure`);
    }

  } catch (error) {
    console.error(`\n❌ Error general:`, error.message);
  } finally {
    await database.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = {
  uploadSingleVideo,
  uploadMultipleVideos,
  showAvailableStructure,
  VIDEO_STRUCTURE
};