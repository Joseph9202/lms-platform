const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
  try {
    // Buscar categoría de Inteligencia Artificial
    let category = await database.category.findFirst({
      where: {
        name: "Inteligencia Artificial"
      }
    });

    if (!category) {
      category = await database.category.create({
        data: {
          name: "Inteligencia Artificial"
        }
      });
    }

    // Crear el curso de IA Básico
    const course = await database.course.create({
      data: {
        userId: "user_2zX61BkxmcroSdpzKbsGpB9rLaE",
        title: "Inteligencia Artificial Básico - Certificación Profesional",
        description: "Curso completo de 4 semanas (8 secciones) que te llevará desde los conceptos fundamentales hasta la implementación práctica de IA. Incluye laboratorios hands-on con Google Cloud Vertex AI, estudios de casos reales, y certificación oficial. Perfecto para principiantes que quieren entrar al mundo de la IA con una base sólida.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
        price: 199.99,
        isPublished: true,
        categoryId: category.id,
      }
    });

    console.log(`✅ Curso creado: ${course.title}`);
    console.log(`🆔 ID del curso: ${course.id}`);

    // Estructura del curso: 8 secciones (2 por semana durante 4 semanas)
    const sections = [
      // SEMANA 1
      {
        week: 1,
        title: "Sección 1: Fundamentos de la Inteligencia Artificial",
        description: "Introducción a los conceptos básicos de IA, historia, tipos de IA y aplicaciones en el mundo real",
        components: {
          video: "Fundamentos de IA: Historia, Definiciones y Conceptos Clave",
          reading: "Estudio de Caso: Cómo Tesla utiliza IA para conducción autónoma",
          lab: "Laboratorio Google Cloud: Configuración inicial de Vertex AI y primer modelo",
          quiz: "Quiz Teórico-Práctico: Conceptos fundamentales y identificación de casos de uso"
        }
      },
      {
        week: 1,
        title: "Sección 2: Tipos de Aprendizaje Automático",
        description: "Aprendizaje supervisado, no supervisado y por refuerzo. Diferencias y aplicaciones prácticas",
        components: {
          video: "Machine Learning: Supervisado vs No Supervisado vs Refuerzo",
          reading: "Estudio de Caso: Netflix y su sistema de recomendaciones con ML",
          lab: "Laboratorio Google Cloud: Implementando clasificación supervisada en Vertex AI",
          quiz: "Quiz Práctico: Identificación de tipos de ML y selección de algoritmos"
        }
      },
      
      // SEMANA 2
      {
        week: 2,
        title: "Sección 3: Algoritmos de Machine Learning",
        description: "Regresión lineal, árboles de decisión, clustering y redes neuronales básicas",
        components: {
          video: "Algoritmos Esenciales: De la Regresión a las Redes Neuronales",
          reading: "Estudio de Caso: Amazon y su optimización de precios con algoritmos ML",
          lab: "Laboratorio Google Cloud: Entrenando modelos de regresión y clasificación",
          quiz: "Quiz Algorítmico: Selección y aplicación de algoritmos según el problema"
        }
      },
      {
        week: 2,
        title: "Sección 4: Procesamiento de Datos para IA",
        description: "Limpieza, preparación y transformación de datos. Feature engineering y normalización",
        components: {
          video: "Data Science para IA: Preparación y Feature Engineering",
          reading: "Estudio de Caso: Spotify y el procesamiento de datos musicales para IA",
          lab: "Laboratorio Google Cloud: Pipeline de datos con BigQuery y Vertex AI",
          quiz: "Quiz de Datos: Técnicas de preprocesamiento y calidad de datos"
        }
      },
      
      // SEMANA 3
      {
        week: 3,
        title: "Sección 5: Redes Neuronales y Deep Learning",
        description: "Introducción a las redes neuronales, backpropagation y arquitecturas básicas",
        components: {
          video: "Deep Learning Explicado: Neuronas, Capas y Entrenamiento",
          reading: "Estudio de Caso: Google Translate y las redes neuronales para traducción",
          lab: "Laboratorio Google Cloud: Construyendo tu primera red neuronal en Vertex AI",
          quiz: "Quiz de Redes Neuronales: Arquitecturas y parámetros de entrenamiento"
        }
      },
      {
        week: 3,
        title: "Sección 6: IA en Visión por Computadora",
        description: "Reconocimiento de imágenes, CNN y aplicaciones de computer vision",
        components: {
          video: "Computer Vision: De Píxeles a Reconocimiento Inteligente",
          reading: "Estudio de Caso: Diagnóstico médico con IA en hospitales de Stanford",
          lab: "Laboratorio Google Cloud: Clasificación de imágenes con Vision AI",
          quiz: "Quiz de Computer Vision: CNN, filtros y aplicaciones médicas"
        }
      },
      
      // SEMANA 4
      {
        week: 4,
        title: "Sección 7: Procesamiento de Lenguaje Natural (NLP)",
        description: "Análisis de texto, sentiment analysis y modelos de lenguaje como GPT",
        components: {
          video: "NLP y LLMs: Cómo las Máquinas Entienden el Lenguaje Humano",
          reading: "Estudio de Caso: ChatGPT y la revolución de los Large Language Models",
          lab: "Laboratorio Google Cloud: Análisis de sentimientos con Natural Language AI",
          quiz: "Quiz de NLP: Tokenización, embeddings y aplicaciones de chatbots"
        }
      },
      {
        week: 4,
        title: "Sección 8: Ética en IA y Futuro de la Tecnología",
        description: "Consideraciones éticas, bias en IA, regulaciones y tendencias futuras",
        components: {
          video: "IA Responsable: Ética, Bias y el Futuro de la Humanidad",
          reading: "Estudio de Caso: Casos de bias en IA y cómo las empresas los están solucionando",
          lab: "Laboratorio Google Cloud: Evaluando bias en modelos y técnicas de mitigación",
          quiz: "Quiz Final: Ética, responsabilidad y planificación de proyectos IA"
        }
      }
    ];

    // Crear los capítulos con subcapítulos para cada componente
    let chapterPosition = 1;

    for (const section of sections) {
      console.log(`\n📚 Creando ${section.title}...`);
      
      // Crear capítulo principal de la sección
      const mainChapter = await database.chapter.create({
        data: {
          title: section.title,
          description: section.description,
          position: chapterPosition++,
          isPublished: true,
          isFree: section.week === 1 && chapterPosition <= 3, // Primeras 2 secciones gratis
          courseId: course.id,
        }
      });

      // Crear subcapítulos para cada componente
      const subChapters = [
        {
          title: `🎥 Video: ${section.components.video}`,
          description: `Video explicativo de la ${section.title.split(':')[1]}. Duración aproximada: 25-30 minutos.`,
          isFree: section.week === 1 && chapterPosition <= 4,
        },
        {
          title: `📖 Lectura: ${section.components.reading}`,
          description: `Análisis detallado de caso real de la industria. Tiempo de lectura: 15-20 minutos.`,
          isFree: false,
        },
        {
          title: `🧪 Lab: ${section.components.lab}`,
          description: `Laboratorio práctico usando Google Cloud Vertex AI. Duración: 45-60 minutos.`,
          isFree: false,
        },
        {
          title: `📝 Quiz: ${section.components.quiz}`,
          description: `Evaluación teórico-práctica con 10 preguntas de opción múltiple. Tiempo: 15 minutos.`,
          isFree: false,
        }
      ];

      for (const subChapter of subChapters) {
        await database.chapter.create({
          data: {
            title: subChapter.title,
            description: subChapter.description,
            position: chapterPosition++,
            isPublished: true,
            isFree: subChapter.isFree,
            courseId: course.id,
          }
        });
      }

      console.log(`  ✅ ${section.title} - 4 componentes creados`);
    }

    console.log(`\n🎉 ¡Curso de IA Básico creado exitosamente!`);
    console.log(`📊 Estadísticas del curso:`);
    console.log(`   • 8 secciones principales`);
    console.log(`   • 32 capítulos en total (4 por sección)`);
    console.log(`   • 8 videos explicativos`);
    console.log(`   • 8 estudios de casos reales`);
    console.log(`   • 8 laboratorios de Google Cloud`);
    console.log(`   • 8 quizzes evaluativos`);
    console.log(`   • Duración total estimada: 25-30 horas`);
    console.log(`   • Precio: $${course.price}`);
    console.log(`   • Contenido gratis: Primeras 2 secciones`);

  } catch (error) {
    console.log("❌ Error creando curso de IA Básico:", error);
  } finally {
    await database.$disconnect();
  }
}

main();