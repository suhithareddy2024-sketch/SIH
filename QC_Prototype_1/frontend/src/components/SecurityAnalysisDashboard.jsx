import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Sliders,
  BarChart2,
  Table,
  Download,
  Zap,
  RotateCcw,
  RefreshCw,
  Info,
  Radio,
  Key,
  Layers,
  Lock,
  Unlock,
  TrendingUp,
  FileText,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { analyzeChannel, runChannelExperiment } from '../services/api';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

const QUBIT_OPTIONS = [16, 32, 64, 128, 256];

export default function SecurityAnalysisDashboard({
  simulationData,
  history = [],
  qberThreshold = 11.0,
  onRunSimulation,
  isSimulating,
}) {
  // Local configuration for custom security runs
  const [numQubits, setNumQubits] = useState(64);
  const [eveEnabled, setEveEnabled] = useState(simulationData?.eve_enabled ?? true);
  const [noiseEnabled, setNoiseEnabled] = useState(false);
  const [noiseModel, setNoiseModel] = useState('bit_flip');
  const [noiseProbability, setNoiseProbability] = useState(0.05);
  const [threshold, setThreshold] = useState(qberThreshold);

  // Active analysis data (uses props simulationData or custom run)
  const [currentAnalysis, setCurrentAnalysis] = useState(simulationData);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  // Multi-scenario experiment state for charts
  const [experimentData, setExperimentData] = useState(null);
  const [isLoadingExperiment, setIsLoadingExperiment] = useState(false);

  // Copy key state
  const [copiedKey, setCopiedKey] = useState(null);

  // Sync props data if changes
  React.useEffect(() => {
    if (simulationData) {
      setCurrentAnalysis(simulationData);
      setEveEnabled(simulationData.eve_enabled);
    }
  }, [simulationData]);

  // Run security analysis
  const handleRunSecurityAnalysis = async () => {
    setIsRunningAnalysis(true);
    setAnalysisError(null);
    try {
      const res = await analyzeChannel({
        num_qubits: numQubits,
        eve_enabled: eveEnabled,
        noise_enabled: noiseEnabled,
        noise_model: noiseModel,
        noise_probability: noiseEnabled ? noiseProbability : 0.0,
        qber_threshold: threshold,
      });
      setCurrentAnalysis(res);
    } catch (err) {
      setAnalysisError(err.message);
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  // Load / run benchmark data for comparison charts
  const handleLoadScenarioBenchmarks = async () => {
    setIsLoadingExperiment(true);
    try {
      const res = await runChannelExperiment({
        num_qubits: numQubits,
        noise_model: noiseModel,
        noise_probability: noiseProbability,
        qber_threshold: threshold,
        iterations: 100,
      });
      setExperimentData(res);
    } catch (err) {
      console.error('Failed to load benchmark data:', err);
    } finally {
      setIsLoadingExperiment(false);
    }
  };

  // Export analysis report as JSON or CSV
  const handleExportReport = (format = 'json') => {
    if (!currentAnalysis) return;

    const reportData = {
      timestamp: new Date().toISOString(),
      scenario: currentAnalysis.scenario || (eveEnabled ? (noiseEnabled ? 'combined_attack' : 'eavesdropping_only') : (noiseEnabled ? 'noisy_channel' : 'ideal_channel')),
      num_qubits: currentAnalysis.num_qubits,
      eve_configured: eveEnabled,
      noise_enabled: noiseEnabled,
      noise_model: noiseEnabled ? noiseModel : 'none',
      noise_probability: noiseEnabled ? noiseProbability : 0.0,
      qber_percentage: currentAnalysis.qber,
      prototype_threshold: threshold,
      security_classification: currentAnalysis.status,
      sifted_key_length: currentAnalysis.sifted_length,
      error_bits_count: currentAnalysis.errors,
      diagnostic_reason: currentAnalysis.reason,
      sifted_alice_key: currentAnalysis.sifted_alice_key,
      sifted_bob_key: currentAnalysis.sifted_bob_key,
    };

    if (format === 'json') {
      const jsonStr = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bb84-security-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const headers = Object.keys(reportData).join(',');
      const values = Object.values(reportData).map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v).join(',');
      const csvStr = `${headers}\n${values}`;
      const blob = new Blob([csvStr], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bb84-security-report-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const activeQBER = currentAnalysis?.qber ?? 0.0;
  
  // Status label & badge
  let statusBadge = {
    label: 'SECURE',
    badgeClass: 'bg-[#121820] text-[#10B981] border-[rgba(16,185,129,0.4)]',
    dotClass: 'bg-[#10B981]',
    textColor: 'text-[#10B981]',
  };

  if (activeQBER > threshold || currentAnalysis?.status === 'SECURITY ALERT') {
    statusBadge = {
      label: 'SECURITY ALERT',
      badgeClass: 'bg-[#171E27] text-[#F43F5E] border-[rgba(244,63,94,0.4)]',
      dotClass: 'bg-[#F43F5E] animate-pulse',
      textColor: 'text-[#F43F5E]',
    };
  } else if (activeQBER >= threshold * 0.5 || currentAnalysis?.status === 'SUSPICIOUS') {
    statusBadge = {
      label: 'SUSPICIOUS',
      badgeClass: 'bg-[#171E27] text-[#F59E0B] border-[rgba(245,158,11,0.4)]',
      dotClass: 'bg-[#F59E0B]',
      textColor: 'text-[#F59E0B]',
    };
  }

  // Threat Interpretation rule engine
  const getThreatInterpretation = () => {
    if (!currentAnalysis) {
      return {
        title: 'AWAITING SIMULATION TELEMETRY',
        summary: 'Click "Run Security Analysis" to evaluate the quantum channel under the current parameter configuration.',
        level: 'neutral',
      };
    }

    if (!eveEnabled && !noiseEnabled) {
      return {
        title: 'IDEAL CHANNEL BASELINE (MINIMAL DISTURBANCE)',
        summary: 'In this ideal noiseless simulation model, QBER is strictly 0.00%. Alice and Bob exhibit 100% sifted bit agreement.',
        level: 'secure',
      };
    }

    if (!eveEnabled && noiseEnabled) {
      return {
        title: 'NOISE-DRIVEN DISTURBANCE',
        summary: `Physical channel noise (${noiseModel}, p=${Math.round(noiseProbability * 100)}%) is active. The observed QBER (${activeQBER.toFixed(1)}%) is above baseline due to channel decoherence rather than an active adversary.`,
        level: activeQBER > threshold ? 'alert' : 'suspicious',
      };
    }

    if (eveEnabled && !noiseEnabled) {
      return {
        title: 'ATTACK-DRIVEN DISTURBANCE (INTERCEPT & RESEND)',
        summary: `Intercept-and-resend attack is active. Eve's projective measurements cause quantum state collapse, yielding an empirical QBER (${activeQBER.toFixed(1)}%) consistent with theoretical expectation (~25%).`,
        level: 'alert',
      };
    }

    return {
      title: 'COMBINED DISTURBANCE (EVE + NOISE)',
      summary: `Both quantum channel noise and intercept-and-resend eavesdropping are active. The observed QBER (${activeQBER.toFixed(1)}%) reflects compounding contributions from decoherence and projective collapse.`,
      level: 'alert',
    };
  };

  const interpretation = getThreatInterpretation();
  const gaugePercent = Math.min(100, (activeQBER / 50.0) * 100);

  const barData = experimentData ? [
    { name: 'Ideal', qber: experimentData.scenarios.ideal.mean_qber, fill: '#10B981' },
    { name: 'Noisy', qber: experimentData.scenarios.noisy.mean_qber, fill: '#F59E0B' },
    { name: 'Eve', qber: experimentData.scenarios.eve.mean_qber, fill: '#F43F5E' },
    { name: 'Combined', qber: experimentData.scenarios.combined.mean_qber, fill: '#A78BFA' },
  ] : null;

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner: Quantum Security Operations Center */}
      <div className="ui-panel p-6 bg-[#0D1117] border-[#1B242E] shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#171E27] border border-[rgba(244,63,94,0.3)] flex items-center justify-center text-[#F43F5E] flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-mono font-bold tracking-wider text-[#F5F7FA] uppercase">
                  SECURITY OPERATIONS CENTER
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#171E27] text-[#F43F5E] border border-[rgba(244,63,94,0.3)]">
                  SOC ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#A3ACB9]">
                Real-time BB84 threat detection, channel disturbance telemetry & anomaly interpretation
              </p>
            </div>
          </div>

          {/* Action Buttons: Run Analysis & Export */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleRunSecurityAnalysis}
              disabled={isRunningAnalysis || isSimulating}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-mono font-bold text-xs uppercase bg-[#F43F5E] hover:bg-[#E11D48] text-white active:scale-95 transition-all disabled:opacity-40 shadow-md shadow-[rgba(244,63,94,0.2)]"
            >
              {isRunningAnalysis ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  Analyzing Channel...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  Run Security Analysis
                </>
              )}
            </button>

            <div className="flex items-center gap-1 bg-[#070A0F] p-1 rounded-md border border-[#1B242E]">
              <button
                onClick={() => handleExportReport('json')}
                disabled={!currentAnalysis}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[#A3ACB9] hover:text-[#F5F7FA] hover:bg-[#171E27] disabled:opacity-30 transition-colors"
                title="Export report as JSON"
              >
                <Download className="w-3.5 h-3.5 text-[#22D3EE]" />
                JSON
              </button>
              <button
                onClick={() => handleExportReport('csv')}
                disabled={!currentAnalysis}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono text-[#A3ACB9] hover:text-[#F5F7FA] hover:bg-[#171E27] disabled:opacity-30 transition-colors"
                title="Export report as CSV"
              >
                <FileText className="w-3.5 h-3.5 text-[#34D399]" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Threat Signals Overview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#1B242E] font-mono text-xs">
          
          {/* Signal 1: Eve Attack */}
          <div className="p-3.5 rounded-lg bg-[#070A0F] border border-[#1B242E]">
            <div className="text-[10px] text-[#697586] uppercase tracking-wider">EVE ATTACK</div>
            <div className={`flex items-center gap-1.5 mt-1 font-bold text-xs ${eveEnabled ? 'text-[#F43F5E]' : 'text-[#697586]'}`}>
              <span className={`w-2 h-2 rounded-full ${eveEnabled ? 'bg-[#F43F5E] animate-pulse' : 'bg-[#697586]'}`} />
              <span>{eveEnabled ? 'ACTIVE (INTERCEPT)' : 'INACTIVE (OFF)'}</span>
            </div>
            <div className="text-[10px] text-[#A3ACB9] mt-0.5">
              Expected Disturbance: {eveEnabled ? '~25%' : '0%'}
            </div>
          </div>

          {/* Signal 2: Channel Noise */}
          <div className="p-3.5 rounded-lg bg-[#070A0F] border border-[#1B242E]">
            <div className="text-[10px] text-[#697586] uppercase tracking-wider">CHANNEL NOISE</div>
            <div className={`flex items-center gap-1.5 mt-1 font-bold text-xs ${noiseEnabled ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
              <span className={`w-2 h-2 rounded-full ${noiseEnabled ? 'bg-[#F59E0B]' : 'bg-[#10B981]'}`} />
              <span>{noiseEnabled ? `ELEVATED (${Math.round(noiseProbability * 100)}%)` : 'NOMINAL (0%)'}</span>
            </div>
            <div className="text-[10px] text-[#A3ACB9] mt-0.5">
              Model: {noiseEnabled ? noiseModel : 'Noiseless'}
            </div>
          </div>

          {/* Signal 3: Measured QBER */}
          <div className="p-3.5 rounded-lg bg-[#070A0F] border border-[#1B242E]">
            <div className="text-[10px] text-[#697586] uppercase tracking-wider">MEASURED DISTURBANCE</div>
            <div className={`text-xl font-extrabold mt-0.5 ${statusBadge.textColor}`}>
              {currentAnalysis ? `${activeQBER.toFixed(1)}%` : '—'}
            </div>
            <div className="text-[10px] text-[#A3ACB9]">
              Threshold: {threshold}%
            </div>
          </div>

          {/* Signal 4: Security Decision */}
          <div className="p-3.5 rounded-lg bg-[#070A0F] border border-[#1B242E]">
            <div className="text-[10px] text-[#697586] uppercase tracking-wider">DECISION</div>
            <div className={`text-sm font-bold mt-1.5 ${statusBadge.textColor}`}>
              {currentAnalysis ? currentAnalysis.status : 'AWAITING RUN'}
            </div>
            <div className="text-[10px] text-[#A3ACB9]">
              Statistical Prototype
            </div>
          </div>

        </div>
      </div>

      {/* 2. Analysis Configuration Drawer */}
      <div className="ui-panel p-4 bg-[#0D1117] border-[#1B242E] text-xs font-mono">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#A3ACB9]">
            <Sliders className="w-4 h-4 text-[#F43F5E]" />
            <span className="font-bold text-[#F5F7FA] uppercase">SOC Parameters:</span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Eve Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[#A3ACB9]">Attacker:</span>
              <button
                type="button"
                onClick={() => setEveEnabled(!eveEnabled)}
                className={`px-2.5 py-1 rounded border text-xs font-semibold ${
                  eveEnabled ? 'bg-[#171E27] border-[rgba(244,63,94,0.4)] text-[#F43F5E]' : 'bg-[#070A0F] border-[#1B242E] text-[#697586]'
                }`}
              >
                {eveEnabled ? 'ON (Intercept)' : 'OFF (Direct)'}
              </button>
            </div>

            {/* Noise Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[#A3ACB9]">Noise:</span>
              <button
                type="button"
                onClick={() => setNoiseEnabled(!noiseEnabled)}
                className={`px-2.5 py-1 rounded border text-xs font-semibold ${
                  noiseEnabled ? 'bg-[#171E27] border-[rgba(245,158,11,0.4)] text-[#F59E0B]' : 'bg-[#070A0F] border-[#1B242E] text-[#697586]'
                }`}
              >
                {noiseEnabled ? `ON (${Math.round(noiseProbability * 100)}%)` : 'OFF'}
              </button>
            </div>

            {/* Qubits */}
            <div className="flex items-center gap-2">
              <span className="text-[#A3ACB9]">Qubits:</span>
              <select
                value={numQubits}
                onChange={(e) => setNumQubits(Number(e.target.value))}
                className="bg-[#070A0F] border border-[#1B242E] text-[#22D3EE] rounded px-2 py-1"
              >
                {QUBIT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Threshold */}
            <div className="flex items-center gap-2">
              <span className="text-[#A3ACB9]">Threshold:</span>
              <input
                type="range"
                min="3"
                max="30"
                step="1"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-20 accent-[#F43F5E]"
              />
              <span className="text-[#F43F5E] font-bold">{threshold}%</span>
            </div>
          </div>
        </div>

        {analysisError && (
          <div className="mt-3 p-2.5 rounded bg-[rgba(244,63,94,0.1)] border border-[#F43F5E] text-[#F43F5E] text-xs">
            {analysisError}
          </div>
        )}
      </div>

      {/* 3. Primary Security Status & Channel Disturbance Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 6-cols: Security Status Card */}
        <div className="lg:col-span-6 ui-panel p-6 bg-[#0D1117] border-[#1B242E] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1B242E]">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#F43F5E]" />
              <span className="font-mono font-bold text-xs uppercase tracking-widest text-[#F5F7FA]">
                Primary Security Assessment
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#697586]">
              Statistical Classification
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-mono text-[#697586] uppercase">OBSERVED DISTURBANCE</div>
              <div className="text-4xl font-extrabold font-mono text-[#F5F7FA] mt-0.5">
                {currentAnalysis ? `${activeQBER.toFixed(1)}%` : '0.0%'}
              </div>
              <div className="text-xs font-mono text-[#A3ACB9] mt-1">
                Threshold: <strong className="text-[#F43F5E]">{threshold}%</strong> &bull; Sifted: <strong className="text-[#F5F7FA]">{currentAnalysis?.sifted_length || 0}</strong> bits
              </div>
            </div>

            <div className="text-right font-mono">
              <div className={`px-3 py-1.5 rounded border text-xs font-bold uppercase tracking-wider ${statusBadge.badgeClass}`}>
                {currentAnalysis ? currentAnalysis.status : 'SECURE'}
              </div>
              <div className="text-[10px] text-[#697586] mt-1.5">
                Mismatches: <strong className="text-[#F43F5E]">{currentAnalysis?.errors || 0}</strong> bits
              </div>
            </div>
          </div>

          {/* Threat Interpretation Banner */}
          <div className="p-3.5 rounded-lg bg-[#121820] border border-[#1B242E] font-mono text-xs space-y-1">
            <div className={`font-bold flex items-center gap-1.5 ${
              interpretation.level === 'alert' ? 'text-[#F43F5E]' : interpretation.level === 'suspicious' ? 'text-[#F59E0B]' : 'text-[#10B981]'
            }`}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{interpretation.title}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#A3ACB9]">
              {interpretation.summary}
            </p>
          </div>
        </div>

        {/* Right 6-cols: Channel Disturbance Gauge */}
        <div className="lg:col-span-6 ui-panel p-6 bg-[#0D1117] border-[#1B242E] shadow-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#1B242E]">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#F43F5E]" />
              <span className="font-mono font-bold text-xs uppercase tracking-widest text-[#F5F7FA]">
                Channel Disturbance Level Gauge
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#697586]">Scale: 0% &rarr; 50%+</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#A3ACB9]">Total Disturbance:</span>
              <span className="font-bold text-[#F5F7FA]">{activeQBER.toFixed(1)}%</span>
            </div>

            <div className="h-3.5 w-full bg-[#070A0F] rounded-full overflow-hidden border border-[#1B242E] p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  activeQBER > threshold ? 'bg-[#F43F5E]' : activeQBER >= threshold * 0.5 ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                }`}
                style={{ width: `${Math.max(2, gaugePercent)}%` }}
              />
            </div>

            <div className="flex justify-between text-[10px] font-mono text-[#697586] pt-1">
              <span>0% (Ideal)</span>
              <span className="text-[#F59E0B]">{threshold * 0.5}% (Warn)</span>
              <span className="text-[#F43F5E]">{threshold}% (Limit)</span>
              <span>25% (Eve Exp)</span>
              <span>50%+</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#070A0F] border border-[#1B242E] text-xs font-mono text-[#A3ACB9]">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#F5F7FA]">Configured QBER Threshold:</span>
              <span className="text-[#F43F5E] font-bold">{threshold}%</span>
            </div>
            <p className="text-[10px] text-[#697586] mt-1">
              * Used as a prototype demonstration threshold to classify anomalous channel disturbance.
            </p>
          </div>
        </div>

      </div>

      {/* 4. Scenario Matrix & Multi-Scenario Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Scenario Matrix (6 cols) */}
        <div className="lg:col-span-6 ui-panel p-5 bg-[#0D1117] border-[#1B242E] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1B242E]">
            <div className="flex items-center gap-2">
              <Table className="w-4 h-4 text-[#F43F5E]" />
              <span className="font-mono font-bold text-xs uppercase tracking-widest text-[#F5F7FA]">
                Experimental Scenarios Matrix
              </span>
            </div>
            <button
              onClick={handleLoadScenarioBenchmarks}
              disabled={isLoadingExperiment}
              className="text-[10px] font-mono text-[#F43F5E] hover:text-[#E11D48] flex items-center gap-1 disabled:opacity-50"
            >
              {isLoadingExperiment ? <RotateCcw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              <span>Benchmark All 4</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#1B242E] bg-[#070A0F]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#121820] border-b border-[#1B242E] text-[10px] uppercase text-[#A3ACB9]">
                <tr>
                  <th className="py-2 px-3">Scenario</th>
                  <th className="py-2 px-3 text-center">Eve</th>
                  <th className="py-2 px-3 text-center">Noise</th>
                  <th className="py-2 px-3 text-right">Mean QBER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B242E]">
                <tr className="hover:bg-[#121820]">
                  <td className="py-2 px-3 font-semibold text-[#10B981]">1. Ideal Channel</td>
                  <td className="py-2 px-3 text-center text-[#697586]">OFF</td>
                  <td className="py-2 px-3 text-center text-[#697586]">OFF</td>
                  <td className="py-2 px-3 text-right font-bold text-[#10B981]">
                    {experimentData ? `${experimentData.scenarios.ideal.mean_qber.toFixed(2)}%` : '0.00%'}
                  </td>
                </tr>
                <tr className="hover:bg-[#121820]">
                  <td className="py-2 px-3 font-semibold text-[#F59E0B]">2. Noisy Channel</td>
                  <td className="py-2 px-3 text-center text-[#697586]">OFF</td>
                  <td className="py-2 px-3 text-center text-[#F59E0B] font-bold">ON</td>
                  <td className="py-2 px-3 text-right font-bold text-[#F59E0B]">
                    {experimentData ? `${experimentData.scenarios.noisy.mean_qber.toFixed(2)}%` : `~${(noiseProbability * 50).toFixed(1)}%`}
                  </td>
                </tr>
                <tr className="hover:bg-[#121820]">
                  <td className="py-2 px-3 font-semibold text-[#F43F5E]">3. Eve Only</td>
                  <td className="py-2 px-3 text-center text-[#F43F5E] font-bold">ON</td>
                  <td className="py-2 px-3 text-center text-[#697586]">OFF</td>
                  <td className="py-2 px-3 text-right font-bold text-[#F43F5E]">
                    {experimentData ? `${experimentData.scenarios.eve.mean_qber.toFixed(2)}%` : '~25.0%'}
                  </td>
                </tr>
                <tr className="hover:bg-[#121820]">
                  <td className="py-2 px-3 font-semibold text-[#A78BFA]">4. Combined</td>
                  <td className="py-2 px-3 text-center text-[#F43F5E] font-bold">ON</td>
                  <td className="py-2 px-3 text-center text-[#F59E0B] font-bold">ON</td>
                  <td className="py-2 px-3 text-right font-bold text-[#A78BFA]">
                    {experimentData ? `${experimentData.scenarios.combined.mean_qber.toFixed(2)}%` : '~27.5%'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Bar Chart (6 cols) */}
        <div className="lg:col-span-6 ui-panel p-5 bg-[#0D1117] border-[#1B242E] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1B242E]">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#F43F5E]" />
              <span className="font-mono font-bold text-xs uppercase tracking-widest text-[#F5F7FA]">
                Empirical Mean QBER Comparison
              </span>
            </div>
            {experimentData && (
              <span className="text-[10px] font-mono text-[#697586]">100 runs per scenario</span>
            )}
          </div>

          <div className="h-48 w-full">
            {barData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1B242E" />
                  <XAxis dataKey="name" stroke="#697586" tick={{ fill: '#A3ACB9', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 40]} stroke="#697586" tick={{ fill: '#A3ACB9', fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#070A0F', borderColor: '#252E38', fontFamily: 'monospace', fontSize: '11px' }}
                    formatter={(val) => [`${val.toFixed(2)}%`, 'Mean QBER']}
                  />
                  <Bar dataKey="qber" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#697586] font-mono text-xs">
                <BarChart2 className="w-7 h-7 text-[#252E38] mb-2" />
                <p>Click "Benchmark All 4" to compute live empirical distributions.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 5. Key Callout: Anomaly Signal vs Perfect Classifier */}
      <div className="ui-panel p-5 bg-[#0D1117] border-[#1B242E] shadow-xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded bg-[#171E27] border border-[rgba(245,158,11,0.3)] text-[#F59E0B] flex-shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#F59E0B]">
              QBER IS AN ANOMALY SIGNAL — NOT A DIRECT ADVERSARY PROOF
            </span>
            <p className="text-xs text-[#A3ACB9] mt-1 leading-relaxed">
              An elevated Quantum Bit Error Rate indicates measurable physical disturbance. In operational quantum communication networks, differentiating eavesdropping from fiber attenuation, thermal decoherence, or detector dark counts requires comprehensive calibration and privacy amplification.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
