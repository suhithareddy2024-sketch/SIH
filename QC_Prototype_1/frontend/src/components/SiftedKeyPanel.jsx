import React, { useState } from 'react';
import { Key, Copy, Check, Lock, Unlock } from 'lucide-react';

export default function SiftedKeyPanel({ simulationData }) {
  const [copiedKey, setCopiedKey] = useState(null);

  if (!simulationData) return null;

  const sifted_alice_key = simulationData.sifted_alice_key || '';
  const sifted_bob_key = simulationData.sifted_bob_key || '';
  const sifted_length = simulationData.sifted_length || 0;
  const errors = simulationData.errors || 0;
  const num_qubits = simulationData.num_qubits || 64;
  const eve_enabled = simulationData.eve_enabled || false;
  const qber = typeof simulationData.qber === 'number' ? simulationData.qber : 0;
  
  const matchedBasesCount = sifted_length;
  const discardedBasesCount = Math.max(0, num_qubits - sifted_length);
  const matchingSiftedBits = Math.max(0, sifted_length - errors);

  const handleCopy = (keyText, label) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="ui-panel p-5 bg-[#0D1117] border-[#1B242E] shadow-lg">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-4 border-b border-[#1B242E] gap-2">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-[#22D3EE]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#F5F7FA] font-semibold">
            Sifted Key Generation & Bit Reconciliation
          </span>
        </div>

        {/* Telemetry Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-[#070A0F] border border-[#1B242E] text-[#A3ACB9]">
            Raw: <strong className="text-[#F5F7FA]">{num_qubits}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-[#070A0F] border border-[#1B242E] text-[#A3ACB9]">
            Matched: <strong className="text-[#10B981]">{matchedBasesCount}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-[#070A0F] border border-[#1B242E] text-[#A3ACB9]">
            Discarded: <strong className="text-[#697586]">{discardedBasesCount}</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-[#070A0F] border border-[#1B242E] text-[#A3ACB9]">
            Errors: <strong className={errors > 0 ? 'text-[#F43F5E]' : 'text-[#10B981]'}>{errors}</strong>
          </span>
          <span className={`px-2 py-0.5 rounded font-semibold border ${eve_enabled ? 'bg-[#171E27] border-[rgba(244,63,94,0.3)] text-[#F43F5E]' : 'bg-[#171E27] border-[rgba(16,185,129,0.3)] text-[#10B981]'}`}>
            Eve: {eve_enabled ? 'ACTIVE' : 'OFF'}
          </span>
        </div>
      </div>

      {sifted_length === 0 ? (
        <div className="text-center py-6 text-xs text-[#697586] font-mono">
          No matching bases were found during transmission (0 sifted bits).
        </div>
      ) : (
        <div className="space-y-3 font-mono text-xs">
          
          {/* Alice Key Row */}
          <div className="p-3 rounded-lg bg-[#070A0F] border border-[#1B242E]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[#22D3EE] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]" />
                <span>Alice Sifted Key (K_A)</span>
              </div>
              <button
                onClick={() => handleCopy(sifted_alice_key, 'alice')}
                className="flex items-center gap-1 text-[11px] text-[#A3ACB9] hover:text-[#22D3EE] transition-colors"
                title="Copy Alice sifted key"
              >
                {copiedKey === 'alice' ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'alice' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            
            {/* Bit Stream */}
            <div className="p-2.5 rounded bg-[#121820] border border-[#1B242E] tracking-widest break-all select-all font-mono leading-relaxed text-xs text-[#22D3EE]">
              {sifted_alice_key ? sifted_alice_key.split('').map((bit, idx) => {
                const isMismatch = sifted_bob_key ? sifted_bob_key[idx] !== bit : false;
                return (
                  <span
                    key={idx}
                    className={`inline-block px-0.5 mx-[1px] rounded ${
                      isMismatch ? 'bg-[rgba(244,63,94,0.25)] text-[#F43F5E] font-bold border-b border-[#F43F5E]' : 'text-[#22D3EE]'
                    }`}
                    title={`Sifted Pos ${idx}: Alice=${bit}, Bob=${sifted_bob_key?.[idx] || '?'}`}
                  >
                    {bit}
                  </span>
                );
              }) : null}
            </div>
          </div>

          {/* Bob Key Row */}
          <div className="p-3 rounded-lg bg-[#070A0F] border border-[#1B242E]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[#34D399] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                <span>Bob Sifted Key (K_B)</span>
              </div>
              <button
                onClick={() => handleCopy(sifted_bob_key, 'bob')}
                className="flex items-center gap-1 text-[11px] text-[#A3ACB9] hover:text-[#34D399] transition-colors"
                title="Copy Bob sifted key"
              >
                {copiedKey === 'bob' ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'bob' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Bit Stream with error flags */}
            <div className="p-2.5 rounded bg-[#121820] border border-[#1B242E] tracking-widest break-all select-all font-mono leading-relaxed text-xs text-[#34D399]">
              {sifted_bob_key ? sifted_bob_key.split('').map((bit, idx) => {
                const isMismatch = sifted_alice_key ? sifted_alice_key[idx] !== bit : false;
                return (
                  <span
                    key={idx}
                    className={`inline-block px-0.5 mx-[1px] rounded ${
                      isMismatch ? 'bg-[rgba(244,63,94,0.25)] text-[#F43F5E] font-bold border-b border-[#F43F5E]' : 'text-[#34D399]'
                    }`}
                    title={`Sifted Pos ${idx}: Bob=${bit}, Alice=${sifted_alice_key?.[idx] || '?'}`}
                  >
                    {bit}
                  </span>
                );
              }) : null}
            </div>
          </div>

          {/* Sifting Summary Status */}
          <div className="flex flex-wrap items-center justify-between p-2.5 rounded-lg bg-[#121820] border border-[#1B242E] text-[11px] text-[#A3ACB9] gap-2">
            <div className="flex items-center gap-2">
              {errors === 0 ? (
                <>
                  <Lock className="w-4 h-4 text-[#10B981]" />
                  <span className="text-[#10B981] font-semibold">
                    100% Sifted Bit Agreement ({matchingSiftedBits}/{sifted_length} bits match)
                  </span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-[#F43F5E]" />
                  <span className="text-[#F43F5E] font-semibold">
                    Discrepancy: {errors} corrupted bits ({((errors / sifted_length) * 100).toFixed(1)}% error rate)
                  </span>
                </>
              )}
            </div>

            <div className="text-[#697586] font-mono">
              Yield: {((sifted_length / num_qubits) * 100).toFixed(1)}% ({sifted_length} of {num_qubits} qubits)
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
