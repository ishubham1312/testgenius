
"use client";

import type { ScoreSummary } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, RotateCcw, TimerIcon, MinusCircle, Repeat, PlusCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface ResultsStepProps {
  scoreSummary: ScoreSummary;
  onCreateNewTest: () => void;
  onRetakeCurrentTest: () => void;
}

export function ResultsStep({ scoreSummary, onCreateNewTest, onRetakeCurrentTest }: ResultsStepProps) {
  const { score, totalQuestions, results, testConfiguration } = scoreSummary;
  const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

  const getResultColor = (isCorrect: boolean) => {
    return isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };
  const getResultIcon = (isCorrect: boolean) => {
    return isCorrect ? <CheckCircle className="inline-block mr-2 h-5 w-5" /> : <XCircle className="inline-block mr-2 h-5 w-5" />;
  };

  const correctAnswersCount = results.filter(r => r.isCorrect).length;
  const incorrectAnswersCount = results.filter(r => !r.isCorrect && r.userSelectedAnswer !== null).length;
  const unattemptedCount = totalQuestions - correctAnswersCount - incorrectAnswersCount;

  return (
    <Card className="w-full max-w-3xl shadow-xl">
      <CardHeader className="items-center">
        <CardTitle className="font-headline text-4xl">Test Results</CardTitle>
        <CardDescription className="text-lg">
          Your final score is <span className="font-bold text-primary">{score.toFixed(2)}</span> out of {totalQuestions}.
        </CardDescription>
        
        <div className="w-full max-w-md pt-4">
           <Progress value={Math.max(0, percentage)} className="h-4" /> {/* Ensure progress isn't negative */}
           <p className="text-center text-2xl font-semibold mt-2 text-primary">{Math.max(0, percentage).toFixed(1)}%</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center mt-4 text-sm w-full max-w-xl">
            <div className="p-2 border rounded-md">
                <p className="font-semibold">Total</p>
                <p>{totalQuestions}</p>
            </div>
            <div className="p-2 border rounded-md">
                <p className="font-semibold text-green-600 dark:text-green-400">Correct</p>
                <p className="text-green-600 dark:text-green-400">{correctAnswersCount}</p>
            </div>
            <div className="p-2 border rounded-md">
                <p className="font-semibold text-red-600 dark:text-red-400">Incorrect</p>
                <p className="text-red-600 dark:text-red-400">{incorrectAnswersCount}</p>
            </div>
            <div className="p-2 border rounded-md">
                <p className="font-semibold text-muted-foreground">Unattempted</p>
                <p className="text-muted-foreground">{unattemptedCount}</p>
            </div>
        </div>
        
        {testConfiguration && (
          <div className="mt-4 space-y-1 text-xs text-muted-foreground text-center">
            {testConfiguration.isTimedTest && (
              <Badge variant="outline" className="mr-2">
                <TimerIcon className="h-3 w-3 mr-1" /> Timed: {testConfiguration.durationMinutes} min
              </Badge>
            )}
            {testConfiguration.enableNegativeMarking && (
              <Badge variant="outline" className="bg-destructive/10 border-destructive text-destructive">
                <MinusCircle className="h-3 w-3 mr-1" /> Negative Marking: -{testConfiguration.negativeMarkValue}
              </Badge>
            )}
          </div>
        )}

      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-semibold mb-4 font-headline text-center">Detailed Breakdown:</h3>
        <ScrollArea className="h-[300px] md:h-[400px] pr-4">
          <Accordion type="single" collapsible className="w-full">
            {results.map((result, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className={`hover:no-underline ${getResultColor(result.isCorrect)}`}>
                  <span className="flex items-center text-left">
                    {getResultIcon(result.isCorrect)}
                    <span className="font-medium" style={{ whiteSpace: 'pre-line' }}>Question {index + 1}: {result.questionText}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 pl-6">
                  <p className="text-left"><strong>Your Answer:</strong> <span style={{ whiteSpace: 'pre-line' }} className={result.userSelectedAnswer === result.actualCorrectAnswer ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}>{result.userSelectedAnswer || "Not Answered"}</span></p>
                  <p className="text-left"><strong>Correct Answer:</strong> <span style={{ whiteSpace: 'pre-line' }} className="text-blue-600 dark:text-blue-400">{result.actualCorrectAnswer}</span></p>
                  
                  <div className="mt-2 text-left">
                    <p className="text-sm font-medium mb-1">Options:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 text-left">
                      {result.options.map((opt, optIndex) => (
                        <li key={optIndex}
                          style={{ whiteSpace: 'pre-line' }}
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
      <CardFooter className="flex flex-col sm:flex-row justify-center gap-4">
        <Button onClick={onRetakeCurrentTest} className="w-full text-lg py-3" variant="default">
          <Repeat className="mr-2 h-5 w-5" />
          Retake This Test
        </Button>
        <Button onClick={onCreateNewTest} className="w-full text-lg py-3" variant="outline">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Test
        </Button>
      </CardFooter>
    </Card>
  );
}


    
