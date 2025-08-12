import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { chapterId, difficulty, completedExercises, topic } = await req.json();

    // Por ahora, ejercicios predefinidos (luego integraremos Google Gemini API)
    const exercises = {
      básico: [
        {
          id: `basic_${Date.now()}`,
          title: "Introducción a Variables en Python",
          description: "Crea variables para almacenar información básica de un estudiante de IA.",
          difficulty: "básico",
          initialCode: `# Crear variables para un estudiante de IA
# Tu código aquí
nombre = ""
edad = 0
curso = ""
puntuacion_ia = 0.0

# Imprimir información del estudiante
print(f"Estudiante: {nombre}")
print(f"Edad: {edad} años")
print(f"Curso: {curso}")
print(f"Puntuación en IA: {puntuacion_ia}")`,
          expectedOutput: `Estudiante: Ana García
Edad: 25 años
Curso: IA Básico
Puntuación en IA: 95.5`,
          hints: [
            "Asigna valores a las variables: nombre, edad, curso, puntuacion_ia",
            "Usa strings para texto y números para valores numéricos",
            "Los strings van entre comillas, los números no"
          ],
          solution: `# Crear variables para un estudiante de IA
nombre = "Ana García"
edad = 25
curso = "IA Básico"
puntuacion_ia = 95.5

# Imprimir información del estudiante
print(f"Estudiante: {nombre}")
print(f"Edad: {edad} años")
print(f"Curso: {curso}")
print(f"Puntuación en IA: {puntuacion_ia}")`
        },
        {
          id: `basic_${Date.now() + 1}`,
          title: "Listas y Datos de Entrenamiento",
          description: "Trabaja con listas para simular un dataset básico de entrenamiento.",
          difficulty: "básico",
          initialCode: `# Dataset básico para clasificación de animales
animales = ["perro", "gato", "pez", "ave"]
caracteristicas = ["peludo", "peludo", "escamas", "plumas"]

# Tu código aquí:
# 1. Agregar "conejo" a la lista de animales
# 2. Agregar "peludo" a características
# 3. Mostrar el tamaño del dataset
# 4. Mostrar el primer animal y su característica

print(f"Tamaño del dataset: {len(animales)}")
print(f"Primer ejemplo: {animales[0]} - {caracteristicas[0]}")`,
          expectedOutput: `Tamaño del dataset: 5
Primer ejemplo: perro - peludo`,
          hints: [
            "Usa .append() para agregar elementos a una lista",
            "len() te da el tamaño de una lista",
            "Los índices de lista empiezan en 0"
          ],
          solution: `# Dataset básico para clasificación de animales
animales = ["perro", "gato", "pez", "ave"]
caracteristicas = ["peludo", "peludo", "escamas", "plumas"]

# 1. Agregar "conejo" a la lista de animales
animales.append("conejo")
# 2. Agregar "peludo" a características  
caracteristicas.append("peludo")
# 3. Mostrar el tamaño del dataset
# 4. Mostrar el primer animal y su característica

print(f"Tamaño del dataset: {len(animales)}")
print(f"Primer ejemplo: {animales[0]} - {caracteristicas[0]}")`
        }
      ],
      intermedio: [
        {
          id: `inter_${Date.now()}`,
          title: "Función de Precisión de Modelo",
          description: "Implementa una función que calcule la precisión de un modelo de clasificación.",
          difficulty: "intermedio",
          initialCode: `# Función para calcular métricas de un modelo de IA
def calcular_precision(predicciones, etiquetas_reales):
    """
    Calcula la precisión de un modelo de clasificación
    Args:
        predicciones: lista de predicciones del modelo
        etiquetas_reales: lista de etiquetas correctas
    Returns:
        float: precisión del modelo (0 a 1)
    """
    # Tu código aquí
    pass

# Datos de prueba
predicciones = ["gato", "perro", "gato", "ave", "perro", "gato"]
etiquetas_reales = ["gato", "perro", "perro", "ave", "perro", "gato"]

precision = calcular_precision(predicciones, etiquetas_reales)
print(f"Precisión del modelo: {precision:.2%}")`,
          expectedOutput: "Precisión del modelo: 83.33%",
          hints: [
            "Compara cada predicción con su etiqueta real correspondiente",
            "Cuenta cuántas predicciones son correctas",
            "Divide las correctas entre el total"
          ],
          solution: `def calcular_precision(predicciones, etiquetas_reales):
    """
    Calcula la precisión de un modelo de clasificación
    """
    correctas = 0
    total = len(predicciones)
    
    for i in range(total):
        if predicciones[i] == etiquetas_reales[i]:
            correctas += 1
    
    return correctas / total

# Datos de prueba
predicciones = ["gato", "perro", "gato", "ave", "perro", "gato"]
etiquetas_reales = ["gato", "perro", "perro", "ave", "perro", "gato"]

precision = calcular_precision(predicciones, etiquetas_reales)
print(f"Precisión del modelo: {precision:.2%}")`
        }
      ],
      avanzado: [
        {
          id: `adv_${Date.now()}`,
          title: "Red Neuronal Simple",
          description: "Implementa una neurona artificial básica con función de activación.",
          difficulty: "avanzado",
          initialCode: `import math

class Neurona:
    def __init__(self, pesos, sesgo):
        self.pesos = pesos
        self.sesgo = sesgo
    
    def funcion_activacion(self, x):
        """Función sigmoid"""
        # Tu código aquí
        pass
    
    def predecir(self, entradas):
        """
        Calcula la salida de la neurona
        Args:
            entradas: lista de valores de entrada
        Returns:
            float: salida de la neurona (0 a 1)
        """
        # Tu código aquí
        pass

# Crear neurona
neurona = Neurona(pesos=[0.5, -0.3, 0.8], sesgo=0.1)

# Datos de entrada
entradas = [1.0, 0.5, -0.2]

# Hacer predicción
salida = neurona.predecir(entradas)
print(f"Salida de la neurona: {salida:.4f}")`,
          expectedOutput: "Salida de la neurona: 0.6225",
          hints: [
            "La función sigmoid es: 1 / (1 + e^(-x))",
            "Calcula la suma ponderada: sum(peso * entrada) + sesgo",
            "Aplica la función de activación al resultado"
          ],
          solution: `import math

class Neurona:
    def __init__(self, pesos, sesgo):
        self.pesos = pesos
        self.sesgo = sesgo
    
    def funcion_activacion(self, x):
        """Función sigmoid"""
        return 1 / (1 + math.exp(-x))
    
    def predecir(self, entradas):
        """
        Calcula la salida de la neurona
        """
        # Suma ponderada
        suma = sum(peso * entrada for peso, entrada in zip(self.pesos, entradas))
        suma += self.sesgo
        
        # Aplicar función de activación
        return self.funcion_activacion(suma)

# Crear neurona
neurona = Neurona(pesos=[0.5, -0.3, 0.8], sesgo=0.1)

# Datos de entrada
entradas = [1.0, 0.5, -0.2]

# Hacer predicción
salida = neurona.predecir(entradas)
print(f"Salida de la neurona: {salida:.4f}")`
        }
      ]
    };

    // Seleccionar ejercicio según dificultad y ejercicios completados
    const availableExercises = exercises[difficulty] || exercises.básico;
    const uncompletedExercises = availableExercises.filter(ex => 
      !completedExercises.includes(ex.id)
    );

    // Si todos están completados, devolver uno aleatorio
    const selectedExercise = uncompletedExercises.length > 0 
      ? uncompletedExercises[Math.floor(Math.random() * uncompletedExercises.length)]
      : availableExercises[Math.floor(Math.random() * availableExercises.length)];

    return NextResponse.json(selectedExercise);

  } catch (error) {
    console.error("[AI_GENERATE_EXERCISE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}