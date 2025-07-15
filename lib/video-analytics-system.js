// 📊 SISTEMA AVANZADO DE ANALYTICS DE VIDEOS
// Para LMS Platform - IA Pacific Labs
// Extensión del sistema Google Cloud Storage existente

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

// 🎯 ANALYTICS AVANZADOS DE VIDEOS
class VideoAnalyticsManager {
  constructor() {
    this.events = [];
    this.sessions = new Map();
  }

  // 📈 Registrar evento de visualización
  async trackVideoEvent(userId, chapterId, eventType, timestamp, data = {}) {
    try {
      const event = {
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        chapterId,
        eventType, // 'play', 'pause', 'seek', 'complete', 'quality_change'
        timestamp: new Date(timestamp),
        data,
        sessionId: this.getOrCreateSession(userId, chapterId),
        createdAt: new Date()
      };

      // Guardar en base de datos (temporal en memoria si no existe tabla)
      try {
        await database.videoAnalytics.create({
          data: event
        });
      } catch (dbError) {
        console.warn('VideoAnalytics table not found, storing in memory:', dbError.message);
        this.events.push(event);
      }

      // Procesar evento en tiempo real
      await this.processEventRealTime(event);

      return event;
    } catch (error) {
      console.error('Error tracking video event:', error);
      throw error;
    }
  }

  // 🔄 Crear o obtener sesión de usuario
  getOrCreateSession(userId, chapterId) {
    const sessionKey = `${userId}_${chapterId}`;
    
    if (!this.sessions.has(sessionKey)) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.sessions.set(sessionKey, {
        id: sessionId,
        userId,
        chapterId,
        startTime: new Date(),
        lastActivity: new Date(),
        events: []
      });
    }

