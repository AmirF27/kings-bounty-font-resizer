import { useEffect, useRef, useState } from 'react';

import FontSizeStepper from './components/font-size-stepper/font-size-stepper';
import { Button } from './components/ui/button';
import { FontsCfgService } from './core/fonts-cfg-service';
import { fontsCfgTauriIo } from './core/fonts-cfg-tauri-io';
import { ensureDevFontsCfgExists } from './core/ensure-dev-fonts-cfg';
import { resolveFontsCfgPath } from './core/fonts-cfg-path';

function App() {
  const fontsCfgRef = useRef<FontsCfgService | null>(null);

  const [delta, setDelta] = useState(2);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const cfgPath = await resolveFontsCfgPath();

        if (import.meta.env.DEV) {
          await ensureDevFontsCfgExists(cfgPath);
        }

        if (cancelled) return;

        fontsCfgRef.current = new FontsCfgService(fontsCfgTauriIo, cfgPath);
        setReady(true);
      } catch (err) {
        console.error(err);
        setStatus('Failed to initialize. Check console/logs.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  async function applyChanges(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    const fontsCfg = fontsCfgRef.current;
    if (!fontsCfg) {
      setStatus('Not ready yet.');
      return;
    }

    try {
      setBusy(true);
      await fontsCfg.resizeWithBackup(delta);
      setStatus('Applied successfully.');
    } catch (err) {
      console.error(err);
      setStatus('Apply failed. Check console/logs.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen justify-center items-center p-6">
      <form onSubmit={applyChanges} className="flex flex-col gap-4 w-full max-w-sm">
        <FontSizeStepper value={delta} onChange={setDelta} />

        <Button type="submit" disabled={!ready || busy}>
          {busy ? 'Applying...' : 'Apply Changes'}
        </Button>

        {status && <div className="text-sm">{status}</div>}
      </form>
    </main>
  );
}

export default App;
