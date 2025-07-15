"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Upload, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface VideoUploadProps {
  chapterId: string;
  onUploadComplete: (videoUrl: string) => void;
  currentVideoUrl?: string;
}

export const VideoUpload = ({
  chapterId,
  onUploadComplete,
  currentVideoUrl
}: VideoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Por favor selecciona un archivo de video válido');
      return;
    }

    // Verificar tamaño (máximo 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('El archivo es muy grande. Máximo 500MB permitido.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('chapterId', chapterId);

      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Error uploading video');
      }

      const data = await response.json();
      setUploadProgress(100);
      
      toast.success('Video subido exitosamente!');
      onUploadComplete(data.videoUrl);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Error subiendo video');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const removeVideo = async () => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: null }),
      });

      if (response.ok) {
        toast.success('Video eliminado');
        onUploadComplete('');
      }
    } catch (error) {
      toast.error('Error eliminando video');
    }
  };

  if (currentVideoUrl && !isUploading) {
    return (
      <div className="relative">
        <div className="aspect-video rounded-md overflow-hidden">
          <video
            controls
            className="w-full h-full object-cover"
            src={currentVideoUrl}
          >
            Tu navegador no soporta el elemento video.
          </video>
        </div>
        <Button
          onClick={removeVideo}
          className="absolute top-2 right-2"
          type="button"
          variant="destructive"
          size="sm"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/*"
          onChange={handleInputChange}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-2">
          <Video className="mx-auto h-12 w-12 text-gray-400" />
          <div className="text-sm text-gray-600">
            <span className="font-medium text-blue-600 hover:text-blue-500">
              Haz clic para subir
            </span>{" "}
            o arrastra y suelta tu video aquí
          </div>
          <p className="text-xs text-gray-500">
            MP4, WebM, MOV hasta 500MB
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Upload className="h-4 w-4 animate-pulse" />
            <span className="text-sm text-gray-600">
              Subiendo video... {uploadProgress}%
            </span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}
    </div>
  );
};