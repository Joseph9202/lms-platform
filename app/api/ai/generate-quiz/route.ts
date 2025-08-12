import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { 
      chapterId, 
      videoContent, 
      readingContent, 
      labContent, 
      difficulty = 'básico' 
    } = await req.json();

    // Por ahora, quizzes predefinidos basados en contenido (luego integraremos Google Gemini API)
    const generateQuiz = (difficulty: string, topic: string) => {
      const quizTemplates = {
        básico: [
          {
            id: `quiz_basic_${Date.now()}`,
            title: "Quiz: Fundamentos de Inteligencia Artificial",
            description: "Evalúa tu comprensión de los conceptos básicos de IA cubiertos en el video, lectura y laboratorio.",
            difficulty: "básico",
            totalQuestions: 5,
            timeLimit: 300, // 5 minutos
            questions: [
              {
                id: "q1",
                type: "multiple_choice",
                question: "¿Cuál es la definición más precisa de Inteligencia Artificial?",
                options: [
                  "Robots que pueden caminar y hablar como humanos",
                  "Sistemas capaces de realizar tareas que requieren inteligencia humana",
                  "Computadoras muy rápidas para cálculos matemáticos",
                  "Programas que solo siguen instrucciones predefinidas"
                ],
                correctAnswer: 1,
                explanation: "La IA se define como sistemas capaces de realizar tareas que tradicionalmente requieren inteligencia humana, como aprender, razonar y percibir.",
                points: 20
              },
              {
                id: "q2", 
                type: "multiple_choice",
                question: "¿En qué año se acuñó oficialmente el término 'Inteligencia Artificial'?",
                options: ["1950", "1956", "1960", "1965"],
                correctAnswer: 1,
                explanation: "El término 'Inteligencia Artificial' se acuñó oficialmente en 1956 durante la Conferencia de Dartmouth.",
                points: 20
              },
              {
                id: "q3",
                type: "multiple_choice", 
                question: "¿Cuál de estos es un ejemplo de IA Débil (Narrow AI)?",
                options: [
                  "Un robot que puede hacer cualquier tarea humana",
                  "Un sistema de recomendaciones de Netflix",
                  "Una IA con conciencia propia",
                  "Un sistema que supera a humanos en todas las áreas"
                ],
                correctAnswer: 1,
                explanation: "Los sistemas de recomendaciones como Netflix son ejemplos de IA Débil, diseñados para tareas específicas.",
                points: 20
              },
              {
                id: "q4",
                type: "true_false",
                question: "El Test de Turing fue propuesto por Alan Turing en 1950.",
                correctAnswer: true,
                explanation: "Correcto. Alan Turing propuso el Test de Turing en 1950 como una forma de medir la inteligencia artificial.",
                points: 20
              },
              {
                id: "q5",
                type: "multiple_choice",
                question: "¿Cuál de estas aplicaciones de IA está más relacionada con el procesamiento de lenguaje natural?",
                options: [
                  "Reconocimiento de imágenes médicas",
                  "Vehículos autónomos",
                  "Asistentes virtuales como Siri",
                  "Trading algorítmico"
                ],
                correctAnswer: 2,
                explanation: "Los asistentes virtuales como Siri utilizan procesamiento de lenguaje natural para entender y responder a comandos de voz.",
                points: 20
              }
            ],
            passingScore: 60,
            maxAttempts: 3,
            generated: true,
            topics: ["Definición de IA", "Historia de IA", "Tipos de IA", "Test de Turing", "Aplicaciones de IA"]
          }
        ],
        intermedio: [
          {
            id: `quiz_inter_${Date.now()}`,
            title: "Quiz: Machine Learning y Algoritmos",
            description: "Evalúa tu conocimiento sobre algoritmos de machine learning y sus aplicaciones prácticas.",
            difficulty: "intermedio", 
            totalQuestions: 6,
            timeLimit: 450, // 7.5 minutos
            questions: [
              {
                id: "q1",
                type: "multiple_choice",
                question: "¿Cuál es la principal diferencia entre aprendizaje supervisado y no supervisado?",
                options: [
                  "El supervisado es más rápido que el no supervisado",
                  "El supervisado usa datos etiquetados, el no supervisado no",
                  "El supervisado solo funciona con números, el no supervisado con texto",
                  "No hay diferencia significativa entre ambos"
                ],
                correctAnswer: 1,
                explanation: "El aprendizaje supervisado utiliza datos con etiquetas conocidas (input-output), mientras que el no supervisado encuentra patrones en datos sin etiquetas.",
                points: 17
              },
              {
                id: "q2",
                type: "multiple_choice",
                question: "¿Qué tipo de algoritmo usarías para agrupar clientes similares sin conocer las categorías previamente?",
                options: [
                  "Regresión lineal",
                  "Clustering (K-means)",
                  "Árbol de decisión",
                  "Red neuronal supervisada"
                ],
                correctAnswer: 1,
                explanation: "Clustering (como K-means) es un método de aprendizaje no supervisado ideal para agrupar datos similares sin conocer las categorías previamente.",
                points: 17
              },
              {
                id: "q3",
                type: "true_false",
                question: "Los árboles de decisión son fáciles de interpretar y visualizar.",
                correctAnswer: true,
                explanation: "Correcto. Los árboles de decisión son uno de los algoritmos más interpretables, ya que muestran claramente el proceso de toma de decisiones.",
                points: 16
              },
              {
                id: "q4",
                type: "multiple_choice",
                question: "¿En qué tipo de problemas se utiliza principalmente la regresión lineal?",
                options: [
                  "Clasificar emails como spam o no spam",
                  "Agrupar productos similares",
                  "Predecir precios de casas",
                  "Reconocer imágenes de gatos"
                ],
                correctAnswer: 2,
                explanation: "La regresión lineal se usa para predecir valores numéricos continuos, como precios de casas, basándose en características de entrada.",
                points: 17
              },
              {
                id: "q5",
                type: "multiple_choice",
                question: "¿Qué caracteriza al aprendizaje por refuerzo?",
                options: [
                  "Necesita datos etiquetados para funcionar",
                  "Solo puede usarse con datos numéricos",
                  "Aprende mediante interacción y recompensas",
                  "Es más rápido que otros tipos de aprendizaje"
                ],
                correctAnswer: 2,
                explanation: "El aprendizaje por refuerzo aprende mediante la interacción con un entorno y la recepción de recompensas o penalizaciones por sus acciones.",
                points: 17
              },
              {
                id: "q6",
                type: "true_false",
                question: "AlphaGo utiliza aprendizaje por refuerzo para jugar Go.",
                correctAnswer: true,
                explanation: "Correcto. AlphaGo utiliza aprendizaje por refuerzo, aprendiendo a través de millones de partidas y mejorando sus estrategias basándose en victorias y derrotas.",
                points: 16
              }
            ],
            passingScore: 70,
            maxAttempts: 3,
            generated: true,
            topics: ["Aprendizaje Supervisado", "Aprendizaje No Supervisado", "Clustering", "Regresión", "Aprendizaje por Refuerzo"]
          }
        ],
        avanzado: [
          {
            id: `quiz_adv_${Date.now()}`,
            title: "Quiz: Redes Neuronales y Deep Learning",
            description: "Evalúa tu comprensión avanzada de redes neuronales, deep learning y sus aplicaciones técnicas.",
            difficulty: "avanzado",
            totalQuestions: 8,
            timeLimit: 600, // 10 minutos
            questions: [
              {
                id: "q1",
                type: "multiple_choice",
                question: "¿Cuál es la función principal de la función de activación en una neurona artificial?",
                options: [
                  "Calcular el error del modelo",
                  "Introducir no-linealidad al modelo",
                  "Reducir el tamaño de los datos",
                  "Acelerar el entrenamiento"
                ],
                correctAnswer: 1,
                explanation: "La función de activación introduce no-linealidad, permitiendo que las redes neuronales aprendan patrones complejos que los modelos lineales no pueden capturar.",
                points: 12
              },
              {
                id: "q2",
                type: "multiple_choice",
                question: "¿Qué rango de valores produce la función de activación sigmoid?",
                options: [
                  "[-1, 1]",
                  "[0, 1]",
                  "[0, ∞]",
                  "[-∞, ∞]"
                ],
                correctAnswer: 1,
                explanation: "La función sigmoid produce valores entre 0 y 1, calculada como 1/(1+e^(-x)).",
                points: 12
              },
              {
                id: "q3",
                type: "true_false",
                question: "Las redes neuronales profundas siempre superan a los modelos simples en todos los problemas.",
                correctAnswer: false,
                explanation: "Falso. Las redes profundas pueden sobreajustarse en problemas simples con pocos datos. La complejidad del modelo debe coincidir con la complejidad del problema.",
                points: 13
              },
              {
                id: "q4",
                type: "multiple_choice",
                question: "¿Cuál es el propósito principal del backpropagation en redes neuronales?",
                options: [
                  "Generar nuevos datos de entrenamiento",
                  "Calcular gradientes y actualizar pesos",
                  "Reducir el número de neuronas",
                  "Validar el modelo final"
                ],
                correctAnswer: 1,
                explanation: "Backpropagation calcula los gradientes del error con respecto a los pesos, permitiendo actualizarlos para minimizar la función de pérdida.",
                points: 13
              },
              {
                id: "q5",
                type: "multiple_choice",
                question: "¿Qué problema resuelve principalmente la técnica de dropout en redes neuronales?",
                options: [
                  "Acelerar el entrenamiento",
                  "Reducir el overfitting",
                  "Aumentar la precisión",
                  "Simplificar la arquitectura"
                ],
                correctAnswer: 1,
                explanation: "Dropout ayuda a prevenir el overfitting al desactivar aleatoriamente algunas neuronas durante el entrenamiento, forzando a la red a no depender excesivamente de características específicas.",
                points: 13
              },
              {
                id: "q6",
                type: "true_false",
                question: "CNNs (Convolutional Neural Networks) son especialmente efectivas para procesamiento de imágenes.",
                correctAnswer: true,
                explanation: "Correcto. Las CNNs están diseñadas específicamente para procesar datos con estructura espacial como imágenes, utilizando convoluciones para detectar características locales.",
                points: 12
              },
              {
                id: "q7",
                type: "multiple_choice",
                question: "¿Cuál de estas arquitecturas es más adecuada para procesamiento de secuencias temporales?",
                options: [
                  "Convolutional Neural Networks (CNN)",
                  "Recurrent Neural Networks (RNN)",
                  "Autoencoders",
                  "Perceptrón simple"
                ],
                correctAnswer: 1,
                explanation: "Las RNNs están diseñadas para procesar secuencias temporales, manteniendo memoria de estados anteriores para hacer predicciones contextuales.",
                points: 13
              },
              {
                id: "q8",
                type: "true_false",
                question: "GPT (como ChatGPT) utiliza arquitectura Transformer para procesar lenguaje natural.",
                correctAnswer: true,
                explanation: "Correcto. GPT utiliza la arquitectura Transformer, que ha revolucionado el procesamiento de lenguaje natural mediante mecanismos de atención.",
                points: 12
              }
            ],
            passingScore: 75,
            maxAttempts: 2,
            generated: true,
            topics: ["Redes Neuronales", "Funciones de Activación", "Backpropagation", "Overfitting", "CNNs", "RNNs", "Transformers"]
          }
        ]
      };

      const templates = quizTemplates[difficulty] || quizTemplates.básico;
      return templates[Math.floor(Math.random() * templates.length)];
    };

    // Generar quiz basado en el contenido proporcionado
    const quiz = generateQuiz(difficulty, chapterId);

    // Personalizar preguntas basado en el contenido específico si está disponible
    if (videoContent || readingContent || labContent) {
      quiz.description = `Quiz adaptativo generado por IA basado en el contenido del video "${videoContent?.title || 'video del capítulo'}", la lectura interactiva y los ejercicios de laboratorio.`;
      
      // Aquí se integraría con Google Cloud AI para generar preguntas más específicas
      // basadas en el contenido real del video, lectura y laboratorio
    }

    return NextResponse.json(quiz);

  } catch (error) {
    console.error("[AI_GENERATE_QUIZ]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}