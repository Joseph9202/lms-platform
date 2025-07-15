const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function testConnection() {
  try {
    console.log("🔄 Probando conexión a la base de datos...");
    
    // Verificar conexión
    await database.$connect();
    console.log("✅ Conexión exitosa a la base de datos");
    
    // Contar categorías
    const categoryCount = await database.category.count();
    console.log(`📊 Total de categorías en la base de datos: ${categoryCount}`);
    
    // Listar todas las categorías
    const categories = await database.category.findMany();
    console.log("📝 Categorías disponibles:");
    categories.forEach((category, index) => {
      console.log(`   ${index + 1}. ${category.name} (ID: ${category.id})`);
    });
    
    // Verificar otras tablas
    const courseCount = await database.course.count();
    const chapterCount = await database.chapter.count();
    const purchaseCount = await database.purchase.count();
    
    console.log(`\n📈 Resumen de la base de datos:`);
    console.log(`   - Cursos: ${courseCount}`);
    console.log(`   - Capítulos: ${chapterCount}`);
    console.log(`   - Compras: ${purchaseCount}`);
    console.log(`   - Categorías: ${categoryCount}`);
    
  } catch (error) {
    console.error("❌ Error conectando a la base de datos:", error);
  } finally {
    await database.$disconnect();
    console.log("🔌 Desconectado de la base de datos");
  }
}

testConnection();
