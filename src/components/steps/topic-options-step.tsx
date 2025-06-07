
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Settings, Bot } from "lucide-react";

export interface TopicGenerationOptions {
  numQuestions: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

interface TopicOptionsStepProps {
  onSubmitOptions: (options: TopicGenerationOptions) => void;
}

export function TopicOptionsStep({ onSubmitOptions }: TopicOptionsStepProps) {
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
            Topic Generation Options
        </CardTitle>
        <CardDescription className="text-center">
          Specify how you want the AI to generate questions based on your topic.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="num-questions-topic" className="text-base">Number of Questions: <span className="text-primary font-semibold">{numQuestions}</span></Label>
            <Slider
              id="num-questions-topic"
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
                <RadioGroupItem value="easy" id="difficulty-topic-easy" />
                <Label htmlFor="difficulty-topic-easy" className="cursor-pointer">Easy</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary flex-1">
                <RadioGroupItem value="medium" id="difficulty-topic-medium" />
                <Label htmlFor="difficulty-topic-medium" className="cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary flex-1">
                <RadioGroupItem value="hard" id="difficulty-topic-hard" />
                <Label htmlFor="difficulty-topic-hard" className="cursor-pointer">Hard</Label>
              </div>
            </RadioGroup>
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

