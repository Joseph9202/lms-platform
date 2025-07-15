#!/usr/bin/env node

// 🎛️ MENÚ INTERACTIVO AVANZADO PARA GESTIÓN DE VIDEOS
// Para LMS Platform - IA Pacific Labs

const readline = require('readline');
const { analyzeStorage, cleanupOldFiles, auditVideos, upgradeAllToAdaptive } = require('./lib/video-optimization-system.js');
const { analytics, generateVideoReport } = require('./lib/video-analytics-system.js');
const { uploadSingleVideo, uploadMultipleVideos, showAvailableStructure } = require('./upload-videos.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 🎨 Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorLog(text, color = 'reset') {
  console.log(colors[color] + text + colors.reset);
}

function showHeader() {
  console.clear();
  colorLog('🎬═══════════════════════════════════════════════════════════════', 'cyan');
  colorLog('   PACIFIC LABS - SISTEMA AVANZADO DE GESTIÓN DE VIDEOS', 'bright');
  colorLog('   LMS Platform - Versión Profesional 2025', 'cyan');
  colorLog('═══════════════════════════════════════════════════════════════🎬', 'cyan');
  console.log('');
}

function showMainMenu() {
  colorLog('📋 MENÚ PRINCIPAL:', 'yellow');
  console.log('');
  colorLog('🎥 GESTIÓN DE VIDEOS:', 'green');
  console.log('   1. Subir video individual');
  console.log('   2. Subir múltiples videos (lote)');
  console.log('   3. Ver estructura disponible');
  console.log('   4. Crear video con calidad adaptiva');
  console.log('');
  colorLog('📊 ANALYTICS Y REPORTES:', 'blue');
  console.log('   5. Generar reporte de analytics');
  console.log('   6. Análisis de almacenamiento');
  console.log('   7. Auditoría de integridad');
  console.log('');
  colorLog('🔧 HERRAMIENTAS AVANZADAS:', 'magenta');
  console.log('   8. Migrar a calidad adaptiva');
  console.log('   9. Limpieza automática');
  console.log('   10. Optimización masiva');
  console.log('');
  colorLog('📚 AYUDA Y CONFIGURACIÓN:', 'cyan');
  console.log('   11. Ayuda y documentación');
  console.log('   12. Configurar sistema');
  console.log('');
  console.log('   0. Salir');
  console.log('');
}

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, resolve);
  });
}

async function handleVideoUpload() {
  try {
    colorLog('\n🎥 SUBIDA DE VIDEO INDIVIDUAL', 'green');
    console.log('Proporciona la información del video:');
    
    const videoPath = await question('📁 Ruta del video: ');
    const courseKey = await question('🎓 Clave del curso (ej: ia-basico): ');
    const lessonKey = await question('📚 Clave de la lección (ej: leccion-1): ');
    const videoKey = await question('🎬 Clave del video (ej: video-principal): ');
    
    colorLog('\n🚀 Iniciando subida...', 'yellow');
    await uploadSingleVideo(videoPath, courseKey, lessonKey, videoKey);
    colorLog('\n✅ Video subido exitosamente!', 'green');
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
  }
  
  await question('\nPresiona Enter para continuar...');
}

async function handleBatchUpload() {
  try {
    colorLog('\n📦 SUBIDA MÚLTIPLE DE VIDEOS', 'green');
    console.log('Archivos de configuración disponibles:');
    console.log('- videos-config-leccion-1.json');
    console.log('- videos-config-leccion-2.json');
    
    const configFile = await question('\n📋 Archivo de configuración: ');
    
    colorLog('\n🚀 Iniciando subida por lotes...', 'yellow');
    
    const fs = require('fs');
    if (!fs.existsSync(configFile)) {
      throw new Error(`Archivo no encontrado: ${configFile}`);
    }
    
    const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
    await uploadMultipleVideos(config);
    colorLog('\n✅ Subida por lotes completada!', 'green');
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
  }
  
  await question('\nPresiona Enter para continuar...');
}

async function handleShowStructure() {
  try {
    colorLog('\n🗂️ ESTRUCTURA DISPONIBLE', 'cyan');
    await showAvailableStructure();
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
  }
  
  await question('\nPresiona Enter para continuar...');
}

