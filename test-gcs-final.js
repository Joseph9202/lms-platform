const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

async function testGoogleCloudStorage() {
  console.log('🧪 Probando configuración de Google Cloud Storage...\n');

  try {
    // Verificar variables de entorno
    console.log('1. Verificando configuración...');
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
    const keyFile = process.env.GOOGLE_CLOUD_KEY_FILE;

    console.log(`   • Project ID: ${projectId || '❌ NO CONFIGURADO'}`);
    console.log(`   • Bucket Name: ${bucketName || '❌ NO CONFIGURADO'}`);
    console.log(`   • Key File: ${keyFile || '❌ NO CONFIGURADO'}`);

    if (!projectId || !bucketName || !keyFile) {
      console.log('\n❌ Variables de entorno faltantes en .env');
      console.log('\n💡 Verifica que tu archivo .env contenga:');
      console.log('GOOGLE_CLOUD_PROJECT_ID="ai-academy-461719"');
      console.log('GOOGLE_CLOUD_BUCKET_NAME="tu-bucket-name"');
      console.log('GOOGLE_CLOUD_KEY_FILE="./google-cloud-credentials.json"');
      return;
    }

    if (bucketName === 'NECESITAS_AGREGAR_EL_NOMBRE_DEL_BUCKET') {
      console.log('\n❌ Necesitas agregar el nombre real del bucket');
      console.log('\n💡 Ve a Google Cloud Shell y ejecuta:');
      console.log('gsutil ls');
      console.log('\nLuego reemplaza en .env el nombre del bucket');
      return;
    }

    console.log('\n2. Verificando archivo de credenciales...');
    const fs = require('fs');
    if (!fs.existsSync(keyFile)) {
      console.log(`❌ Archivo de credenciales no encontrado: ${keyFile}`);
      return;
    }
    
    const credentials = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
    console.log(`   ✅ Service Account: ${credentials.client_email}`);
    console.log(`   ✅ Project: ${credentials.project_id}`);

    // Inicializar cliente de Storage
    console.log('\n3. Conectando a Google Cloud Storage...');
    const storage = new Storage({
      projectId: projectId,
      keyFilename: keyFile,
    });

    const bucket = storage.bucket(bucketName);

    // Verificar que el bucket existe
    console.log('4. Verificando bucket...');
    const [bucketExists] = await bucket.exists();
    
    if (!bucketExists) {
      console.log(`❌ El bucket "${bucketName}" no existe`);
      console.log('\n💡 Verifica el nombre del bucket o créalo con:');
      console.log(`gsutil mb gs://${bucketName}`);
      return;
    }
    console.log(`   ✅ Bucket "${bucketName}" existe y es accesible`);

    // Probar subida de archivo de prueba
    console.log('\n5. Probando subida de archivo...');
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = Buffer.from('Prueba de LMS Platform - Video Storage');
    
    const file = bucket.file(`videos/${testFileName}`);
    await file.save(testContent, {
      metadata: {
        contentType: 'text/plain',
      },
    });

    console.log(`   ✅ Archivo subido: videos/${testFileName}`);

    // Verificar descarga
    console.log('6. Verificando descarga...');
    const [downloadedContent] = await file.download();
    
    if (downloadedContent.toString() === testContent.toString()) {
      console.log('   ✅ Archivo descargado correctamente');
      
      // Limpiar archivo de prueba
      await file.delete();
      console.log('   ✅ Archivo de prueba eliminado');
    }

    // Mostrar URLs de ejemplo
    console.log('\n7. URLs de tus videos:');
    console.log(`   📁 Bucket: gs://${bucketName}`);
    console.log(`   🌐 URL pública: https://storage.googleapis.com/${bucketName}/videos/`);
    console.log(`   🎬 Ejemplo: https://storage.googleapis.com/${bucketName}/videos/mi-video.mp4`);

    console.log('\n🎉 ¡CONFIGURACIÓN EXITOSA!');
    console.log('\n✅ Tu LMS está listo para subir y gestionar videos');
    console.log('✅ Puedes usar los componentes de video en tu aplicación');
    console.log('✅ Los videos se almacenarán de forma segura y económica');

    console.log('\n🚀 Siguiente paso: Ejecutar tu aplicación');
    console.log('npm run dev');

  } catch (error) {
    console.log('\n❌ Error en la configuración:');
    console.log(`Error: ${error.message}`);
    
    if (error.code === 'ENOENT') {
      console.log('\n💡 Archivo de credenciales no encontrado');
      console.log('Verifica que google-cloud-credentials.json esté en la raíz del proyecto');
    } else if (error.code === 'EACCES' || error.message.includes('permission')) {
      console.log('\n💡 Problema de permisos');
      console.log('Verifica que la Service Account tenga rol Storage Admin');
    } else if (error.message.includes('bucket')) {
      console.log('\n💡 Problema con el bucket');
      console.log('Verifica el nombre del bucket en .env');
    }
    
    console.log('\n📖 Ver guía completa: GOOGLE_CLOUD_SETUP.md');
  }
}

// Ejecutar prueba
testGoogleCloudStorage();