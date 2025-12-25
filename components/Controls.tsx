
import React from 'react';
import { EngineConfig } from '../types';
import { MAX_CHARACTERS } from '../constants';

interface ControlsProps {
  config: EngineConfig;
  onChange: (newConfig: Partial<EngineConfig>) => void;
  fps: number;
}

const Controls: React.FC<ControlsProps> = ({ config, onChange, fps }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-20 pointer-events-none">
      <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl pointer-events-auto flex flex-col gap-4">
        
        {/* Top Row: Input and FPS */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={config.text}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z\s]/g, '');
                if (val.length <= MAX_CHARACTERS) {
                  onChange({ text: val });
                }
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[#00f0ff] font-mono focus:outline-none focus:ring-2 focus:ring-[#00f0ff]/30 transition-all placeholder:text-white/20"
              placeholder="TYPE TEXT..."
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/30 font-mono">
              {config.text.length} / {MAX_CHARACTERS}
            </span>
          </div>
          <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-white/50">
            FPS: <span className={fps > 55 ? 'text-green-400' : 'text-yellow-400'}>{Math.round(fps)}</span>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <ControlItem label="Repulsion Force">
            <input
              type="range"
              min="10"
              max="200"
              value={config.repulsionStrength}
              onChange={(e) => onChange({ repulsionStrength: Number(e.target.value) })}
              className="w-full accent-[#ff0080]"
            />
          </ControlItem>
          
          <ControlItem label="Mouse Radius">
            <input
              type="range"
              min="50"
              max="300"
              value={config.repulsionRadius}
              onChange={(e) => onChange({ repulsionRadius: Number(e.target.value) })}
              className="w-full accent-[#00f0ff]"
            />
          </ControlItem>

          <ControlItem label="Magnetic Ease">
            <input
              type="range"
              min="1"
              max="20"
              value={config.ease * 100}
              onChange={(e) => onChange({ ease: Number(e.target.value) / 100 })}
              className="w-full accent-[#b000ff]"
            />
          </ControlItem>

          <ControlItem label="Particle Density">
            <select
              value={config.density}
              onChange={(e) => onChange({ density: Number(e.target.value) })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70 focus:outline-none"
            >
              <option value={3}>High (Intense)</option>
              <option value={4}>Medium (Balanced)</option>
              <option value={6}>Low (Performant)</option>
            </select>
          </ControlItem>
        </div>

        {/* Toggles */}
        <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                    type="checkbox" 
                    checked={config.showLines}
                    onChange={(e) => onChange({ showLines: e.target.checked })}
                    className="hidden"
                />
                <div className={`w-4 h-4 rounded border border-white/20 flex items-center justify-center transition-colors ${config.showLines ? 'bg-[#ff0080] border-transparent' : 'bg-transparent'}`}>
                    {config.showLines && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="text-[10px] uppercase font-bold text-white/40 group-hover:text-white/70 transition-colors">Network Lines</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                    type="checkbox" 
                    checked={config.useGlow}
                    onChange={(e) => onChange({ useGlow: e.target.checked })}
                    className="hidden"
                />
                <div className={`w-4 h-4 rounded border border-white/20 flex items-center justify-center transition-colors ${config.useGlow ? 'bg-[#00f0ff] border-transparent' : 'bg-transparent'}`}>
                    {config.useGlow && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="text-[10px] uppercase font-bold text-white/40 group-hover:text-white/70 transition-colors">Neon Glow</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                    type="checkbox" 
                    checked={config.trailAlpha < 1}
                    onChange={(e) => onChange({ trailAlpha: e.target.checked ? 0.08 : 1 })}
                    className="hidden"
                />
                <div className={`w-4 h-4 rounded border border-white/20 flex items-center justify-center transition-colors ${config.trailAlpha < 1 ? 'bg-[#b000ff] border-transparent' : 'bg-transparent'}`}>
                    {config.trailAlpha < 1 && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="text-[10px] uppercase font-bold text-white/40 group-hover:text-white/70 transition-colors">Motion Trails</span>
            </label>
        </div>
      </div>
    </div>
  );
};

const ControlItem: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">{label}</span>
    {children}
  </div>
);

export default Controls;
