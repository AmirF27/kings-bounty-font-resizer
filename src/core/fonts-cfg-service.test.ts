import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import { FontsCfgIO, FontsCfgService } from './fonts-cfg-service';

const nodeIo: FontsCfgIO = {
  read: (p: string) => fs.readFile(p, 'utf16le'),
  write: (p: string, c: string) => fs.writeFile(p, c, 'utf16le'),
};

describe('FontsCfgService.resizeInPlace', () => {
  let svc: FontsCfgService;
  let tmpDir: string;
  let tmpFile: string;

  beforeEach(async () => {
    svc = new FontsCfgService(nodeIo);
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kb-fonts-'));
    tmpFile = path.join(tmpDir, 'fonts.cfg');

    const fixturePath = path.join(process.cwd(), 'fixtures', 'fonts.cfg');
    await fs.copyFile(fixturePath, tmpFile);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('writes updated sizes without touching the fixture', async () => {
    await svc.resizeInPlace(tmpFile, 2);

    const updated = await nodeIo.read(tmpFile);
    expect(updated).not.toBe('');
    expect(updated).toMatch(/default=font,16,1,1,0,0,0/);
  });

  it('supports negative deltas', async () => {
    await svc.resizeInPlace(tmpFile, -2);
    const updated = await nodeIo.read(tmpFile);
    expect(updated).toMatch(/default=font,12,1,1,0,0,0/);
  });
});
