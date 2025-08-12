"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  onProgress?: (watchedSeconds: number, totalSeconds: number) => void;
  onComplete?: () => void;
  className?: string;
}

export const VideoPlayer = ({
  videoUrl,
  title,
  onProgress,
  onComplete,
  className
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  let hideControlsTimeout: NodeJS.Timeout;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      onProgress?.(video.currentTime, video.duration);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    const handleLoadStart = () => {
      setIsLoading(true);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setVideoError(null);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
    };

    const handleError = (e: Event) => {
      const videoElement = e.target as HTMLVideoElement;
      setIsLoading(false);
      
      let errorMessage = 'Error desconocido';
      if (videoElement.error) {
        switch (videoElement.error.code) {
          case 1:
            errorMessage = 'Error de red - No se pudo cargar el video';
            break;
          case 2:
            errorMessage = 'Error de decodificación - Formato no soportado';
            break;
          case 3:
            errorMessage = 'Error de reproducción';
            break;
          case 4:
            errorMessage = 'Video no disponible o corrupto';
            break;
          default:
            errorMessage = `Error ${videoElement.error.code}: ${videoElement.error.message || 'Error de video'}`;
        }
      }
      
      setVideoError(errorMessage);
      console.error('Video error:', errorMessage, videoElement.error);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('error', handleError);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('error', handleError);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [onProgress, onComplete]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsLoading(true);
        await video.play();
        setIsPlaying(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error playing video:', error);
        setIsLoading(false);
      }
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  const handlePlaybackRateChange = () => {
    const video = videoRef.current;
    if (!video) return;

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    
    video.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const restart = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = 0;
    setCurrentTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative bg-black overflow-hidden group transition-all duration-300",
        isFullscreen ? "fixed inset-0 z-50" : "rounded-xl shadow-2xl",
        className
      )}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        className={cn(
          "w-full h-full object-contain",
          isFullscreen ? "h-screen" : "aspect-video"
        )}
        onClick={togglePlay}
        preload="metadata"
        poster=""
      />

      {/* Loading Spinner */}
      {isLoading && !videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent shadow-lg"></div>
          <div className="mt-4 text-white text-lg font-medium">Cargando video...</div>
          <div className="mt-2 text-blue-200 text-sm">Preparando la mejor calidad para ti</div>
        </div>
      )}

      {/* Error Message */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="text-center text-white p-6">
            <div className="text-red-400 text-lg font-semibold mb-2">Error al cargar el video</div>
            <div className="text-sm mb-4">{videoError}</div>
            <div className="text-xs text-gray-400 mb-4">URL: {videoUrl}</div>
            <Button
              onClick={() => {
                setVideoError(null);
                setIsLoading(true);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reintentar
            </Button>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <Button
            onClick={togglePlay}
            size="lg"
            className="rounded-full h-20 w-20 bg-white/90 hover:bg-white backdrop-blur-sm shadow-2xl hover:scale-110 transition-all duration-300"
          >
            <Play className="h-10 w-10 text-black ml-1" />
          </Button>
        </div>
      )}

      {/* Controls */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-sm transition-all duration-300",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          isFullscreen ? "p-6" : "p-4"
        )}
      >
        {/* Progress Bar */}
        <div className="mb-6">
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full cursor-pointer"
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={togglePlay}
              size={isFullscreen ? "default" : "sm"}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
            >
              {isPlaying ? <Pause className={isFullscreen ? "h-6 w-6" : "h-5 w-5"} /> : <Play className={isFullscreen ? "h-6 w-6" : "h-5 w-5"} />}
            </Button>

            <Button
              onClick={restart}
              size={isFullscreen ? "default" : "sm"}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <RotateCcw className={isFullscreen ? "h-5 w-5" : "h-4 w-4"} />
            </Button>

            <div className="flex items-center space-x-3">
              <Button
                onClick={toggleMute}
                size={isFullscreen ? "default" : "sm"}
                variant="ghost"
                className="text-white hover:bg-white/20 rounded-full"
              >
                {isMuted ? <VolumeX className={isFullscreen ? "h-5 w-5" : "h-4 w-4"} /> : <Volume2 className={isFullscreen ? "h-5 w-5" : "h-4 w-4"} />}
              </Button>

              <div className={isFullscreen ? "w-32" : "w-24"}>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <span className={cn("text-white font-mono", isFullscreen ? "text-base" : "text-sm")}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={handlePlaybackRateChange}
              size={isFullscreen ? "default" : "sm"}
              variant="ghost"
              className="text-white hover:bg-white/20 text-sm font-mono rounded-full min-w-[3rem]"
            >
              {playbackRate}x
            </Button>

            <Button
              onClick={toggleFullscreen}
              size={isFullscreen ? "default" : "sm"}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <Maximize className={isFullscreen ? "h-5 w-5" : "h-4 w-4"} />
            </Button>
          </div>
        </div>
      </div>

      {/* Title Overlay */}
      {title && showControls && (
        <div className={cn(
          "absolute top-4 left-4 right-4 transition-all duration-300",
          showControls ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}>
          <h3 className={cn(
            "text-white font-semibold bg-black/60 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg",
            isFullscreen ? "text-xl" : "text-lg"
          )}>
            {title}
          </h3>
        </div>
      )}
    </div>
  );
};