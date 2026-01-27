export const MIN_SIZE = 1;
export const MAX_SIZE = 96;

/**
 * Applies an additive delta to all "default=...,<size>,..." entries in fonts.cfg text
 * Preserves comments and non-matching lines. Font sizes are clamped between MIN_SIZE and MAX_SIZE.
 * If delta is 0, the input is returned unchanged.
 *
 * @param input Fonts config text to update
 * @param delta Amount to add (or subtract) from each font size
 * @returns Updated config text with font sizes changed
 */
export function applyDelta(input: string, delta: number): string {
  if (delta === 0) return input;

  const lines = input.split(/\r?\n/);
  const out = lines.map((line) => patchLine(line, delta));

  // Preserve original trailing newline behavior:
  // If input ended with newline, keep it.
  const joined = out.join('\n');
  const inputEndsWithNewline = /\r?\n$/.test(input);

  return inputEndsWithNewline ? joined + '\n' : joined;
}

function patchLine(line: string, delta: number): string {
  // Preserve full-line comments (common in this file)
  if (isComment(line)) return line;

  // Match: default=font,14,1,1,0,0,0  (with optional whitespace)
  // Captures:
  //  1) prefix up through the comma before the size
  //  2) the size number
  //  3) the rest of the line after the size
  const m = line.match(/^(\s*default\s*=\s*[^,]+,\s*)(\d+)(\s*,.*)$/);
  if (!m) return line;

  const prefix = m[1];
  const sizeStr = m[2];
  const suffix = m[3];

  const oldSize = Number(sizeStr);
  if (!Number.isFinite(oldSize)) return line;

  const newSize = clamp(oldSize + delta, MIN_SIZE, MAX_SIZE);
  return `${prefix}${newSize}${suffix}`;
}

function isComment(line: string): boolean {
  return line.trimStart().startsWith('//');
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
