
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Lightbulb, ArrowRight } from "lucide-react";

interface TopicInputStepProps {
  onSubmitTopic: (topic: string) => void;
}

export function TopicInputStep({ onSubmitTopic }: TopicInputStepProps) {
  const [topic, setTopic] = useState("");
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (topic.trim().length < 3) {
      toast({
        title: "Topic Too Short",
        description: "Please enter a more descriptive topic (at least 3 characters).",
        variant: "destructive",
      });
      return;
    }
    onSubmitTopic(topic.trim());
  };

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center flex items-center justify-center gap-2">
          <Lightbulb className="h-8 w-8 text-primary" />
          Enter Topic(s)
        </CardTitle>
        <CardDescription className="text-center">
          Provide the topic(s) you want the AI to generate questions about.
          You can enter multiple topics separated by commas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="topic-input" className="text-base">Topic / Keywords</Label>
            <Textarea
              id="topic-input"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The Renaissance, Quantum Physics, Indian History 1857-1947"
              rows={4}
              className="text-base"
            />
          </div>
          <Button type="submit" className="w-full text-lg py-6" disabled={!topic.trim()}>
            <ArrowRight className="mr-2 h-5 w-5" />
            Proceed to Options
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
