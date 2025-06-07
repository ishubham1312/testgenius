# **App Name**: TestGenius

## Core Features:

- Input Upload: Users can upload PDF or text files containing multiple-choice questions for test generation.
- AI Question Extraction: Use Gemini AI via API to extract and structure questions with four options from uploaded text into JSON format. AI tool will attempt to create missing options or answers.
- Test Interface: Dynamically render multiple-choice questions with radio button options in a mock test interface.
- Answer Key Upload: Option to upload an answer key as text or JSON to automatically score the test.
- AI Scoring: If no answer key is provided, use AI via Gemini API to provide correct answers and score the test, displaying correct/incorrect answers.
- Results Display: Display total questions, user's answers, correct answers, and the final score in a results summary.
- Dark Mode: Simple UI with a dark mode toggle using React and a modern UI library.

## Style Guidelines:

- Primary color: Saturated blue (#29ABE2) to convey intelligence and focus.
- Background color: Light gray (#F0F0F0) to ensure readability and a clean interface.
- Accent color: Soft teal (#76DDF1) to highlight important actions and results.
- Headline font: 'Space Grotesk' (sans-serif) for headlines; body font: 'Inter' (sans-serif) for main content.
- Code font: 'Source Code Pro' for displaying JSON and code snippets.
- Use clear and concise icons to represent actions and feedback.
- Subtle animations during question extraction and score calculation to improve user experience.