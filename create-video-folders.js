const fs = require('fs');
const path = require('path');
const { VIDEO_STRUCTURE } = require('./upload-video');

// Plantillas de archivos para cada sección
const FILE_TEMPLATES = {
  'video-principal': {
    placeholder: 'COLOCA_TU_VIDEO_AQUI.mp4',
    readme: `# 🎥 Video Principal

## Especificaciones:
- **Duración recomendada:** 25-35 minutos
- **Formato:** MP4 (H.264)
- **Resolución:** 1920x1080 (1080p)
- **Bitrate:** 2-4 Mbps
- **Audio:** AAC, 44.1kHz

## Contenido sugerido:
- Introducción clara al tema
- Objetivos de aprendizaje
- Desarrollo conceptual
- Ejemplos prácticos
- Resumen y próximos pasos

## Nombres de archivo sugeridos:
- video-principal.mp4
- fundamentos-[tema].mp4
- introduccion-[tema].mp4`
  },
  'caso-tesla': {
    placeholder: 'CASO_TESLA.mp4',
    readme: `# 📖 Estudio de Caso: Tesla

## Especificaciones:
- **Duración recomendada:** 15-25 minutos
- **Formato:** MP4 (H.264)
- **Enfoque:** Análisis técnico y estratégico

## Contenido sugerido:
- Contexto de la empresa
- Desafío técnico
- Solución implementada
- Resultados obtenidos
- Lecciones aprendidas

## Nombres de archivo sugeridos:
- caso-tesla.mp4
- tesla-autonoma.mp4
- estudio-tesla.mp4`
  },
  'laboratorio': {
    placeholder: 'LABORATORIO.mp4',
    readme: `# 🧪 Laboratorio Práctico

## Especificaciones:
- **Duración recomendada:** 30-60 minutos
- **Formato:** MP4 (H.264)
- **Tipo:** Hands-on tutorial

## Contenido sugerido:
- Setup e instalación
- Paso a paso detallado
- Troubleshooting común
- Verificación de resultados
- Cleanup final

## Nombres de archivo sugeridos:
- laboratorio.mp4
- lab-practico.mp4
- tutorial-[herramienta].mp4`
  },
  'quiz': {
    placeholder: 'QUIZ_EXPLICACION.mp4',
    readme: `# 📝 Quiz y Evaluación

## Especificaciones:
- **Duración recomendada:** 5-15 minutos
- **Formato:** MP4 (H.264)
- **Enfoque:** Explicación de conceptos

## Contenido sugerido:
- Revisión de conceptos clave
- Explicación de preguntas tipo
- Tips para el examen
- Recursos adicionales

## Nombres de archivo sugeridos:
- quiz.mp4
- evaluacion.mp4
- repaso-[tema].mp4`
  }
};

