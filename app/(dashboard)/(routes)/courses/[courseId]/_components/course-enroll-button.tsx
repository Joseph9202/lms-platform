"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
  purchased: boolean;
  isLoading?: boolean;
  isFreeGift?: boolean;
}

export const CourseEnrollButton = ({
  price,
  courseId,
  purchased,
  isLoading: externalLoading = false,
  isFreeGift = false
}: CourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      if (purchased || isFreeGift) {
        if (isFreeGift) {
          toast.success("¡Disfruta tu curso regalo! 🎁");
        } else {
          toast.success("¡Ya tienes acceso a este curso!");
        }
        return;
      }

      const response = await axios.post(`/api/courses/${courseId}/checkout`);

      window.location.assign(response.data.url);
    } catch {
      toast.error("Algo salió mal");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      onClick={onClick}
      disabled={isLoading || externalLoading}
      size="sm"
      className={`w-full md:w-auto ${isFreeGift ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' : ''}`}
    >
      {externalLoading ? "Verificando compra..." : 
       isFreeGift ? "🎁 ¡Curso Gratis - Empezar Ahora!" :
       purchased ? "Ya comprado" : 
       isLoading ? "Procesando..." : 
       `Comprar por ${formatPrice(price)}`}
    </Button>
  )
}