const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function verifyCategories() {
  try {
    console.log("🔍 Verificando categorías en la base de datos...\n");
    
    const categories = await database.category.findMany();
    
    console.log(`📊 Total de categorías: ${categories.length}\n`);
    console.log("📝 Categorías disponibles:");
    categories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category.name}`);
    });
    
  } catch (error) {
    console.error("❌ Error verificando categorías:", error);
  } finally {
    await database.$disconnect();
  }
}

verifyCategories();
