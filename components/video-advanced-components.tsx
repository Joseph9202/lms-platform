"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  BarChart3, 
  Upload, 
  Download,
  Trash2,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  HardDrive,
  DollarSign,
  Eye,
  PlayCircle,
  Activity,
  Minimize,
  SkipBack,
  SkipForward,
  Maximize2
} from 'lucide-react';

// 🎥 REPRODUCTOR DE VIDEO ADAPTIVO AVANZADO
export const AdaptiveVideoPlayer = ({ 
  chapterId, 
  userId, 
  videoUrls = {}, 
  title = "Video del Curso",
  onProgress,
  onComplete,
  className = ""
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentQuality, setCurrentQuality] = useState('1080p');
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [progress, setProgress] = useState(0);

  // URLs de diferentes calidades
  const availableQualities = Object.keys(videoUrls).sort((a, b) => {
    const order = { '1080p': 3, '720p': 2, '480p': 1 };
    return (order[b] || 0) - (order[a] || 0);
  });

  // Efecto para auto-seleccionar mejor calidad disponible
  useEffect(() => {
    if (availableQualities.length > 0) {
      const bestQuality = availableQualities[0];
      setCurrentQuality(bestQuality);
    }
  }, [availableQualities]);

  // Tracking de progreso
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying && duration > 0) {
        const current = videoRef.current.currentTime;
        const progressPercent = (current / duration) * 100;
        setProgress(progressPercent);
        
        // Enviar progreso a analytics
        if (onProgress) {
          onProgress(current, progressPercent);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, duration, onProgress]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedData = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setLoading(false);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleSeek = (seekTime) => {
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleQualityChange = (quality) => {
    const currentTime = videoRef.current?.currentTime || 0;
    setCurrentQuality(quality);
    setShowQualityMenu(false);
    
    // Mantener posición al cambiar calidad
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.currentTime = currentTime;
      }
    }, 100);
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onComplete) {
      onComplete();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentVideoUrl = videoUrls[currentQuality] || Object.values(videoUrls)[0];

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(true)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={currentVideoUrl}
        className="w-full h-auto"
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onEnded={handleEnded}
        onClick={() => isPlaying ? handlePause() : handlePlay()}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Controls Overlay */}
      {showControls && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent">
          
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-4">
            <div className="flex justify-between items-center text-white">
              <h3 className="text-lg font-semibold truncate">{title}</h3>
              
              <div className="flex items-center space-x-2">
                {/* Quality Selector */}
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="px-2 py-1 bg-black/50 rounded text-sm hover:bg-black/70"
                  >
                    {currentQuality}
                  </button>
                  
                  {showQualityMenu && (
                    <div className="absolute top-full right-0 mt-1 bg-black/90 rounded shadow-lg z-10">
                      {availableQualities.map(quality => (
                        <button
                          key={quality}
                          onClick={() => handleQualityChange(quality)}
                          className={`block w-full px-3 py-2 text-left text-sm hover:bg-white/20 ${
                            quality === currentQuality ? 'text-blue-400' : 'text-white'
                          }`}
                        >
                          {quality}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Settings */}
                <button className="p-2 hover:bg-white/20 rounded">
                  <Settings size={20} />
                </button>

                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="p-2 hover:bg-white/20 rounded">
                  {isFullscreen ? <Minimize size={20} /> : <Maximize2 size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Center Play Button */}
          {!isPlaying && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={handlePlay}
                className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition-all"
              >
                <Play size={48} className="text-white ml-1" />
              </button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="relative">
                <div className="h-1 bg-white/30 rounded-full cursor-pointer">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between text-white">
              
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <button
                  onClick={() => isPlaying ? handlePause() : handlePlay()}
                  className="p-2 hover:bg-white/20 rounded"
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>

                {/* Skip Controls */}
                <button
                  onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                  className="p-2 hover:bg-white/20 rounded"
                >
                  <SkipBack size={20} />
                </button>

                <button
                  onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                  className="p-2 hover:bg-white/20 rounded"
                >
                  <SkipForward size={20} />
                </button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <button onClick={handleMute} className="p-2 hover:bg-white/20 rounded">
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-white/30 rounded-full"
                  />
                </div>

                {/* Time Display */}
                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Speed Control */}
                <select
                  value={playbackSpeed}
                  onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                  className="bg-black/50 text-white text-sm rounded px-2 py-1"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2}>2x</option>
                </select>

                {/* Progress Indicator */}
                <div className="text-sm">
                  {Math.round(progress)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 📊 PANEL DE ANALYTICS DE VIDEO
export const VideoAnalyticsPanel = ({ chapterId, timeRange = '7d' }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        // Simular datos de analytics
        const mockAnalytics = {
          totalViews: 156,
          totalWatchTime: 2340, // en segundos
          averageCompletionRate: 75,
          engagementScore: 82,
          dropoffAnalysis: {
            criticalDropoffPoint: '120-150 segundos',
            recommendations: [
              'Mejorar la introducción - los estudiantes abandonan temprano',
              'Agregar elementos interactivos en la mitad del video'
            ]
          },
          deviceBreakdown: {
            desktop: 65,
            mobile: 25,
            tablet: 10
          },
          timeOfDayAnalysis: {
            peakHour: '14:00',
            recommendation: 'Pico de actividad en la tarde. Ideal para contenido nuevo.'
          }
        };
        
        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [chapterId, timeRange]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-2" />
          <p>No hay datos de analytics disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold flex items-center">
          <BarChart3 className="mr-2" size={20} />
          Analytics del Video
        </h3>
        <p className="text-sm text-gray-600">Últimos {timeRange}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Métricas Principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Eye className="text-blue-500" size={24} />
            </div>
            <div className="text-2xl font-bold">{analytics.totalViews}</div>
            <div className="text-sm text-gray-600">Visualizaciones</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="text-green-500" size={24} />
            </div>
            <div className="text-2xl font-bold">
              {Math.round(analytics.totalWatchTime / 60)}m
            </div>
            <div className="text-sm text-gray-600">Tiempo Total</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="text-purple-500" size={24} />
            </div>
            <div className="text-2xl font-bold">{analytics.averageCompletionRate}%</div>
            <div className="text-sm text-gray-600">Completación</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="text-orange-500" size={24} />
            </div>
            <div className="text-2xl font-bold">{analytics.engagementScore}</div>
            <div className="text-sm text-gray-600">Engagement</div>
          </div>
        </div>

        {/* Análisis de Abandono */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2 flex items-center">
            <AlertTriangle className="mr-2 text-yellow-500" size={16} />
            Análisis de Abandono
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            Punto crítico: {analytics.dropoffAnalysis.criticalDropoffPoint}
          </p>
          <div className="space-y-1">
            {analytics.dropoffAnalysis.recommendations.map((rec, index) => (
              <div key={index} className="text-sm text-gray-700 flex items-start">
                <span className="mr-2">•</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Distribución por Dispositivo */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-3">Dispositivos</h4>
          <div className="space-y-2">
            {Object.entries(analytics.deviceBreakdown).map(([device, percentage]) => (
              <div key={device} className="flex items-center justify-between">
                <span className="text-sm capitalize">{device}</span>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Horario Óptimo */}
        <div className="border rounded-lg p-4">
          <h4 className="font-semibold mb-2">Horario Óptimo</h4>
          <p className="text-sm text-gray-600 mb-1">
            Hora pico: {analytics.timeOfDayAnalysis.peakHour}
          </p>
          <p className="text-sm text-gray-700">
            {analytics.timeOfDayAnalysis.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};

// 🎛️ PANEL DE ADMINISTRACIÓN DE VIDEOS
export const VideoAdminPanel = () => {
  const [activeTab, setActiveTab] = useState('storage');
  const [storageAnalysis, setStorageAnalysis] = useState(null);
  const [auditResults, setAuditResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runStorageAnalysis = async () => {
    setLoading(true);
    try {
      // Simular análisis de almacenamiento
      const mockAnalysis = {
        totalFiles: 248,
        totalSizeGB: '15.67',
        estimatedMonthlyCost: '0.3134',
        courseBreakdown: {
          'ia-basico': '8.45 GB',
          'ia-intermedio': '4.22 GB',
          'ia-avanzado': '3.00 GB'
        },
        qualityBreakdown: {
          '1080p': '9.87 GB',
          '720p': '3.45 GB',
          '480p': '2.35 GB'
        }
      };
      setStorageAnalysis(mockAnalysis);
    } catch (error) {
      console.error('Error en análisis:', error);
    } finally {
      setLoading(false);
    }
  };

  const runVideoAudit = async () => {
    setLoading(true);
    try {
      // Simular auditoría
      const mockAudit = {
        totalVideosChecked: 156,
        issuesFound: 3,
        healthScore: 98,
        issues: [
          {
            type: 'missing_file',
            chapterTitle: 'Introducción a ML',
            courseTitle: 'IA Básico',
            description: 'Archivo de video no encontrado'
          }
        ]
      };
      setAuditResults(mockAudit);
    } catch (error) {
      console.error('Error en auditoría:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'storage', label: 'Almacenamiento', icon: HardDrive },
    { id: 'audit', label: 'Auditoría', icon: CheckCircle },
    { id: 'optimization', label: 'Optimización', icon: TrendingUp }
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="inline mr-2" size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Storage Tab */}
        {activeTab === 'storage' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Análisis de Almacenamiento</h3>
              <button
                onClick={runStorageAnalysis}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Analizando...' : 'Ejecutar Análisis'}
              </button>
            </div>

            {storageAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total de Archivos</span>
                    <HardDrive className="text-gray-400" size={16} />
                  </div>
                  <div className="text-2xl font-bold">{storageAnalysis.totalFiles}</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Tamaño Total</span>
                    <HardDrive className="text-gray-400" size={16} />
                  </div>
                  <div className="text-2xl font-bold">{storageAnalysis.totalSizeGB} GB</div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Costo Mensual</span>
                    <DollarSign className="text-gray-400" size={16} />
                  </div>
                  <div className="text-2xl font-bold">${storageAnalysis.estimatedMonthlyCost}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Auditoría de Integridad</h3>
              <button
                onClick={runVideoAudit}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Auditando...' : 'Ejecutar Auditoría'}
              </button>
            </div>

            {auditResults && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {auditResults.healthScore}%
                    </div>
                    <div className="text-sm text-green-700">Score de Salud</div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {auditResults.totalVideosChecked}
                    </div>
                    <div className="text-sm text-blue-700">Videos Verificados</div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {auditResults.issuesFound}
                    </div>
                    <div className="text-sm text-red-700">Problemas Encontrados</div>
                  </div>
                </div>

                {auditResults.issues && auditResults.issues.length > 0 && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3 text-red-600">Problemas Detectados</h4>
                    <div className="space-y-2">
                      {auditResults.issues.map((issue, index) => (
                        <div key={index} className="bg-red-50 rounded p-3">
                          <div className="font-medium text-red-800">{issue.chapterTitle}</div>
                          <div className="text-sm text-red-600">{issue.courseTitle}</div>
                          <div className="text-sm text-red-700 mt-1">{issue.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Optimization Tab */}
        {activeTab === 'optimization' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Herramientas de Optimización</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Calidad Adaptiva</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Generar múltiples calidades para mejorar la experiencia de usuario.
                </p>
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                  Migrar a Adaptivo
                </button>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Limpieza Automática</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Eliminar archivos temporales y liberar espacio.
                </p>
                <button className="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
                  Ejecutar Limpieza
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};