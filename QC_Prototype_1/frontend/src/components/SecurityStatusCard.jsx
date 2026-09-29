import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity, AlertCircle } from 'lucide-react';

export default function SecurityStatusCard({ simulationData, qberThreshold }) {
  if (!simulationData) {
    return (
      <div className="ui-panel p-6 bg-[#0D1117] border-[#1B242E] flex flex-col items-center justify-center text-center min-h-[220px]">
        <Activity className="w-8 h-8 text-[#697586] mb-2.5" />
        <span className="text-xs font-mono font-semibold text-[#F5F7FA]">Awaiting Simulation Execution</span>
        <p className="text-[11px] text-[#A3ACB9] mt-1 max-w-xs">
          Click "Run Simulation" above to execute Qiskit quantum circuit measurements and calculate empirical QBER.
        </p>
      </div>
    );
  }

  const qber = typeof simulationData.qber === 'number' ? simulationData.qber : 0;
  const status = simulationData.status || 'SECURE';
  const reason = simulationData.reason || 'Normal quantum transmission.';
  const errors = simulationData.errors || 0;
  const sifted_length = simulationData.sifted_length || 0;
  const num_qubits = simulationData.num_qubits || 64;
  const eve_enabled = simulationData.eve_enabled || false;

  // Semantic state mapping
  let statusBadge = {
    badgeText: 'SECURE',
    badgeClass: 'bg-[#121820] text-[#10B981] border-[rgba(16,185,129,0.4)]',
    dotClass: 'bg-[#10B981]',
    textColor: 'text-[#10B981]',
    icon: <ShieldCheck className="w-5 h-5 text-[#10B981]" />,
  };

  if (status === 'SECURITY ALERT') {
    statusBadge = {
      badgeText: 'SECURITY ALERT',
      badgeClass: 'bg-[#121820] text-[#F43F5E] border-[rgba(244,63,94,0.4)]',
      dotClass: 'bg-[#F43F5E] animate-pulse',
      textColor: 'text-[#F43F5E]',
      icon: <ShieldAlert className="w-5 h-5 text-[#F43F5E]" />,
    };
  } else if (status === 'SUSPICIOUS') {
    statusBadge = {
      badgeText: 'SUSPICIOUS',
      badgeClass: 'bg-[#121820] text-[#F59E0B] border-[rgba(245,158,11,0.4)]',
      dotClass: 'bg-[#F59E0B]',
      textColor: 'text-[#F59E0B]',
      icon: <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />,
    };
  }

  return (
    <div className="ui-panel p-5 bg-[#0D1117] border-[#1B242E] shadow-lg flex flex-col justify-between">
      
      {/* Top Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1B242E]">
        <div className="flex items-center gap-2">
          {statusBadge.icon}
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F7FA]">
            Security Status & Diagnostic
          </span>
        </div>
        
        {/* Prototype Classification Badge */}
        <div className={`px-2.5 py-1 rounded border text-xs font-mono font-bold flex items-center gap-1.5 ${statusBadge.badgeClass}`}>
          <span className={`w-2 h-2 rounded-full ${statusBadge.dotClass}`} />
          <span>{statusBadge.badgeText}</span>
        </div>
      </div>

      {/* Dominant Metric Grid: QBER + 3 Supporting KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        
        {/* Metric 1: Dominant QBER */}
        <div className="p-3 rounded-lg bg-[#070A0F] border border-[#1B242E] col-span-2 sm:col-span-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#697586]">EMPIRICAL QBER</div>
          <div className={`text-3xl font-extrabold font-mono mt-0.5 ${statusBadge.textColor}`}>
            {qber.toFixed(1)}%
          </div>
          <div className="text-[10px] font-mono text-[#A3ACB9] mt-0.5">
            Limit: {qberThreshold}%
          </div>
        </div>

        {/* Metric 2: Sifted Key Length */}
        <div className="p-3 rounded-lg bg-[#070A0F] border border-[#1B242E]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#697586]">SIFTED KEY</div>
          <div className="text-xl font-bold font-mono text-[#22D3EE] mt-1">
            {sifted_length} <span className="text-xs text-[#A3ACB9] font-normal">bits</span>
          </div>
          <div className="text-[10px] font-mono text-[#A3ACB9] mt-0.5">
            Yield: {num_qubits > 0 ? ((sifted_length / num_qubits) * 100).toFixed(0) : 0}%
          </div>
        </div>

        {/* Metric 3: Error Bits */}
        <div className="p-3 rounded-lg bg-[#070A0F] border border-[#1B242E]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#697586]">ERRORS</div>
          <div className={`text-xl font-bold font-mono mt-1 ${errors > 0 ? 'text-[#F43F5E]' : 'text-[#10B981]'}`}>
            {errors} <span className="text-xs text-[#A3ACB9] font-normal">bits</span>
          </div>
          <div className="text-[10px] font-mono text-[#A3ACB9] mt-0.5">
            {errors === 0 ? 'Zero drift' : 'Mismatches'}
          </div>
        </div>

        {/* Metric 4: Base Match */}
        <div className="p-3 rounded-lg bg-[#070A0F] border border-[#1B242E]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#697586]">BASE MATCH</div>
          <div className="text-xl font-bold font-mono text-[#F5F7FA] mt-1">
            {sifted_length}/{num_qubits}
          </div>
          <div className="text-[10px] font-mono text-[#A3ACB9] mt-0.5">
            Eve: {eve_enabled ? 'ON' : 'OFF'}
          </div>
        </div>

      </div>

      {/* Diagnostic Explanation Banner */}
      <div className="p-3 rounded-lg bg-[#121820] border border-[#1B242E] text-xs font-mono text-[#A3ACB9] flex items-start gap-2.5">
        <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${statusBadge.textColor}`} />
        <div className="leading-relaxed">
          <span className="font-semibold text-[#F5F7FA]">Diagnostic: </span>
          <span>{reason}</span>
        </div>
      </div>

    </div>
  );
}