    const session = this.sessions.get(sessionKey);
    session.lastActivity = new Date();
    return session.id;
  }

  // ⚡ Procesar evento en tiempo real
  async processEventRealTime(event) {
    try {
      // Detectar patrones de abandono
      if (event.eventType === 'pause') {
        await this.detectDropoffPattern(event);
      }

      // Actualizar progreso automáticamente
      if (event.eventType === 'progress' && event.data.watchPercentage >= 90) {
        await this.markChapterComplete(event.userId, event.chapterId);
      }

      // Generar recomendaciones basadas en comportamiento
      if (event.eventType === 'complete') {
        await this.generateRecommendations(event.userId, event.chapterId);
      }

    } catch (error) {
      console.error('Error processing real-time event:', error);
    }
  }

  // 🎯 Detectar patrones de abandono
  async detectDropoffPattern(event) {
    try {
      const recentEvents = await database.videoAnalytics.findMany({
        where: {
          chapterId: event.chapterId,
          eventType: 'pause',
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        },
        orderBy: { timestamp: 'desc' },
        take: 100
      });

      // Encontrar punto común de abandono
      const dropoffPoints = recentEvents.map(e => e.data.currentTime || 0);
      const avgDropoff = dropoffPoints.reduce((a, b) => a + b, 0) / dropoffPoints.length;

      if (dropoffPoints.length >= 10 && avgDropoff > 0) {
        console.log(`⚠️  Patrón de abandono detectado en capítulo ${event.chapterId} a los ${avgDropoff.toFixed(1)} segundos`);
        
        // Notificar al instructor
        await this.notifyInstructorDropoff(event.chapterId, avgDropoff);
      }
    } catch (error) {
      // Usar datos en memoria si la tabla no existe
      const memoryEvents = this.events.filter(e => 
        e.chapterId === event.chapterId && 
        e.eventType === 'pause' &&
        e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      
      if (memoryEvents.length >= 3) {
        console.log(`⚠️  Patrón de abandono detectado (memoria) en capítulo ${event.chapterId}`);
      }
    }
  }

  // ✅ Marcar capítulo como completado
  async markChapterComplete(userId, chapterId) {
    try {
      await database.userProgress.upsert({
        where: {
          userId_chapterId: {
            userId,
            chapterId
          }
        },
        update: {
          isCompleted: true,
          completedAt: new Date()
        },
        create: {
          userId,
          chapterId,
          isCompleted: true,
          completedAt: new Date()
        }
      });

      console.log(`✅ Capítulo ${chapterId} marcado como completado para usuario ${userId}`);
    } catch (error) {
      console.error('Error marking chapter complete:', error);
    }
  }

  // 🔍 Generar recomendaciones inteligentes
  async generateRecommendations(userId, completedChapterId) {
    try {
      // Obtener curso actual
      const chapter = await database.chapter.findUnique({
        where: { id: completedChapterId },
        include: { course: true }
      });

      if (!chapter) return;

      // Buscar próximo capítulo en secuencia
      const nextChapter = await database.chapter.findFirst({
        where: {
          courseId: chapter.courseId,
          position: { gt: chapter.position }
        },
        orderBy: { position: 'asc' }
      });

      // Buscar cursos relacionados
      const relatedCourses = await database.course.findMany({
        where: {
          categoryId: chapter.course.categoryId,
          id: { not: chapter.courseId }
        },
        take: 3
      });

      const recommendations = {
        nextChapter: nextChapter ? {
          id: nextChapter.id,
          title: nextChapter.title,
          type: 'next_in_sequence'
        } : null,
        relatedCourses: relatedCourses.map(course => ({
          id: course.id,
          title: course.title,
          type: 'related_course'
        }))
      };

      console.log(`🔍 Recomendaciones generadas para usuario ${userId}:`, recommendations);

      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  }

  // 📊 Generar reporte de analytics
  async generateAnalyticsReport(chapterId, timeRange = '7d') {
    try {
      const startDate = this.getStartDateForRange(timeRange);
      let analytics = [];

      try {
        analytics = await database.videoAnalytics.findMany({
          where: {
            chapterId,
            timestamp: { gte: startDate }
          },
          orderBy: { timestamp: 'asc' }
        });
      } catch (error) {
        // Usar datos en memoria si la tabla no existe
        analytics = this.events.filter(e => 
          e.chapterId === chapterId && 
          e.timestamp >= startDate
        );
      }

      const report = {
        chapterId,
        timeRange,
        totalViews: analytics.filter(a => a.eventType === 'play').length,
        totalWatchTime: this.calculateTotalWatchTime(analytics),
        averageCompletionRate: await this.calculateCompletionRate(chapterId, startDate),
        dropoffAnalysis: this.analyzeDropoffPoints(analytics),
        engagementScore: this.calculateEngagementScore(analytics),
        deviceBreakdown: this.analyzeDeviceUsage(analytics),
        timeOfDayAnalysis: this.analyzeViewingTimes(analytics),
        generatedAt: new Date()
      };

      return report;
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }

  // 📉 Analizar puntos de abandono
  analyzeDropoffPoints(analytics) {
    const pauseEvents = analytics.filter(a => a.eventType === 'pause');
    const dropoffTimes = pauseEvents.map(e => e.data.currentTime || 0);

    if (dropoffTimes.length === 0) return { message: 'No hay datos de abandono' };

    // Agrupar en intervalos de 30 segundos
    const intervals = {};
    dropoffTimes.forEach(time => {
      const interval = Math.floor(time / 30) * 30;
      intervals[interval] = (intervals[interval] || 0) + 1;
    });

    // Encontrar intervalo con más abandonos
    const maxInterval = Object.keys(intervals).reduce((a, b) => 
      intervals[a] > intervals[b] ? a : b
    );

    return {
      criticalDropoffPoint: `${maxInterval}-${parseInt(maxInterval) + 30} segundos`,
      dropoffsByInterval: intervals,
      recommendations: this.getDropoffRecommendations(maxInterval)
    };
  }

  // 💡 Recomendaciones para mejorar retención
  getDropoffRecommendations(criticalPoint) {
    const recommendations = [];

    if (criticalPoint < 60) {
      recommendations.push('Mejorar la introducción - los estudiantes abandonan muy temprano');
      recommendations.push('Agregar un hook más fuerte en los primeros 30 segundos');
    } else if (criticalPoint < 300) {
      recommendations.push('Revisar el contenido del primer tercio del video');
      recommendations.push('Considerar dividir en segmentos más cortos');
    } else {
      recommendations.push('Agregar elementos interactivos en la mitad del video');
      recommendations.push('Incluir preguntas o quizzes para mantener engagement');
    }

    return recommendations;
  }

  // 🎯 Calcular score de engagement
  calculateEngagementScore(analytics) {
    if (analytics.length === 0) return 0;

    const events = analytics.length;
    const uniqueUsers = new Set(analytics.map(a => a.userId)).size;
    const interactions = analytics.filter(a => 
      ['seek', 'quality_change', 'speed_change'].includes(a.eventType)
    ).length;

    // Score de 0-100 basado en actividad
    const baseScore = Math.min((events / Math.max(uniqueUsers, 1)) * 10, 100);
    const interactionBonus = Math.min((interactions / Math.max(events, 1)) * 50, 20);

    return Math.round(baseScore + interactionBonus);
  }

  // 📱 Analizar uso por dispositivo
  analyzeDeviceUsage(analytics) {
    const devices = {};
    
    analytics.forEach(event => {
      const device = event.data.device || 'unknown';
      devices[device] = (devices[device] || 0) + 1;
    });

    return devices;
  }

  // 🕐 Analizar horarios de visualización
  analyzeViewingTimes(analytics) {
    const hours = {};
    
    analytics.forEach(event => {
      const hour = event.timestamp.getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });

    if (Object.keys(hours).length === 0) {
      return {
        hourlyBreakdown: {},
        peakHour: 'N/A',
        recommendation: 'No hay datos suficientes'
      };
    }

    // Encontrar hora pico
    const peakHour = Object.keys(hours).reduce((a, b) => 
      hours[a] > hours[b] ? a : b
    );

    return {
      hourlyBreakdown: hours,
      peakHour: `${peakHour}:00`,
      recommendation: this.getSchedulingRecommendation(peakHour)
    };
  }

  // 📅 Recomendación de horario
  getSchedulingRecommendation(peakHour) {
    const hour = parseInt(peakHour);
    
    if (hour >= 9 && hour <= 17) {
      return 'Los estudiantes están más activos durante horario laboral. Considerar lanzar contenido nuevo en la mañana.';
    } else if (hour >= 18 && hour <= 22) {
      return 'Pico de actividad en la tarde-noche. Ideal para contenido nuevo y notificaciones.';
    } else {
      return 'Actividad en horarios no convencionales. Revisar zona horaria de estudiantes.';
    }
  }

  // 📊 Calcular tiempo total de visualización
  calculateTotalWatchTime(analytics) {
    let totalTime = 0;
    const sessions = {};

    analytics.forEach(event => {
      const sessionKey = `${event.userId}_${event.sessionId}`;
      
      if (!sessions[sessionKey]) {
        sessions[sessionKey] = {
          startTime: null,
          currentTime: 0,
          totalWatched: 0
        };
      }

      const session = sessions[sessionKey];

      if (event.eventType === 'play') {
        session.startTime = event.timestamp;
        session.currentTime = event.data.currentTime || 0;
      } else if (event.eventType === 'pause' && session.startTime) {
        const watchDuration = (event.timestamp - session.startTime) / 1000;
        session.totalWatched += watchDuration;
        session.startTime = null;
      }
    });

    // Sumar tiempo total de todas las sesiones
    Object.values(sessions).forEach(session => {
      totalTime += session.totalWatched;
    });

    return Math.round(totalTime); // en segundos
  }

  // 📈 Calcular tasa de completación
  async calculateCompletionRate(chapterId, startDate) {
    try {
      const totalViews = await database.videoAnalytics.count({
        where: {
          chapterId,
          eventType: 'play',
          timestamp: { gte: startDate }
        }
      });

      const completions = await database.videoAnalytics.count({
        where: {
          chapterId,
          eventType: 'complete',
          timestamp: { gte: startDate }
        }
      });

      return totalViews > 0 ? Math.round((completions / totalViews) * 100) : 0;
    } catch (error) {
      // Usar datos en memoria
      const memoryAnalytics = this.events.filter(e => 
        e.chapterId === chapterId && 
        e.timestamp >= startDate
      );
      
      const views = memoryAnalytics.filter(e => e.eventType === 'play').length;
      const completions = memoryAnalytics.filter(e => e.eventType === 'complete').length;
      
      return views > 0 ? Math.round((completions / views) * 100) : 0;
    }
  }

  // 📅 Obtener fecha de inicio según rango
  getStartDateForRange(range) {
    const now = new Date();
    
    switch (range) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  }

  // 🔔 Notificar al instructor sobre abandono
  async notifyInstructorDropoff(chapterId, avgDropoff) {
    // Implementar notificación al instructor
    console.log(`🔔 Notificación: Patrón de abandono en capítulo ${chapterId} a los ${avgDropoff.toFixed(1)}s`);
  }
}

// 🚀 FUNCIONES PRINCIPALES PARA USAR

const analytics = new VideoAnalyticsManager();

// Ejemplo de uso para tracking
async function trackVideoPlay(userId, chapterId, currentTime = 0) {
  return await analytics.trackVideoEvent(userId, chapterId, 'play', Date.now(), {
    currentTime,
    device: 'desktop',
    quality: '1080p'
  });
}

async function trackVideoProgress(userId, chapterId, currentTime, watchPercentage) {
  return await analytics.trackVideoEvent(userId, chapterId, 'progress', Date.now(), {
    currentTime,
    watchPercentage,
    milestone: watchPercentage >= 25 ? `${Math.floor(watchPercentage/25)*25}%` : null
  });
}

async function trackVideoComplete(userId, chapterId, totalWatchTime) {
  return await analytics.trackVideoEvent(userId, chapterId, 'complete', Date.now(), {
    totalWatchTime,
    completionRate: 100
  });
}

// Generar reporte completo
async function generateVideoReport(chapterId, timeRange = '7d') {
  return await analytics.generateAnalyticsReport(chapterId, timeRange);
}

module.exports = {
  VideoAnalyticsManager,
  analytics,
  trackVideoPlay,
  trackVideoProgress,
  trackVideoComplete,
  generateVideoReport
};