"use client";

import { useState } from "react";
import { ArrowLeft, Clock, Menu, PlayCircle, BookOpen, FlaskConical, CheckCircle2, ChevronRight, Home, X } from "lucide-react";

// Removed direct imports of server components

interface Chapter {
  id: string;
  title: string;
  description?: string | null;
  isFree: boolean;
  course: {
    title: string;
    userId: string;
  };
}

interface Course {
  chapters: Array<{
    id: string;
    title: string;
  }>;
}

interface ChapterWrapperProps {
  chapter: Chapter;
  course: Course | null;
  params: {
    courseId: string;
    chapterId: string;
  };
  userId: string;
  children: React.ReactNode;
}

export const ChapterWrapper = ({ chapter, course, params, userId, children }: ChapterWrapperProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const isSection = chapter.title.startsWith('Sección');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <a
                href={`/courses/${params.courseId}`}
                className="inline-flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al curso
              </a>
              <div className="border-l border-gray-300 pl-4">
                <div className="text-sm text-gray-500">{chapter.course.title}</div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {chapter.title.replace(/🎥|📖|🧪|📝/, '').trim()}
                </h1>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Menu className="h-4 w-4 mr-2" />
                Contenido
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sliding Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
            <h3 className="font-semibold">Contenido del curso</h3>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-blue-700 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {/* Course Progress */}
          <div className="p-4 bg-green-50 border-b">
            <div className="text-sm text-gray-600 mb-2">Progreso: 25%</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
          
          {/* Chapters List */}
          <div className="flex-1 overflow-y-auto p-2">
            {course?.chapters.map((ch, index) => {
              const isSection = ch.title.startsWith('Sección');
              const isCurrentChapter = ch.id === params.chapterId;
              
              if (isSection) {
                return (
                  <div key={ch.id} className="px-3 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded mt-2">
                    {ch.title}
                  </div>
                );
              }
              
              return (
                <a
                  key={ch.id}
                  href={`/courses/${params.courseId}/chapters/${ch.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`block p-3 rounded-lg mb-1 transition-colors ${
                    isCurrentChapter 
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium ${
                      isCurrentChapter ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {ch.title.replace(/🎥|📖|🧪|📝/, '').trim()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {ch.title.includes('🎥') && 'Video'}
                        {ch.title.includes('📖') && 'Lectura'}
                        {ch.title.includes('🧪') && 'Laboratorio'}
                        {ch.title.includes('📝') && 'Quiz'}
                      </div>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border">
          {isSection ? (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {chapter.title.match(/\d+/)?.[0] || '1'}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{chapter.title}</h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  {chapter.description || 'Bienvenido a esta sección del curso'}
                </p>
              </div>
              
              <div className="text-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors font-medium"
                >
                  <Menu className="w-5 h-5 mr-2" />
                  Ver contenido del curso
                </button>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};