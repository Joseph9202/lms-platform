"use client";

import { useState } from "react";
import { CheckCircle, Play, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChapterVideoManager } from "@/components/chapter-video-manager";

interface VideoSectionClientProps {
  chapterId: string;
  chapterTitle: string;
  userId: string;
  isOwner: boolean;
  initialVideoUrl: string;
  description: string;
}

export const VideoSectionClient = ({ 
  chapterId, 
  chapterTitle, 
  userId, 
  isOwner, 
  initialVideoUrl,
  description 
}: VideoSectionClientProps) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const markAsCompleted = () => {
    setIsCompleted(true);
    // TODO: Save completion to database
  };

  return (
    <div className="space-y-8">
      {/* Video Content */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8 border border-gray-100 shadow-lg">
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <div className="bg-blue-600 p-2 rounded-lg mr-3 shadow-md">
              <Video className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {chapterTitle.replace(/🎥|Video:/, '').trim()}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {description || "Video explicativo sobre conceptos fundamentales de IA, historia y aplicaciones modernas"}
          </p>
        </div>

        {/* Video Manager Component - handles both upload (for owners) and playback */}
        <div className="mb-6">
          <ChapterVideoManager
            chapterId={chapterId}
            userId={userId}
            isOwner={isOwner}
            initialVideoUrl={initialVideoUrl}
            chapterTitle={chapterTitle}
          />
        </div>

        {/* Video Topics */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">📚</span>
            Temas cubiertos en este video
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Historia de la IA desde los años 50",
              "Diferencia entre IA, ML y Deep Learning",
              "Tipos de IA: débil vs fuerte",
              "Aplicaciones actuales en industrias",
              "Tendencias futuras y oportunidades",
              "Consideraciones éticas en IA"
            ].map((topic, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-800">{topic}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Completion Button - Only show if not using video progress tracking */}
      {!initialVideoUrl && (
        <div className="text-center">
          <Button 
            onClick={markAsCompleted}
            disabled={isCompleted}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            {isCompleted ? (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Video Completado
              </>
            ) : (
              "Marcar Video como Visto"
            )}
          </Button>
        </div>
      )}

      {/* Next Step Info */}
      {isCompleted && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="font-bold text-green-900 text-lg">¡Excelente!</span>
          </div>
          <p className="text-green-700">
            Has completado el video. Continúa con la lectura interactiva para profundizar en los conceptos.
          </p>
        </div>
      )}

      {/* Video Notes Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <h3 className="text-xl font-bold flex items-center">
            <span className="text-2xl mr-3">📝</span>
            Notas del Video
          </h3>
          <p className="text-purple-100 mt-2">Puntos clave para recordar</p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h5 className="font-bold text-gray-900 mb-2">Definición de IA:</h5>
              <p className="text-gray-700 leading-relaxed">
                La Inteligencia Artificial es la capacidad de las máquinas para realizar tareas que 
                típicamente requieren inteligencia humana, como percepción, razonamiento y aprendizaje.
              </p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h5 className="font-bold text-gray-900 mb-2">Evolución Histórica:</h5>
              <p className="text-gray-700 leading-relaxed">
                Desde el test de Turing (1950) hasta los LLMs modernos como GPT, la IA ha evolucionado 
                en ondas de progreso e "inviernos de IA".
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <h5 className="font-bold text-gray-900 mb-2">Aplicaciones Actuales:</h5>
              <p className="text-gray-700 leading-relaxed">
                Reconocimiento de voz, visión por computadora, procesamiento de lenguaje natural, 
                sistemas de recomendación, vehículos autónomos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};