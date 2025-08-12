import Image from "next/image";
import Link from "next/link";
import { Brain, Clock, Users } from "lucide-react";

import { IconBadge } from "@/components/icon-badge";
import { formatPrice } from "@/lib/format";
import { CourseProgress } from "@/components/course-progress";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category
}: CourseCardProps) => {
  // Check if this is the IA Básico course (gift for new users)
  const isIABasicoFree = title.includes('IA Básico') || title.includes('Inteligencia Artificial Básico');
  return (
    <Link href={`/courses/${id}`}>
      <div className="group course-card rounded-xl p-4 h-full transform hover:scale-105 transition-all duration-300">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
          <Image
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            alt={title}
            src={imageUrl}
          />
          <div className="absolute top-2 right-2 space-y-1">
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium block">
              {category}
            </span>
            {isIABasicoFree && (
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full font-medium block">
                🎁 GRATIS
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <div className="text-lg font-bold group-hover:text-purple-700 transition-colors line-clamp-2 leading-tight">
            {title}
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-x-2">
              <IconBadge size="sm" icon={Brain} variant="default" />
              <span className="font-medium">
                {chaptersLength} {chaptersLength === 1 ? "Módulo" : "Módulos"}
              </span>
            </div>
            
            <div className="flex items-center gap-x-1 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-xs">2-4 horas</span>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100">
            {progress !== null ? (
              <div className="space-y-2">
                <CourseProgress
                  variant={progress === 100 ? "success" : "default"}
                  size="sm"
                  value={progress}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-600 font-medium">
                    ✓ Inscrito
                  </span>
                  <div className="flex items-center gap-x-1 text-gray-400">
                    <Users className="w-3 h-3" />
                    <span className="text-xs">1.2k estudiantes</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold ai-text-gradient">
                  {isIABasicoFree ? (
                    <span className="text-green-600">🎁 GRATIS</span>
                  ) : (
                    formatPrice(price)
                  )}
                </p>
                <div className="flex items-center gap-x-1 text-gray-400">
                  <Users className="w-3 h-3" />
                  <span className="text-xs">1.2k estudiantes</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}