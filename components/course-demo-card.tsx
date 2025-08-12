"use client";

import Image from "next/image";
import Link from "next/link";
import { Brain, Clock, Users, Star, BookOpen, Trophy, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IconBadge } from "@/components/icon-badge";

interface CourseDemoCardProps {
  variant?: "progress" | "preview" | "completed";
}

export const CourseDemoCard = ({ variant = "progress" }: CourseDemoCardProps) => {
  const courseData = {
    id: "demo-ia-basico",
    title: "IA Básico - Certificación Profesional",
    description: "Curso completo de 4 semanas que te llevará desde los conceptos fundamentales hasta la implementación práctica de IA.",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop",
    price: 199.99,
    originalPrice: 299.99,
    rating: 4.8,
    studentsCount: "2.1k",
    chaptersTotal: 8,
    chaptersCompleted: variant === "completed" ? 8 : variant === "progress" ? 3 : 0,
    duration: "6 horas",
    level: "Principiante",
    category: "Inteligencia Artificial",
    instructor: "Dr. María González",
    progress: variant === "completed" ? 100 : variant === "progress" ? 37.5 : 0,
    lastAccessed: "Hace 2 horas",
    nextChapter: "Laboratorio: Google Cloud",
    certificate: variant === "completed"
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "completed":
        return "border-green-200 bg-gradient-to-br from-green-50 to-emerald-50";
      case "progress":
        return "border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  const getStatusBadge = () => {
    switch (variant) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">✓ Completado</Badge>;
      case "progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">📚 En Progreso</Badge>;
      default:
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">🆕 Nuevo</Badge>;
    }
  };

  return (
    <Card className={`group course-demo-card max-w-sm mx-auto transform hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl ${getVariantStyles()}`}>
      <CardHeader className="p-0">
        {/* Image Container */}
        <div className="relative">
          <div className="relative w-full aspect-video rounded-t-lg overflow-hidden">
            <Image
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              alt={courseData.title}
              src={courseData.imageUrl}
            />
            {/* Overlay gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            
            {/* Badges superiores */}
            <div className="absolute top-3 left-3 flex gap-2">
              {getStatusBadge()}
            </div>
            
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-black/70 text-white hover:bg-black/70">
                {courseData.category}
              </Badge>
            </div>

            {/* Rating y duración en la parte inferior */}
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <div className="flex items-center gap-1 bg-black/70 rounded-full px-2 py-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-white text-xs font-medium">{courseData.rating}</span>
              </div>
              <div className="flex items-center gap-1 bg-black/70 rounded-full px-2 py-1">
                <Clock className="w-3 h-3 text-white" />
                <span className="text-white text-xs">{courseData.duration}</span>
              </div>
            </div>

            {/* Play button para preview */}
            {variant === "preview" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-3 group-hover:bg-white transition-colors">
                  <PlayCircle className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Título y descripción */}
        <div className="space-y-2">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-blue-700 transition-colors">
            {courseData.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {courseData.description}
          </p>
        </div>

        {/* Instructor */}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-medium">M</span>
          </div>
          <span className="text-gray-700">{courseData.instructor}</span>
        </div>

        {/* Estadísticas del curso */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <IconBadge size="sm" icon={BookOpen} variant="default" />
            <span className="text-gray-600">
              {courseData.chaptersCompleted}/{courseData.chaptersTotal} lecciones
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IconBadge size="sm" icon={Users} variant="default" />
            <span className="text-gray-600">{courseData.studentsCount} estudiantes</span>
          </div>
        </div>

        {/* Progress Section */}
        {variant !== "preview" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Progreso</span>
              <span className="text-sm font-bold text-blue-600">{courseData.progress}%</span>
            </div>
            <Progress 
              value={courseData.progress} 
              className="h-2"
              // className={variant === "completed" ? "bg-green-100" : "bg-blue-100"}
            />
            
            {variant === "progress" && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Último acceso: {courseData.lastAccessed}</span>
                <span>Siguiente: {courseData.nextChapter}</span>
              </div>
            )}
            
            {variant === "completed" && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Trophy className="w-4 h-4" />
                <span className="font-medium">¡Certificado obtenido!</span>
              </div>
            )}
          </div>
        )}

        {/* Precio (solo para preview) */}
        {variant === "preview" && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">${courseData.price}</span>
            <span className="text-sm text-gray-500 line-through">${courseData.originalPrice}</span>
            <Badge variant="destructive" className="text-xs">33% OFF</Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {/* Action Buttons */}
        <div className="w-full space-y-2">
          {variant === "preview" && (
            <div className="space-y-2">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <PlayCircle className="w-4 h-4 mr-2" />
                Vista Previa Gratis
              </Button>
              <Button variant="outline" className="w-full">
                Agregar al Carrito
              </Button>
            </div>
          )}
          
          {variant === "progress" && (
            <div className="space-y-2">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <PlayCircle className="w-4 h-4 mr-2" />
                Continuar Lección
              </Button>
              <Button variant="outline" className="w-full text-sm">
                Ver Dashboard de Progreso
              </Button>
            </div>
          )}
          
          {variant === "completed" && (
            <div className="space-y-2">
              <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Trophy className="w-4 h-4 mr-2" />
                Descargar Certificado
              </Button>
              <Button variant="outline" className="w-full text-sm">
                Repasar Contenido
              </Button>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};