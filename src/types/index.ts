
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
  testConfiguration?: TestConfiguration; // Optional: to display if settings were active
}
