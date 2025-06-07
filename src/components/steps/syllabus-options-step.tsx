
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Settings, Bot } from "lucide-react";

export interface SyllabusGenerationOptions {
  numQuestions: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  // preferredLanguage?: 'en' | 'hi'; // Optional: if we want to ask for language here
}

interface SyllabusOptionsStepProps {
  onSubmitOptions: (options: SyllabusGenerationOptions) => void;
}

export function SyllabusOptionsStep({ onSubmitOptions }: SyllabusOptionsStepProps) {
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitOptions({ numQuestions, difficultyLevel });
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center flex items-center justify-center gap-2">
            <Settings className="h-8 w-8 text-primary"/>
            Generation Options
        </CardTitle>
        <CardDescription className="text-center">
          Specify how you want the AI to generate questions from the syllabus.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="num-questions" className="text-base">Number of Questions: <span className="text-primary font-semibold">{numQuestions}</span></Label>
            <Slider
              id="num-questions"
              min={5}
              max={50}
              step={1}
              value={[numQuestions]}
              onValueChange={(value) => setNumQuestions(value[0])}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base">Difficulty Level</Label>
            <RadioGroup
              value={difficultyLevel}
              onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficultyLevel(value)}
              className="flex flex-col sm:flex-row sm:gap-4"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary flex-1">
                <RadioGroupItem value="easy" id="difficulty-easy" />
                <Label htmlFor="difficulty-easy" className="cursor-pointer">Easy</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary flex-1">
                <RadioGroupItem value="medium" id="difficulty-medium" />
                <Label htmlFor="difficulty-medium" className="cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary flex-1">
                <RadioGroupItem value="hard" id="difficulty-hard" />
                <Label htmlFor="difficulty-hard" className="cursor-pointer">Hard</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Optional: Language Preference - can be added if needed
          <div className="space-y-3">
            <Label className="text-base">Preferred Language for Questions</Label>
            <RadioGroup ... > ... </RadioGroup>
          </div>
          */}

          <Button type="submit" className="w-full text-lg py-6">
            <Bot className="mr-2 h-5 w-5" />
            Generate Questions
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
