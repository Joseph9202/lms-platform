const { PrismaClient } = require("@prisma/client");
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const database = new PrismaClient();

// Configuración de Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

// Estructura de videos organizada
const VIDEO_STRUCTURE = {
  "ia-basico": {
    courseName: "IA Básico - Certificación Profesional",
    lessons: {
      "leccion-1": {
        lessonName: "Fundamentos de la Inteligencia Artificial",
        sections: {
          "video-principal": {
            sectionName: "🎥 Video: Fundamentos de IA",
            description: "Historia, definiciones y conceptos clave de la IA",
            duration: "30 min",
            chapterTitle: "🎥 Video: Fundamentos de IA"
          },
          "caso-tesla": {
            sectionName: "📖 Estudio de Caso: Tesla",
            description: "Análisis de conducción autónoma con IA",
            duration: "20 min",
            chapterTitle: "📖 Estudio de Caso: Tesla"
          },
          "laboratorio": {
            sectionName: "🧪 Laboratorio: Google Cloud",
            description: "Primer modelo de IA en Google Cloud",
            duration: "45 min",
            chapterTitle: "🧪 Laboratorio: Google Cloud"
          },
          "quiz": {
            sectionName: "📝 Quiz: Conceptos Fundamentales",
            description: "Evaluación de conceptos básicos",
            duration: "10 min",
            chapterTitle: "📝 Quiz: Conceptos Fundamentales"
          }
        }
      },
      "leccion-2": {
        lessonName: "Tipos de Machine Learning",
        sections: {
          "video-principal": {
            sectionName: "🎥 Video: ML Supervisado vs No Supervisado",
            description: "Tipos de aprendizaje automático",
            duration: "25 min",
            chapterTitle: "🎥 Video: Tipos de ML"
          },
          "caso-netflix": {
            sectionName: "📖 Estudio de Caso: Netflix",
            description: "Sistema de recomendaciones con ML",
            duration: "20 min",
            chapterTitle: "📖 Estudio de Caso: Netflix"
          }
        }
      }
    }
  },
  "ia-intermedio": {
    courseName: "IA Intermedio - Certificación Profesional",
    lessons: {
      "leccion-1": {
        lessonName: "Deep Learning Avanzado",
        sections: {
          "video-principal": {
            sectionName: "🎥 Video: Redes Neuronales Profundas",
            description: "Arquitecturas avanzadas de deep learning",
            duration: "35 min",
            chapterTitle: "🎥 Video: Deep Learning Avanzado"
          }
        }
      }
    }
  }
};

async function uploadVideo(videoPath, course, lesson, section) {
  try {
    console.log(`📹 Subiendo video: ${path.basename(videoPath)}`);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(videoPath)) {
      throw new Error(`❌ Archivo no encontrado: ${videoPath}`);
    }

    // Verificar estructura
    if (!VIDEO_STRUCTURE[course] || 
        !VIDEO_STRUCTURE[course].lessons[lesson] || 
        !VIDEO_STRUCTURE[course].lessons[lesson].sections[section]) {
      throw new Error(`❌ Estructura no válida: ${course}/${lesson}/${section}`);
    }

    const sectionInfo = VIDEO_STRUCTURE[course].lessons[lesson].sections[section];
    
    // Generar nombre de archivo organizado
    const fileExtension = path.extname(videoPath);
    const fileName = `${course}/${lesson}/${section}/video${fileExtension}`;
    
    // Subir archivo a Google Cloud Storage
    console.log(`☁️  Subiendo a: gs://${process.env.GOOGLE_CLOUD_BUCKET_NAME}/${fileName}`);
    
    const file = bucket.file(fileName);
    const fileStream = fs.createReadStream(videoPath);
    
    await new Promise((resolve, reject) => {
      const stream = file.createWriteStream({
        metadata: {
          contentType: getContentType(fileExtension),
          metadata: {
            course: course,
            lesson: lesson,
            section: section,
            originalName: path.basename(videoPath),
            uploadedAt: new Date().toISOString(),
            sectionName: sectionInfo.sectionName,
            description: sectionInfo.description,
            duration: sectionInfo.duration
          }
        },
        public: true,
      });

      stream.on('error', reject);
      stream.on('finish', resolve);
      
      fileStream.pipe(stream);
    });

    // Hacer el archivo público
    await file.makePublic();
    
    // URL pública del video
    const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET_NAME}/${fileName}`;
    
    console.log(`✅ Video subido exitosamente!`);
    console.log(`🔗 URL: ${publicUrl}`);

    // Actualizar base de datos
    await updateDatabase(course, lesson, section, publicUrl, sectionInfo);
    
    return {
      success: true,
      url: publicUrl,
      fileName: fileName,
      sectionInfo: sectionInfo
    };

  } catch (error) {
    console.error(`❌ Error subiendo video: ${error.message}`);
    throw error;
  }
}

async function updateDatabase(course, lesson, section, videoUrl, sectionInfo) {
  try {
    console.log(`🗄️  Actualizando base de datos...`);

    // Buscar el curso
    const courseRecord = await database.course.findFirst({
      where: {
        title: VIDEO_STRUCTURE[course].courseName
      }
    });

    if (!courseRecord) {
      console.log(`⚠️  Curso no encontrado: ${VIDEO_STRUCTURE[course].courseName}`);
      return;
    }

    // Buscar el capítulo correspondiente
    const chapter = await database.chapter.findFirst({
      where: {
        courseId: courseRecord.id,
        title: sectionInfo.chapterTitle
      }
    });

    if (chapter) {
      // Actualizar capítulo existente
      await database.chapter.update({
        where: { id: chapter.id },
        data: {
          videoUrl: videoUrl,
          description: sectionInfo.description
        }
      });
      console.log(`✅ Capítulo actualizado: ${sectionInfo.chapterTitle}`);
    } else {
      console.log(`⚠️  Capítulo no encontrado: ${sectionInfo.chapterTitle}`);
      console.log(`💡 Puedes crear el capítulo manualmente o ejecutar el script de creación de curso`);
    }

  } catch (error) {
    console.error(`❌ Error actualizando base de datos: ${error.message}`);
  }
}

function getContentType(extension) {
  const types = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska'
  };
  return types[extension.toLowerCase()] || 'video/mp4';
}

function showUsage() {
  console.log(`
