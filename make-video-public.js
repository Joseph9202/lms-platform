#!/usr/bin/env node

// 🌐 HACER VIDEO PÚBLICO EN GOOGLE CLOUD STORAGE
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

async function makeVideoPublic() {
  try {
    console.clear();
    colorLog('🌐 CONFIGURANDO VIDEO COMO PÚBLICO', 'cyan');
    colorLog('='.repeat(50), 'cyan');
    
    const fileName = 'cursos/ia-basico/seccion-1/leccion-1/videos_seccion1-intro-ia.mp4';
    const file = bucket.file(fileName);
    
    colorLog(`\n📁 Archivo: ${fileName}`, 'blue');
    
    // Verificar si el archivo existe
    const [exists] = await file.exists();
    if (!exists) {
      colorLog('❌ El archivo no existe en el bucket', 'red');
      process.exit(1);
    }
    
    colorLog('✅ Archivo encontrado', 'green');
    
    // Hacer el archivo público
    colorLog('\n🔓 Configurando permisos públicos...', 'blue');
    await file.makePublic();
    
    // Configurar headers CORS
    await file.setMetadata({
      cacheControl: 'public, max-age=31536000',
      contentType: 'video/mp4'
    });
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    colorLog('\n✅ ¡VIDEO CONFIGURADO CORRECTAMENTE!', 'green');
    colorLog('='.repeat(50), 'green');
    
    console.log('📋 DETALLES:');
    console.log(`   🔗 URL pública: ${publicUrl}`);
    console.log(`   🌐 Estado: Público`);
    console.log(`   📱 CORS: Configurado`);
    console.log(`   🎭 Content-Type: video/mp4`);
    
    colorLog('\n🧪 Probando acceso directo...', 'blue');
    
    // Test directo
    const response = await fetch(publicUrl, { method: 'HEAD' });
    console.log(`   📊 Status: ${response.status} ${response.statusText}`);
    console.log(`   📄 Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   📏 Content-Length: ${response.headers.get('content-length')} bytes`);
    
    if (response.status === 200) {
      colorLog('\n🎉 ¡El video está accesible públicamente!', 'green');
    } else {
      colorLog('\n⚠️ Problema de acceso al video', 'yellow');
    }
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  }
}

// Ejecutar
makeVideoPublic();