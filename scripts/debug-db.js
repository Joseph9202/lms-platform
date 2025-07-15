const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
  try {
    console.log("🔍 Verificando base de datos...\n");

    // Verificar categorías
    const categories = await database.category.findMany();
    console.log("📁 Categorías encontradas:", categories.length);
    categories.forEach(cat => console.log(`  - ${cat.name}`));
    console.log("");

    // Verificar cursos
    const courses = await database.course.findMany({
      include: {
        category: true,
        chapters: true,
      }
    });
    console.log("📚 Cursos encontrados:", courses.length);
    courses.forEach(course => {
      console.log(`  - ${course.title}`);
      console.log(`    💰 Precio: €${course.price}`);
      console.log(`    📖 Publicado: ${course.isPublished ? "Sí" : "No"}`);
      console.log(`    👤 Usuario: ${course.userId}`);
      console.log(`    📝 Capítulos: ${course.chapters.length}`);
      console.log("");
    });

    // Verificar si hay datos en general
    if (categories.length === 0) {
      console.log("⚠️  No hay categorías. Ejecuta: node scripts/seed.js");
    }
    
    if (courses.length === 0) {
      console.log("⚠️  No hay cursos. Ejecuta: node scripts/create-test-course.js");
    }

  } catch (error) {
    console.log("❌ Error verificando base de datos:", error);
  } finally {
    await database.$disconnect();
  }
}

main();