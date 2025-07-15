const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
  try {
    console.log("🔍 Verificando cursos existentes en la base de datos...\n");
    
    // Obtener todos los cursos
    const courses = await database.course.findMany({
      include: {
        category: true,
        chapters: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`📚 Total de cursos encontrados: ${courses.length}\n`);

    if (courses.length === 0) {
      console.log("⚠️  No se encontraron cursos en la base de datos.");
      console.log("✅ Puede proceder a ejecutar el script de creación de cursos.");
    } else {
      console.log("📋 Lista de cursos existentes:");
      console.log("="=50);
      
      courses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.title}`);
        console.log(`   📂 Categoría: ${course.category?.name || 'Sin categoría'}`);
        console.log(`   💰 Precio: $${course.price || 'Gratis'}`);
        console.log(`   📄 Capítulos: ${course.chapters.length}`);
        console.log(`   🔄 Estado: ${course.isPublished ? 'Publicado' : 'Borrador'}`);
        console.log(`   🆔 ID: ${course.id}`);
        console.log("");
      });
    }

    // Verificar categorías
    const categories = await database.category.findMany({
      include: {
        courses: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    console.log("📁 Categorías existentes:");
    console.log("="=30);
    
    if (categories.length === 0) {
      console.log("⚠️  No se encontraron categorías.");
    } else {
      categories.forEach((category) => {
        console.log(`• ${category.name} (${category.courses.length} cursos)`);
      });
    }

    console.log("\n✅ Verificación completada.");

  } catch (error) {
    console.log("❌ Error verificando la base de datos:", error);
  } finally {
    await database.$disconnect();
  }
}

main();