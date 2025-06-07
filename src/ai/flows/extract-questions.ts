'use server';

/**
 * @fileOverview This file defines a Genkit flow to extract multiple-choice questions from uploaded text or PDF files.
 *
 * - `extractQuestions`: Extracts and formats questions from a given text.
 * - `ExtractQuestionsInput`: The input type for the `extractQuestions` function.
 * - `ExtractQuestionsOutput`: The output type for the `extractQuestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractQuestionsInputSchema = z.object({
  text: z.string().describe('The text extracted from the uploaded file (PDF or plain text).'),
});

export type ExtractQuestionsInput = z.infer<typeof ExtractQuestionsInputSchema>;

const ExtractQuestionsOutputSchema = z.array(
  z.object({
    question: z.string().describe('The question text.'),
    options: z.array(z.string()).length(4).describe('Four possible answers to the question.'),
    answer: z.string().nullable().describe('The correct answer to the question, can be null if not available.'),
  })
);

export type ExtractQuestionsOutput = z.infer<typeof ExtractQuestionsOutputSchema>;

export async function extractQuestions(input: ExtractQuestionsInput): Promise<ExtractQuestionsOutput> {
  return extractQuestionsFlow(input);
}

const extractQuestionsPrompt = ai.definePrompt({
  name: 'extractQuestionsPrompt',
  input: {schema: ExtractQuestionsInputSchema},
  output: {schema: ExtractQuestionsOutputSchema},
  prompt: `You are an expert at extracting multiple-choice questions from text and generating reasonable defaults.

  Given the following text, extract the multiple-choice questions with 4 options each and format them as a JSON array.

  If options or answers are missing, generate reasonable ones.

  Text: {{{text}}}
  `, config: {
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
    return output!;
  }
);
