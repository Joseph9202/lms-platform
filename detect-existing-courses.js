#!/usr/bin/env node

// 🔍 DETECTOR AUTOMÁTICO DE CURSOS EXISTENTES
// Pacific Labs LMS - Integración con cursos reales
// Uso: node detect-existing-courses.js

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

function generateCourseKey(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-')        // Espacios a guiones
    .replace(/-+/g, '-')         // Múltiples guiones a uno
    .replace(/^-|-$/g, '')       // Remover guiones al inicio/final
    .substring(0, 30);           // Limitar longitud
}

async function detectExistingCourses() {
  try {
    log('\n🔍 DETECTANDO CURSOS EXISTENTES', 'cyan');
    log('='.repeat(40), 'cyan');

    // Obtener todos los cursos de la base de datos
    const cursos = await database.course.findMany({
      where: {
        isPublished: true
      },
      include: {
        chapters: {
          where: {
            isPublished: true
          },
          orderBy: {
            position: 'asc'
          }
        },
        category: true
      },
      orderBy: {
        title: 'asc'
      }
    });

    if (cursos.length === 0) {
      log('⚠️ No se encontraron cursos publicados en la base de datos', 'yellow');
      return null;
    }

    log(`\n📚 Encontrados ${cursos.length} cursos:`, 'green');

    const cursosConfig = {};
    const cursosParaEliminar = [];

    for (const curso of cursos) {
      const courseKey = generateCourseKey(curso.title);
      
      // Detectar duplicados de IA Básico
      if (curso.title.toLowerCase().includes('ia basico') || 
          curso.title.toLowerCase().includes('ia básico')) {
        
        if (Object.keys(cursosConfig).some(key => key.includes('ia-basico'))) {
          log(`⚠️ Curso duplicado detectado: ${curso.title} (ID: ${curso.id})`, 'yellow');
          cursosParaEliminar.push(curso);
          continue;
        }
      }

      // Organizar capítulos por secciones
      const secciones = {};
      
      curso.chapters.forEach((chapter, index) => {
        // Determinar sección basada en posición (cada 5 capítulos = nueva sección)
        const seccionNum = Math.floor(index / 5) + 1;
        const leccionNum = (index % 5) + 1;
        
        if (!secciones[`seccion-${seccionNum}`]) {
          secciones[`seccion-${seccionNum}`] = {
            name: `Sección ${seccionNum}`,
            lecciones: {}
          };
        }

        secciones[`seccion-${seccionNum}`].lecciones[`leccion-${leccionNum}`] = {
          chapterId: chapter.id,
          title: chapter.title,
          description: chapter.description || '',
          videoUrl: chapter.videoUrl,
          hasVideo: !!chapter.videoUrl,
          position: chapter.position
        };
      });

      cursosConfig[courseKey] = {
        id: curso.id,
        title: curso.title,
        description: curso.description || '',
        categoryId: curso.categoryId,
        categoryName: curso.category?.name || 'Sin categoría',
        totalChapters: curso.chapters.length,
        secciones: secciones,
        createdAt: curso.createdAt,
        updatedAt: curso.updatedAt
      };

      log(`✅ ${curso.title} → ${courseKey} (${curso.chapters.length} capítulos)`, 'blue');
    }

    // Mostrar duplicados a eliminar
    if (cursosParaEliminar.length > 0) {
      log(`\n🗑️ Cursos duplicados para eliminar:`, 'red');
      cursosParaEliminar.forEach(curso => {
        log(`   • ${curso.title} (ID: ${curso.id})`, 'red');
      });
    }

    // Guardar configuración actualizada
    const configPath = 'cursos-existentes-config.json';
    fs.writeFileSync(configPath, JSON.stringify(cursosConfig, null, 2));
    
    log(`\n💾 Configuración guardada en: ${configPath}`, 'green');

    // Crear mapeo de cursos para scripts
    const cursosDisponibles = {};
    Object.entries(cursosConfig).forEach(([key, config]) => {
      cursosDisponibles[key] = config.title;
    });

    const mappingPath = 'cursos-mapping.json';
    fs.writeFileSync(mappingPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      totalCursos: Object.keys(cursosConfig).length,
      cursosDisponibles: cursosDisponibles,
      estructuraCompleta: cursosConfig
    }, null, 2));

    log(`💾 Mapeo guardado en: ${mappingPath}`, 'green');

    return {
      cursosConfig,
      cursosParaEliminar,
      cursosDisponibles
    };

  } catch (error) {
    log(`❌ Error detectando cursos: ${error.message}`, 'red');
    throw error;
  }
}

async function eliminarCursosDuplicados(cursosParaEliminar) {
  if (cursosParaEliminar.length === 0) {
    log('\n✅ No hay cursos duplicados para eliminar', 'green');
    return;
  }

  log(`\n🗑️ ELIMINANDO CURSOS DUPLICADOS`, 'yellow');
  log('='.repeat(40), 'yellow');

  for (const curso of cursosParaEliminar) {
    try {
      // Eliminar capítulos primero (por la relación foreign key)
      const deletedChapters = await database.chapter.deleteMany({
        where: {
          courseId: curso.id
        }
      });

      // Eliminar curso
      await database.course.delete({
        where: {
          id: curso.id
        }
      });

      log(`✅ Eliminado: ${curso.title} (${deletedChapters.count} capítulos)`, 'green');

    } catch (error) {
      log(`❌ Error eliminando ${curso.title}: ${error.message}`, 'red');
    }
  }
}

