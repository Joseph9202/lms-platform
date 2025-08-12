import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { chapterId, topic, difficulty } = await req.json();

    // Por ahora, contenido predefinido (luego integraremos Google Gemini API)
    const readingTemplates = {
      básico: [
        {
          id: `reading_${Date.now()}`,
          title: "Fundamentos de Inteligencia Artificial",
          difficulty: "básico",
          totalEstimatedMinutes: 15,
          generated: true,
          sections: [
            {
              id: "intro",
              title: "¿Qué es la Inteligencia Artificial?",
              estimatedMinutes: 5,
              content: `La **Inteligencia Artificial (IA)** es una rama de la informática que busca crear sistemas capaces de realizar tareas que tradicionalmente requieren inteligencia humana.

## Definición y Conceptos Clave

La IA se define como la capacidad de las máquinas para:
- **Aprender** de datos y experiencias
- **Razonar** y resolver problemas complejos  
- **Percibir** el entorno a través de sensores
- **Actuar** de manera autónoma e inteligente

## Historia Breve

- **1950**: Alan Turing propone el "Test de Turing"
- **1956**: Conferencia de Dartmouth - nace oficialmente la IA
- **1980s**: Sistemas expertos y lógica simbólica
- **2010s**: Era del Machine Learning y Deep Learning
- **2020s**: IA Generativa y Modelos de Lenguaje Grande

La IA ha evolucionado desde sistemas basados en reglas hasta algoritmos de aprendizaje automático que pueden procesar enormes cantidades de datos.`,
              keyPoints: [
                "IA simula capacidades cognitivas humanas",
                "Incluye aprendizaje, razonamiento y percepción",
                "Ha evolucionado desde sistemas de reglas hasta ML",
                "Aplicaciones en múltiples industrias"
              ],
              relatedConcepts: ["Machine Learning", "Deep Learning", "Sistemas Expertos", "Test de Turing"]
            },
            {
              id: "types",
              title: "Tipos de Inteligencia Artificial",
              estimatedMinutes: 6,
              content: `Existen diferentes formas de clasificar los sistemas de IA según su capacidad y aplicación.

## Por Capacidad

### IA Débil (Narrow AI)
- Diseñada para **tareas específicas**
- La mayoría de IA actual pertenece a esta categoría
- Ejemplos: Reconocimiento de imágenes, chatbots, recomendaciones

### IA General (AGI)
- Capacidad de **razonamiento general** como humanos
- Aún no existe completamente
- Objetivo a largo plazo de la investigación en IA

### IA Fuerte (ASI)
- Superaría capacidades humanas en **todas las áreas**
- Concepto teórico y especulativo
- Plantea importantes consideraciones éticas

## Por Funcionalidad

### IA Reactiva
- Responde a situaciones específicas
- No tiene memoria de experiencias pasadas
- Ejemplo: Deep Blue (ajedrez de IBM)

### IA con Memoria Limitada
- Usa experiencias pasadas para decisiones actuales
- La mayoría de aplicaciones actuales
- Ejemplo: Vehículos autónomos

### IA con Teoría de la Mente
- Comprende emociones y pensamientos de otros
- En desarrollo experimental
- Crucial para interacción social natural`,
              keyPoints: [
                "IA Débil: tareas específicas (actual)",
                "IA General: razonamiento humano (futuro)",
                "IA Reactiva vs. con Memoria",
                "Teoría de la Mente para interacción social"
              ],
              relatedConcepts: ["AGI", "Machine Learning", "Redes Neuronales", "Procesamiento de Lenguaje Natural"]
            },
            {
              id: "applications",
              title: "Aplicaciones Actuales de la IA",
              estimatedMinutes: 4,
              content: `La IA está transformando múltiples industrias con aplicaciones prácticas y tangibles.

## Tecnología y Software
- **Asistentes virtuales**: Siri, Alexa, Google Assistant
- **Recomendaciones**: Netflix, Spotify, Amazon
- **Búsqueda inteligente**: Google, algoritmos de ranking

## Salud y Medicina
- **Diagnóstico médico**: Análisis de imágenes médicas
- **Descubrimiento de medicamentos**: Aceleración de investigación
- **Telemedicina**: Chatbots para consultas iniciales

## Transporte
- **Vehículos autónomos**: Tesla, Waymo
- **Optimización de rutas**: GPS inteligente, logística
- **Mantenimiento predictivo**: Predicción de fallas

## Finanzas
- **Detección de fraude**: Análisis de patrones sospechosos
- **Trading algorítmico**: Decisiones de inversión automatizadas
- **Evaluación de crédito**: Análisis de riesgo mejorado

## Entretenimiento
- **Videojuegos**: NPCs inteligentes, generación procedural
- **Creación de contenido**: IA generativa, arte digital
- **Efectos especiales**: CGI mejorado con IA

La IA está creando nuevas oportunidades profesionales mientras transforma trabajos existentes.`,
              keyPoints: [
                "Asistentes virtuales y recomendaciones",
                "Diagnóstico médico y descubrimiento de fármacos", 
                "Vehículos autónomos y optimización",
                "Detección de fraude y trading algorítmico"
              ],
              relatedConcepts: ["Computer Vision", "NLP", "Reinforcement Learning", "Predictive Analytics"]
            }
          ]
        }
      ],
      intermedio: [
        {
          id: `reading_inter_${Date.now()}`,
          title: "Machine Learning y Algoritmos de IA",
          difficulty: "intermedio",
          totalEstimatedMinutes: 20,
          generated: true,
          sections: [
            {
              id: "ml-basics",
              title: "Fundamentos de Machine Learning",
              estimatedMinutes: 8,
              content: `El **Machine Learning (ML)** es un subcampo de la IA que permite a las máquinas aprender patrones de datos sin programación explícita.

## Tipos de Aprendizaje

### Aprendizaje Supervisado
- Entrena con datos **etiquetados** (input-output conocidos)
- Predice etiquetas para datos nuevos
- Ejemplos: Clasificación de emails (spam/no spam), predicción de precios

### Aprendizaje No Supervisado
- Encuentra patrones en datos **sin etiquetas**
- Descubre estructuras ocultas
- Ejemplos: Clustering de clientes, detección de anomalías

### Aprendizaje por Refuerzo
- Aprende mediante **interacción y recompensas**
- Optimiza decisiones secuenciales
- Ejemplos: Juegos (AlphaGo), robots autónomos

## Algoritmos Fundamentales

### Regresión Lineal
- Predice valores numéricos continuos
- Encuentra la mejor línea que ajusta los datos
- Usado en predicción de ventas, precios inmobiliarios

### Árboles de Decisión
- Estructura jerárquica de decisiones
- Fácil de interpretar y visualizar
- Efectivo para clasificación y regresión`,
              keyPoints: [
                "ML aprende patrones de datos automáticamente",
                "Supervisado: datos etiquetados, No supervisado: sin etiquetas",
                "Refuerzo: aprende por interacción y recompensas",
                "Algoritmos básicos: regresión, árboles de decisión"
              ],
              relatedConcepts: ["Supervised Learning", "Clustering", "Neural Networks", "Feature Engineering"]
            }
          ]
        }
      ]
    };

    // Seleccionar plantilla según dificultad
    const templates = readingTemplates[difficulty] || readingTemplates.básico;
    const selectedTemplate = templates[Math.floor(Math.random() * templates.length)];

    // Personalizar según el topic/chapter
    const customizedContent = {
      ...selectedTemplate,
      title: `${selectedTemplate.title} - ${topic}`,
      sections: selectedTemplate.sections.map(section => ({
        ...section,
        content: section.content.replace(
          /La \*\*Inteligencia Artificial/g, 
          `En el contexto de "${topic}", la **Inteligencia Artificial`
        )
      }))
    };

    return NextResponse.json(customizedContent);

  } catch (error) {
    console.error("[AI_GENERATE_READING]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}