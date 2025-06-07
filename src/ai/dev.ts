
import { config } from 'dotenv';
config();

import '@/ai/flows/extract-questions.ts';
import '@/ai/flows/score-test.ts';
import '@/ai/flows/generate-questions-from-syllabus.ts';
import '@/ai/flows/generate-questions-from-topic.ts';

