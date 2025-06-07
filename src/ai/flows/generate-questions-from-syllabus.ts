
'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate multiple-choice questions from a given syllabus.
 * It allows specifying the number of questions and difficulty level.
 * It can also handle multilingual content (English/Hindi) for generation.
 *
 * - `generateQuestionsFromSyllabus`: Generates questions based on syllabus, count, difficulty, and language preference.
 * - `GenerateQuestionsFromSyllabusInput`: The input type for the function.
 * - `GenerateQuestionsFromSyllabusOutput`: The output type for the function (mirrors ExtractQuestionsOutput).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuestionsFromSyllabusInputSchema = z.object({
  syllabusText: z.string().describe('The text content of the syllabus.'),
  numQuestions: z.number().int().nonnegative().describe('The desired number of questions to generate (0 is valid).'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).describe('The desired difficulty level for the questions.'),
  preferredLanguage: z.enum(['en', 'hi']).optional().describe('If provided, the AI will prioritize generating questions in this language.'),
});

export type GenerateQuestionsFromSyllabusInput = z.infer<typeof GenerateQuestionsFromSyllabusInputSchema>;

// Reusing the QuestionObjectSchema and output schema structure from extract-questions for consistency
const QuestionObjectSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).length(4).describe('Four possible answers to the question.'),
  answer: z.string().nullable().describe('The correct answer to the question, can be null if not available.'),
});

const GenerateQuestionsFromSyllabusOutputSchema = z.object({
  questions: z.array(QuestionObjectSchema).describe('An array of generated multiple-choice questions.'),
  requiresLanguageChoice: z.boolean().describe('True if the AI had issues determining the language from the syllabus or if preferredLanguage was needed but ambiguous. Default to false if generation is straightforward.'),
  extractedLanguage: z.enum(['en', 'hi', 'mixed', 'unknown']).describe('The primary language the AI focused on for generation. "mixed" if both were substantially present and no preference resolved it, "unknown" if unclear.'),
});

export type GenerateQuestionsFromSyllabusOutput = z.infer<typeof GenerateQuestionsFromSyllabusOutputSchema>;

export async function generateQuestionsFromSyllabus(input: GenerateQuestionsFromSyllabusInput): Promise<GenerateQuestionsFromSyllabusOutput> {
  return generateQuestionsFromSyllabusFlow(input);
}

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateQuestionsFromSyllabusPrompt',
  input: {schema: GenerateQuestionsFromSyllabusInputSchema},
  output: {schema: GenerateQuestionsFromSyllabusOutputSchema},
  prompt: `You are an expert curriculum designer and question generator.
Your task is to generate a set of multiple-choice questions based on the provided syllabus.
If the number of questions to generate is 0, return an empty 'questions' array.

Syllabus Text:
{{{syllabusText}}}

Number of questions to generate: {{{numQuestions}}}
Desired difficulty level: {{{difficultyLevel}}}

{{#if preferredLanguage}}
The user has a preferred language for the questions: {{{preferredLanguage}}}. Generate questions in this language.
Set 'extractedLanguage' to '{{preferredLanguage}}'.
Set 'requiresLanguageChoice' to false.
{{else}}
Analyze the syllabus text for its primary language (English or Hindi).
If the syllabus is clearly in one language, generate questions in that language and set 'extractedLanguage' accordingly ('en' or 'hi'). Set 'requiresLanguageChoice' to false.
If the syllabus language is ambiguous or mixed, and you need a language preference to proceed effectively:
  Set 'requiresLanguageChoice' to true.
  Set 'extractedLanguage' to 'mixed'.
  You can provide an empty 'questions' array, or attempt to generate from what appears tobe the primary language if it's a clear mix.
Else (e.g., language is neither English nor Hindi, or cannot determine):
  Set 'requiresLanguageChoice' to false.
  Set 'extractedLanguage' to 'unknown'.
  Provide an empty 'questions' array.
{{/if}}

For each question:
- Ensure it is relevant to the syllabus content.
- Create 4 distinct multiple-choice options.
- Clearly indicate the correct answer.
- Adhere to the specified difficulty level ({{difficultyLevel}}).

Format the output according to the defined JSON schema. Ensure 'questions' is an array of {{{numQuestions}}} items (or fewer if not possible, or empty if numQuestions is 0), and all fields like 'requiresLanguageChoice' and 'extractedLanguage' are present.
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
});

const generateQuestionsFromSyllabusFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFromSyllabusFlow',
    inputSchema: GenerateQuestionsFromSyllabusInputSchema,
    outputSchema: GenerateQuestionsFromSyllabusOutputSchema,
  },
  async (input: GenerateQuestionsFromSyllabusInput): Promise<GenerateQuestionsFromSyllabusOutput> => {
    if (input.numQuestions === 0) {
      return {
        questions: [],
        requiresLanguageChoice: false,
        extractedLanguage: input.preferredLanguage || 'unknown',
      };
    }
    const {output} = await generateQuestionsPrompt(input);

    if (!output) {
        return {
            questions: [],
            requiresLanguageChoice: !input.preferredLanguage,
            extractedLanguage: 'unknown',
        };
    }
    
    const questions = output.questions || [];
    const extractedLanguage = output.extractedLanguage || 'unknown';
    let requiresLanguageChoice = output.requiresLanguageChoice;

    if (typeof requiresLanguageChoice !== 'boolean') {
        if (input.preferredLanguage) {
            requiresLanguageChoice = false;
        } else {
            requiresLanguageChoice = extractedLanguage === 'mixed';
        }
    }

    return {
        questions: questions.slice(0, input.numQuestions), 
        requiresLanguageChoice: requiresLanguageChoice,
        extractedLanguage: extractedLanguage,
    };
  }
);
