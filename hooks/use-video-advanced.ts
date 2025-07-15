"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

// 🎯 HOOK PARA TRACKING DE PROGRESO DE VIDEO
export const useVideoProgress = ({ chapterId, userId, trackingInterval = 5000 }) => {
  const [progress, setProgress] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const lastTrackedTime = useRef(0);

  const trackEvent = useCallback(async (eventType, data = {}) => {
    try {
      // En producción, esto haría una llamada a la API
      const event = {
        userId,
        chapterId,
        eventType,
        timestamp: Date.now(),
        sessionId,
        data
      };

      console.log('Video event tracked:', event);

      // Simular llamada a API
      // await fetch('/api/video-analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event)
      // });

    } catch (error) {
      console.error('Error tracking video event:', error);
    }
  }, [userId, chapterId, sessionId]);

  const updateProgress = useCallback((currentTime, duration) => {
    if (duration > 0) {
      const progressPercent = (currentTime / duration) * 100;
      setProgress(progressPercent);
      setWatchTime(currentTime);

      // Track progress milestones
      if (currentTime - lastTrackedTime.current >= trackingInterval / 1000) {
        trackEvent('progress', {
          currentTime,
          watchPercentage: progressPercent,
          milestone: progressPercent >= 25 ? `${Math.floor(progressPercent/25)*25}%` : null
        });
        lastTrackedTime.current = currentTime;
      }

      // Mark as completed at 90%
      if (progressPercent >= 90 && !isCompleted) {
        setIsCompleted(true);
        trackEvent('complete', {
          totalWatchTime: currentTime,
          completionRate: progressPercent
        });
      }
    }
  }, [trackEvent, trackingInterval, isCompleted]);

  const trackPlay = useCallback((currentTime = 0) => {
    trackEvent('play', { currentTime, device: 'web' });
  }, [trackEvent]);

  const trackPause = useCallback((currentTime = 0) => {
    trackEvent('pause', { currentTime });
  }, [trackEvent]);

  const trackSeek = useCallback((fromTime, toTime) => {
    trackEvent('seek', { fromTime, toTime });
  }, [trackEvent]);

  const trackQualityChange = useCallback((fromQuality, toQuality) => {
    trackEvent('quality_change', { fromQuality, toQuality });
  }, [trackEvent]);

  return {
    progress,
    watchTime,
    isCompleted,
    sessionId,
    updateProgress,
    trackPlay,
    trackPause,
    trackSeek,
    trackQualityChange
  };
};

// 🎥 HOOK PARA REPRODUCTOR DE VIDEO ADAPTIVO
export const useAdaptivePlayer = ({ videoUrls = {}, autoQuality = true }) => {
  const videoRef = useRef(null);
  const [currentQuality, setCurrentQuality] = useState('1080p');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [networkSpeed, setNetworkSpeed] = useState('unknown');

  const availableQualities = Object.keys(videoUrls).sort((a, b) => {
    const order = { '1080p': 3, '720p': 2, '480p': 1 };
    return (order[b] || 0) - (order[a] || 0);
  });

  // Auto-select quality based on network conditions
  useEffect(() => {
    if (autoQuality && availableQualities.length > 0) {
      detectNetworkSpeed().then(speed => {
        setNetworkSpeed(speed);
        const recommendedQuality = getRecommendedQuality(speed);
        if (availableQualities.includes(recommendedQuality)) {
          setCurrentQuality(recommendedQuality);
        }
      });
    }
  }, [autoQuality, availableQualities]);

  const detectNetworkSpeed = async () => {
    try {
      const startTime = Date.now();
      const testUrl = 'https://www.google.com/images/phd/px.gif';
      await fetch(testUrl + '?t=' + Date.now(), { mode: 'no-cors' });
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (duration < 100) return 'fast';
      if (duration < 300) return 'medium';
      return 'slow';
    } catch {
      return 'unknown';
    }
  };

  const getRecommendedQuality = (speed) => {
    switch (speed) {
      case 'fast': return '1080p';
      case 'medium': return '720p';
      case 'slow': return '480p';
      default: return '720p';
    }
  };

  const play = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, []);

  const pause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const changeQuality = useCallback((quality) => {
    if (videoRef.current && availableQualities.includes(quality)) {
      const wasPlaying = !videoRef.current.paused;
      const currentTime = videoRef.current.currentTime;
      
      setCurrentQuality(quality);
      
      // Preserve state when changing quality
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
          if (wasPlaying) {
            videoRef.current.play();
          }
        }
      }, 100);
    }
  }, [availableQualities]);

  const changeSpeed = useCallback((speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  }, []);

  const changeVolume = useCallback((newVolume) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  }, [isMuted]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Update buffered progress
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(0);
        setBuffered((bufferedEnd / videoRef.current.duration) * 100);
      }
    }
  }, []);

  const handleLoadedData = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const currentVideoUrl = videoUrls[currentQuality] || Object.values(videoUrls)[0];

  return {
    videoRef,
    currentVideoUrl,
    currentQuality,
    availableQualities,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    playbackSpeed,
    currentTime,
    duration,
    buffered,
    networkSpeed,
    play,
    pause,
    seek,
    changeQuality,
    changeSpeed,
    changeVolume,
    toggleMute,
    handleTimeUpdate,
    handleLoadedData
  };
};

