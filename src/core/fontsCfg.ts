import { invoke } from '@tauri-apps/api/core';

export async function readFontsCfg(path: string): Promise<string> {
  return invoke<string>('read_fonts_cfg', { path });
}

export async function writeFontsCfg(path: string, content: string, makeBackup = true): Promise<void> {
  return invoke<void>('write_fonts_cfg', { path, content, makeBackup });
}
