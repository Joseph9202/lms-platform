// 🚀 SISTEMA DE OPTIMIZACIÓN Y GESTIÓN AVANZADA DE VIDEOS
// Para LMS Platform - IA Pacific Labs
// Extensiones avanzadas para Google Cloud Storage

const { Storage } = require('@google-cloud/storage');
const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
require('dotenv').config();

const execAsync = promisify(exec);
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const database = new PrismaClient();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);

// 🎥 PROCESADOR AUTOMÁTICO DE CALIDAD ADAPTIVA
class AdaptiveVideoProcessor {
  constructor() {
    this.processingQueue = [];
    this.isProcessing = false;
    this.supportedQualities = ['480p', '720p', '1080p'];
    this.tempDir = path.join(__dirname, '..', 'temp-processing');
    
    // Crear directorio temporal si no existe
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // 📊 Generar múltiples calidades de video
  async processVideoForAdaptiveStreaming(originalVideoPath, outputBaseName) {
    try {
      console.log(`🔄 Procesando video adaptivo: ${originalVideoPath}`);
      
      const outputs = {};
      const processingPromises = [];

      // Generar cada calidad en paralelo
      for (const quality of this.supportedQualities) {
        const outputPath = path.join(this.tempDir, `${outputBaseName}_${quality}.mp4`);
        
        const promise = this.generateQuality(originalVideoPath, outputPath, quality)
          .then(() => {
            outputs[quality] = outputPath;
            console.log(`✅ Calidad ${quality} generada: ${outputPath}`);
          })
          .catch(error => {
            console.error(`❌ Error generando ${quality}:`, error.message);
          });

        processingPromises.push(promise);
      }

      await Promise.all(processingPromises);
      
      console.log(`🎉 Procesamiento adaptivo completado para: ${outputBaseName}`);
      return outputs;

    } catch (error) {
      console.error('Error en procesamiento adaptivo:', error);
      throw error;
    }
  }

  // 🎬 Generar calidad específica con FFmpeg
  async generateQuality(inputPath, outputPath, quality) {
    const qualitySettings = {
      '480p': {
        resolution: '854x480',
        bitrate: '1000k',
        audioBitrate: '128k'
      },
      '720p': {
        resolution: '1280x720',
        bitrate: '2500k',
        audioBitrate: '192k'
      },
      '1080p': {
        resolution: '1920x1080',
        bitrate: '5000k',
        audioBitrate: '256k'
      }
    };

    const settings = qualitySettings[quality];
    
    // Verificar si FFmpeg está disponible
    try {
      await execAsync('ffmpeg -version');
    } catch (error) {
      console.warn('⚠️  FFmpeg no encontrado. Usando copia directa para simulación.');
      // Copiar archivo original como simulación
      fs.copyFileSync(inputPath, outputPath);
      return outputPath;
    }

    const ffmpegCommand = [
      'ffmpeg',
      '-i', `"${inputPath}"`,
      '-vf', `scale=${settings.resolution}`,
      '-c:v', 'libx264',
      '-b:v', settings.bitrate,
      '-c:a', 'aac',
      '-b:a', settings.audioBitrate,
      '-preset', 'medium',
      '-crf', '23',
      '-movflags', '+faststart',
      '-y', // Sobrescribir archivo existente
      `"${outputPath}"`
    ].join(' ');

    try {
      const { stdout, stderr } = await execAsync(ffmpegCommand);
      
      if (stderr && !stderr.includes('frame=')) {
        console.warn(`FFmpeg warning for ${quality}:`, stderr);
      }

      return outputPath;
    } catch (error) {
      throw new Error(`Error ejecutando FFmpeg para ${quality}: ${error.message}`);
    }
  }

  // 📤 Subir todas las calidades a Google Cloud Storage
  async uploadAdaptiveVideos(videoOutputs, courseKey, lessonKey, videoKey) {
    try {
      const uploadResults = {};

      for (const [quality, localPath] of Object.entries(videoOutputs)) {
        if (!fs.existsSync(localPath)) {
          console.warn(`⚠️  Archivo no encontrado para ${quality}: ${localPath}`);
          continue;
        }

        const bucketPath = `courses/${courseKey}/lessons/${lessonKey}/videos/${videoKey}/${quality}/video.mp4`;
        
        console.log(`📤 Subiendo ${quality}...`);
        
        const file = bucket.file(bucketPath);
        
        await file.save(fs.readFileSync(localPath), {
          metadata: {
            contentType: 'video/mp4',
            cacheControl: 'public, max-age=31536000',
            metadata: {
              quality,
              courseKey,
              lessonKey,
              videoKey,
              processedAt: new Date().toISOString()
            }
          },
          public: true
        });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${bucketPath}`;
        uploadResults[quality] = publicUrl;

        console.log(`✅ ${quality} subido: ${publicUrl}`);
        
        // Limpiar archivo temporal
        try {
          fs.unlinkSync(localPath);
        } catch (e) {
          console.warn('No se pudo eliminar archivo temporal:', localPath);
        }
      }

      return uploadResults;
    } catch (error) {
      console.error('Error subiendo videos adaptativos:', error);
      throw error;
    }
  }

  // 🎯 Proceso completo: generar + subir
  async processAndUploadAdaptive(originalVideoPath, courseKey, lessonKey, videoKey) {
    try {
      const baseName = `${courseKey}_${lessonKey}_${videoKey}`;
      
      // Generar múltiples calidades
      const videoOutputs = await this.processVideoForAdaptiveStreaming(originalVideoPath, baseName);
      
      // Subir todas las calidades
      const uploadResults = await this.uploadAdaptiveVideos(videoOutputs, courseKey, lessonKey, videoKey);
      
      // Guardar URLs en base de datos
      await this.saveAdaptiveUrlsToDatabase(courseKey, lessonKey, videoKey, uploadResults);
      
      return uploadResults;
    } catch (error) {
      console.error('Error en proceso completo adaptivo:', error);
      throw error;
    }
  }

  // 💾 Guardar URLs de calidades en base de datos
  async saveAdaptiveUrlsToDatabase(courseKey, lessonKey, videoKey, uploadResults) {
    try {
      // Buscar capítulo correspondiente
      const { VIDEO_STRUCTURE } = require('../upload-videos.js');
      const videoInfo = VIDEO_STRUCTURE[courseKey]?.lessons[lessonKey]?.videos[videoKey];
      
      if (!videoInfo) {
        throw new Error(`Configuración no encontrada para: ${courseKey}/${lessonKey}/${videoKey}`);
      }

      const course = await database.course.findFirst({
        where: {
          title: {
            contains: VIDEO_STRUCTURE[courseKey].courseTitle.split(' - ')[0]
          }
        }
      });

      if (!course) {
        throw new Error(`Curso no encontrado`);
      }

      const chapter = await database.chapter.findFirst({
        where: {
          courseId: course.id,
          title: {
            contains: videoInfo.chapterTitle.split(':')[1]?.trim() || videoInfo.chapterTitle
          }
        }
      });

      if (!chapter) {
        throw new Error(`Capítulo no encontrado`);
      }

      // Actualizar capítulo con URLs adaptivas
      await database.chapter.update({
        where: { id: chapter.id },
        data: {
          videoUrl: uploadResults['1080p'] || uploadResults['720p'] || uploadResults['480p'], // URL principal
          adaptiveVideoUrls: JSON.stringify(uploadResults) // Todas las calidades
        }
      });

      console.log(`💾 URLs adaptivas guardadas en BD para capítulo: ${chapter.title}`);
      
    } catch (error) {
      console.error('Error guardando URLs adaptivas:', error);
      throw error;
    }
  }
}

// 🔧 HERRAMIENTAS DE ADMINISTRACIÓN AVANZADA
class VideoAdminTools {
  constructor() {
    this.bulkOperations = [];
  }

  // 📊 Análisis de almacenamiento y costos
  async analyzeStorageUsage() {
    try {
      console.log(`📊 Analizando uso de almacenamiento...`);
      
      const [files] = await bucket.getFiles({
        prefix: 'courses/'
      });

      let totalSize = 0;
      let totalFiles = 0;
      const courseBreakdown = {};
      const qualityBreakdown = {};

      for (const file of files) {
        try {
          const [metadata] = await file.getMetadata();
          const size = parseInt(metadata.size || 0);
          totalSize += size;
          totalFiles++;

          // Analizar por curso
          const pathParts = file.name.split('/');
          if (pathParts.length >= 3) {
            const courseKey = pathParts[1];
            courseBreakdown[courseKey] = (courseBreakdown[courseKey] || 0) + size;
          }

          // Analizar por calidad
          if (file.name.includes('/480p/') || file.name.includes('/720p/') || file.name.includes('/1080p/')) {
            const quality = file.name.match(/(480p|720p|1080p)/)?.[1] || 'unknown';
            qualityBreakdown[quality] = (qualityBreakdown[quality] || 0) + size;
          }
        } catch (fileError) {
          console.warn(`Error obteniendo metadata de ${file.name}:`, fileError.message);
        }
      }

      const analysis = {
        totalFiles,
        totalSizeGB: (totalSize / (1024 * 1024 * 1024)).toFixed(2),
        estimatedMonthlyCost: ((totalSize / (1024 * 1024 * 1024)) * 0.02).toFixed(4), // $0.02 per GB/month
        courseBreakdown: Object.fromEntries(
          Object.entries(courseBreakdown).map(([course, size]) => [
            course,
            `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
          ])
        ),
        qualityBreakdown: Object.fromEntries(
          Object.entries(qualityBreakdown).map(([quality, size]) => [
            quality,
            `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
          ])
        ),
        generatedAt: new Date().toISOString()
      };

      console.log(`\n📈 ANÁLISIS DE ALMACENAMIENTO:`);
      console.log(`📁 Total de archivos: ${totalFiles}`);
      console.log(`💾 Tamaño total: ${analysis.totalSizeGB} GB`);
      console.log(`💰 Costo estimado mensual: $${analysis.estimatedMonthlyCost} USD`);
      console.log(`\n📚 Desglose por curso:`);
      Object.entries(analysis.courseBreakdown).forEach(([course, size]) => {
        console.log(`   ${course}: ${size}`);
      });
      console.log(`\n🎬 Desglose por calidad:`);
      Object.entries(analysis.qualityBreakdown).forEach(([quality, size]) => {
        console.log(`   ${quality}: ${size}`);
      });

      return analysis;
    } catch (error) {
      console.error('Error analizando almacenamiento:', error);
      throw error;
    }
  }

  // 🗑️ Limpieza automática de archivos temporales
  async cleanupTempFiles(olderThanDays = 7) {
    try {
      console.log(`🗑️  Limpiando archivos temporales más antiguos que ${olderThanDays} días...`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const [files] = await bucket.getFiles({
        prefix: 'temp/'
      });

      let deletedCount = 0;
      let freedSpaceBytes = 0;

      for (const file of files) {
        try {
          const [metadata] = await file.getMetadata();
          const fileDate = new Date(metadata.timeCreated);
          
          if (fileDate < cutoffDate) {
            const size = parseInt(metadata.size || 0);
            await file.delete();
            deletedCount++;
            freedSpaceBytes += size;
            console.log(`🗑️  Eliminado: ${file.name}`);
          }
        } catch (fileError) {
          console.warn(`Error procesando archivo ${file.name}:`, fileError.message);
        }
      }

      const freedSpaceGB = (freedSpaceBytes / (1024 * 1024 * 1024)).toFixed(2);
      
      console.log(`✅ Limpieza completada:`);
      console.log(`   📁 Archivos eliminados: ${deletedCount}`);
      console.log(`   💾 Espacio liberado: ${freedSpaceGB} GB`);
      console.log(`   💰 Ahorro mensual: $${(freedSpaceGB * 0.02).toFixed(4)} USD`);

      return {
        deletedCount,
        freedSpaceGB: parseFloat(freedSpaceGB),
        monthlySavings: parseFloat((freedSpaceGB * 0.02).toFixed(4))
      };
    } catch (error) {
      console.error('Error en limpieza:', error);
      throw error;
    }
  }

  // 🔍 Auditoría de integridad de videos
  async auditVideoIntegrity() {
    try {
      console.log(`🔍 Iniciando auditoría de integridad de videos...`);
      
      const issues = [];
      let checkedVideos = 0;

      // Obtener todos los capítulos con videos
      const chapters = await database.chapter.findMany({
        where: {
          videoUrl: { not: null }
        },
        include: {
          course: true
        }
      });

      for (const chapter of chapters) {
        checkedVideos++;
        
        try {
          // Verificar si el archivo existe en Google Cloud Storage
          const urlPath = chapter.videoUrl.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
          const file = bucket.file(urlPath);
          const [exists] = await file.exists();
          
          if (!exists) {
            issues.push({
              type: 'missing_file',
              chapterId: chapter.id,
              chapterTitle: chapter.title,
              courseTitle: chapter.course.title,
              videoUrl: chapter.videoUrl,
              description: 'Archivo de video no encontrado en Google Cloud Storage'
            });
          } else {
            // Verificar metadatos del archivo
            const [metadata] = await file.getMetadata();
            
            if (!metadata.contentType || !metadata.contentType.startsWith('video/')) {
              issues.push({
                type: 'invalid_content_type',
                chapterId: chapter.id,
                chapterTitle: chapter.title,
                courseTitle: chapter.course.title,
                videoUrl: chapter.videoUrl,
                contentType: metadata.contentType,
                description: 'Tipo de contenido inválido para video'
              });
            }

            // Verificar tamaño del archivo
            const size = parseInt(metadata.size || 0);
            if (size < 1024) { // Menor a 1KB probablemente es inválido
              issues.push({
                type: 'suspicious_file_size',
                chapterId: chapter.id,
                chapterTitle: chapter.title,
                courseTitle: chapter.course.title,
                videoUrl: chapter.videoUrl,
                size: size,
                description: 'Tamaño de archivo sospechosamente pequeño'
              });
            }
          }
        } catch (error) {
          issues.push({
            type: 'access_error',
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            courseTitle: chapter.course.title,
            videoUrl: chapter.videoUrl,
            error: error.message,
            description: 'Error accediendo al archivo'
          });
        }
      }

      const auditResult = {
        totalVideosChecked: checkedVideos,
        issuesFound: issues.length,
        issues: issues,
        healthScore: checkedVideos > 0 ? Math.round(((checkedVideos - issues.length) / checkedVideos) * 100) : 100,
        auditDate: new Date().toISOString()
      };

      console.log(`\n🔍 AUDITORÍA COMPLETADA:`);
      console.log(`📊 Videos verificados: ${checkedVideos}`);
      console.log(`⚠️  Problemas encontrados: ${issues.length}`);
      console.log(`💚 Score de salud: ${auditResult.healthScore}%`);

      if (issues.length > 0) {
        console.log(`\n🚨 PROBLEMAS DETECTADOS:`);
        issues.forEach((issue, index) => {
          console.log(`${index + 1}. ${issue.type.toUpperCase()}`);
          console.log(`   Curso: ${issue.courseTitle}`);
          console.log(`   Capítulo: ${issue.chapterTitle}`);
          console.log(`   Descripción: ${issue.description}`);
          console.log(`   URL: ${issue.videoUrl}`);
          console.log('');
        });
      }

      return auditResult;
    } catch (error) {
      console.error('Error en auditoría:', error);
      throw error;
    }
  }

  // 🚀 Migración masiva de videos a nuevas calidades
  async bulkUpgradeToAdaptive(courseKey = null) {
    try {
      console.log(`🚀 Iniciando migración masiva a videos adaptativos...`);
      
      const whereCondition = courseKey ? {
        course: {
          title: { contains: courseKey }
        },
        videoUrl: { not: null },
        adaptiveVideoUrls: null // Solo capítulos sin calidades adaptivas
      } : {
        videoUrl: { not: null },
        adaptiveVideoUrls: null
      };

      const chapters = await database.chapter.findMany({
        where: whereCondition,
        include: { course: true }
      });

      console.log(`📊 Encontrados ${chapters.length} capítulos para migrar`);

      const processor = new AdaptiveVideoProcessor();
      let successCount = 0;
      let errorCount = 0;

      for (const chapter of chapters) {
        try {
          console.log(`\n🔄 Procesando: ${chapter.title}`);
          
          // Descargar video original temporalmente
          const originalUrl = chapter.videoUrl;
          const tempFilePath = path.join(processor.tempDir, `temp_${chapter.id}.mp4`);
          
          await this.downloadVideoFromGCS(originalUrl, tempFilePath);
          
          // Determinar keys para el procesamiento
          const courseKey = this.extractCourseKeyFromTitle(chapter.course.title);
          const lessonKey = 'general'; // Default si no se puede determinar
          const videoKey = `chapter_${chapter.id}`;
          
          // Procesar a múltiples calidades
          await processor.processAndUploadAdaptive(tempFilePath, courseKey, lessonKey, videoKey);
          
          // Limpiar archivo temporal
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
          }
          
          successCount++;
          console.log(`✅ Migración exitosa para: ${chapter.title}`);
          
        } catch (error) {
          errorCount++;
          console.error(`❌ Error migrando ${chapter.title}:`, error.message);
        }
      }

      console.log(`\n📊 MIGRACIÓN COMPLETADA:`);
      console.log(`✅ Exitosos: ${successCount}`);
      console.log(`❌ Errores: ${errorCount}`);
      console.log(`📈 Total procesado: ${chapters.length}`);

      return {
        totalProcessed: chapters.length,
        successful: successCount,
        errors: errorCount,
        successRate: chapters.length > 0 ? Math.round((successCount / chapters.length) * 100) : 0
      };
    } catch (error) {
      console.error('Error en migración masiva:', error);
      throw error;
    }
  }

  // 📥 Descargar video desde Google Cloud Storage
  async downloadVideoFromGCS(gcsUrl, localPath) {
    try {
      const fileName = gcsUrl.replace(`https://storage.googleapis.com/${bucket.name}/`, '');
      const file = bucket.file(fileName);
      
      await file.download({ destination: localPath });
      console.log(`📥 Descargado: ${fileName} → ${localPath}`);
    } catch (error) {
      throw new Error(`Error descargando ${gcsUrl}: ${error.message}`);
    }
  }

  // 🔤 Extraer courseKey del título del curso
  extractCourseKeyFromTitle(courseTitle) {
    const lowerTitle = courseTitle.toLowerCase();
    
    if (lowerTitle.includes('ia basico') || lowerTitle.includes('ia básico')) {
      return 'ia-basico';
    } else if (lowerTitle.includes('ia intermedio')) {
      return 'ia-intermedio';
    } else if (lowerTitle.includes('ia avanzado')) {
      return 'ia-avanzado';
    }
    
    // Default: crear key desde el título
    return courseTitle.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 20);
  }
}

// 🎛️ FUNCIONES PRINCIPALES PARA USO
const adaptiveProcessor = new AdaptiveVideoProcessor();
const adminTools = new VideoAdminTools();

// Procesar video a múltiples calidades
async function createAdaptiveVideo(originalVideoPath, courseKey, lessonKey, videoKey) {
  return await adaptiveProcessor.processAndUploadAdaptive(originalVideoPath, courseKey, lessonKey, videoKey);
}

// Análisis de almacenamiento
async function analyzeStorage() {
  return await adminTools.analyzeStorageUsage();
}

// Limpieza automática
async function cleanupOldFiles(days = 7) {
  return await adminTools.cleanupTempFiles(days);
}

// Auditoría de integridad
async function auditVideos() {
  return await adminTools.auditVideoIntegrity();
}

// Migración masiva
async function upgradeAllToAdaptive(courseKey = null) {
  return await adminTools.bulkUpgradeToAdaptive(courseKey);
}

module.exports = {
  AdaptiveVideoProcessor,
  VideoAdminTools,
  createAdaptiveVideo,
  analyzeStorage,
  cleanupOldFiles,
  auditVideos,
  upgradeAllToAdaptive
};