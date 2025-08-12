#!/usr/bin/env node

// 🚀 SUBIDA RÁPIDA DE VIDEO SIN INTERACCIÓN
const { Storage } = require('@google-cloud/storage');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const database = new PrismaClient();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

async function quickUpload() {
  try {
    console.log('🎬 Subiendo video rápidamente...');
    
    const videoPath = '/mnt/c/Users/josep/Downloads/videos_seccion1-intro-ia.mp4';
    const bucketPath = 'videos/ia-basico/fundamentos-intro.mp4';
    
    // Verificar archivo
    if (!fs.existsSync(videoPath)) {
      throw new Error('Video no encontrado en Descargas');
    }
    
    console.log('📁 Archivo encontrado');
    
    // Subir archivo
    await bucket.upload(videoPath, {
      destination: bucketPath,
      metadata: {
        contentType: 'video/mp4',
        cacheControl: 'public, max-age=31536000'
      },
      public: true
    });
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${bucketPath}`;
    console.log('✅ Video subido:', publicUrl);
    
    // Actualizar base de datos
    await database.chapter.update({
      where: { id: '46d61442-277e-4cbd-90b6-cb361afdfa6c' },
      data: { videoUrl: publicUrl }
    });
    
    console.log('✅ Base de datos actualizada');
    console.log('🎉 ¡Listo! Refresca la página del capítulo');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await database.$disconnect();
  }
}

quickUpload();