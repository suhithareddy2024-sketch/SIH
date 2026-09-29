import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Lock, AlertTriangle, Key, Layers, Cpu, Info } from 'lucide-react';

export default function EducationalSection() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="ui-surface p-5">
      
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800/60 border border-[#252E38] text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors">
              How BB84 Quantum Key Distribution Works
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Conjugate bases, projective measurement collapse, intercept-and-resend math & security detection principles
            </p>
          </div>
        </div>

        <div className="p-1.5 rounded-lg ui-panel-secondary text-slate-400 group-hover:text-slate-200 transition-colors">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="mt-5 pt-4 border-t border-[#252E38] space-y-5 text-xs text-slate-300 leading-relaxed">
          
          {/* Step-by-Step Protocol Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Step 1 */}
            <div className="p-4 rounded-xl ui-panel-secondary">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs mb-2">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-[10px]">1</span>
                <span>Two Conjugate Bases</span>
              </div>
              <p className="text-slate-400 text-xs">
                Alice encodes random classical bits (0 or 1) using two mutually unbiased quantum bases:
              </p>
              <ul className="mt-2 space-y-1 font-mono text-[11px] text-slate-300 list-disc list-inside">
                <li><strong className="text-cyan-300">+ Rectilinear:</strong> Bit 0 &rarr; |0&rang;, Bit 1 &rarr; |1&rang;</li>
                <li><strong className="text-purple-300">&times; Diagonal:</strong> Bit 0 &rarr; |+&rang;, Bit 1 &rarr; |-&rang;</li>
              </ul>
              <p className="text-slate-400 mt-2 text-[11px]">
                Measuring in the prepared basis preserves the bit deterministically. Measuring in the orthogonal conjugate basis collapses the qubit randomly (50/50).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl ui-panel-secondary">
              <div className="flex items-center gap-2 text-teal-400 font-mono font-bold text-xs mb-2">
                <span className="w-5 h-5 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-[10px]">2</span>
                <span>Bob: Independent Measurement</span>
              </div>
              <p className="text-slate-400 text-xs">
                Bob independently selects a random measurement basis (+ or &times;) for each incoming photon without knowing Alice's choice in advance.
              </p>
              <p className="mt-2 text-[11px] text-slate-400 font-mono">
                Matching bases &implies; 100% deterministic bit agreement (in noiseless simulation). Mismatched bases &implies; 50% random collapse.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl ui-panel-secondary">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs mb-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-[10px]">3</span>
                <span>Sifting & Statistical QBER</span>
              </div>
              <p className="text-slate-400 text-xs">
                Over a public authenticated classical channel, Alice & Bob compare bases (not raw bits). Only matching positions are retained for the <strong>sifted key</strong>.
              </p>
              <div className="mt-2 text-[11px] font-mono text-emerald-300 font-bold bg-emerald-950/30 p-2 rounded border border-emerald-800/40">
                QBER = (Mismatched Sifted Bits / Total Sifted Bits) &times; 100%
              </div>
            </div>

          </div>

          {/* Theoretical Foundations Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Why Eve Is Detected */}
            <div className="p-4 rounded-xl ui-panel-secondary">
              <h4 className="font-mono font-bold text-slate-200 text-xs flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                Why Eve's Presence Is Inevitably Revealed
              </h4>
              <p className="text-slate-400 text-xs">
                In classical communications, an eavesdropper can tap a wire and copy data without leaving a trace.
                In quantum key distribution, <strong>Eve does not know Alice's preparation basis in advance</strong>.
              </p>
              <div className="mt-2.5 p-2.5 rounded bg-cyan-950/20 border border-cyan-800/40 text-[11px] text-cyan-300 font-mono">
                <strong>Crucial Principle:</strong> No-cloning alone is not the entire reason Eve is detected. In BB84, Eve's lack of knowledge of the preparation basis and the disturbance caused by measurement/intercept-and-resend are central to the detection mechanism.
              </div>
            </div>

            {/* Why Intercept-and-Resend Produces ~25% Error */}
            <div className="p-4 rounded-xl bg-rose-950/15 border border-rose-900/30">
              <h4 className="font-mono font-bold text-rose-300 text-xs flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Why Intercept-and-Resend Averages &asymp; 25% QBER
              </h4>
              <div className="text-slate-300 text-xs space-y-1.5">
                <p>When Alice and Bob happen to choose the same basis (50% of the time during sifting):</p>
                <ul className="list-disc list-inside text-[11px] text-slate-400 font-mono space-y-0.5">
                  <li>Eve chooses the <strong>correct basis</strong> with probability P = 0.5 &implies; Bob gets the correct bit (0% error).</li>
                  <li>Eve chooses the <strong>wrong basis</strong> with probability P = 0.5, collapsing the state. When Bob measures in Alice's original basis, he gets the wrong bit with probability 0.5.</li>
                  <li><strong>Expected error rate:</strong> P(wrong basis) &times; P(error) = 0.5 &times; 0.5 = <strong>25.0%</strong>.</li>
                </ul>
                <p className="text-[10px] text-slate-400 italic mt-1">
                  * Note: In finite simulations, random quantum variance causes individual runs to fluctuate around 25%.
                </p>
              </div>
            </div>

          </div>

          {/* Prototype Threshold vs Real-World QKD */}
          <div className="p-3.5 rounded-lg ui-panel-secondary text-[11px] text-slate-400 font-mono space-y-1.5">
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Demonstration Threshold vs Physical QKD Deployments</span>
            </div>
            <p className="leading-relaxed">
              The <strong>11% threshold</strong> in this simulator is a configurable prototype classification parameter for demonstrating anomaly detection.
              In real-world optical networks, baseline environmental noise, dark counts, and fiber birefringence cause a small non-zero baseline QBER (~1-3%) even without an eavesdropper. Real QKD systems use Error Correction (e.g. Cascade/LDPC) and Privacy Amplification (universal hash functions) to distill a clean, provably secure key provided the total error is below the abort threshold.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
