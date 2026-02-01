import { invoke } from '@tauri-apps/api/core';
import { DEV_FONTS_CFG_TEXT } from './dev-fonts-fixture';

export async function ensureDevFontsCfgExists(path: string): Promise<void> {
  const exists = await invoke<boolean>('fonts_cfg_exists', { path });
  if (exists) return;

  await invoke<void>('write_fonts_cfg', { path, content: DEV_FONTS_CFG_TEXT });
}
