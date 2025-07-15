const { Storage } = require('@google-cloud/storage');
require('dotenv').config();

async function testGoogleCloudStorage() {
  console.log('🧪 Probando configuración de Google Cloud Storage...\n');

  try {
    // Verificar variables de entorno
    console.log('1. Verificando variables de entorno...');
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
    const keyFile = process.env.GOOGLE_CLOUD_KEY_FILE;

    if (!projectId) {
      throw new Error('❌ GOOGLE_CLOUD_PROJECT_ID no está configurado');
    }
    if (!bucketName) {
      throw new Error('❌ GOOGLE_CLOUD_BUCKET_NAME no está configurado');
    }
    if (!keyFile) {
      throw new Error('❌ GOOGLE_CLOUD_KEY_FILE no está configurado');
    }

    console.log(`✅ Project ID: ${projectId}`);
    console.log(`✅ Bucket Name: ${bucketName}`);
    console.log(`✅ Key File: ${keyFile}\n`);

    // Inicializar cliente de Storage
    console.log('2. Inicializando cliente de Google Cloud Storage...');
    const storage = new Storage({
      projectId: projectId,
      keyFilename: keyFile,
    });
    console.log('✅ Cliente inicializado correctamente\n');

    // Verificar que el bucket existe
    console.log('3. Verificando que el bucket existe...');
    const bucket = storage.bucket(bucketName);
    const [bucketExists] = await bucket.exists();
    
    if (!bucketExists) {
      console.log(`❌ El bucket "${bucketName}" no existe`);
      console.log('💡 Para crear el bucket:');
      console.log(`   gsutil mb gs://${bucketName}`);
      return;
    }
    console.log(`✅ Bucket "${bucketName}" existe y es accesible\n`);

    // Verificar permisos
    console.log('4. Verificando permisos...');
    try {
      const [files] = await bucket.getFiles({ maxResults: 1 });
      console.log('✅ Permisos de lectura: OK');
    } catch (error) {
      console.log('❌ Error de permisos de lectura:', error.message);
    }

    // Probar subida de archivo de prueba
    console.log('\n5. Probando subida de archivo...');
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = Buffer.from('Archivo de prueba para LMS Platform');
    
    const file = bucket.file(`videos/${testFileName}`);
    const stream = file.createWriteStream({
      metadata: {
        contentType: 'text/plain',
      },
    });

    await new Promise((resolve, reject) => {
      stream.on('error', reject);
      stream.on('finish', resolve);
      stream.end(testContent);
    });

    console.log(`✅ Archivo de prueba subido: videos/${testFileName}`);

    // Verificar que el archivo se subió
    const [fileExists] = await file.exists();
    if (fileExists) {
      console.log('✅ Archivo verificado en el bucket');
      
      // Limpiar: eliminar archivo de prueba
      await file.delete();
      console.log('✅ Archivo de prueba eliminado\n');
    }

    // Mostrar información del bucket
    console.log('6. Información del bucket:');
    const [metadata] = await bucket.getMetadata();
    console.log(`   • Ubicación: ${metadata.location}`);
    console.log(`   • Clase de almacenamiento: ${metadata.storageClass}`);
    console.log(`   • Creado: ${metadata.timeCreated}\n`);

    console.log('🎉 ¡Configuración de Google Cloud Storage EXITOSA!');
    console.log('\n✅ Tu LMS está listo para subir y gestionar videos.');
    console.log('📁 Los videos se almacenarán en la carpeta "videos/" del bucket.');
    console.log('🔗 URLs públicas: https://storage.googleapis.com/' + bucketName + '/videos/filename.mp4');

  } catch (error) {
    console.log('\n❌ Error en la configuración:');
    console.log(error.message);
    console.log('\n💡 Soluciones posibles:');
    console.log('1. Verificar que las variables de entorno estén correctas');
    console.log('2. Confirmar que el archivo de credenciales existe');
    console.log('3. Verificar que el bucket está creado en Google Cloud');
    console.log('4. Confirmar permisos de la Service Account');
    console.log('\n📖 Ver guía completa: GOOGLE_CLOUD_SETUP.md');
  }
}

// Ejecutar prueba
testGoogleCloudStorage();