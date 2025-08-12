#!/usr/bin/env node

// 🎬 ACTUALIZAR VIDEO DEL CAPÍTULO
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const database = new PrismaClient();

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

async function updateChapterVideo(videoUrl) {
  try {
    console.clear();
    colorLog('🎬 ACTUALIZANDO VIDEO DEL CAPÍTULO IA BÁSICO', 'cyan');
    colorLog('='.repeat(50), 'cyan');
    
    // 1. Buscar el primer capítulo de video del curso IA Básico
    colorLog('\n🔍 Buscando capítulo de video...', 'blue');
    
    const chapter = await database.chapter.findFirst({
      where: {
        AND: [
          {
            course: {
              title: {
                contains: 'IA Básico'
              }
            }
          },
          {
            title: {
              contains: '🎥'
            }
          }
        ]
      },
      include: {
        course: {
          select: {
            title: true
          }
        }
      }
    });

    if (!chapter) {
      colorLog('❌ No se encontró el capítulo de video', 'red');
      process.exit(1);
    }

    colorLog(`✅ Capítulo encontrado: ${chapter.title}`, 'green');
    colorLog(`📚 Curso: ${chapter.course.title}`, 'blue');
    
    // 2. Actualizar el videoUrl
    colorLog('\n📹 Actualizando URL del video...', 'blue');
    colorLog(`🔗 Nueva URL: ${videoUrl}`, 'cyan');
    
    const updatedChapter = await database.chapter.update({
      where: {
        id: chapter.id
      },
      data: {
        videoUrl: videoUrl,
        isPublished: true,
        isFree: true
      }
    });

    colorLog('\n✅ ¡CAPÍTULO ACTUALIZADO EXITOSAMENTE!', 'green');
    colorLog('='.repeat(50), 'green');
    
    console.log('📋 DETALLES ACTUALIZADOS:');
    console.log(`   🆔 ID: ${updatedChapter.id}`);
    console.log(`   🎬 Título: ${updatedChapter.title}`);
    console.log(`   🔗 Video URL: ${updatedChapter.videoUrl}`);
    console.log(`   📤 Publicado: ${updatedChapter.isPublished ? 'Sí' : 'No'}`);
    console.log(`   🆓 Gratuito: ${updatedChapter.isFree ? 'Sí' : 'No'}`);
    
    colorLog('\n🌐 ¡El video ya está disponible en el LMS!', 'cyan');
    colorLog('💡 Refresca la página del capítulo para ver el cambio', 'yellow');
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await database.$disconnect();
  }
}

// Obtener URL del video desde argumentos de línea de comandos
const videoUrl = process.argv[2];

if (!videoUrl) {
  colorLog('❌ Error: Proporciona la URL del video', 'red');
  console.log('Uso: node update-chapter-video.js "URL_DEL_VIDEO"');
  process.exit(1);
}

// Ejecutar
updateChapterVideo(videoUrl);