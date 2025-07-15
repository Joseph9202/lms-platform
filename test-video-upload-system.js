const { Storage } = require('@google-cloud/storage');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const database = new PrismaClient();

async function testVideoUploadSystem() {
  console.log('🧪 TESTING SISTEMA DE SUBIDA DE VIDEOS');
  console.log('='.repeat(50));

  let allTestsPassed = true;

  try {
    // TEST 1: Verificar variables de entorno
    console.log('\n1. 🔧 Verificando configuración...');
    
    const requiredEnvVars = [
      'GOOGLE_CLOUD_PROJECT_ID',
      'GOOGLE_CLOUD_BUCKET_NAME', 
      'GOOGLE_CLOUD_KEY_FILE',
      'DATABASE_URL'
    ];

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        console.log(`   ❌ Variable faltante: ${envVar}`);
        allTestsPassed = false;
      } else {
        console.log(`   ✅ ${envVar}: ${process.env[envVar]}`);
      }
    }

    // TEST 2: Verificar archivo de credenciales
    console.log('\n2. 🔐 Verificando credenciales...');
    
    const keyFile = process.env.GOOGLE_CLOUD_KEY_FILE;
    if (fs.existsSync(keyFile)) {
      console.log(`   ✅ Archivo de credenciales encontrado: ${keyFile}`);
      
      const credentials = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
      console.log(`   ✅ Service Account: ${credentials.client_email}`);
      console.log(`   ✅ Project ID: ${credentials.project_id}`);
    } else {
      console.log(`   ❌ Archivo de credenciales no encontrado: ${keyFile}`);
      allTestsPassed = false;
    }

    // TEST 3: Verificar conexión a Google Cloud Storage
    console.log('\n3. ☁️ Verificando Google Cloud Storage...');
    
    const storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    });

    const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);
    const [bucketExists] = await bucket.exists();
    
    if (bucketExists) {
      console.log(`   ✅ Bucket existe: ${process.env.GOOGLE_CLOUD_BUCKET_NAME}`);
      
      // Test de permisos
      const testFileName = `test-upload-${Date.now()}.txt`;
      const testContent = Buffer.from('Test file for video upload system');
      
      try {
        const file = bucket.file(`test/${testFileName}`);
        await file.save(testContent);
        console.log(`   ✅ Permisos de escritura: OK`);
        
        // Limpiar archivo de test
        await file.delete();
        console.log(`   ✅ Permisos de eliminación: OK`);
      } catch (error) {
        console.log(`   ❌ Error de permisos: ${error.message}`);
        allTestsPassed = false;
      }
    } else {
      console.log(`   ❌ Bucket no existe: ${process.env.GOOGLE_CLOUD_BUCKET_NAME}`);
      allTestsPassed = false;
    }

    // TEST 4: Verificar conexión a base de datos
    console.log('\n4. 🗄️ Verificando base de datos...');
    
    try {
      const courseCount = await database.course.count();
      console.log(`   ✅ Conexión a BD exitosa`);
      console.log(`   ✅ Cursos encontrados: ${courseCount}`);
      
      // Verificar que existe el curso de IA Básico
      const iaCourse = await database.course.findFirst({
        where: {
          title: {
            contains: 'IA Básico'
          }
        },
        include: {
          chapters: true
        }
      });
      
      if (iaCourse) {
        console.log(`   ✅ Curso IA Básico encontrado: ${iaCourse.title}`);
        console.log(`   ✅ Capítulos disponibles: ${iaCourse.chapters.length}`);
      } else {
        console.log(`   ⚠️ Curso IA Básico no encontrado - ejecuta create-ia-basico-complete.js`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error de conexión a BD: ${error.message}`);
      allTestsPassed = false;
    }

    // TEST 5: Verificar estructura de carpetas
    console.log('\n5. 📁 Verificando estructura de carpetas...');
    
    const videosDir = './videos';
    if (fs.existsSync(videosDir)) {
      console.log(`   ✅ Carpeta videos/ existe`);
      
      const leccion1Dir = path.join(videosDir, 'leccion-1');
      if (fs.existsSync(leccion1Dir)) {
        console.log(`   ✅ Carpeta videos/leccion-1/ existe`);
        
        // Verificar si hay videos
        const files = fs.readdirSync(leccion1Dir);
        const videoFiles = files.filter(f => f.endsWith('.mp4'));
        
        if (videoFiles.length > 0) {
          console.log(`   ✅ Videos encontrados: ${videoFiles.length}`);
          videoFiles.forEach(file => {
            const filePath = path.join(leccion1Dir, file);
            const stats = fs.statSync(filePath);
            const sizeMB = Math.round(stats.size / (1024 * 1024));
            console.log(`      📹 ${file} (${sizeMB} MB)`);
          });
        } else {
          console.log(`   ⚠️ No hay videos en leccion-1/ - coloca tus videos MP4 ahí`);
        }
      } else {
        console.log(`   ⚠️ Carpeta videos/leccion-1/ no existe`);
      }
    } else {
      console.log(`   ⚠️ Carpeta videos/ no existe - será creada automáticamente`);
    }

    // TEST 6: Verificar archivos de configuración
    console.log('\n6. ⚙️ Verificando archivos de configuración...');
    
    const configFiles = [
      'videos-config-leccion-1.json',
      'upload-videos.js',
      'upload-videos-menu.bat'
    ];
    
    for (const configFile of configFiles) {
      if (fs.existsSync(configFile)) {
        console.log(`   ✅ ${configFile} existe`);
      } else {
        console.log(`   ❌ ${configFile} no encontrado`);
        allTestsPassed = false;
      }
    }

    // RESUMEN
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN DE TESTING:');
    
    if (allTestsPassed) {
      console.log('\n🎉 ¡TODOS LOS TESTS PASARON!');
      console.log('\n✅ Tu sistema está listo para subir videos');
      console.log('✅ Configuración de Google Cloud Storage: OK');
      console.log('✅ Conexión a base de datos: OK');
      console.log('✅ Estructura de archivos: OK');
      
      console.log('\n🚀 PRÓXIMOS PASOS:');
      console.log('1. Coloca tus videos MP4 en ./videos/leccion-1/');
      console.log('2. Ejecuta: upload-videos-menu.bat');
      console.log('3. Selecciona opción para subir videos');
      console.log('4. ¡Disfruta tu sistema automatizado!');
      
    } else {
      console.log('\n❌ ALGUNOS TESTS FALLARON');
      console.log('\n🔧 ACCIONES REQUERIDAS:');
      console.log('• Verifica configuración de Google Cloud');
      console.log('• Confirma variables en archivo .env');
      console.log('• Ejecuta scripts de setup si es necesario');
      console.log('• Revisa documentación de implementación');
      
      console.log('\n💡 COMANDOS ÚTILES:');
      console.log('• node test-gcs-final.js (test Google Cloud)');
      console.log('• node create-ia-basico-complete.js (crear curso)');
      console.log('• implementar-leccion-1.bat (setup completo)');
    }

  } catch (error) {
    console.error('\n❌ Error durante testing:', error.message);
    allTestsPassed = false;
  } finally {
    await database.$disconnect();
  }

  return allTestsPassed;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testVideoUploadSystem()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { testVideoUploadSystem };