// 📊 HOOK PARA ANALYTICS DE VIDEO
export const useVideoAnalytics = ({ chapterId, timeRange = '7d' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // En producción, esto sería una llamada real a la API
      // const response = await fetch(`/api/analytics/video/${chapterId}?range=${timeRange}`);
      // const data = await response.json();

      // Simulación de datos
      const mockData = {
        totalViews: Math.floor(Math.random() * 500) + 50,
        totalWatchTime: Math.floor(Math.random() * 10000) + 1000,
        averageCompletionRate: Math.floor(Math.random() * 40) + 60,
        engagementScore: Math.floor(Math.random() * 30) + 70,
        dropoffAnalysis: {
          criticalDropoffPoint: `${Math.floor(Math.random() * 200) + 50}-${Math.floor(Math.random() * 200) + 150} segundos`,
          recommendations: [
            'Mejorar la introducción del video',
            'Agregar elementos interactivos',
            'Reducir la duración del segmento inicial'
          ]
        },
        deviceBreakdown: {
          desktop: Math.floor(Math.random() * 30) + 50,
          mobile: Math.floor(Math.random() * 30) + 20,
          tablet: Math.floor(Math.random() * 20) + 5
        },
        qualityPreferences: {
          '1080p': Math.floor(Math.random() * 30) + 40,
          '720p': Math.floor(Math.random() * 30) + 30,
          '480p': Math.floor(Math.random() * 20) + 10
        },
        timeOfDayAnalysis: {
          peakHour: `${Math.floor(Math.random() * 12) + 9}:00`,
          recommendation: 'Los estudiantes están más activos durante horario laboral'
        }
      };

      setAnalytics(mockData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [chapterId, timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const refreshAnalytics = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics
  };
};

// 🗄️ HOOK PARA GESTIÓN DE ALMACENAMIENTO
export const useStorageManagement = () => {
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeStorage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulación de análisis de almacenamiento
      const mockData = {
        totalFiles: Math.floor(Math.random() * 500) + 100,
        totalSizeGB: (Math.random() * 50 + 10).toFixed(2),
        estimatedMonthlyCost: (Math.random() * 2 + 0.5).toFixed(4),
        courseBreakdown: {
          'ia-basico': `${(Math.random() * 15 + 5).toFixed(2)} GB`,
          'ia-intermedio': `${(Math.random() * 10 + 3).toFixed(2)} GB`,
          'ia-avanzado': `${(Math.random() * 8 + 2).toFixed(2)} GB`
        },
        qualityBreakdown: {
          '1080p': `${(Math.random() * 20 + 10).toFixed(2)} GB`,
          '720p': `${(Math.random() * 10 + 5).toFixed(2)} GB`,
          '480p': `${(Math.random() * 5 + 2).toFixed(2)} GB`
        },
        trends: {
          growthRate: `${(Math.random() * 20 + 5).toFixed(1)}% mensual`,
          projectedCost6Months: `$${(Math.random() * 10 + 5).toFixed(2)}`
        }
      };

      setStorageInfo(mockData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const cleanupStorage = useCallback(async (olderThanDays = 7) => {
    try {
      setLoading(true);
      
      // Simulación de limpieza
      const mockResult = {
        deletedFiles: Math.floor(Math.random() * 20) + 5,
        freedSpaceGB: (Math.random() * 2 + 0.5).toFixed(2),
        monthlySavings: (Math.random() * 0.1 + 0.02).toFixed(4)
      };

      // Refresh storage info after cleanup
      setTimeout(() => {
        analyzeStorage();
      }, 1000);

      return mockResult;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [analyzeStorage]);

  return {
    storageInfo,
    loading,
    error,
    analyzeStorage,
    cleanupStorage
  };
};

// 🔍 HOOK PARA AUDITORÍA DE VIDEOS
export const useVideoAudit = () => {
  const [auditResults, setAuditResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runAudit = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulación de auditoría
      const issues = Math.random() > 0.7 ? [
        {
          type: 'missing_file',
          chapterTitle: 'Introducción a Machine Learning',
          courseTitle: 'IA Básico',
          description: 'Archivo de video no encontrado en Google Cloud Storage'
        },
        {
          type: 'invalid_content_type',
          chapterTitle: 'Redes Neuronales',
          courseTitle: 'IA Intermedio',
          description: 'Tipo de contenido inválido para video'
        }
      ] : [];

      const mockResults = {
        totalVideosChecked: Math.floor(Math.random() * 200) + 50,
        issuesFound: issues.length,
        healthScore: issues.length === 0 ? 100 : Math.floor(Math.random() * 20) + 80,
        issues: issues,
        auditDate: new Date().toISOString(),
        recommendations: issues.length > 0 ? [
          'Verificar configuración de Google Cloud Storage',
          'Ejecutar re-upload de videos problemáticos',
          'Configurar monitoreo automático'
        ] : [
          'Continuar con el monitoreo regular',
          'Considerar implementar backups adicionales'
        ]
      };

      setAuditResults(mockResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fixIssue = useCallback(async (issueId) => {
    try {
      setLoading(true);
      
      // Simulación de corrección
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Re-run audit after fix
      await runAudit();
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [runAudit]);

  return {
    auditResults,
    loading,
    error,
    runAudit,
    fixIssue
  };
};

// 🚀 HOOK PARA MIGRACIÓN A CALIDAD ADAPTIVA
export const useAdaptiveMigration = () => {
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const startMigration = useCallback(async (courseKey = null) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);

      // Simulación de migración con progreso
      const totalSteps = 10;
      for (let i = 0; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setProgress((i / totalSteps) * 100);
      }

      const mockResults = {
        totalProcessed: Math.floor(Math.random() * 50) + 20,
        successful: Math.floor(Math.random() * 45) + 18,
        errors: Math.floor(Math.random() * 5),
        successRate: Math.floor(Math.random() * 20) + 80,
        timeElapsed: `${Math.floor(Math.random() * 30) + 10} minutos`,
        spaceSaved: `${(Math.random() * 5 + 2).toFixed(2)} GB`
      };

      mockResults.errors = mockResults.totalProcessed - mockResults.successful;
      mockResults.successRate = Math.round((mockResults.successful / mockResults.totalProcessed) * 100);

      setMigrationStatus(mockResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetMigration = useCallback(() => {
    setMigrationStatus(null);
    setProgress(0);
    setError(null);
  }, []);

  return {
    migrationStatus,
    loading,
    error,
    progress,
    startMigration,
    resetMigration
  };
};