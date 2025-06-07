"use client";

import type { QuestionType, ScoreSummary, TestResultItem } from "@/types";
import { useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { FileUploadStep } from "@/components/steps/file-upload-step";
import { QuestionPreviewStep } from "@/components/steps/question-preview-step";
import { TestTakingStep } from "@/components/steps/test-taking-step";
import { ScoringOptionsStep } from "@/components/steps/scoring-options-step";
import { ResultsStep } from "@/components/steps/results-step";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { extractQuestions, type ExtractQuestionsOutput } from "@/ai/flows/extract-questions";
import { scoreTestWithAI, type ScoreTestWithAIInput, type Question as AIScoreQuestion } from "@/ai/flows/score-test";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type AppStep = 'upload' | 'previewing_questions' | 'taking_test' | 'awaiting_scoring_choice' | 'results';

export default function TestGeniusPage() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [userTestAnswers, setUserTestAnswers] = useState<Record<string, string>>({}); // { questionId: selectedOptionText }
  const [scoreDetails, setScoreDetails] = useState<ScoreSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const resetState = () => {
    setCurrentStep('upload');
    setExtractedText(null);
    setQuestions([]);
    setUserTestAnswers({});
    setScoreDetails(null);
    setIsLoading(false);
    setError(null);
  };

  const handleFileProcessed = useCallback(async (text: string) => {
    setExtractedText(text);
    setError(null);
    setIsLoading(true);
    try {
      const aiResult: ExtractQuestionsOutput = await extractQuestions({ text });
      if (!aiResult || aiResult.length === 0) {
        setError("AI could not extract any questions from the provided text. Please try a different file or ensure the content has clear multiple-choice questions.");
        setIsLoading(false);
        return;
      }
      const formattedQuestions: QuestionType[] = aiResult.map((q, index) => ({
        id: crypto.randomUUID(),
        questionText: q.question,
        options: q.options,
        aiAssignedAnswer: q.answer,
      }));
      setQuestions(formattedQuestions);
      setCurrentStep('previewing_questions');
    } catch (e) {
      console.error("AI extraction error:", e);
      setError(`Failed to extract questions using AI: ${(e as Error).message}`);
      toast({ title: "AI Extraction Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleStartTest = useCallback(() => {
    setCurrentStep('taking_test');
    setError(null);
  }, []);

  const handleSubmitTest = useCallback((answers: Record<string, string>) => {
    setUserTestAnswers(answers);
    setCurrentStep('awaiting_scoring_choice');
    setError(null);
  }, []);

  const handleScoreWithAI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const aiScoreInput: ScoreTestWithAIInput = {
        questions: questions.map(q => ({
          question: q.questionText,
          options: q.options,
          answer: q.aiAssignedAnswer || null, // Use AI's initial guess or null
          userAnswer: userTestAnswers[q.id] || null,
        } as AIScoreQuestion)),
      };
      const aiScoreResult = await scoreTestWithAI(aiScoreInput);
      
      const updatedQuestions = questions.map((q, index) => {
        const resultItem = aiScoreResult.results.find(r => r.question === q.questionText);
        return {
          ...q,
          userSelectedAnswer: userTestAnswers[q.id] || null,
          actualCorrectAnswer: resultItem?.correctAnswer || "N/A",
          isCorrect: resultItem?.isCorrect || false,
        };
      });
      setQuestions(updatedQuestions);

      setScoreDetails({
        score: aiScoreResult.score,
        totalQuestions: aiScoreResult.totalQuestions,
        results: aiScoreResult.results.map(r => ({
          questionText: r.question,
          userSelectedAnswer: r.userAnswer,
          actualCorrectAnswer: r.correctAnswer,
          isCorrect: r.isCorrect,
          options: questions.find(q => q.questionText === r.question)?.options || [],
        })),
      });
      setCurrentStep('results');
    } catch (e) {
      console.error("AI scoring error:", e);
      setError(`Failed to score test using AI: ${(e as Error).message}`);
      toast({ title: "AI Scoring Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [questions, userTestAnswers, toast]);

  const handleUploadKeyAndScore = useCallback((keyAnswers: string[]) => {
    setIsLoading(true);
    setError(null);
    if (keyAnswers.length !== questions.length) {
      setError(`Answer key has ${keyAnswers.length} answers, but there are ${questions.length} questions. Please ensure they match.`);
      toast({ title: "Answer Key Mismatch", description: `Key has ${keyAnswers.length} answers, test has ${questions.length}.`, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    let score = 0;
    const detailedResults: TestResultItem[] = [];

    const updatedQuestions = questions.map((q, index) => {
      const correctAnswer = keyAnswers[index];
      const userAnswer = userTestAnswers[q.id] || null;
      const isCorrect = userAnswer === correctAnswer;
      if (isCorrect) score++;
      
      detailedResults.push({
        questionText: q.questionText,
        userSelectedAnswer: userAnswer,
        actualCorrectAnswer: correctAnswer,
        isCorrect: isCorrect,
        options: q.options,
      });

      return {
        ...q,
        userSelectedAnswer: userAnswer,
        actualCorrectAnswer: correctAnswer,
        isCorrect: isCorrect,
      };
    });
    
    setQuestions(updatedQuestions);
    setScoreDetails({
      score,
      totalQuestions: questions.length,
      results: detailedResults,
    });
    setCurrentStep('results');
    setIsLoading(false);
  }, [questions, userTestAnswers, toast]);


  const renderStepContent = () => {
    if (isLoading) {
      let message = "Processing...";
      if (currentStep === 'upload' || (extractedText && questions.length === 0)) message = "Extracting questions with AI...";
      if (currentStep === 'awaiting_scoring_choice') message = "Scoring test with AI...";
      return <LoadingSpinner message={message} />;
    }

    if (error) {
      return (
        <Alert variant="destructive" className="w-full max-w-xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    switch (currentStep) {
      case 'upload':
        return <FileUploadStep onFileProcessed={handleFileProcessed} setIsLoadingGlobally={setIsLoading} />;
      case 'previewing_questions':
        return <QuestionPreviewStep questions={questions} onStartTest={handleStartTest} />;
      case 'taking_test':
        return <TestTakingStep questions={questions} onSubmitTest={handleSubmitTest} />;
      case 'awaiting_scoring_choice':
        return <ScoringOptionsStep onScoreWithAI={handleScoreWithAI} onUploadKeyAndScore={handleUploadKeyAndScore} setIsLoadingGlobally={setIsLoading} />;
      case 'results':
        if (!scoreDetails) return <p>Error: Score details not available.</p>;
        return <ResultsStep scoreSummary={scoreDetails} onRetakeTest={resetState} />;
      default:
        return <p>Unknown step.</p>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {renderStepContent()}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} TestGenius. Powered by AI.</p>
      </footer>
    </div>
  );
}