async function generarReporteCompleto(data) {
  const reporte = `# 📊 REPORTE DE CURSOS EXISTENTES

## 📅 Generado: ${new Date().toLocaleString()}

## 📚 RESUMEN
- **Total de cursos:** ${Object.keys(data.cursosConfig).length}
- **Cursos duplicados:** ${data.cursosParaEliminar.length}
- **Total de capítulos:** ${Object.values(data.cursosConfig).reduce((sum, curso) => sum + curso.totalChapters, 0)}

## 🗂️ CURSOS DETECTADOS

${Object.entries(data.cursosConfig).map(([key, curso]) => `
### 🎓 ${curso.title}
- **ID:** ${curso.id}
- **Clave:** \`${key}\`
- **Categoría:** ${curso.categoryName}
- **Capítulos:** ${curso.totalChapters}
- **Secciones:** ${Object.keys(curso.secciones).length}
- **Videos:** ${Object.values(curso.secciones).reduce((sum, seccion) => 
    sum + Object.values(seccion.lecciones).filter(leccion => leccion.hasVideo).length, 0)}

#### 📋 Estructura:
${Object.entries(curso.secciones).map(([seccionKey, seccion]) => `
**${seccion.name}:**
${Object.entries(seccion.lecciones).map(([leccionKey, leccion]) => `
- ${leccion.title} ${leccion.hasVideo ? '🎬' : '📝'}`).join('')}`).join('')}
`).join('')}

## 🔧 CONFIGURACIÓN PARA SCRIPTS

### Archivo: cursos-mapping.json
\`\`\`json
{
  "cursosDisponibles": {
${Object.entries(data.cursosDisponibles).map(([key, title]) => `    "${key}": "${title}"`).join(',\n')}
  }
}
\`\`\`

## 🎯 ESTRUCTURA EN GOOGLE CLOUD STORAGE

\`\`\`
📦 Bucket/
└── 📁 cursos/
${Object.keys(data.cursosConfig).map(courseKey => `    ├── 📁 ${courseKey}/
    │   ├── 📁 seccion-1/
    │   │   ├── 📁 leccion-1/
    │   │   └── 📁 leccion-2/
    │   └── 📁 seccion-2/`).join('\n')}
\`\`\`

## 💡 PRÓXIMOS PASOS

1. **Usar los cursos detectados:**
   - Los scripts ahora usan automáticamente estos cursos
   - No más cursos hardcodeados

2. **Subir videos:**
   - Usar \`upload-video-dynamic.js\` 
   - Seleccionar de cursos reales

3. **Organización automática:**
   - Videos se organizan según estructura existente
   - Capítulos se crean en posiciones correctas

---

*Generado automáticamente por detect-existing-courses.js*
`;

  fs.writeFileSync('REPORTE-CURSOS-EXISTENTES.md', reporte);
  log(`📄 Reporte completo guardado en: REPORTE-CURSOS-EXISTENTES.md`, 'cyan');
}

async function main() {
  try {
    log('\n🚀 ANALIZADOR DE CURSOS EXISTENTES', 'cyan');
    log('Integrando cursos reales con sistema de videos', 'cyan');

    const data = await detectExistingCourses();
    
    if (!data) {
      log('\n💡 Sugerencia: Crea algunos cursos en tu LMS primero', 'yellow');
      return;
    }

    // Preguntar si eliminar duplicados
    if (data.cursosParaEliminar.length > 0) {
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const respuesta = await new Promise(resolve => {
        rl.question('\n¿Eliminar cursos duplicados? (s/N): ', resolve);
      });

      if (respuesta.toLowerCase() === 's') {
        await eliminarCursosDuplicados(data.cursosParaEliminar);
      }

      rl.close();
    }

    await generarReporteCompleto(data);

    log('\n🎉 PROCESO COMPLETADO', 'green');
    log('='.repeat(30), 'green');
    log('✅ Cursos detectados y mapeados', 'green');
    log('✅ Configuración actualizada', 'green');
    log('✅ Scripts listos para usar cursos reales', 'green');

    log('\n📋 ARCHIVOS GENERADOS:', 'cyan');
    log('• cursos-existentes-config.json - Configuración completa', 'blue');
    log('• cursos-mapping.json - Mapeo para scripts', 'blue');
    log('• REPORTE-CURSOS-EXISTENTES.md - Reporte detallado', 'blue');

    log('\n🚀 PRÓXIMO PASO:', 'cyan');
    log('Ejecuta: upload-video-dynamic.js para subir videos', 'blue');

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
  detectExistingCourses, 
  generateCourseKey,
  eliminarCursosDuplicados 
};