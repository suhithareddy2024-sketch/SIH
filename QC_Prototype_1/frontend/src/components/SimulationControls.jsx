import React from 'react';
import { RotateCcw, Zap, AlertTriangle, Cpu, Sliders, Info } from 'lucide-react';

const QUBIT_OPTIONS = [16, 32, 64, 128, 256];

export default function SimulationControls({
  numQubits,
  setNumQubits,
  eveEnabled,
  setEveEnabled,
  qberThreshold,
  setQberThreshold,
  onRunSimulation,
  isSimulating,
}) {
  return (
    <div className="ui-panel p-5 bg-[#0D1117] border-[#1B242E] shadow-lg">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        
        {/* Left: Configuration controls */}
        <div className="flex flex-wrap items-center gap-6 flex-1">
          
          {/* Qubit Count */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#A3ACB9] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#22D3EE]" />
              Qubit Count (N)
            </label>
            <div className="inline-flex rounded-md bg-[#070A0F] p-1 border border-[#1B242E]">
              {QUBIT_OPTIONS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setNumQubits(count)}
                  disabled={isSimulating}
                  className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                    numQubits === count
                      ? 'bg-[#171E27] text-[#22D3EE] font-bold border border-[rgba(34,211,238,0.3)] shadow-sm'
                      : 'text-[#A3ACB9] hover:text-[#F5F7FA] hover:bg-[#121820]'
                  } disabled:opacity-40`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Eve Attack Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-[#A3ACB9] flex items-center gap-1.5">
              <AlertTriangle className={`w-3.5 h-3.5 ${eveEnabled ? 'text-[#F43F5E]' : 'text-[#697586]'}`} />
              Eve Attack
            </label>
            <button
              type="button"
              onClick={() => setEveEnabled(!eveEnabled)}
              disabled={isSimulating}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-mono transition-all ${
                eveEnabled
                  ? 'bg-[#171E27] border-[rgba(244,63,94,0.4)] text-[#F43F5E] font-semibold'
                  : 'bg-[#070A0F] border-[#1B242E] text-[#A3ACB9] hover:border-[#252E38] hover:text-[#F5F7FA]'
              } disabled:opacity-40`}
            >
              <span className={`w-2 h-2 rounded-full ${eveEnabled ? 'bg-[#F43F5E] animate-pulse' : 'bg-[#697586]'}`} />
              <span>{eveEnabled ? 'EVE ACTIVE [ON]' : 'EVE DISABLED [OFF]'}</span>
            </button>
          </div>

          {/* QBER Threshold Slider */}
          <div className="flex flex-col gap-1.5 min-w-[220px] flex-1 max-w-sm">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-[#A3ACB9] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#22D3EE]" />
                Prototype QBER Threshold
              </label>
              <span className="text-xs font-mono font-bold text-[#22D3EE] bg-[#070A0F] px-2 py-0.5 rounded border border-[#1B242E]">
                {qberThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="30"
              step="1"
              value={qberThreshold}
              onChange={(e) => setQberThreshold(Number(e.target.value))}
              disabled={isSimulating}
              className="w-full h-1.5 bg-[#070A0F] rounded appearance-none cursor-pointer accent-[#22D3EE] border border-[#1B242E] disabled:opacity-40"
            />
            <div className="flex items-center gap-1 text-[10px] text-[#697586]">
              <Info className="w-3 h-3 text-[#22D3EE] flex-shrink-0" />
              <span>Configurable threshold for demonstration, not universal boundary.</span>
            </div>
          </div>

        </div>

        {/* Right: Action Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRunSimulation}
            disabled={isSimulating}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-mono font-bold text-xs tracking-wider uppercase transition-all bg-[#22D3EE] hover:bg-[#06B6D4] text-[#070A0F] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-[rgba(34,211,238,0.15)]"
          >
            {isSimulating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin text-[#070A0F]" />
                Executing Circuit...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current text-[#070A0F]" />
                Run Simulation
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
