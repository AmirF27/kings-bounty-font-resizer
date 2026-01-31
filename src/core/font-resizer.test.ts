import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { applyDelta } from './font-resizer';

const MIN_SIZE = 1;
const MAX_SIZE = 96;

async function readFixture() {
  const fixturePath = path.join(process.cwd(), 'fixtures', 'fonts.fixture.cfg');
  return readFile(fixturePath, 'utf16le');
}

function extractSizes(text: string): number[] {
  const re = /default\s*=\s*[^,]+,\s*(\d+)\s*,/g;
  return Array.from(text.matchAll(re), (m) => Number(m[1]));
}

describe('font-resizer', () => {
  it('no-op delta (0) returns identical text and no changes', async () => {
    const input = await readFixture();
    const result = applyDelta(input, 0);
    expect(result).toBe(input);
  });

  it('positive delta increases all font sizes', async () => {
    const input = await readFixture();
    const before = extractSizes(input);
    expect(before.length).toBeGreaterThan(0);

    const after = extractSizes(applyDelta(input, 2));
    expect(after.length).toBe(before.length);

    for (let i = 0; i < before.length; i++) {
      const expected = Math.min(MAX_SIZE, before[i] + 2);
      expect(after[i]).toBe(expected);
    }
  });

  it('negative delta decreases all font sizes', async () => {
    const input = await readFixture();
    const before = extractSizes(input);
    expect(before.length).toBeGreaterThan(0);

    const after = extractSizes(applyDelta(input, -3));
    expect(after.length).toBe(before.length);

    for (let i = 0; i < before.length; i++) {
      const expected = Math.max(MIN_SIZE, before[i] - 3);
      expect(after[i]).toBe(expected);
    }
  });

  it('clamps font sizes to the minimum value', () => {
    const input = `
      Fonts {
        font=calibri.ttf
        ft_small {
          default=font,2,1,1,0,0,0
        }
      }
      `.trimEnd();

    const output = applyDelta(input, -10);
    const sizes = extractSizes(output);

    expect(sizes).toEqual([1]);
  });

  it('clamps font sizes to the maximum value', () => {
    const input = `
      Fonts {
        font=calibri.ttf
        ft_test {
          default=font,95,1,1,0,0,0
        }
      }
      `.trimEnd();

    const output = applyDelta(input, 10);
    const sizes = extractSizes(output);

    expect(sizes).toEqual([MAX_SIZE]);
  });

  it('preserves comments and structure', async () => {
    const input = await readFixture();
    const output = applyDelta(input, 1);

    expect(output).toContain('// Synthetic test fixture');
    expect(output).toContain('Fonts {');
    expect(output).toMatch(/^\s*font\s*=\s*calibri\.ttf\s*$/m);
    expect(output).toMatch(/^\s*ft1_12\s*\{/m);
  });
});
