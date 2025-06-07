
export interface QuestionType {
  id: string; 
  questionText: string;
  options: string[]; 
  aiAssignedAnswer?: string | null; 
  userSelectedAnswer?: string | null; 
  actualCorrectAnswer?: string | null; 
  isCorrect?: boolean; 
}

export interface TestResultItem {
  questionText: string;
  userSelectedAnswer: string | null;
  actualCorrectAnswer: string;
  isCorrect: boolean;
  options: string[];
}

export interface TestConfiguration {
  isTimedTest: boolean;
  durationMinutes: number; // in minutes
  enableNegativeMarking: boolean;
  negativeMarkValue: number; // e.g., 0.25, 0.5, 1
}

export interface ScoreSummary {
  score: number;
  totalQuestions: number;
  results: TestResultItem[];
  testConfiguration: TestConfiguration; // Now mandatory
}

// This type is passed to TestTakingStep
export interface TestSessionDetails {
  questions: QuestionType[];
  testConfiguration: TestConfiguration;
}

export type GenerationMode = 'extract_from_document' | 'generate_from_syllabus' | 'generate_from_topic';

// Lean version of QuestionType for storage in history
export interface HistoryQuestion {
  id: string;
  questionText: string;
  options: string[];
  aiAssignedAnswer?: string | null; // Crucial for retake if AI scoring is used
}

export interface TestHistoryItem {
  id: string;
  timestamp: number;
  generationMode: GenerationMode | null;
  sourceName?: string;
  scoreSummary: ScoreSummary;
  questions: HistoryQuestion[]; // Store questions for retake
}


    