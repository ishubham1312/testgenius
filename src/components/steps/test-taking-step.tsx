
"use client";

import type { QuestionType } from "@/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, ChevronLeft, ChevronRight, Circle as UnansweredIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TestTakingStepProps {
  questions: QuestionType[];
  onSubmitTest: (answers: Record<string, string>) => void;
}

export function TestTakingStep({ questions, onSubmitTest }: TestTakingStepProps) {
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const answeredCount = Object.keys(userAnswers).length;
    setProgress((answeredCount / questions.length) * 100);
  }, [userAnswers, questions.length]);

  const handleAnswerChange = (questionId: string, selectedOption: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  };

  const currentQuestion = questions[currentQuestionIndex];

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  
  const handleSubmit = () => {
    onSubmitTest(userAnswers);
  };

  const handleNavigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

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
      <CardContent className="min-h-[400px] flex flex-col sm:flex-row gap-6 p-6">
        {/* Sidebar for Question Navigation */}
        <div className="w-full sm:w-48 md:w-56 sm:border-r sm:pr-4">
          <h4 className="text-md font-semibold mb-3 font-headline text-center sm:text-left">Question List</h4>
          <ScrollArea className="h-[320px] sm:h-[350px]">
            <div className="space-y-1">
              {questions.map((q, index) => {
                const isAnswered = userAnswers[q.id] !== undefined;
                const isActive = index === currentQuestionIndex;
                return (
                  <Button
                    key={q.id}
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start text-left h-auto py-2 px-3 ${isActive ? 'font-semibold ring-2 ring-primary' : ''}`}
                    onClick={() => handleNavigateToQuestion(index)}
                  >
                    {isAnswered ? (
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <UnansweredIcon className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate">Q {index + 1}</span>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Main Question Area */}
        <div className="flex-1 mt-4 sm:mt-0 sm:pl-4">
          {currentQuestion && (
            <div key={currentQuestion.id} className="space-y-6">
              <h3 className="text-xl font-semibold font-headline">
                Question {currentQuestionIndex + 1} of {questions.length}
              </h3>
              <p className="text-lg leading-relaxed">{currentQuestion.questionText}</p>
              <RadioGroup
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                value={userAnswers[currentQuestion.id]}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent/50 transition-colors cursor-pointer has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary">
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${optIndex}`} />
                    <Label htmlFor={`${currentQuestion.id}-option-${optIndex}`} className="text-base cursor-pointer flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
           {!currentQuestion && questions.length > 0 && (
             <p className="text-center text-muted-foreground">Select a question to begin.</p>
           )}
           {questions.length === 0 && (
              <p className="text-center text-muted-foreground">No questions available for this test.</p>
           )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
        <div className="flex gap-2 w-full sm:w-auto">
        <Button onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0 || questions.length === 0} variant="outline" className="flex-1 sm:flex-none">
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={goToNextQuestion} disabled={currentQuestionIndex === questions.length - 1 || questions.length === 0} variant="outline" className="flex-1 sm:flex-none">
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
        </div>
        <Button onClick={handleSubmit} className="w-full sm:w-auto text-lg py-3" disabled={Object.keys(userAnswers).length !== questions.length || questions.length === 0}>
          <CheckCircle className="mr-2 h-5 w-5" />
          Submit Test
        </Button>
      </CardFooter>
    </Card>
  );
}

