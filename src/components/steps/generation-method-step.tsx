
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BookOpenCheck } from "lucide-react";

interface GenerationMethodStepProps {
  onSelectMethod: (method: 'extract_from_document' | 'generate_from_syllabus') => void;
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
          Extract Questions from Document
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
          onClick={() => onSelectMethod('generate_from_syllabus')} 
          className="w-full text-lg py-6 flex items-center justify-center gap-3"
          variant="secondary"
        >
          <BookOpenCheck className="h-6 w-6" />
          Generate Questions from Syllabus
        </Button>
      </CardContent>
    </Card>
  );
}
