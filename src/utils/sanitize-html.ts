/**
 * HTML sanitization wrapper using DOMPurify
 * Use this for all dangerouslySetInnerHTML content
 */
import DOMPurify from 'dompurify';

const SAFE_TAGS = [
  'b', 'i', 'strong', 'em', 'br', 'p', 'ul', 'ol', 'li', 'a',
  'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'img', 'hr', 'sub', 'sup',
];

const SAFE_ATTRS = [
  'href', 'target', 'rel', 'class', 'style', 'src', 'alt', 'width', 'height',
];

export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: SAFE_TAGS,
    ALLOWED_ATTR: SAFE_ATTRS,
    ALLOW_DATA_ATTR: false,
  });
}
