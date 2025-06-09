
'use server';

/**
 * @fileOverview This file defines a Genkit flow to extract multiple-choice questions from uploaded text or PDF files.
 * It can handle multilingual content (English/Hindi) by prompting for user preference if ambiguity is detected.
 * It also attempts to structure "Match the List" questions.
 *
 * - `extractQuestions`: Extracts and formats questions from a given text, potentially considering language preference.
 * - `ExtractQuestionsInput`: The input type for the `extractQuestions` function.
 * - `ExtractQuestionsOutput`: The output type for the `extractQuestions` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractQuestionsInputSchema = z.object({
  text: z.string().describe('The text extracted from the uploaded file (PDF or plain text). This text might be messy, fragmented, or contain OCR errors.'),
  preferredLanguage: z.enum(['en', 'hi']).optional().describe('If provided, the AI will prioritize extracting questions in this language.'),
});

export type ExtractQuestionsInput = z.infer<typeof ExtractQuestionsInputSchema>;

const RawQuestionObjectSchema = z.object({
  questionType: z.enum(['mcq', 'match']).describe("The type of question: 'mcq' for multiple-choice, 'match' for 'Match the List' questions."),
  question: z.string().describe('The main text of the question. For "match" type, this is the introductory text like "Match List-I with List-II". This field MUST contain the actual textual content, not just a question number or label.'),
  listI: z.any().optional().describe('For "match" type questions: An object representing List-I, where keys are item identifiers (e.g., "A", "B") and values are their textual descriptions. Omit if not a "match" type or not present.'),
  listII: z.any().optional().describe('For "match" type questions: An object representing List-II, where keys are item identifiers (e.g., "I", "II") and values are their textual descriptions. Omit if not a "match" type or not present.'),
  options: z.array(z.string()).length(4).describe('Four possible answers. For "mcq", these are the choices. For "match", these are the combined textual options (e.g., "A-IV, B-II, C-I, D-III"). Each option string MUST contain substantial textual content, not just an option letter/number.'),
  answer: z.string().nullable().describe('The correct answer. For "mcq", it is one of the strings from the options array. For "match", it is the string of the correct combined option. Can be null if the AI cannot confidently determine or generate an answer.'),
});

const QuestionObjectSchema = z.object({
  questionType: z.enum(['mcq', 'match']),
  question: z.string(),
  listI: z.record(z.string()).nullable().describe("For 'match' type: List I items. Null otherwise."),
  listII: z.record(z.string()).nullable().describe("For 'match' type: List II items. Null otherwise."),
  options: z.array(z.string()).length(4),
  answer: z.string().nullable(),
});


const ExtractQuestionsOutputSchema = z.object({
  questions: z.array(RawQuestionObjectSchema).describe('An array of extracted questions. This might be empty if no questions are found or if language choice is required and not yet provided.'),
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
  prompt: `You are an expert AI assistant specialized in extracting and structuring questions from potentially messy and poorly formatted text, often sourced from PDF documents. The text can have OCR errors, inconsistent spacing, broken lines, and non-standard numbering. Your task is to meticulously parse this text and convert any identifiable questions into a structured JSON format.

The input text may contain questions in English, Hindi, or both.

Input text:
{{{text}}}

**General Instructions & Handling "Weird Formats":**
1.  **Flexibility is Key**: The input can be very irregular. Do not assume standard formatting. Look for contextual clues, repeated patterns (even if odd), and keywords like "Question", "Q.", "Options", "Answer", "Match List", etc., to identify question blocks. Be prepared for text that might be jumbled, have OCR errors, or inconsistent spacing.
2.  **Reconstruct Content**: Strive to reconstruct the full textual meaning of questions and options, even if they are split across multiple lines or interrupted by noise. Piece together fragmented information.
3.  **Noise Reduction**: Ignore irrelevant page headers, footers, page numbers, and other non-question content.
4.  **Prioritize Core Text**: The \\\`question\\\` field for any question type must contain the full, meaningful text of the question itself, not just a number or label. Similarly, each string in the \\\`options\\\` array must contain the full textual content of that choice. Option A, B, C, D or 1, 2, 3, 4 prefixes should be stripped from the option text unless they are part of the option's core meaning.
5.  **Minimum Content**: Ensure that the \`question\` text and each \`option\` text are substantial and not just whitespace or very short, non-descriptive labels. If you cannot extract meaningful content for a question or its options, it's better to omit that question.
6.  **Four Options**: Always provide exactly four options. If the source has fewer, generate plausible distractors. If more, select the most relevant four or summarize. For "Match the List", ensure the combined textual options provided in the \`options\` array are four distinct choices.
7.  **Answer Generation**: If a correct answer is not explicitly provided or is unclear in the source, try to determine the most logical answer based on the question and options. If still unsure, the \`answer\` field can be null.

**Language Handling:**
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

**Output Structure and Examples:**

**For Multiple Choice Questions (MCQ):**
Set \`questionType\` to "mcq".
The \`question\` field is the question text.
\`options\` is an array of 4 strings.
\`answer\` is the string of the correct option.
\`listI\` and \`listII\` should be omitted or explicitly null (if omitting, ensure the schema allows optional fields).

Example MCQ Input:
"Q. 23. Which of the following is a prime number?
   (a) Four
   (b) Seven
   (c) Nine
   (d) Ten
Correct Answer: b"

Example MCQ Output:
{
  "questionType": "mcq",
  "question": "Which of the following is a prime number?",
  "options": ["Four", "Seven", "Nine", "Ten"],
  "answer": "Seven"
}

**For "Match the List" Questions:**
Set \`questionType\` to "match".
The \`question\` field is the introductory text (e.g., "Match List-I with List-II and select the correct answer from the codes given below.").
\`listI\` is an object mapping labels (e.g., "A", "B") to their text. Ensure keys are strings and values are strings.
\`listII\` is an object mapping labels (e.g., "I", "II") to their text. Ensure keys are strings and values are strings.
\`options\` is an array of 4 strings, each representing a complete set of combined matches (e.g., "A-II, B-I, C-IV, D-III"). Strip any leading numbering (like "1.", "a)") from these combined options.
\`answer\` is the string of the correct combined option (e.g., "A-II, B-I, C-IV, D-III").

Example Match the List Input:
"5. Match List X (Authors) with List Y (Books).
List X
(A) Jane Austen
(B) George Orwell
(C) J.K. Rowling
List Y
(I) Harry Potter
(II) Pride and Prejudice
(III) 1984
Select the correct code:
  1. A-II, B-III, C-I
  2. A-I, B-II, C-III
  3. A-III, B-I, C-II
  4. A-II, B-I, C-III
Answer: 1"

Example Match the List Output:
{
  "questionType": "match",
  "question": "Match List X (Authors) with List Y (Books).",
  "listI": {
    "A": "Jane Austen",
    "B": "George Orwell",
    "C": "J.K. Rowling"
  },
  "listII": {
    "I": "Harry Potter",
    "II": "Pride and Prejudice",
    "III": "1984"
  },
  "options": ["A-II, B-III, C-I", "A-I, B-II, C-III", "A-III, B-I, C-II", "A-II, B-I, C-III"],
  "answer": "A-II, B-III, C-I"
}

---
Now, process the provided input text and return the structured JSON according to these instructions.
Ensure your entire response is a single JSON object matching the ExtractQuestionsOutputSchema.
The 'questions' array within the output should only contain fully formed question objects as per the schemas described.
If no questions can be confidently extracted, the 'questions' array should be empty.
Pay close attention to the \`requiresLanguageChoice\` and \`extractedLanguage\` fields based on your analysis of the input text and any \`preferredLanguage\`.
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

    if (!output) {
        return {
            questions: [],
            requiresLanguageChoice: !input.preferredLanguage,
            extractedLanguage: 'unknown',
        };
    }

    const rawQuestions = output.questions || [];
    let validatedQuestions: QuestionObjectSchema[] = [];

    if (Array.isArray(rawQuestions)) {
        validatedQuestions = rawQuestions.reduce((acc: QuestionObjectSchema[], q) => {
            if (!q || typeof q.questionType !== 'string' || typeof q.question !== 'string' || !Array.isArray(q.options) || q.options.length !== 4) {
                console.warn("Skipping malformed question object (core fields):", q);
                return acc;
            }
            if (q.question.trim() === '') {
                console.warn("Skipping question with empty question text:", q);
                return acc;
            }
            if (q.options.some(opt => typeof opt !== 'string' || opt.trim() === '')) {
                console.warn("Skipping question with empty or non-string options:", q);
                return acc;
            }


            let finalQuestion: QuestionObjectSchema = {
                questionType: q.questionType as 'mcq' | 'match',
                question: q.question,
                options: q.options,
                answer: (typeof q.answer === 'string' && q.answer.trim() !== '') ? q.answer : null,
                listI: null,
                listII: null,
            };

            if (q.questionType === 'match') {
                let listIValid = false;
                let listIIValid = false;

                if (q.listI && typeof q.listI === 'object' && !Array.isArray(q.listI) && Object.keys(q.listI).length > 0) {
                    const allListIValuesAreStrings = Object.values(q.listI).every(val => typeof val === 'string');
                    if (allListIValuesAreStrings) {
                        finalQuestion.listI = q.listI as Record<string, string>;
                        listIValid = true;
                    } else {
                        console.warn("Skipping 'match' question due to non-string values in listI:", q);
                    }
                } else if (q.listI !== undefined) { // Allow omission, but if present, must be valid
                    console.warn("Skipping 'match' question due to invalid or empty listI structure:", q);
                } else { // listI is undefined (omitted by AI), which is acceptable for a match question if it couldn't find it.
                    listIValid = true; // Or false, depending on strictness. Let's assume for now it can be omitted.
                }


                if (q.listII && typeof q.listII === 'object' && !Array.isArray(q.listII) && Object.keys(q.listII).length > 0) {
                     const allListIIValuesAreStrings = Object.values(q.listII).every(val => typeof val === 'string');
                    if (allListIIValuesAreStrings) {
                        finalQuestion.listII = q.listII as Record<string, string>;
                        listIIValid = true;
                    } else {
                         console.warn("Skipping 'match' question due to non-string values in listII:", q);
                    }
                } else if (q.listII !== undefined) {
                     console.warn("Skipping 'match' question due to invalid or empty listII structure:", q);
                } else {
                    listIIValid = true; // Similar to listI, assuming omission is possible.
                }
                
                // If either list was present but invalid, we might skip the question or handle it.
                // For now, if they were *meant* to be there (i.e., questionType is 'match') but are invalid/missing critical content,
                // it might be better to skip, unless the AI is explicitly told it can omit them.
                // The current prompt implies they *should* be there for "match" type.
                // Let's be strict: if it's a match type, it should have valid lists if the AI provides them.
                // If the AI omits listI/listII for a match type, our current schema z.any().optional() allows this.
                // The validation below will ensure that IF listI/listII are provided for a 'match' question, they are proper records.
                // If they are not provided (undefined), they will remain null.
                // The main issue for "match" is if listI/II are provided but are not objects or contain non-string values.

                if (q.listI !== undefined && !listIValid) return acc; // listI was provided but invalid
                if (q.listII !== undefined && !listIIValid) return acc; // listII was provided but invalid

            }
            acc.push(finalQuestion);
            return acc;
        }, []);
    }


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
        questions: validatedQuestions,
        requiresLanguageChoice: requiresLanguageChoice,
        extractedLanguage: extractedLanguage,
    };
  }
);
