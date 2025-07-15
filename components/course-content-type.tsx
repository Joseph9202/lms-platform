import { PlayCircle, BookOpen, FlaskConical, CheckCircle2, Clock, Award, Users } from "lucide-react";

interface CourseContentTypeProps {
  type: 'video' | 'reading' | 'lab' | 'quiz';
  title: string;
  duration?: string;
  isFree?: boolean;
}

export const CourseContentType = ({ type, title, duration, isFree }: CourseContentTypeProps) => {
  const getIcon = () => {
    switch (type) {
      case 'video':
        return <PlayCircle className="w-5 h-5 text-red-600" />;
      case 'reading':
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case 'lab':
        return <FlaskConical className="w-5 h-5 text-green-600" />;
      case 'quiz':
        return <CheckCircle2 className="w-5 h-5 text-purple-600" />;
      default:
        return <PlayCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeName = () => {
    switch (type) {
      case 'video':
        return 'Video';
      case 'reading':
        return 'Lectura';
      case 'lab':
        return 'Laboratorio';
      case 'quiz':
        return 'Quiz';
      default:
        return 'Contenido';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'video':
        return 'bg-red-50 border-red-200';
      case 'reading':
        return 'bg-blue-50 border-blue-200';
      case 'lab':
        return 'bg-green-50 border-green-200';
      case 'quiz':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${getBgColor()} transition-all hover:shadow-md`}>
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-800">{getTypeName()}</span>
            {isFree && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                Gratis
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{title}</p>
        </div>
      </div>
      
      {duration && (
        <div className="flex items-center space-x-1 text-gray-500">
          <Clock className="w-4 h-4" />
          <span className="text-xs">{duration}</span>
        </div>
      )}
    </div>
  );
};