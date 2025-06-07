import { ThemeToggle } from "@/components/theme-toggle";
import { BrainCircuit } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold font-headline text-primary">TestGenius</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
