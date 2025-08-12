import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Clock, Users, Award, BookOpen, PlayCircle, FlaskConical, CheckCircle2, Star, TrendingUp, Target, Zap, Shield } from "lucide-react";
import { Suspense } from "react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { CourseProgress } from "@/components/course-progress";
import { getProgress } from "@/actions/get-progress";
import { PurchaseSuccess } from "./_components/purchase-success";
import { CourseEnrollmentCard } from "./_components/course-enrollment-card";

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

  // Check if this is the IA Básico course (free for all users)
  const isIABasicoFree = course.title.toLowerCase().includes('ia básico') || 
                         course.title.toLowerCase().includes('inteligencia artificial básico');

  const progressCount = await getProgress(userId, course.id);

  const totalHours = course.title.includes('IA Básico') ? '25-30 horas' : '2-4 horas';
  const totalStudents = '1,247';
  const rating = '4.8';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Suspense fallback={null}>
        <PurchaseSuccess courseTitle={course.title} courseId={course.id} />
      </Suspense>
      
      {/* Hero Section with improved design */}
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-40">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative px-6 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="flex-1 space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm font-medium border border-blue-400/30">
                    {course.category?.name || 'Inteligencia Artificial'}
                  </span>
                  {isIABasicoFree && (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      GRATIS
                    </span>
                  )}
                </div>
                
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                    {course.title}
                  </h1>
                  <p className="text-blue-100 text-xl max-w-4xl leading-relaxed">
                    {course.description}
                  </p>
                </div>
                
                {/* Enhanced Progress Bar */}
                {progressCount !== null && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md border border-white/20">
                    <div className="flex items-center justify-between text-sm text-blue-100 mb-3">
                      <span className="font-medium">Tu progreso</span>
                      <span className="font-bold text-white">{progressCount}% completado</span>
                    </div>
                    <div className="relative">
                      <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-500 h-full rounded-full transition-all duration-300 shadow-sm"
                          style={{ width: `${progressCount}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Enhanced Stats */}
              <div className="grid grid-cols-3 gap-6 lg:gap-8">
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <Clock className="w-6 h-6 mx-auto mb-2 text-blue-300" />
                  <div className="font-bold text-xl text-white">{totalHours}</div>
                  <div className="text-blue-200 text-sm">Duración</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <Users className="w-6 h-6 mx-auto mb-2 text-blue-300" />
                  <div className="font-bold text-xl text-white">{totalStudents}</div>
                  <div className="text-blue-200 text-sm">Estudiantes</div>
                </div>
                <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400" />
                  <div className="font-bold text-xl text-white">{rating}/5</div>
                  <div className="text-blue-200 text-sm">Calificación</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with improved layout */}
      <div className="flex-1 -mt-16 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col xl:flex-row gap-8">
            {/* Enhanced Sidebar - Course Modules */}
            <div className="xl:w-96 xl:flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden xl:sticky xl:top-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                  <h3 className="text-xl font-bold flex items-center">
                    <BookOpen className="w-6 h-6 mr-3" />
                    Contenido del curso
                  </h3>
                  <p className="text-blue-100 text-sm mt-2">
                    {course.chapters.length} lecciones disponibles
                  </p>
                </div>
              
                {isIABasicoFree && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                        GRATIS
                      </div>
                      <span className="text-green-800 font-semibold">Acceso completo</span>
                    </div>
                    <p className="text-green-700 text-sm mt-2 font-medium">
                      🎉 Este curso es completamente gratuito para todos
                    </p>
                  </div>
                )}
                
                <div className="max-h-[500px] overflow-y-auto">
                  {course.chapters.map((chapter, index) => {
                    const chapterNumber = index + 1;
                    const isSection = chapter.title.startsWith('Sección');
                    const isCompleted = false;
                    
                    if (isSection) {
                      return (
                        <div key={chapter.id} className="bg-gray-50 border-b border-gray-200 py-4 px-6">
                          <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                            {chapter.title}
                          </h4>
                        </div>
                      );
                    }
                    
                    return (
                      <a
                        key={chapter.id}
                        href={`/courses/${params.courseId}/chapters/${chapter.id}`}
                        className="block p-4 hover:bg-blue-50 transition-all duration-200 group border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-bold transition-all ${
                            isCompleted 
                              ? 'bg-green-500 border-green-500 text-white shadow-lg'
                              : 'border-gray-300 text-gray-500 group-hover:border-blue-500 group-hover:text-blue-600 group-hover:bg-blue-50'
                          }`}>
                            {isCompleted ? '✓' : chapterNumber}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-2">
                              {chapter.title.replace(/🎥|📖|🧪|📝/, '').trim()}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              {chapter.title.includes('🎥') && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-700 font-medium">
                                  <PlayCircle className="w-3 h-3 mr-1" />
                                  Video
                                </span>
                              )}
                              {chapter.title.includes('📖') && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 font-medium">
                                  <BookOpen className="w-3 h-3 mr-1" />
                                  Lectura
                                </span>
                              )}
                              {chapter.title.includes('🧪') && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                                  <FlaskConical className="w-3 h-3 mr-1" />
                                  Lab
                                </span>
                              )}
                              {chapter.title.includes('📝') && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700 font-medium">
                                  <Award className="w-3 h-3 mr-1" />
                                  Quiz
                                </span>
                              )}
                              {(chapter.isFree || isIABasicoFree) && (
                                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">
                                  Gratis
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Enhanced Main Content */}
            <div className="flex-1 space-y-6">
              {/* CTA Card - Priority placement */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">¡Comienza tu aprendizaje ahora!</h2>
                      <p className="text-blue-100">Únete a miles de estudiantes y domina la IA</p>
                    </div>
                    <Zap className="w-12 h-12 text-yellow-400" />
                  </div>
                  
                  <CourseEnrollmentCard
                    courseId={params.courseId}
                    courseTitle={course.title}
                    price={course.price || 0}
                    purchased={!!purchase}
                    isIABasicoFree={isIABasicoFree}
                    progressCount={progressCount}
                    firstChapterId={
                      course.chapters.find(ch => 
                        ch.title.includes('🎥') || 
                        ch.title.includes('📖') || 
                        ch.title.includes('🧪') || 
                        ch.title.includes('📝') ||
                        (!ch.title.startsWith('Sección'))
                      )?.id || 
                      (course.chapters.length > 0 ? course.chapters[0].id : undefined)
                    }
                  />
                </div>
              </div>

              {/* Course Overview */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-gray-200 p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center">
                    <Target className="w-8 h-8 mr-3 text-blue-600" />
                    Acerca de este curso
                  </h2>
                  <p className="text-gray-700 text-xl leading-relaxed">
                    {course.description}
                  </p>
                </div>
                
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
                    Lo que dominarás:
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <CheckCircle2 className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Fundamentos de IA</h4>
                        <p className="text-gray-600 text-sm">Conceptos básicos y arquitecturas modernas</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                      <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Machine Learning</h4>
                        <p className="text-gray-600 text-sm">Algoritmos supervisados y no supervisados</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <CheckCircle2 className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Python Avanzado</h4>
                        <p className="text-gray-600 text-sm">Librerías especializadas para IA</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
                      <CheckCircle2 className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Google Cloud AI</h4>
                        <p className="text-gray-600 text-sm">Proyectos en producción real</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                
              {/* Enhanced Course Features */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <Shield className="w-7 h-7 mr-3 text-indigo-600" />
                    Garantías y beneficios
                  </h3>
                  <p className="text-gray-600">Todo lo que obtienes con este curso premium</p>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border border-green-200 hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">Acceso de por vida</h4>
                      </div>
                      <p className="text-gray-600">Nunca pierdas acceso a tu inversión educativa</p>
                    </div>
                    
                    <div className="group p-6 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-xl border border-blue-200 hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">Certificación oficial</h4>
                      </div>
                      <p className="text-gray-600">Demuestra tus habilidades con nuestro certificado</p>
                    </div>
                    
                    <div className="group p-6 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border border-purple-200 hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">Soporte experto</h4>
                      </div>
                      <p className="text-gray-600">Mentoria directa de nuestros instructores</p>
                    </div>
                    
                    <div className="group p-6 bg-gradient-to-br from-orange-50 to-red-100 rounded-xl border border-orange-200 hover:shadow-lg transition-all">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <FlaskConical className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg">Labs en Google Cloud</h4>
                      </div>
                      <p className="text-gray-600">Práctica con herramientas profesionales</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseIdPage;