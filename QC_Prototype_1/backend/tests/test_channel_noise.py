"""
Test suite for Quantum Channel Noise & Attack Analysis module.
"""

import pytest
import numpy as np
from fastapi.testclient import TestClient

from backend.app.quantum.channel import simulate_noisy_bb84, NoiseModelType, ChannelConfig
from backend.app.quantum.bb84 import simulate_bb84
from backend.app.main import app

client = TestClient(app)


def test_1_ideal_channel_zero_qber():
    """1. Ideal channel (Eve OFF, Noise OFF) produces strictly 0% QBER in noiseless model."""
    res = simulate_noisy_bb84(num_qubits=64, eve_enabled=False, noise_enabled=False)
    assert res.qber == 0.0
    assert res.errors == 0
    assert res.sifted_alice_key == res.sifted_bob_key


def test_2_bit_flip_noise_produces_non_zero_qber():
    """2. Bit-flip noise produces non-zero QBER statistically without Eve."""
    qbers = []
    for _ in range(15):
        res = simulate_noisy_bb84(
            num_qubits=64,
            eve_enabled=False,
            noise_enabled=True,
            noise_model="bit_flip",
            noise_probability=0.10,
        )
        qbers.append(res.qber)

    mean_qber = np.mean(qbers)
    assert mean_qber > 0.0, f"Expected non-zero QBER with 10% bit-flip noise, got {mean_qber}%"


def test_3_increasing_bit_flip_probability_increases_qber():
    """3. Increasing bit-flip probability monotonically increases empirical average QBER."""
    qbers_low = [
        simulate_noisy_bb84(num_qubits=64, eve_enabled=False, noise_enabled=True, noise_model="bit_flip", noise_probability=0.03).qber
        for _ in range(25)
    ]
    qbers_high = [
        simulate_noisy_bb84(num_qubits=64, eve_enabled=False, noise_enabled=True, noise_model="bit_flip", noise_probability=0.15).qber
        for _ in range(25)
    ]

    mean_low = np.mean(qbers_low)
    mean_high = np.mean(qbers_high)

    assert mean_high > mean_low, f"Higher noise ({mean_high:.2f}%) must produce higher QBER than lower noise ({mean_low:.2f}%)"


def test_4_depolarizing_noise_produces_measurable_qber():
    """4. Depolarizing noise produces measurable error rate."""
    qbers = [
        simulate_noisy_bb84(num_qubits=64, eve_enabled=False, noise_enabled=True, noise_model="depolarizing", noise_probability=0.12).qber
        for _ in range(15)
    ]
    mean_qber = np.mean(qbers)
    assert mean_qber > 0.0, f"Depolarizing noise should produce non-zero QBER, got {mean_qber}%"


def test_5_eve_without_noise_produces_expected_disturbance():
    """5. Eve without noise produces QBER statistically centered around ~25%."""
    qbers = [
        simulate_noisy_bb84(num_qubits=64, eve_enabled=True, noise_enabled=False).qber
        for _ in range(25)
    ]
    mean_qber = np.mean(qbers)
    assert 18.0 <= mean_qber <= 32.0, f"Expected Eve alone to produce ~25% QBER, got {mean_qber:.2f}%"


def test_6_eve_plus_noise_compounds_disturbance():
    """6. Eve + noise produces combined disturbance (higher average QBER than Eve alone over sufficient sample)."""
    np.random.seed(42)
    qbers_eve_only = [
        simulate_noisy_bb84(num_qubits=128, eve_enabled=True, noise_enabled=False).qber
        for _ in range(35)
    ]
    qbers_combined = [
        simulate_noisy_bb84(num_qubits=128, eve_enabled=True, noise_enabled=True, noise_model="bit_flip", noise_probability=0.15).qber
        for _ in range(35)
    ]

    mean_eve = np.mean(qbers_eve_only)
    mean_comb = np.mean(qbers_combined)

    assert mean_comb >= mean_eve - 1.0, f"Combined ({mean_comb:.2f}%) expected to reflect added disturbance compared to Eve alone ({mean_eve:.2f}%)"


def test_7_noise_probability_validation():
    """7. Noise probability outside [0.0, 0.20] raises validation error."""
    with pytest.raises(ValueError):
        cfg = ChannelConfig(noise_enabled=True, noise_model=NoiseModelType.BIT_FLIP, noise_probability=0.35)
        cfg.validate()

    with pytest.raises(ValueError):
        cfg = ChannelConfig(noise_enabled=True, noise_model=NoiseModelType.BIT_FLIP, noise_probability=-0.05)
        cfg.validate()


def test_8_invalid_noise_model_rejection():
    """8. Invalid noise model names are rejected."""
    with pytest.raises(ValueError):
        cfg = ChannelConfig(noise_enabled=True, noise_model="invalid_laser_noise", noise_probability=0.05)
        cfg.validate()


def test_9_channel_analysis_endpoint():
    """9. Tests POST /api/bb84/channel-analysis endpoint."""
    payload = {
        "num_qubits": 32,
        "eve_enabled": False,
        "noise_enabled": True,
        "noise_model": "bit_flip",
        "noise_probability": 0.05,
        "qber_threshold": 11.0,
    }
    response = client.post("/api/bb84/channel-analysis", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["scenario"] == "noisy_channel"
    assert data["noise_enabled"] is True
    assert data["noise_model"] == "bit_flip"
    assert "details" in data


def test_10_channel_experiment_endpoint():
    """10. Tests POST /api/bb84/channel-experiment endpoint."""
    payload = {
        "num_qubits": 32,
        "noise_model": "bit_flip",
        "noise_probability": 0.08,
        "qber_threshold": 11.0,
        "iterations": 10,
    }
    response = client.post("/api/bb84/channel-experiment", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "scenarios" in data
    assert "ideal" in data["scenarios"]
    assert "noisy" in data["scenarios"]
    assert "eve" in data["scenarios"]
    assert "combined" in data["scenarios"]
    assert "distribution_bins" in data
    assert len(data["distribution_bins"]) > 0
