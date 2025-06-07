
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Enter Topic</CardTitle>
        <CardDescription className="text-center">
          Provide the topic you want the test questions to be about.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              type="text"
              placeholder="e.g., Photosynthesis, World War II, JavaScript Fundamentals"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Next
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
