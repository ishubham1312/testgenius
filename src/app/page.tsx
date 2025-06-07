
"use client";

import type { QuestionType, ScoreSummary, TestResultItem, TestConfiguration, TestSessionDetails } from "@/types";
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
import { TopicInputStep } from "@/components/steps/topic-input-step";
import { TopicOptionsStep, type TopicGenerationOptions } from "@/components/steps/topic-options-step";
import { TestConfigurationStep } from "@/components/steps/test-configuration-step";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { extractQuestions, type ExtractQuestionsOutput } from "@/ai/flows/extract-questions";
import { generateQuestionsFromSyllabus, type GenerateQuestionsFromSyllabusInput, type GenerateQuestionsFromSyllabusOutput } from "@/ai/flows/generate-questions-from-syllabus";
import { generateQuestionsFromTopic, type GenerateQuestionsFromTopicInput, type GenerateQuestionsFromTopicOutput } from "@/ai/flows/generate-questions-from-topic";
import { scoreTestWithAI, type ScoreTestWithAIInput, type Question as AIScoreQuestion } from "@/ai/flows/score-test";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";


type AppStep = 
  | 'generation_method_selection'
  | 'upload_document'
  | 'syllabus_upload'
  | 'syllabus_options'
  | 'topic_input'
  | 'topic_options'
  | 'language_selection'
  | 'test_configuration'
  | 'previewing_questions'
  | 'taking_test'
  | 'awaiting_scoring_choice'
  | 'results';

export type GenerationMode = 'extract_from_document' | 'generate_from_syllabus' | 'generate_from_topic';


