import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Brain, Sparkles, TrendingUp } from "lucide-react";

import { db } from "@/lib/db";
import { CoursesList } from "@/components/courses-list";

const SearchPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  // Versión simplificada para debug
  const courses = await db.course.findMany({
    where: {
      isPublished: true,
    },
    include: {
      category: true,
      chapters: {
        where: {
          isPublished: true,
        },
        select: {
          id: true,
        }
      }
    },
    orderBy: {
      createdAt: "desc",
    }
  });

  // Agregar progress como null para todos los cursos
  const coursesWithProgress = courses.map(course => ({
    ...course,
    progress: null,
  }));

  console.log("📚 Cursos encontrados:", courses.length);
  console.log("🔍 Primer curso:", courses[0]?.title || "Ninguno");

  return (
    <>
      <div className="px-6 pt-6 md:hidden md:mb-0 block">
        {/* SearchInput component could go here */}
      </div>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Hero Section */}
        <div className="ai-nav py-16 mb-8">
          <div className="container mx-auto px-6 text-center">
            <div className="mb-6">
              <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium border border-purple-200">
                🎯 Explora nuestros cursos de IA
              </span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold ai-text-gradient mb-4">
              Catálogo de Cursos IA
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Descubre nuestra colección completa de cursos especializados en Inteligencia Artificial, Machine Learning y tecnologías emergentes.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{courses.length}</div>
                <div className="text-gray-600 font-medium">Cursos Disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">50+</div>
                <div className="text-gray-600 font-medium">Horas de Contenido</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">15+</div>
                <div className="text-gray-600 font-medium">Proyectos Prácticos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="container mx-auto px-6 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Categorías Populares</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: <Brain className="text-3xl text-purple-600" />,
                title: "Machine Learning",
                description: "Algoritmos y modelos predictivos",
                count: "8 cursos"
              },
              {
                icon: <Sparkles className="text-3xl text-blue-600" />,
                title: "Deep Learning",
                description: "Redes neuronales avanzadas",
                count: "5 cursos"
              },
              {
                icon: <TrendingUp className="text-3xl text-green-600" />,
                title: "Computer Vision",
                description: "Procesamiento de imágenes y video",
                count: "6 cursos"
              }
            ].map((category, index) => (
              <div key={index} className="course-card p-6 text-center transform hover:scale-105 transition-all duration-300">
                <div className="flex justify-center mb-4">
                  {category.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Courses Section */}
        <div className="container mx-auto px-6 pb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold ai-text-gradient mb-2">Todos los Cursos</h2>
            <p className="text-gray-600">Cursos encontrados: {courses.length}</p>
          </div>
          <CoursesList items={coursesWithProgress} />
        </div>
      </div>
    </>
  );
}

export default SearchPage;