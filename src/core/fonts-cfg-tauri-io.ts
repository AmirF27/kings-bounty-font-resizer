import { invoke } from '@tauri-apps/api/core';

import type { FontsCfgIO } from './fonts-cfg-service';

export const fontsCfgTauriIo: FontsCfgIO = {
  read: (path) => invoke<string>('read_fonts_cfg', { path }),
  write: (path, content) => invoke<void>('write_fonts_cfg', { path, content }),
};
