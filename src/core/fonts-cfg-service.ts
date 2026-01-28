import { applyDelta } from './font-resizer';

export interface FontsCfgIO {
  read(path: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
}

export class FontsCfgService {
  constructor(private readonly io: FontsCfgIO) {}

  async resizeInPlace(path: string, delta: number): Promise<void> {
    const text = await this.io.read(path);
    const updated = applyDelta(text, delta);
    await this.io.write(path, updated);
  }
}
