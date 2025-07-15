const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
  try {
    console.log("Creando cursos...");

    // Crear categorías
    const iaCategory = await database.category.upsert({
      where: { name: "Inteligencia Artificial" },
      update: {},
      create: { name: "Inteligencia Artificial" }
    });

    const dataCategory = await database.category.upsert({
      where: { name: "Ciencia de Datos" },
      update: {},
      create: { name: "Ciencia de Datos" }
    });

    const mathCategory = await database.category.upsert({
      where: { name: "Matemáticas para IA" },
      update: {},
      create: { name: "Matemáticas para IA" }
    });

    const statsCategory = await database.category.upsert({
      where: { name: "Estadística y Análisis" },
      update: {},
      create: { name: "Estadística y Análisis" }
    });

    // Crear cursos
    const courses = [
      {
        title: "Inteligencia Artificial Intermedio",
        description: "Curso avanzado de machine learning, redes neuronales y técnicas de optimización con proyectos prácticos.",
        price: 299.99,
        categoryId: iaCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500"
      },
      {
        title: "Inteligencia Artificial Avanzado", 
        description: "Curso especializado en deep learning avanzado, GANs, transformers e investigación en IA.",
        price: 499.99,
        categoryId: iaCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500"
      },
      {
        title: "Análisis y Visualización de Datos I",
        description: "Fundamentos de análisis de datos con Python, Pandas, Matplotlib y Seaborn.",
        price: 249.99,
        categoryId: dataCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500"
      },
      {
        title: "Análisis y Visualización de Datos II",
        description: "Visualización avanzada con Plotly, dashboards con Streamlit y análisis geoespacial.",
        price: 349.99,
        categoryId: dataCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500"
      },
      {
        title: "Matemáticas Básicas para IA",
        description: "Fundamentos matemáticos para IA: álgebra, funciones, teoría de conjuntos y lógica.",
        price: 199.99,
        categoryId: mathCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500"
      },
      {
        title: "Álgebra Lineal y NLP",
        description: "Álgebra lineal aplicada a procesamiento de lenguaje natural y word embeddings.",
        price: 379.99,
        categoryId: mathCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=500"
      },
      {
        title: "Cálculo Avanzado para IA",
        description: "Cálculo diferencial e integral aplicado a IA: gradientes, optimización y backpropagation.",
        price: 359.99,
        categoryId: mathCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=500"
      },
      {
        title: "Estadística Avanzada y Análisis Multivariado",
        description: "Inferencia estadística, PCA, análisis factorial y estadística bayesiana para ML.",
        price: 429.99,
        categoryId: statsCategory.id,
        imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500"
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
          categoryId: courseData.categoryId,
        }
      });

      // Crear algunos capítulos básicos
      for (let i = 1; i <= 5; i++) {
        await database.chapter.create({
          data: {
            title: `Módulo ${i}`,
            description: `Contenido del módulo ${i} del curso ${courseData.title}`,
            position: i,
            isPublished: true,
            isFree: i === 1,
            courseId: course.id,
          }
        });
      }

      console.log(`✅ ${courseData.title}`);
    }

    console.log("🎉 Todos los cursos creados exitosamente!");

  } catch (error) {
    console.log("Error:", error);
  } finally {
    await database.$disconnect();
  }
}

main();