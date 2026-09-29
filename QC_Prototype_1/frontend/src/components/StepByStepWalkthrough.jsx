import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Play,
  Pause,
  UserCheck,
  ShieldAlert,
  Radio,
  CheckCircle,
  XCircle,
  Key,
  ShieldCheck,
  AlertTriangle,
  Zap,
  BookOpen,
} from 'lucide-react';

export default function StepByStepWalkthrough({ simulationData, onRunSimulation, isSimulating, qberThreshold }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // 11 BB84 Steps definition
  const STEPS = [
    {
      step: 1,
      title: '01. Alice Generates Random Classical Bits',
      description: 'Alice creates an independent sequence of random classical bits: 0 or 1.',
      detail: 'Alice uses a true random source to generate a secret string of raw bits.',
    },
    {
      step: 2,
      title: '02. Alice Selects Random Conjugate Bases',
      description: 'Alice independently selects a conjugate basis for each bit: Rectilinear (+) or Diagonal (×).',
      detail: 'The two bases are mutually unbiased: knowing a state in one basis gives zero information in the other.',
    },
    {
      step: 3,
      title: '03. Qubits Are Encoded into Polarized States',
      description: 'Alice maps each bit to a quantum state: |0⟩, |1⟩ for + basis or |+⟩, |−⟩ for × basis.',
      detail: '|0⟩ = |H⟩, |1⟩ = |V⟩, |+⟩ = (|0⟩+|1⟩)/√2, |−⟩ = (|0⟩−|1⟩)/√2.',
    },
    {
      step: 4,
      title: '04. Quantum Channel Transmission',
      description: 'Single photons propagate through the coherent optical fiber toward Bob.',
      detail: 'In transit, individual quantum states cannot be cloned due to the Quantum No-Cloning Theorem.',
    },
    {
      step: 5,
      title: '05. Eve Intercept-and-Resend Attack',
      description: simulationData?.eve_enabled
        ? 'Eve intercepts each qubit, measures in an independent random basis, and resends a replacement state.'
        : 'Eve is disabled. Single photons propagate through the channel without interception.',
      detail: simulationData?.eve_enabled
        ? 'Eve chooses the wrong basis 50% of the time, causing wave-function collapse and introducing ~25% QBER.'
        : 'Direct optical transmission without adversarial measurement collapse.',
    },
    {
      step: 6,
      title: '06. Bob Selects Random Measurement Bases',
      description: 'Bob independently chooses random bases (+ or ×) for each photon without communicating with Alice.',
      detail: 'Bob cannot know Alice’s bases in advance, so on average 50% of his choices will match Alice’s.',
    },
    {
      step: 7,
      title: '07. Bob Measures Received Photons',
      description: 'Bob performs projective quantum measurements on the incoming qubits using his selected bases.',
      detail: 'When Bob’s basis matches Alice’s, he obtains Alice’s bit with 100% certainty (in a noiseless channel).',
    },
    {
      step: 8,
      title: '08. Public Classical Basis Announcement',
      description: 'Alice and Bob broadcast their basis choices over an authenticated classical channel.',
      detail: 'Only bases (+ or ×) are announced publicly. Bit values (0 or 1) remain strictly confidential.',
    },
    {
      step: 9,
      title: '09. Key Sifting (Basis Matching)',
      description: 'Positions where Alice and Bob used the same basis are retained; mismatched positions are discarded.',
      detail: 'The remaining retained bits form the sifted key (typically ~50% yield of the initial raw qubits).',
    },
    {
      step: 10,
      title: '10. QBER Calculation on Sample Subset',
      description: 'Alice and Bob compare a test sample of sifted bits to determine the Quantum Bit Error Rate.',
      detail: 'QBER = (Mismatches in Sifted Subset / Subset Length) × 100%.',
    },
    {
      step: 11,
      title: '11. Prototype Security Classification',
      description: `The QBER is evaluated against the threshold (${qberThreshold}%): SECURE, SUSPICIOUS, or SECURITY ALERT.`,
      detail: 'If QBER is below threshold, error correction and privacy amplification proceed; otherwise the key is aborted.',
    },
  ];

  // Auto-play timer
  React.useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= 11) {
            setIsAutoPlaying(false);
            return 11;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  if (!simulationData) {
    return (
      <div className="ui-panel p-8 bg-[#0D1117] border-[#1B242E] text-center flex flex-col items-center justify-center min-h-[300px]">
        <BookOpen className="w-10 h-10 text-[#A78BFA] mb-3" />
        <h3 className="text-sm font-mono font-bold text-[#F5F7FA]">No Quantum Circuit Telemetry Available</h3>
        <p className="text-xs text-[#A3ACB9] mt-1 max-w-md">
          Execute a Qiskit quantum circuit simulation first to step through the 11-stage protocol with live experimental telemetry.
        </p>
        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className="mt-4 px-5 py-2 rounded-lg font-mono font-bold text-xs uppercase bg-[#A78BFA] hover:bg-[#8B5CF6] text-[#070A0F] shadow-sm transition-all"
        >
          Run Simulation Now
        </button>
      </div>
    );
  }

  const stepInfo = STEPS[currentStep - 1] || STEPS[0];
  const details = simulationData?.details || [];
  const sifted_length = simulationData?.sifted_length || 0;
  const errors = simulationData?.errors || 0;
  const qber = typeof simulationData?.qber === 'number' ? simulationData.qber : 0;
  const status = simulationData?.status || 'SECURE';
  const num_qubits = simulationData?.num_qubits || 64;
  const eve_enabled = simulationData?.eve_enabled || false;
  const previewDetails = details.slice(0, 16);

  return (
    <div className="ui-panel p-6 bg-[#0D1117] border-[#1B242E] shadow-xl space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#1B242E] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-[#171E27] text-[#A78BFA] border border-[rgba(167,139,250,0.3)]">
              Stage {currentStep} of 11
            </span>
            <h3 className="font-mono font-bold text-[#F5F7FA] text-sm">{stepInfo.title}</h3>
          </div>
          <p className="text-xs text-[#A3ACB9] mt-1">{stepInfo.description}</p>
        </div>

        {/* Step controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStep((p) => Math.max(1, p - 1))}
            disabled={currentStep === 1}
            className="p-2 rounded bg-[#070A0F] border border-[#1B242E] text-[#A3ACB9] hover:text-[#F5F7FA] disabled:opacity-30"
            title="Previous Stage"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs font-semibold border ${
              isAutoPlaying ? 'bg-[#171E27] text-[#A78BFA] border-[rgba(167,139,250,0.4)]' : 'bg-[#070A0F] text-[#A3ACB9] border-[#1B242E]'
            }`}
          >
            {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>

          <button
            onClick={() => setCurrentStep((p) => Math.min(11, p + 1))}
            disabled={currentStep === 11}
            className="p-2 rounded bg-[#070A0F] border border-[#1B242E] text-[#A3ACB9] hover:text-[#F5F7FA] disabled:opacity-30"
            title="Next Stage"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => { setCurrentStep(1); setIsAutoPlaying(false); }}
            className="p-2 rounded bg-[#070A0F] border border-[#1B242E] text-[#697586] hover:text-[#A3ACB9]"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 11-Stage Horizontal Stepper Tracker */}
      <div className="grid grid-cols-11 gap-1">
        {STEPS.map((s) => (
          <button
            key={s.step}
            onClick={() => { setCurrentStep(s.step); setIsAutoPlaying(false); }}
            className={`h-1.5 rounded-full transition-all ${
              s.step === currentStep
                ? 'bg-[#A78BFA]'
                : s.step < currentStep
                ? 'bg-[#171E27] border border-[rgba(167,139,250,0.3)]'
                : 'bg-[#070A0F] border border-[#1B242E]'
            }`}
            title={s.title}
          />
        ))}
      </div>

      {/* Interactive Visual Qubit Matrix based on Current Step */}
      <div className="p-4 rounded-lg bg-[#070A0F] border border-[#1B242E] overflow-x-auto">
        <div className="text-[11px] font-mono text-[#697586] mb-3 flex items-center justify-between">
          <span>First 16 Qubit Positions (Qiskit Circuit Output):</span>
          <span>Channel: {eve_enabled ? 'Intercept & Resend (Eve ON)' : 'Direct (No Eve)'}</span>
        </div>

        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 text-center font-mono">
          {previewDetails.map((q) => {
            let stateLabel = q.alice_basis === '+' ? (q.alice_bit === 0 ? '|0⟩' : '|1⟩') : (q.alice_bit === 0 ? '|+⟩' : '|−⟩');
            
            return (
              <div
                key={q.position}
                className={`p-2 rounded border text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                  currentStep >= 9 && !q.basis_match
                    ? 'opacity-20 border-[#1B242E] bg-[#070A0F] text-[#697586]'
                    : currentStep >= 10 && q.bit_error
                    ? 'border-[rgba(244,63,94,0.4)] bg-[#171E27] text-[#F43F5E]'
                    : currentStep >= 9 && q.basis_match
                    ? 'border-[rgba(16,185,129,0.4)] bg-[#121820] text-[#10B981]'
                    : 'border-[#1B242E] bg-[#121820] text-[#F5F7FA]'
                }`}
              >
                <div className="text-[9px] text-[#697586] font-bold">#{q.position}</div>

                {/* Step 1: Alice Bit */}
                {currentStep >= 1 && (
                  <div className="text-[#22D3EE] font-bold">{q.alice_bit}</div>
                )}

                {/* Step 2: Alice Basis */}
                {currentStep >= 2 && (
                  <div className="text-[10px] text-[#A78BFA] font-semibold">{q.alice_basis}</div>
                )}

                {/* Step 3: Encoded State */}
                {currentStep === 3 && (
                  <div className="text-[10px] text-[#22D3EE]">{stateLabel}</div>
                )}

                {/* Step 5: Eve */}
                {currentStep >= 5 && eve_enabled && (
                  <div className="text-[10px] text-[#F43F5E] bg-[#171E27] px-1 rounded">
                    {q.eve_basis}:{q.eve_bit}
                  </div>
                )}

                {/* Step 6-7: Bob */}
                {currentStep >= 6 && (
                  <div className="text-[10px] text-[#34D399] font-semibold">{q.bob_basis}</div>
                )}
                {currentStep >= 7 && (
                  <div className="text-[#34D399] font-bold">{q.bob_bit}</div>
                )}

                {/* Step 8-9: Sift */}
                {currentStep >= 8 && (
                  <div className="text-[9px]">
                    {q.basis_match ? <CheckCircle className="w-3 h-3 text-[#10B981] mx-auto" /> : <XCircle className="w-3 h-3 text-[#697586] mx-auto" />}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Explanation Callout */}
      <div className="p-4 rounded-lg bg-[#121820] border border-[#1B242E] text-xs font-mono flex items-start gap-3">
        <div className="p-2 rounded bg-[#171E27] border border-[rgba(167,139,250,0.3)] text-[#A78BFA] flex-shrink-0">
          <BookOpen className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="font-bold text-[#F5F7FA]">Stage {currentStep} Technical Context:</div>
          <div className="text-[#A3ACB9] leading-relaxed">
            {stepInfo.detail}
          </div>
        </div>
      </div>

    </div>
  );
}
