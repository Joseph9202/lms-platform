#!/usr/bin/env node

// 🎬 SUBIR VIDEO REAL A GOOGLE CLOUD STORAGE
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

async function createTestVideoFile() {
  // Crear un video HTML5 de prueba usando un archivo de texto
  const testVideoContent = `
<!-- HTML5 Video Test File -->
<!DOCTYPE html>
<html>
<head>
    <title>IA Básico - Fundamentos de IA</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 50px;
            text-align: center;
        }
        .video-placeholder {
            background: rgba(0,0,0,0.5);
            border-radius: 10px;
            padding: 40px;
            margin: 20px auto;
            max-width: 800px;
        }
        h1 { color: #4CAF50; }
        .info { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="video-placeholder">
        <h1>🎥 IA Básico - Fundamentos de Inteligencia Artificial</h1>
        <h2>Sección 1: Historia, Definiciones y Conceptos Clave</h2>
        
        <div class="info">
            <h3>📚 Contenido del video:</h3>
            <p>✅ Historia de la Inteligencia Artificial</p>
            <p>✅ Definiciones fundamentales</p>
            <p>✅ Tipos de IA: Débil vs Fuerte</p>
            <p>✅ Aplicaciones actuales</p>
            <p>✅ Machine Learning vs Deep Learning</p>
        </div>
        
        <div class="info">
            <h3>🎯 Objetivos de aprendizaje:</h3>
            <p>Al finalizar este video podrás:</p>
            <p>• Explicar qué es la Inteligencia Artificial</p>
            <p>• Identificar los hitos históricos más importantes</p>
            <p>• Distinguir entre diferentes tipos de IA</p>
            <p>• Reconocer aplicaciones de IA en la vida cotidiana</p>
        </div>
        
        <div class="info">
            <p><strong>⏱️ Duración:</strong> 25-30 minutos</p>
            <p><strong>👨‍🏫 Instructor:</strong> IA Pacific Labs</p>
            <p><strong>📅 Fecha:</strong> 2025</p>
        </div>
        
        <p style="margin-top: 40px; font-size: 18px;">
            🎬 <strong>Este es un archivo de demostración</strong><br>
            El video real será cargado por el instructor
        </p>
    </div>
    
    <script>
        // Simular reproducción de video
        setTimeout(() => {
            document.body.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
            document.querySelector('h1').innerHTML = '✅ Video Completado - IA Básico';
        }, 3000);
    </script>
</body>
</html>
`;

  return Buffer.from(testVideoContent, 'utf-8');
}

async function uploadTestVideo() {
  try {
    console.clear();
    colorLog('🎬 SUBIENDO VIDEO DE PRUEBA A GOOGLE CLOUD STORAGE', 'cyan');
    colorLog('='.repeat(60), 'cyan');
    
    // 1. Crear archivo de prueba
    colorLog('\n📁 Creando archivo de video de prueba...', 'blue');
    const videoContent = await createTestVideoFile();
    
    // 2. Configurar ruta en GCS
    const fileName = 'ia-basico-fundamentos-demo.mp4';
    const bucketPath = `videos/test/${fileName}`;
    
    colorLog(`📤 Subiendo a: gs://${bucket.name}/${bucketPath}`, 'blue');
    
    // 3. Crear archivo en GCS
    const file = bucket.file(bucketPath);
    
    await file.save(videoContent, {
      metadata: {
        contentType: 'video/mp4',
        cacheControl: 'public, max-age=31536000',
        metadata: {
          curso: 'IA Básico - Certificación Profesional',
          seccion: '1',
          leccion: '1',
          titulo: 'Fundamentos de IA: Historia, Definiciones y Conceptos Clave',
          tipo: 'video-demo',
          fechaSubida: new Date().toISOString()
        }
      }
    });
    
    // 4. Hacer el archivo público
    await file.makePublic();
    
    // 5. Obtener URL pública
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${bucketPath}`;
    
    colorLog('\n✅ ¡VIDEO SUBIDO EXITOSAMENTE!', 'green');
    colorLog('='.repeat(60), 'green');
    
    console.log('📋 DETALLES DEL ARCHIVO:');
    console.log(`   📁 Nombre: ${fileName}`);
    console.log(`   📂 Ruta: ${bucketPath}`);
    console.log(`   🔗 URL pública: ${publicUrl}`);
    console.log(`   📦 Bucket: ${bucket.name}`);
    console.log(`   🌐 Estado: Público`);
    
    colorLog('\n🎯 El video ya está disponible en el curso IA Básico', 'cyan');
    colorLog('💡 Accede al LMS y navega al primer capítulo para verlo', 'yellow');
    
    return publicUrl;
    
  } catch (error) {
    colorLog(`\n❌ Error subiendo video: ${error.message}`, 'red');
    throw error;
  }
}

// Verificar configuración
function verificarConfiguracion() {
  const errores = [];
  
  if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
    errores.push('GOOGLE_CLOUD_PROJECT_ID no configurado');
  }
  
  if (!process.env.GOOGLE_CLOUD_KEY_FILE) {
    errores.push('GOOGLE_CLOUD_KEY_FILE no configurado');
  }
  
  if (!process.env.GOOGLE_CLOUD_BUCKET_NAME) {
    errores.push('GOOGLE_CLOUD_BUCKET_NAME no configurado');
  }
  
  if (errores.length > 0) {
    colorLog('❌ Errores de configuración:', 'red');
    errores.forEach(error => console.log(`   • ${error}`));
    process.exit(1);
  }
}

// Ejecutar
async function main() {
  verificarConfiguracion();
  await uploadTestVideo();
}

main().catch(console.error);