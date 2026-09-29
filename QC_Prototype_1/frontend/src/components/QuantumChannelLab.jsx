import React, { useState } from 'react';
import {
  FlaskConical,
  Zap,
  RotateCcw,
  Sliders,
  BarChart2,
  Activity,
  Info,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { analyzeChannel, runChannelExperiment } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const QUBIT_OPTIONS = [16, 32, 64, 128, 256];

const NOISE_MODELS = [
  { id: 'bit_flip', name: 'Bit-Flip Noise (Random X Gate)', desc: 'Applies Pauli-X with probability p' },
  { id: 'depolarizing', name: 'Depolarizing Noise (X, Y, Z Mixture)', desc: 'Applies isotropic Pauli error with probability p' },
  { id: 'measurement', name: 'Measurement Noise (Readout Error)', desc: 'Bit-flips detector measurement with probability p' },
];

export default function QuantumChannelLab({ defaultThreshold = 11.0 }) {
  // Lab parameters
  const [numQubits, setNumQubits] = useState(64);
  const [eveEnabled, setEveEnabled] = useState(false);
  const [noiseEnabled, setNoiseEnabled] = useState(true);
  const [noiseModel, setNoiseModel] = useState('bit_flip');
  const [noiseProbability, setNoiseProbability] = useState(0.05); // 5%
  const [qberThreshold, setQberThreshold] = useState(defaultThreshold);

  // Single-run Lab state
  const [isSimulating, setIsSimulating] = useState(false);
  const [singleResult, setSingleResult] = useState(null);
  const [singleError, setSingleError] = useState(null);

  // 4-Scenario Experiment state
  const [experimentIterations, setExperimentIterations] = useState(100);
  const [isExperimenting, setIsExperimenting] = useState(false);
  const [experimentResult, setExperimentResult] = useState(null);
  const [experimentError, setExperimentError] = useState(null);

  // Active preset
  const [activePreset, setActivePreset] = useState('noisy');

  // Preset Mode Handler
  const handleSelectPreset = (mode) => {
    setActivePreset(mode);
    if (mode === 'ideal') {
      setEveEnabled(false);
      setNoiseEnabled(false);
    } else if (mode === 'noisy') {
      setEveEnabled(false);
      setNoiseEnabled(true);
    } else if (mode === 'eve') {
      setEveEnabled(true);
      setNoiseEnabled(false);
    } else if (mode === 'combined') {
      setEveEnabled(true);
      setNoiseEnabled(true);
    }
  };

  // Run single channel analysis simulation
  const handleRunSingleAnalysis = async () => {
    setIsSimulating(true);
    setSingleError(null);
    try {
      const res = await analyzeChannel({
        num_qubits: numQubits,
        eve_enabled: eveEnabled,
        noise_enabled: noiseEnabled,
        noise_model: noiseModel,
        noise_probability: noiseEnabled ? noiseProbability : 0.0,
        qber_threshold: qberThreshold,
      });
      setSingleResult(res);
    } catch (err) {
      setSingleError(err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Run automated 4-scenario experiment
  const handleRunExperiment = async () => {
    setIsExperimenting(true);
    setExperimentError(null);
    try {
      const res = await runChannelExperiment({
        num_qubits: numQubits,
        noise_model: noiseModel,
        noise_probability: noiseProbability,
        qber_threshold: qberThreshold,
        iterations: experimentIterations,
      });
      setExperimentResult(res);
    } catch (err) {
      setExperimentError(err.message);
    } finally {
      setIsExperimenting(false);
    }
  };

  // Prepare chart data for 4-scenario comparison
  const scenarioBarData = experimentResult ? [
    {
      name: 'Ideal Channel',
      qber: experimentResult.scenarios.ideal.mean_qber,
      std: experimentResult.scenarios.ideal.std_qber,
      alerts: experimentResult.scenarios.ideal.alert_count,
      fill: '#10B981',
    },
    {
      name: `Noisy Channel (${intPct(experimentResult.noise_probability)}% ${experimentResult.noise_model})`,
      qber: experimentResult.scenarios.noisy.mean_qber,
      std: experimentResult.scenarios.noisy.std_qber,
      alerts: experimentResult.scenarios.noisy.alert_count,
      fill: '#F59E0B',
    },
    {
      name: 'Eve Intercept Only',
      qber: experimentResult.scenarios.eve.mean_qber,
      std: experimentResult.scenarios.eve.std_qber,
      alerts: experimentResult.scenarios.eve.alert_count,
      fill: '#F43F5E',
    },
    {
      name: 'Combined (Eve + Noise)',
      qber: experimentResult.scenarios.combined.mean_qber,
      std: experimentResult.scenarios.combined.std_qber,
      alerts: experimentResult.scenarios.combined.alert_count,
      fill: '#A78BFA',
    },
  ] : [];

  function intPct(val) {
    return Math.round(val * 100);
  }

  return (
    <div className="space-y-6">
      
      {/* Lab Header */}
      <div className="ui-surface p-6 border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <FlaskConical className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400">
                  QUANTUM CHANNEL LAB: NOISE & ATTACK ANALYSIS
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Investigate how environmental quantum channel noise interacts with and compounds intercept-and-resend eavesdropping
              </p>
            </div>
          </div>

          {/* Preset Quick Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSelectPreset('ideal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                !eveEnabled && !noiseEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-[#070A0F] text-slate-400 border-[#252E38] hover:text-slate-200'
              }`}
            >
              1. Ideal Channel
            </button>
            <button
              onClick={() => handleSelectPreset('noisy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                !eveEnabled && noiseEnabled
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                  : 'bg-[#070A0F] text-slate-400 border-[#252E38] hover:text-slate-200'
              }`}
            >
              2. Noisy Channel
            </button>
            <button
              onClick={() => handleSelectPreset('eve')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                eveEnabled && !noiseEnabled
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm'
                  : 'bg-[#070A0F] text-slate-400 border-[#252E38] hover:text-slate-200'
              }`}
            >
              3. Eavesdropping Only
            </button>
            <button
              onClick={() => handleSelectPreset('combined')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                eveEnabled && noiseEnabled
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-sm'
                  : 'bg-[#070A0F] text-slate-400 border-[#252E38] hover:text-slate-200'
              }`}
            >
              4. Combined Attack
            </button>
          </div>
        </div>
      </div>

      {/* Lab Interactive Controls Bar */}
      <div className="ui-surface p-5 border-[#252E38] shadow-xl space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Noise Model Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Channel Noise Model</span>
              <span className={`text-[10px] font-bold ${noiseEnabled ? 'text-amber-400' : 'text-slate-500'}`}>
                {noiseEnabled ? 'ACTIVE' : 'OFF'}
              </span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNoiseEnabled(!noiseEnabled)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                  noiseEnabled ? 'bg-amber-950/60 border-amber-500/60 text-amber-300' : 'bg-[#070A0F] border-[#252E38] text-slate-500'
                }`}
              >
                {noiseEnabled ? 'ON' : 'OFF'}
              </button>
              <select
                value={noiseModel}
                onChange={(e) => setNoiseModel(e.target.value)}
                disabled={!noiseEnabled}
                className="flex-1 bg-[#070A0F] border border-[#252E38] text-xs font-mono text-amber-300 rounded-lg p-1.5 outline-none focus:border-amber-500 disabled:opacity-40"
              >
                {NOISE_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Noise Probability Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Noise Probability (p)
              </label>
              <span className="text-xs font-mono font-bold text-amber-300 bg-[#070A0F] px-2 py-0.5 rounded border border-amber-500/30">
                {intPct(noiseProbability)}%
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.20"
              step="0.01"
              value={noiseProbability}
              onChange={(e) => setNoiseProbability(Number(e.target.value))}
              disabled={!noiseEnabled}
              className="w-full h-1.5 bg-[#070A0F] rounded-lg appearance-none cursor-pointer accent-amber-400 border border-[#252E38] disabled:opacity-40"
            />
            <span className="text-[10px] text-slate-500 font-mono">Range: 1% &rarr; 20% quantum error</span>
          </div>

          {/* Eve Attacker Toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Eavesdropper (Eve)
            </label>
            <button
              type="button"
              onClick={() => setEveEnabled(!eveEnabled)}
              className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold transition-all ${
                eveEnabled
                  ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                  : 'bg-[#070A0F] border-[#252E38] text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${eveEnabled ? 'bg-rose-400 animate-ping' : 'bg-slate-700'}`} />
              <span>{eveEnabled ? 'INTERCEPT & RESEND [ON]' : 'NO ATTACKER [OFF]'}</span>
            </button>
          </div>

          {/* Qubit Count */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Qubit Count (N)
            </label>
            <div className="inline-flex rounded-lg bg-[#070A0F] p-1 border border-[#252E38]">
              {QUBIT_OPTIONS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setNumQubits(count)}
                  className={`flex-1 py-1 text-xs font-mono rounded transition-all ${
                    numQubits === count
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Action Buttons Row */}
        <div className="pt-3 border-t border-[#252E38] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              Active Scenario: <strong className="text-slate-200">
                {!eveEnabled && !noiseEnabled ? 'Ideal Noiseless Channel' : !eveEnabled && noiseEnabled ? `Noisy Channel (${intPct(noiseProbability)}% ${noiseModel})` : eveEnabled && !noiseEnabled ? 'Eavesdropping Only (Eve)' : `Combined (Eve + ${intPct(noiseProbability)}% Noise)`}
              </strong>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleRunSingleAnalysis}
              disabled={isSimulating}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-mono font-bold text-xs uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isSimulating ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 fill-current" />}
              <span>Run Single Lab Circuit</span>
            </button>
          </div>
        </div>

        {singleError && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-700 text-rose-300 text-xs font-mono">
            {singleError}
          </div>
        )}
      </div>

      {/* Single Run Result Card (if executed) */}
      {singleResult && (
        <div className="ui-surface p-5 border-[#252E38] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-[#252E38] gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-200 font-bold">
                Lab Transmission Output Telemetry
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2 py-0.5 rounded bg-[#070A0F] border border-[#252E38] text-slate-300">
                QBER: <strong className={singleResult.qber > qberThreshold ? 'text-rose-400' : 'text-emerald-400'}>{singleResult.qber.toFixed(1)}%</strong>
              </span>
              <span className={`px-2 py-0.5 rounded font-bold border ${
                singleResult.status === 'SECURITY ALERT' ? 'bg-rose-950 text-rose-300 border-rose-800' : singleResult.status === 'SUSPICIOUS' ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
              }`}>
                {singleResult.status}
              </span>
            </div>
          </div>

          {/* Live Topological State Indicator */}
          <div className="p-3.5 rounded-lg ui-panel-secondary flex flex-wrap items-center justify-between text-xs font-mono gap-3">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Channel State:</span>
              {singleResult.noise_enabled ? (
                <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-700 text-amber-300 font-bold animate-pulse">
                  CHANNEL NOISE ACTIVE ({singleResult.noise_model.toUpperCase()}: {intPct(singleResult.noise_probability)}%)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700 text-emerald-300 font-bold">
                  NOISELESS CHANNEL
                </span>
              )}

              {singleResult.eve_enabled && (
                <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-700 text-rose-300 font-bold animate-pulse">
                  EVE INTERCEPTING
                </span>
              )}
            </div>

            <div className="text-slate-400">
              Sifted Bits: <strong className="text-cyan-300">{singleResult.sifted_length}</strong> | Error Bits: <strong className="text-rose-400">{singleResult.errors}</strong>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-300 ui-panel-secondary p-3 rounded-lg">
            <strong>Diagnostic Analysis:</strong> {singleResult.reason}
          </div>
        </div>
      )}

      {/* 4-Scenario Automated Experiment Section */}
      <div className="ui-surface p-6 border-[#252E38] shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#252E38] gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-sm">
              <BarChart2 className="w-5 h-5" />
              <span>4-SCENARIO MONTE CARLO EXPERIMENT MODE</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Benchmark Ideal Channel, Noisy Channel, Eve Only, and Combined Attack across hundreds of independent Qiskit circuit runs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 ui-panel-secondary px-3 py-1.5 text-xs font-mono">
              <span className="text-slate-400">Runs / Scenario:</span>
              <select
                value={experimentIterations}
                onChange={(e) => setExperimentIterations(Number(e.target.value))}
                disabled={isExperimenting}
                className="bg-[#070A0F] border border-[#252E38] text-amber-300 rounded px-2 py-0.5 outline-none focus:border-amber-500"
              >
                <option value={50}>50 Runs</option>
                <option value={100}>100 Runs</option>
                <option value={250}>250 Runs</option>
                <option value={500}>500 Runs</option>
              </select>
            </div>

            <button
              onClick={handleRunExperiment}
              disabled={isExperimenting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              {isExperimenting ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  Running {experimentIterations * 4} Circuits...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  Run 4-Scenario Experiment
                </>
              )}
            </button>
          </div>
        </div>

        {experimentError && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-700 text-rose-300 text-xs font-mono">
            {experimentError}
          </div>
        )}

        {/* Experiment Results Grid */}
        {experimentResult ? (
          <div className="space-y-6">
            
            {/* 4 Scenario Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Ideal */}
              <div className="p-4 rounded-xl ui-panel border-emerald-500/30 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#252E38]">
                  <div className="font-bold text-emerald-400">1. Ideal Channel</div>
                  <span className="text-[10px] text-slate-500">{experimentResult.iterations} Runs</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Mean QBER</div>
                  <div className="text-2xl font-extrabold text-emerald-400 mt-0.5">
                    {experimentResult.scenarios.ideal.mean_qber.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Std Dev: &plusmn;{experimentResult.scenarios.ideal.std_qber.toFixed(2)}%</div>
                </div>
                <div className="pt-2 border-t border-[#252E38] text-[11px] text-slate-400 space-y-1">
                  <div>Median: <strong>{experimentResult.scenarios.ideal.median_qber}%</strong></div>
                  <div>Alerts Triggered: <strong className="text-emerald-400">{experimentResult.scenarios.ideal.alert_count}</strong></div>
                </div>
              </div>

              {/* Card 2: Noise Only */}
              <div className="p-4 rounded-xl ui-panel border-amber-500/30 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#252E38]">
                  <div className="font-bold text-amber-400">2. Noisy Channel</div>
                  <span className="text-[10px] text-slate-500">{intPct(experimentResult.noise_probability)}% Noise</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Mean QBER</div>
                  <div className="text-2xl font-extrabold text-amber-400 mt-0.5">
                    {experimentResult.scenarios.noisy.mean_qber.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Std Dev: &plusmn;{experimentResult.scenarios.noisy.std_qber.toFixed(2)}%</div>
                </div>
                <div className="pt-2 border-t border-[#252E38] text-[11px] text-slate-400 space-y-1">
                  <div>Median: <strong>{experimentResult.scenarios.noisy.median_qber}%</strong></div>
                  <div>Alerts Triggered: <strong className="text-amber-400">{experimentResult.scenarios.noisy.alert_count}</strong></div>
                </div>
              </div>

              {/* Card 3: Eve Only */}
              <div className="p-4 rounded-xl ui-panel border-rose-500/30 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#252E38]">
                  <div className="font-bold text-rose-400">3. Eve Only</div>
                  <span className="text-[10px] text-slate-500">Intercept & Resend</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Mean QBER</div>
                  <div className="text-2xl font-extrabold text-rose-400 mt-0.5">
                    {experimentResult.scenarios.eve.mean_qber.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Std Dev: &plusmn;{experimentResult.scenarios.eve.std_qber.toFixed(2)}%</div>
                </div>
                <div className="pt-2 border-t border-[#252E38] text-[11px] text-slate-400 space-y-1">
                  <div>Median: <strong>{experimentResult.scenarios.eve.median_qber}%</strong></div>
                  <div>Alerts Triggered: <strong className="text-rose-400">{experimentResult.scenarios.eve.alert_count}</strong></div>
                </div>
              </div>

              {/* Card 4: Combined Attack */}
              <div className="p-4 rounded-xl ui-panel border-purple-500/30 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#252E38]">
                  <div className="font-bold text-purple-400">4. Eve + Noise</div>
                  <span className="text-[10px] text-slate-500">Compounded</span>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Mean QBER</div>
                  <div className="text-2xl font-extrabold text-purple-400 mt-0.5">
                    {experimentResult.scenarios.combined.mean_qber.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Std Dev: &plusmn;{experimentResult.scenarios.combined.std_qber.toFixed(2)}%</div>
                </div>
                <div className="pt-2 border-t border-[#252E38] text-[11px] text-slate-400 space-y-1">
                  <div>Median: <strong>{experimentResult.scenarios.combined.median_qber}%</strong></div>
                  <div>Alerts Triggered: <strong className="text-purple-400">{experimentResult.scenarios.combined.alert_count}</strong></div>
                </div>
              </div>

            </div>

            {/* Mean QBER Comparative Bar Chart */}
            <div className="ui-panel p-5">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-300 mb-3 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                Mean QBER Comparison Across 4 Experimental Scenarios
              </h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scenarioBarData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252E38" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} />
                    <YAxis domain={[0, 45]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="p-2.5 rounded bg-[#070A0F] border border-[#252E38] text-xs font-mono text-slate-200">
                              <div className="font-bold text-amber-300">{d.name}</div>
                              <div className="mt-1">Mean QBER: <strong>{d.qber.toFixed(2)}%</strong> (&plusmn;{d.std.toFixed(2)}%)</div>
                              <div>Security Alerts: <strong>{d.alerts}</strong></div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="qber" radius={[6, 6, 0, 0]}>
                      {scenarioBarData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* QBER Frequency Distribution Histogram */}
            <div className="ui-panel p-5">
              <h4 className="text-xs font-mono font-bold uppercase text-slate-300 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                QBER Frequency Distribution Across Bins ({experimentResult.iterations} runs/scenario)
              </h4>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={experimentResult.distribution_bins} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252E38" vertical={false} />
                    <XAxis dataKey="bin_label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                    <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#070A0F', borderColor: '#252E38', fontFamily: 'monospace', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
                    <Bar dataKey="ideal_count" name="Ideal (0%)" fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="noise_count" name="Noise" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="eve_count" name="Eve Only" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="combined_count" name="Eve + Noise" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Educational Security Interpretation */}
            <div className="p-4 rounded-xl ui-panel-secondary border border-amber-500/30 font-mono text-xs text-slate-300 space-y-2">
              <div className="font-bold text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Security Interpretation & Key Takeaway:</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Elevated QBER indicates increased quantum state disturbance and may be caused by <strong>channel noise, eavesdropping, or both</strong>.
                Because quantum measurement collapse does not leave a "signature" distinguishing natural thermal noise from an eavesdropper's detector, QBER functions as an <strong>anomaly detection metric</strong> rather than a perfect attack classifier. If QBER exceeds the threshold, Alice and Bob must assume the channel is compromised.
              </p>
            </div>

          </div>
        ) : (
          <div className="p-10 text-center flex flex-col items-center justify-center ui-panel-secondary rounded-xl border border-[#252E38]">
            <Layers className="w-10 h-10 text-slate-600 mb-2" />
            <h4 className="text-xs font-mono font-bold text-slate-300">Awaiting 4-Scenario Benchmark Execution</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mt-1">
              Click "Run 4-Scenario Experiment" to benchmark and visualize statistical distributions for Ideal, Noisy, Eve, and Combined scenarios.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
