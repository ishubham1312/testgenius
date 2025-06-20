
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Brain, ArrowRight } from 'lucide-react';

interface TopicInputStepProps {
  onSubmitTopic: (topic: string) => void;
}

export function TopicInputStep({ onSubmitTopic }: TopicInputStepProps) {
  const [topic, setTopic] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmitTopic(topic.trim());
    }
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          Enter Topic or Keywords
        </CardTitle>
        <CardDescription className="text-center">
          Provide the topic(s) or keywords you want the AI to generate questions about. 
          For multiple topics, you can list them separated by commas or new lines.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic-input" className="text-base">Topic / Keywords</Label>
            <Textarea
              id="topic-input"
              placeholder="e.g., Photosynthesis, World War II, JavaScript Fundamentals"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
              className="min-h-[100px]" // text-sm is now default from ui/textarea
            />
          </div>
          <Button 
            type="submit" 
            size="lg"
            className="w-full text-base bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity" 
            disabled={!topic.trim()}
          >
            <ArrowRight className="mr-2 h-5 w-5"/>
            Proceed to Options
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
