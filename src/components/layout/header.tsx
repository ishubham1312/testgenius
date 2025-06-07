import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
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
            width={32}
            height={32}
            className="h-8 w-8" 
          />
          <h1 className="text-2xl font-bold font-headline text-primary">TestGenius</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
