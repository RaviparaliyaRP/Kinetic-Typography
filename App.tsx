
import React, { useState, useCallback } from 'react';
import { EngineConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import CanvasEngine from './components/CanvasEngine';
import Controls from './components/Controls';

const App: React.FC = () => {
  const [config, setConfig] = useState<EngineConfig>(DEFAULT_CONFIG);
  const [fps, setFps] = useState<number>(0);

  const handleConfigChange = useCallback((newConfig: Partial<EngineConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const handleFpsUpdate = useCallback((newFps: number) => {
    setFps(newFps);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)]" />
      
      {/* HUD Info */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-[#00f0ff] font-mono text-lg font-bold tracking-[0.3em] uppercase opacity-40">
          Kinetic Typography
        </h1>
        <p className="text-white/20 font-mono text-[10px] tracking-widest mt-1">
          PX-EXPLOSION ENGINE V2.5.0 // [READY]
        </p>
      </div>

      {/* Main Engine */}
      <CanvasEngine config={config} onFpsUpdate={handleFpsUpdate} />

      {/* Interface */}
      <Controls 
        config={config} 
        onChange={handleConfigChange} 
        fps={fps}
      />

      {/* Keyboard Hint */}
      <div className="fixed bottom-4 right-4 text-[10px] font-mono text-white/20 uppercase tracking-tighter hidden md:block">
        Use Mouse to Displace // Input Below to Redraw
      </div>
    </div>
  );
};

export default App;
