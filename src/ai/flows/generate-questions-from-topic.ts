
'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate multiple-choice questions from a given topic.
 * It allows specifying the number of questions, difficulty level, and language preference.
 *
 * - `generateQuestionsFromTopic`: Generates questions based on topic, count, difficulty, and language.
 * - `GenerateQuestionsFromTopicInput`: The input type for the function.
 * - `GenerateQuestionsFromTopicOutput`: The output type for the function (mirrors ExtractQuestionsOutput).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Reusing schemas from other flows for consistency
const QuestionObjectSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).length(4).describe('Four possible answers to the question.'),
  answer: z.string().nullable().describe('The correct answer to the question, can be null if not available.'),
});

const GenerateQuestionsFromTopicInputSchema = z.object({
  topic: z.string().describe('The topic(s) to generate questions about.'),
  numQuestions: z.number().int().min(5).max(50).describe('The desired number of questions to generate (5-50).'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).describe('The desired difficulty level for the questions.'),
  preferredLanguage: z.enum(['en', 'hi']).optional().describe('If provided, the AI will prioritize generating questions in this language.'),
});

export type GenerateQuestionsFromTopicInput = z.infer<typeof GenerateQuestionsFromTopicInputSchema>;

const GenerateQuestionsFromTopicOutputSchema = z.object({
  questions: z.array(QuestionObjectSchema).describe('An array of generated multiple-choice questions.'),
  requiresLanguageChoice: z.boolean().describe('Indicates if language choice is needed. Default to false if generation is straightforward.'),
  extractedLanguage: z.enum(['en', 'hi', 'mixed', 'unknown']).describe('The primary language for generation.'),
});

export type GenerateQuestionsFromTopicOutput = z.infer<typeof GenerateQuestionsFromTopicOutputSchema>;

export async function generateQuestionsFromTopic(input: GenerateQuestionsFromTopicInput): Promise<GenerateQuestionsFromTopicOutput> {
  return generateQuestionsFromTopicFlow(input);
}

const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateQuestionsFromTopicPrompt',
  input: {schema: GenerateQuestionsFromTopicInputSchema},
  output: {schema: GenerateQuestionsFromTopicOutputSchema},
  prompt: `You are an expert curriculum designer and question generator.
Your task is to generate multiple-choice questions based on the provided topic(s).

Topic(s): {{{topic}}}
Number of questions to generate: {{{numQuestions}}} (must be between 5 and 50)
Desired difficulty level: {{{difficultyLevel}}}

{{#if preferredLanguage}}
The user has a preferred language: {{{preferredLanguage}}}. Generate questions in this language.
Set 'extractedLanguage' to '{{preferredLanguage}}'.
Set 'requiresLanguageChoice' to false.
{{else}}
Generate questions in English by default.
Set 'extractedLanguage' to 'en'.
Set 'requiresLanguageChoice' to false.
If the topic itself strongly implies a specific language (e.g., "Hindi Grammar"), then use that language and set 'extractedLanguage' accordingly.
{{/if}}

For each question:
- Ensure it is relevant to the topic(s): {{{topic}}}.
- Create 4 distinct multiple-choice options.
- Clearly indicate the correct answer.
- Adhere to the specified difficulty level ({{difficultyLevel}}).
- Ensure questions are suitable for a general audience unless the topic implies a specific one.
- For matching questions, list items clearly. For bullet points, use standard markdown list format.

Format the output according to the defined JSON schema. Ensure 'questions' is an array of {{{numQuestions}}} items (or fewer if not possible), and all fields like 'requiresLanguageChoice' and 'extractedLanguage' are present.
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

const generateQuestionsFromTopicFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFromTopicFlow',
    inputSchema: GenerateQuestionsFromTopicInputSchema,
    outputSchema: GenerateQuestionsFromTopicOutputSchema,
  },
  async (input: GenerateQuestionsFromTopicInput): Promise<GenerateQuestionsFromTopicOutput> => {
    // The numQuestions is now validated by Zod to be between 5 and 50.
    // The explicit check for numQuestions === 0 is no longer needed here.

    const {output} = await generateQuestionsPrompt(input);

    if (!output) {
        return {
            questions: [],
            requiresLanguageChoice: !input.preferredLanguage,
            extractedLanguage: input.preferredLanguage || 'unknown',
        };
    }
    
    const questions = output.questions || [];
    const extractedLanguage = output.extractedLanguage || (input.preferredLanguage || 'en');
    let requiresLanguageChoice = output.requiresLanguageChoice;

    if (typeof requiresLanguageChoice !== 'boolean') {
        requiresLanguageChoice = false; 
    }

    return {
        questions: questions.slice(0, input.numQuestions), 
        requiresLanguageChoice: requiresLanguageChoice,
        extractedLanguage: extractedLanguage as 'en' | 'hi' | 'mixed' | 'unknown',
    };
  }
);
