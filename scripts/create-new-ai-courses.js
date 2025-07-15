const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
  try {
    console.log("🚀 Verificando conexión a la base de datos...");
    
    // Verificar conexión
    const coursesCount = await database.course.count();
    console.log(`📚 Cursos existentes: ${coursesCount}`);
    
    console.log("✅ Conexión exitosa. Iniciando creación de nuevos cursos...\n");

    // Buscar o crear categorías necesarias
    const categories = await setupCategories();

    // Definir los nuevos cursos
    const newCourses = [
      {
        title: "Inteligencia Artificial Intermedio - Certificación Profesional",
        description: "Curso avanzado de 6 semanas que profundiza en algoritmos de machine learning, redes neuronales profundas, y técnicas de optimización. Incluye proyectos prácticos con TensorFlow, PyTorch, y despliegue en la nube. Para estudiantes con conocimientos básicos de IA.",
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500",
        price: 299.99,
        categoryId: categories.ia.id,
        weeks: 6,
        level: "Intermedio"
      },
      {
        title: "Inteligencia Artificial Avanzado - Certificación Profesional",
        description: "Curso especializado de 8 semanas en arquitecturas de deep learning avanzadas, GANs, transformers, y investigación en IA. Incluye desarrollo de papers, implementación de modelos SOTA, y mentoría individual. Para profesionales experimentados.",
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500",
        price: 499.99,
        categoryId: categories.ia.id,
        weeks: 8,
        level: "Avanzado"
      },
      {
        title: "Análisis y Visualización de Datos I - Fundamentos",
        description: "Curso introductorio de 5 semanas sobre análisis estadístico y visualización de datos con Python, Pandas, Matplotlib y Seaborn. Aprende a explorar, limpiar y visualizar datos para tomar decisiones informadas.",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500",
        price: 249.99,
        categoryId: categories.data.id,
        weeks: 5,
        level: "Principiante"
      },
      {
        title: "Análisis y Visualización de Datos II - Avanzado",
        description: "Curso avanzado de 6 semanas que cubre visualización interactiva con Plotly, dashboards con Streamlit, análisis geoespacial, y técnicas avanzadas de storytelling con datos. Incluye proyectos con datos reales de empresas.",
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500",
        price: 349.99,
        categoryId: categories.data.id,
        weeks: 6,
        level: "Avanzado"
      },
      {
        title: "Matemáticas Básicas para IA - Fundamentos Esenciales",
        description: "Curso de 4 semanas que cubre los fundamentos matemáticos necesarios para IA: aritmética avanzada, teoría de conjuntos, lógica proposicional, y introducción al álgebra. Perfecto para quienes necesitan reforzar bases matemáticas.",
        imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500",
        price: 199.99,
        categoryId: categories.math.id,
        weeks: 4,
        level: "Principiante"
      },
      {
        title: "Álgebra Lineal y NLP - Matemáticas para Procesamiento de Lenguaje",
        description: "Curso especializado de 7 semanas que combina álgebra lineal (vectores, matrices, eigenvalores) con aplicaciones en NLP. Incluye implementación de word embeddings, transformaciones lineales, y matemáticas detrás de transformers.",
        imageUrl: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=500",
        price: 379.99,
        categoryId: categories.math.id,
        weeks: 7,
        level: "Intermedio"
      },
      {
        title: "Cálculo Avanzado para IA - Optimización y Derivadas",
        description: "Curso intensivo de 6 semanas sobre cálculo diferencial e integral aplicado a IA. Cubre gradientes, optimización, backpropagation, y cálculo vectorial. Incluye implementación desde cero de algoritmos de optimización.",
        imageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500",
        price: 359.99,
        categoryId: categories.math.id,
        weeks: 6,
        level: "Avanzado"
      },
      {
        title: "Estadística Avanzada y Análisis Multivariado",
        description: "Curso completo de 8 semanas sobre inferencia estadística, pruebas de hipótesis, análisis multivariado, PCA, análisis factorial, y estadística bayesiana. Incluye aplicaciones en machine learning y análisis de datos complejos.",
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500",
        price: 429.99,
        categoryId: categories.stats.id,
        weeks: 8,
        level: "Avanzado"
      }
    ];

    // Crear los cursos
    for (const courseData of newCourses) {
      console.log(`📚 Creando curso: ${courseData.title}`);
      
      const course = await database.course.create({
        data: {
          userId: "user_2zX61BkxmcroSdpzKbsGpB9rLaE", // Usar el mismo userId del script original
          title: courseData.title,
          description: courseData.description,
          imageUrl: courseData.imageUrl,
          price: courseData.price,
          isPublished: true,
          categoryId: courseData.categoryId,
        }
      });

      // Crear estructura de capítulos según el nivel y duración
      await createChaptersForCourse(course, courseData);
      
      console.log(`✅ Curso creado: ${course.title} - ID: ${course.id}\n`);
    }

    console.log("🎉 ¡Todos los cursos han sido creados exitosamente!");
    console.log("📊 Resumen de cursos creados:");
    console.log("   • Inteligencia Artificial Intermedio ($299.99)");
    console.log("   • Inteligencia Artificial Avanzado ($499.99)");
    console.log("   • Análisis y Visualización de Datos I ($249.99)");
    console.log("   • Análisis y Visualización de Datos II ($349.99)");
    console.log("   • Matemáticas Básicas para IA ($199.99)");
    console.log("   • Álgebra Lineal y NLP ($379.99)");
    console.log("   • Cálculo Avanzado para IA ($359.99)");
    console.log("   • Estadística Avanzada y Análisis Multivariado ($429.99)");

  } catch (error) {
    console.log("❌ Error creando cursos:", error);
  } finally {
    await database.$disconnect();
  }
}

