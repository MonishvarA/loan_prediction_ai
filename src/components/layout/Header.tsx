import ThemeToggle from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Github } from "lucide-react";

export default function Header() {
  return (
    <header className={cn("sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60")}> 
      <div className="container mx-auto flex h-14 items-center justify-between">
        <a href="/" className="font-semibold tracking-tight">
          Loan Approval AI
        </a>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <a href="#docs" aria-label="Getting Started">Docs</a>
          </Button>
          <Button asChild variant="ghost">
            <a href="#dataset" aria-label="Dataset">Dataset</a>
          </Button>
          <Button asChild variant="ghost">
            <a href="#train" aria-label="Train">Train</a>
          </Button>
          <Button asChild variant="ghost">
            <a href="#predict" aria-label="Predict">Predict</a>
          </Button>
          <Button asChild variant="outline" size="icon">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
              <Github className="size-4" />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
