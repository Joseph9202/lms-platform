"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PurchaseSuccess = ({ courseTitle, courseId }: { courseTitle: string; courseId: string }) => {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const success = searchParams.get("success");
    const enrolled = searchParams.get("enrolled");
    
    if (success === "1" && enrolled === "true") {
      setShowSuccess(true);
      // Remove the query params to prevent infinite loops
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("enrolled");
      window.history.replaceState({}, "", url.toString());
      
      // Auto-hide after 8 seconds
      const timer = setTimeout(() => setShowSuccess(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  if (!showSuccess) return null;

  const handleStartCourse = async () => {
    try {
      // Wait a bit for webhook to process, then check enrollment
      setShowSuccess(false);
      
      // Wait 3 seconds for webhook processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check if enrolled
      const statusResponse = await fetch(`/api/courses/${courseId}/enrollment-status`);
      const statusData = await statusResponse.json();
      
      if (statusData.purchased) {
        // Get first available chapter
        const chapterResponse = await fetch(`/api/courses/${courseId}/first-chapter`);
        const chapterData = await chapterResponse.json();
        
        if (chapterData.chapterId) {
          window.location.href = `/courses/${courseId}/chapters/${chapterData.chapterId}`;
        } else {
          window.location.reload();
        }
      } else {
        // Webhook hasn't processed yet, just refresh to show updated state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error starting course:', error);
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center animate-pulse">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          ¡Compra Exitosa!
        </h3>
        
        <p className="text-gray-600 mb-6">
          Ya tienes acceso completo a <strong>{courseTitle}</strong>
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={handleStartCourse}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Comenzar Curso
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setShowSuccess(false)}
            className="w-full"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Ver Contenido
          </Button>
        </div>
      </div>
    </div>
  );
};