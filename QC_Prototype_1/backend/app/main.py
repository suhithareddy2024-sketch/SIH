"""FastAPI server for the BB84 Quantum Security Simulator and Quantum Channel Noise Lab."""

from typing import Dict, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import qiskit
import numpy as np

from .models import (
    SimulationRequest,
    SimulationResponse,
    ComparisonRequest,
    ComparisonResponse,
    AggregateStats,
    BenchmarkRequest,
    BenchmarkResponse,
    BenchmarkSummary,
    ChannelAnalysisRequest,
    ChannelAnalysisResponse,
    ChannelExperimentRequest,
    ChannelExperimentResponse,
    ScenarioStats,
    DistributionBin,
    HealthResponse,
    QubitDetail,
)
from .quantum.bb84 import simulate_bb84, BB84SimulationResult
from .quantum.channel import simulate_noisy_bb84, NoiseModelType
from .quantum.security import evaluate_security

app = FastAPI(
    title="BB84 Quantum Security Simulator API",
    description="Educational cybersecurity prototype simulating the BB84 Quantum Key Distribution protocol with Qiskit.",
    version="1.1.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _convert_result_to_response(
    result: BB84SimulationResult, threshold: float
) -> SimulationResponse:
    decision = evaluate_security(
        qber=result.qber,
        threshold=threshold,
        errors=result.errors,
        sifted_length=result.sifted_length,
    )

    details = [
        QubitDetail(
            position=d.position,
            alice_bit=d.alice_bit,
            alice_basis=d.alice_basis,
            eve_basis=d.eve_basis,
            eve_bit=d.eve_bit,
            bob_basis=d.bob_basis,
            bob_bit=d.bob_bit,
            basis_match=d.basis_match,
            bit_error=d.bit_error,
        )
        for d in result.details
    ]

    return SimulationResponse(
        num_qubits=result.num_qubits,
        eve_enabled=result.eve_enabled,
        alice_bits=result.alice_bits,
        alice_bases=result.alice_bases,
        eve_bases=result.eve_bases,
        eve_bits=result.eve_bits,
        bob_bases=result.bob_bases,
        bob_bits=result.bob_bits,
        basis_matches=result.basis_matches,
        sifted_positions=result.sifted_positions,
        sifted_alice_key=result.sifted_alice_key,
        sifted_bob_key=result.sifted_bob_key,
        sifted_length=result.sifted_length,
        errors=result.errors,
        qber=result.qber,
        threshold=threshold,
        status=decision.status.value,
        reason=decision.reason,
        is_eavesdropping_detected=decision.is_eavesdropping_detected,
        details=details,
    )


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint to verify backend status and quantum dependencies."""
    return HealthResponse(
        status="OK",
        service="BB84 Quantum Security Simulator",
        quantum_backend=f"Qiskit {qiskit.__version__} (AerSimulator)",
        version="1.1.0",
    )


# -------------------------------------------------------------
# CORE BB84 ENDPOINTS (PRESERVED)
# -------------------------------------------------------------

@app.post("/api/bb84/simulate", response_model=SimulationResponse)
def run_simulation(request: SimulationRequest):
    """
    Executes a single BB84 quantum transmission simulation using Qiskit.
    Returns complete qubit telemetry, sifted keys, QBER, and threat decision.
    """
    try:
        result = simulate_bb84(
            num_qubits=request.num_qubits, eve_enabled=request.eve_enabled
        )
        return _convert_result_to_response(result, request.qber_threshold)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@app.post("/api/bb84/compare", response_model=ComparisonResponse)
def run_comparison(request: ComparisonRequest):
    """
    Executes multiple comparative simulations (Without Eve vs With Eve)
    to generate statistical distributions of QBER, error counts, and detection rates.
    """
    try:
        without_eve_runs = []
        with_eve_runs = []

        for _ in range(request.iterations):
            r_no_eve = simulate_bb84(request.num_qubits, eve_enabled=False)
            without_eve_runs.append(
                _convert_result_to_response(r_no_eve, request.qber_threshold)
            )

            r_eve = simulate_bb84(request.num_qubits, eve_enabled=True)
            with_eve_runs.append(
                _convert_result_to_response(r_eve, request.qber_threshold)
            )

        def aggregate(runs: list[SimulationResponse], eve_enabled: bool) -> AggregateStats:
            qbers = [r.qber for r in runs]
            errors = [r.errors for r in runs]
            lengths = [r.sifted_length for r in runs]
            alerts = sum(1 for r in runs if r.status == "SECURITY ALERT")

            return AggregateStats(
                eve_enabled=eve_enabled,
                runs=len(runs),
                avg_qber=round(float(np.mean(qbers)), 2),
                std_qber=round(float(np.std(qbers)), 2),
                min_qber=round(float(np.min(qbers)), 2),
                max_qber=round(float(np.max(qbers)), 2),
                avg_errors=round(float(np.mean(errors)), 2),
                avg_sifted_length=round(float(np.mean(lengths)), 2),
                detection_alerts_count=alerts,
                detection_rate_pct=round(alerts / len(runs) * 100.0, 1),
                runs_data=runs,
            )

        return ComparisonResponse(
            num_qubits=request.num_qubits,
            threshold=request.qber_threshold,
            iterations=request.iterations,
            without_eve=aggregate(without_eve_runs, False),
            with_eve=aggregate(with_eve_runs, True),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")


@app.post("/api/bb84/benchmark", response_model=BenchmarkResponse)
def run_large_benchmark(request: BenchmarkRequest):
    """
    Executes a large-sample statistical verification across many independent runs.
    Calculates mean QBER, standard deviation, and security classification frequencies.
    """
    try:
        def run_batch_stats(eve_enabled: bool) -> BenchmarkSummary:
            qbers = []
            errors_list = []
            sifted_lengths = []
            secure_count = 0
            suspicious_count = 0
            alert_count = 0

            suspicious_boundary = request.qber_threshold * 0.5

            for _ in range(request.iterations):
                res = simulate_bb84(request.num_qubits, eve_enabled)
                qbers.append(res.qber)
                errors_list.append(res.errors)
                sifted_lengths.append(res.sifted_length)

                if res.qber > request.qber_threshold:
                    alert_count += 1
                elif res.qber >= suspicious_boundary:
                    suspicious_count += 1
                else:
                    secure_count += 1

            if not eve_enabled:
                expected_desc = (
                    "Under ideal noiseless simulation, QBER is expected to be 0.00% without eavesdropping."
                )
            else:
                expected_desc = (
                    "Under standard BB84 assumptions, intercept-and-resend produces an expected QBER of approximately 25%. "
                    "Individual runs fluctuate probabilistically."
                )

            return BenchmarkSummary(
                eve_enabled=eve_enabled,
                simulations_count=request.iterations,
                mean_qber=round(float(np.mean(qbers)), 2),
                std_qber=round(float(np.std(qbers)), 2),
                min_qber=round(float(np.min(qbers)), 2),
                max_qber=round(float(np.max(qbers)), 2),
                mean_errors=round(float(np.mean(errors_list)), 2),
                mean_sifted_length=round(float(np.mean(sifted_lengths)), 2),
                secure_count=secure_count,
                suspicious_count=suspicious_count,
                alert_count=alert_count,
                expected_behavior=expected_desc,
            )

        return BenchmarkResponse(
            num_qubits=request.num_qubits,
            threshold=request.qber_threshold,
            iterations=request.iterations,
            without_eve=run_batch_stats(False),
            with_eve=run_batch_stats(True),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark error: {str(e)}")


# -------------------------------------------------------------
# QUANTUM CHANNEL NOISE & ATTACK ANALYSIS ENDPOINTS (NEW)
# -------------------------------------------------------------

@app.post("/api/bb84/channel-analysis", response_model=ChannelAnalysisResponse)
def analyze_channel(request: ChannelAnalysisRequest):
    """
    Executes a single BB84 quantum transmission under customizable channel noise and eavesdropping.
    """
    try:
        # Determine scenario identification
        if not request.eve_enabled and not request.noise_enabled:
            scenario = "ideal_channel"
        elif not request.eve_enabled and request.noise_enabled:
            scenario = "noisy_channel"
        elif request.eve_enabled and not request.noise_enabled:
            scenario = "eavesdropping_only"
        else:
            scenario = "combined_attack"

        result = simulate_noisy_bb84(
            num_qubits=request.num_qubits,
            eve_enabled=request.eve_enabled,
            noise_enabled=request.noise_enabled,
            noise_model=request.noise_model,
            noise_probability=request.noise_probability,
        )

        decision = evaluate_security(
            qber=result.qber,
            threshold=request.qber_threshold,
            errors=result.errors,
            sifted_length=result.sifted_length,
        )

        details = [
            QubitDetail(
                position=d.position,
                alice_bit=d.alice_bit,
                alice_basis=d.alice_basis,
                eve_basis=d.eve_basis,
                eve_bit=d.eve_bit,
                bob_basis=d.bob_basis,
                bob_bit=d.bob_bit,
                basis_match=d.basis_match,
                bit_error=d.bit_error,
            )
            for d in result.details
        ]

        return ChannelAnalysisResponse(
            scenario=scenario,
            num_qubits=result.num_qubits,
            noise_enabled=request.noise_enabled,
            noise_model=request.noise_model,
            noise_probability=request.noise_probability,
            eve_enabled=result.eve_enabled,
            sifted_length=result.sifted_length,
            errors=result.errors,
            qber=result.qber,
            threshold=request.qber_threshold,
            status=decision.status.value,
            reason=decision.reason,
            is_eavesdropping_detected=decision.is_eavesdropping_detected,
            alice_bits=result.alice_bits,
            alice_bases=result.alice_bases,
            eve_bases=result.eve_bases,
            eve_bits=result.eve_bits,
            bob_bases=result.bob_bases,
            bob_bits=result.bob_bits,
            basis_matches=result.basis_matches,
            sifted_positions=result.sifted_positions,
            sifted_alice_key=result.sifted_alice_key,
            sifted_bob_key=result.sifted_bob_key,
            details=details,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Channel analysis error: {str(e)}")


@app.post("/api/bb84/channel-experiment", response_model=ChannelExperimentResponse)
def run_channel_experiment(request: ChannelExperimentRequest):
    """
    Executes a 4-scenario statistical experiment:
    1. Ideal Channel (No Eve, No Noise)
    2. Noisy Channel (No Eve, Noise Active)
    3. Eavesdropping Only (Eve Active, No Noise)
    4. Combined Attack (Eve Active + Noise Active)
    """
    try:
        scenario_configs = [
            ("ideal", "Ideal Channel", False, False),
            ("noisy", f"Noisy Channel ({request.noise_model} {int(request.noise_probability * 100)}%)", False, True),
            ("eve", "Eavesdropping Only (Eve)", True, False),
            ("combined", f"Combined (Eve + {int(request.noise_probability * 100)}% Noise)", True, True),
        ]

        scenarios_results: Dict[str, ScenarioStats] = {}
        all_qbers: Dict[str, List[float]] = {}

        suspicious_boundary = request.qber_threshold * 0.5

        for sc_id, sc_name, eve, noise in scenario_configs:
            qbers = []
            errors_list = []
            sifted_lengths = []
            sec_count = 0
            sus_count = 0
            alt_count = 0

            for _ in range(request.iterations):
                res = simulate_noisy_bb84(
                    num_qubits=request.num_qubits,
                    eve_enabled=eve,
                    noise_enabled=noise,
                    noise_model=request.noise_model,
                    noise_probability=request.noise_probability,
                )
                qbers.append(res.qber)
                errors_list.append(res.errors)
                sifted_lengths.append(res.sifted_length)

                if res.qber > request.qber_threshold:
                    alt_count += 1
                elif res.qber >= suspicious_boundary:
                    sus_count += 1
                else:
                    sec_count += 1

            all_qbers[sc_id] = qbers

            if sc_id == "ideal":
                exp_text = "Under ideal noiseless simulation: QBER is expected to be 0.00% without noise or eavesdropping."
            elif sc_id == "noisy":
                exp_text = f"Physical noise disturbs quantum states before measurement, introducing baseline error without an attacker."
            elif sc_id == "eve":
                exp_text = "Intercept-and-resend attack introduces an expected ~25% QBER disturbance from basis mismatch collapse."
            else:
                exp_text = "Both channel noise and eavesdropping compound, producing higher total QBER disturbance."

            scenarios_results[sc_id] = ScenarioStats(
                scenario_id=sc_id,
                scenario_name=sc_name,
                eve_enabled=eve,
                noise_enabled=noise,
                noise_model=request.noise_model if noise else "none",
                noise_probability=request.noise_probability if noise else 0.0,
                iterations=request.iterations,
                mean_qber=round(float(np.mean(qbers)), 2),
                std_qber=round(float(np.std(qbers)), 2),
                min_qber=round(float(np.min(qbers)), 2),
                max_qber=round(float(np.max(qbers)), 2),
                median_qber=round(float(np.median(qbers)), 2),
                mean_errors=round(float(np.mean(errors_list)), 2),
                mean_sifted_length=round(float(np.mean(sifted_lengths)), 2),
                secure_count=sec_count,
                suspicious_count=sus_count,
                alert_count=alt_count,
                detection_rate_pct=round((alt_count / request.iterations) * 100.0, 1),
                expected_behavior=exp_text,
            )

        # Generate Distribution Histogram Bins
        bins_definition = [
            ("0-5%", 0.0, 5.0),
            ("5-10%", 5.0, 10.0),
            ("10-15%", 10.0, 15.0),
            ("15-20%", 15.0, 20.0),
            ("20-25%", 20.0, 25.0),
            ("25-30%", 25.0, 30.0),
            ("30-35%", 30.0, 35.0),
            ("35-40%", 35.0, 40.0),
            (">40%", 40.0, 100.0),
        ]

        distribution_bins = []
        for label, b_min, b_max in bins_definition:
            def count_in_bin(values: List[float]) -> int:
                if b_min == 0.0:
                    return sum(1 for v in values if b_min <= v <= b_max)
                return sum(1 for v in values if b_min < v <= b_max)

            distribution_bins.append(
                DistributionBin(
                    bin_label=label,
                    bin_min=b_min,
                    bin_max=b_max,
                    ideal_count=count_in_bin(all_qbers["ideal"]),
                    noise_count=count_in_bin(all_qbers["noisy"]),
                    eve_count=count_in_bin(all_qbers["eve"]),
                    combined_count=count_in_bin(all_qbers["combined"]),
                )
            )

        return ChannelExperimentResponse(
            num_qubits=request.num_qubits,
            noise_model=request.noise_model,
            noise_probability=request.noise_probability,
            qber_threshold=request.qber_threshold,
            iterations=request.iterations,
            scenarios=scenarios_results,
            distribution_bins=distribution_bins,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Channel experiment error: {str(e)}")