async function handleAdaptiveVideo() {
  try {
    colorLog('\n🎭 CREAR VIDEO CON CALIDAD ADAPTIVA', 'magenta');
    console.log('Genera automáticamente múltiples calidades (480p, 720p, 1080p)');
    
    const videoPath = await question('📁 Ruta del video original: ');
    const courseKey = await question('🎓 Clave del curso: ');
    const lessonKey = await question('📚 Clave de la lección: ');
    const videoKey = await question('🎬 Clave del video: ');
    
    colorLog('\n🔄 Procesando video adaptivo (esto puede tomar varios minutos)...', 'yellow');
    
    const { createAdaptiveVideo } = require('./lib/video-optimization-system.js');
    const result = await createAdaptiveVideo(videoPath, courseKey, lessonKey, videoKey);
    
    colorLog('\n✅ Video adaptivo creado exitosamente!', 'green');
    console.log('Calidades generadas:');
    Object.entries(result).forEach(([quality, url]) => {
      console.log(`   ${quality}: ${url}`);
    });
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
  }
  
  await question('\nPresiona Enter para continuar...');
}

async function handleAnalyticsReport() {
  try {
    colorLog('\n📊 GENERAR REPORTE DE ANALYTICS', 'blue');
    
    const chapterId = await question('🆔 ID del capítulo: ');
    const timeRange = await question('📅 Rango de tiempo (1d/7d/30d/90d) [7d]: ') || '7d';
    
    colorLog('\n📈 Generando reporte...', 'yellow');
    const report = await generateVideoReport(chapterId, timeRange);
    
    colorLog('\n📊 REPORTE DE ANALYTICS:', 'blue');
    console.log(`Capítulo: ${chapterId}`);
    console.log(`Período: ${timeRange}`);
    console.log(`Visualizaciones: ${report.totalViews}`);
    console.log(`Tiempo total: ${Math.round(report.totalWatchTime / 60)} minutos`);
    console.log(`Tasa de completación: ${report.averageCompletionRate}%`);
    console.log(`Score de engagement: ${report.engagementScore}/100`);
    
    if (report.dropoffAnalysis && report.dropoffAnalysis.recommendations) {
      console.log('\n💡 Recomendaciones:');
      report.dropoffAnalysis.recommendations.forEach(rec => {
        console.log(`   • ${rec}`);
      });
    }
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
  }
  
  await question('\nPresiona Enter para continuar...');
}

async function handleStorageAnalysis() {
  try {
    colorLog('\n💾 ANÁLISIS DE ALMACENAMIENTO', 'cyan');
    colorLog('🔍 Analizando uso de Google Cloud Storage...', 'yellow');
    
    const analysis = await analyzeStorage();
    
    colorLog('\n📈 RESULTADOS DEL ANÁLISIS:', 'cyan');
    console.log(`Total de archivos: ${analysis.totalFiles}`);
    console.log(`Tamaño total: ${analysis.totalSizeGB} GB`);
    console.log(`Costo mensual estimado: $${analysis.estimatedMonthlyCost} USD`);
    
    console.log('\n📚 Desglose por curso:');
    Object.entries(analysis.courseBreakdown).forEach(([course, size]) => {
      console.log(`   ${course}: ${size}`);
    });
    
    if (Object.keys(analysis.qualityBreakdown).length > 0) {
      console.log('\n🎬 Desglose por calidad:');
      Object.entries(analysis.qualityBreakdown).forEach(([quality, size]) => {
        console.log(`   ${quality}: ${size}`);
      });
    }
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
  }
  
  await question('\nPresiona Enter para continuar...');
}

