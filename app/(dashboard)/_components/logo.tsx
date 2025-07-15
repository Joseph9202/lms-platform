import { Brain } from "lucide-react";

export const Logo = () => {
  return (
    <div className="flex items-center gap-x-2">
      <div className="ai-button rounded-lg p-2">
        <Brain className="w-8 h-8 text-white" />
      </div>
      <span className="font-bold text-xl ai-text-gradient">AI Academy</span>
    </div>
  )
}