async function setupCategories() {
  console.log("🗂️  Configurando categorías...");
  
  const categories = {};

  // Categoría de Inteligencia Artificial
  categories.ia = await database.category.findFirst({
    where: { name: "Inteligencia Artificial" }
  });
  if (!categories.ia) {
    categories.ia = await database.category.create({
      data: { name: "Inteligencia Artificial" }
    });
  }

  // Categoría de Ciencia de Datos
  categories.data = await database.category.findFirst({
    where: { name: "Ciencia de Datos" }
  });
  if (!categories.data) {
    categories.data = await database.category.create({
      data: { name: "Ciencia de Datos" }
    });
  }

  // Categoría de Matemáticas
  categories.math = await database.category.findFirst({
    where: { name: "Matemáticas para IA" }
  });
  if (!categories.math) {
    categories.math = await database.category.create({
      data: { name: "Matemáticas para IA" }
    });
  }

  // Categoría de Estadística
  categories.stats = await database.category.findFirst({
    where: { name: "Estadística y Análisis" }
  });
  if (!categories.stats) {
    categories.stats = await database.category.create({
      data: { name: "Estadística y Análisis" }
    });
  }

  console.log("✅ Categorías configuradas correctamente\n");
  return categories;
}

async function createChaptersForCourse(course, courseData) {
  const chapterStructures = {
    "Inteligencia Artificial Intermedio - Certificación Profesional": [
      {
        title: "Módulo 1: Machine Learning Avanzado",
        description: "Algoritmos avanzados de ML, ensemble methods y técnicas de regularización",
        components: ["Teoría Avanzada de ML", "Laboratorio: Random Forest y XGBoost", "Proyecto: Predicción de precios inmobiliarios", "Evaluación práctica"]
      },
      {
        title: "Módulo 2: Redes Neuronales Profundas",
        description: "Arquitecturas de deep learning, CNN, RNN y técnicas de optimización",
        components: ["Deep Learning Architecture", "Laboratorio: CNN con TensorFlow", "Proyecto: Clasificación de imágenes médicas", "Quiz: Arquitecturas de redes"]
      },
      {
        title: "Módulo 3: Procesamiento de Lenguaje Natural",
        description: "NLP avanzado, word embeddings, attention mechanisms y transformers básicos",
        components: ["NLP y Embeddings", "Laboratorio: Sentiment Analysis", "Proyecto: Chatbot inteligente", "Evaluación de NLP"]
      },
      {
        title: "Módulo 4: Computer Vision Intermedio",
        description: "Detección de objetos, segmentación y técnicas de transfer learning",
        components: ["Computer Vision Avanzado", "Laboratorio: Object Detection", "Proyecto: Sistema de reconocimiento facial", "Quiz: CV Techniques"]
      },
      {
        title: "Módulo 5: MLOps y Despliegue",
        description: "Despliegue de modelos, MLOps, monitoring y versionado de modelos",
        components: ["MLOps Fundamentals", "Laboratorio: Despliegue en AWS", "Proyecto: Pipeline de ML completo", "Evaluación final"]
      },
      {
        title: "Módulo 6: Proyecto Final Integrador",
        description: "Desarrollo de un proyecto completo de IA aplicando todos los conocimientos",
        components: ["Planificación del proyecto", "Desarrollo y implementación", "Presentación y defensa", "Certificación profesional"]
      }
    ],
    
    "Inteligencia Artificial Avanzado - Certificación Profesional": [
      {
        title: "Módulo 1: Investigación en IA y Papers",
        description: "Metodología de investigación, lectura crítica de papers y tendencias actuales",
        components: ["Research Methodology", "Paper Analysis Workshop", "Literature Review Project", "Research Proposal"]
      },
      {
        title: "Módulo 2: Generative AI y GANs",
        description: "Redes generativas adversarias, VAEs y modelos generativos avanzados",
        components: ["Generative Models Theory", "GAN Implementation", "Creative AI Project", "Generative Models Evaluation"]
      },
      {
        title: "Módulo 3: Transformers y Large Language Models",
        description: "Arquitectura transformer, BERT, GPT, y fine-tuning de LLMs",
        components: ["Transformer Architecture", "BERT and GPT Deep Dive", "LLM Fine-tuning Lab", "Custom LLM Project"]
      },
      {
        title: "Módulo 4: Reinforcement Learning Avanzado",
        description: "Q-learning, policy gradients, actor-critic y aplicaciones en robótica",
        components: ["Advanced RL Theory", "Policy Gradient Methods", "Multi-Agent RL", "Robotics RL Project"]
      },
      {
        title: "Módulo 5: AI Ethics y Explainable AI",
        description: "IA explicable, fairness, bias detection y IA responsable",
        components: ["XAI Techniques", "Bias Detection Lab", "Ethical AI Framework", "Responsible AI Project"]
      },
      {
        title: "Módulo 6: Optimización y Meta-Learning",
        description: "Técnicas avanzadas de optimización, neural architecture search y meta-learning",
        components: ["Advanced Optimization", "Neural Architecture Search", "Meta-Learning Algorithms", "AutoML Project"]
      },
      {
        title: "Módulo 7: AI para Ciencia y Medicina",
        description: "Aplicaciones de IA en investigación científica, drug discovery y medicina",
        components: ["AI in Scientific Research", "Medical AI Applications", "Drug Discovery with AI", "Scientific AI Project"]
      },
      {
        title: "Módulo 8: Tesis de Investigación",
        description: "Desarrollo de una investigación original con contribución al campo de la IA",
        components: ["Research Proposal", "Experimental Design", "Implementation and Results", "Thesis Defense"]
      }
    ],
    
    "Análisis y Visualización de Datos I - Fundamentos": [
      {
        title: "Módulo 1: Fundamentos de Python para Datos",
        description: "Python básico, NumPy, Pandas y manejo de estructuras de datos",
        components: ["Python Data Basics", "NumPy Fundamentals", "Pandas Workshop", "Data Structures Quiz"]
      },
      {
        title: "Módulo 2: Exploración y Limpieza de Datos",
        description: "EDA, detección de outliers, manejo de datos faltantes y calidad de datos",
        components: ["Exploratory Data Analysis", "Data Cleaning Techniques", "Missing Data Strategies", "Data Quality Project"]
      },
      {
        title: "Módulo 3: Estadística Descriptiva y Probabilidad",
        description: "Medidas de tendencia central, dispersión, distribuciones y probabilidad básica",
        components: ["Descriptive Statistics", "Probability Fundamentals", "Statistical Distributions", "Statistics Lab"]
      },
      {
        title: "Módulo 4: Visualización con Matplotlib y Seaborn",
        description: "Gráficos básicos, personalización, tipos de visualizaciones y mejores prácticas",
        components: ["Matplotlib Basics", "Seaborn Advanced", "Visualization Best Practices", "Visualization Portfolio"]
      },
      {
        title: "Módulo 5: Proyecto Final de Análisis",
        description: "Análisis completo de un dataset real aplicando todas las técnicas aprendidas",
        components: ["Dataset Selection", "Complete Analysis", "Report Writing", "Presentation"]
      }
    ],
    
    "Análisis y Visualización de Datos II - Avanzado": [
      {
        title: "Módulo 1: Visualización Interactiva con Plotly",
        description: "Gráficos interactivos, mapas, animaciones y visualizaciones 3D",
        components: ["Plotly Fundamentals", "Interactive Maps", "Animation Techniques", "3D Visualization Project"]
      },
      {
        title: "Módulo 2: Dashboards con Streamlit y Dash",
        description: "Creación de aplicaciones web interactivas y dashboards profesionales",
        components: ["Streamlit Applications", "Dash Framework", "Dashboard Design", "Interactive Dashboard Project"]
      },
      {
        title: "Módulo 3: Análisis Geoespacial",
        description: "GIS, mapas coropléticos, análisis espacial y visualización geográfica",
        components: ["GIS Fundamentals", "Spatial Analysis", "Geographic Visualization", "Geospatial Project"]
      },
      {
        title: "Módulo 4: Big Data y Spark",
        description: "Análisis de grandes volúmenes de datos con Apache Spark y PySpark",
        components: ["Big Data Concepts", "Spark Fundamentals", "PySpark Workshop", "Big Data Analysis Project"]
      },
      {
        title: "Módulo 5: Storytelling y Comunicación de Datos",
        description: "Narrativa con datos, presentaciones efectivas y comunicación de insights",
        components: ["Data Storytelling", "Presentation Skills", "Business Communication", "Story Portfolio"]
      },
      {
        title: "Módulo 6: Proyecto Empresarial Final",
        description: "Análisis completo de datos empresariales con dashboard y presentación ejecutiva",
        components: ["Business Case Analysis", "Executive Dashboard", "Strategic Recommendations", "Executive Presentation"]
      }
    ],
    
    "Matemáticas Básicas para IA - Fundamentos Esenciales": [
      {
        title: "Módulo 1: Aritmética y Álgebra Básica",
        description: "Operaciones fundamentales, ecuaciones lineales y sistemas de ecuaciones",
        components: ["Arithmetic Review", "Basic Algebra", "Linear Equations", "Problem Solving Workshop"]
      },
      {
        title: "Módulo 2: Funciones y Gráficas",
        description: "Tipos de funciones, graficación y análisis de comportamiento",
        components: ["Function Types", "Graphing Techniques", "Function Analysis", "Graphing Project"]
      },
      {
        title: "Módulo 3: Teoría de Conjuntos y Lógica",
        description: "Operaciones con conjuntos, lógica proposicional y razonamiento matemático",
        components: ["Set Theory", "Propositional Logic", "Mathematical Reasoning", "Logic Exercises"]
      },
      {
        title: "Módulo 4: Introducción a la Geometría Analítica",
        description: "Coordenadas, distancias, vectores básicos y transformaciones",
        components: ["Coordinate Systems", "Distance and Vectors", "Basic Transformations", "Geometry Applications"]
      }
    ],
    
    "Álgebra Lineal y NLP - Matemáticas para Procesamiento de Lenguaje": [
      {
        title: "Módulo 1: Vectores y Espacios Vectoriales",
        description: "Definición de vectores, operaciones, normas y espacios vectoriales",
        components: ["Vector Fundamentals", "Vector Operations", "Vector Spaces", "Vector Applications in NLP"]
      },
      {
        title: "Módulo 2: Matrices y Transformaciones Lineales",
        description: "Operaciones matriciales, determinantes, inversas y transformaciones",
        components: ["Matrix Operations", "Linear Transformations", "Matrix Applications", "Text Matrix Representations"]
      },
      {
        title: "Módulo 3: Eigenvalores, Eigenvectores y SVD",
        description: "Valores y vectores propios, descomposición SVD y aplicaciones en NLP",
        components: ["Eigenvalues and Eigenvectors", "SVD Decomposition", "Dimensionality Reduction", "LSA and Topic Modeling"]
      },
      {
        title: "Módulo 4: Word Embeddings y Representaciones Vectoriales",
        description: "Word2Vec, GloVe, espacios semánticos y operaciones vectoriales en texto",
        components: ["Word Embeddings Theory", "Word2Vec Implementation", "GloVe and FastText", "Semantic Vector Operations"]
      },
      {
        title: "Módulo 5: Proyecciones y Similaridad",
        description: "Proyecciones vectoriales, medidas de similaridad y clustering en espacios vectoriales",
        components: ["Vector Projections", "Similarity Measures", "Clustering Techniques", "Document Similarity Project"]
      },
      {
        title: "Módulo 6: Algebra Lineal en Transformers",
        description: "Matemáticas detrás de attention, self-attention y arquitecturas transformer",
        components: ["Attention Mechanisms", "Self-Attention Math", "Transformer Architecture", "Attention Visualization Project"]
      },
      {
        title: "Módulo 7: Proyecto Final NLP",
        description: "Implementación completa de un sistema NLP usando álgebra lineal",
        components: ["Project Planning", "Mathematical Implementation", "NLP System Development", "Performance Analysis"]
      }
    ],
    
    "Cálculo Avanzado para IA - Optimización y Derivadas": [
      {
        title: "Módulo 1: Límites y Continuidad",
        description: "Fundamentos de cálculo, límites, continuidad y aplicaciones en IA",
        components: ["Limit Theory", "Continuity Concepts", "Mathematical Foundations", "AI Applications"]
      },
      {
        title: "Módulo 2: Derivadas y Reglas de Derivación",
        description: "Cálculo diferencial, reglas de derivación y interpretación geométrica",
        components: ["Derivative Fundamentals", "Differentiation Rules", "Geometric Interpretation", "Derivative Applications"]
      },
      {
        title: "Módulo 3: Gradientes y Optimización",
        description: "Gradientes, derivadas parciales, optimización y descenso del gradiente",
        components: ["Partial Derivatives", "Gradient Computation", "Optimization Theory", "Gradient Descent Implementation"]
      },
      {
        title: "Módulo 4: Backpropagation y Chain Rule",
        description: "Regla de la cadena, backpropagation y matemáticas de redes neuronales",
        components: ["Chain Rule Theory", "Backpropagation Math", "Neural Network Calculus", "Backprop Implementation"]
      },
      {
        title: "Módulo 5: Cálculo Vectorial y Multivariable",
        description: "Funciones multivariables, optimización constrainada y multiplicadores de Lagrange",
        components: ["Multivariable Functions", "Constrained Optimization", "Lagrange Multipliers", "Vector Calculus Applications"]
      },
      {
        title: "Módulo 6: Proyecto de Optimización",
        description: "Implementación desde cero de algoritmos de optimización para machine learning",
        components: ["Optimization Algorithm Design", "Implementation from Scratch", "Performance Comparison", "Optimization Portfolio"]
      }
    ],
    
    "Estadística Avanzada y Análisis Multivariado": [
      {
        title: "Módulo 1: Inferencia Estadística Avanzada",
        description: "Estimación, intervalos de confianza, bootstrapping y métodos no paramétricos",
        components: ["Advanced Estimation", "Confidence Intervals", "Bootstrap Methods", "Non-parametric Statistics"]
      },
      {
        title: "Módulo 2: Pruebas de Hipótesis y ANOVA",
        description: "Diseño experimental, ANOVA, pruebas múltiples y análisis de varianza",
        components: ["Hypothesis Testing", "ANOVA Techniques", "Multiple Testing", "Experimental Design"]
      },
      {
        title: "Módulo 3: Análisis de Componentes Principales (PCA)",
        description: "Reducción de dimensionalidad, PCA, interpretación y aplicaciones en ML",
        components: ["PCA Theory", "Dimensionality Reduction", "Component Interpretation", "PCA in Machine Learning"]
      },
      {
        title: "Módulo 4: Análisis Factorial y Clustering",
        description: "Análisis factorial, métodos de clustering y análisis de conglomerados",
        components: ["Factor Analysis", "Clustering Methods", "Cluster Validation", "Unsupervised Learning Applications"]
      },
      {
        title: "Módulo 5: Regresión Multivariada Avanzada",
        description: "Regresión múltiple, regularización, selección de variables y validación",
        components: ["Multiple Regression", "Regularization Techniques", "Variable Selection", "Model Validation"]
      },
      {
        title: "Módulo 6: Estadística Bayesiana",
        description: "Inferencia bayesiana, MCMC, redes bayesianas y aplicaciones en IA",
        components: ["Bayesian Inference", "MCMC Methods", "Bayesian Networks", "Bayesian Machine Learning"]
      },
      {
        title: "Módulo 7: Series de Tiempo y Análisis Temporal",
        description: "Modelos ARIMA, estacionalidad, forecasting y análisis de series temporales",
        components: ["Time Series Analysis", "ARIMA Models", "Forecasting Techniques", "Temporal Data Mining"]
      },
      {
        title: "Módulo 8: Proyecto Final Estadístico",
        description: "Análisis estadístico completo de un problema real usando técnicas multivariadas",
        components: ["Statistical Research Design", "Advanced Analysis Implementation", "Results Interpretation", "Statistical Report"]
      }
    ]
  };

  const structure = chapterStructures[course.title];
  if (!structure) return;

  let chapterPosition = 1;

  for (const module of structure) {
    // Crear capítulo principal del módulo
    const mainChapter = await database.chapter.create({
      data: {
        title: module.title,
        description: module.description,
        position: chapterPosition++,
        isPublished: true,
        isFree: chapterPosition <= 3, // Primer módulo gratis
        courseId: course.id,
      }
    });

    // Crear subcapítulos para cada componente
    for (const component of module.components) {
      await database.chapter.create({
        data: {
          title: `📖 ${component}`,
          description: `${component} - Parte del ${module.title}`,
          position: chapterPosition++,
          isPublished: true,
          isFree: false,
          courseId: course.id,
        }
      });
    }
  }
}

main();