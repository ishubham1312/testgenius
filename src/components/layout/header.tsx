import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";

interface HeaderProps {
  onLogoClick?: () => void;
  onHistoryClick?: () => void;
}

export function Header({ onLogoClick, onHistoryClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={onLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLogoClick?.(); }}
          aria-label="Go to homepage"
        >
          <Image
            src="/logo.png"
            alt="TestGenius Logo"
            width={48}
            height={48}
            className="h-12 w-12"
          />
          <h1 className="text-2xl font-bold font-headline text-primary">TestGenius</h1>
        </div>
        <div className="flex items-center gap-2">
          {onHistoryClick && (
            <Button variant="outline" size="icon" onClick={onHistoryClick} aria-label="View test history">
              <History className="h-[1.2rem] w-[1.2rem]" />
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
