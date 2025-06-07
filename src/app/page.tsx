
"use client";

import type { QuestionType, ScoreSummary, TestResultItem } from "@/types";
import { useState, useCallback, useEffect } from "react"; // Added useEffect for potential future use if needed
import { Header } from "@/components/layout/header";
import { FileUploadStep } from "@/components/steps/file-upload-step";
import { QuestionPreviewStep } from "@/components/steps/question-preview-step";
import { TestTakingStep } from "@/components/steps/test-taking-step";
import { ScoringOptionsStep } from "@/components/steps/scoring-options-step";
import { ResultsStep } from "@/components/steps/results-step";
import { LanguageSelectionStep } from "@/components/steps/language-selection-step";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { extractQuestions, type ExtractQuestionsOutput } from "@/ai/flows/extract-questions";
import { scoreTestWithAI, type ScoreTestWithAIInput, type Question as AIScoreQuestion } from "@/ai/flows/score-test";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type AppStep = 'upload' | 'language_selection' | 'previewing_questions' | 'taking_test' | 'awaiting_scoring_choice' | 'results';

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

  const processExtractedQuestions = useCallback((aiResult: ExtractQuestionsOutput) => {
    if (!aiResult || typeof aiResult !== 'object' || !aiResult.questions || !Array.isArray(aiResult.questions)) {
      console.error("Invalid aiResult structure in processExtractedQuestions:", aiResult);
      setError("Received an unexpected data structure from AI. Cannot process questions.");
      // setIsLoading(false) is handled by the caller's finally block
      return;
    }

    if (aiResult.questions.length === 0) {
      setError("AI could not extract any questions based on the current settings. Please try a different file or ensure the content has clear multiple-choice questions in the selected language.");
      setQuestions([]); // Ensure questions are cleared if none are found
      setCurrentStep('previewing_questions'); // Still go to preview to show "no questions"
      return;
    }
    
    setError(null); // Clear previous errors if questions are found
    const formattedQuestions: QuestionType[] = aiResult.questions.map((q) => ({
      id: crypto.randomUUID(),
      questionText: q.question,
      options: q.options,
      aiAssignedAnswer: q.answer,
    }));
    setQuestions(formattedQuestions);
    setCurrentStep('previewing_questions');
  }, [setQuestions, setCurrentStep, setError]);

  const handleFileProcessed = useCallback(async (text: string) => {
    setExtractedText(text);
    setError(null);
    setIsLoading(true);
    try {
      const initialAiResult: ExtractQuestionsOutput = await extractQuestions({ text });

      if (!initialAiResult || typeof initialAiResult !== 'object') {
        console.error("AI extraction returned invalid data structure:", initialAiResult);
        throw new Error("AI service returned an unexpected data format.");
      }

      if (initialAiResult.requiresLanguageChoice) {
        setCurrentStep('language_selection');
      } else {
        processExtractedQuestions(initialAiResult);
      }
    } catch (e) {
      console.error("AI extraction error (initial):", e);
      setError(`Failed to process file with AI: ${(e as Error).message}`);
      toast({ title: "AI Processing Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, processExtractedQuestions, setExtractedText, setCurrentStep, setError, setIsLoading]);

  const handleLanguageSelected = useCallback(async (language: 'en' | 'hi') => {
    if (!extractedText) {
      setError("Extracted text not found. Please re-upload the file.");
      setCurrentStep('upload');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const aiResult: ExtractQuestionsOutput = await extractQuestions({ text: extractedText, preferredLanguage: language });
      
      if (!aiResult || typeof aiResult !== 'object') {
        console.error("AI extraction with language preference returned invalid data structure:", aiResult);
        throw new Error("AI service returned an unexpected data format after language selection.");
      }
      
      processExtractedQuestions(aiResult);
    } catch (e) {
      console.error("AI extraction error (with language preference):", e);
      setError(`Failed to extract questions in the selected language: ${(e as Error).message}`);
      toast({ title: "AI Extraction Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [extractedText, toast, processExtractedQuestions, setCurrentStep, setError, setIsLoading]);

  const handleStartTest = useCallback(() => {
    setCurrentStep('taking_test');
    setError(null);
  }, [setCurrentStep, setError]);

  const handleSubmitTest = useCallback((answers: Record<string, string>) => {
    setUserTestAnswers(answers);
    setCurrentStep('awaiting_scoring_choice');
    setError(null);
  }, [setUserTestAnswers, setCurrentStep, setError]);

  const handleScoreWithAI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const aiScoreInput: ScoreTestWithAIInput = {
        questions: questions.map(q => ({
          question: q.questionText,
          options: q.options,
          answer: q.aiAssignedAnswer || null,
          userAnswer: userTestAnswers[q.id] || null,
        } as AIScoreQuestion)),
      };
      const aiScoreResult = await scoreTestWithAI(aiScoreInput);
      
      const updatedQuestions = questions.map((q) => {
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
  }, [questions, userTestAnswers, toast, setIsLoading, setError, setQuestions, setScoreDetails, setCurrentStep]);

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
  }, [questions, userTestAnswers, toast, setIsLoading, setError, setQuestions, setScoreDetails, setCurrentStep]);


  const renderStepContent = () => {
    if (isLoading) {
      let message = "Processing...";
      if (currentStep === 'upload' && !extractedText) message = "Processing file...";
      if ((currentStep === 'upload' || currentStep === 'language_selection') && extractedText && questions.length === 0 && !error) message = "Extracting questions with AI...";
      if (currentStep === 'awaiting_scoring_choice') message = "Scoring test with AI...";
      return <LoadingSpinner message={message} />;
    }

    if (error && (currentStep === 'upload' || currentStep === 'language_selection' || currentStep === 'previewing_questions' || currentStep === 'awaiting_scoring_choice' )) {
      return (
        <Alert variant="destructive" className="w-full max-w-xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }
    
    // Specific error display for previewing_questions if error exists but questions also exist (e.g. partial error)
    // Or if error is specifically "AI could not extract..."
    if (error && currentStep === 'previewing_questions' && questions.length === 0) {
       return (
        <Alert variant="destructive" className="w-full max-w-xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Extracting Questions</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }


    switch (currentStep) {
      case 'upload':
        return <FileUploadStep onFileProcessed={handleFileProcessed} setIsLoadingGlobally={setIsLoading} />;
      case 'language_selection':
        return <LanguageSelectionStep onSelectLanguage={handleLanguageSelected} />;
      case 'previewing_questions':
        // If questions are empty but no explicit error state from above, QuestionPreviewStep handles "No Questions Extracted"
        return <QuestionPreviewStep questions={questions} onStartTest={handleStartTest} />;
      case 'taking_test':
        return <TestTakingStep questions={questions} onSubmitTest={handleSubmitTest} />;
      case 'awaiting_scoring_choice':
        return <ScoringOptionsStep onScoreWithAI={handleScoreWithAI} onUploadKeyAndScore={handleUploadKeyAndScore} setIsLoadingGlobally={setIsLoading} />;
      case 'results':
        if (error && !scoreDetails) { // Error during scoring, results not available
             return (
                <Alert variant="destructive" className="w-full max-w-xl mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Scoring Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                </Alert>
            );
        }
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

