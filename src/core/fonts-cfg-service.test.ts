import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import { FontsCfgIO, FontsCfgService } from './fonts-cfg-service';

const nodeIo: FontsCfgIO = {
  async read(path) {
    const buf = await fs.readFile(path);
    return buf.toString('utf16le');
  },
  async write(path, c) {
    const buf = Buffer.from(c, 'utf16le');
    await fs.writeFile(path, buf);
  },
  async backup(path) {
    try {
      await fs.stat(`${path}.bak`);
      return; // already exists
    } catch {
      await fs.copyFile(path, `${path}.bak`);
    }
  },
  async restore(path) {
    await fs.copyFile(`${path}.bak`, path);
    await fs.rm(`${path}.bak`);
  },
};

const stripBom = (s: string) => (s.charCodeAt(0) === 0xfeff ? s.slice(1) : s);

describe('FontsCfgService', () => {
  let svc: FontsCfgService;
  let tmpDir: string;
  let tmpFile: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kb-fonts-'));
    tmpFile = path.join(tmpDir, 'fonts.fixture.cfg');

    const fixturePath = path.join(process.cwd(), 'fixtures', 'fonts.fixture.cfg');
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

    it('does not overwrite an existing .bak', async () => {
      const original = await nodeIo.read(tmpFile);

      await svc.backup();

      const sentinel = stripBom(original) + '\nSENTINEL';
      await nodeIo.write(`${tmpFile}.bak`, sentinel);

      await svc.backup();

      const bakAfter = await nodeIo.read(`${tmpFile}.bak`);
      expect(stripBom(bakAfter)).toBe(stripBom(sentinel));
    });
  });

  describe('restore', () => {
    it('restores original contents', async () => {
      const original = await nodeIo.read(tmpFile);

      await svc.backup();

      // mutate original to simulate a bad edit/resize
      await nodeIo.write(tmpFile, original.replace(/default=font,(\d+)/, (_, n) => `default=font,${Number(n) + 1}`));

      await svc.restore();

      const restored = await nodeIo.read(tmpFile);
      expect(stripBom(restored)).toBe(stripBom(original));
    });

    it('deletes .bak after successful restore', async () => {
      const original = await nodeIo.read(tmpFile);

      await svc.backup();

      await nodeIo.write(
        tmpFile,
        original.replace(/default=font,(\d+)/, (_, n) => `default=font,${Number(n) + 1}`),
      );

      await svc.restore();

      const restored = await nodeIo.read(tmpFile);
      expect(stripBom(restored)).toBe(stripBom(original));

      await expect(fs.stat(`${tmpFile}.bak`)).rejects.toBeTruthy();
    });

    it('fails with a clear error when no backup exists', async () => {
      await expect(svc.restore()).rejects.toThrow(/bak|backup|not found/i);
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

  it('does not overwrite existing .bak', async () => {
    const original = await nodeIo.read(tmpFile);

    await svc.resizeWithBackup(2);

    // poison the backup
    const sentinel = stripBom(original) + '\nSENTINEL';
    await nodeIo.write(`${tmpFile}.bak`, sentinel);

    await svc.resizeWithBackup(-2);

    const bakAfter = await nodeIo.read(`${tmpFile}.bak`);
    expect(stripBom(bakAfter)).toBe(stripBom(sentinel));

    const updated = await nodeIo.read(tmpFile);
    expect(stripBom(updated)).not.toBe(stripBom(original));
  });
});
