const { Storage } = require('@google-cloud/storage');
const { PrismaClient } = require("@prisma/client");
require('dotenv').config();

const database = new PrismaClient();

// Configuración de Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

async function listVideosInBucket() {
  try {
    console.log(`☁️  Listando videos en bucket: ${process.env.GOOGLE_CLOUD_BUCKET_NAME}`);
    console.log(`===============================================\n`);

    const [files] = await bucket.getFiles({
      prefix: '',
    });

    // Filtrar solo archivos de video
    const videoFiles = files.filter(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension);
    });

    if (videoFiles.length === 0) {
      console.log("📹 No se encontraron videos en el bucket");
      return [];
    }

    const videoData = [];

    for (const file of videoFiles) {
      try {
        const [metadata] = await file.getMetadata();
        const publicUrl = `https://storage.googleapis.com/${process.env.GOOGLE_CLOUD_BUCKET_NAME}/${file.name}`;
        
        // Parsear información de la ruta
        const pathParts = file.name.split('/');
        const course = pathParts[0] || 'unknown';
        const lesson = pathParts[1] || 'unknown';
        const section = pathParts[2] || 'unknown';
        
        const videoInfo = {
          fileName: file.name,
          publicUrl: publicUrl,
          size: parseInt(metadata.size),
          sizeFormatted: formatBytes(metadata.size),
          created: metadata.timeCreated,
          updated: metadata.updated,
          contentType: metadata.contentType,
          course: course,
          lesson: lesson,
          section: section,
          customMetadata: metadata.metadata || {}
        };

        videoData.push(videoInfo);
      } catch (error) {
        console.error(`❌ Error obteniendo metadata para ${file.name}:`, error.message);
      }
    }

    // Organizar por estructura
    const organized = organizeByStructure(videoData);
    displayOrganizedVideos(organized);

    return videoData;

  } catch (error) {
    console.error(`❌ Error listando videos: ${error.message}`);
    throw error;
  }
}

function organizeByStructure(videos) {
  const organized = {};

  for (const video of videos) {
    if (!organized[video.course]) {
      organized[video.course] = {};
    }
    if (!organized[video.course][video.lesson]) {
      organized[video.course][video.lesson] = {};
    }
    if (!organized[video.course][video.lesson][video.section]) {
      organized[video.course][video.lesson][video.section] = [];
    }
    
    organized[video.course][video.lesson][video.section].push(video);
  }

  return organized;
}

function displayOrganizedVideos(organized) {
  console.log("📊 VIDEOS ORGANIZADOS POR ESTRUCTURA:");
  console.log("=====================================\n");

  for (const [course, lessons] of Object.entries(organized)) {
    console.log(`📚 CURSO: ${course.toUpperCase()}`);
    
    for (const [lesson, sections] of Object.entries(lessons)) {
      console.log(`  📖 LECCIÓN: ${lesson}`);
      
      for (const [section, videos] of Object.entries(sections)) {
        console.log(`    🎯 SECCIÓN: ${section}`);
        
        for (const video of videos) {
          console.log(`      📹 ${video.fileName}`);
          console.log(`         💾 Tamaño: ${video.sizeFormatted}`);
          console.log(`         📅 Subido: ${formatDate(video.created)}`);
          console.log(`         🔗 URL: ${video.publicUrl}`);
          
          if (video.customMetadata.sectionName) {
            console.log(`         📝 Nombre: ${video.customMetadata.sectionName}`);
          }
          if (video.customMetadata.duration) {
            console.log(`         ⏱️  Duración: ${video.customMetadata.duration}`);
          }
          console.log(``);
        }
      }
    }
    console.log(``);
  }
}

