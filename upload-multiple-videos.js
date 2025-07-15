const fs = require('fs');
const path = require('path');
const { uploadVideo, VIDEO_STRUCTURE } = require('./upload-video');

// Mapeo de nombres de archivos a estructura
const FILE_MAPPING = {
  // IA Básico - Lección 1
  'fundamentos-ia': { course: 'ia-basico', lesson: 'leccion-1', section: 'video-principal' },
  'video-fundamentos': { course: 'ia-basico', lesson: 'leccion-1', section: 'video-principal' },
  'historia-ia': { course: 'ia-basico', lesson: 'leccion-1', section: 'video-principal' },
  
  'tesla': { course: 'ia-basico', lesson: 'leccion-1', section: 'caso-tesla' },
  'caso-tesla': { course: 'ia-basico', lesson: 'leccion-1', section: 'caso-tesla' },
  'conduccion-autonoma': { course: 'ia-basico', lesson: 'leccion-1', section: 'caso-tesla' },
  
  'laboratorio': { course: 'ia-basico', lesson: 'leccion-1', section: 'laboratorio' },
  'lab-gcp': { course: 'ia-basico', lesson: 'leccion-1', section: 'laboratorio' },
  'google-cloud': { course: 'ia-basico', lesson: 'leccion-1', section: 'laboratorio' },
  'primer-modelo': { course: 'ia-basico', lesson: 'leccion-1', section: 'laboratorio' },
  
  'quiz': { course: 'ia-basico', lesson: 'leccion-1', section: 'quiz' },
  'evaluacion': { course: 'ia-basico', lesson: 'leccion-1', section: 'quiz' },
  
  // IA Básico - Lección 2
  'tipos-ml': { course: 'ia-basico', lesson: 'leccion-2', section: 'video-principal' },
  'machine-learning': { course: 'ia-basico', lesson: 'leccion-2', section: 'video-principal' },
  'supervisado-no-supervisado': { course: 'ia-basico', lesson: 'leccion-2', section: 'video-principal' },
  
  'netflix': { course: 'ia-basico', lesson: 'leccion-2', section: 'caso-netflix' },
  'caso-netflix': { course: 'ia-basico', lesson: 'leccion-2', section: 'caso-netflix' },
  'recomendaciones': { course: 'ia-basico', lesson: 'leccion-2', section: 'caso-netflix' },
  
  // IA Intermedio
  'deep-learning': { course: 'ia-intermedio', lesson: 'leccion-1', section: 'video-principal' },
  'redes-neuronales': { course: 'ia-intermedio', lesson: 'leccion-1', section: 'video-principal' },
  'neural-networks': { course: 'ia-intermedio', lesson: 'leccion-1', section: 'video-principal' }
};

function detectVideoStructure(fileName) {
  const baseName = path.basename(fileName, path.extname(fileName)).toLowerCase();
  
  // Buscar coincidencia exacta
  if (FILE_MAPPING[baseName]) {
    return FILE_MAPPING[baseName];
  }
  
  // Buscar coincidencia parcial
  for (const [key, structure] of Object.entries(FILE_MAPPING)) {
    if (baseName.includes(key)) {
      return structure;
    }
  }
  
  return null;
}

function getVideoFiles(dirPath) {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
  const files = [];
  
  function scanDirectory(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (videoExtensions.includes(path.extname(item).toLowerCase())) {
        files.push(fullPath);
      }
    }
  }
  
  scanDirectory(dirPath);
  return files;
}

