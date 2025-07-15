const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function createIABasicoCourse() {
  try {
    console.log("🚀 Creando curso de IA Básico con Lección 1 completa...\n");

    // Buscar o crear categoría de IA
    let category = await database.category.findFirst({
      where: { name: "Inteligencia Artificial" }
    });

    if (!category) {
      category = await database.category.create({
        data: { name: "Inteligencia Artificial" }
      });
      console.log("✅ Categoría 'Inteligencia Artificial' creada");
    }

    // Crear el curso
    const course = await database.course.create({
      data: {
        userId: "user_2zX61BkxmcroSdpzKbsGpB9rLaE",
        title: "IA Básico - Certificación Profesional",
        description: "Curso completo de 4 semanas que te llevará desde los conceptos fundamentales hasta la implementación práctica de IA. Incluye laboratorios hands-on con Google Cloud, estudios de casos reales, y certificación oficial.",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
        price: 199.99,
        isPublished: true,
        categoryId: category.id,
      }
    });

    console.log(`✅ Curso creado: ${course.title}`);
    console.log(`🆔 ID del curso: ${course.id}`);

    // Crear capítulos de la Lección 1
    const chapters = [
      {
        title: "🎥 Video: Fundamentos de IA",
        description: "Historia, definiciones y conceptos clave de la Inteligencia Artificial (30 min)",
        position: 1,
        isFree: true,
        isPublished: true,
      },
      {
        title: "📖 Estudio de Caso: Tesla",
        description: "Análisis profundo de cómo Tesla usa IA para conducción autónoma (20 min)",
        position: 2,
        isFree: true,
        isPublished: true,
      },
      {
        title: "🧪 Laboratorio: Google Cloud",
        description: "Tu primer modelo de IA usando Google Cloud Vertex AI (45 min)",
        position: 3,
        isFree: false,
        isPublished: true,
      },
      {
        title: "📝 Quiz: Conceptos Fundamentales",
        description: "Evaluación de conceptos básicos de IA (10 min)",
        position: 4,
        isFree: false,
        isPublished: true,
      },
      // Placeholder para futuras lecciones
      {
        title: "🎯 Lección 2: Tipos de Machine Learning",
        description: "Aprendizaje supervisado, no supervisado y por refuerzo (próximamente)",
        position: 5,
        isFree: false,
        isPublished: false,
      },
      {
        title: "🎯 Lección 3: Algoritmos de ML",
        description: "Regresión, clasificación, clustering y redes neuronales (próximamente)",
        position: 6,
        isFree: false,
        isPublished: false,
      },
      {
        title: "🎯 Lección 4: Procesamiento de Datos",
        description: "Limpieza, preparación y feature engineering (próximamente)",
        position: 7,
        isFree: false,
        isPublished: false,
      },
      {
        title: "🎯 Proyecto Final",
        description: "Desarrolla un proyecto completo de IA aplicando todos los conocimientos",
        position: 8,
        isFree: false,
        isPublished: false,
      }
    ];

    for (const chapterData of chapters) {
      const chapter = await database.chapter.create({
        data: {
          ...chapterData,
          courseId: course.id,
        }
      });

      console.log(`  ✅ Capítulo creado: ${chapter.title}`);
    }

    console.log("\n🎉 ¡Curso de IA Básico creado exitosamente!");
    console.log("📊 Estadísticas del curso:");
    console.log(`   • ${chapters.length} capítulos creados`);
    console.log(`   • Precio: $${course.price}`);
    console.log(`   • Lección 1 completa y lista para usar`);
    console.log(`   • Contenido gratuito: Video y Estudio de Caso`);
    console.log(`   • Contenido premium: Laboratorio y Quiz`);
    
    console.log("\n📍 Para acceder a la lección:");
    console.log(`   URL: /courses/${course.id}`);
    console.log(`   Lección 1: /courses/${course.id}/chapters/[chapter-id]`);

    console.log("\n🎬 Para subir videos:");
    console.log("   1. Ve a la página del capítulo");
    console.log("   2. Como owner, verás el componente de subida de video");
    console.log("   3. Arrastra y suelta tu video de prueba");
    console.log("   4. El video se subirá automáticamente a Google Cloud Storage");

    return course;

  } catch (error) {
    console.log("❌ Error creando curso:", error);
  } finally {
    await database.$disconnect();
  }
}

createIABasicoCourse();