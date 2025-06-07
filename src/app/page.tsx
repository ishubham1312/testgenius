
"use client";

import type { QuestionType, ScoreSummary, TestResultItem } from "@/types";
import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { FileUploadStep } from "@/components/steps/file-upload-step";
import { QuestionPreviewStep } from "@/components/steps/question-preview-step";
import { TestTakingStep } from "@/components/steps/test-taking-step";
import { ScoringOptionsStep } from "@/components/steps/scoring-options-step";
import { ResultsStep } from "@/components/steps/results-step";
import { LanguageSelectionStep } from "@/components/steps/language-selection-step";
import { GenerationMethodStep } from "@/components/steps/generation-method-step";
import { SyllabusUploadStep } from "@/components/steps/syllabus-upload-step";
import { SyllabusOptionsStep, type SyllabusGenerationOptions } from "@/components/steps/syllabus-options-step";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { extractQuestions, type ExtractQuestionsOutput } from "@/ai/flows/extract-questions";
import { generateQuestionsFromSyllabus, type GenerateQuestionsFromSyllabusInput, type GenerateQuestionsFromSyllabusOutput } from "@/ai/flows/generate-questions-from-syllabus";
import { scoreTestWithAI, type ScoreTestWithAIInput, type Question as AIScoreQuestion } from "@/ai/flows/score-test";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type AppStep = 
  | 'generation_method_selection'
  | 'upload_document' // Renamed from 'upload' for clarity
  | 'syllabus_upload'
  | 'syllabus_options'
  | 'language_selection'
  | 'previewing_questions'
  | 'taking_test'
  | 'awaiting_scoring_choice'
  | 'results';