async function uploadMultipleVideos(folderPath) {
  try {
    console.log(`📁 Escaneando carpeta: ${folderPath}`);
    
    if (!fs.existsSync(folderPath)) {
      throw new Error(`❌ Carpeta no encontrada: ${folderPath}`);
    }
    
    const videoFiles = getVideoFiles(folderPath);
    
    if (videoFiles.length === 0) {
      console.log("⚠️  No se encontraron archivos de video en la carpeta");
      return;
    }
    
    console.log(`📹 Encontrados ${videoFiles.length} videos para procesar\n`);
    
    const results = [];
    
    for (let i = 0; i < videoFiles.length; i++) {
      const videoPath = videoFiles[i];
      const fileName = path.basename(videoPath);
      
      console.log(`\n📊 PROCESANDO VIDEO ${i + 1}/${videoFiles.length}`);
      console.log(`📁 Archivo: ${fileName}`);
      
      // Detectar estructura automáticamente
      const structure = detectVideoStructure(fileName);
      
      if (!structure) {
        console.log(`⚠️  No se pudo determinar la estructura para: ${fileName}`);
        console.log(`💡 Renombra el archivo con uno de estos prefijos:`);
        console.log(`   • fundamentos-ia.mp4`);
        console.log(`   • caso-tesla.mp4`);
        console.log(`   • laboratorio.mp4`);
        console.log(`   • quiz.mp4`);
        results.push({ file: fileName, status: 'skipped', reason: 'Estructura no detectada' });
        continue;
      }
      
      console.log(`🎯 Detectado: ${structure.course}/${structure.lesson}/${structure.section}`);
      
      try {
        const result = await uploadVideo(videoPath, structure.course, structure.lesson, structure.section);
        console.log(`✅ Subido exitosamente: ${fileName}`);
        results.push({ 
          file: fileName, 
          status: 'success', 
          url: result.url,
          structure: structure 
        });
      } catch (error) {
        console.log(`❌ Error subiendo ${fileName}: ${error.message}`);
        results.push({ 
          file: fileName, 
          status: 'error', 
          error: error.message 
        });
      }
    }
    
    // Resumen final
    console.log(`\n===============================================`);
    console.log(`📊 RESUMEN DE SUBIDA MÚLTIPLE`);
    console.log(`===============================================`);
    
    const successful = results.filter(r => r.status === 'success');
    const errors = results.filter(r => r.status === 'error');
    const skipped = results.filter(r => r.status === 'skipped');
    
    console.log(`✅ Exitosos: ${successful.length}`);
    console.log(`❌ Errores: ${errors.length}`);
    console.log(`⚠️  Omitidos: ${skipped.length}`);
    console.log(`📊 Total: ${results.length}`);
    
    if (successful.length > 0) {
      console.log(`\n✅ VIDEOS SUBIDOS EXITOSAMENTE:`);
      successful.forEach(result => {
        console.log(`   • ${result.file} → ${result.structure.course}/${result.structure.lesson}/${result.structure.section}`);
      });
    }
    
    if (errors.length > 0) {
      console.log(`\n❌ VIDEOS CON ERRORES:`);
      errors.forEach(result => {
        console.log(`   • ${result.file}: ${result.error}`);
      });
    }
    
    if (skipped.length > 0) {
      console.log(`\n⚠️  VIDEOS OMITIDOS:`);
      skipped.forEach(result => {
        console.log(`   • ${result.file}: ${result.reason}`);
      });
    }
    
  } catch (error) {
    console.error(`❌ Error en subida múltiple: ${error.message}`);
  }
}

function showBulkUsage() {
  console.log(`
📹 SUBIDA MÚLTIPLE DE VIDEOS - LMS PLATFORM
==========================================

📋 USO:
node upload-multiple-videos.js <carpeta-con-videos>

📁 ESTRUCTURA RECOMENDADA:
Videos/
├── fundamentos-ia.mp4          → ia-basico/leccion-1/video-principal
├── caso-tesla.mp4              → ia-basico/leccion-1/caso-tesla
├── laboratorio.mp4             → ia-basico/leccion-1/laboratorio
├── tipos-ml.mp4                → ia-basico/leccion-2/video-principal
└── deep-learning.mp4           → ia-intermedio/leccion-1/video-principal

🏷️  NOMBRES RECONOCIDOS AUTOMÁTICAMENTE:

IA BÁSICO - LECCIÓN 1:
• fundamentos-ia, video-fundamentos, historia-ia
• tesla, caso-tesla, conduccion-autonoma  
• laboratorio, lab-gcp, google-cloud, primer-modelo
• quiz, evaluacion

IA BÁSICO - LECCIÓN 2:
• tipos-ml, machine-learning, supervisado-no-supervisado
• netflix, caso-netflix, recomendaciones

IA INTERMEDIO - LECCIÓN 1:
• deep-learning, redes-neuronales, neural-networks

📝 EJEMPLO:
node upload-multiple-videos.js ./Videos
node upload-multiple-videos.js "C:\\Users\\usuario\\Videos\\LMS"

💡 CONSEJOS:
• Usa nombres descriptivos que coincidan con los patrones
• Organiza los videos en una sola carpeta
• Verifica conexión estable a internet
• El script procesará automáticamente subcarpetas
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    showBulkUsage();
    return;
  }
  
  if (args[0] === '--patterns' || args[0] === '-p') {
    console.log("🏷️  PATRONES DE NOMBRES RECONOCIDOS:\n");
    console.log(JSON.stringify(FILE_MAPPING, null, 2));
    return;
  }
  
  const folderPath = args[0];
  await uploadMultipleVideos(folderPath);
}

if (require.main === module) {
  main();
}

module.exports = { uploadMultipleVideos, detectVideoStructure, FILE_MAPPING };