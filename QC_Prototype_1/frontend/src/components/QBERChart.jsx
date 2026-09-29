import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Trash2 } from 'lucide-react';

export default function QBERChart({ history, qberThreshold, onClearHistory }) {
  if (!history || history.length === 0) {
    return (
      <div className="ui-panel p-5 bg-[#0D1117] border-[#1B242E] flex flex-col items-center justify-center text-center min-h-[220px]">
        <TrendingUp className="w-8 h-8 text-[#697586] mb-2" />
        <span className="text-xs font-mono font-semibold text-[#F5F7FA]">QBER Run History</span>
        <p className="text-[11px] text-[#A3ACB9] mt-1 max-w-xs font-mono">
          Execute simulations to visualize historical QBER fluctuations and threat detection across runs.
        </p>
      </div>
    );
  }

  const chartData = history.map((item, index) => ({
    runNumber: `Run ${index + 1}`,
    runIndex: index + 1,
    qber: item.qber,
    eve_enabled: item.eve_enabled,
    errors: item.errors,
    sifted_length: item.sifted_length,
    status: item.status,
    num_qubits: item.num_qubits,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0]?.payload) {
      const data = payload[0].payload;
      if (!data) return null;
      const qberVal = typeof data.qber === 'number' ? data.qber : 0;
      return (
        <div className="p-3 rounded bg-[#070A0F] border border-[#252E38] shadow-xl font-mono text-xs text-[#F5F7FA]">
          <div className="font-bold text-[#F5F7FA] border-b border-[#1B242E] pb-1 mb-1.5 flex items-center justify-between gap-3">
            <span>Run #{data.runIndex || 1} ({data.num_qubits || 0} Qubits)</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${
              data.eve_enabled ? 'bg-[#171E27] text-[#F43F5E] border border-[rgba(244,63,94,0.3)]' : 'bg-[#171E27] text-[#10B981] border border-[rgba(16,185,129,0.3)]'
            }`}>
              {data.eve_enabled ? 'EVE ACTIVE' : 'DIRECT'}
            </span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between gap-4">
              <span className="text-[#A3ACB9]">QBER:</span>
              <strong className={qberVal > qberThreshold ? 'text-[#F43F5E]' : 'text-[#10B981]'}>
                {qberVal.toFixed(1)}%
              </strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#A3ACB9]">Errors / Sifted:</span>
              <span>{data.errors || 0} / {data.sifted_length || 0}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#A3ACB9]">Decision:</span>
              <span className="font-semibold text-[#F5F7FA]">{data.status || 'SECURE'}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="ui-panel p-5 bg-[#0D1117] border-[#1B242E] shadow-lg">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1B242E]">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#22D3EE]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#F5F7FA] font-semibold">
            QBER Fluctuation Trend Across Runs
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Eve OFF
            </span>
            <span className="flex items-center gap-1 text-[#F43F5E]">
              <span className="w-2 h-2 rounded-full bg-[#F43F5E]" /> Eve ON
            </span>
            <span className="flex items-center gap-1 text-[#F59E0B]">
              <span className="w-3 border-t border-dashed border-[#F59E0B]" /> Limit ({qberThreshold}%)
            </span>
          </div>

          <button
            onClick={onClearHistory}
            className="p-1 rounded text-[#A3ACB9] hover:text-[#F43F5E] hover:bg-[#171E27] transition-colors"
            title="Clear history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="qberGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1B242E" />
            <XAxis
              dataKey="runIndex"
              stroke="#697586"
              tick={{ fill: '#A3ACB9', fontSize: 10, fontFamily: 'monospace' }}
              tickFormatter={(v) => `#${v}`}
            />
            <YAxis
              domain={[0, 40]}
              stroke="#697586"
              tick={{ fill: '#A3ACB9', fontSize: 10, fontFamily: 'monospace' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Threshold Reference Line */}
            <ReferenceLine
              y={qberThreshold}
              stroke="#F59E0B"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            <Area
              type="monotone"
              dataKey="qber"
              stroke="#22D3EE"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#qberGradient)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                if (cx === undefined || cy === undefined || !payload) return null;
                const isEve = payload.eve_enabled;
                return (
                  <circle
                    key={`dot-${payload.runIndex || cx}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={isEve ? '#F43F5E' : '#10B981'}
                    stroke="#070A0F"
                    strokeWidth={1.5}
                  />
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
