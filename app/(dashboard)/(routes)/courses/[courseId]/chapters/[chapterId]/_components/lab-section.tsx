"use client";

import { useState, useEffect } from "react";
import { Play, FlaskConical, Lightbulb, CheckCircle, RotateCcw, Sparkles, Code, Terminal, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-hot-toast";

interface LabSectionProps {
  chapterId: string;
  chapterTitle: string;
  userId: string;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 'básico' | 'intermedio' | 'avanzado';
  initialCode: string;
  expectedOutput?: string;
  hints: string[];
  solution: string;
}

export const LabSection = ({ chapterId, chapterTitle, userId }: LabSectionProps) => {
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [userCode, setUserCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  // Inicializar Pyodide
  useEffect(() => {
    const initPyodide = async () => {
      try {
        // @ts-ignore
        if (typeof window !== 'undefined' && !window.pyodide) {
          // Cargar Pyodide
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
          script.onload = async () => {
            try {
              // @ts-ignore
              const pyodide = await loadPyodide();
              // @ts-ignore
              window.pyodide = pyodide;
              setPyodideReady(true);
              toast.success('🐍 Entorno Python listo!');
            } catch (error) {
              console.error('Error loading Pyodide:', error);
              toast.error('Error cargando Python');
            }
          };
          script.onerror = () => {
            toast.error('Error cargando Python');
          };
          document.head.appendChild(script);
        } else {
          setPyodideReady(true);
        }
      } catch (error) {
        console.error('Error inicializando Pyodide:', error);
        toast.error('Error cargando Python');
      }
    };

    initPyodide();
  }, []);

  // Generar ejercicio con IA
  const generateExercise = async (difficulty: 'básico' | 'intermedio' | 'avanzado' = 'básico') => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-exercise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId,
          difficulty,
          completedExercises,
          topic: 'Fundamentos de IA con Python'
        })
      });

      if (!response.ok) throw new Error('Error generando ejercicio');

      const exercise = await response.json();
      setCurrentExercise(exercise);
      setUserCode(exercise.initialCode);
      setCurrentHintIndex(-1);
      setOutput('');
      
      toast.success(`🎯 Nuevo ejercicio ${difficulty} generado!`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error generando ejercicio con IA');
      
      // Fallback: ejercicio manual
      const fallbackExercise: Exercise = {
        id: Date.now().toString(),
        title: 'Variables en Python para IA',
        description: 'Aprende a crear y usar variables básicas en Python para proyectos de IA.',
        difficulty: 'básico',
        initialCode: `# Variables básicas para IA
nombre_modelo = "Red Neuronal"
precision = 0.85
num_capas = 3
entrenado = True

# Tu tarea: Imprime toda la información del modelo
print("Información del Modelo:")
# Completa el código aquí`,
        expectedOutput: `Información del Modelo:
Nombre: Red Neuronal
Precisión: 85.0%
Capas: 3
Entrenado: Sí`,
        hints: [
          'Usa print() para mostrar información',
          'Puedes usar f-strings: f"Texto {variable}"',
          'Convierte la precisión a porcentaje multiplicando por 100'
        ],
        solution: `# Variables básicas para IA
nombre_modelo = "Red Neuronal"
precision = 0.85
num_capas = 3
entrenado = True

# Imprime toda la información del modelo
print("Información del Modelo:")
print(f"Nombre: {nombre_modelo}")
print(f"Precisión: {precision * 100}%")
print(f"Capas: {num_capas}")
print(f"Entrenado: {'Sí' if entrenado else 'No'}")`
      };
      
      setCurrentExercise(fallbackExercise);
      setUserCode(fallbackExercise.initialCode);
    } finally {
      setIsGenerating(false);
    }
  };

  // Función para normalizar texto para comparación
  const normalizeOutput = (text: string): string => {
    return text
      .trim()                           // Quitar espacios al inicio/final
      .replace(/\s+/g, ' ')            // Múltiples espacios → un solo espacio
      .toLowerCase()                    // Todo a minúsculas
      .replace(/[^\w\s.,:%-]/g, '')    // Quitar caracteres especiales excepto básicos
      .replace(/\s*:\s*/g, ':')        // Normalizar espacios alrededor de :
      .replace(/\s*%\s*/g, '%');       // Normalizar espacios alrededor de %
  };

  // Función mejorada para verificar si la respuesta es correcta
  const checkAnswer = (userOutput: string, expectedOutput: string): boolean => {
    const normalizedUser = normalizeOutput(userOutput);
    const normalizedExpected = normalizeOutput(expectedOutput);
    
    // Comparación exacta normalizada
    if (normalizedUser === normalizedExpected) {
      return true;
    }
    
    // Verificaciones adicionales más flexibles
    const userLines = normalizedUser.split('\n').filter(line => line.trim());
    const expectedLines = normalizedExpected.split('\n').filter(line => line.trim());
    
    // Si tienen el mismo número de líneas, verificar contenido línea por línea
    if (userLines.length === expectedLines.length) {
      return userLines.every((userLine, index) => {
        const expectedLine = expectedLines[index];
        return normalizeOutput(userLine) === normalizeOutput(expectedLine);
      });
    }
    
    // Para ejercicios con números, verificar valores numéricos
    const userNumbers = userOutput.match(/\d+\.?\d*/g) || [];
    const expectedNumbers = expectedOutput.match(/\d+\.?\d*/g) || [];
    
    if (userNumbers.length === expectedNumbers.length && userNumbers.length > 0) {
      const numbersMatch = userNumbers.every((userNum, index) => {
        const userVal = parseFloat(userNum);
        const expectedVal = parseFloat(expectedNumbers[index]);
        return Math.abs(userVal - expectedVal) < 0.01; // Tolerancia de 0.01
      });
      
      // Si los números coinciden, verificar que las palabras clave también estén
      if (numbersMatch) {
        const userWords = normalizedUser.replace(/\d+\.?\d*/g, '').replace(/[^\w\s]/g, '');
        const expectedWords = normalizedExpected.replace(/\d+\.?\d*/g, '').replace(/[^\w\s]/g, '');
        return normalizeOutput(userWords).includes(normalizeOutput(expectedWords)) || 
               normalizeOutput(expectedWords).includes(normalizeOutput(userWords));
      }
    }
    
    return false;
  };

  // Ejecutar código Python
  const runCode = async () => {
    if (!pyodideReady) {
      toast.error('Python aún no está listo');
      return;
    }

    setIsRunning(true);
    setOutput('');

    try {
      // @ts-ignore
      const pyodide = window.pyodide;
      
      // Capturar stdout
      pyodide.runPython(`
        import sys
        from io import StringIO
        old_stdout = sys.stdout
        sys.stdout = StringIO()
      `);

      // Ejecutar código del usuario
      pyodide.runPython(userCode);

      // Obtener salida
      const result = pyodide.runPython(`
        output = sys.stdout.getvalue()
        sys.stdout = old_stdout
        output
      `);

      const outputText = result || 'Código ejecutado sin salida';
      setOutput(outputText);

      // Verificar si es correcto usando la función mejorada
      if (currentExercise?.expectedOutput) {
        const isCorrect = checkAnswer(outputText, currentExercise.expectedOutput);
        
        if (isCorrect) {
          toast.success('🎉 ¡Ejercicio completado correctamente!');
          setCompletedExercises(prev => [...prev, currentExercise.id]);
          setShowComparison(false);
        } else {
          // Mostrar mensaje más detallado de lo que se espera
          toast.error('🔍 La salida no coincide exactamente. Revisa la pestaña "Resultado" para comparar.');
          setShowComparison(true);
          console.log('Usuario:', normalizeOutput(outputText));
          console.log('Esperado:', normalizeOutput(currentExercise.expectedOutput));
        }
      }

    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
      toast.error('Error ejecutando código');
    } finally {
      setIsRunning(false);
    }
  };

  // Mostrar pista
  const showHint = () => {
    if (currentExercise && currentHintIndex < currentExercise.hints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
    }
  };

  // Mostrar solución
  const showSolution = () => {
    if (currentExercise) {
      setUserCode(currentExercise.solution);
      toast.success('💡 Solución mostrada');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Laboratorio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FlaskConical className="h-5 w-5 mr-2 text-purple-600" />
            Laboratorio Interactivo de IA con Python
          </CardTitle>
          <CardDescription>
            Ejercicios progresivos generados por IA. Aprende Python para Inteligencia Artificial practicando en tiempo real.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => generateExercise('básico')} 
              disabled={isGenerating}
              className="bg-green-600 hover:bg-green-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generando...' : 'Ejercicio Básico'}
            </Button>
            <Button 
              onClick={() => generateExercise('intermedio')} 
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Ejercicio Intermedio
            </Button>
            <Button 
              onClick={() => generateExercise('avanzado')} 
              disabled={isGenerating}
              className="bg-red-600 hover:bg-red-700"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Ejercicio Avanzado
            </Button>
          </div>

          {/* Estado de Python */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${pyodideReady ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
              <span className="text-sm text-gray-700">
                Python: {pyodideReady ? 'Listo ✓' : 'Cargando...'}
              </span>
              <span className="text-xs text-gray-500 ml-4">
                Ejercicios completados: {completedExercises.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ejercicio Actual */}
      {currentExercise && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                {currentExercise.title}
                {completedExercises.includes(currentExercise.id) && (
                  <CheckCircle className="h-5 w-5 ml-2 text-green-600" />
                )}
              </span>
              <div className="flex items-center space-x-2">
                {completedExercises.includes(currentExercise.id) && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                    ✓ Completado
                  </span>
                )}
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  currentExercise.difficulty === 'básico' ? 'bg-green-100 text-green-800' :
                  currentExercise.difficulty === 'intermedio' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {currentExercise.difficulty}
                </span>
              </div>
            </CardTitle>
            <CardDescription>{currentExercise.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="code" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="code">
                  <Code className="h-4 w-4 mr-2" />
                  Código
                </TabsTrigger>
                <TabsTrigger value="output">
                  <Terminal className="h-4 w-4 mr-2" />
                  Resultado
                </TabsTrigger>
                <TabsTrigger value="help">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Ayuda
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tu código Python:
                  </label>
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-900 text-green-400 resize-none"
                    placeholder="Escribe tu código Python aquí..."
                    style={{ 
                      tabSize: 4,
                      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
                    }}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    onClick={runCode} 
                    disabled={isRunning || !pyodideReady}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isRunning ? 'Ejecutando...' : 'Ejecutar Código'}
                  </Button>
                  <Button 
                    onClick={() => setUserCode(currentExercise.initialCode)} 
                    variant="outline"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reiniciar
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="output" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salida del programa:
                  </label>
                  <div className="w-full h-64 p-4 bg-black text-green-400 rounded-lg font-mono text-sm overflow-auto border">
                    <div className="text-gray-500 text-xs mb-2">$ python script.py</div>
                    <pre className="whitespace-pre-wrap">{output || 'Ejecuta tu código para ver la salida...'}</pre>
                  </div>
                </div>
                
                {currentExercise.expectedOutput && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salida esperada:
                    </label>
                    <div className={`w-full p-4 rounded-lg font-mono text-sm border ${
                      completedExercises.includes(currentExercise.id) 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-gray-50 border-gray-200 text-gray-800'
                    }`}>
                      <pre className="whitespace-pre-wrap">{currentExercise.expectedOutput}</pre>
                    </div>
                  </div>
                )}

                {showComparison && output && currentExercise.expectedOutput && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="font-medium text-yellow-800 mb-2">🔍 Comparación Detallada:</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Tu salida:</span>
                        <span className="ml-2 font-mono bg-white px-2 py-1 rounded">"{normalizeOutput(output)}"</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Esperado:</span>
                        <span className="ml-2 font-mono bg-white px-2 py-1 rounded">"{normalizeOutput(currentExercise.expectedOutput)}"</span>
                      </div>
                      <p className="text-yellow-700 text-xs mt-2">
                        Revisa espacios, mayúsculas/minúsculas, puntuación y formato exacto.
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="help" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      Pistas del ejercicio
                    </h4>
                    {currentHintIndex >= 0 ? (
                      <div className="space-y-3">
                        {currentExercise.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
                          <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start space-x-2">
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">
                                Pista {index + 1}
                              </span>
                            </div>
                            <p className="text-blue-800 text-sm mt-2">{hint}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-gray-600 text-sm">Haz clic en "Mostrar Pista" cuando necesites ayuda.</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-3 mt-4">
                      <Button 
                        onClick={showHint} 
                        disabled={currentHintIndex >= currentExercise.hints.length - 1}
                        variant="outline"
                        className="border-yellow-400 text-yellow-700 hover:bg-yellow-50"
                      >
                        <Lightbulb className="h-4 w-4 mr-2" />
                        Mostrar Pista ({currentHintIndex + 1}/{currentExercise.hints.length})
                      </Button>
                      <Button 
                        onClick={showSolution} 
                        variant="outline"
                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Ver Solución
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Instrucciones Iniciales */}
      {!currentExercise && (
        <Card>
          <CardContent className="text-center py-16">
            <FlaskConical className="mx-auto h-20 w-20 text-purple-400 mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              ¡Bienvenido al Laboratorio de IA!
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Nuestro sistema de IA generará ejercicios personalizados de Python para que aprendas 
              los fundamentos de la Inteligencia Artificial. Todo se ejecuta en tu navegador 
              usando Pyodide, sin necesidad de instalar nada en tu computadora.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="p-6 bg-green-50 rounded-lg">
                <div className="text-green-600 text-3xl mb-3">🟢</div>
                <h4 className="font-semibold text-green-800 mb-2">Ejercicios Básicos</h4>
                <p className="text-green-700 text-sm">Variables, listas, funciones básicas</p>
              </div>
              <div className="p-6 bg-blue-50 rounded-lg">
                <div className="text-blue-600 text-3xl mb-3">🔵</div>
                <h4 className="font-semibold text-blue-800 mb-2">Nivel Intermedio</h4>
                <p className="text-blue-700 text-sm">Algoritmos de ML, métricas</p>
              </div>
              <div className="p-6 bg-red-50 rounded-lg">
                <div className="text-red-600 text-3xl mb-3">🔴</div>
                <h4 className="font-semibold text-red-800 mb-2">Nivel Avanzado</h4>
                <p className="text-red-700 text-sm">Redes neuronales, optimización</p>
              </div>
            </div>
            
            <Button onClick={() => generateExercise('básico')} size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Sparkles className="h-5 w-5 mr-2" />
              Comenzar con Ejercicio Básico
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};