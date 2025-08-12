"use client";

import { useState } from "react";
import { CourseEnrollButton } from "./course-enroll-button";
import { CourseProgress } from "@/components/course-progress";

interface CourseEnrollmentCardProps {
  courseId: string;
  courseTitle: string;
  price: number;
  purchased: boolean;
  isIABasicoFree: boolean;
  progressCount: number | null;
  firstChapterId?: string;
}

export const CourseEnrollmentCard = ({
  courseId,
  courseTitle,
  price,
  purchased,
  isIABasicoFree,
  progressCount,
  firstChapterId
}: CourseEnrollmentCardProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleFreeAccess = () => {
    if (firstChapterId) {
      window.location.href = `/courses/${courseId}/chapters/${firstChapterId}`;
    } else {
      // Fallback: just reload the course page or show an alert
      console.error('No first chapter ID available');
      alert('No se encontró el primer capítulo. Por favor, selecciona un capítulo de la lista.');
    }
  };

  return (
    <div className="space-y-4">
      {isIABasicoFree ? (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6 text-center shadow-lg">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <span className="bg-white/20 text-white text-sm px-4 py-2 rounded-full font-bold shadow-lg">
                🎉 GRATIS
              </span>
            </div>
            <h3 className="font-bold text-xl mb-2">¡Curso Completamente Gratuito!</h3>
            <p className="text-green-100 text-sm">Acceso completo sin restricciones</p>
          </div>
          
          <button
            className="w-full bg-white text-blue-600 hover:text-blue-700 font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-white/20 hover:bg-blue-50"
            onClick={handleFreeAccess}
          >
            🚀 Comenzar curso gratis ahora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <CourseEnrollButton
            courseId={courseId}
            price={price}
            purchased={purchased}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};