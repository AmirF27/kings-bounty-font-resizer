import { useEffect, useMemo, useRef, useState } from 'react';

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

  const [applyBusy, setApplyBusy] = useState(false);
  const [revertBusy, setRevertBusy] = useState(false);

  const [status, setStatus] = useState<string | null>(null);

  const busy = useMemo(() => applyBusy || revertBusy, [applyBusy, revertBusy]);

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

  function getServiceOrWarn(): FontsCfgService | null {
    const fontsCfg = fontsCfgRef.current;
    if (!fontsCfg) {
      setStatus('Not ready yet.');
      return null;
    }
    return fontsCfg;
  }

  async function runAction(opts: {
    setBusy: (busy: boolean) => void;
    action: (fontsCfg: FontsCfgService) => Promise<void>;
    successMessage: string;
    failureMessage: string;
  }) {
    setStatus(null);

    const fontsCfg = getServiceOrWarn();
    if (!fontsCfg) return;

    try {
      opts.setBusy(true);
      await opts.action(fontsCfg);
      setStatus(opts.successMessage);
    } catch (err) {
      console.error(err);
      setStatus(opts.failureMessage);
    } finally {
      opts.setBusy(false);
    }
  }

  async function applyChanges(e: React.FormEvent) {
    e.preventDefault();

    await runAction({
      setBusy: setApplyBusy,
      action: (fontsCfg) => fontsCfg.resizeWithBackup(delta),
      successMessage: 'Applied successfully.',
      failureMessage: 'Apply failed. Check console/logs.',
    });
  }

  async function revertChanges(e: React.MouseEvent) {
    e.preventDefault();

    await runAction({
      setBusy: setRevertBusy,
      action: (fontsCfg) => fontsCfg.restore(),
      successMessage: 'Reverted changes successfully.',
      failureMessage: 'Revert failed. Check console/logs.',
    });
  }

  return (
    <main className="flex min-h-screen justify-center items-center p-6">
      <form onSubmit={applyChanges} className="flex flex-col gap-4 w-full max-w-sm">
        <FontSizeStepper value={delta} onChange={setDelta} />

        <Button type="submit" disabled={!ready || busy}>
          {applyBusy ? 'Applying...' : 'Apply Changes'}
        </Button>

        <Button type="button" variant="secondary" onClick={revertChanges} disabled={!ready || busy}>
          {revertBusy ? 'Reverting...' : 'Revert Changes'}
        </Button>

        {status && <div className="text-sm">{status}</div>}
      </form>
    </main>
  );
}

export default App;
