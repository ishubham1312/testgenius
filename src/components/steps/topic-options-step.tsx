
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Settings, Bot } from "lucide-react";

export interface TopicGenerationOptions {
  numQuestions: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
  preferredLanguage?: 'en' | 'hi';
}

interface TopicOptionsStepProps {
  onSubmitOptions: (options: TopicGenerationOptions) => void;
}

export function TopicOptionsStep({ onSubmitOptions }: TopicOptionsStepProps) {
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficultyLevel, setDifficultyLevel] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'hi' | undefined>(undefined);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitOptions({ numQuestions, difficultyLevel, preferredLanguage });
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center flex items-center justify-center gap-2">
            <Settings className="h-8 w-8 text-primary"/>
            Topic Generation Options
        </CardTitle>
        <CardDescription className="text-center">
          Configure how AI should generate questions for your topic(s).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="num-questions-topic" className="text-base">Number of Questions: <span className="text-primary font-semibold">{numQuestions}</span></Label>
            <Slider
              id="num-questions-topic"
              min={1}
              max={50}
              step={1}
              value={[numQuestions]}
              onValueChange={(value) => setNumQuestions(value[0])}
            />
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
                  <RadioGroupItem value={level} id={`difficulty-topic-${level}`} />
                  <Label htmlFor={`difficulty-topic-${level}`} className="cursor-pointer capitalize">{level}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="language-select-topic" className="text-base">Preferred Language (Optional)</Label>
            <Select value={preferredLanguage} onValueChange={(value: 'en' | 'hi') => setPreferredLanguage(value)}>
              <SelectTrigger id="language-select-topic">
                <SelectValue placeholder="Select language (Defaults to English)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">If not selected, AI will default to English or try to infer from the topic.</p>
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
