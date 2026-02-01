import { appDataDir } from '@tauri-apps/api/path';
import { join } from '@tauri-apps/api/path';

/**
 * Resolve the path to fonts.cfg.
 *
 * DEV: use a sandbox file under the app data dir (safe; never touches real game files)
 * PROD: use fonts.cfg in the current working directory (expected: app is placed in game folder)
 */
export async function resolveFontsCfgPath(): Promise<string> {
  if (import.meta.env.DEV) {
    // Safe sandbox location (per-user)
    const dir = await appDataDir();
    return await join(dir, 'font-resizer', 'fonts.cfg');
  }

  // PROD: app lives in the game folder; fonts.cfg is next to it.
  // In Tauri, current working directory is typically the app launch dir.
  // (Can later replace this with a more robust "exe dir" approach if needed.)
  return 'fonts.cfg';
}
