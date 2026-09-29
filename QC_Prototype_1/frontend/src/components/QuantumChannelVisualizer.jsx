import React from 'react';
import { UserCheck, ShieldAlert, Radio, ShieldCheck } from 'lucide-react';

export default function QuantumChannelVisualizer({
  eveEnabled,
  simulationData,
  isSimulating,
}) {
  return (
    <div className="ui-panel p-5 bg-[#0D1117] border-[#1B242E] shadow-lg relative overflow-hidden">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-5 border-b border-[#1B242E] gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#22D3EE]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#F5F7FA] font-semibold">
            Quantum Channel Topology
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#697586]">Transmission Mode:</span>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
            eveEnabled 
              ? 'bg-[#171E27] text-[#F43F5E] border-[rgba(244,63,94,0.3)]' 
              : 'bg-[#171E27] text-[#10B981] border-[rgba(16,185,129,0.3)]'
          }`}>
            {eveEnabled ? 'COMPROMISED (Alice → Eve → Bob)' : 'DIRECT (Alice → Bob)'}
          </span>
        </div>
      </div>

      {/* Main Channel Topology Display */}
      <div className="relative py-4 px-2 sm:px-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          
          {/* Endpoint 1: Alice (Transmitter) */}
          <div className="w-full md:w-56 p-4 rounded-lg bg-[#070A0F] border border-[#1B242E] flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-lg bg-[#121820] border border-[rgba(34,211,238,0.3)] flex items-center justify-center text-[#22D3EE] mb-2">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono font-bold text-[#F5F7FA] uppercase tracking-wider">
              ALICE <span className="text-[#22D3EE] text-[10px] font-normal">(Transmitter)</span>
            </div>
            <p className="text-[11px] text-[#A3ACB9] mt-1">
              Encodes bits into |0⟩, |1⟩, |+⟩, |−⟩
            </p>
            {simulationData && (
              <div className="mt-2.5 pt-2 border-t border-[#1B242E] w-full text-[10px] font-mono text-[#A3ACB9] flex justify-center">
                <span>Sent: <strong className="text-[#22D3EE]">{simulationData.num_qubits || 0}</strong> qubits</span>
              </div>
            )}
          </div>

          {/* Central Channel Conduit & (Optional) Eve Interception Box */}
          <div className="flex-1 w-full flex flex-col items-center justify-center px-2 sm:px-4 py-2 relative">
            
            {eveEnabled ? (
              /* Eve Active: Visual Channel Interruption in Crimson */
              <div className="w-full max-w-xs p-3.5 rounded-lg bg-[#121820] border border-[rgba(244,63,94,0.4)] shadow-md flex flex-col items-center text-center relative z-20">
                <div className="flex items-center gap-1.5 text-[#F43F5E] mb-1">
                  <ShieldAlert className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider">EVE ATTACK ACTIVE</span>
                </div>
                
                {/* Intercept -> Measure -> Resend Pipeline */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#A3ACB9] my-1 bg-[#070A0F] px-2.5 py-1 rounded border border-[#1B242E]">
                  <span className="text-[#F43F5E] font-semibold">INTERCEPT</span>
                  <span className="text-[#697586]">&rarr;</span>
                  <span className="text-[#F59E0B] font-semibold">MEASURE</span>
                  <span className="text-[#697586]">&rarr;</span>
                  <span className="text-[#22D3EE] font-semibold">RESEND</span>
                </div>

                <p className="text-[10px] text-[#A3ACB9] mt-1">
                  Projective measurement collapses quantum state &rarr; introduces <strong className="text-[#F43F5E]">&asymp;25% QBER</strong>
                </p>
              </div>
            ) : (
              /* Direct Quantum Optical Channel */
              <div className="w-full max-w-xs p-3 rounded-lg bg-[#070A0F] border border-[#1B242E] flex flex-col items-center text-center relative z-20">
                <div className="flex items-center gap-1.5 text-[#10B981] mb-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider">COHERENT OPTICAL CHANNEL</span>
                </div>
                <p className="text-[10px] text-[#A3ACB9]">
                  Direct fiber transmission &bull; Expected QBER: <strong className="text-[#10B981]">0.00%</strong>
                </p>
              </div>
            )}

            {/* Subtle Animated Quantum Beam */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-[2px] bg-[#1B242E] -z-0 overflow-hidden">
              <div
                className={`h-full w-24 rounded-full ${
                  isSimulating ? 'animate-quantum-beam-fast' : 'animate-quantum-beam'
                } ${
                  eveEnabled
                    ? 'bg-gradient-to-r from-[#22D3EE] via-[#F43F5E] to-[#F59E0B]'
                    : 'bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent'
                }`}
              />
            </div>

          </div>

          {/* Endpoint 2: Bob (Receiver) */}
          <div className="w-full md:w-56 p-4 rounded-lg bg-[#070A0F] border border-[#1B242E] flex flex-col items-center text-center">
            <div className="w-9 h-9 rounded-lg bg-[#121820] border border-[rgba(34,211,238,0.3)] flex items-center justify-center text-[#22D3EE] mb-2">
              <UserCheck className="w-5 h-5" />
            </div>
            <div className="text-xs font-mono font-bold text-[#F5F7FA] uppercase tracking-wider">
              BOB <span className="text-[#22D3EE] text-[10px] font-normal">(Receiver)</span>
            </div>
            <p className="text-[11px] text-[#A3ACB9] mt-1">
              Measures in random bases (+ or &times;)
            </p>
            {simulationData && (
              <div className="mt-2.5 pt-2 border-t border-[#1B242E] w-full text-[10px] font-mono text-[#A3ACB9] flex justify-center">
                <span>Received: <strong className="text-[#22D3EE]">{simulationData.num_qubits || 0}</strong> qubits</span>
              </div>
            )}
          </div>

        </div>

      </div>


      {/* Basis Glyphs Legend & Matching Rate */}
      <div className="mt-2 pt-3 border-t border-[#1B242E] flex flex-wrap items-center justify-between text-[11px] font-mono text-[#A3ACB9] gap-2">
        <div className="flex items-center gap-4">
          <span className="text-[#697586] uppercase tracking-wider font-semibold">Bases:</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-[#070A0F] border border-[#252E38] text-[#22D3EE] font-bold">+</span>
            Rectilinear (|0⟩, |1⟩)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="px-1.5 py-0.2 rounded bg-[#070A0F] border border-[#252E38] text-[#A78BFA] font-bold">&times;</span>
            Diagonal (|+⟩, |−⟩)
          </span>
        </div>

        {simulationData && (
          <div className="flex items-center gap-2">
            <span className="text-[#697586]">Basis Sifting Yield:</span>
            <span className="text-[#F5F7FA] font-semibold">
              {((simulationData.sifted_length / simulationData.num_qubits) * 100).toFixed(1)}%
              <span className="text-[#697586] font-normal ml-1">({simulationData.sifted_length}/{simulationData.num_qubits} bits)</span>
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
