const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

// Función para crear un curso individual
async function createSingleCourse(courseData, categories) {
  try {
    console.log(`📚 Creando curso: ${courseData.title}`);
    
    const course = await database.course.create({
      data: {
        userId: "user_2zX61BkxmcroSdpzKbsGpB9rLaE",
        title: courseData.title,
        description: courseData.description,
        imageUrl: courseData.imageUrl,
        price: courseData.price,
        isPublished: true,
        categoryId: courseData.categoryId,
      }
    });

    // Crear estructura de capítulos
    await createChaptersForCourse(course, courseData);
    
    console.log(`✅ Curso creado exitosamente: ${course.title} - ID: ${course.id}\n`);
    return course;
  } catch (error) {
    console.log(`❌ Error creando curso ${courseData.title}:`, error.message);
    return null;
  }
}

async function main() {
  try {
    console.log("🚀 Iniciando creación individual de cursos de IA...\n");

    // Configurar categorías
    const categories = await setupCategories();

    // Definir los cursos
    const coursesData = [
      {
        id: 1,
        title: "Inteligencia Artificial Intermedio - Certificación Profesional",
        description: "Curso avanzado de 6 semanas que profundiza en algoritmos de machine learning, redes neuronales profundas, y técnicas de optimización. Incluye proyectos prácticos con TensorFlow, PyTorch, y despliegue en la nube. Para estudiantes con conocimientos básicos de IA.",
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500",
        price: 299.99,
        categoryId: categories.ia.id,
        category: "IA Intermedio"
      },
      {
        id: 2,
        title: "Inteligencia Artificial Avanzado - Certificación Profesional",
        description: "Curso especializado de 8 semanas en arquitecturas de deep learning avanzadas, GANs, transformers, y investigación en IA. Incluye desarrollo de papers, implementación de modelos SOTA, y mentoría individual. Para profesionales experimentados.",
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500",
        price: 499.99,
        categoryId: categories.ia.id,
        category: "IA Avanzado"
      },
      {
        id: 3,
        title: "Análisis y Visualización de Datos I - Fundamentos",
        description: "Curso introductorio de 5 semanas sobre análisis estadístico y visualización de datos con Python, Pandas, Matplotlib y Seaborn. Aprende a explorar, limpiar y visualizar datos para tomar decisiones informadas.",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500",
        price: 249.99,
        categoryId: categories.data.id,
        category: "Análisis de Datos I"
      },
      {
        id: 4,
        title: "Análisis y Visualización de Datos II - Avanzado",
        description: "Curso avanzado de 6 semanas que cubre visualización interactiva con Plotly, dashboards con Streamlit, análisis geoespacial, y técnicas avanzadas de storytelling con datos. Incluye proyectos con datos reales de empresas.",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
        price: 349.99,
        categoryId: categories.data.id,
        category: "Análisis de Datos II"
      },
      {
        id: 5,
        title: "Matemáticas Básicas para IA - Fundamentos Esenciales",
        description: "Curso de 4 semanas que cubre los fundamentos matemáticos necesarios para IA: aritmética avanzada, teoría de conjuntos, lógica proposicional, y introducción al álgebra. Perfecto para quienes necesitan reforzar bases matemáticas.",
        imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500",
        price: 199.99,
        categoryId: categories.math.id,
        category: "Matemáticas Básicas"
      },
      {
        id: 6,
        title: "Álgebra Lineal y NLP - Matemáticas para Procesamiento de Lenguaje",
        description: "Curso especializado de 7 semanas que combina álgebra lineal (vectores, matrices, eigenvalores) con aplicaciones en NLP. Incluye implementación de word embeddings, transformaciones lineales, y matemáticas detrás de transformers.",
        imageUrl: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=500",
        price: 379.99,
        categoryId: categories.math.id,
        category: "Álgebra Lineal y NLP"
      },
      {
        id: 7,
        title: "Cálculo Avanzado para IA - Optimización y Derivadas",
        description: "Curso intensivo de 6 semanas sobre cálculo diferencial e integral aplicado a IA. Cubre gradientes, optimización, backpropagation, y cálculo vectorial. Incluye implementación desde cero de algoritmos de optimización.",
        imageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500",
        price: 359.99,
        categoryId: categories.math.id,
        category: "Cálculo Avanzado"
      },
      {
        id: 8,
        title: "Estadística Avanzada y Análisis Multivariado",
        description: "Curso completo de 8 semanas sobre inferencia estadística, pruebas de hipótesis, análisis multivariado, PCA, análisis factorial, y estadística bayesiana. Incluye aplicaciones en machine learning y análisis de datos complejos.",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500",
        price: 429.99,
        categoryId: categories.stats.id,
        category: "Estadística Avanzada"
      }
    ];

    // Mostrar opciones
    console.log("📋 Cursos disponibles para crear:");
    console.log("="=50);
    coursesData.forEach(course => {
      console.log(`${course.id}. ${course.category} - $${course.price}`);
    });
    console.log("9. Crear TODOS los cursos");
    console.log("0. Salir");
    console.log("="=50);

    // Leer argumentos de línea de comandos
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log("💡 Uso: node create-courses-individual.js <número_de_curso>");
      console.log("   Ejemplo: node create-courses-individual.js 1");
      console.log("   Para crear todos: node create-courses-individual.js 9");
      return;
    }

    const choice = parseInt(args[0]);

    if (choice === 0) {
      console.log("👋 Saliendo...");
      return;
    }

    if (choice === 9) {
      console.log("🔄 Creando todos los cursos...\n");
      let successCount = 0;
      
      for (const courseData of coursesData) {
        const result = await createSingleCourse(courseData, categories);
        if (result) successCount++;
      }
      
      console.log(`\n🎉 Proceso completado! ${successCount}/${coursesData.length} cursos creados exitosamente.`);
    } else if (choice >= 1 && choice <= 8) {
      const selectedCourse = coursesData.find(c => c.id === choice);
      if (selectedCourse) {
        await createSingleCourse(selectedCourse, categories);
        console.log("✅ Curso individual creado exitosamente!");
      } else {
        console.log("❌ Número de curso inválido.");
      }
    } else {
      console.log("❌ Opción inválida. Use números del 0-9.");
    }

  } catch (error) {
    console.log("❌ Error en el proceso:", error);
  } finally {
    await database.$disconnect();
  }
}

