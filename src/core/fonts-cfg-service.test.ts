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
  async backup(p) {
    await fs.copyFile(p, `${p}.bak`);
  },
  async restore(p) {
    await fs.copyFile(`${p}.bak`, p);
  },
};

const stripBom = (s: string) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);

describe('FontsCfgService', () => {
  let svc: FontsCfgService;
  let tmpDir: string;
  let tmpFile: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kb-fonts-'));
    tmpFile = path.join(tmpDir, 'fonts.cfg');

    const fixturePath = path.join(process.cwd(), 'fixtures', 'fonts.cfg');
    await fs.copyFile(fixturePath, tmpFile);

    svc = new FontsCfgService(nodeIo, tmpFile);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe('resize', () => {
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

  describe('backup', () => {
    it('creates .bak identical to original', async () => {
      const original = await nodeIo.read(tmpFile);

      await svc.backup();

      const bak = await nodeIo.read(`${tmpFile}.bak`);
      expect(stripBom(bak)).toBe(stripBom(original));
    });
  });

  describe('restore', () => {
    it('restores original contents and keeps .bak', async () => {
      const original = await nodeIo.read(tmpFile);

      await svc.backup();

      // mutate original to simulate a bad edit/resize
      await nodeIo.write(tmpFile, original.replace(/default=font,(\d+)/, (_, n) => `default=font,${Number(n) + 1}`));

      await svc.restore();

      const restored = await nodeIo.read(tmpFile);
      expect(stripBom(restored)).toBe(stripBom(original));

      const bak = await nodeIo.read(`${tmpFile}.bak`);
      expect(stripBom(bak)).toBe(stripBom(original));
    });
  });

  describe('resizeWithBackup', () => {
    it('backs up first, then modifies file', async () => {
      const original = await nodeIo.read(tmpFile);

      await svc.resizeWithBackup(2);

      const bak = await nodeIo.read(`${tmpFile}.bak`);
      expect(stripBom(bak)).toBe(stripBom(original));

      const updated = await nodeIo.read(tmpFile);
      expect(stripBom(updated)).not.toBe(stripBom(original));
    });
  });
});
