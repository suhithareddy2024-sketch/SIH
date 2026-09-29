"""
Comprehensive unit and integration test suite for BB84 Quantum Engine and FastAPI server.
"""

import pytest
import numpy as np
from fastapi.testclient import TestClient

from backend.app.quantum.bb84 import simulate_bb84, BB84Simulator, BB84SimulationResult
from backend.app.quantum.security import evaluate_security, SecurityStatus
from backend.app.main import app

client = TestClient(app)


def test_1_ideal_noiseless_bb84_without_eve():
    """
    1. Ideal noiseless BB84 without Eve:
    Under an ideal, noiseless Qiskit quantum circuit simulation, when Alice and Bob
    use the identical conjugate basis (+ or x), Bob's projective measurement outcome
    must match Alice's prepared state exactly.
    Therefore, QBER is strictly expected to be 0.0% in this noiseless model.
    """
    for num_qubits in [16, 32, 64]:
        result = simulate_bb84(num_qubits=num_qubits, eve_enabled=False)

        assert result.num_qubits == num_qubits
        assert not result.eve_enabled
        assert len(result.alice_bits) == num_qubits
        assert len(result.alice_bases) == num_qubits
        assert len(result.bob_bases) == num_qubits
        assert len(result.bob_bits) == num_qubits

        # Eve telemetry must be None when Eve is disabled
        assert all(b is None for b in result.eve_bases)
        assert all(b is None for b in result.eve_bits)

        # In all basis-matched positions, Alice and Bob bits MUST match
        for pos in result.sifted_positions:
            assert result.alice_bits[pos] == result.bob_bits[pos]

        assert result.sifted_alice_key == result.sifted_bob_key
        assert result.errors == 0
        assert result.qber == 0.0


def test_2_bb84_with_eve_statistical_variance():
    """
    2. BB84 with Eve (Individual QBER variance):
    With intercept-and-resend Eve enabled, measurement collapse introduces
    probabilistic errors. Individual finite runs fluctuate and must NOT be hardcoded to 25.0%.
    """
    qber_values = []
    for _ in range(8):
        result = simulate_bb84(num_qubits=64, eve_enabled=True)
        assert result.eve_enabled
        assert len(result.eve_bases) == 64
        assert len(result.eve_bits) == 64
        assert all(b in ["+", "x"] for b in result.eve_bases)
        assert all(b in [0, 1] for b in result.eve_bits)
        qber_values.append(result.qber)

    # QBER values should exhibit statistical variation across runs
    assert not all(q == qber_values[0] for q in qber_values), (
        "QBER must be probabilistic across finite runs, not a static constant."
    )


def test_3_large_sample_eve_statistical_mean():
    """
    3. Large-sample Eve verification:
    Under standard BB84 assumptions, intercept-and-resend produces an expected QBER
    of approximately 25%.
    Across a sample of independent runs, the empirical mean QBER should approach ~25%.
    """
    qber_values = []
    for _ in range(25):
        result = simulate_bb84(num_qubits=64, eve_enabled=True)
        qber_values.append(result.qber)

    mean_qber = np.mean(qber_values)
    # Statistical tolerance for 25 runs of 64 qubits (sample size ~800 sifted bits): 18% to 32%
    assert 18.0 <= mean_qber <= 32.0, (
        f"Expected sample mean QBER to approach ~25%, but obtained {mean_qber:.2f}%"
    )


def test_4_basis_sifting_logic():
    """
    4. Basis Sifting Logic:
    Alice basis == Bob basis -> retain position in sifted key.
    Alice basis != Bob basis -> discard position.
    """
    result = simulate_bb84(num_qubits=64, eve_enabled=False)

    for i in range(64):
        if result.alice_bases[i] == result.bob_bases[i]:
            assert i in result.sifted_positions
            assert result.basis_matches[i] is True
        else:
            assert i not in result.sifted_positions
            assert result.basis_matches[i] is False

    assert result.sifted_length == len(result.sifted_positions)
    assert len(result.sifted_alice_key) == result.sifted_length
    assert len(result.sifted_bob_key) == result.sifted_length


def test_5_qber_calculation_formula():
    """
    5. QBER Calculation:
    QBER = (number of mismatched sifted bits / number of sifted bits) * 100.
    """
    result = simulate_bb84(num_qubits=128, eve_enabled=True)
    if result.sifted_length > 0:
        expected_qber = round((result.errors / result.sifted_length) * 100.0, 2)
        assert result.qber == expected_qber


