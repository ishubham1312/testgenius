import { generate } from 'genkit';
import { z } from 'zod';
import {
  GenerateQuestionsFromTopicInput,
  GenerateQuestionsFromTopicOutput,
} from '@/types';

export const generateQuestionsFromTopic = async (
  input: GenerateQuestionsFromTopicInput,
): Promise<GenerateQuestionsFromTopicOutput> => {
  const { topic, numQuestions, difficultyLevel, preferredLanguage } = input;

  const prompt = `Generate ${numQuestions} multiple-choice questions about the topic "${topic}". The difficulty level should be ${difficultyLevel}. Provide the questions, options (as an array of strings), and the correct answer (as a string matching one of the options) in a JSON array format. Ensure the output is ONLY the JSON object. If you are uncertain about the language of the topic and think a language selection might be needed for better results, include requiresLanguageChoice: true. Otherwise, set it to false. Prioritize generating questions in ${preferredLanguage || 'English'} if a preferred language is specified.

  Example JSON format:
  {
    "questions": [
      {
        "question": "What is the capital of France?",
        "options": ["London", "Berlin", "Paris", "Madrid"],
        "answer": "Paris"
      },
      {
        "question": "Which planet is known as the Red Planet?",
        "options": ["Earth", "Mars", "Jupiter", "Venus"],
        "answer": "Mars"
      }
    ],
    "requiresLanguageChoice": false
  }
  `;

  const result = await generate({
    model: 'gemini-1.5-flash-latest', // Or your preferred model
    prompt: prompt,
    config: {
      responseSchema: z.object({
        questions: z.array(
          z.object({
            question: z.string(),
            options: z.array(z.string()),
            answer: z.string(),
          }),
        ),
        requiresLanguageChoice: z.boolean(),
      }),
      temperature: 0.7,
    },
  });

  // Assuming the model's response is directly the parsed JSON due to responseSchema
  // You might need additional parsing/validation depending on the model's behavior
  const output = result.response() as GenerateQuestionsFromTopicOutput;

  // Basic validation to ensure questions array is present
  if (!output || !Array.isArray(output.questions)) {
    console.error('AI did not return questions in the expected format:', output);
    throw new Error('Failed to generate questions. AI response format was incorrect.');
  }

  return output;
};