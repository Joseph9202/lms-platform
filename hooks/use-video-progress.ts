"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

interface UseVideoProgressProps {
  chapterId: string;
  userId: string;
}

export const useVideoProgress = ({ chapterId, userId }: UseVideoProgressProps) => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Cargar progreso inicial del capítulo
    const loadProgress = async () => {
      try {
        const response = await fetch(`/api/chapters/${chapterId}/progress`);
        if (response.ok) {
          const data = await response.json();
          setIsCompleted(data.isCompleted);
          setProgress(data.progress || 0);
        }
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    };

    loadProgress();
  }, [chapterId]);

  const updateProgress = async (watchedSeconds: number, totalSeconds: number) => {
    if (totalSeconds === 0) return;

    const progressPercentage = (watchedSeconds / totalSeconds) * 100;
    const shouldComplete = progressPercentage >= 90; // Marcar como completo al 90%

    setProgress(progressPercentage);

    // Actualizar progreso en el servidor cada 5 segundos
    if (Math.floor(watchedSeconds) % 5 === 0) {
      try {
        await fetch(`/api/chapters/${chapterId}/progress`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isCompleted: shouldComplete,
            progress: progressPercentage,
          }),
        });
      } catch (error) {
        console.error("Error updating progress:", error);
      }
    }
  };

  const markAsCompleted = async () => {
    try {
      const response = await fetch(`/api/chapters/${chapterId}/progress`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isCompleted: true,
          progress: 100,
        }),
      });

      if (response.ok) {
        setIsCompleted(true);
        setProgress(100);
        toast.success("¡Capítulo completado!");
        
        // Recargar página para actualizar progreso general
        window.location.reload();
      }
    } catch (error) {
      console.error("Error marking as completed:", error);
      toast.error("Error al marcar como completado");
    }
  };

  return {
    isCompleted,
    progress,
    updateProgress,
    markAsCompleted,
  };
};