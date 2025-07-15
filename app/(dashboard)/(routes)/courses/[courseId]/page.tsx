import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Clock, Users, Award, BookOpen, PlayCircle, FlaskConical, CheckCircle2, Star } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { CourseProgress } from "@/components/course-progress";
import { getProgress } from "@/actions/get-progress";

const CourseIdPage = async ({
  params
}: {
  params: { courseId: string }
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc"
        }
      },
      category: true,
    },
  });

  if (!course) {
    return redirect("/");
  }

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: params.courseId,
      }
    }
  });

  const progressCount = await getProgress(userId, course.id);

  // Agrupar capítulos por secciones (cada 4 capítulos = 1 sección)
  const sections = [];
  for (let i = 0; i < course.chapters.length; i += 4) {
    const sectionChapters = course.chapters.slice(i, i + 4);
    if (sectionChapters.length > 0) {
      sections.push({
        title: sectionChapters[0].title.includes('Sección') ? sectionChapters[0].title : `Sección ${Math.floor(i/4) + 1}`,
        chapters: sectionChapters
      });
    }
  }

  const getContentType = (title: string) => {
    if (title.includes('Video') || title.includes('🎥')) return 'video';
    if (title.includes('Lectura') || title.includes('📖')) return 'reading';
    if (title.includes('Lab') || title.includes('🧪')) return 'lab';
    if (title.includes('Quiz') || title.includes('📝')) return 'quiz';
    return 'chapter';
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4 text-red-600" />;
      case 'reading': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'lab': return <FlaskConical className="w-4 h-4 text-green-600" />;
      case 'quiz': return <CheckCircle2 className="w-4 h-4 text-purple-600" />;
      default: return <BookOpen className="w-4 h-4 text-gray-600" />;
    }
  };

  const totalHours = course.title.includes('IA Básico') ? '25-30 horas' : '2-4 horas';
  const totalStudents = '1,247';
  const rating = '4.8';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section */}
        <div className="course-card rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="mb-4">
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                  {course.category?.name || 'Inteligencia Artificial'}
                </span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold ai-text-gradient mb-4 leading-tight">
                {course.title}
              </h1>
              
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {course.description}
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <Clock className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-800">{totalHours}</div>
                  <div className="text-xs text-gray-600">Duración</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <Users className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-800">{totalStudents}</div>
                  <div className="text-xs text-gray-600">Estudiantes</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <Star className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-800">{rating}/5</div>
                  <div className="text-xs text-gray-600">Rating</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
                  <Award className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                  <div className="text-sm font-medium text-gray-800">Certificado</div>
                  <div className="text-xs text-gray-600">Incluido</div>
                </div>
              </div>
            </div>
            
            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <div className="ai-card p-6 sticky top-8">
                <CourseEnrollButton
                  courseId={params.courseId}
                  price={course.price!}
                  purchased={!!purchase}
                />
                
                {purchase && progressCount !== null && (
                  <div className="mt-6">
                    <CourseProgress
                      variant={progressCount === 100 ? "success" : "default"}
                      value={progressCount}
                    />
                  </div>
                )}
                
                <div className="mt-6 space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Acceso de por vida</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Certificado de finalización</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Soporte de instructor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span>Laboratorios Google Cloud</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Course Content */}
        <div className="course-card rounded-2xl p-8">
          <div className="flex items-center gap-x-3 mb-6">
            <IconBadge icon={BookOpen} variant="default" />
            <h2 className="text-2xl font-bold text-gray-800">
              Contenido del Curso
            </h2>
          </div>
          
          {course.title.includes('IA Básico') ? (
            /* Mostrar por secciones para el curso de IA Básico */
            <div className="space-y-6">
              {sections.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border border-gray-200 rounded-xl p-6 bg-white">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {sectionIndex + 1}
                    </span>
                    {section.title}
                  </h3>
                  
                  <div className="grid gap-3">
                    {section.chapters.map((chapter, chapterIndex) => {
                      const contentType = getContentType(chapter.title);
                      const isMainSection = chapterIndex === 0 && chapter.title.includes('Sección');
                      
                      if (isMainSection) return null; // Skip main section header
                      
                      return (
                        <div key={chapter.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            {getContentIcon(contentType)}
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-gray-800">
                                  {chapter.title.replace(/🎥|📖|🧪|📝/g, '').trim()}
                                </span>
                                {chapter.isFree && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                    Gratis
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">{chapter.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1 text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">
                              {contentType === 'video' ? '25-30 min' :
                               contentType === 'reading' ? '15-20 min' :
                               contentType === 'lab' ? '45-60 min' :
                               contentType === 'quiz' ? '15 min' : '10 min'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Mostrar lista simple para otros cursos */
            <div className="space-y-3">
              {course.chapters.map((chapter) => (
                <div key={chapter.id} className="p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-x-3">
                    <div className="flex items-center gap-x-2">
                      <IconBadge size="sm" icon={BookOpen} variant="default" />
                      <span className="font-medium text-gray-800">
                        {chapter.title}
                      </span>
                      {chapter.isFree && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          Gratis
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 ml-10">{chapter.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseIdPage;