"use client";

import type { QuestionType } from "@/types";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
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

  return (
    <Card className="w-full max-w-3xl shadow-xl">
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
      <CardContent className="min-h-[300px]">
        {currentQuestion && (
          <div key={currentQuestion.id} className="space-y-6">
            <h3 className="text-xl font-semibold font-headline">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h3>
            <p className="text-lg">{currentQuestion.questionText}</p>
            <RadioGroup
              onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
              value={userAnswers[currentQuestion.id]}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, optIndex) => (
                <div key={optIndex} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-accent/50 transition-colors">
                  <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${optIndex}`} />
                  <Label htmlFor={`${currentQuestion.id}-option-${optIndex}`} className="text-base cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
        <Button onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0} variant="outline" className="flex-1 sm:flex-none">
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={goToNextQuestion} disabled={currentQuestionIndex === questions.length - 1} variant="outline" className="flex-1 sm:flex-none">
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
        </div>
        <Button onClick={handleSubmit} className="w-full sm:w-auto text-lg py-3" disabled={Object.keys(userAnswers).length !== questions.length}>
          <CheckCircle className="mr-2 h-5 w-5" />
          Submit Test
        </Button>
      </CardFooter>
    </Card>
  );
}