function createVideoFolders(baseDir = './Videos-LMS') {
  try {
    console.log(`📁 Creando estructura de carpetas en: ${path.resolve(baseDir)}`);
    console.log(`===============================================\n`);

    // Crear directorio base si no existe
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }

    let totalFolders = 0;
    let totalFiles = 0;

    // Crear README principal
    const mainReadme = `# 📹 Biblioteca de Videos - LMS Platform

Esta es la estructura organizada para tus videos del LMS Platform.

## 📁 Organización:
\`\`\`
Videos-LMS/
├── [CURSO]/
│   ├── [LECCION]/
│   │   ├── [SECCION]/
│   │   │   ├── COLOCA_TU_VIDEO_AQUI.mp4
│   │   │   └── README.md
│   │   └── ...
│   └── ...
└── README.md
\`\`\`

## 🚀 Cómo usar:
1. Coloca tus videos en las carpetas correspondientes
2. Renombra los archivos según las sugerencias
3. Ejecuta el script de subida: \`upload-videos.bat\`
4. Los videos se organizarán automáticamente

## 📊 Especificaciones técnicas:
- **Formato:** MP4 recomendado (H.264 + AAC)
- **Resolución:** 1920x1080 (Full HD)
- **Tamaño máximo:** 500MB por video
- **Bitrate:** 2-4 Mbps para video, 128kbps para audio

## 📝 Convenciones de nombres:
- Usa guiones en lugar de espacios
- Incluye palabras clave descriptivas
- Evita caracteres especiales
- Ejemplos: \`fundamentos-ia.mp4\`, \`caso-tesla.mp4\`

---
Generado automáticamente por LMS Platform
`;

    fs.writeFileSync(path.join(baseDir, 'README.md'), mainReadme);
    totalFiles++;

    // Iterar sobre la estructura de videos
    for (const [courseKey, courseData] of Object.entries(VIDEO_STRUCTURE)) {
      const coursePath = path.join(baseDir, courseKey.toUpperCase());
      
      if (!fs.existsSync(coursePath)) {
        fs.mkdirSync(coursePath, { recursive: true });
        totalFolders++;
      }

      // README del curso
      const courseReadme = `# ${courseData.courseName}

${courseData.courseName} organizado por lecciones y secciones.

## 📚 Lecciones incluidas:
${Object.entries(courseData.lessons).map(([lessonKey, lessonData]) => 
  `- **${lessonKey}**: ${lessonData.lessonName}`
).join('\n')}

## 📹 Videos esperados:
${Object.entries(courseData.lessons).reduce((acc, [lessonKey, lessonData]) => {
  return acc + Object.entries(lessonData.sections).map(([sectionKey, sectionData]) => 
    `- ${lessonKey}/${sectionKey}: ${sectionData.sectionName}`
  ).join('\n') + '\n';
}, '')}
`;

      fs.writeFileSync(path.join(coursePath, 'README.md'), courseReadme);
      totalFiles++;

      for (const [lessonKey, lessonData] of Object.entries(courseData.lessons)) {
        const lessonPath = path.join(coursePath, lessonKey.toUpperCase());
        
        if (!fs.existsSync(lessonPath)) {
          fs.mkdirSync(lessonPath, { recursive: true });
          totalFolders++;
        }

        // README de la lección
        const lessonReadme = `# ${lessonData.lessonName}

## 🎯 Secciones:
${Object.entries(lessonData.sections).map(([sectionKey, sectionData]) => 
  `### ${sectionKey}
- **Nombre:** ${sectionData.sectionName}
- **Descripción:** ${sectionData.description}
- **Duración estimada:** ${sectionData.duration}
`).join('\n')}
`;

        fs.writeFileSync(path.join(lessonPath, 'README.md'), lessonReadme);
        totalFiles++;

        for (const [sectionKey, sectionData] of Object.entries(lessonData.sections)) {
          const sectionPath = path.join(lessonPath, sectionKey);
          
          if (!fs.existsSync(sectionPath)) {
            fs.mkdirSync(sectionPath, { recursive: true });
            totalFolders++;
          }

          // Crear archivos template si existen
          if (FILE_TEMPLATES[sectionKey]) {
            const template = FILE_TEMPLATES[sectionKey];
            
            // Crear placeholder para video
            const placeholderPath = path.join(sectionPath, template.placeholder);
            if (!fs.existsSync(placeholderPath)) {
              fs.writeFileSync(placeholderPath, ''); // Archivo vacío como placeholder
              totalFiles++;
            }

            // Crear README específico
            const sectionReadme = `# ${sectionData.sectionName}

**Descripción:** ${sectionData.description}
**Duración estimada:** ${sectionData.duration}

${template.readme}

## 🎯 Para esta sección específicamente:
- **Tema:** ${sectionData.sectionName}
- **Descripción:** ${sectionData.description}
- **Duración objetivo:** ${sectionData.duration}

## 📤 Subida automática:
Una vez que tengas tu video, colócalo en esta carpeta y ejecuta:
\`\`\`bash
upload-videos.bat "ruta/al/video.mp4" ${courseKey} ${lessonKey} ${sectionKey}
\`\`\`
`;

            fs.writeFileSync(path.join(sectionPath, 'README.md'), sectionReadme);
            totalFiles++;
          }

          console.log(`✅ Creado: ${courseKey}/${lessonKey}/${sectionKey}`);
        }
      }
    }

    // Crear script de ejemplo para subida
    const uploadScript = `@echo off
REM Script de ejemplo para subir videos organizados

echo Subiendo videos desde la estructura organizada...

REM Ejemplos de comandos de subida:
REM upload-videos.bat "./IA-BASICO/LECCION-1/video-principal/tu-video.mp4" ia-basico leccion-1 video-principal
REM upload-videos.bat "./IA-BASICO/LECCION-1/caso-tesla/tu-video.mp4" ia-basico leccion-1 caso-tesla

echo.
echo Para usar este script:
echo 1. Coloca tus videos en las carpetas correspondientes
echo 2. Edita este archivo con las rutas correctas
echo 3. Ejecuta este script

pause
`;

    fs.writeFileSync(path.join(baseDir, 'upload-examples.bat'), uploadScript);
    totalFiles++;

    console.log(`\n🎉 ¡Estructura creada exitosamente!`);
    console.log(`📊 RESUMEN:`);
    console.log(`   • Carpetas creadas: ${totalFolders}`);
    console.log(`   • Archivos generados: ${totalFiles}`);
    console.log(`   • Ubicación: ${path.resolve(baseDir)}`);
    
    console.log(`\n📝 PRÓXIMOS PASOS:`);
    console.log(`   1. Navega a: ${path.resolve(baseDir)}`);
    console.log(`   2. Coloca tus videos en las carpetas correspondientes`);
    console.log(`   3. Lee los README.md para instrucciones específicas`);
    console.log(`   4. Usa upload-videos.bat para subir automáticamente`);

    console.log(`\n💡 CONSEJOS:`);
    console.log(`   • Reemplaza los archivos COLOCA_TU_VIDEO_AQUI.mp4 con tus videos reales`);
    console.log(`   • Mantén la estructura de carpetas para subida automática`);
    console.log(`   • Lee los README.md para especificaciones técnicas`);

    return {
      baseDir: path.resolve(baseDir),
      foldersCreated: totalFolders,
      filesGenerated: totalFiles
    };

  } catch (error) {
    console.error(`❌ Error creando carpetas: ${error.message}`);
    throw error;
  }
}

