
"use client";

import type { QuestionType } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, ChevronLeft, ChevronRight, LayoutPanelLeft } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface TestTakingStepProps {
  questions: QuestionType[];
  onSubmitTest: (answers: Record<string, string>) => void;
}

export function TestTakingStep({ questions, onSubmitTest }: TestTakingStepProps) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [viewedQuestions, setViewedQuestions] = useState<Set<string>>(new Set());
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const answeredCount = Object.keys(userAnswers).length;
    setProgress(questions.length > 0 ? (answeredCount / questions.length) * 100 : 0);
  }, [userAnswers, questions.length]);

  useEffect(() => {
    if (questions.length > 0 && questions[0]) {
       setViewedQuestions(prev => new Set(prev).add(questions[0].id));
    } else if (questions.length === 0) {
      setViewedQuestions(new Set()); // Clear if no questions
    }
  }, [questions]);

  useEffect(() => {
    if (currentQuestion) {
      setViewedQuestions(prev => {
        if (!prev.has(currentQuestion.id)) {
          return new Set(prev).add(currentQuestion.id);
        }
        return prev;
      });
    }
  }, [currentQuestion]);

  const handleAnswerChange = (questionId: string, selectedOption: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  };

  const navigateToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      setIsMobilePaletteOpen(false); 
    }
  }, [questions.length]);

  const goToNextQuestion = () => {
    navigateToQuestion(currentQuestionIndex + 1);
  };

  const goToPreviousQuestion = () => {
    navigateToQuestion(currentQuestionIndex - 1);
  };
  
  const handleSubmit = () => {
    onSubmitTest(userAnswers);
    setIsMobilePaletteOpen(false); // Close palette on submit
  };

  const getPaletteButtonClasses = (questionId: string, index: number) => {
    const isAnswered = userAnswers[questionId] !== undefined;
    const isViewed = viewedQuestions.has(questionId);
    const isActive = index === currentQuestionIndex;

    return cn(
      "h-10 w-10 flex items-center justify-center p-1 text-xs sm:text-sm rounded-md border transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      isActive && "ring-2 ring-primary shadow-lg scale-105 z-10",
      isAnswered && "bg-green-100 dark:bg-green-700/30 border-green-500/70 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-700/40", 
      isViewed && !isAnswered && "bg-red-100 dark:bg-red-700/30 border-red-500/70 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-700/40", 
      !isViewed && !isAnswered && "bg-card hover:bg-accent/50 text-card-foreground" 
    );
  };

  const renderPaletteGrid = () => (
    <div className="grid grid-cols-5 gap-2">
      {questions.map((q, index) => (
        <Button
          key={q.id}
          onClick={() => navigateToQuestion(index)}
          className={getPaletteButtonClasses(q.id, index)}
          title={`Go to Question ${index + 1}`}
          variant="outline"
          size="icon"
        >
          {index + 1}
        </Button>
      ))}
    </div>
  );

  const canSubmitTest = questions.length > 0; // Button is enabled if there are questions

  return (
    <Card className="w-full max-w-4xl shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-center">Mock Test</CardTitle>
        <CardDescription className="text-center">
          Answer the questions to the best of your ability.
        </CardDescription>
        <div className="pt-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center mt-1">
            {Object.keys(userAnswers).length} / {questions.length} questions answered
          </p>
        </div>
      </CardHeader>
      <CardContent className="min-h-[450px] flex flex-col md:flex-row gap-6 p-4 sm:p-6">
        <div className="flex-1 order-2 md:order-1">
          {currentQuestion && (
            <div key={currentQuestion.id} className="space-y-6 h-full flex flex-col">
              <div>
                <h3 className="text-xl font-semibold font-headline">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h3>
                <p className="text-lg leading-relaxed mt-2">{currentQuestion.questionText}</p>
              </div>
              <ScrollArea className="flex-grow pr-2">
                <RadioGroup
                  onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                  value={userAnswers[currentQuestion.id]}
                  className="space-y-3"
                >
                  {currentQuestion.options.map((option, optIndex) => (
                    <div 
                      key={optIndex} 
                      className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary"
                    >
                      <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${optIndex}`} />
                      <Label htmlFor={`${currentQuestion.id}-option-${optIndex}`} className="text-base cursor-pointer flex-1">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </ScrollArea>
            </div>
          )}
           {!currentQuestion && questions.length > 0 && (
             <p className="text-center text-muted-foreground">Select a question to begin.</p>
           )}
           {questions.length === 0 && (
              <p className="text-center text-muted-foreground">No questions available for this test.</p>
           )}
        </div>

        <div className="hidden md:flex md:flex-shrink-0 w-full md:w-[15rem] lg:w-[18rem] order-1 md:order-2 md:border-l md:pl-4 lg:pl-6 flex-col">
          <h4 className="text-md font-semibold mb-3 font-headline text-center">Question Palette</h4>
          <ScrollArea className="flex-grow mt-1 pr-1 min-h-[150px] md:min-h-0">
            {renderPaletteGrid()}
          </ScrollArea>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4 pt-6">
        <div className="md:hidden w-full flex justify-center mb-2 sm:mb-0">
          <Sheet open={isMobilePaletteOpen} onOpenChange={setIsMobilePaletteOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto"> <LayoutPanelLeft className="mr-2 h-4 w-4" /> Question Palette</Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] flex flex-col p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle className="text-center">Question Palette</SheetTitle>
              </SheetHeader>
              <ScrollArea className="flex-grow">
                <div className="p-4">
                 {renderPaletteGrid()}
                </div>
              </ScrollArea>
              <SheetFooter className="p-4 border-t">
                <Button 
                  onClick={handleSubmit} 
                  className="w-full" 
                  disabled={!canSubmitTest}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  End Test
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-2 w-full">
            <div className="flex gap-2 w-full sm:w-auto">
                <Button onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0 || questions.length === 0} variant="outline" className="flex-1 sm:flex-none">
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                </Button>
                <Button onClick={goToNextQuestion} disabled={currentQuestionIndex === questions.length - 1 || questions.length === 0} variant="outline" className="flex-1 sm:flex-none">
                Next <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
            <Button onClick={handleSubmit} className="w-full sm:w-auto text-lg py-3 sm:py-2" disabled={!canSubmitTest}>
                <CheckCircle className="mr-2 h-5 w-5" />
                Submit Test
            </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

