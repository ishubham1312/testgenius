
"use client";

import type { QuestionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ListChecks, PlayCircle } from "lucide-react";

interface QuestionPreviewStepProps {
  questions: QuestionType[];
  onStartTest: () => void;
}

export function QuestionPreviewStep({ questions, onStartTest }: QuestionPreviewStepProps) {
  if (!questions || questions.length === 0) {
    return (
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-center">No Questions Available</CardTitle>
          <CardDescription className="text-center">
            The AI could not find or generate any questions. Please go back and try different options.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center flex items-center justify-center gap-2">
          <ListChecks className="h-8 w-8 text-primary"/>
          Review Questions
        </CardTitle>
        <CardDescription className="text-center">
          Here are the questions ({questions.length} found). Review them before starting the test.
          <br />
          <span className="text-xs text-muted-foreground">Questions with newlines or matching formats will be displayed as intended during the test.</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <Accordion type="single" collapsible className="w-full">
            {questions.map((q, index) => (
              <AccordionItem value={`item-${index}`} key={q.id}>
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-medium" style={{ whiteSpace: 'pre-line' }}>{index + 1}. {q.questionText}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1 list-disc list-inside pl-4 text-muted-foreground">
                    {q.options.map((opt, optIndex) => (
                      <li key={optIndex} style={{ whiteSpace: 'pre-line' }}>
                        {opt}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button onClick={onStartTest} className="w-full text-lg py-6">
          <PlayCircle className="mr-2 h-5 w-5" />
          Start Test
        </Button>
      </CardFooter>
    </Card>
  );
}
