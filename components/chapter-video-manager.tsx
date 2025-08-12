"use client";

import { useState } from "react";
import { VideoUpload } from "@/components/video-upload";
import { VideoPlayer } from "@/components/video-player";
import { useVideoProgress } from "@/hooks/use-video-progress";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play } from "lucide-react";
import { toast } from "react-hot-toast";

interface ChapterVideoManagerProps {
  chapterId: string;
  userId: string;
  isOwner: boolean;
  initialVideoUrl?: string;
  chapterTitle: string;
}

export const ChapterVideoManager = ({
  chapterId,
  userId,
  isOwner,
  initialVideoUrl,
  chapterTitle
}: ChapterVideoManagerProps) => {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl || "");
  
  // Debug logs
  console.log('ChapterVideoManager:', { chapterId, videoUrl: initialVideoUrl, isOwner });
  const { isCompleted, progress, updateProgress, markAsCompleted } = useVideoProgress({
    chapterId,
    userId
  });

  const handleVideoUpload = (newVideoUrl: string) => {
    setVideoUrl(newVideoUrl);
    toast.success("Video subido exitosamente!");
  };

  const handleVideoProgress = (watchedSeconds: number, totalSeconds: number) => {
    updateProgress(watchedSeconds, totalSeconds);
  };

  const handleVideoComplete = () => {
    if (!isCompleted) {
      markAsCompleted();
    }
  };

  if (isOwner) {
    // Vista del propietario/instructor - puede subir videos
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Gestión de Video - {chapterTitle}
          </h3>
          <p className="text-blue-700 text-sm mb-4">
            Como instructor, puedes subir y gestionar el video de este capítulo.
          </p>
        </div>

        {videoUrl ? (
          <div className="space-y-4">
            <VideoPlayer
              videoUrl={videoUrl}
              title={chapterTitle}
              className="w-full max-w-4xl mx-auto"
            />
            
            <div className="text-center">
              <VideoUpload
                chapterId={chapterId}
                onUploadComplete={handleVideoUpload}
                currentVideoUrl={videoUrl}
              />
            </div>
          </div>
        ) : (
          <VideoUpload
            chapterId={chapterId}
            onUploadComplete={handleVideoUpload}
          />
        )}
      </div>
    );
  }

  // Vista del estudiante
  if (!videoUrl) {
    return (
      <div className="text-center py-12">
        <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Video no disponible
        </h3>
        <p className="text-gray-500">
          El video para este capítulo aún no ha sido subido.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Debug: videoUrl = "{videoUrl}", initialVideoUrl = "{initialVideoUrl}"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Indicador de progreso */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">Progreso del capítulo</h3>
          {isCompleted && (
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-1" />
              <span className="text-sm">Completado</span>
            </div>
          )}
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600 mt-2">
          {Math.round(progress)}% completado
        </p>
      </div>

      {/* Reproductor de video */}
      <VideoPlayer
        videoUrl={videoUrl}
        title={chapterTitle}
        onProgress={handleVideoProgress}
        onComplete={handleVideoComplete}
        className="w-full max-w-4xl mx-auto"
      />

      {/* Botón para marcar como completado manualmente */}
      {!isCompleted && progress > 50 && (
        <div className="text-center">
          <Button
            onClick={markAsCompleted}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Marcar como completado
          </Button>
        </div>
      )}
    </div>
  );
};