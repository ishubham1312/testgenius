
"use client";

import type { QuestionType, ScoreSummary, TestResultItem, TestConfiguration } from "@/types";
import { useState, useCallback, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { FileUploadStep } from "@/components/steps/file-upload-step";
import { QuestionPreviewStep } from "@/components/steps/question-preview-step";
import { TestConfigurationStep } from "@/components/steps/test-configuration-step";
import { TestTakingStep } from "@/components/steps/test-taking-step";
import { ScoringOptionsStep } from "@/components/steps/scoring-options-step";
import { ResultsStep } from "@/components/steps/results-step";
import { LanguageSelectionStep } from "@/components/steps/language-selection-step";
import { GenerationMethodStep } from "@/components/steps/generation-method-step";
import { SyllabusUploadStep } from "@/components/steps/syllabus-upload-step";
import { SyllabusOptionsStep, type SyllabusGenerationOptions } from "@/components/steps/syllabus-options-step";
import { TopicInputStep } from "@/components/steps/topic-input-step"; 
import { TopicOptionsStep, type TopicGenerationOptions } from "@/components/steps/topic-options-step";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { extractQuestions, type ExtractQuestionsOutput } from "@/ai/flows/extract-questions";
import { generateQuestionsFromSyllabus, type GenerateQuestionsFromSyllabusInput, type GenerateQuestionsFromSyllabusOutput } from "@/ai/flows/generate-questions-from-syllabus";
import { scoreTestWithAI, type ScoreTestWithAIInput, type Question as AIScoreQuestion } from "@/ai/flows/score-test";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

type AppStep = 
  | 'generation_method_selection' 
  | 'topic_input' 
  | 'topic_options' 
  | 'generating_from_topic' 
  | 'upload_document' 
  | 'syllabus_upload'
  | 'syllabus_options'
  | 'language_selection'
  | 'previewing_questions' 
  | 'test_configuration'
  | 'taking_test'
  | 'awaiting_scoring_choice'
  | 'results';

export default function TestGeniusPage() {
  const [currentStep, setCurrentStep] = useState<AppStep>('generation_method_selection');
  const [generationMode, setGenerationMode] = useState<'extract_from_document' | 'generate_from_syllabus' | 'generate_from_topic' | null>(null);
  
  const [extractedDocumentText, setExtractedDocumentText] = useState<string | null>(null);
  const [syllabusText, setSyllabusText] = useState<string | null>(null);
  const [syllabusOptions, setSyllabusOptions] = useState<SyllabusGenerationOptions | null>(null);
  const [topicOptions, setTopicOptions] = useState<TopicGenerationOptions | null>(null);
  const [topicForGeneration, setTopicForGeneration] = useState<string | null>(null);

  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [userTestAnswers, setUserTestAnswers] = useState<Record<string, string>>({});
  const [scoreDetails, setScoreDetails] = useState<ScoreSummary | null>(null);
  const [testConfiguration, setTestConfiguration] = useState<TestConfiguration>({
    timerMinutes: null,
    negativeMarkingValue: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const resetState = useCallback(() => {
    setCurrentStep('generation_method_selection');
    setGenerationMode(null);
    setExtractedDocumentText(null);
    setSyllabusText(null);
    setSyllabusOptions(null);
    setTopicOptions(null);
    setTopicForGeneration(null);
    setQuestions([]);
    setUserTestAnswers({});
    setScoreDetails(null);
    setTestConfiguration({ timerMinutes: null, negativeMarkingValue: null });
    setIsLoading(false);
    setError(null);
  }, []);

  const handleGenerationError = useCallback((e: unknown, mode: 'document' | 'syllabus' | 'topic' | 'language') => {
    console.error(`AI error (${mode}):`, e);
    let errorMessage = `Failed to process with AI: ${(e as Error).message}`;
    let toastTitle = "AI Processing Error";

    if (mode === 'document') toastTitle = "AI Extraction Error";
    if (mode === 'syllabus' || mode === 'topic') toastTitle = "AI Generation Error";
    if (mode === 'language') errorMessage = `Failed to process with selected language: ${(e as Error).message}`;

    setError(errorMessage);
    toast({ title: toastTitle, description: (e as Error).message, variant: "destructive" });
    setIsLoading(false);
  }, [setError, toast, setIsLoading]);
  
  const processAIQuestionsOutput = useCallback((aiResult: ExtractQuestionsOutput | GenerateQuestionsFromSyllabusOutput) => {
    if (!aiResult || typeof aiResult !== 'object' || !aiResult.questions || !Array.isArray(aiResult.questions)) {
      console.error("Invalid aiResult structure in processAIQuestionsOutput:", aiResult);
      setError("Received an unexpected data structure from AI. Cannot process questions.");
      setIsLoading(false);
      return;
    }

    if (aiResult.questions.length === 0) {
      setError("AI could not extract or generate any questions based on the current settings. Please try different options, a different file, or ensure the content has clear multiple-choice questions in the selected language.");
      setQuestions([]);
      setCurrentStep('previewing_questions');
      setIsLoading(false);
      return;
    }
    
    setError(null);
    const formattedQuestions: QuestionType[] = aiResult.questions.map((q) => ({
      id: crypto.randomUUID(),
      questionText: q.question,
      options: q.options,
      aiAssignedAnswer: q.answer, // This answer is from the AI (extraction or generation)
      questionType: q.questionType,
      listI: q.listI,
      listII: q.listII,
    }));
    setQuestions(formattedQuestions);
    setCurrentStep('previewing_questions');
    setIsLoading(false);
  }, [setQuestions, setCurrentStep, setError, setIsLoading]);


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
        setIsLoading(false);
      } else {
        processAIQuestionsOutput(initialAiResult);
      }
    } catch (e) {
      handleGenerationError(e, 'document');
    } 
  }, [processAIQuestionsOutput, setExtractedDocumentText, setCurrentStep, setError, setIsLoading, handleGenerationError]);

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
      };
      const aiResult = await generateQuestionsFromSyllabus(input);

      if (!aiResult || typeof aiResult !== 'object') {
        console.error("AI generation returned invalid data structure:", aiResult);
        throw new Error("AI service returned an unexpected data format during generation.");
      }
      
      if (aiResult.requiresLanguageChoice) {
        setCurrentStep('language_selection');
        setIsLoading(false);
      } else {
        processAIQuestionsOutput(aiResult);
      }

    } catch (e) {
      handleGenerationError(e, 'syllabus');
    }
  }, [syllabusText, processAIQuestionsOutput, setCurrentStep, setError, setIsLoading, setSyllabusOptions, handleGenerationError]);

  const handleTopicInputSubmit = useCallback((topic: string) => {
    setTopicForGeneration(topic);
    setCurrentStep('topic_options');
    setError(null);
  }, [setTopicForGeneration, setCurrentStep, setError]);

  const handleTopicOptionsSubmit = useCallback(async (options: TopicGenerationOptions) => {
    if (!topicForGeneration) {
      setError("Topic not found. Please re-enter the topic.");
      setCurrentStep('topic_input');
      return;
    }
    setTopicOptions(options); 
    setError(null);
    setIsLoading(true);
    setCurrentStep('generating_from_topic'); 
    try {
      const input: GenerateQuestionsFromSyllabusInput = { 
        syllabusText: topicForGeneration, 
        numQuestions: options.numQuestions,
        difficultyLevel: options.difficultyLevel,
      };
      const aiResult = await generateQuestionsFromSyllabus(input); 
      processAIQuestionsOutput(aiResult);
    } catch (e) {
      handleGenerationError(e, "topic");
    }
  }, [topicForGeneration, processAIQuestionsOutput, setIsLoading, setCurrentStep, setError, setTopicOptions, handleGenerationError]);


  const handleLanguageSelected = useCallback(async (language: 'en' | 'hi') => {
    setError(null);
    setIsLoading(true);
    try {
      let aiResult: ExtractQuestionsOutput | GenerateQuestionsFromSyllabusOutput;
      let currentOptions;

      if (generationMode === 'extract_from_document') {
        if (!extractedDocumentText) throw new Error("Extracted document text not found.");
        aiResult = await extractQuestions({ text: extractedDocumentText, preferredLanguage: language });
      } else if (generationMode === 'generate_from_syllabus') {
        if (!syllabusText || !syllabusOptions) throw new Error("Syllabus text or options not found.");
        currentOptions = syllabusOptions;
        aiResult = await generateQuestionsFromSyllabus({ 
          syllabusText, 
          numQuestions: currentOptions.numQuestions,
          difficultyLevel: currentOptions.difficultyLevel,
          preferredLanguage: language 
        });
      } else if (generationMode === 'generate_from_topic') {
         if (!topicForGeneration || !topicOptions) throw new Error("Topic or options not found.");
         currentOptions = topicOptions;
        aiResult = await generateQuestionsFromSyllabus({ 
          syllabusText: topicForGeneration, 
          numQuestions: currentOptions.numQuestions,
          difficultyLevel: currentOptions.difficultyLevel,
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
      handleGenerationError(e, 'language');
      if (generationMode === 'extract_from_document') setCurrentStep('upload_document');
      else if (generationMode === 'generate_from_syllabus') setCurrentStep('syllabus_upload');
      else if (generationMode === 'generate_from_topic') setCurrentStep('topic_input');

    }
  }, [extractedDocumentText, syllabusText, syllabusOptions, topicForGeneration, topicOptions, generationMode, processAIQuestionsOutput, setCurrentStep, setError, setIsLoading, handleGenerationError]);


  const handleGenerationMethodSelect = (method: 'extract_from_document' | 'generate_from_syllabus' | 'generate_from_topic') => {
    setGenerationMode(method);
    if (method === 'extract_from_document') {
      setCurrentStep('upload_document');
    } else if (method === 'generate_from_topic') {
      setCurrentStep('topic_input');
    } else {
      setCurrentStep('syllabus_upload');
    }
    setError(null);
  };

  const handleProceedToConfiguration = useCallback(() => {
    setCurrentStep('test_configuration');
    setError(null);
  }, [setCurrentStep, setError]);

  const handleTestConfigurationSubmit = useCallback((config: TestConfiguration) => {
    setTestConfiguration(config);
    setCurrentStep('taking_test');
    setError(null);
  }, [setTestConfiguration, setCurrentStep, setError]);

  const handleScoreWithAI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const aiScoreInput: ScoreTestWithAIInput = {
        questions: questions.map(q => ({
          question: q.questionText,
          options: q.options,
          answer: q.aiAssignedAnswer || null, // This is the AI's original answer from extraction/generation
          userAnswer: userTestAnswers[q.id] || null,
          questionType: q.questionType || 'mcq',
          listI: q.listI || null,
          listII: q.listII || null,
        } as AIScoreQuestion)),
      };
      
      const aiScoreResult = await scoreTestWithAI(aiScoreInput);
      
      const updatedQuestions = questions.map((q) => {
        const resultItem = aiScoreResult.results.find(r => r.question === q.questionText);
        return {
          ...q,
          userSelectedAnswer: userTestAnswers[q.id] || null,
          actualCorrectAnswer: resultItem?.correctAnswer || "N/A", // This is the AI-verified/determined correct answer
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
      // If scoring fails, user should ideally be able to retry or go back.
      // For now, just show error. Might need a specific error step or allow re-entry to scoring choice.
    } finally {
      setIsLoading(false);
    }
  }, [questions, userTestAnswers, toast, setIsLoading, setError, setQuestions, setScoreDetails, setCurrentStep]);

  const handleSubmitTest = useCallback((answers: Record<string, string>) => {
    setUserTestAnswers(answers);
    if (generationMode === 'generate_from_syllabus' || generationMode === 'generate_from_topic') {
      handleScoreWithAI(); 
    } else {
      setCurrentStep('awaiting_scoring_choice');
    }
    setError(null);
  }, [setUserTestAnswers, setCurrentStep, setError, generationMode, handleScoreWithAI]);

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
      
      if (isCorrect) {
        score++;
      } else if (testConfiguration.negativeMarkingValue !== null && userAnswer !== null) { 
        score -= testConfiguration.negativeMarkingValue;
      }
      
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
      score: Math.max(0, score), 
      totalQuestions: questions.length,
      results: detailedResults,
    });
    setCurrentStep('results');
    setIsLoading(false);
  }, [questions, userTestAnswers, toast, setIsLoading, setError, setQuestions, setScoreDetails, setCurrentStep, testConfiguration]);


  const renderStepContent = () => {
    if (isLoading) {
      let message = "Processing...";
      if (currentStep === 'upload_document' || currentStep === 'syllabus_upload') {
        message = "Processing file...";
      } else if (currentStep === 'generating_from_topic' || 
                 (currentStep === 'language_selection' && (extractedDocumentText || syllabusText || topicForGeneration)) ||
                 (generationMode === 'extract_from_document' && currentStep === 'upload_document' && extractedDocumentText) ||
                 ((generationMode === 'generate_from_syllabus' || generationMode === 'generate_from_topic') && (currentStep === 'syllabus_options' || currentStep === 'topic_options') && (syllabusText || topicForGeneration) )
      ) {
         message = (generationMode === 'generate_from_syllabus' || generationMode === 'generate_from_topic') ? "Generating questions with AI..." : "Extracting questions with AI...";
      } else if (currentStep === 'awaiting_scoring_choice' || (generationMode === 'generate_from_syllabus' || generationMode === 'generate_from_topic') && currentStep !== 'results' ) { 
        message = "Scoring test with AI...";
      }
      return <LoadingSpinner message={message} />;
    }

    const commonErrorSteps: AppStep[] = ['upload_document', 'syllabus_upload', 'syllabus_options', 'topic_input', 'topic_options', 'language_selection', 'previewing_questions', 'awaiting_scoring_choice', 'generating_from_topic'];
    if (error && commonErrorSteps.includes(currentStep) ) {
      if (currentStep === 'previewing_questions' && questions.length === 0) {
        return (
          <Alert variant="destructive" className="w-full max-w-xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Processing Content</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        );
      }
      if (currentStep !== 'previewing_questions' || (currentStep === 'previewing_questions' && questions.length > 0)) {
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
      case 'topic_input':
        return <TopicInputStep onSubmitTopic={handleTopicInputSubmit} />;
      case 'topic_options':
         return <TopicOptionsStep onSubmitOptions={handleTopicOptionsSubmit} />;
      case 'upload_document':
        return <FileUploadStep onFileProcessed={handleDocumentFileProcessed} setIsLoadingGlobally={setIsLoading} />;
      case 'syllabus_upload':
        return <SyllabusUploadStep onFileProcessed={handleSyllabusFileProcessed} setIsLoadingGlobally={setIsLoading} />;
      case 'syllabus_options':
        return <SyllabusOptionsStep onSubmitOptions={handleSyllabusOptionsSubmit} />;
      case 'language_selection':
        return <LanguageSelectionStep onSelectLanguage={handleLanguageSelected} />;
      case 'previewing_questions':
        if ((generationMode === 'generate_from_topic' || generationMode === 'generate_from_syllabus' || generationMode === 'extract_from_document') && questions.length === 0 && !error && isLoading) {
            return <LoadingSpinner message={generationMode === 'extract_from_document' ? "Extracting questions..." : "Generating questions..."} />;
        }
        return <QuestionPreviewStep questions={questions} onProceedToConfiguration={handleProceedToConfiguration} />;
      case 'test_configuration':
        return <TestConfigurationStep currentConfig={testConfiguration} onSubmit={handleTestConfigurationSubmit} />;
      case 'taking_test':
        return <TestTakingStep questions={questions} testConfiguration={testConfiguration} onSubmitTest={handleSubmitTest} />;
      case 'awaiting_scoring_choice':
         // This step should ideally not be reached if generationMode is syllabus/topic,
         // but as a fallback or for extract_from_document mode:
        return <ScoringOptionsStep onScoreWithAI={handleScoreWithAI} onUploadKeyAndScore={handleUploadKeyAndScore} setIsLoadingGlobally={setIsLoading} />;
      case 'generating_from_topic':
         return <LoadingSpinner message="Generating questions with AI..." />;
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
        if (!scoreDetails) return <LoadingSpinner message="Calculating results..." />; 
        return <ResultsStep scoreSummary={scoreDetails} onRetakeTest={resetState} testConfiguration={testConfiguration} />;
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

