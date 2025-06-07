
"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Settings, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface SyllabusGenerationOptions {
  numQuestions: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  preferredLanguage?: 'en' | 'hi';
}

interface SyllabusOptionsStepProps {
  onSubmitOptions: (options: SyllabusGenerationOptions) => void;
}

export function SyllabusOptionsStep({ onSubmitOptions }: SyllabusOptionsStepProps) {
  const [numQuestions, setNumQuestions] = useState(0); // Default to 0
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'hi' | undefined>(undefined);
  const { toast } = useToast();

  const handleNumQuestionsSliderChange = (value: number[]) => {
    setNumQuestions(value[0]);
  };

  const handleNumQuestionsInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value, 10);
    if (isNaN(value)) { // If input is cleared or non-numeric
      value = 0; // Default to 0
    } else if (value > 50) {
      value = 50;
      toast({ title: "Limit Reached", description: "Maximum 50 questions allowed." });
    } else if (value < 0) { // Allow 0, prevent negative
      value = 0;
      toast({ title: "Input Adjusted", description: "Minimum 0 questions allowed."});
    }
    setNumQuestions(value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (numQuestions < 0 || numQuestions > 50) { // Check if less than 0
        toast({ title: "Invalid Input", description: "Number of questions must be between 0 and 50.", variant: "destructive" });
        return;
    }
    onSubmitOptions({ numQuestions, difficultyLevel, preferredLanguage });
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center flex items-center justify-center gap-2">
            <Settings className="h-8 w-8 text-primary"/>
            Syllabus Generation Options
        </CardTitle>
        <CardDescription className="text-center">
          Specify how AI should generate questions from the syllabus.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="num-questions-syllabus-input" className="text-base">
              Number of Questions (0-50): <span className="text-primary font-semibold">{numQuestions}</span>
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                id="num-questions-syllabus-slider"
                min={0} // Min to 0
                max={50}
                step={1}
                value={[numQuestions]}
                onValueChange={handleNumQuestionsSliderChange}
                className="flex-1"
              />
              <Input
                id="num-questions-syllabus-input"
                type="number"
                value={numQuestions}
                onChange={handleNumQuestionsInputChange}
                min="0" // Min to 0
                max="50"
                className="w-20 text-center"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-base">Difficulty Level</Label>
            <RadioGroup
              value={difficultyLevel}
              onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficultyLevel(value)}
              className="flex flex-col sm:flex-row sm:gap-4"
            >
               {['easy', 'medium', 'hard'].map(level => (
                <div key={level} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary flex-1">
                  <RadioGroupItem value={level} id={`difficulty-syllabus-${level}`} />
                  <Label htmlFor={`difficulty-syllabus-${level}`} className="cursor-pointer capitalize">{level}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="language-select-syllabus" className="text-base">Preferred Language (Optional)</Label>
            <Select value={preferredLanguage} onValueChange={(value: 'en' | 'hi' | undefined) => setPreferredLanguage(value)}>
              <SelectTrigger id="language-select-syllabus">
                <SelectValue placeholder="Select language (AI will try to infer if not set)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
              </SelectContent>
            </Select>
             <p className="text-xs text-muted-foreground">If not selected, AI will try to infer from syllabus or default to its primary language detection.</p>
          </div>

          <Button type="submit" className="w-full text-lg py-6">
            <Bot className="mr-2 h-5 w-5" />
            Generate Questions
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
