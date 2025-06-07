
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
  const [numQuestions, setNumQuestions] = useState(0);
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'hi' | undefined>(undefined);
  const { toast } = useToast();

  const handleNumQuestionsSliderChange = (value: number[]) => {
    setNumQuestions(value[0]);
  };

  const handleNumQuestionsInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;

    if (inputValue === "") {
      setNumQuestions(0);
      return;
    }

    let numericValue = parseInt(inputValue, 10);

    if (isNaN(numericValue)) {
      // If somehow a non-numeric string gets through (e.g. "-"), reset to 0 or current.
      // For simplicity, if it's not empty and not a number, stick to 0.
      setNumQuestions(0);
      return;
    }

    if (numericValue < 0) {
      numericValue = 0;
    } else if (numericValue > 50) {
      numericValue = 50;
      toast({ title: "Limit Reached", description: "Maximum 50 questions allowed." });
    }
    setNumQuestions(numericValue);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // numQuestions is already validated by the input change handler
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
          Specify how AI should generate questions from the syllabus. (0-50 questions)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="num-questions-syllabus-input" className="text-base">
              Number of Questions: <span className="text-primary font-semibold">{numQuestions}</span>
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                id="num-questions-syllabus-slider"
                min={0}
                max={50}
                step={1}
                value={[numQuestions]}
                onValueChange={handleNumQuestionsSliderChange}
                className="flex-1"
              />
              <Input
                id="num-questions-syllabus-input"
                type="number"
                value={numQuestions.toString()}
                onChange={handleNumQuestionsInputChange}
                placeholder="0"
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
