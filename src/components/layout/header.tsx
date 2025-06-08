
import { ThemeToggle } from "@/components/theme-toggle";
import { BrainCircuit, History } from "lucide-react";
import Link from "next/link";
import React from 'react'; // Keep React import for forwardRef

// Minimal Button component for Link usage
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; size?: string; asChild?: boolean }
>(({ className, variant, size, asChild, ...props }, ref) => { // Destructure asChild
  // Basic styling, adapt as needed or use your existing Button component
  const baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variantStyle = variant === "outline" ? "border border-input hover:bg-accent hover:text-accent-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90";
  const sizeStyle = size === "icon" ? "h-10 w-10" : "h-10 py-2 px-4";

  // This minimal button always renders a <button> element.
  // If asChild were true and this were a Slot-aware component, Slot would be used.
  // By destructuring 'asChild', we prevent it from being passed to the DOM element.
  return (
    <button
      ref={ref}
      className={`${baseStyle} ${variantStyle} ${sizeStyle} ${className || ''}`}
      {...props} // asChild is no longer in ...props
    />
  );
});
Button.displayName = "Button";


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
          <Link href="/history" aria-label="View test history">
            <Button variant="outline" size="icon"> {/* Removed asChild={false} */}
              <History className="h-5 w-5" />
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
