"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface CourseEnrollmentStatusProps {
  courseId: string;
  initialPurchased: boolean;
  children: (purchased: boolean, isLoading: boolean) => React.ReactNode;
}

export const CourseEnrollmentStatus = ({ 
  courseId, 
  initialPurchased, 
  children 
}: CourseEnrollmentStatusProps) => {
  const [purchased, setPurchased] = useState(initialPurchased);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const success = searchParams.get("success");
    const enrolled = searchParams.get("enrolled");
    
    // If returning from successful payment, check enrollment status
    if (success === "1" && enrolled === "true" && !purchased) {
      // Wait a moment for webhook processing, then check
      setTimeout(() => {
        checkEnrollmentStatus();
      }, 2000);
    }
  }, [searchParams, purchased]);

  const checkEnrollmentStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/enrollment-status`);
      const data = await response.json();
      
      if (data.purchased) {
        setPurchased(true);
      } else {
        // Retry after 2 seconds if not yet processed
        setTimeout(checkEnrollmentStatus, 2000);
      }
    } catch (error) {
      console.error('Error checking enrollment:', error);
      // Retry after 3 seconds on error
      setTimeout(checkEnrollmentStatus, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return <>{children(purchased, isLoading)}</>;
};