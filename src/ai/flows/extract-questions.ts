
'use server';

/**
 * @fileOverview This file defines a Genkit flow to extract multiple-choice questions from uploaded text or PDF files.
 * It can handle multilingual content (English/Hindi) by prompting for user preference if ambiguity is detected.
 *
 * - `extractQuestions`: Extracts and formats questions from a given text, potentially considering language preference.
 * - `ExtractQuestionsInput`: The input type for the `extractQuestions` function.
 * - `ExtractQuestionsOutput`: The output type for the `extractQuestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractQuestionsInputSchema = z.object({
  text: z.string().describe('The text extracted from the uploaded file (PDF or plain text).'),
  preferredLanguage: z.enum(['en', 'hi']).optional().describe('If provided, the AI will prioritize extracting questions in this language.'),
});

export type ExtractQuestionsInput = z.infer<typeof ExtractQuestionsInputSchema>;

const QuestionObjectSchema = z.object({
  question: z.string().describe('The question text.'),
  options: z.array(z.string()).length(4).describe('Four possible answers to the question.'),
  answer: z.string().nullable().describe('The correct answer to the question, can be null if not available.'),
});

const ExtractQuestionsOutputSchema = z.object({
  questions: z.array(QuestionObjectSchema).describe('An array of extracted multiple-choice questions.'),
  requiresLanguageChoice: z.boolean().describe('True if the AI detected significant presence of both Hindi and English, and a preferred language was not specified or was insufficient to resolve ambiguity.'),
  extractedLanguage: z.enum(['en', 'hi', 'mixed', 'unknown']).describe('The primary language the AI focused on for extraction. "mixed" if both were substantially present and no preference resolved it, "unknown" if unclear.'),
});

export type ExtractQuestionsOutput = z.infer<typeof ExtractQuestionsOutputSchema>;

export async function extractQuestions(input: ExtractQuestionsInput): Promise<ExtractQuestionsOutput> {
  return extractQuestionsFlow(input);
}

const extractQuestionsPrompt = ai.definePrompt({
  name: 'extractQuestionsPrompt',
  input: {schema: ExtractQuestionsInputSchema},
  output: {schema: ExtractQuestionsOutputSchema},
  prompt: `You are an expert at extracting multiple-choice questions from text.
The text may contain questions in English, Hindi, or both.

Input text:
{{{text}}}

{{#if preferredLanguage}}
The user has a preferred language: {{{preferredLanguage}}}. Prioritize extracting questions in this language.
Set 'extractedLanguage' to '{{preferredLanguage}}'.
Set 'requiresLanguageChoice' to false.
Extract questions primarily in the '{{preferredLanguage}}' language.
{{else}}
Analyze the text for the presence of English and Hindi questions.
If you detect significant content in BOTH English and Hindi:
  Set 'requiresLanguageChoice' to true.
  Set 'extractedLanguage' to 'mixed'.
  For the 'questions' array, you can provide an empty array, or attempt to extract from what appears to be the primary language or the first language encountered if it's a clear mix. If unsure, provide an empty array for questions.
Else if you detect questions predominantly in ONE language (English or Hindi):
  Set 'requiresLanguageChoice' to false.
  Set 'extractedLanguage' to that language ('en' or 'hi').
  Extract questions in that dominant language.
Else (e.g., language is neither English nor Hindi, or no questions found):
  Set 'requiresLanguageChoice' to false.
  Set 'extractedLanguage' to 'unknown'.
  Provide an empty 'questions' array.
{{/if}}

Extract the multiple-choice questions with 4 options each.
If options or answers are missing for a question in the target language (as determined above or preferred), generate reasonable ones.
Format the output according to the defined schema. Ensure 'questions' is an array.
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

const extractQuestionsFlow = ai.defineFlow(
  {
    name: 'extractQuestionsFlow',
    inputSchema: ExtractQuestionsInputSchema,
    outputSchema: ExtractQuestionsOutputSchema,
  },
  async input => {
    const {output} = await extractQuestionsPrompt(input);
    // Ensure questions is always an array, even if the LLM fails to provide it.
    if (!output) {
        return {
            questions: [],
            requiresLanguageChoice: !input.preferredLanguage, // If no preference, assume choice might be needed on error
            extractedLanguage: 'unknown',
        };
    }
    return {
        questions: output.questions || [],
        requiresLanguageChoice: output.requiresLanguageChoice,
        extractedLanguage: output.extractedLanguage,
    };
  }
);
