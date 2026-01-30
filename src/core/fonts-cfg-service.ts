import { applyDelta } from './font-resizer';

export interface FontsCfgIO {
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  backup(path: string): Promise<void>;
  restore(path: string): Promise<void>;
}

export class FontsCfgService {
  constructor(private readonly io: FontsCfgIO, private path: string) {}

  async resize(delta: number): Promise<void> {
    const text = await this.io.read(this.path);
    const updated = applyDelta(text, delta);
    await this.io.write(this.path, updated);
  }

  async backup(): Promise<void> {
    await this.io.backup(this.path);
  }

  async restore(): Promise<void> {
    await this.io.restore(this.path);
  }

  async resizeWithBackup(delta: number): Promise<void> {
    await this.backup();
    await this.resize(delta);
  }

  async backupExists(): Promise<boolean> {
    // TODO: implement
    return false;
  }
}
