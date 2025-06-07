
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

export interface ScoreSummary {
  score: number;
  totalQuestions: number;
  results: TestResultItem[];
}

export interface TestConfiguration {
  timerMinutes: number | null;
  negativeMarkingValue: number | null; // Changed from negativeMarkingEnabled: boolean
}

