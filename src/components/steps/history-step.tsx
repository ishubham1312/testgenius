
"use client";

import type { TestHistoryItem, GenerationMode } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, BookOpenCheck, Brain, CalendarDays, BarChart3, ChevronRight, PlusCircle } from "lucide-react";
import { format } from 'date-fns';

interface HistoryStepProps {
  history: TestHistoryItem[];
  onViewResult: (item: TestHistoryItem) => void;
  onTakeNewTest: () => void;
}

const getModeIcon = (mode: GenerationMode | null) => {
  switch (mode) {
    case 'extract_from_document':
      return <FileText className="h-5 w-5 mr-2 text-primary shrink-0" />;
    case 'generate_from_syllabus':
      return <BookOpenCheck className="h-5 w-5 mr-2 text-primary shrink-0" />;
    case 'generate_from_topic':
      return <Brain className="h-5 w-5 mr-2 text-primary shrink-0" />;
    default:
      return <BarChart3 className="h-5 w-5 mr-2 text-primary shrink-0" />;
  }
};

const getModeText = (mode: GenerationMode | null) => {
  switch (mode) {
    case 'extract_from_document':
      return "Document Based";
    case 'generate_from_syllabus':
      return "Syllabus Based";
    case 'generate_from_topic':
      return "Topic Based";
    default:
      return "Test";
  }
};

export function HistoryStep({ history, onViewResult, onTakeNewTest }: HistoryStepProps) {
  if (!history || history.length === 0) {
    return (
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Test History</CardTitle>
          <CardDescription>You haven't taken any tests yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onTakeNewTest} className="text-lg py-6">
            <PlusCircle className="mr-2 h-5 w-5" />
            Take a New Test
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-xl">
      <CardHeader className="items-center">
        <CardTitle className="font-headline text-3xl">Test History</CardTitle>
        <CardDescription>Review your past test performances.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] md:h-[500px] pr-4">
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center">
                    {getModeIcon(item.generationMode)}
                    <span className="truncate min-w-0 flex-1">{item.sourceName || getModeText(item.generationMode)}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center text-xs pt-1">
                    <CalendarDays className="h-3 w-3 mr-1.5 shrink-0" />
                    <span className="truncate min-w-0 flex-1">{format(new Date(item.timestamp), "PPpp")}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center pb-4">
                  <div>
                     <p className="text-sm text-muted-foreground">Score</p>
                     <p className="text-2xl font-bold text-primary">
                        {item.scoreSummary.score.toFixed(2)} / {item.scoreSummary.totalQuestions}
                     </p>
                  </div>
                  <Button onClick={() => onViewResult(item)} variant="outline" size="sm">
                    View Details <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="justify-center">
        <Button onClick={onTakeNewTest} variant="default" className="text-lg py-3">
            <PlusCircle className="mr-2 h-5 w-5" />
            Take Another Test
        </Button>
      </CardFooter>
    </Card>
  );
}
