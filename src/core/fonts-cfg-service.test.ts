import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import { FontsCfgIO, FontsCfgService } from './fonts-cfg-service';

const nodeIo: FontsCfgIO = {
  async read(p) {
    const buf = await fs.readFile(p);
    return buf.toString('utf16le');
  },
  async write(p, c) {
    const buf = Buffer.from(c, 'utf16le');
    await fs.writeFile(p, buf);
  },
};

describe('FontsCfgService.resizeInPlace', () => {
  let svc: FontsCfgService;
  let tmpDir: string;
  let tmpFile: string;

  beforeEach(async () => {
    svc = new FontsCfgService(nodeIo, tmpFile);
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kb-fonts-'));
    tmpFile = path.join(tmpDir, 'fonts.cfg');

    const fixturePath = path.join(process.cwd(), 'fixtures', 'fonts.cfg');
    await fs.copyFile(fixturePath, tmpFile);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('writes updated sizes without touching the fixture', async () => {
    await svc.resize(2);

    const updated = await nodeIo.read(tmpFile);
    expect(updated).not.toBe('');
    expect(updated).toMatch(/default=font,16,1,1,0,0,0/);
  });

  it('supports negative deltas', async () => {
    await svc.resize(-2);
    const updated = await nodeIo.read(tmpFile);
    expect(updated).toMatch(/default=font,12,1,1,0,0,0/);
  });
});
