"use client";

import * as pdfjsLib from 'pdfjs-dist';

// Dynamically import the worker script. Note: This is crucial for Next.js.
// The path might need adjustment based on your public folder structure or build process.
// For pdfjs-dist v4.x, the worker is an ES module.
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
}


export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => {
      if ('str' in item) { // Type guard for TextItem
        return item.str;
      }
      return '';
    }).join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}
