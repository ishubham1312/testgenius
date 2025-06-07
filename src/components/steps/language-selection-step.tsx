
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages } from "lucide-react";

interface LanguageSelectionStepProps {
  onSelectLanguage: (language: 'en' | 'hi') => void;
}

export function LanguageSelectionStep({ onSelectLanguage }: LanguageSelectionStepProps) {
  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader className="items-center">
        <Languages className="h-12 w-12 text-primary mb-4" />
        <CardTitle className="font-headline text-3xl text-center">Choose Language</CardTitle>
        <CardDescription className="text-center pt-2">
          The uploaded document appears to contain questions in multiple languages.
          Please select the primary language you'd like to extract questions from.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={() => onSelectLanguage('en')} 
          size="lg"
          className="w-full text-base bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity"
        >
          English
        </Button>
        <Button 
          onClick={() => onSelectLanguage('hi')} 
          size="lg"
          variant="outline"
          className="w-full text-base" 
        >
          हिंदी (Hindi)
        </Button>
      </CardContent>
    </Card>
  );
}
