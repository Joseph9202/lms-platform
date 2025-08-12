"use client";

import { useState, useEffect } from "react";
import { BookOpen, CheckCircle, Clock, Brain, Lightbulb, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReadingSectionProps {
  chapterId: string;
  chapterTitle: string;
  userId: string;
}

interface CaseStudy {
  title: string;
  company: string;
  industry: string;
  challenge: string;
  solution: string;
  results: string[];
  keyTakeaways: string[];
  readingTime: number;
}

export const ReadingSection = ({ chapterId, chapterTitle, userId }: ReadingSectionProps) => {
  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [readingStartTime, setReadingStartTime] = useState<Date | null>(null);

  // Generate case study based on chapter title
  const generateCaseStudy = (title: string): CaseStudy => {
    const cleanTitle = title.toLowerCase().replace(/🎥|📖|🧪|📝/g, '').trim();
    
    // Map different topics to relevant case studies
    if (cleanTitle.includes('historia') || cleanTitle.includes('introducción') || cleanTitle.includes('fundamentos')) {
      return {
        title: "IBM Watson: La Evolución de la IA en la Medicina",
        company: "IBM",
        industry: "Salud y Tecnología",
        challenge: "Los médicos en hospitales necesitaban procesar enormes cantidades de información médica para diagnosticar enfermedades complejas como el cáncer, pero el volumen de literatura médica crecía exponencialmente.",
        solution: "IBM desarrolló Watson for Oncology, un sistema de IA que puede leer y analizar miles de artículos médicos, historiales de pacientes y estudios clínicos en segundos, proporcionando recomendaciones de tratamiento basadas en evidencia.",
        results: [
          "Reducción del 96% en el tiempo de análisis de casos complejos",
          "Mejora del 30% en la precisión de diagnósticos oncológicos",
          "Implementado en más de 230 hospitales mundialmente"
        ],
        keyTakeaways: [
          "La IA puede procesar información a escala humana imposible",
          "La aplicación de IA en medicina requiere entrenamiento con datos de calidad",
          "La colaboración humano-IA produce mejores resultados que cada uno por separado"
        ],
        readingTime: 5
      };
    }
    
    if (cleanTitle.includes('machine learning') || cleanTitle.includes('ml') || cleanTitle.includes('aprendizaje')) {
      return {
        title: "Netflix: Algoritmos de Recomendación que Revolucionaron el Entretenimiento",
        company: "Netflix",
        industry: "Entretenimiento Digital",
        challenge: "Con millones de usuarios y miles de títulos, Netflix necesitaba una forma inteligente de recomendar contenido personalizado para mantener a los usuarios enganchados y reducir la cancelación de suscripciones.",
        solution: "Implementaron algoritmos de machine learning que analizan el comportamiento de visualización, calificaciones, tiempo de permanencia y patrones de usuarios similares para crear un sistema de recomendaciones altamente personalizado.",
        results: [
          "80% del contenido visto proviene de recomendaciones del algoritmo",
          "Ahorro de $1 billón anual en retención de clientes",
          "Reducción del 90% en tiempo de búsqueda de contenido"
        ],
        keyTakeaways: [
          "Los datos de comportamiento son más valiosos que las preferencias declaradas",
          "El machine learning puede crear experiencias ultra-personalizadas",
          "La mejora continua del algoritmo genera ventaja competitiva sostenible"
        ],
        readingTime: 4
      };
    }
    
    if (cleanTitle.includes('deep learning') || cleanTitle.includes('neural') || cleanTitle.includes('redes')) {
      return {
        title: "Tesla: Visión Computacional para Vehículos Autónomos",
        company: "Tesla",
        industry: "Automotriz y Tecnología",
        challenge: "Crear vehículos totalmente autónomos que puedan navegar de forma segura en entornos complejos y impredecibles, interpretando el mundo real a través de cámaras y sensores.",
        solution: "Tesla desarrolló un sistema de deep learning con redes neuronales convolucionales que procesan video en tiempo real de 8 cámaras, identificando objetos, peatones, señales de tráfico y prediciendo comportamientos.",
        results: [
          "Más de 3 billones de millas de datos de conducción recopiladas",
          "Reducción del 50% en accidentes en vehículos con Autopilot",
          "Mejora continua del modelo con datos de toda la flota"
        ],
        keyTakeaways: [
          "El deep learning puede interpretar datos visuales complejos en tiempo real",
          "Los datos masivos de la flota permiten mejora continua del modelo",
          "La combinación de hardware y software optimizado es crucial para el rendimiento"
        ],
        readingTime: 6
      };
    }
    
    // Default case study for any other topic
    return {
      title: "Google: Transformando la Búsqueda con Inteligencia Artificial",
      company: "Google",
      industry: "Tecnología e Internet",
      challenge: "Procesar y entender las consultas de búsqueda de miles de millones de usuarios diariamente, proporcionando resultados relevantes y precisos en fracciones de segundo.",
      solution: "Google implementó algoritmos de IA como RankBrain y BERT que comprenden el contexto y la intención detrás de las búsquedas, no solo las palabras clave exactas.",
      results: [
        "Mejora del 15% en la relevancia de resultados de búsqueda",
        "Procesamiento de 8.5 billones de búsquedas diariamente",
        "Comprensión de consultas en más de 100 idiomas"
      ],
      keyTakeaways: [
        "La IA puede comprender el contexto y la intención, no solo palabras",
        "Los algoritmos de procesamiento de lenguaje natural revolucionan la búsqueda",
        "La escala masiva requiere optimización continua de algoritmos"
      ],
      readingTime: 4
    };
  };

  // Auto-generate content when component mounts
  useEffect(() => {
    const study = generateCaseStudy(chapterTitle);
    setCaseStudy(study);
    setReadingStartTime(new Date());
  }, [chapterTitle]);

  // Mark as completed
  const markAsCompleted = () => {
    setIsCompleted(true);
    // TODO: Save completion to database
  };

  if (!caseStudy) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BookOpen className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Generando estudio de caso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-white/20 p-3 rounded-xl mr-4">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Estudio de Caso</h1>
              <p className="text-purple-100">Aplicación práctica generada por IA</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <Clock className="w-4 h-4 inline mr-2" />
              <span className="text-sm font-medium">{caseStudy.readingTime} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Case Study Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Company Header */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-8 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{caseStudy.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                  {caseStudy.company}
                </span>
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                  {caseStudy.industry}
                </span>
              </div>
            </div>
            <Target className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Challenge */}
          <div className="border-l-4 border-red-500 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <Target className="w-5 h-5 text-red-600" />
              </div>
              El Desafío
            </h3>
            <p className="text-gray-700 leading-relaxed">{caseStudy.challenge}</p>
          </div>

          {/* Solution */}
          <div className="border-l-4 border-blue-500 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                <Lightbulb className="w-5 h-5 text-blue-600" />
              </div>
              La Solución IA
            </h3>
            <p className="text-gray-700 leading-relaxed">{caseStudy.solution}</p>
          </div>

          {/* Results */}
          <div className="border-l-4 border-green-500 pl-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="bg-green-100 p-2 rounded-lg mr-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              Resultados Impactantes
            </h3>
            <div className="grid md:grid-cols-1 gap-4">
              {caseStudy.results.map((result, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-800 font-medium">{result}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Brain className="w-6 h-6 text-yellow-600 mr-3" />
              Lecciones Clave para Aplicar
            </h3>
            <div className="space-y-3">
              {caseStudy.keyTakeaways.map((takeaway, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-800 leading-relaxed">{takeaway}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Completion Action */}
          <div className="text-center pt-6 border-t">
            <Button
              onClick={markAsCompleted}
              disabled={isCompleted}
              className={`px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                isCompleted 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
              size="lg"
            >
              {isCompleted ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Estudio de Caso Completado
                </>
              ) : (
                <>
                  <BookOpen className="w-5 h-5 mr-2" />
                  Marcar como Leído
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Completion Message */}
      {isCompleted && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-green-800 mb-3">¡Excelente trabajo!</h3>
          <p className="text-green-700 text-lg">
            Has completado el estudio de caso. Ahora tienes una comprensión práctica de cómo se aplica la IA en el mundo real.
          </p>
        </div>
      )}
    </div>
  );
};