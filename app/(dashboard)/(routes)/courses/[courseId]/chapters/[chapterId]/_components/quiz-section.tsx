"use client";

import { useState, useEffect } from "react";
import { CheckCircle, FileText, Clock, Award, RotateCcw, ArrowRight, AlertCircle, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "react-hot-toast";

interface QuizSectionProps {
  chapterId: string;
  chapterTitle: string;
  userId: string;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false';
  question: string;
  options: string[];
  correctAnswer: number | boolean;
  explanation: string;
  points: number;
}

interface AIQuiz {
  id: string;
  title: string;
  description: string;
  difficulty: 'básico' | 'intermedio' | 'avanzado';
  totalQuestions: number;
  timeLimit: number;
  questions: Question[];
  passingScore: number;
  maxAttempts: number;
  generated: boolean;
  topics: string[];
}

export const QuizSection = ({ chapterId, chapterTitle, userId }: QuizSectionProps) => {
  const [aiQuiz, setAiQuiz] = useState<AIQuiz | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | boolean)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [attempts, setAttempts] = useState(0);

  // Generate AI-powered quiz
  const generateQuiz = async (difficulty: 'básico' | 'intermedio' | 'avanzado' = 'básico') => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          videoContent: { title: chapterTitle },
          readingContent: { completed: true },
          labContent: { exercisesCompleted: true },
          difficulty
        })
      });

      if (!response.ok) throw new Error('Error generando quiz');

      const quiz = await response.json();
      setAiQuiz(quiz);
      setTimeLeft(quiz.timeLimit);
      toast.success('🧠 Quiz generado con IA!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error generando quiz con IA');
    } finally {
      setIsGenerating(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (isStarted && !showResults && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isStarted && timeLeft === 0) {
      finishQuiz();
    }
  }, [timeLeft, isStarted, showResults]);

  const startQuiz = () => {
    if (!aiQuiz) return;
    setIsStarted(true);
    setAttempts(attempts + 1);
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(aiQuiz.questions.length).fill(undefined));
    setShowResults(false);
    setTimeLeft(aiQuiz.timeLimit);
  };

  const selectAnswer = (answer: number | boolean) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answer;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (!aiQuiz) return;
    if (currentQuestion < aiQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setShowResults(true);
  };

  const getScore = () => {
    if (!aiQuiz) return 0;
    let correct = 0;
    let totalPoints = 0;
    
    aiQuiz.questions.forEach((question, index) => {
      totalPoints += question.points;
      if (selectedAnswers[index] === question.correctAnswer) {
        correct += question.points;
      }
    });
    
    return { correctPoints: correct, totalPoints, percentage: Math.round((correct / totalPoints) * 100) };
  };

  const getScorePercentage = () => {
    const score = getScore();
    return typeof score === 'object' ? score.percentage : 0;
  };

  const isPassed = () => {
    if (!aiQuiz) return false;
    return getScorePercentage() >= aiQuiz.passingScore;
  };

  const markAsCompleted = () => {
    setIsCompleted(true);
    // TODO: Save completion to database
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Quiz Introduction  
  if (!aiQuiz || (!isStarted && !showResults)) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              Quiz Generado por IA
            </CardTitle>
            <CardDescription>
              Quiz adaptativo basado en el contenido del video, lectura y laboratorio del capítulo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!aiQuiz ? (
              <div className="text-center py-8">
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h4 className="font-medium text-purple-900 mb-3">🤖 Quiz Inteligente Adaptativo</h4>
                    <p className="text-purple-700 text-sm mb-4">
                      Nuestro sistema de IA generará un quiz personalizado basado en:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-purple-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span>Contenido del video</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span>Material de lectura</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span>Ejercicios de laboratorio</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button 
                      onClick={() => generateQuiz('básico')}
                      disabled={isGenerating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      {isGenerating ? 'Generando...' : 'Quiz Básico'}
                    </Button>
                    <Button 
                      onClick={() => generateQuiz('intermedio')}
                      disabled={isGenerating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Quiz Intermedio
                    </Button>
                    <Button 
                      onClick={() => generateQuiz('avanzado')}
                      disabled={isGenerating}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Quiz Avanzado
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-medium text-purple-900 mb-3">📋 {aiQuiz.title}</h4>
                  <p className="text-purple-700 text-sm mb-3">{aiQuiz.description}</p>
                  <ul className="text-purple-700 text-sm space-y-1">
                    <li>• {aiQuiz.totalQuestions} preguntas adaptativas</li>
                    <li>• Tiempo límite: {Math.floor(aiQuiz.timeLimit / 60)} minutos</li>
                    <li>• Puntaje mínimo para aprobar: {aiQuiz.passingScore}%</li>
                    <li>• Máximo {aiQuiz.maxAttempts} intentos permitidos</li>
                    <li>• Feedback inmediato después del quiz</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{aiQuiz.totalQuestions}</div>
                      <div className="text-sm text-gray-600">Preguntas</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{aiQuiz.passingScore}%</div>
                      <div className="text-sm text-gray-600">Para Aprobar</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">{Math.floor(aiQuiz.timeLimit / 60)}</div>
                      <div className="text-sm text-gray-600">Minutos</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">📚 Temas Evaluados:</h4>
                  <div className="flex flex-wrap gap-2">
                    {aiQuiz.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {attempts > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Intentos realizados: {attempts}/{aiQuiz.maxAttempts}
                      {attempts >= aiQuiz.maxAttempts && " - Has alcanzado el máximo de intentos"}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-center">
                  <Button 
                    onClick={startQuiz}
                    disabled={attempts >= aiQuiz.maxAttempts}
                    size="lg"
                    className="w-full md:w-auto"
                  >
                    {attempts === 0 ? "Comenzar Quiz" : `Intento ${attempts + 1}/${aiQuiz.maxAttempts}`}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz Questions
  if (isStarted && !showResults && aiQuiz) {
    const progress = ((currentQuestion + 1) / aiQuiz.questions.length) * 100;
    const currentQ = aiQuiz.questions[currentQuestion];

    return (
      <div className="space-y-6">
        {/* Progress Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <Badge variant="outline">
                  Pregunta {currentQuestion + 1} de {aiQuiz.questions.length}
                </Badge>
                <Badge variant="outline" className="text-purple-600">
                  {aiQuiz.difficulty}
                </Badge>
                <Badge variant="outline" className="text-blue-600">
                  {currentQ.points} pts
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Question */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed">
              {currentQ.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {currentQ.type === 'multiple_choice' ? (
                currentQ.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedAnswers[currentQuestion] === index
                        ? 'bg-purple-50 border-purple-300 text-purple-900'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        selectedAnswers[currentQuestion] === index
                          ? 'bg-purple-600 border-purple-600 text-white'
                          : 'border-gray-300'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => selectAnswer(true)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedAnswers[currentQuestion] === true
                        ? 'bg-green-50 border-green-300 text-green-900'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        selectedAnswers[currentQuestion] === true
                          ? 'bg-green-600 border-green-600 text-white'
                          : 'border-gray-300'
                      }`}>
                        ✓
                      </div>
                      <span>Verdadero</span>
                    </div>
                  </button>
                  <button
                    onClick={() => selectAnswer(false)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedAnswers[currentQuestion] === false
                        ? 'bg-red-50 border-red-300 text-red-900'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        selectedAnswers[currentQuestion] === false
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'border-gray-300'
                      }`}>
                        ✗
                      </div>
                      <span>Falso</span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Anterior
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={selectedAnswers[currentQuestion] === undefined}
              >
                {currentQuestion === aiQuiz.questions.length - 1 ? "Finalizar Quiz" : "Siguiente"}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz Results
  if (showResults && aiQuiz) {
    const scoreData = getScore();
    const percentage = getScorePercentage();
    const passed = isPassed();

    return (
      <div className="space-y-6">
        {/* Results Header */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {passed ? (
                  <Award className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-600" />
                )}
              </div>
              <div>
                <h3 className={`text-2xl font-bold mb-2 ${
                  passed ? 'text-green-900' : 'text-red-900'
                }`}>
                  {passed ? "¡Quiz Aprobado!" : "Quiz No Aprobado"}
                </h3>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {typeof scoreData === 'object' ? `${scoreData.correctPoints}/${scoreData.totalPoints}` : '0/0'} puntos ({percentage}%)
                </div>
                <p className={`text-sm ${passed ? 'text-green-700' : 'text-red-700'}`}>
                  {passed 
                    ? "Excelente comprensión de los conceptos fundamentales de IA"
                    : "Necesitas repasar algunos conceptos. Puedes intentar nuevamente."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Results */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Resultados Detallados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiQuiz.questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={index} className={`p-4 rounded-lg border ${
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">
                        {index + 1}. {question.question}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div className={isCorrect ? 'text-green-700' : 'text-red-700'}>
                          <strong>Tu respuesta:</strong> {
                            question.type === 'multiple_choice' 
                              ? question.options[userAnswer as number]
                              : userAnswer ? 'Verdadero' : 'Falso'
                          }
                        </div>
                        {!isCorrect && (
                          <div className="text-green-700">
                            <strong>Respuesta correcta:</strong> {
                              question.type === 'multiple_choice'
                                ? question.options[question.correctAnswer as number]
                                : question.correctAnswer ? 'Verdadero' : 'Falso'
                            }
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`ml-4 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 bg-white p-3 rounded border-l-4 border-blue-400">
                    <strong>Explicación:</strong> {question.explanation}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {passed ? (
                <Button 
                  onClick={markAsCompleted}
                  disabled={isCompleted}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Quiz Completado
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4 mr-2" />
                      Completar Lección
                    </>
                  )}
                </Button>
              ) : attempts < aiQuiz.maxAttempts ? (
                <Button 
                  onClick={() => {
                    setIsStarted(false);
                    setShowResults(false);
                  }}
                  size="lg"
                  variant="outline"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Intentar Nuevamente
                </Button>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Has agotado los {aiQuiz.maxAttempts} intentos permitidos. Contacta al instructor para revisión.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        {passed && isCompleted && (
          <Card>
            <CardContent className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <h4 className="font-medium text-green-900 mb-2">
                  🎉 ¡Felicidades! Has completado la Lección 1: Introducción a IA
                </h4>
                <p className="text-green-700 text-sm">
                  Has demostrado una sólida comprensión de los conceptos fundamentales. 
                  Estás listo para continuar con la siguiente lección del curso.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
};