function showUsage() {
  console.log(`
📁 CREADOR DE CARPETAS ORGANIZADAS - LMS PLATFORM
===============================================

📋 USO:
node create-video-folders.js [directorio-base]

🎯 OPCIONES:
Sin argumentos: Crea en ./Videos-LMS
Con directorio: Crea en la ruta especificada

📊 EJEMPLOS:
node create-video-folders.js
node create-video-folders.js ./Mi-Biblioteca-Videos
node create-video-folders.js "C:\\Users\\usuario\\Videos\\LMS"

📁 ESTRUCTURA GENERADA:
Videos-LMS/
├── IA-BASICO/
│   ├── LECCION-1/
│   │   ├── video-principal/
│   │   │   ├── COLOCA_TU_VIDEO_AQUI.mp4
│   │   │   └── README.md
│   │   ├── caso-tesla/
│   │   ├── laboratorio/
│   │   └── quiz/
│   └── LECCION-2/
├── IA-INTERMEDIO/
├── README.md
└── upload-examples.bat

🎯 BENEFICIOS:
• Estructura preorganizada para todos tus videos
• README con especificaciones técnicas
• Placeholders para identificar qué videos faltan
• Scripts de ejemplo para subida automática
• Convenciones de nombres consistentes
`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === '--help' || args[0] === '-h') {
    showUsage();
    return;
  }
  
  const baseDir = args[0] || './Videos-LMS';
  
  try {
    const result = await createVideoFolders(baseDir);
    
    console.log(`\n📂 CARPETAS PRINCIPALES CREADAS:`);
    console.log(`   📚 IA-BASICO (2 lecciones, 6 secciones)`);
    console.log(`   📚 IA-INTERMEDIO (1 lección, 1 sección)`);
    
    console.log(`\n🔗 INTEGRACIÓN:`);
    console.log(`   • Compatible con upload-videos.bat`);
    console.log(`   • Autodetección de nombres de archivo`);
    console.log(`   • Subida múltiple con upload-multiple-videos.js`);
    
  } catch (error) {
    console.error(`💥 ERROR: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createVideoFolders, FILE_TEMPLATES };