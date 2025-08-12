#!/usr/bin/env node

// 🔍 LISTAR VIDEOS EN GOOGLE CLOUD STORAGE BUCKET
const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

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

async function listVideosInBucket() {
  try {
    console.clear();
    colorLog('🔍 BUSCANDO VIDEOS EN GOOGLE CLOUD STORAGE', 'cyan');
    colorLog('='.repeat(50), 'cyan');
    
    colorLog(`\n📦 Bucket: ${bucket.name}`, 'blue');
    colorLog('🔍 Buscando archivos de video...', 'blue');
    
    const [files] = await bucket.getFiles();
    
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.m4v'];
    const videoFiles = files.filter(file => 
      videoExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );
    
    if (videoFiles.length === 0) {
      colorLog('\n❌ No se encontraron archivos de video en el bucket', 'red');
      
      // Mostrar todos los archivos para referencia
      colorLog('\n📁 Archivos disponibles en el bucket:', 'yellow');
      files.slice(0, 10).forEach(file => {
        console.log(`   📄 ${file.name}`);
      });
      
      if (files.length > 10) {
        console.log(`   ... y ${files.length - 10} archivos más`);
      }
      
      return;
    }
    
    colorLog(`\n✅ Se encontraron ${videoFiles.length} archivos de video:`, 'green');
    colorLog('='.repeat(50), 'green');
    
    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i];
      const metadata = await file.getMetadata();
      const sizeInMB = (parseInt(metadata[0].size) / (1024 * 1024)).toFixed(2);
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
      
      console.log(`\n${i + 1}. 📹 ${file.name}`);
      console.log(`   📏 Tamaño: ${sizeInMB} MB`);
      console.log(`   📅 Creado: ${metadata[0].timeCreated}`);
      console.log(`   🔗 URL: ${publicUrl}`);
      console.log(`   🌐 Público: ${metadata[0].acl ? 'Sí' : 'Verificando...'}`);
    }
    
    // Recomendar el primer video encontrado
    if (videoFiles.length > 0) {
      const recommendedVideo = videoFiles[0];
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${recommendedVideo.name}`;
      
      colorLog('\n🎯 VIDEO RECOMENDADO PARA USAR:', 'cyan');
      colorLog('='.repeat(50), 'cyan');
      console.log(`📹 Archivo: ${recommendedVideo.name}`);
      console.log(`🔗 URL: ${publicUrl}`);
      
      colorLog('\n💡 Para usar este video, ejecuta:', 'yellow');
      console.log(`node update-chapter-video.js "${publicUrl}"`);
    }
    
  } catch (error) {
    colorLog(`\n❌ Error accediendo al bucket: ${error.message}`, 'red');
    console.error(error);
  }
}

// Ejecutar
listVideosInBucket();