import { marked } from "marked";

// Configure marked for clean output
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function formatMarkdown(markdown: string): string {
  return marked.parse(markdown);
}

export const cleanOCRText = (text: string): string => {
  return text
    // Convert various bullet symbols to dashes
    .replace(/^\s*[\*\•\-\+]\s+/gm, '- ')
    // Fix spacing around colons
    .replace(/\s*:\s*/g, ': ')
    // Remove extra spaces
    .replace(/\s+/g, ' ')
    // Clean line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
};