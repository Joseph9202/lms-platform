import { cva, type VariantProps } from "class-variance-authority";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const colorByVariant = {
  default: "text-sky-700",
  success: "text-emerald-700",
}

const sizeByVariant = {
  default: "text-sm",
  sm: "text-xs",
}

const progressVariants = cva(
  "font-medium mt-2 text-sky-700",
  {
    variants: {
      variant: {
        default: "text-sky-700",
        success: "text-emerald-700",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    }
  }
);

interface CourseProgressProps extends VariantProps<typeof progressVariants> {
  value: number;
};

export const CourseProgress = ({
  value,
  variant,
  size,
}: CourseProgressProps) => {
  return (
    <div>
      <Progress
        className="h-2"
        value={value}
        variant={variant}
      />
      <p className={cn(progressVariants({ variant, size }))}>
        {Math.round(value)}% Completado
      </p>
    </div>
  )
}