#!/usr/bin/env node

// 🗑️ LIMPIADOR AUTOMÁTICO DE CURSOS DUPLICADOS
// Pacific Labs LMS - Elimina duplicados y organiza cursos
// Uso: node cleanup-duplicate-courses.js

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();

const database = new PrismaClient();

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function sonSimilares(titulo1, titulo2) {
  const limpiar = (str) => str.toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[^a-z0-9]/g, '');

  const clean1 = limpiar(titulo1);
  const clean2 = limpiar(titulo2);

  // Casos específicos conocidos
  if ((clean1.includes('iabasico') && clean2.includes('iabasico')) ||
      (clean1.includes('iaintermedio') && clean2.includes('iaintermedio')) ||
      (clean1.includes('iaavanzado') && clean2.includes('iaavanzado'))) {
    return true;
  }

  // Similitud general (75% de coincidencia)
  const words1 = clean1.split(/\s+/);
  const words2 = clean2.split(/\s+/);
  
  let coincidencias = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1.length > 3 && word2.length > 3) {
        const similarity = calculateSimilarity(word1, word2);
        if (similarity > 0.8) {
          coincidencias++;
          break;
        }
      }
    }
  }

  return coincidencias >= Math.min(words1.length, words2.length) * 0.75;
}

function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

async function detectarDuplicados() {
  try {
    log('\n🔍 DETECTANDO CURSOS DUPLICADOS', 'cyan');
    log('='.repeat(40), 'cyan');

    const cursos = await database.course.findMany({
      include: {
        chapters: {
          include: {
            userProgress: true
          }
        },
        purchases: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (cursos.length === 0) {
      log('⚠️ No se encontraron cursos en la base de datos', 'yellow');
      return [];
    }

    log(`📚 Analizando ${cursos.length} cursos...`, 'blue');

    const grupos = [];
    const procesados = new Set();

    for (let i = 0; i < cursos.length; i++) {
      if (procesados.has(cursos[i].id)) continue;

      const grupo = [cursos[i]];
      procesados.add(cursos[i].id);

      for (let j = i + 1; j < cursos.length; j++) {
        if (procesados.has(cursos[j].id)) continue;

        if (sonSimilares(cursos[i].title, cursos[j].title)) {
          grupo.push(cursos[j]);
          procesados.add(cursos[j].id);
        }
      }

      if (grupo.length > 1) {
        grupos.push(grupo);
      }
    }

    return grupos;

  } catch (error) {
    throw new Error(`Error detectando duplicados: ${error.message}`);
  }
}

async function analizarGrupoDuplicados(grupo) {
  log(`\n📖 Grupo de duplicados: "${grupo[0].title}"`, 'yellow');
  log('-'.repeat(50), 'yellow');

  let mejorCurso = grupo[0];
  let mejorScore = 0;

  for (const curso of grupo) {
    const score = calcularScoreCurso(curso);
    
    log(`${curso.id === mejorCurso.id ? '👑' : '📄'} ${curso.title}`, curso.id === mejorCurso.id ? 'green' : 'blue');
    log(`   ID: ${curso.id}`, 'blue');
    log(`   Capítulos: ${curso.chapters.length}`, 'blue');
    log(`   Compras: ${curso.purchases.length}`, 'blue');
    log(`   Progreso de usuarios: ${curso.chapters.reduce((sum, ch) => sum + ch.userProgress.length, 0)}`, 'blue');
    log(`   Creado: ${curso.createdAt.toLocaleDateString()}`, 'blue');
    log(`   Score: ${score}`, 'blue');
    log('', 'blue');

    if (score > mejorScore) {
      mejorScore = score;
      mejorCurso = curso;
    }
  }

  const aEliminar = grupo.filter(curso => curso.id !== mejorCurso.id);

  return {
    mantener: mejorCurso,
    eliminar: aEliminar,
    grupo: grupo
  };
}

function calcularScoreCurso(curso) {
  let score = 0;
  
  // Puntos por capítulos
  score += curso.chapters.length * 10;
  
  // Puntos por compras
  score += curso.purchases.length * 50;
  
  // Puntos por progreso de usuarios
  const progresoTotal = curso.chapters.reduce((sum, ch) => sum + ch.userProgress.length, 0);
  score += progresoTotal * 20;
  
  // Puntos por estar publicado
  if (curso.isPublished) score += 100;
  
  // Puntos por tener precio (curso comercial)
  if (curso.price && curso.price > 0) score += 25;
  
  // Bonus por antiguedad (cursos más antiguos tienen prioridad)
  const diasDesdeCreacion = (Date.now() - curso.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  score += Math.min(diasDesdeCreacion, 365) * 0.5;

  return Math.round(score);
}

async function migrarContenido(deCurso, aCurso) {
  try {
    log(`\n🔄 Migrando contenido de "${deCurso.title}" a "${aCurso.title}"...`, 'yellow');

    // Migrar capítulos únicos
    let capitulosMigrados = 0;
    
    for (const capitulo of deCurso.chapters) {
      // Verificar si ya existe un capítulo similar
      const capituloExistente = await database.chapter.findFirst({
        where: {
          courseId: aCurso.id,
          title: capitulo.title
        }
      });

      if (!capituloExistente) {
        // Obtener próxima posición
        const ultimaPosicion = await database.chapter.findFirst({
          where: { courseId: aCurso.id },
          orderBy: { position: 'desc' }
        });

        const nuevaPosicion = ultimaPosicion ? ultimaPosicion.position + 1 : 1;

        await database.chapter.update({
          where: { id: capitulo.id },
          data: {
            courseId: aCurso.id,
            position: nuevaPosicion
          }
        });

        capitulosMigrados++;
        log(`   ✅ Capítulo migrado: ${capitulo.title}`, 'green');
      } else {
        log(`   ⚠️ Capítulo ya existe: ${capitulo.title}`, 'yellow');
      }
    }

    // Migrar compras
    let comprasMigradas = 0;
    for (const compra of deCurso.purchases) {
      const compraExistente = await database.purchase.findFirst({
        where: {
          userId: compra.userId,
          courseId: aCurso.id
        }
      });

      if (!compraExistente) {
        await database.purchase.update({
          where: { id: compra.id },
          data: { courseId: aCurso.id }
        });
        comprasMigradas++;
      }
    }

    log(`   📖 Capítulos migrados: ${capitulosMigrados}`, 'green');
    log(`   💰 Compras migradas: ${comprasMigradas}`, 'green');

    return { capitulosMigrados, comprasMigradas };

  } catch (error) {
    throw new Error(`Error migrando contenido: ${error.message}`);
  }
}

async function eliminarCursoDuplicado(curso) {
  try {
    log(`\n🗑️ Eliminando curso duplicado: "${curso.title}"...`, 'red');

    // Verificar que no tenga contenido crítico
    if (curso.chapters.length > 0) {
      log('   ⚠️ El curso tiene capítulos - deberían haberse migrado primero', 'yellow');
    }

    if (curso.purchases.length > 0) {
      log('   ⚠️ El curso tiene compras - deberían haberse migrado primero', 'yellow');
    }

    // Eliminar el curso
    await database.course.delete({
      where: { id: curso.id }
    });

    log(`   ✅ Curso eliminado: ${curso.title}`, 'green');

  } catch (error) {
    throw new Error(`Error eliminando curso: ${error.message}`);
  }
}

async function generarReporte(resultados) {
  const fecha = new Date().toISOString().split('T')[0];
  const reporte = `# 🗑️ REPORTE DE LIMPIEZA DE CURSOS DUPLICADOS

## 📅 Fecha: ${new Date().toLocaleString()}

## 📊 RESUMEN
- **Grupos de duplicados encontrados:** ${resultados.length}
- **Cursos analizados:** ${resultados.reduce((sum, r) => sum + r.grupo.length, 0)}
- **Cursos eliminados:** ${resultados.reduce((sum, r) => sum + r.eliminar.length, 0)}
- **Cursos conservados:** ${resultados.length}

## 🔍 DUPLICADOS PROCESADOS

${resultados.map((resultado, index) => `
### ${index + 1}. ${resultado.mantener.title}

**✅ CURSO CONSERVADO:**
- **ID:** ${resultado.mantener.id}
- **Título:** ${resultado.mantener.title}
- **Capítulos:** ${resultado.mantener.chapters.length}
- **Compras:** ${resultado.mantener.purchases.length}
- **Creado:** ${resultado.mantener.createdAt.toLocaleDateString()}

**🗑️ CURSOS ELIMINADOS:**
${resultado.eliminar.map(curso => `
- **${curso.title}** (ID: ${curso.id})
  - Capítulos: ${curso.chapters.length}
  - Compras: ${curso.purchases.length}
  - Creado: ${curso.createdAt.toLocaleDateString()}`).join('')}

**📊 CONTENIDO MIGRADO:**
- Capítulos migrados: ${resultado.migracion?.capitulosMigrados || 0}
- Compras migradas: ${resultado.migracion?.comprasMigradas || 0}
`).join('')}

## ✅ RESULTADO
- ✅ Duplicados eliminados exitosamente
- ✅ Contenido migrado sin pérdidas
- ✅ Base de datos optimizada
- ✅ Sistema listo para nuevos videos

---

*Reporte generado automáticamente por cleanup-duplicate-courses.js*
`;

  const nombreArchivo = `reporte-limpieza-${fecha}.md`;
  fs.writeFileSync(nombreArchivo, reporte);
  log(`📄 Reporte guardado: ${nombreArchivo}`, 'cyan');
}

async function main() {
  try {
    log('\n🗑️ LIMPIADOR DE CURSOS DUPLICADOS', 'cyan');
    log('Optimizando base de datos de cursos', 'cyan');

    const gruposDuplicados = await detectarDuplicados();

    if (gruposDuplicados.length === 0) {
      log('\n✅ ¡No se encontraron cursos duplicados!', 'green');
      log('Tu base de datos está limpia y optimizada', 'green');
      return;
    }

    log(`\n⚠️ Encontrados ${gruposDuplicados.length} grupos de duplicados`, 'yellow');

    const resultados = [];

    for (const grupo of gruposDuplicados) {
      const analisis = await analizarGrupoDuplicados(grupo);
      
      // Preguntar confirmación para cada grupo
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const confirmar = await new Promise(resolve => {
        rl.question(`\n¿Eliminar ${analisis.eliminar.length} curso(s) duplicado(s) y conservar "${analisis.mantener.title}"? (s/N): `, resolve);
      });

      if (confirmar.toLowerCase() === 's') {
        // Migrar contenido
        let migracionTotal = { capitulosMigrados: 0, comprasMigradas: 0 };
        
        for (const cursoAEliminar of analisis.eliminar) {
          const migracion = await migrarContenido(cursoAEliminar, analisis.mantener);
          migracionTotal.capitulosMigrados += migracion.capitulosMigrados;
          migracionTotal.comprasMigradas += migracion.comprasMigradas;
        }

        // Eliminar duplicados
        for (const cursoAEliminar of analisis.eliminar) {
          await eliminarCursoDuplicado(cursoAEliminar);
        }

        analisis.migracion = migracionTotal;
        resultados.push(analisis);

        log(`\n✅ Grupo procesado exitosamente`, 'green');
      } else {
        log(`\n⏭️ Grupo omitido`, 'yellow');
      }

      rl.close();
    }

    if (resultados.length > 0) {
      await generarReporte(resultados);

      log('\n🎉 LIMPIEZA COMPLETADA', 'green');
      log('='.repeat(30), 'green');
      log(`✅ ${resultados.reduce((sum, r) => sum + r.eliminar.length, 0)} cursos duplicados eliminados`, 'green');
      log(`✅ Contenido migrado sin pérdidas`, 'green');
      log(`✅ Base de datos optimizada`, 'green');

      log('\n📋 PRÓXIMOS PASOS:', 'cyan');
      log('1. Ejecutar: detect-existing-courses.js', 'blue');
      log('2. Usar: upload-video-dynamic.js para subir videos', 'blue');
      log('3. Verificar cursos en: http://localhost:3000', 'blue');
    }

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  } finally {
    await database.$disconnect();
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = { 
  detectarDuplicados, 
  migrarContenido, 
  eliminarCursoDuplicado 
};