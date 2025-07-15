const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
  try {
    // Buscar una categoría existente
    const category = await database.category.findFirst({
      where: {
        name: "Machine Learning"
      }
    });

    // Crear varios cursos de IA
    const courses = [
      {
        title: "Machine Learning con Python desde Cero",
        description: "Aprende los fundamentos de Machine Learning con Python. Incluye redes neuronales, algoritmos de clasificación y regresión, y proyectos prácticos con scikit-learn y TensorFlow.",
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500",
        price: 49.99,
        chapters: [
          {
            title: "Introducción al Machine Learning",
            description: "Qué es ML, tipos de aprendizaje y aplicaciones reales",
            position: 1,
            isFree: true,
          },
          {
            title: "Configuración del Entorno Python",
            description: "Instalación de Python, Jupyter, pandas, numpy y scikit-learn",
            position: 2,
            isFree: false,
          },
          {
            title: "Algoritmos de Regresión",
            description: "Regresión lineal, polinomial y logística con ejemplos prácticos",
            position: 3,
            isFree: false,
          },
          {
            title: "Algoritmos de Clasificación",
            description: "Decision Trees, Random Forest, SVM y evaluación de modelos",
            position: 4,
            isFree: false,
          }
        ]
      },
      {
        title: "Deep Learning y Redes Neuronales",
        description: "Domina el Deep Learning con TensorFlow y Keras. Construye redes neuronales convolucionales, redes recurrentes y modelos de visión por computadora.",
        imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500",
        price: 69.99,
        chapters: [
          {
            title: "Fundamentos de Deep Learning",
            description: "Neuronas artificiales, perceptrón y redes neuronales básicas",
            position: 1,
            isFree: true,
          },
          {
            title: "TensorFlow y Keras Setup",
            description: "Configuración del entorno y primeros modelos",
            position: 2,
            isFree: false,
          },
          {
            title: "Redes Neuronales Convolucionales (CNN)",
            description: "Procesamiento de imágenes y reconocimiento de patrones",
            position: 3,
            isFree: false,
          }
        ]
      },
      {
        title: "Procesamiento de Lenguaje Natural (NLP)",
        description: "Aprende a procesar y analizar texto con IA. Incluye análisis de sentimientos, chatbots, y modelos de lenguaje como GPT.",
        imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=500",
        price: 59.99,
        chapters: [
          {
            title: "Introducción al NLP",
            description: "Conceptos básicos y aplicaciones del procesamiento de lenguaje",
            position: 1,
            isFree: true,
          },
          {
            title: "Preprocesamiento de Texto",
            description: "Tokenización, stemming, lemmatización y limpieza de datos",
            position: 2,
            isFree: false,
          },
          {
            title: "Análisis de Sentimientos",
            description: "Clasificación de emociones en texto con NLTK y spaCy",
            position: 3,
            isFree: false,
          }
        ]
      },
      {
        title: "Computer Vision y OpenCV",
        description: "Domina la visión por computadora con OpenCV y Python. Detección de objetos, reconocimiento facial y procesamiento de imágenes.",
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500",
        price: 54.99,
        chapters: [
          {
            title: "Fundamentos de Computer Vision",
            description: "Qué es la visión por computadora y sus aplicaciones",
            position: 1,
            isFree: true,
          },
          {
            title: "OpenCV Installation y Setup",
            description: "Configuración del entorno y primeras operaciones con imágenes",
            position: 2,
            isFree: false,
          }
        ]
      }
    ];

    for (const courseData of courses) {
      const course = await database.course.create({
        data: {
          userId: "user_2zX61BkxmcroSdpzKbsGpB9rLaE",
          title: courseData.title,
          description: courseData.description,
          imageUrl: courseData.imageUrl,
          price: courseData.price,
          isPublished: true,
          categoryId: category?.id || null,
        }
      });

      // Crear capítulos para cada curso
      await database.chapter.createMany({
        data: courseData.chapters.map(chapter => ({
          ...chapter,
          courseId: course.id,
          isPublished: true,
        }))
      });

      console.log(`✅ Curso creado: ${course.title}`);
    }

    console.log(`\n🎉 Se crearon ${courses.length} cursos de IA exitosamente!`);
  } catch (error) {
    console.log("❌ Error creando cursos de IA:", error);
  } finally {
    await database.$disconnect();
  }
}

main();