import React from 'react';
import {
  Activity,
  ShieldAlert,
  FlaskConical,
  ListOrdered,
  BarChart2,
  BookOpen,
  RotateCcw,
  Radio,
  Server
} from 'lucide-react';

export default function Header({ 
  backendStatus, 
  activeTab, 
  setActiveTab, 
  onReset,
  isSimulating 
}) {
  const isConnected = backendStatus?.status === 'OK';

  return (
    <header className="border-b border-[#1B242E] bg-[#0D1117] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Branding & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#171E27] border border-[#252E38] flex items-center justify-center text-[#22D3EE] flex-shrink-0">
            <Radio className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wider text-[#F5F7FA] uppercase font-mono">
                BB84 QUANTUM SECURITY SIMULATOR
              </span>
            </div>
            <p className="text-[11px] text-[#A3ACB9]">
              Quantum key distribution research environment
            </p>
          </div>
        </div>

        {/* Center: Module Navigation Tabs */}
        <div className="flex items-center bg-[#070A0F] p-1 rounded-lg border border-[#1B242E] overflow-x-auto max-w-full">
          {/* Tab 1: Live Simulation (Cyan) */}
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'bg-[#121820] text-[#22D3EE] border border-[rgba(34,211,238,0.3)] font-semibold'
                : 'text-[#A3ACB9] hover:text-[#F5F7FA]'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${activeTab === 'simulator' ? 'text-[#22D3EE]' : 'text-[#697586]'}`} />
            Live Simulation
          </button>

          {/* Tab 2: Security Analysis (Crimson) */}
          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-[#121820] text-[#F43F5E] border border-[rgba(244,63,94,0.3)] font-semibold'
                : 'text-[#A3ACB9] hover:text-[#F5F7FA]'
            }`}
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${activeTab === 'security' ? 'text-[#F43F5E]' : 'text-[#697586]'}`} />
            Security Analysis
          </button>

          {/* Tab 3: Quantum Channel Lab (Amber) */}
          <button
            onClick={() => setActiveTab('channellab')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'channellab'
                ? 'bg-[#121820] text-[#F59E0B] border border-[rgba(245,158,11,0.3)] font-semibold'
                : 'text-[#A3ACB9] hover:text-[#F5F7FA]'
            }`}
          >
            <FlaskConical className={`w-3.5 h-3.5 ${activeTab === 'channellab' ? 'text-[#F59E0B]' : 'text-[#697586]'}`} />
            Quantum Channel Lab
          </button>

          {/* Tab 4: Step-by-Step (Violet) */}
          <button
            onClick={() => setActiveTab('stepbystep')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'stepbystep'
                ? 'bg-[#121820] text-[#A78BFA] border border-[rgba(167,139,250,0.3)] font-semibold'
                : 'text-[#A3ACB9] hover:text-[#F5F7FA]'
            }`}
          >
            <ListOrdered className={`w-3.5 h-3.5 ${activeTab === 'stepbystep' ? 'text-[#A78BFA]' : 'text-[#697586]'}`} />
            Step-by-Step
          </button>

          {/* Tab 5: Comparison Mode (Emerald) */}
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'comparison'
                ? 'bg-[#121820] text-[#10B981] border border-[rgba(16,185,129,0.3)] font-semibold'
                : 'text-[#A3ACB9] hover:text-[#F5F7FA]'
            }`}
          >
            <BarChart2 className={`w-3.5 h-3.5 ${activeTab === 'comparison' ? 'text-[#10B981]' : 'text-[#697586]'}`} />
            Comparison Mode
          </button>

          {/* Tab 6: How BB84 Works (Violet/Neutral) */}
          <button
            onClick={() => setActiveTab('theory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === 'theory'
                ? 'bg-[#121820] text-[#A78BFA] border border-[rgba(167,139,250,0.3)] font-semibold'
                : 'text-[#A3ACB9] hover:text-[#F5F7FA]'
            }`}
          >
            <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'theory' ? 'text-[#A78BFA]' : 'text-[#697586]'}`} />
            How BB84 Works
          </button>
        </div>

        {/* Right: Engine Badge, Connection Status & Reset */}
        <div className="flex items-center gap-2.5">
          {/* Qiskit Engine Tag */}
          <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#121820] text-[#A3ACB9] border border-[#1B242E]">
            Qiskit Aer
          </span>

          {/* Backend Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#070A0F] border border-[#1B242E] text-[11px] font-mono">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-[#10B981]' : 'bg-[#F59E0B] animate-pulse'
              }`}
            />
            <span className={isConnected ? 'text-[#A3ACB9]' : 'text-[#F59E0B]'}>
              {isConnected ? 'CONNECTED' : 'CONNECTING...'}
            </span>
          </div>

          {/* Reset Button */}
          <button
            onClick={onReset}
            disabled={isSimulating}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono bg-[#171E27] hover:bg-[#252E38] text-[#A3ACB9] hover:text-[#F5F7FA] border border-[#252E38] transition-colors disabled:opacity-40"
            title="Reset simulation parameters"
          >
            <RotateCcw className="w-3 h-3" />
            <span>RESET</span>
          </button>
        </div>

      </div>
    </header>
  );
}
