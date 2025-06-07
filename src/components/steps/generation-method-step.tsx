
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BookOpenCheck, Brain } from "lucide-react";

interface GenerationMethodStepProps {
  onSelectMethod: (method: 'extract_from_document' | 'generate_from_syllabus' | 'generate_from_topic') => void;
}

export function GenerationMethodStep({ onSelectMethod }: GenerationMethodStepProps) {
  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader className="items-center">
        <CardTitle className="font-headline text-3xl text-center">Welcome to TestGenius!</CardTitle>
        <CardDescription className="text-center pt-2">
          How would you like to create your test?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => onSelectMethod('extract_from_document')} 
          size="lg"
          className="w-full text-base bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <FileText className="mr-2 h-5 w-5" />
          Extract from Document
        </Button>
        
        <Button 
          onClick={() => onSelectMethod('generate_from_syllabus')} 
          size="lg"
          variant="secondary" // Keeps the secondary look if gradient not desired, or remove variant for gradient
          className="w-full text-base bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <BookOpenCheck className="mr-2 h-5 w-5" />
          Generate from Syllabus
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        <Button 
          onClick={() => onSelectMethod('generate_from_topic')} 
          size="lg"
          variant="outline" // Keeps the outline look if gradient not desired, or remove variant for gradient
          className="w-full text-base bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Brain className="mr-2 h-5 w-5" />
          Generate from Topic(s)
        </Button>
      </CardContent>
    </Card>
  );
}