async function setupCategories() {
  const categories = {};

  categories.ia = await database.category.findFirst({
    where: { name: "Inteligencia Artificial" }
  });
  if (!categories.ia) {
    categories.ia = await database.category.create({
      data: { name: "Inteligencia Artificial" }
    });
  }

  categories.data = await database.category.findFirst({
    where: { name: "Ciencia de Datos" }
  });
  if (!categories.data) {
    categories.data = await database.category.create({
      data: { name: "Ciencia de Datos" }
    });
  }

  categories.math = await database.category.findFirst({
    where: { name: "Matemáticas para IA" }
  });
  if (!categories.math) {
    categories.math = await database.category.create({
      data: { name: "Matemáticas para IA" }
    });
  }

  categories.stats = await database.category.findFirst({
    where: { name: "Estadística y Análisis" }
  });
  if (!categories.stats) {
    categories.stats = await database.category.create({
      data: { name: "Estadística y Análisis" }
    });
  }

  return categories;
}

async function createChaptersForCourse(course, courseData) {
  const chapterStructures = {
    "Inteligencia Artificial Intermedio - Certificación Profesional": [
      "Módulo 1: Machine Learning Avanzado",
      "Módulo 2: Redes Neuronales Profundas", 
      "Módulo 3: Procesamiento de Lenguaje Natural",
      "Módulo 4: Computer Vision Intermedio",
      "Módulo 5: MLOps y Despliegue",
      "Módulo 6: Proyecto Final Integrador"
    ],
    "Inteligencia Artificial Avanzado - Certificación Profesional": [
      "Módulo 1: Investigación en IA y Papers",
      "Módulo 2: Generative AI y GANs",
      "Módulo 3: Transformers y Large Language Models",
      "Módulo 4: Reinforcement Learning Avanzado",
      "Módulo 5: AI Ethics y Explainable AI",
      "Módulo 6: Optimización y Meta-Learning",
      "Módulo 7: AI para Ciencia y Medicina",
      "Módulo 8: Tesis de Investigación"
    ],
    "Análisis y Visualización de Datos I - Fundamentos": [
      "Módulo 1: Fundamentos de Python para Datos",
      "Módulo 2: Exploración y Limpieza de Datos",
      "Módulo 3: Estadística Descriptiva y Probabilidad",
      "Módulo 4: Visualización con Matplotlib y Seaborn",
      "Módulo 5: Proyecto Final de Análisis"
    ],
    "Análisis y Visualización de Datos II - Avanzado": [
      "Módulo 1: Visualización Interactiva con Plotly",
      "Módulo 2: Dashboards con Streamlit y Dash",
      "Módulo 3: Análisis Geoespacial",
      "Módulo 4: Big Data y Spark",
      "Módulo 5: Storytelling y Comunicación de Datos",
      "Módulo 6: Proyecto Empresarial Final"
    ],
    "Matemáticas Básicas para IA - Fundamentos Esenciales": [
      "Módulo 1: Aritmética y Álgebra Básica",
      "Módulo 2: Funciones y Gráficas",
      "Módulo 3: Teoría de Conjuntos y Lógica",
      "Módulo 4: Introducción a la Geometría Analítica"
    ],
    "Álgebra Lineal y NLP - Matemáticas para Procesamiento de Lenguaje": [
      "Módulo 1: Vectores y Espacios Vectoriales",
      "Módulo 2: Matrices y Transformaciones Lineales",
      "Módulo 3: Eigenvalores, Eigenvectores y SVD",
      "Módulo 4: Word Embeddings y Representaciones Vectoriales",
      "Módulo 5: Proyecciones y Similaridad",
      "Módulo 6: Algebra Lineal en Transformers",
      "Módulo 7: Proyecto Final NLP"
    ],
    "Cálculo Avanzado para IA - Optimización y Derivadas": [
      "Módulo 1: Límites y Continuidad",
      "Módulo 2: Derivadas y Reglas de Derivación",
      "Módulo 3: Gradientes y Optimización",
      "Módulo 4: Backpropagation y Chain Rule",
      "Módulo 5: Cálculo Vectorial y Multivariable",
      "Módulo 6: Proyecto de Optimización"
    ],
    "Estadística Avanzada y Análisis Multivariado": [
      "Módulo 1: Inferencia Estadística Avanzada",
      "Módulo 2: Pruebas de Hipótesis y ANOVA",
      "Módulo 3: Análisis de Componentes Principales (PCA)",
      "Módulo 4: Análisis Factorial y Clustering",
      "Módulo 5: Regresión Multivariada Avanzada",
      "Módulo 6: Estadística Bayesiana",
      "Módulo 7: Series de Tiempo y Análisis Temporal",
      "Módulo 8: Proyecto Final Estadístico"
    ]
  };

  const modules = chapterStructures[course.title];
  if (!modules) return;

  let position = 1;
  for (const moduleTitle of modules) {
    await database.chapter.create({
      data: {
        title: moduleTitle,
        description: `Contenido del ${moduleTitle}`,
        position: position++,
        isPublished: true,
        isFree: position <= 2, // Primer módulo gratis
        courseId: course.id,
      }
    });
  }
}

main();