async function checkDatabaseSync() {
  try {
    console.log("🗄️  VERIFICANDO SINCRONIZACIÓN CON BASE DE DATOS:");
    console.log("================================================\n");

    const courses = await database.course.findMany({
      include: {
        chapters: {
          where: {
            videoUrl: {
              not: null
            }
          }
        }
      }
    });

    let totalChaptersWithVideo = 0;
    let syncedChapters = 0;

    for (const course of courses) {
      if (course.chapters.length > 0) {
        console.log(`📚 ${course.title}:`);
        
        for (const chapter of course.chapters) {
          totalChaptersWithVideo++;
          const hasValidUrl = chapter.videoUrl && chapter.videoUrl.includes('storage.googleapis.com');
          
          if (hasValidUrl) {
            syncedChapters++;
            console.log(`  ✅ ${chapter.title}`);
            console.log(`     🔗 ${chapter.videoUrl}`);
          } else {
            console.log(`  ❌ ${chapter.title} - URL inválida`);
          }
        }
        console.log(``);
      }
    }

    console.log(`📊 RESUMEN DE SINCRONIZACIÓN:`);
    console.log(`   • Total capítulos con video: ${totalChaptersWithVideo}`);
    console.log(`   • Sincronizados correctamente: ${syncedChapters}`);
    console.log(`   • Pendientes de sincronizar: ${totalChaptersWithVideo - syncedChapters}`);

  } catch (error) {
    console.error(`❌ Error verificando base de datos: ${error.message}`);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES');
}

async function generateReport() {
  try {
    console.log("📊 GENERANDO REPORTE COMPLETO DE VIDEOS...\n");

    const videos = await listVideosInBucket();
    
    if (videos.length === 0) {
      console.log("📹 No hay videos para reportar");
      return;
    }

    console.log("\n" + "=".repeat(50));
    console.log("📈 ESTADÍSTICAS GENERALES:");
    console.log("=".repeat(50));

    const totalSize = videos.reduce((sum, video) => sum + video.size, 0);
    const avgSize = totalSize / videos.length;
    
    const courseCount = new Set(videos.map(v => v.course)).size;
    const lessonCount = new Set(videos.map(v => `${v.course}/${v.lesson}`)).size;
    
    console.log(`📹 Total de videos: ${videos.length}`);
    console.log(`📚 Cursos con videos: ${courseCount}`);
    console.log(`📖 Lecciones con videos: ${lessonCount}`);
    console.log(`💾 Tamaño total: ${formatBytes(totalSize)}`);
    console.log(`📊 Tamaño promedio: ${formatBytes(avgSize)}`);
    console.log(`💰 Costo estimado mensual: $${(totalSize / 1024 / 1024 / 1024 * 0.02).toFixed(4)} USD`);

    // Distribución por curso
    console.log(`\n📊 DISTRIBUCIÓN POR CURSO:`);
    const byCourse = {};
    videos.forEach(video => {
      if (!byCourse[video.course]) byCourse[video.course] = 0;
      byCourse[video.course]++;
    });
    
    for (const [course, count] of Object.entries(byCourse)) {
      console.log(`   • ${course}: ${count} videos`);
    }

    await checkDatabaseSync();

  } catch (error) {
    console.error(`❌ Error generando reporte: ${error.message}`);
  }
}

function showUsage() {
  console.log(`
📹 LISTADOR DE VIDEOS - LMS PLATFORM
===================================

📋 USO:
node list-videos.js [opción]

🎯 OPCIONES:
--list, -l     Lista todos los videos organizados
--report, -r   Genera reporte completo con estadísticas  
--db, -d       Verifica sincronización con base de datos
--help, -h     Muestra esta ayuda

📊 EJEMPLOS:
node list-videos.js --list
node list-videos.js --report
node list-videos.js --db

📁 INFORMACIÓN MOSTRADA:
• Estructura: curso/lección/sección
• Tamaño de archivos
• Fecha de subida
• URLs públicas
• Metadata personalizada
• Sincronización con BD
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--list' || args[0] === '-l') {
    await listVideosInBucket();
    return;
  }
  
  if (args[0] === '--report' || args[0] === '-r') {
    await generateReport();
    return;
  }
  
  if (args[0] === '--db' || args[0] === '-d') {
    await checkDatabaseSync();
    return;
  }
  
  if (args[0] === '--help' || args[0] === '-h') {
    showUsage();
    return;
  }
  
  showUsage();
}

if (require.main === module) {
  main().finally(() => {
    database.$disconnect();
  });
}

module.exports = { listVideosInBucket, checkDatabaseSync, generateReport };