def test_6_zero_sifted_bits_edge_case():
    """
    6. Zero sifted-bit edge case:
    If zero bases match, division by zero must be prevented and handled safely.
    """
    decision = evaluate_security(qber=0.0, threshold=11.0, errors=0, sifted_length=0)
    assert decision.status == SecurityStatus.SUSPICIOUS
    assert decision.qber == 0.0
    assert not decision.is_eavesdropping_detected
    assert "0 sifted bits" in decision.reason


def test_7_security_classification_rules():
    """
    7. Prototype Security Classification:
    - QBER < 0.5 * threshold -> SECURE
    - 0.5 * threshold <= QBER <= threshold -> SUSPICIOUS
    - QBER > threshold -> SECURITY ALERT
    """
    threshold = 11.0

    # Low QBER (e.g., 2.0% < 5.5%) -> SECURE
    dec_sec = evaluate_security(qber=2.0, threshold=threshold, errors=1, sifted_length=50)
    assert dec_sec.status == SecurityStatus.SECURE
    assert not dec_sec.is_eavesdropping_detected

    # Borderline QBER (e.g., 7.5% in [5.5%, 11.0%]) -> SUSPICIOUS
    dec_sus = evaluate_security(qber=7.5, threshold=threshold, errors=4, sifted_length=50)
    assert dec_sus.status == SecurityStatus.SUSPICIOUS
    assert not dec_sus.is_eavesdropping_detected

    # Elevated QBER (e.g., 24.5% > 11.0%) -> SECURITY ALERT
    dec_alert = evaluate_security(qber=24.5, threshold=threshold, errors=12, sifted_length=49)
    assert dec_alert.status == SecurityStatus.ALERT
    assert dec_alert.is_eavesdropping_detected


def test_8_configurable_prototype_threshold():
    """
    8. Configurable Prototype Threshold:
    Verifies that changing the threshold parameter adjusts the classification boundaries.
    """
    qber_val = 14.0

    # With default threshold 11.0%, 14.0% triggers ALERT
    dec_1 = evaluate_security(qber=qber_val, threshold=11.0, errors=7, sifted_length=50)
    assert dec_1.status == SecurityStatus.ALERT

    # With adjusted threshold 20.0%, 14.0% falls in SUSPICIOUS band (10.0% to 20.0%)
    dec_2 = evaluate_security(qber=qber_val, threshold=20.0, errors=7, sifted_length=50)
    assert dec_2.status == SecurityStatus.SUSPICIOUS

    # With adjusted threshold 30.0%, 14.0% falls in SECURE band (< 15.0%)
    dec_3 = evaluate_security(qber=qber_val, threshold=30.0, errors=7, sifted_length=50)
    assert dec_3.status == SecurityStatus.SECURE


def test_9_api_schemas_and_endpoints():
    """
    9. API Schema Verification:
    Tests /api/health and /api/bb84/simulate endpoints.
    """
    # Health check
    res_health = client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "OK"

    # Simulate without Eve
    res_sim_no_eve = client.post(
        "/api/bb84/simulate",
        json={"num_qubits": 32, "eve_enabled": False, "qber_threshold": 11.0},
    )
    assert res_sim_no_eve.status_code == 200
    data = res_sim_no_eve.json()
    assert data["num_qubits"] == 32
    assert data["qber"] == 0.0
    assert data["status"] == "SECURE"
    assert data["sifted_alice_key"] == data["sifted_bob_key"]

    # Simulate with Eve
    res_sim_eve = client.post(
        "/api/bb84/simulate",
        json={"num_qubits": 64, "eve_enabled": True, "qber_threshold": 11.0},
    )
    assert res_sim_eve.status_code == 200
    data_eve = res_sim_eve.json()
    assert data_eve["num_qubits"] == 64
    assert data_eve["eve_enabled"] is True


def test_10_comparison_and_benchmark_endpoints():
    """
    10. Comparison and Large Benchmark Endpoints:
    Tests /api/bb84/compare and /api/bb84/benchmark.
    """
    res_comp = client.post(
        "/api/bb84/compare",
        json={"num_qubits": 32, "qber_threshold": 11.0, "iterations": 3},
    )
    assert res_comp.status_code == 200
    data_comp = res_comp.json()
    assert "without_eve" in data_comp
    assert "with_eve" in data_comp
    assert "std_qber" in data_comp["without_eve"]
    assert data_comp["without_eve"]["avg_qber"] == 0.0
    assert data_comp["with_eve"]["avg_qber"] > 5.0

    res_bench = client.post(
        "/api/bb84/benchmark",
        json={"num_qubits": 32, "iterations": 5, "qber_threshold": 11.0},
    )
    assert res_bench.status_code == 200
    data_bench = res_bench.json()
    assert data_bench["without_eve"]["mean_qber"] == 0.0
    assert "expected_behavior" in data_bench["without_eve"]
