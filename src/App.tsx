import { useState } from 'react';

import './App.css';
import FontSizeStepper from './components/font-size-stepper/font-size-stepper';
import { Button } from './components/ui/button';
import { FontsCfgService } from './core/fonts-cfg-service';
import { fontsCfgTauriIo } from './core/fonts-cfg-tauri-io';

function App() {
  const fontsCfg = new FontsCfgService(fontsCfgTauriIo, 'fonts.cfg');

  const [delta, setDelta] = useState(2);

  async function applyChanges(e: React.FormEvent) {
    e.preventDefault();
    await fontsCfg.resizeWithBackup(delta);
  };

  return (
    <main className="flex justify-center items-center">
      <form onSubmit={applyChanges} className="flex flex-col gap-4">
        <FontSizeStepper value={delta} onChange={setDelta} />
        <Button type="submit">Apply Changes</Button>
      </form>
    </main>
  );
}

export default App;