export default function TestGeniusPage() {
  const [currentStep, setCurrentStep] = useState<AppStep>('generation_method_selection');
  const [generationMode, setGenerationMode] = useState<'extract_from_document' | 'generate_from_syllabus' | null>(null);
  
  const [extractedDocumentText, setExtractedDocumentText] = useState<string | null>(null);
  const [syllabusText, setSyllabusText] = useState<string | null>(null);
  const [syllabusOptions, setSyllabusOptions] = useState<SyllabusGenerationOptions | null>(null);

  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [userTestAnswers, setUserTestAnswers] = useState<Record<string, string>>({});
  const [scoreDetails, setScoreDetails] = useState<ScoreSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const resetState = useCallback(() => {
    setCurrentStep('generation_method_selection');
    setGenerationMode(null);
    setExtractedDocumentText(null);
    setSyllabusText(null);
    setSyllabusOptions(null);
    setQuestions([]);
    setUserTestAnswers({});
    setScoreDetails(null);
    setIsLoading(false);
    setError(null);
  }, []);

  const processAIQuestionsOutput = useCallback((aiResult: ExtractQuestionsOutput | GenerateQuestionsFromSyllabusOutput) => {
    if (!aiResult || typeof aiResult !== 'object' || !aiResult.questions || !Array.isArray(aiResult.questions)) {
      console.error("Invalid aiResult structure in processAIQuestionsOutput:", aiResult);
      setError("Received an unexpected data structure from AI. Cannot process questions.");
      return;
    }

    if (aiResult.questions.length === 0) {
      setError("AI could not extract or generate any questions based on the current settings. Please try different options, a different file, or ensure the content has clear multiple-choice questions in the selected language.");
      setQuestions([]);
      setCurrentStep('previewing_questions');
      return;
    }
    
    setError(null);
    const formattedQuestions: QuestionType[] = aiResult.questions.map((q) => ({
      id: crypto.randomUUID(),
      questionText: q.question,
      options: q.options,
      aiAssignedAnswer: q.answer,
    }));
    setQuestions(formattedQuestions);
    setCurrentStep('previewing_questions');
  }, [setQuestions, setCurrentStep, setError]);


  const handleDocumentFileProcessed = useCallback(async (text: string) => {
    setExtractedDocumentText(text);
    setError(null);
    setIsLoading(true);
    try {
      const initialAiResult = await extractQuestions({ text });

      if (!initialAiResult || typeof initialAiResult !== 'object') {
        console.error("AI extraction returned invalid data structure:", initialAiResult);
        throw new Error("AI service returned an unexpected data format.");
      }

      if (initialAiResult.requiresLanguageChoice) {
        setCurrentStep('language_selection');
      } else {
        processAIQuestionsOutput(initialAiResult);
      }
    } catch (e) {
      console.error("AI extraction error (initial):", e);
      setError(`Failed to process document with AI: ${(e as Error).message}`);
      toast({ title: "AI Processing Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, processAIQuestionsOutput, setExtractedDocumentText, setCurrentStep, setError, setIsLoading]);

  const handleSyllabusFileProcessed = useCallback((text: string) => {
    setSyllabusText(text);
    setCurrentStep('syllabus_options');
    setError(null);
  }, [setSyllabusText, setCurrentStep, setError]);

  const handleSyllabusOptionsSubmit = useCallback(async (options: SyllabusGenerationOptions) => {
    if (!syllabusText) {
      setError("Syllabus text not found. Please re-upload the syllabus.");
      setCurrentStep('syllabus_upload');
      return;
    }
    setSyllabusOptions(options);
    setError(null);
    setIsLoading(true);
    try {
      const input: GenerateQuestionsFromSyllabusInput = {
        syllabusText,
        numQuestions: options.numQuestions,
        difficultyLevel: options.difficultyLevel,
        // preferredLanguage: options.preferredLanguage // Assuming preferredLanguage is part of SyllabusGenerationOptions if needed
      };
      const aiResult = await generateQuestionsFromSyllabus(input);

      if (!aiResult || typeof aiResult !== 'object') {
        console.error("AI generation returned invalid data structure:", aiResult);
        throw new Error("AI service returned an unexpected data format during generation.");
      }
      
      if (aiResult.requiresLanguageChoice) {
         // If AI needs language choice even for generation, go to language selection.
         // This might happen if syllabus is very mixed and no preferred lang was set in options.
        setCurrentStep('language_selection');
      } else {
        processAIQuestionsOutput(aiResult);
      }

    } catch (e) {
      console.error("AI generation error:", e);
      setError(`Failed to generate questions from syllabus: ${(e as Error).message}`);
      toast({ title: "AI Generation Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [syllabusText, toast, processAIQuestionsOutput, setCurrentStep, setError, setIsLoading, setSyllabusOptions]);


  const handleLanguageSelected = useCallback(async (language: 'en' | 'hi') => {
    setError(null);
    setIsLoading(true);
    try {
      let aiResult: ExtractQuestionsOutput | GenerateQuestionsFromSyllabusOutput;

      if (generationMode === 'extract_from_document') {
        if (!extractedDocumentText) {
          setError("Extracted document text not found. Please re-upload the file.");
          setCurrentStep('upload_document');
          setIsLoading(false);
          return;
        }
        aiResult = await extractQuestions({ text: extractedDocumentText, preferredLanguage: language });
      } else if (generationMode === 'generate_from_syllabus') {
        if (!syllabusText || !syllabusOptions) {
          setError("Syllabus text or options not found. Please restart the syllabus generation process.");
          setCurrentStep('syllabus_upload');
          setIsLoading(false);
          return;
        }
        aiResult = await generateQuestionsFromSyllabus({ 
          syllabusText, 
          numQuestions: syllabusOptions.numQuestions,
          difficultyLevel: syllabusOptions.difficultyLevel,
          preferredLanguage: language 
        });
      } else {
        throw new Error("Invalid generation mode for language selection.");
      }
      
      if (!aiResult || typeof aiResult !== 'object') {
        console.error("AI operation with language preference returned invalid data structure:", aiResult);
        throw new Error("AI service returned an unexpected data format after language selection.");
      }
      
      processAIQuestionsOutput(aiResult);

    } catch (e) {
      console.error("AI error (with language preference):", e);
      setError(`Failed to process with selected language: ${(e as Error).message}`);
      toast({ title: "AI Processing Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [extractedDocumentText, syllabusText, syllabusOptions, generationMode, toast, processAIQuestionsOutput, setCurrentStep, setError, setIsLoading]);


  const handleGenerationMethodSelect = (method: 'extract_from_document' | 'generate_from_syllabus') => {
    setGenerationMode(method);
    if (method === 'extract_from_document') {
      setCurrentStep('upload_document');
    } else {
      setCurrentStep('syllabus_upload');
    }
    setError(null);
  };

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
      if ((currentStep === 'upload_document' && !extractedDocumentText) || (currentStep === 'syllabus_upload' && !syllabusText) ) message = "Processing file...";
      if (
        (currentStep === 'upload_document' || currentStep === 'syllabus_options' || currentStep === 'language_selection') && 
        (extractedDocumentText || syllabusText) && questions.length === 0 && !error
      ) {
         message = generationMode === 'generate_from_syllabus' ? "Generating questions with AI..." : "Extracting questions with AI...";
      }
      if (currentStep === 'awaiting_scoring_choice') message = "Scoring test with AI...";
      return <LoadingSpinner message={message} />;
    }

    const commonErrorSteps: AppStep[] = ['upload_document', 'syllabus_upload', 'syllabus_options', 'language_selection', 'previewing_questions', 'awaiting_scoring_choice'];
    if (error && commonErrorSteps.includes(currentStep) ) {
      // Handle specific error messages for question extraction/generation failure
      if (currentStep === 'previewing_questions' && questions.length === 0) {
        return (
          <Alert variant="destructive" className="w-full max-w-xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Processing Content</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        );
      }
      // Generic error display for other applicable steps
      if (currentStep !== 'previewing_questions') { // Avoid double display for previewing if questions are empty
         return (
            <Alert variant="destructive" className="w-full max-w-xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            </Alert>
        );
      }
    }

    switch (currentStep) {
      case 'generation_method_selection':
        return <GenerationMethodStep onSelectMethod={handleGenerationMethodSelect} />;
      case 'upload_document':
        return <FileUploadStep onFileProcessed={handleDocumentFileProcessed} setIsLoadingGlobally={setIsLoading} />;
      case 'syllabus_upload':
        return <SyllabusUploadStep onFileProcessed={handleSyllabusFileProcessed} setIsLoadingGlobally={setIsLoading} />;
      case 'syllabus_options':
        return <SyllabusOptionsStep onSubmitOptions={handleSyllabusOptionsSubmit} />;
      case 'language_selection':
        return <LanguageSelectionStep onSelectLanguage={handleLanguageSelected} />;
      case 'previewing_questions':
        return <QuestionPreviewStep questions={questions} onStartTest={handleStartTest} />;
      case 'taking_test':
        return <TestTakingStep questions={questions} onSubmitTest={handleSubmitTest} />;
      case 'awaiting_scoring_choice':
        return <ScoringOptionsStep onScoreWithAI={handleScoreWithAI} onUploadKeyAndScore={handleUploadKeyAndScore} setIsLoadingGlobally={setIsLoading} />;
      case 'results':
        if (error && !scoreDetails) { 
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
        const exhaustiveCheck: never = currentStep;
        return <p>Unknown step: {exhaustiveCheck}</p>;
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
