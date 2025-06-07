"use client";

import type { ScoreSummary, QuestionType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, HelpCircle, RotateCcw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ResultsStepProps {
  scoreSummary: ScoreSummary;
  onRetakeTest: () => void;
}

export function ResultsStep({ scoreSummary, onRetakeTest }: ResultsStepProps) {
  const { score, totalQuestions, results } = scoreSummary;
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  const getResultColor = (isCorrect: boolean) => {
    return isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };
  const getResultIcon = (isCorrect: boolean) => {
    return isCorrect ? <CheckCircle className="inline-block mr-2 h-5 w-5" /> : <XCircle className="inline-block mr-2 h-5 w-5" />;
  };


  return (
    <Card className="w-full max-w-3xl shadow-xl">
      <CardHeader className="items-center">
        <CardTitle className="font-headline text-4xl">Test Results</CardTitle>
        <CardDescription>You scored {score} out of {totalQuestions} questions correctly.</CardDescription>
        <div className="w-full max-w-md pt-4">
           <Progress value={percentage} className="h-4" />
           <p className="text-center text-2xl font-semibold mt-2 text-primary">{percentage.toFixed(1)}%</p>
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-semibold mb-4 font-headline text-center">Detailed Breakdown:</h3>
        <ScrollArea className="h-[400px] pr-4">
          <Accordion type="single" collapsible className="w-full">
            {results.map((result, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className={`hover:no-underline ${getResultColor(result.isCorrect)}`}>
                  <span className="flex items-center text-left">
                    {getResultIcon(result.isCorrect)}
                    <span className="font-medium">Question {index + 1}: {result.questionText}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pl-6">
                  <p><strong>Your Answer:</strong> <span className={result.userSelectedAnswer === result.actualCorrectAnswer ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>{result.userSelectedAnswer || "Not Answered"}</span></p>
                  <p><strong>Correct Answer:</strong> <span className="text-blue-600 dark:text-blue-400">{result.actualCorrectAnswer}</span></p>
                  
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Options:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {result.options.map((opt, optIndex) => (
                        <li key={optIndex}
                          className={`
                            ${opt === result.actualCorrectAnswer ? 'font-semibold text-primary' : ''}
                            ${opt === result.userSelectedAnswer && opt !== result.actualCorrectAnswer ? 'line-through text-destructive' : ''}
                          `}
                        >
                          {opt}
                           {opt === result.actualCorrectAnswer && <CheckCircle className="inline-block ml-1 h-3 w-3 text-green-500" />}
                           {opt === result.userSelectedAnswer && opt !== result.actualCorrectAnswer && <XCircle className="inline-block ml-1 h-3 w-3 text-red-500" />}
                        </li>
                      ))}
                    </ul>
                  </div>

                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button onClick={onRetakeTest} className="w-full text-lg py-6" variant="outline">
          <RotateCcw className="mr-2 h-5 w-5" />
          Take Another Test
        </Button>
      </CardFooter>
    </Card>
  );
}
