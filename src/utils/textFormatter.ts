// Text formatting utilities for cleaning markdown and OCR text

export const formatMarkdownText = (text: string): string => {
  return text
    // Remove bold markdown (**text** -> text)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    // Remove italic markdown (*text* -> text)
    .replace(/\*(.*?)\*/g, '$1')
    // Convert bullet points to dashes
    .replace(/^\s*[\*\•\-]\s+/gm, '- ')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    // Clean up multiple line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Trim whitespace
    .trim();
};

export const cleanOCRText = (text: string): string => {
  return text
    // Remove markdown formatting
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
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