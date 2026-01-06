export interface ParsedMention {
  sheet: string;
  startCell: string;
  endCell?: string;
  isRange: boolean;
}

/**
 * Parse a mention string like @Sheet1!A1:B3 or @Sheet1!A1
 */
export function parseMention(mention: string): ParsedMention | null {
  // Remove @ prefix if present
  const cleaned = mention.startsWith('@') ? mention.slice(1) : mention;
  
  // Match pattern: SheetName!CellOrRange
  const match = cleaned.match(/^([A-Za-z0-9_]+)!([A-Z]+\d+)(?::([A-Z]+\d+))?$/i);
  
  if (!match) {
    return null;
  }
  
  const [, sheet, startCell, endCell] = match;
  
  return {
    sheet,
    startCell: startCell.toUpperCase(),
    endCell: endCell?.toUpperCase(),
    isRange: !!endCell,
  };
}

/**
 * Extract all mentions from a text string
 */
export function extractMentions(text: string): ParsedMention[] {
  const mentionRegex = /@([A-Za-z0-9_]+![A-Z]+\d+(?::[A-Z]+\d+)?)/gi;
  const mentions: ParsedMention[] = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    const parsed = parseMention(match[1]);
    if (parsed) {
      mentions.push(parsed);
    }
  }
  
  return mentions;
}

/**
 * Format a mention for display
 */
export function formatMention(sheet: string, startCell: string, endCell?: string): string {
  if (endCell && endCell !== startCell) {
    return `@${sheet}!${startCell}:${endCell}`;
  }
  return `@${sheet}!${startCell}`;
}

/**
 * Check if a string contains any mentions
 */
export function hasMentions(text: string): boolean {
  return /@[A-Za-z0-9_]+![A-Z]+\d+/i.test(text);
}

/**
 * Replace mentions in text with a custom formatter
 */
export function replaceMentions(
  text: string,
  formatter: (mention: ParsedMention, original: string) => string
): string {
  return text.replace(
    /@([A-Za-z0-9_]+![A-Z]+\d+(?::[A-Z]+\d+)?)/gi,
    (match, mentionText) => {
      const parsed = parseMention(mentionText);
      if (parsed) {
        return formatter(parsed, match);
      }
      return match;
    }
  );
}
