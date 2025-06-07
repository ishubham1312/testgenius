
"use client";

import type { TestSessionDetails } from "@/types";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, ChevronLeft, ChevronRight, Menu, TimerIcon, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TestTakingStepProps {
  testSessionDetails: TestSessionDetails;
  onSubmitTest: (answers: Record<string, string>) => void;
}

export function TestTakingStep({ testSessionDetails, onSubmitTest }: TestTakingStepProps) {
  const { questions, testConfiguration } = testSessionDetails;
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [viewedQuestions, setViewedQuestions] = useState<Set<string>>(new Set());

  const [timeLeft, setTimeLeft] = useState<number | null>(
    testConfiguration.isTimedTest ? testConfiguration.durationMinutes * 60 : null
  );
  const [isTimerRunning, setIsTimerRunning] = useState(testConfiguration.isTimedTest);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);


  const currentQuestion = questions[currentQuestionIndex];

  const submitTestHandler = useCallback(() => {
    setIsTimerRunning(false); // Important: stop the timer
    onSubmitTest(userAnswers);
  }, [onSubmitTest, userAnswers]);

  useEffect(() => {
    const answeredCount = Object.keys(userAnswers).length;
    setProgressValue((answeredCount / questions.length) * 100);
  }, [userAnswers, questions.length]);

  useEffect(() => {
    if (questions.length > 0 && currentQuestion && !viewedQuestions.has(currentQuestion.id)) {
       setViewedQuestions(prev => new Set(prev).add(currentQuestion.id));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]); 

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeLeft !== null && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(prevTime => (prevTime !== null && prevTime > 0 ? prevTime - 1 : 0));
      }, 1000);
      return () => clearInterval(timerId);
    } else if (timeLeft === 0 && isTimerRunning) { 
      setIsTimerRunning(false); 
      submitTestHandler();
    }
  }, [isTimerRunning, timeLeft, submitTestHandler]);


  const handleAnswerChange = (questionId: string, selectedOption: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  };

  const navigateToQuestion = useCallback((index: number) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
      setIsPaletteOpen(false); 
      if (questions[index] && !viewedQuestions.has(questions[index].id)) {
        setViewedQuestions(prev => new Set(prev).add(questions[index].id));
      }
    }
  }, [questions, viewedQuestions]);

  const goToNextQuestion = () => {
    navigateToQuestion(currentQuestionIndex + 1);
  };

  const goToPreviousQuestion = () => {
    navigateToQuestion(currentQuestionIndex - 1);
  };
  
  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPaletteButtonClasses = (questionId: string, index: number) => {
    const isAnswered = userAnswers[questionId] !== undefined;
    const isViewed = viewedQuestions.has(questionId);
    const isActive = index === currentQuestionIndex;

    return cn(
      "h-10 w-10 flex items-center justify-center p-1 text-xs sm:text-sm rounded-md border transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      isActive && "ring-2 ring-border shadow-lg scale-105 z-10", // Changed ring-primary to ring-border
      isAnswered && "bg-green-100 dark:bg-green-700/30 border-green-500/70 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-700/40", 
      !isAnswered && isViewed && "bg-red-100 dark:bg-red-700/30 border-red-500/70 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-700/40",
      !isAnswered && !isViewed && "bg-card hover:bg-accent/80 text-card-foreground"
    );
  };

  const QuestionPaletteContent = () => (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow mt-1 pr-1 min-h-[150px] md:min-h-0">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, index) => (
            <Button
              key={q.id}
              onClick={() => navigateToQuestion(index)}
              className={getPaletteButtonClasses(q.id, index)}
              title={`Go to Question ${index + 1}`}
            >
              {index + 1}
            </Button>
          ))}
        </div>
      </ScrollArea>
      <div className="mt-auto pt-4">
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full" disabled={questions.length === 0}>
                    End Test
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to end the test?</AlertDialogTitle>
                <AlertDialogDescription>
                    Your answers will be submitted for scoring. You cannot make any more changes.
                    {Object.keys(userAnswers).length !== questions.length && Object.keys(userAnswers).length < questions.length && " You have unanswered questions."}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={submitTestHandler}>Submit Test</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="font-headline text-3xl">Mock Test</CardTitle>
            {testConfiguration.isTimedTest && timeLeft !== null && (
                <div className="flex items-center gap-2 text-xl font-semibold text-primary">
                    <TimerIcon className="h-6 w-6" />
                    <span>{formatTime(timeLeft)}</span>
                </div>
            )}
        </div>
        <CardDescription className="text-center">
          Answer the questions to the best of your ability.
        </CardDescription>
        <div className="pt-2">
          <Progress value={progressValue} className="w-full h-2" />
          <p className="text-sm text-muted-foreground text-center mt-1">
            {Object.keys(userAnswers).length} / {questions.length} questions answered
          </p>
        </div>
      </CardHeader>
      <CardContent className="min-h-[450px] flex flex-col md:flex-row gap-6 p-4 sm:p-6">
        {/* Main Question Area */}
        <div className="flex-1 order-2 md:order-1">
          {currentQuestion && (
            <div key={currentQuestion.id} className="space-y-6 h-full flex flex-col">
              <div>
                <h3 className="text-xl font-semibold font-headline" style={{ whiteSpace: 'pre-line' }}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </h3>
                <p className="text-lg leading-relaxed mt-2" style={{ whiteSpace: 'pre-line' }}>{currentQuestion.questionText}</p>
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
                      <Label htmlFor={`${currentQuestion.id}-option-${optIndex}`} className="text-base cursor-pointer flex-1" style={{ whiteSpace: 'pre-line' }}>
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

        {/* Question Palette Area - Desktop */}
        <div className="hidden md:flex w-full md:w-[15rem] lg:w-[18rem] order-1 md:order-2 md:border-l md:pl-4 lg:pl-6 flex-col">
          <h4 className="text-md font-semibold mb-3 font-headline text-center">Question Palette</h4>
          <QuestionPaletteContent />
        </div>
      </CardContent>

      {/* Question Palette Trigger - Mobile */}
      <div className="md:hidden p-4 flex justify-center border-t">
          <Sheet open={isPaletteOpen} onOpenChange={setIsPaletteOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Menu className="mr-2 h-5 w-5" /> View Question Palette
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] flex flex-col"> {/* Increased height slightly */}
              <SheetHeader>
                <SheetTitle className="text-center">Question Palette</SheetTitle>
                 <SheetClose asChild>
                     <Button variant="ghost" size="icon" className="absolute right-4 top-4">
                        <X className="h-5 w-5" />
                    </Button>
                </SheetClose>
              </SheetHeader>
              <div className="flex-grow overflow-auto py-4">
                <QuestionPaletteContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>


      <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
        <div className="flex gap-2 w-full sm:w-auto">
        <Button onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0 || questions.length === 0} variant="outline" className="flex-1 sm:flex-none">
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={goToNextQuestion} disabled={currentQuestionIndex === questions.length - 1 || questions.length === 0} variant="outline" className="flex-1 sm:flex-none">
          Next <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full sm:w-auto text-lg py-3" disabled={questions.length === 0}>
              <CheckCircle className="mr-2 h-5 w-5" />
              Submit Test
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to submit the test?</AlertDialogTitle>
              <AlertDialogDescription>
                Your answers will be submitted for scoring. You cannot make any more changes.
                 {Object.keys(userAnswers).length !== questions.length && Object.keys(userAnswers).length < questions.length && " You have unanswered questions."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={submitTestHandler}>Submit Test</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </CardFooter>
    </Card>
  );
}

