
import { ThemeToggle } from "@/components/theme-toggle";
import { BrainCircuit, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button"; // Import the standard ShadCN Button

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <BrainCircuit className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold font-headline text-primary">TestGenius</h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon" aria-label="View test history">
            <Link href="/history">
              <History className="h-5 w-5" />
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
