import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SimulationControls from './components/SimulationControls';
import QuantumChannelVisualizer from './components/QuantumChannelVisualizer';
import SecurityStatusCard from './components/SecurityStatusCard';
import SiftedKeyPanel from './components/SiftedKeyPanel';
import DataTable from './components/DataTable';
import QBERChart from './components/QBERChart';
import ComparisonMode from './components/ComparisonMode';
import StepByStepWalkthrough from './components/StepByStepWalkthrough';
import QuantumChannelLab from './components/QuantumChannelLab';
import SecurityAnalysisDashboard from './components/SecurityAnalysisDashboard';
import EducationalSection from './components/EducationalSection';
import { fetchHealth, simulateBB84 } from './services/api';
import { AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator', 'security', 'channellab', 'stepbystep', 'comparison', 'theory'
  const [backendStatus, setBackendStatus] = useState(null);
  
  // Simulation parameters
  const [numQubits, setNumQubits] = useState(64);
  const [eveEnabled, setEveEnabled] = useState(false);
  const [qberThreshold, setQberThreshold] = useState(11.0);
  
  // Simulation results and state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [history, setHistory] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  // Check backend health on mount
  useEffect(() => {
    let mounted = true;
    const checkHealth = async () => {
      const status = await fetchHealth();
      if (mounted) setBackendStatus(status);
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Run simulation handler
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setErrorMessage(null);
    try {
      const data = await simulateBB84({
        num_qubits: numQubits,
        eve_enabled: eveEnabled,
        qber_threshold: qberThreshold,
      });

      setSimulationData(data);
      // Append to history (keep latest 30 runs)
      setHistory((prev) => [...prev.slice(-29), data]);
    } catch (err) {
      console.error('Simulation Failed:', err);
      setErrorMessage(err.message || 'Simulation encountered an unexpected error.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Reset parameters and data
  const handleReset = () => {
    setNumQubits(64);
    setEveEnabled(false);
    setQberThreshold(11.0);
    setSimulationData(null);
    setErrorMessage(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200 font-sans">
      
      {/* Header */}
      <Header
        backendStatus={backendStatus}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleReset}
        isSimulating={isSimulating}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Error notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-600/80 text-rose-200 text-xs font-mono flex items-center gap-3 shadow-lg shadow-rose-950/50">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div className="flex-1">
              <strong>Error:</strong> {errorMessage}
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* TAB 1: Live Simulator View */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            
            {/* Top: Controls bar */}
            <SimulationControls
              numQubits={numQubits}
              setNumQubits={setNumQubits}
              eveEnabled={eveEnabled}
              setEveEnabled={setEveEnabled}
              qberThreshold={qberThreshold}
              setQberThreshold={setQberThreshold}
              onRunSimulation={handleRunSimulation}
              isSimulating={isSimulating}
            />

            {/* Quantum Channel Visualizer */}
            <QuantumChannelVisualizer
              eveEnabled={eveEnabled}
              simulationData={simulationData}
              isSimulating={isSimulating}
            />

            {/* Middle Grid: Security Status HUD & QBER Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <SecurityStatusCard
                  simulationData={simulationData}
                  qberThreshold={qberThreshold}
                />
              </div>
              <div className="lg:col-span-6">
                <QBERChart
                  history={history}
                  qberThreshold={qberThreshold}
                  onClearHistory={handleClearHistory}
                />
              </div>
            </div>

            {/* Sifted Key Output Panel */}
            {simulationData && (
              <SiftedKeyPanel simulationData={simulationData} />
            )}

            {/* Per-Qubit Telemetry Data Table */}
            {simulationData && (
              <DataTable simulationData={simulationData} />
            )}

            {/* Educational Collapsible Guide */}
            <EducationalSection />

          </div>
        )}

        {/* TAB 2: Security Analysis Dashboard */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <SecurityAnalysisDashboard
              simulationData={simulationData}
              history={history}
              qberThreshold={qberThreshold}
              onRunSimulation={handleRunSimulation}
              isSimulating={isSimulating}
            />
            <EducationalSection />
          </div>
        )}

        {/* TAB 3: Quantum Channel Lab */}
        {activeTab === 'channellab' && (
          <div className="space-y-6">
            <QuantumChannelLab defaultThreshold={qberThreshold} />
            <EducationalSection />
          </div>
        )}

        {/* TAB 4: Step-by-Step Walkthrough Mode */}
        {activeTab === 'stepbystep' && (
          <div className="space-y-6">
            <SimulationControls
              numQubits={numQubits}
              setNumQubits={setNumQubits}
              eveEnabled={eveEnabled}
              setEveEnabled={setEveEnabled}
              qberThreshold={qberThreshold}
              setQberThreshold={setQberThreshold}
              onRunSimulation={handleRunSimulation}
              isSimulating={isSimulating}
            />

            <StepByStepWalkthrough
              simulationData={simulationData}
              onRunSimulation={handleRunSimulation}
              isSimulating={isSimulating}
              qberThreshold={qberThreshold}
            />

            <EducationalSection />
          </div>
        )}

        {/* TAB 5: Comparison Mode */}
        {activeTab === 'comparison' && (
          <div className="space-y-6">
            <ComparisonMode
              qberThreshold={qberThreshold}
              defaultNumQubits={numQubits}
            />
            <EducationalSection />
          </div>
        )}

        {/* TAB 6: Theoretical Documentation & Guide */}
        {activeTab === 'theory' && (
          <div className="space-y-6">
            <EducationalSection />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1B242E] bg-[#070A0F] py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2">
          <div>
            BB84 Quantum Security Simulator • Built with React, Tailwind CSS, FastAPI & Qiskit
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Prototype Detection Sandbox</span>
            <span className="text-slate-700">•</span>
            <span className="text-cyan-400">AerSimulator Backend</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
