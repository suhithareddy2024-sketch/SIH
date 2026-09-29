import React, { useState } from 'react';
import { BarChart2, ShieldCheck, ShieldAlert, Zap, RotateCcw, AlertTriangle, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { compareBB84 } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ComparisonMode({ qberThreshold, defaultNumQubits = 64 }) {
  const [numQubits, setNumQubits] = useState(defaultNumQubits);
  const [iterations, setIterations] = useState(25);
  const [loading, setLoading] = useState(false);
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState(null);

  const handleRunComparison = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await compareBB84({
        num_qubits: numQubits,
        qber_threshold: qberThreshold,
        iterations: iterations,
      });
      setComparisonData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = comparisonData ? [
    {
      scenario: 'Without Eve (Direct)',
      qber: comparisonData.without_eve.avg_qber,
      std: comparisonData.without_eve.std_qber,
      errors: comparisonData.without_eve.avg_errors,
      alerts: comparisonData.without_eve.detection_alerts_count,
      sifted: comparisonData.without_eve.avg_sifted_length,
      fill: '#10B981',
    },
    {
      scenario: 'With Eve (Attacker)',
      qber: comparisonData.with_eve.avg_qber,
      std: comparisonData.with_eve.std_qber,
      errors: comparisonData.with_eve.avg_errors,
      alerts: comparisonData.with_eve.detection_alerts_count,
      sifted: comparisonData.with_eve.avg_sifted_length,
      fill: '#F43F5E',
    }
  ] : [];

  return (
    <div className="space-y-6">
      
      {/* Control Panel */}
      <div className="ui-surface p-5 border-emerald-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Statistical Security Benchmark
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Execute parallel multi-run simulations to benchmark empirical error rates, variance, and eavesdropping detection efficacy.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 ui-panel-secondary px-3 py-1.5 text-xs font-mono">
              <span className="text-slate-400">Repeated Runs:</span>
              <select
                value={iterations}
                onChange={(e) => setIterations(Number(e.target.value))}
                disabled={loading}
                className="bg-[#070A0F] border border-[#252E38] text-emerald-300 rounded px-2 py-0.5 outline-none focus:border-emerald-500"
              >
                <option value={10}>10 Runs</option>
                <option value={25}>25 Runs</option>
                <option value={50}>50 Runs</option>
                <option value={100}>100 Runs</option>
              </select>
            </div>

            <div className="flex items-center gap-2 ui-panel-secondary px-3 py-1.5 text-xs font-mono">
              <span className="text-slate-400">Qubits / Run:</span>
              <select
                value={numQubits}
                onChange={(e) => setNumQubits(Number(e.target.value))}
                disabled={loading}
                className="bg-[#070A0F] border border-[#252E38] text-emerald-300 rounded px-2 py-0.5 outline-none focus:border-emerald-500"
              >
                <option value={32}>32</option>
                <option value={64}>64</option>
                <option value={128}>128</option>
                <option value={256}>256</option>
              </select>
            </div>

            <button
              onClick={handleRunComparison}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-mono font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  Running {iterations * 2} Circuits...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Run Benchmark
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/60 border border-rose-700/80 text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparisonData ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: WITHOUT EVE */}
          <div className="ui-panel p-5 border-emerald-500/30">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#252E38]">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="font-mono font-bold text-xs tracking-wider">WITHOUT EVE (DIRECT CHANNEL)</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                {comparisonData.without_eve.runs} Runs Evaluated
              </span>
            </div>

            <div className="space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg ui-panel-secondary">
                  <div className="text-[10px] text-slate-400 uppercase">Mean QBER</div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                    {comparisonData.without_eve.avg_qber.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Std Dev: &plusmn;{comparisonData.without_eve.std_qber.toFixed(2)}%
                  </div>
                </div>

                <div className="p-3 rounded-lg ui-panel-secondary">
                  <div className="text-[10px] text-slate-400 uppercase">Average Error Bits</div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                    {comparisonData.without_eve.avg_errors.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Min: {comparisonData.without_eve.min_qber}% | Max: {comparisonData.without_eve.max_qber}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg ui-panel-secondary">
                  <div className="text-[10px] text-slate-400 uppercase">Avg Sifted Key Length</div>
                  <div className="text-base font-bold text-slate-200 mt-0.5">
                    {comparisonData.without_eve.avg_sifted_length.toFixed(1)} bits
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    ~{((comparisonData.without_eve.avg_sifted_length / numQubits) * 100).toFixed(0)}% Basis Match
                  </div>
                </div>

                <div className="p-3 rounded-lg ui-panel-secondary">
                  <div className="text-[10px] text-slate-400 uppercase">Security Alerts Triggered</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    {comparisonData.without_eve.detection_alerts_count} / {comparisonData.without_eve.runs} ({comparisonData.without_eve.detection_rate_pct.toFixed(1)}%)
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">0% False Positive Rate</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 text-[11px] text-emerald-300">
                <strong>Expected Behavior:</strong> In an ideal noiseless quantum channel, matching bases preserve 100% quantum state coherence (0% QBER).
              </div>
            </div>
          </div>

          {/* Card 2: WITH EVE */}
          <div className="ui-panel p-5 border-rose-500/30">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#252E38]">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h4 className="font-mono font-bold text-xs tracking-wider">WITH EVE (INTERCEPT & RESEND)</h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/60">
                {comparisonData.with_eve.runs} Runs Evaluated
              </span>
            </div>

            <div className="space-y-3 font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg ui-panel-secondary">
                  <div className="text-[10px] text-slate-400 uppercase">Mean QBER</div>
                  <div className="text-2xl font-extrabold text-rose-400 mt-0.5">
                    {comparisonData.with_eve.avg_qber.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-rose-300 mt-1">
                    Std Dev: &plusmn;{comparisonData.with_eve.std_qber.toFixed(2)}%
                  </div>
                </div>

                <div className="p-3 rounded-lg ui-panel-secondary">
                  <div className="text-[10px] text-slate-400 uppercase">Average Error Bits</div>
                  <div className="text-2xl font-extrabold text-rose-400 mt-0.5">
                    {comparisonData.with_eve.avg_errors.toFixed(1)}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Min: {comparisonData.with_eve.min_qber}% | Max: {comparisonData.with_eve.max_qber}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg ui-panel-secondary">
                  <div className="text-[10px] text-slate-400 uppercase">Avg Sifted Key Length</div>
                  <div className="text-base font-bold text-slate-200 mt-0.5">
                    {comparisonData.with_eve.avg_sifted_length.toFixed(1)} bits
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    ~{((comparisonData.with_eve.avg_sifted_length / numQubits) * 100).toFixed(0)}% Basis Match
                  </div>
                </div>

                <div className="p-3 rounded-lg ui-panel-secondary">
                  <div className="text-[10px] text-slate-400 uppercase">Security Alerts Triggered</div>
                  <div className="text-base font-bold text-rose-400 mt-0.5 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-400" />
                    {comparisonData.with_eve.detection_alerts_count} / {comparisonData.with_eve.runs} ({comparisonData.with_eve.detection_rate_pct.toFixed(1)}%)
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Exceeds {qberThreshold}% Prototype Threshold</div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40 text-[11px] text-rose-300">
                <strong>Expected Behavior:</strong> Expected QBER &asymp; 25% under intercept-and-resend attack. Individual finite runs fluctuate probabilistically.
              </div>
            </div>
          </div>

          {/* Side-by-Side Bar Chart */}
          <div className="ui-panel p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Side-by-Side Mean QBER & Standard Deviation Comparison
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Threshold Reference: {qberThreshold}%</span>
            </div>
            
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252E38" vertical={false} />
                  <XAxis dataKey="scenario" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 35]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 rounded-lg bg-[#070A0F] border border-[#252E38] text-xs font-mono text-slate-200 shadow-xl">
                            <div className="font-bold text-emerald-400">{d.scenario}</div>
                            <div className="mt-1">Mean QBER: <strong className="text-slate-100">{d.qber.toFixed(2)}%</strong> (&plusmn;{d.std.toFixed(2)}%)</div>
                            <div>Mean Errors: <strong className="text-slate-100">{d.errors.toFixed(1)}</strong></div>
                            <div>Detection Alerts: <strong className="text-slate-100">{d.alerts}</strong></div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="qber" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 p-3 rounded-lg ui-panel-secondary text-xs text-slate-300 font-mono flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                <strong>Conclusion:</strong> In this ideal channel model, No-Eve produces 0% QBER, while Eve produces a statistically unmistakable disturbance signature centered around <strong>&asymp; 25% QBER</strong>.
              </span>
            </div>
          </div>

        </div>
      ) : (
        <div className="ui-panel p-12 text-center flex flex-col items-center justify-center">
          <TrendingUp className="w-10 h-10 text-emerald-500/30 mb-3" />
          <h4 className="text-xs font-mono font-bold text-slate-300">No Benchmark Data Collected</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Click "Run Benchmark" above to execute parallel Qiskit quantum circuit batches and calculate empirical statistical error distributions.
          </p>
        </div>
      )}

    </div>
  );
}