export default function TestGeniusPage() {
  const [currentStep, setCurrentStep] = useState<AppStep>('generation_method_selection');
  const [generationMode, setGenerationMode] = useState<GenerationMode | null>(null);
  
  const [extractedDocumentText, setExtractedDocumentText] = useState<string | null>(null);
  const [syllabusText, setSyllabusText] = useState<string | null>(null);
  const [syllabusOptions, setSyllabusOptions] = useState<SyllabusGenerationOptions | null>(null);
  const [topicText, setTopicText] = useState<string | null>(null);
  const [topicOptions, setTopicOptions] = useState<TopicGenerationOptions | null>(null);

  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [userTestAnswers, setUserTestAnswers] = useState<Record<string, string>>({});
  const [scoreDetails, setScoreDetails] = useState<ScoreSummary | null>(null);
  const [testConfig, setTestConfig] = useState<TestConfiguration>({
    isTimedTest: false,
    durationMinutes: 30,
    enableNegativeMarking: false,
    negativeMarkValue: 0.25, 
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
    setTopicText(null);
    setTopicOptions(null);
    setQuestions([]);
    setUserTestAnswers({});
    setScoreDetails(null);
    setTestConfig({
      isTimedTest: false,
      durationMinutes: 30,
      enableNegativeMarking: false,
      negativeMarkValue: 0.25,
    });
    setIsLoading(false);
    setError(null);
  }, []);

  const processAIQuestionsOutput = useCallback((aiResult: ExtractQuestionsOutput | GenerateQuestionsFromSyllabusOutput | GenerateQuestionsFromTopicOutput) => {
    if (!aiResult || typeof aiResult !== 'object' || !aiResult.questions || !Array.isArray(aiResult.questions)) {
      console.error("Invalid aiResult structure in processAIQuestionsOutput:", aiResult);
      setError("Received an unexpected data structure from AI. Cannot process questions.");
      setIsLoading(false);
      return;
    }

    if (aiResult.questions.length === 0) {
      setError("AI could not extract or generate any questions. Please adjust your input or try different options.");
      setQuestions([]);
    } else {
      setError(null);
      const formattedQuestions: QuestionType[] = aiResult.questions.map((q) => ({
        id: crypto.randomUUID(),
        questionText: q.question,
        options: q.options,
        aiAssignedAnswer: q.answer,
      }));
      setQuestions(formattedQuestions);
      setCurrentStep('test_configuration'); 
    }
    setIsLoading(false);
  }, [setQuestions, setCurrentStep, setError, setIsLoading]);


  const handleDocumentFileProcessed = useCallback(async (text: string) => {
    setExtractedDocumentText(text);
    setError(null);
    setIsLoading(true);
    try {
      const initialAiResult = await extractQuestions({ text });
      if (!initialAiResult || typeof initialAiResult !== 'object') {
        throw new Error("AI service returned an unexpected data format.");
      }
      if (initialAiResult.requiresLanguageChoice) {
        setCurrentStep('language_selection');
      } else {
        processAIQuestionsOutput(initialAiResult);
      }
    } catch (e) {
      setError(`Failed to process document with AI: ${(e as Error).message}`);
      toast({ title: "AI Processing Error", description: (e as Error).message, variant: "destructive" });
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
      setError("Syllabus text not found.");
      setCurrentStep('syllabus_upload');
      return;
    }
    setSyllabusOptions(options);
    setError(null);
    setIsLoading(true);
    try {
      const input: GenerateQuestionsFromSyllabusInput = { syllabusText, ...options };
      const aiResult = await generateQuestionsFromSyllabus(input);
      if (!aiResult || typeof aiResult !== 'object') {
        throw new Error("AI service returned an unexpected data format.");
      }
      if (aiResult.requiresLanguageChoice && !options.preferredLanguage) {
        setCurrentStep('language_selection');
      } else {
        processAIQuestionsOutput(aiResult);
      }
    } catch (e) {
      setError(`Failed to generate from syllabus: ${(e as Error).message}`);
      toast({ title: "AI Generation Error", description: (e as Error).message, variant: "destructive" });
      setIsLoading(false);
    }
  }, [syllabusText, toast, processAIQuestionsOutput, setCurrentStep, setError, setIsLoading, setSyllabusOptions]);

  const handleTopicInputSubmit = useCallback((topic: string) => {
    setTopicText(topic);
    setCurrentStep('topic_options');
    setError(null);
  }, [setTopicText, setCurrentStep, setError]);

  const handleTopicOptionsSubmit = useCallback(async (options: TopicGenerationOptions) => {
    if (!topicText) {
      setError("Topic text not found.");
      setCurrentStep('topic_input');
      return;
    }
    setTopicOptions(options);
    setError(null);
    setIsLoading(true);
    try {
      const input: GenerateQuestionsFromTopicInput = { topic: topicText, ...options };
      const aiResult = await generateQuestionsFromTopic(input);
      if (!aiResult || typeof aiResult !== 'object') {
        throw new Error("AI service returned an unexpected data format.");
      }
      if (aiResult.requiresLanguageChoice && !options.preferredLanguage) {
        setCurrentStep('language_selection');
      } else {
        processAIQuestionsOutput(aiResult);
      }
    } catch (e) {
      setError(`Failed to generate from topic: ${(e as Error).message}`);
      toast({ title: "AI Generation Error", description: (e as Error).message, variant: "destructive" });
      setIsLoading(false);
    }
  }, [topicText, toast, processAIQuestionsOutput, setCurrentStep, setError, setIsLoading, setTopicOptions]);


  const handleLanguageSelected = useCallback(async (language: 'en' | 'hi') => {
    setError(null);
    setIsLoading(true);
    try {
      let aiResult: ExtractQuestionsOutput | GenerateQuestionsFromSyllabusOutput | GenerateQuestionsFromTopicOutput;

      if (generationMode === 'extract_from_document') {
        if (!extractedDocumentText) throw new Error("Document text not found.");
        aiResult = await extractQuestions({ text: extractedDocumentText, preferredLanguage: language });
      } else if (generationMode === 'generate_from_syllabus') {
        if (!syllabusText || !syllabusOptions) throw new Error("Syllabus data incomplete.");
        aiResult = await generateQuestionsFromSyllabus({ ...syllabusOptions, syllabusText, preferredLanguage: language });
      } else if (generationMode === 'generate_from_topic') {
        if (!topicText || !topicOptions) throw new Error("Topic data incomplete.");
        aiResult = await generateQuestionsFromTopic({ ...topicOptions, topic: topicText, preferredLanguage: language });
      } else {
        throw new Error("Invalid generation mode for language selection.");
      }
      
      if (!aiResult || typeof aiResult !== 'object') {
        throw new Error("AI service returned an unexpected data format after language selection.");
      }
      processAIQuestionsOutput(aiResult);

    } catch (e) {
      setError(`Processing error with language: ${(e as Error).message}`);
      toast({ title: "AI Processing Error", description: (e as Error).message, variant: "destructive" });
      setIsLoading(false);
    }
  }, [generationMode, extractedDocumentText, syllabusText, syllabusOptions, topicText, topicOptions, toast, processAIQuestionsOutput, setError, setIsLoading]);


  const handleGenerationMethodSelect = (method: GenerationMode) => {
    setGenerationMode(method);
    if (method === 'extract_from_document') setCurrentStep('upload_document');
    else if (method === 'generate_from_syllabus') setCurrentStep('syllabus_upload');
    else if (method === 'generate_from_topic') setCurrentStep('topic_input');
    setError(null);
  };

  const handleTestConfigurationSubmit = (config: TestConfiguration) => {
    setTestConfig(config);
    setCurrentStep('previewing_questions');
    setError(null);
  };

  const handleStartTest = useCallback(() => {
    setCurrentStep('taking_test');
    setError(null);
  }, [setError]);

  const handleSubmitTest = useCallback((answers: Record<string, string>) => {
    setUserTestAnswers(answers);
    setCurrentStep('awaiting_scoring_choice');
    setError(null);
  }, [setUserTestAnswers, setError]);

  const handleScoreWithAI = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const aiScoreInput: ScoreTestWithAIInput = {
        questions: questions.map(q => ({
          question: q.questionText,
          options: q.options,
          answer: q.aiAssignedAnswer || null, // AI might not have assigned one if extracting
          userAnswer: userTestAnswers[q.id] || null,
        } as AIScoreQuestion)),
        testConfiguration: testConfig, // Pass test config for negative marking
      };
      
      const aiScoreResult = await scoreTestWithAI(aiScoreInput);
      
      const detailedResults: TestResultItem[] = aiScoreResult.results.map(r => ({
          questionText: r.question,
          userSelectedAnswer: r.userAnswer,
          actualCorrectAnswer: r.correctAnswer,
          isCorrect: r.isCorrect,
          options: questions.find(q => q.questionText === r.question)?.options || [],
        }));
      
      const updatedQuestionsWithResults = questions.map((q) => {
        const resultItem = detailedResults.find(r => r.questionText === q.questionText);
        return {
          ...q,
          userSelectedAnswer: resultItem?.userSelectedAnswer || userTestAnswers[q.id] || null,
          actualCorrectAnswer: resultItem?.actualCorrectAnswer || "N/A",
          isCorrect: resultItem?.isCorrect || false,
        };
      });
      setQuestions(updatedQuestionsWithResults);

      setScoreDetails({
        score: aiScoreResult.score, // Score is now calculated by the AI flow considering negative marking
        totalQuestions: aiScoreResult.totalQuestions,
        results: detailedResults,
        testConfiguration: testConfig,
      });
      setCurrentStep('results');
    } catch (e) {
      setError(`AI scoring error: ${(e as Error).message}`);
      toast({ title: "AI Scoring Error", description: (e as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [questions, userTestAnswers, testConfig, toast, setIsLoading, setError, setScoreDetails, setCurrentStep]);

  const handleUploadKeyAndScore = useCallback((keyAnswers: string[]) => {
    setIsLoading(true);
    setError(null);
    if (keyAnswers.length !== questions.length) {
      setError(`Answer key has ${keyAnswers.length} answers, but test has ${questions.length} questions.`);
      toast({ title: "Answer Key Mismatch", description: `Expected ${questions.length} answers, got ${keyAnswers.length}.`, variant: "destructive" });
      setIsLoading(false);
      return;
    }

    let currentScore = 0;
    const detailedResults: TestResultItem[] = [];

    const updatedQuestionsWithResults = questions.map((q, index) => {
      const correctAnswer = keyAnswers[index];
      const userAnswer = userTestAnswers[q.id] || null;
      const isCorrect = userAnswer === correctAnswer;
      
      let questionScore = 0;
      if (isCorrect) {
        questionScore = 1; // Assume 1 point per correct answer
      } else if (testConfig.enableNegativeMarking && userAnswer !== null) { // Negative mark only if answered incorrectly
        questionScore = -testConfig.negativeMarkValue;
      }
      currentScore += questionScore;
      
      detailedResults.push({
        questionText: q.questionText,
        userSelectedAnswer: userAnswer,
        actualCorrectAnswer: correctAnswer,
        isCorrect: isCorrect,
        options: q.options,
      });

      return { ...q, userSelectedAnswer: userAnswer, actualCorrectAnswer: correctAnswer, isCorrect: isCorrect };
    });
    currentScore = Math.max(0, currentScore); // Ensure score doesn't go below 0
    
    setQuestions(updatedQuestionsWithResults);
    setScoreDetails({
      score: currentScore,
      totalQuestions: questions.length,
      results: detailedResults,
      testConfiguration: testConfig,
    });
    setCurrentStep('results');
    setIsLoading(false);
  }, [questions, userTestAnswers, testConfig, toast, setIsLoading, setError, setScoreDetails, setCurrentStep]);


  const renderStepContent = () => {
    if (isLoading) {
      let message = "Processing...";
      if ((currentStep === 'upload_document' && !extractedDocumentText) || 
          (currentStep === 'syllabus_upload' && !syllabusText) ||
          (currentStep === 'topic_input' && !topicText)) {
        message = "Processing file/input...";
      }
      if (['upload_document', 'syllabus_options', 'topic_options', 'language_selection'].includes(currentStep) && 
          (extractedDocumentText || syllabusText || topicText) && questions.length === 0 && !error) {
         message = "AI is working on your questions...";
      }
      if (currentStep === 'awaiting_scoring_choice') message = "Scoring test...";
      return <LoadingSpinner message={message} />;
    }
    
    const commonErrorDisplaySteps: AppStep[] = ['upload_document', 'syllabus_upload', 'syllabus_options', 'topic_input', 'topic_options', 'language_selection', 'test_configuration', 'previewing_questions', 'awaiting_scoring_choice'];
    if (error && commonErrorDisplaySteps.includes(currentStep)) {
      const title = (currentStep === 'previewing_questions' && questions.length === 0) ? "Error Processing Content" : "Error";
      return (
        <Alert variant="destructive" className="w-full max-w-xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{error} Please try adjusting your input or selections, or <Button variant="link" onClick={resetState} className="p-0 h-auto">start over</Button>.</AlertDescription>
        </Alert>
      );
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
      case 'topic_input':
        return <TopicInputStep onSubmitTopic={handleTopicInputSubmit} />;
      case 'topic_options':
        return <TopicOptionsStep onSubmitOptions={handleTopicOptionsSubmit} />;
      case 'language_selection':
        return <LanguageSelectionStep onSelectLanguage={handleLanguageSelected} currentGenerationMode={generationMode} />;
      case 'test_configuration':
        return <TestConfigurationStep currentConfig={testConfig} onSubmitConfig={handleTestConfigurationSubmit} />;
      case 'previewing_questions':
         if (questions.length === 0 && !isLoading) { 
            return (
              <Alert variant="destructive" className="w-full max-w-xl mx-auto">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Questions Generated/Extracted</AlertTitle>
                <AlertDescription>
                  The AI could not generate or extract any questions based on your input. 
                  Please <Button variant="link" onClick={() => setCurrentStep( generationMode === 'extract_from_document' ? 'upload_document' : generationMode === 'generate_from_syllabus' ? 'syllabus_upload' : 'topic_input')} className="p-0 h-auto">go back and try different options</Button> or 
                  <Button variant="link" onClick={resetState} className="p-0 h-auto ml-1">start over</Button>.
                </AlertDescription>
              </Alert>
            );
          }
        return <QuestionPreviewStep questions={questions} onStartTest={handleStartTest} />;
      case 'taking_test':
        const testSessionDetails: TestSessionDetails = { questions, testConfiguration: testConfig };
        return <TestTakingStep testSessionDetails={testSessionDetails} onSubmitTest={handleSubmitTest} />;
      case 'awaiting_scoring_choice':
        return <ScoringOptionsStep onScoreWithAI={handleScoreWithAI} onUploadKeyAndScore={handleUploadKeyAndScore} setIsLoadingGlobally={setIsLoading} />;
      case 'results':
        if (!scoreDetails) {
             return (
                <Alert variant="destructive" className="w-full max-w-xl mx-auto">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error Displaying Results</AlertTitle>
                  <AlertDescription>{error || "Score details not available."} Please <Button variant="link" onClick={resetState} className="p-0 h-auto">try again</Button>.</AlertDescription>
                </Alert>
            );
        }
        return <ResultsStep scoreSummary={scoreDetails} onRetakeTest={resetState} />;
      default:
        const exhaustiveCheck: never = currentStep; 
        return <p>Unknown step: {exhaustiveCheck}</p>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header onLogoClick={resetState} />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {renderStepContent()}
      </main>
      <footer className="py-4 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} TestGenius. Powered by AI.</p>
      </footer>
    </div>
  );
}
