const { PrismaClient } = require("@prisma/client");

const database = new PrismaClient();

async function main() {
  try {
    console.log("🗑️  Script de limpieza de cursos de IA\n");

    // Listar cursos existentes
    const courses = await database.course.findMany({
      include: {
        category: true,
        chapters: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (courses.length === 0) {
      console.log("✅ No hay cursos para eliminar.");
      return;
    }

    console.log("📋 Cursos encontrados:");
    console.log("="=50);
    courses.forEach((course, index) => {
      console.log(`${index + 1}. ${course.title}`);
      console.log(`   📂 Categoría: ${course.category?.name || 'Sin categoría'}`);
      console.log(`   📄 Capítulos: ${course.chapters.length}`);
      console.log(`   🆔 ID: ${course.id}`);
      console.log("");
    });

    // Leer argumentos de línea de comandos
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      console.log("💡 Uso:");
      console.log("   node delete-courses.js <numero_curso>     # Eliminar curso específico");
      console.log("   node delete-courses.js all               # Eliminar TODOS los cursos");
      console.log("   node delete-courses.js new               # Eliminar solo cursos nuevos de IA");
      console.log("\n⚠️  ADVERTENCIA: Esta acción NO se puede deshacer!");
      return;
    }

    const option = args[0].toLowerCase();

    if (option === 'all') {
      console.log("⚠️  ¿Estás seguro de que quieres eliminar TODOS los cursos?");
      console.log("   Esta acción eliminará también todos los capítulos asociados.");
      
      // En un script real, aquí podrías usar readline para confirmación
      // Por ahora, comentamos la eliminación real para seguridad
      console.log("❌ Operación cancelada por seguridad.");
      console.log("   Descomenta las líneas de eliminación en el script para habilitar.");
      
      /*
      await database.chapter.deleteMany({});
      await database.course.deleteMany({});
      console.log("✅ Todos los cursos y capítulos eliminados.");
      */
      
    } else if (option === 'new') {
      // Identificar cursos nuevos de IA por títulos
      const newCoursesTitles = [
        "Inteligencia Artificial Intermedio - Certificación Profesional",
        "Inteligencia Artificial Avanzado - Certificación Profesional",
        "Análisis y Visualización de Datos I - Fundamentos",
        "Análisis y Visualización de Datos II - Avanzado",
        "Matemáticas Básicas para IA - Fundamentos Esenciales",
        "Álgebra Lineal y NLP - Matemáticas para Procesamiento de Lenguaje",
        "Cálculo Avanzado para IA - Optimización y Derivadas",
        "Estadística Avanzada y Análisis Multivariado"
      ];

      const newCourses = courses.filter(course => 
        newCoursesTitles.includes(course.title)
      );

      if (newCourses.length === 0) {
        console.log("✅ No se encontraron cursos nuevos de IA para eliminar.");
        return;
      }

      console.log(`🎯 Se eliminarán ${newCourses.length} cursos nuevos de IA:`);
      newCourses.forEach(course => {
        console.log(`   • ${course.title}`);
      });

      console.log("❌ Operación cancelada por seguridad.");
      console.log("   Descomenta las líneas de eliminación en el script para habilitar.");
      
      /*
      for (const course of newCourses) {
        await database.chapter.deleteMany({
          where: { courseId: course.id }
        });
        await database.course.delete({
          where: { id: course.id }
        });
        console.log(`✅ Eliminado: ${course.title}`);
      }
      */

    } else {
      const courseIndex = parseInt(option) - 1;
      if (courseIndex >= 0 && courseIndex < courses.length) {
        const courseToDelete = courses[courseIndex];
        
        console.log(`🎯 Se eliminará el curso: ${courseToDelete.title}`);
        console.log("❌ Operación cancelada por seguridad.");
        console.log("   Descomenta las líneas de eliminación en el script para habilitar.");
        
        /*
        await database.chapter.deleteMany({
          where: { courseId: courseToDelete.id }
        });
        await database.course.delete({
          where: { id: courseToDelete.id }
        });
        console.log(`✅ Curso eliminado: ${courseToDelete.title}`);
        */
      } else {
        console.log("❌ Número de curso inválido.");
      }
    }

  } catch (error) {
    console.log("❌ Error:", error.message);
  } finally {
    await database.$disconnect();
  }
}

main();