🎬 GESTOR DE VIDEOS - LMS PLATFORM
================================

📋 USO:
node upload-video.js <ruta-del-video> <curso> <leccion> <seccion>

📁 ESTRUCTURA DISPONIBLE:
`);

  for (const [courseKey, courseData] of Object.entries(VIDEO_STRUCTURE)) {
    console.log(`\n📚 CURSO: ${courseKey} (${courseData.courseName})`);
    
    for (const [lessonKey, lessonData] of Object.entries(courseData.lessons)) {
      console.log(`  📖 LECCIÓN: ${lessonKey} (${lessonData.lessonName})`);
      
      for (const [sectionKey, sectionData] of Object.entries(lessonData.sections)) {
        console.log(`    🎯 SECCIÓN: ${sectionKey} (${sectionData.sectionName})`);
      }
    }
  }

  console.log(`
📝 EJEMPLOS:
node upload-video.js ./videos/fundamentos-ia.mp4 ia-basico leccion-1 video-principal
node upload-video.js ./videos/caso-tesla.mp4 ia-basico leccion-1 caso-tesla
node upload-video.js ./videos/lab-gcp.mp4 ia-basico leccion-1 laboratorio

📁 ESTRUCTURA EN BUCKET:
gs://bucket/ia-basico/leccion-1/video-principal/video.mp4
gs://bucket/ia-basico/leccion-1/caso-tesla/video.mp4
gs://bucket/ia-basico/leccion-1/laboratorio/video.mp4

🔧 CONFIGURACIÓN:
Asegúrate de tener configurado en .env:
- GOOGLE_CLOUD_PROJECT_ID
- GOOGLE_CLOUD_KEY_FILE  
- GOOGLE_CLOUD_BUCKET_NAME
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showUsage();
    return;
  }

  if (args[0] === '--list' || args[0] === '-l') {
    console.log("📋 ESTRUCTURA DE CURSOS DISPONIBLE:\n");
    console.log(JSON.stringify(VIDEO_STRUCTURE, null, 2));
    return;
  }

  if (args.length !== 4) {
    console.log("❌ Número incorrecto de argumentos\n");
    showUsage();
    return;
  }

  const [videoPath, course, lesson, section] = args;

  try {
    console.log(`🚀 Iniciando subida de video...`);
    console.log(`📁 Archivo: ${videoPath}`);
    console.log(`🎯 Destino: ${course}/${lesson}/${section}`);
    console.log(``);

    const result = await uploadVideo(videoPath, course, lesson, section);
    
    console.log(`\n🎉 ¡SUBIDA COMPLETADA!`);
    console.log(`📊 DETALLES:`);
    console.log(`   • Curso: ${VIDEO_STRUCTURE[course].courseName}`);
    console.log(`   • Lección: ${VIDEO_STRUCTURE[course].lessons[lesson].lessonName}`);
    console.log(`   • Sección: ${result.sectionInfo.sectionName}`);
    console.log(`   • URL: ${result.url}`);
    console.log(`   • Archivo: ${result.fileName}`);

  } catch (error) {
    console.error(`\n💥 ERROR: ${error.message}`);
    process.exit(1);
  } finally {
    await database.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { uploadVideo, VIDEO_STRUCTURE };