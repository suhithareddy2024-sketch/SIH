"""Pydantic schemas for the BB84 API and Quantum Channel Noise Analysis."""

from typing import List, Optional, Dict
from pydantic import BaseModel, Field


class QubitDetail(BaseModel):
    position: int
    alice_bit: int
    alice_basis: str
    eve_basis: Optional[str] = None
    eve_bit: Optional[int] = None
    bob_basis: str
    bob_bit: int
    basis_match: bool
    bit_error: bool


class SimulationRequest(BaseModel):
    num_qubits: int = Field(64, ge=4, le=1024, description="Number of qubits to transmit (16, 32, 64, 128, 256, etc.)")
    eve_enabled: bool = Field(False, description="Whether Eve performs intercept-and-resend attack")
    qber_threshold: float = Field(11.0, ge=0.0, le=100.0, description="Configurable prototype QBER detection threshold (%) used for demonstration purposes")


class SimulationResponse(BaseModel):
    num_qubits: int
    eve_enabled: bool
    alice_bits: List[int]
    alice_bases: List[str]
    eve_bases: List[Optional[str]]
    eve_bits: List[Optional[int]]
    bob_bases: List[str]
    bob_bits: List[int]
    basis_matches: List[bool]
    sifted_positions: List[int]
    sifted_alice_key: str
    sifted_bob_key: str
    sifted_length: int
    errors: int
    qber: float
    threshold: float
    status: str
    reason: str
    is_eavesdropping_detected: bool
    details: List[QubitDetail]


class ComparisonRequest(BaseModel):
    num_qubits: int = Field(64, ge=16, le=512)
    qber_threshold: float = Field(11.0, ge=0.0, le=100.0)
    iterations: int = Field(10, ge=1, le=500, description="Number of repeated runs to benchmark")


class AggregateStats(BaseModel):
    eve_enabled: bool
    runs: int
    avg_qber: float
    std_qber: float
    min_qber: float
    max_qber: float
    avg_errors: float
    avg_sifted_length: float
    detection_alerts_count: int
    detection_rate_pct: float
    runs_data: List[SimulationResponse]


class ComparisonResponse(BaseModel):
    num_qubits: int
    threshold: float
    iterations: int
    without_eve: AggregateStats
    with_eve: AggregateStats


class BenchmarkRequest(BaseModel):
    num_qubits: int = Field(64, ge=16, le=256)
    iterations: int = Field(100, ge=1, le=2000, description="Number of simulations to execute for statistical distribution analysis")
    qber_threshold: float = Field(11.0, ge=0.0, le=100.0)


class BenchmarkSummary(BaseModel):
    eve_enabled: bool
    simulations_count: int
    mean_qber: float
    std_qber: float
    min_qber: float
    max_qber: float
    mean_errors: float
    mean_sifted_length: float
    secure_count: int
    suspicious_count: int
    alert_count: int
    expected_behavior: str


class BenchmarkResponse(BaseModel):
    num_qubits: int
    threshold: float
    iterations: int
    without_eve: BenchmarkSummary
    with_eve: BenchmarkSummary


# -------------------------------------------------------------
# QUANTUM CHANNEL NOISE & ATTACK ANALYSIS MODELS
# -------------------------------------------------------------

class ChannelAnalysisRequest(BaseModel):
    num_qubits: int = Field(64, ge=4, le=1024, description="Number of qubits to transmit")
    eve_enabled: bool = Field(False, description="Whether Eve intercepts and resends")
    noise_enabled: bool = Field(False, description="Whether quantum channel noise is active")
    noise_model: str = Field("none", description="Noise model: none, bit_flip, depolarizing, measurement")
    noise_probability: float = Field(0.0, ge=0.0, le=0.20, description="Channel noise error probability (0.0 to 0.20)")
    qber_threshold: float = Field(11.0, ge=0.0, le=100.0, description="Prototype QBER detection threshold (%)")


class ChannelAnalysisResponse(BaseModel):
    scenario: str
    num_qubits: int
    noise_enabled: bool
    noise_model: str
    noise_probability: float
    eve_enabled: bool
    sifted_length: int
    errors: int
    qber: float
    threshold: float
    status: str
    reason: str
    is_eavesdropping_detected: bool
    alice_bits: List[int]
    alice_bases: List[str]
    eve_bases: List[Optional[str]]
    eve_bits: List[Optional[int]]
    bob_bases: List[str]
    bob_bits: List[int]
    basis_matches: List[bool]
    sifted_positions: List[int]
    sifted_alice_key: str
    sifted_bob_key: str
    details: List[QubitDetail]


class ChannelExperimentRequest(BaseModel):
    num_qubits: int = Field(64, ge=16, le=256, description="Qubits per transmission run")
    noise_model: str = Field("bit_flip", description="Noise model to evaluate: bit_flip, depolarizing, measurement")
    noise_probability: float = Field(0.05, ge=0.0, le=0.20, description="Physical noise probability (e.g. 0.05 = 5%)")
    qber_threshold: float = Field(11.0, ge=0.0, le=100.0)
    iterations: int = Field(100, ge=10, le=1000, description="Number of simulations per scenario")


class ScenarioStats(BaseModel):
    scenario_id: str
    scenario_name: str
    eve_enabled: bool
    noise_enabled: bool
    noise_model: str
    noise_probability: float
    iterations: int
    mean_qber: float
    std_qber: float
    min_qber: float
    max_qber: float
    median_qber: float
    mean_errors: float
    mean_sifted_length: float
    secure_count: int
    suspicious_count: int
    alert_count: int
    detection_rate_pct: float
    expected_behavior: str


class DistributionBin(BaseModel):
    bin_label: str
    bin_min: float
    bin_max: float
    ideal_count: int
    noise_count: int
    eve_count: int
    combined_count: int


class ChannelExperimentResponse(BaseModel):
    num_qubits: int
    noise_model: str
    noise_probability: float
    qber_threshold: float
    iterations: int
    scenarios: Dict[str, ScenarioStats]
    distribution_bins: List[DistributionBin]


class HealthResponse(BaseModel):
    status: str
    service: str
    quantum_backend: str
    version: str
