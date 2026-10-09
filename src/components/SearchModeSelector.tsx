import { Brain, Code, Sparkles } from "lucide-react";
import type { SearchMode } from "@/lib/search-api";

const MODES: { id: SearchMode; label: string; icon: React.ElementType; description: string }[] = [
  { id: "default", label: "AI Search", icon: Sparkles, description: "Intelligent answers" },
  { id: "deep_research", label: "Deep Research", icon: Brain, description: "Multi-source analysis" },
  { id: "code", label: "Code", icon: Code, description: "Developer intelligence" },
];

interface SearchModeSelectorProps {
  activeMode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

const SearchModeSelector = ({ activeMode, onChange }: SearchModeSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-1.5 pb-1">
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`flex min-h-12 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
              isActive
                ? "bg-primary/15 text-primary glow-border"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
            }`}
            title={mode.description}
          >
            <Icon className="w-3.5 h-3.5" />
            {mode.label}
          </button>
        );
      })}
    </div>
  );
};

export default SearchModeSelector;
