const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
  try {
    await database.category.createMany({
      data: [
        { name: "Machine Learning" },
        { name: "Deep Learning" },
        { name: "Computer Vision" },
        { name: "Procesamiento de Lenguaje Natural" },
        { name: "Ciencia de Datos" },
        { name: "Inteligencia Artificial" },
        { name: "Redes Neuronales" },
        { name: "Python para IA" },
        { name: "TensorFlow & Keras" },
        { name: "Proyectos IA" },
      ]
    });

    console.log("✅ Categorías de IA creadas exitosamente");
  } catch (error) {
    console.log("❌ Error seeding la base de datos de categorías", error);
  } finally {
    await database.$disconnect();
  }
}

main();