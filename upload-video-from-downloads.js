#!/usr/bin/env node

// 🎬 SUBIR VIDEO DESDE DESCARGAS A GOOGLE CLOUD STORAGE
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

async function uploadVideoFromDownloads() {
  try {
    console.clear();
    colorLog('🎬 SUBIENDO VIDEO DESDE DESCARGAS', 'cyan');
    colorLog('='.repeat(50), 'cyan');
    
    // 1. Verificar que el archivo existe
    const videoPath = '/mnt/c/Users/josep/Downloads/videos_seccion1-intro-ia.mp4';
    
    if (!fs.existsSync(videoPath)) {
      colorLog('❌ No se encontró el archivo de video en Descargas', 'red');
      process.exit(1);
    }
    
    const fileName = path.basename(videoPath);
    const fileSize = fs.statSync(videoPath).size;
    const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
    
    colorLog(`✅ Video encontrado: ${fileName}`, 'green');
    colorLog(`📏 Tamaño: ${fileSizeMB} MB`, 'blue');
    
    // 2. Configurar ruta en Google Cloud Storage
    const bucketPath = `videos/ia-basico/seccion-1/intro-ia-fundamentos.mp4`;
    const file = bucket.file(bucketPath);
    
    colorLog(`\n📤 Subiendo a: gs://${bucket.name}/${bucketPath}`, 'blue');
    
    // 3. Crear stream de subida con progreso
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'video/mp4',
        cacheControl: 'public, max-age=31536000',
        metadata: {
          curso: 'IA Básico - Certificación Profesional',
          seccion: '1',
          leccion: '1',
          titulo: 'Fundamentos de IA: Historia, Definiciones y Conceptos Clave',
          fechaSubida: new Date().toISOString(),
          tamaño: fileSize.toString()
        }
      },
      public: true
    });
    
    // 4. Mostrar progreso
    let uploadedBytes = 0;
    const totalBytes = fileSize;
    
    return new Promise((resolve, reject) => {
      stream.on('error', (error) => {
        reject(new Error(`Error subiendo archivo: ${error.message}`));
      });
      
      stream.on('progress', (bytesWritten) => {
        uploadedBytes = bytesWritten;
        const progress = Math.round((uploadedBytes / totalBytes) * 100);
        process.stdout.write(`\\r⏳ Progreso: ${progress}% (${(uploadedBytes / (1024 * 1024)).toFixed(1)} MB de ${(totalBytes / (1024 * 1024)).toFixed(1)} MB)`);
      });
      
      stream.on('finish', async () => {
        try {
          console.log('\\n');
          
          // Hacer el archivo público
          await file.makePublic();
          
          // URL pública del video
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${bucketPath}`;
          
          colorLog('✅ Video subido exitosamente a Google Cloud Storage', 'green');
          colorLog(`🔗 URL: ${publicUrl}`, 'cyan');
          
          // 5. Actualizar capítulo en base de datos
          colorLog('\\n📝 Actualizando capítulo en base de datos...', 'blue');
          
          const updatedChapter = await database.chapter.update({
            where: {
              id: '46d61442-277e-4cbd-90b6-cb361afdfa6c'
            },
            data: {
              videoUrl: publicUrl,
              isPublished: true,
              isFree: true
            }
          });
          
          colorLog('✅ Base de datos actualizada', 'green');
          
          colorLog('\\n🎉 ¡VIDEO CONFIGURADO EXITOSAMENTE!', 'green');
          colorLog('='.repeat(50), 'green');
          
          console.log('📋 DETALLES FINALES:');
          console.log(`   🎬 Capítulo: ${updatedChapter.title}`);
          console.log(`   🔗 Video URL: ${updatedChapter.videoUrl}`);
          console.log(`   📏 Tamaño: ${fileSizeMB} MB`);
          console.log(`   🌐 Estado: Público y accesible`);
          
          colorLog('\\n🚀 Ve al LMS y refresca la página para ver el video', 'cyan');
          
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
    colorLog(`\\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await database.$disconnect();
  }
}

// Ejecutar
uploadVideoFromDownloads();