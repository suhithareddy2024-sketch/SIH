import React, { useState } from 'react';
import { Table, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function DataTable({ simulationData }) {
  const [filter, setFilter] = useState('all'); // 'all', 'matched', 'discarded', 'errors'

  if (!simulationData || !simulationData.details) return null;

  const { details = [], eve_enabled: eveEnabled = false } = simulationData;

  const filteredData = details.filter((item) => {
    if (filter === 'matched') return item.basis_match;
    if (filter === 'discarded') return !item.basis_match;
    if (filter === 'errors') return item.bit_error;
    return true;
  });

  return (
    <div className="ui-panel p-5 bg-[#0D1117] border-[#1B242E] shadow-lg">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-4 border-b border-[#1B242E] gap-3">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-[#22D3EE]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#F5F7FA] font-semibold">
            Per-Qubit Quantum Telemetry Log
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#070A0F] text-[#A3ACB9] border border-[#1B242E]">
            {filteredData.length} of {details.length} qubits
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-[#070A0F] p-1 rounded-md border border-[#1B242E] text-xs font-mono">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded transition-all ${
              filter === 'all' ? 'bg-[#171E27] text-[#22D3EE] font-bold border border-[rgba(34,211,238,0.3)]' : 'text-[#A3ACB9] hover:text-[#F5F7FA]'
            }`}
          >
            All ({details.length})
          </button>
          <button
            onClick={() => setFilter('matched')}
            className={`px-2.5 py-1 rounded transition-all ${
              filter === 'matched' ? 'bg-[#171E27] text-[#10B981] font-bold border border-[rgba(16,185,129,0.3)]' : 'text-[#A3ACB9] hover:text-[#F5F7FA]'
            }`}
          >
            Matched ({details.filter(d => d.basis_match).length})
          </button>
          <button
            onClick={() => setFilter('discarded')}
            className={`px-2.5 py-1 rounded transition-all ${
              filter === 'discarded' ? 'bg-[#171E27] text-[#A3ACB9] font-bold border border-[#252E38]' : 'text-[#697586] hover:text-[#A3ACB9]'
            }`}
          >
            Discarded ({details.filter(d => !d.basis_match).length})
          </button>
          <button
            onClick={() => setFilter('errors')}
            className={`px-2.5 py-1 rounded transition-all ${
              filter === 'errors' ? 'bg-[#171E27] text-[#F43F5E] font-bold border border-[rgba(244,63,94,0.3)]' : 'text-[#A3ACB9] hover:text-[#F5F7FA]'
            }`}
          >
            Errors ({details.filter(d => d.bit_error).length})
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto max-h-[380px] rounded-lg border border-[#1B242E] bg-[#070A0F]">
        <table className="w-full text-left font-mono text-xs border-collapse">
          <thead className="bg-[#121820] sticky top-0 z-10 border-b border-[#1B242E] text-[11px] uppercase tracking-wider text-[#A3ACB9]">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3 text-[#22D3EE]">Alice Bit</th>
              <th className="py-2.5 px-3 text-[#22D3EE]">Alice Basis</th>
              {eveEnabled && (
                <>
                  <th className="py-2.5 px-3 text-[#F43F5E]">Eve Basis</th>
                  <th className="py-2.5 px-3 text-[#F43F5E]">Eve Bit</th>
                </>
              )}
              <th className="py-2.5 px-3 text-[#34D399]">Bob Basis</th>
              <th className="py-2.5 px-3 text-[#34D399]">Bob Bit</th>
              <th className="py-2.5 px-3 text-center">Basis Match</th>
              <th className="py-2.5 px-3 text-center">Status / Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1B242E]">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={eveEnabled ? 9 : 7} className="py-8 text-center text-[#697586]">
                  No records match current filter.
                </td>
              </tr>
            ) : (
              filteredData.map((row) => (
                <tr
                  key={row.position}
                  className={`hover:bg-[#121820] transition-colors ${
                    row.bit_error
                      ? 'bg-[rgba(244,63,94,0.08)] text-[#F5F7FA]'
                      : row.basis_match
                      ? 'bg-[#0D1117] text-[#F5F7FA]'
                      : 'text-[#697586]'
                  }`}
                >
                  {/* Position */}
                  <td className="py-2 px-3 text-[#697586] font-bold">{row.position}</td>

                  {/* Alice Bit */}
                  <td className="py-2 px-3 font-semibold text-[#22D3EE]">
                    <span className="px-1.5 py-0.5 rounded bg-[#121820] border border-[#1B242E]">
                      {row.alice_bit}
                    </span>
                  </td>

                  {/* Alice Basis */}
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      row.alice_basis === '+' ? 'bg-[#121820] text-[#22D3EE] border border-[#1B242E]' : 'bg-[#121820] text-[#A78BFA] border border-[#1B242E]'
                    }`}>
                      {row.alice_basis}
                    </span>
                  </td>

                  {/* Eve Columns */}
                  {eveEnabled && (
                    <>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          row.eve_basis === '+' ? 'bg-[#171E27] text-[#F43F5E] border border-[rgba(244,63,94,0.3)]' : 'bg-[#171E27] text-[#A78BFA] border border-[#1B242E]'
                        }`}>
                          {row.eve_basis || '-'}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-[#F43F5E]">
                        <span className="px-1.5 py-0.5 rounded bg-[#171E27] border border-[rgba(244,63,94,0.3)]">
                          {row.eve_bit !== null ? row.eve_bit : '-'}
                        </span>
                      </td>
                    </>
                  )}

                  {/* Bob Basis */}
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      row.bob_basis === '+' ? 'bg-[#121820] text-[#34D399] border border-[#1B242E]' : 'bg-[#121820] text-[#A78BFA] border border-[#1B242E]'
                    }`}>
                      {row.bob_basis}
                    </span>
                  </td>

                  {/* Bob Bit */}
                  <td className="py-2 px-3 font-semibold text-[#34D399]">
                    <span className="px-1.5 py-0.5 rounded bg-[#121820] border border-[#1B242E]">
                      {row.bob_bit}
                    </span>
                  </td>

                  {/* Basis Match */}
                  <td className="py-2 px-3 text-center">
                    {row.basis_match ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#121820] text-[#10B981] border border-[rgba(16,185,129,0.3)] font-semibold text-[10px]">
                        <CheckCircle className="w-3 h-3" /> MATCH
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#070A0F] text-[#697586] border border-[#1B242E] text-[10px]">
                        <XCircle className="w-3 h-3" /> DISCARD
                      </span>
                    )}
                  </td>

                  {/* Error Status */}
                  <td className="py-2 px-3 text-center">
                    {row.bit_error ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#171E27] text-[#F43F5E] border border-[rgba(244,63,94,0.4)] font-bold text-[10px]">
                        <AlertTriangle className="w-3 h-3" /> ERROR
                      </span>
                    ) : row.basis_match ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#070A0F] text-[#10B981] text-[10px]">
                        VALID
                      </span>
                    ) : (
                      <span className="text-[#697586] text-[10px]">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
