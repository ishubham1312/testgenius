
export interface QuestionType {
  id: string; 
  questionText: string;
  options: string[]; 
  aiAssignedAnswer?: string | null; // Answer suggested by AI during extraction/generation
  userSelectedAnswer?: string | null; // User's actual selected answer during the test
  actualCorrectAnswer?: string | null; // The correct answer determined after scoring
  isCorrect?: boolean; 
  questionType?: 'mcq' | 'match' | string; // To distinguish question types
  listI?: Record<string, string> | null; // For "Match the List" questions
  listII?: Record<string, string> | null; // For "Match the List" questions
}

export interface TestResultItem {
  questionText: string;
  userSelectedAnswer: string | null;
  actualCorrectAnswer: string;
  isCorrect: boolean;
  options: string[];
  // Include listI and listII if it's a match question, for detailed results display
  listI?: Record<string, string> | null;
  listII?: Record<string, string> | null;
  questionType?: QuestionType['questionType'];
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

export interface TestHistoryEntry {
  id: string; // Unique ID for this history entry (e.g., timestamp or UUID)
  timestamp: number; // Date().getTime() when the test was completed
  generationMode: 'extract_from_document' | 'generate_from_syllabus' | 'generate_from_topic' | string; // How test was made
  sourceIdentifier: string; // e.g., filename, "Syllabus", "Topic: Quantum Physics"
  originalQuestions: QuestionType[]; // Questions as they were *before* user answers & scoring
  testConfiguration: TestConfiguration;
  scoreSummary: ScoreSummary;
}
