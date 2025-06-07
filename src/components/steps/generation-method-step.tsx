
"use client";

import type { GenerationMode } from "@/app/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BookOpenCheck, Brain } from "lucide-react";

interface GenerationMethodStepProps {
  onSelectMethod: (method: GenerationMode) => void;
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
          className="w-full text-lg py-6 flex items-center justify-center gap-3"
          variant="default"
        >
          <FileText className="h-6 w-6" />
          Extract from Document
        </Button>
        
        <Button 
          onClick={() => onSelectMethod('generate_from_syllabus')} 
          className="w-full text-lg py-6 flex items-center justify-center gap-3"
          variant="secondary"
        >
          <BookOpenCheck className="h-6 w-6" />
          Generate from Syllabus
        </Button>

        <Button 
          onClick={() => onSelectMethod('generate_from_topic')} 
          className="w-full text-lg py-6 flex items-center justify-center gap-3"
          variant="outline"
        >
          <Brain className="h-6 w-6" />
          Generate from Topic(s)
        </Button>
      </CardContent>
    </Card>
  );
}
