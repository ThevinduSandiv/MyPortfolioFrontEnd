import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: false
});

export const renderMarkdown = (value) => {
  if (typeof value !== 'string' || !value.trim()) return '';
  return DOMPurify.sanitize(marked.parse(value));
};

export const calculateReadTime = (value) => {
  if (typeof value !== 'string' || !value.trim()) return 1;
  const words = value
    .replace(/[#_*`>\[\]()!-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
};