async function handleVideoAudit() {
  try {
    colorLog('\n🔍 AUDITORÍA DE INTEGRIDAD', 'magenta');
    colorLog('🔎 Verificando integridad de videos...', 'yellow');
    
    const audit = await auditVideos();
    
    colorLog('\n📋 RESULTADOS DE LA AUDITORÍA:', 'magenta');
    console.log(`Videos verificados: ${audit.totalVideosChecked}`);
    console.log(`Problemas encontrados: ${audit.issuesFound}`);
    console.log(`Score de salud: ${audit.healthScore}%`);
    
    if (audit.issues && audit.issues.length > 0) {
      colorLog('\n🚨 PROBLEMAS DETECTADOS:', 'red');
      audit.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. ${issue.type.toUpperCase()}`);
        console.log(`   Curso: ${issue.courseTitle}`);
        console.log(`   Capítulo: ${issue.chapterTitle}`);
        console.log(`   Descripción: ${issue.description}`);
      });
    } else {
      colorLog('\n✅ No se encontraron problemas!', 'green');
    }
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
  }
  
  await question('\nPresiona Enter para continuar...');
}

async function handleAdaptiveMigration() {
  try {
    colorLog('\n🚀 MIGRACIÓN A CALIDAD ADAPTIVA', 'magenta');
    console.log('Convierte videos existentes a múltiples calidades');
    
    const courseKey = await question('🎓 Clave del curso (enter para todos): ');
    const confirmMigration = await question('⚠️  ¿Confirmar migración? (s/N): ');
    
    if (confirmMigration.toLowerCase() !== 's') {
      colorLog('Migración cancelada.', 'yellow');
      return;
    }
    
    colorLog('\n🔄 Iniciando migración masiva...', 'yellow');
    const result = await upgradeAllToAdaptive(courseKey || null);
    
    colorLog('\n📊 MIGRACIÓN COMPLETADA:', 'green');
    console.log(`Total procesado: ${result.totalProcessed}`);
    console.log(`Exitosos: ${result.successful}`);
    console.log(`Errores: ${result.errors}`);
    console.log(`Tasa de éxito: ${result.successRate}%`);
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
  }
  
  await question('\nPresiona Enter para continuar...');
}

async function handleCleanup() {
  try {
    colorLog('\n🗑️ LIMPIEZA AUTOMÁTICA', 'yellow');
    
    const days = await question('📅 Eliminar archivos más antiguos que (días) [7]: ') || '7';
    const confirmCleanup = await question('⚠️  ¿Confirmar limpieza? (s/N): ');
    
    if (confirmCleanup.toLowerCase() !== 's') {
      colorLog('Limpieza cancelada.', 'yellow');
      return;
    }
    
    colorLog('\n🗑️ Ejecutando limpieza...', 'yellow');
    const result = await cleanupOldFiles(parseInt(days));
    
    colorLog('\n✅ LIMPIEZA COMPLETADA:', 'green');
    console.log(`Archivos eliminados: ${result.deletedCount}`);
    console.log(`Espacio liberado: ${result.freedSpaceGB} GB`);
    console.log(`Ahorro mensual: $${result.monthlySavings} USD`);
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
  }
  
  await question('\nPresiona Enter para continuar...');
}

async function handleMassOptimization() {
  try {
    colorLog('\n⚡ OPTIMIZACIÓN MASIVA', 'cyan');
    console.log('Ejecuta múltiples operaciones de optimización:');
    console.log('1. Análisis de almacenamiento');
    console.log('2. Auditoría de integridad');
    console.log('3. Limpieza de archivos temporales');
    
    const confirm = await question('\n¿Ejecutar optimización completa? (s/N): ');
    
    if (confirm.toLowerCase() !== 's') {
      colorLog('Optimización cancelada.', 'yellow');
      return;
    }
    
    colorLog('\n🚀 Iniciando optimización masiva...', 'cyan');
    
    // Análisis de almacenamiento
    colorLog('\n1/3 📊 Analizando almacenamiento...', 'yellow');
    await analyzeStorage();
    
    // Auditoría
    colorLog('\n2/3 🔍 Ejecutando auditoría...', 'yellow');
    await auditVideos();
    
    // Limpieza
    colorLog('\n3/3 🗑️ Limpiando archivos temporales...', 'yellow');
    await cleanupOldFiles(7);
    
    colorLog('\n✅ OPTIMIZACIÓN MASIVA COMPLETADA!', 'green');
    
  } catch (error) {
    colorLog(`\n❌ Error: ${error.message}`, 'red');
  }
  
  await question('\nPresiona Enter para continuar...');
}

async function showHelp() {
  colorLog('\n📚 AYUDA Y DOCUMENTACIÓN', 'cyan');
  console.log('');
  console.log('🎥 GESTIÓN DE VIDEOS:');
  console.log('   • Sube videos individuales o en lote');
  console.log('   • Genera múltiples calidades automáticamente');
  console.log('   • Organización jerárquica en Google Cloud Storage');
  console.log('');
  console.log('📊 ANALYTICS:');
  console.log('   • Tracking de visualizaciones y progreso');
  console.log('   • Análisis de patrones de abandono');
  console.log('   • Recomendaciones de mejora');
  console.log('');
  console.log('🔧 HERRAMIENTAS:');
  console.log('   • Auditoría de integridad automática');
  console.log('   • Análisis de costos de almacenamiento');
  console.log('   • Limpieza y optimización');
  console.log('');
  console.log('📋 DOCUMENTACIÓN COMPLETA:');
  console.log('   • SISTEMA_VIDEOS_GUIA_COMPLETA.md');
  console.log('   • GCS_IMPLEMENTATION_SUMMARY.md');
  console.log('   • GOOGLE_CLOUD_SETUP.md');
  console.log('');
  
  await question('Presiona Enter para continuar...');
}

async function configureSystem() {
  colorLog('\n⚙️ CONFIGURACIÓN DEL SISTEMA', 'cyan');
  console.log('');
  console.log('Variables de entorno requeridas:');
  console.log('   GOOGLE_CLOUD_PROJECT_ID=tu-project-id');
  console.log('   GOOGLE_CLOUD_KEY_FILE=./google-cloud-credentials.json');
  console.log('   GOOGLE_CLOUD_BUCKET_NAME=lms-videos-bucket');
  console.log('');
  console.log('Archivos necesarios:');
  console.log('   ✓ google-cloud-credentials.json');
  console.log('   ✓ .env configurado');
  console.log('   ✓ Base de datos Prisma');
  console.log('');
  
  // Verificar configuración
  const hasEnv = require('fs').existsSync('.env');
  const hasCredentials = require('fs').existsSync('google-cloud-credentials.json');
  
  console.log('Estado de la configuración:');
  colorLog(`   ${hasEnv ? '✅' : '❌'} Archivo .env`, hasEnv ? 'green' : 'red');
  colorLog(`   ${hasCredentials ? '✅' : '❌'} Credenciales de Google Cloud`, hasCredentials ? 'green' : 'red');
  
  await question('\nPresiona Enter para continuar...');
}

async function main() {
  while (true) {
    showHeader();
    showMainMenu();
    
    const choice = await question(colorLog('Selecciona una opción: ', 'bright'));
    
    switch (choice) {
      case '1':
        await handleVideoUpload();
        break;
      case '2':
        await handleBatchUpload();
        break;
      case '3':
        await handleShowStructure();
        break;
      case '4':
        await handleAdaptiveVideo();
        break;
      case '5':
        await handleAnalyticsReport();
        break;
      case '6':
        await handleStorageAnalysis();
        break;
      case '7':
        await handleVideoAudit();
        break;
      case '8':
        await handleAdaptiveMigration();
        break;
      case '9':
        await handleCleanup();
        break;
      case '10':
        await handleMassOptimization();
        break;
      case '11':
        await showHelp();
        break;
      case '12':
        await configureSystem();
        break;
      case '0':
        colorLog('\n👋 ¡Hasta luego! Gracias por usar Pacific Labs LMS.', 'cyan');
        process.exit(0);
      default:
        colorLog('\n❌ Opción no válida. Intenta de nuevo.', 'red');
        await question('Presiona Enter para continuar...');
    }
  }
}

// Manejo de errores y cleanup
process.on('SIGINT', () => {
  colorLog('\n\n👋 Sistema cerrado por el usuario.', 'yellow');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  colorLog(`\n❌ Error crítico: ${error.message}`, 'red');
  process.exit(1);
});

// Iniciar aplicación
if (require.main === module) {
  main().catch(error => {
    colorLog(`\n❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { main };