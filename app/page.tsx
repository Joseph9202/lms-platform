import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import Link from 'next/link';
import { Brain, Rocket, Users, GraduationCap, Star, CheckCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { userId } = auth();

  if (userId) {
    return redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 ai-nav">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <Brain className="text-2xl sm:text-3xl text-purple-600" />
              <span className="text-xl sm:text-2xl font-bold ai-text-gradient">
                AI Academy
              </span>
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                href="/search" 
                className="text-gray-700 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg hover:bg-purple-50 text-sm sm:text-base whitespace-nowrap font-medium flex items-center space-x-1"
              >
                <span>Cursos</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Gratis</span>
              </Link>
              <Link 
                href="/sign-in" 
                className="text-gray-700 hover:text-purple-600 transition-colors px-3 py-2 rounded-lg hover:bg-purple-50 text-sm sm:text-base whitespace-nowrap font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/sign-up" 
                className="ai-button text-white px-4 py-2 rounded-lg text-sm sm:text-base whitespace-nowrap font-medium"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center pt-24 pb-16 px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="mb-8">
            <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium border border-purple-200">
              🚀 El Futuro del Aprendizaje de IA
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold ai-text-gradient leading-tight">
            Domina la IA
          </h1>
          
          <h2 className="text-2xl lg:text-4xl font-bold text-gray-800 leading-tight">
            con Aprendizaje Práctico
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Únete al futuro de la educación con nuestra plataforma de aprendizaje de IA de vanguardia. 
            <span className="text-purple-600 font-medium"> Explora todos los cursos gratis</span> antes de registrarte.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link href="/search">
              <Button className="group inline-flex items-center space-x-2 px-8 py-4 ai-button text-white rounded-lg font-semibold text-lg">
                <span>Explorar Cursos Gratis</span>
                <Zap className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="outline" className="inline-flex items-center space-x-2 px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold text-lg hover:border-purple-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300">
                <span>Crear Cuenta</span>
                <Rocket className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">1,000+</div>
              <div className="text-gray-600 font-medium">Estudiantes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">50+</div>
              <div className="text-gray-600 font-medium">Proyectos IA</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-500">95%</div>
              <div className="text-gray-600 font-medium">Satisfacción</div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold ai-text-gradient">
              Características de Aprendizaje
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Descubre todo lo que necesitas para convertirte en un experto en inteligencia artificial
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                title: "Proyectos de IA en Tiempo Real",
                description: "Construye y despliega modelos de IA con proyectos prácticos que simulan casos reales de la industria",
                icon: <Rocket className="text-4xl mb-6 text-purple-600" />,
              },
              {
                title: "Aprendizaje Personalizado",
                description: "Plan de estudios impulsado por IA que se adapta a tu ritmo y estilo de aprendizaje único",
                icon: <Brain className="text-4xl mb-6 text-blue-600" />,
              },
              {
                title: "Comunidad Activa",
                description: "Únete a una comunidad vibrante de estudiantes y profesionales que comparten tu pasión",
                icon: <Users className="text-4xl mb-6 text-green-600" />,
              },
              {
                title: "Certificación Reconocida",
                description: "Obtén certificaciones valoradas por empresas líderes en tecnología e IA",
                icon: <GraduationCap className="text-4xl mb-6 text-indigo-600" />,
              },
              {
                title: "Proyectos Hands-on",
                description: "Aprende haciendo con ejercicios de código interactivos y proyectos prácticos",
                icon: <CheckCircle className="text-4xl mb-6 text-green-600" />,
              },
              {
                title: "Tecnología de Vanguardia",
                description: "Accede a las últimas herramientas y tecnologías en el campo de la inteligencia artificial",
                icon: <Star className="text-4xl mb-6 text-yellow-600" />,
              }
            ].map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl course-card transform hover:scale-105">
                <div className="flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-center text-gray-800 group-hover:text-purple-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg relative overflow-hidden">
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
              ¿Listo para Comenzar tu Viaje en IA?
            </h2>
            <p className="text-xl text-purple-100 leading-relaxed">
              Únete a miles de estudiantes que ya están construyendo el futuro con inteligencia artificial
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link href="/sign-up">
                <Button className="group inline-flex items-center space-x-3 bg-white text-purple-600 px-10 py-5 rounded-xl text-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-2xl transform hover:scale-105">
                  <span>Comienza Hoy</span>
                  <Rocket className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" className="inline-flex items-center space-x-3 text-white border-2 border-white/50 px-10 py-5 rounded-xl text-xl font-bold hover:border-white hover:bg-white/10 transition-all duration-300">
                  <span>Ya tengo cuenta</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="text-3xl text-purple-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              AI Academy
            </span>
          </div>
          <p className="text-gray-400 mb-4">
            Transformando el futuro a través de la educación en inteligencia artificial
          </p>
          <p className="text-gray-500 text-sm">
            © 2024 AI Academy. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}