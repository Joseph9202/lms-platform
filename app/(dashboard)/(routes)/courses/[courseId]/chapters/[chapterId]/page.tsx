"use client";

import { useState } from "react";
import { CheckCircle, Clock, FileText, Play, Users } from "lucide-react";
import { ChapterVideoManager } from "@/components/chapter-video-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Datos de ejemplo - En producción esto vendría de la base de datos
const chapterData = {
  id: "chapter-1",
  title: "Fundamentos de la Inteligencia Artificial",
  description: "Introducción a los conceptos básicos de IA, historia, tipos de IA y aplicaciones en el mundo real",
  duration: "30 min",
  objectives: [
    "Definir qué es la Inteligencia Artificial y sus tipos",
    "Distinguir entre IA, Machine Learning y Deep Learning", 
    "Identificar aplicaciones reales de IA en diferentes industrias",
    "Comprender la evolución histórica de la IA"
  ],
  course: {
    id: "course-1",
    title: "IA Básico - Certificación Profesional",
    instructor: "Dr. José Pablo"
  },
  videoUrl: "", // Se actualiza cuando se sube un video
  isCompleted: false,
  isFree: true
};

const components = [
  {
    id: "video",
    title: "🎥 Video Principal",
    description: "Fundamentos de IA: Historia, Definiciones y Conceptos Clave",
    duration: "30 min",
    type: "video"
  },
  {
    id: "case-study", 
    title: "📖 Estudio de Caso",
    description: "Tesla y la Revolución de la Conducción Autónoma",
    duration: "20 min",
    type: "reading"
  },
  {
    id: "lab",
    title: "🧪 Laboratorio",
    description: "Tu Primer Modelo de IA en Google Cloud",
    duration: "45 min", 
    type: "lab"
  },
  {
    id: "quiz",
    title: "📝 Quiz",
    description: "Conceptos Fundamentales de IA",
    duration: "10 min",
    type: "quiz"
  }
];

interface ChapterPageProps {
  params: {
    courseId: string;
    chapterId: string;
  };
}

export default function ChapterPage({ params }: ChapterPageProps) {
  const [activeComponent, setActiveComponent] = useState("video");
  const [completedComponents, setCompletedComponents] = useState<string[]>([]);
  
  // Simular datos del usuario - en producción vendría de la sesión
  const userId = "user_2zX61BkxmcroSdpzKbsGpB9rLaE";
  const isOwner = true; // Para pruebas, hacer true para poder subir videos

  const markComponentCompleted = (componentId: string) => {
    if (!completedComponents.includes(componentId)) {
      setCompletedComponents([...completedComponents, componentId]);
    }
  };

  const renderComponentContent = () => {
    switch (activeComponent) {
      case "video":
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">
                🎥 Video: Fundamentos de IA: Historia, Definiciones y Conceptos Clave
              </h3>
              <p className="text-blue-700 text-sm mb-2">
                Duración: 30 minutos | Nivel: Principiante
              </p>
              <div className="text-blue-600 text-sm">
                <strong>En este video aprenderás:</strong>
                <ul className="mt-2 space-y-1">
                  <li>• Historia de la IA desde los años 50</li>
                  <li>• Diferencia entre IA, ML y Deep Learning</li>
                  <li>• Tipos de IA: débil vs fuerte</li>
                  <li>• Aplicaciones actuales y futuras</li>
                </ul>
              </div>
            </div>

            <ChapterVideoManager
              chapterId={chapterData.id}
              userId={userId}
              isOwner={isOwner}
              initialVideoUrl={chapterData.videoUrl}
              chapterTitle={chapterData.title}
            />

            <div className="mt-6">
              <Button 
                onClick={() => markComponentCompleted("video")}
                className="w-full"
                disabled={completedComponents.includes("video")}
              >
                {completedComponents.includes("video") ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Video Completado
                  </>
                ) : (
                  "Marcar Video como Completado"
                )}
              </Button>
            </div>
          </div>
        );

      case "case-study":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  📖 Estudio de Caso: Tesla y la Conducción Autónoma
                </CardTitle>
                <CardDescription>
                  Análisis profundo de cómo Tesla usa IA para revolucionar el transporte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">🎯 Objetivos del Estudio de Caso</h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Comprender aplicaciones reales de IA en la industria automotriz</li>
                    <li>• Analizar desafíos técnicos y éticos de la conducción autónoma</li>
                    <li>• Evaluar estrategias competitivas basadas en datos</li>
                    <li>• Identificar consideraciones éticas en sistemas autónomos</li>
                  </ul>
                </div>

                <div className="prose max-w-none">
                  <h3>Introducción</h3>
                  <p>
                    Tesla no es solo una empresa de autos eléctricos; es una compañía de Inteligencia Artificial sobre ruedas. 
                    Su sistema Full Self-Driving (FSD) representa uno de los casos más ambiciosos y complejos de IA aplicada en el mundo real.
                  </p>

                  <h3>El Desafío Técnico</h3>
                  <p>
                    Crear un sistema que pueda identificar peatones, interpretar señales de tráfico, tomar decisiones en milisegundos, 
                    y adaptarse a condiciones variables, todo mientras garantiza la seguridad.
                  </p>

                  <h3>Arquitectura de IA</h3>
                  <ul>
                    <li><strong>Sensores:</strong> 8 cámaras, 12 sensores ultrasónicos, 1 radar frontal</li>
                    <li><strong>Processing:</strong> FSD Chip con 144 TOPS</li>
                    <li><strong>AI Stack:</strong> CNN para visión, Deep Learning para predicción, RL para políticas</li>
                    <li><strong>Datos:</strong> 3M+ vehículos generando 10+ billones de millas de datos</li>
                  </ul>

                  <h3>Consideraciones Éticas</h3>
                  <p>
                    Los dilemas morales automatizados (como el dilema del tranvía) plantean preguntas fundamentales: 
                    ¿Cómo debe programarse una máquina para tomar decisiones que involucran vidas humanas?
                  </p>
                </div>

                <div className="mt-6">
                  <Button 
                    onClick={() => markComponentCompleted("case-study")}
                    className="w-full"
                    disabled={completedComponents.includes("case-study")}
                  >
                    {completedComponents.includes("case-study") ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Estudio de Caso Completado
                      </>
                    ) : (
                      "Marcar Lectura como Completada"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "lab":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  🧪 Laboratorio: Tu Primer Modelo de IA en Google Cloud
                </CardTitle>
                <CardDescription>
                  Crear y entrenar tu primer modelo de clasificación usando Google Cloud Vertex AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-2">🎯 Objetivos del Laboratorio</h4>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>• Configurar Google Cloud Platform para IA</li>
                    <li>• Crear y organizar un dataset de imágenes</li>
                    <li>• Entrenar un modelo AutoML de clasificación</li>
                    <li>• Interpretar métricas de evaluación (precision, recall)</li>
                    <li>• Hacer predicciones con el modelo entrenado</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">⚡ Configuración Rápida</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul className="space-y-2">
                        <li>• Tiempo estimado: 45 minutos</li>
                        <li>• Prerrequisitos: Cuenta Google Cloud</li>
                        <li>• Créditos necesarios: $5-10 USD</li>
                        <li>• Nivel: Principiante</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">🛠️ Herramientas Usadas</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <ul className="space-y-2">
                        <li>• Google Cloud Platform</li>
                        <li>• Vertex AI AutoML</li>
                        <li>• Cloud Storage</li>
                        <li>• Dataset de flores (clasificación)</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">📋 Pasos del Laboratorio</h3>
                  
                  <div className="space-y-3">
                    {[
                      "PASO 1: Configuración inicial de Google Cloud (10 min)",
                      "PASO 2: Preparar el dataset de imágenes (10 min)", 
                      "PASO 3: Crear y entrenar modelo AutoML (15 min)",
                      "PASO 4: Evaluar resultados y métricas (5 min)",
                      "PASO 5: Probar predicciones en tiempo real (5 min)"
                    ].map((step, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-2">⚠️ Importante</h4>
                  <p className="text-yellow-700 text-sm">
                    Recuerda limpiar los recursos al final del laboratorio para evitar costos adicionales. 
                    El lab incluye instrucciones detalladas de cleanup.
                  </p>
                </div>

                <Button 
                  onClick={() => markComponentCompleted("lab")}
                  className="w-full"
                  disabled={completedComponents.includes("lab")}
                >
                  {completedComponents.includes("lab") ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Laboratorio Completado
                    </>
                  ) : (
                    "Marcar Laboratorio como Completado"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case "quiz":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  📝 Quiz: Conceptos Fundamentales de IA
                </CardTitle>
                <CardDescription>
                  Evaluación de 10 preguntas para verificar tu comprensión de los conceptos clave
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-900 mb-2">📋 Instrucciones del Quiz</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• 10 preguntas de opción múltiple</li>
                    <li>• Tiempo límite: 10 minutos</li>
                    <li>• Puntaje mínimo para aprobar: 70%</li>
                    <li>• Máximo 3 intentos permitidos</li>
                    <li>• Feedback inmediato después de cada pregunta</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">10</div>
                      <div className="text-sm text-gray-600">Preguntas</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">70%</div>
                      <div className="text-sm text-gray-600">Para Aprobar</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">10</div>
                      <div className="text-sm text-gray-600">Minutos</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">📚 Temas Evaluados:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {[
                      "Definiciones de IA, ML y Deep Learning",
                      "Historia y evolución de la IA",
                      "Tipos de IA (Débil vs Fuerte)",
                      "Aplicaciones actuales de IA",
                      "Caso de estudio de Tesla",
                      "Métricas de evaluación de modelos"
                    ].map((topic, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Consejos para el Quiz</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Lee cuidadosamente cada pregunta antes de responder</li>
                    <li>• Revisa el material del video y estudio de caso si es necesario</li>
                    <li>• Usa tu experiencia del laboratorio para preguntas prácticas</li>
                    <li>• No hay penalización por respuestas incorrectas</li>
                  </ul>
                </div>

                <Button 
                  onClick={() => markComponentCompleted("quiz")}
                  className="w-full"
                  disabled={completedComponents.includes("quiz")}
                >
                  {completedComponents.includes("quiz") ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Quiz Completado
                    </>
                  ) : (
                    "Comenzar Quiz"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return <div>Componente no encontrado</div>;
    }
  };

  const progress = (completedComponents.length / components.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                <span>{chapterData.course.title}</span>
                <span>•</span>
                <span>Lección 1</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{chapterData.title}</h1>
              <p className="text-gray-600 mt-1">{chapterData.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={chapterData.isFree ? "secondary" : "default"}>
                {chapterData.isFree ? "Gratis" : "Premium"}
              </Badge>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{chapterData.duration}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progreso de la lección</span>
              <span>{Math.round(progress)}% completado</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Components Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">📚 Componentes de la Lección</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {components.map((component) => (
                  <button
                    key={component.id}
                    onClick={() => setActiveComponent(component.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      activeComponent === component.id 
                        ? 'bg-blue-50 border-blue-200 text-blue-900' 
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{component.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{component.duration}</div>
                      </div>
                      {completedComponents.includes(component.id) && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Learning Objectives */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">🎯 Objetivos de Aprendizaje</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {chapterData.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderComponentContent()}
          </div>
        </div>
      </div>
    </div>
  );
}