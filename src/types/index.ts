
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
  negativeMarkingValue: number | null; 
}

export interface TopicGenerationOptions {
  numQuestions: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

// This type remains for the old, non-Genkit flow which is not actively used.
// It's kept to avoid breaking the unused file, but new development should use Genkit flows.
export interface GenerateQuestionsFromTopicInput {
  topic: string;
  numQuestions: number;
  difficultyLevel: 'easy' | 'medium' | 'hard';
}

export interface GenerateQuestionsFromTopicOutput {
  questions: {
    question: string;
    options: string[];
    answer: string;
  }[];
}
