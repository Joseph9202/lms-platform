#!/usr/bin/env node

// 🎬 SUBIR VIDEO DE PRUEBA AL PRIMER CAPÍTULO DE IA BÁSICO
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

async function main() {
  try {
    console.clear();
    colorLog('🎬 CONFIGURANDO VIDEO DE PRUEBA PARA IA BÁSICO', 'cyan');
    colorLog('='.repeat(50), 'cyan');
    
    // 1. Buscar el curso IA Básico
    colorLog('\n📚 Buscando curso IA Básico...', 'blue');
    
    const curso = await database.course.findFirst({
      where: {
        OR: [
          { title: { contains: 'IA Básico' } },
          { title: { contains: 'IA basico' } },
          { title: { contains: 'ia básico' } },
          { title: { contains: 'Inteligencia Artificial Básico' } }
        ]
      },
      include: {
        chapters: {
          where: {
            isPublished: true
          },
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    if (!curso) {
      colorLog('❌ No se encontró el curso IA Básico', 'red');
      process.exit(1);
    }

    colorLog(`✅ Curso encontrado: ${curso.title}`, 'green');
    colorLog(`📖 Total de capítulos: ${curso.chapters.length}`, 'blue');

    // 2. Buscar el primer capítulo de video (Sección 1, Lección 1)
    colorLog('\n🎥 Buscando primer capítulo de video...', 'blue');
    
    const primerVideo = curso.chapters.find(ch => 
      ch.title.includes('🎥') && 
      (ch.title.includes('Fundamentos') || ch.position <= 5)
    );

    if (!primerVideo) {
      colorLog('❌ No se encontró el primer capítulo de video', 'red');
      process.exit(1);
    }

    colorLog(`✅ Capítulo encontrado: ${primerVideo.title}`, 'green');
    colorLog(`📍 Posición: ${primerVideo.position}`, 'blue');
    colorLog(`🆔 ID: ${primerVideo.id}`, 'blue');

    // 3. URL del video de prueba en Google Cloud Storage
    const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
    const videoTestUrl = `https://storage.googleapis.com/${bucketName}/videos/test/ia-basico-fundamentos-demo.mp4`;
    
    colorLog('\n📤 Configurando video de prueba...', 'blue');
    colorLog(`🔗 URL del video: ${videoTestUrl}`, 'cyan');

    // 4. Actualizar el capítulo con el video de prueba
    const capituloActualizado = await database.chapter.update({
      where: {
        id: primerVideo.id
      },
      data: {
        videoUrl: videoTestUrl,
        description: primerVideo.description || 'Video introducción a los fundamentos de la Inteligencia Artificial. En este primer capítulo aprenderás los conceptos básicos y la historia de la IA.',
        isPublished: true,
        isFree: true
      }
    });

    colorLog('\n✅ ¡CAPÍTULO ACTUALIZADO EXITOSAMENTE!', 'green');
    colorLog('='.repeat(50), 'green');
    
    console.log('📋 DETALLES DEL CAPÍTULO:');
    console.log(`   🎬 Título: ${capituloActualizado.title}`);
    console.log(`   📝 Descripción: ${capituloActualizado.description}`);
    console.log(`   🔗 Video URL: ${capituloActualizado.videoUrl}`);
    console.log(`   📍 Posición: ${capituloActualizado.position}`);
    console.log(`   🆓 Es gratuito: ${capituloActualizado.isFree ? 'Sí' : 'No'}`);
    console.log(`   📤 Publicado: ${capituloActualizado.isPublished ? 'Sí' : 'No'}`);
    
    colorLog('\n🌐 Ahora puedes acceder al curso y ver el video en el primer capítulo', 'cyan');
    colorLog('💡 Navega a /courses/{courseId}/chapters/{chapterId} para ver el video', 'yellow');
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await database.$disconnect();
  }
}

// Ejecutar script
main();