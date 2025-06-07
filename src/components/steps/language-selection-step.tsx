
"use client";

import type { GenerationMode } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages } from "lucide-react";

interface LanguageSelectionStepProps {
  onSelectLanguage: (language: 'en' | 'hi') => void;
  currentGenerationMode: GenerationMode | null;
}

export function LanguageSelectionStep({ onSelectLanguage, currentGenerationMode }: LanguageSelectionStepProps) {
  let description = "The content appears to be in multiple languages or the language is ambiguous.";
  if (currentGenerationMode === 'extract_from_document') {
    description = "The uploaded document appears to contain questions in multiple languages.";
  } else if (currentGenerationMode === 'generate_from_syllabus') {
    description = "The syllabus may contain mixed languages, or the AI needs a language preference for generation.";
  } else if (currentGenerationMode === 'generate_from_topic') {
    description = "The AI needs a language preference to generate questions for your topic effectively.";
  }
  
  description += " Please select the primary language for processing.";


  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader className="items-center">
        <Languages className="h-12 w-12 text-primary mb-4" />
        <CardTitle className="font-headline text-3xl text-center">Choose Language</CardTitle>
        <CardDescription className="text-center pt-2">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => onSelectLanguage('en')} 
          className="w-full text-lg py-6"
          variant="default"
        >
          English
        </Button>
        <Button 
          onClick={() => onSelectLanguage('hi')} 
          className="w-full text-lg py-6"
          variant="outline"
        >
          हिंदी (Hindi)
        </Button>
      </CardContent>
    </Card>
  );
}
