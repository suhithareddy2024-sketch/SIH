"""
Quantum Channel Noise Module for BB84 Protocol.

Simulates physical quantum channel imperfections and noise processes:

1. Bit-Flip Noise (X-error with probability p):
   Applies a Pauli-X gate with probability p to the transmitting qubit state.
   - With probability 1 - p: Identity (state is untouched)
   - With probability p: X gate (state is bit-flipped)

2. Depolarizing Noise (Qiskit standard 1-qubit depolarizing channel with parameter p):
   The single-qubit depolarizing channel with total error probability p in [0.0, 0.20] applies:
   - With probability 1 - p: Identity I (state is untouched)
   - With probability p: A non-trivial Pauli operator chosen uniformly from {X, Y, Z} (probability p/3 each)
   Density matrix representation: E(rho) = (1 - p)*rho + (p/3)*(X*rho*X + Y*rho*Y + Z*rho*Z).
   This matches the standard Qiskit Aer `depolarizing_error(p, num_qubits=1)` parameter convention.

3. Measurement Noise (Readout Error with probability p):
   Bit-flips the detector's classical measurement outcome with probability p (models detector dark counts / readout inaccuracy).

Channel Flow / Ordering Architecture:
Alice State Preparation
  ↓
[Optional] Eve Intercept-and-Resend
  ↓
Quantum Channel Noise Layer (affects qubit state before Bob's detector)
  ↓
Bob Basis Selection & Projective Measurement
  ↓
Basis Sifting & QBER Analysis

Note on Combined Attack (Eve + Noise):
Because BB84 simulations over finite key lengths are probabilistic, individual runs vary.
Across sufficiently large samples, the mean QBER of Eve + Noise exceeds Eve-alone due to the compounding
disturbances of both measurement collapse and channel decoherence, though individual runs fluctuate.
"""

from dataclasses import dataclass
from enum import Enum
from typing import List, Optional
import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

from .bb84 import (
    BB84SimulationResult,
    QubitTransmissionDetail,
    default_bb84_simulator,
)


class NoiseModelType(str, Enum):
    NONE = "none"
    BIT_FLIP = "bit_flip"
    DEPOLARIZING = "depolarizing"
    MEASUREMENT = "measurement"


@dataclass
class ChannelConfig:
    noise_enabled: bool = False
    noise_model: NoiseModelType = NoiseModelType.NONE
    noise_probability: float = 0.0  # Parameter p: [0.0, 0.20]

    def validate(self) -> None:
        if not (0.0 <= self.noise_probability <= 0.20):
            raise ValueError(
                f"Noise probability must be between 0.0 and 0.20 (0% - 20%). Got {self.noise_probability}"
            )
        if isinstance(self.noise_model, str):
            try:
                self.noise_model = NoiseModelType(self.noise_model)
            except ValueError:
                raise ValueError(
                    f"Invalid noise model: '{self.noise_model}'. Supported: {', '.join([m.value for m in NoiseModelType])}"
                )


class NoisyQuantumChannel:
    """
    Applies quantum channel noise to Qiskit quantum circuits during transit.
    """

    @staticmethod
    def apply_quantum_channel_noise(
        circuit: QuantumCircuit, config: ChannelConfig
    ) -> None:
        """
        Applies physical quantum state transformations to the qubit circuit.
        """
        if not config.noise_enabled or config.noise_probability <= 0.0:
            return

        p = config.noise_probability

        if config.noise_model == NoiseModelType.BIT_FLIP:
            # Bit-flip channel: apply X gate with probability p
            if np.random.random() < p:
                circuit.x(0)

        elif config.noise_model == NoiseModelType.DEPOLARIZING:
            # Standard Qiskit 1-qubit depolarizing channel:
            # Total error probability p:
            # - With probability 1 - p: Identity (no transformation)
            # - With probability p/3: Pauli X
            # - With probability p/3: Pauli Y
            # - With probability p/3: Pauli Z
            rand_val = np.random.random()
            if rand_val < p:
                # Divide the error interval [0, p) into 3 equal subintervals of width p/3
                sub_prob = rand_val / p
                if sub_prob < 1.0 / 3.0:
                    circuit.x(0)
                elif sub_prob < 2.0 / 3.0:
                    circuit.y(0)
                else:
                    circuit.z(0)


class NoisyBB84Simulator:
    """
    Simulates BB84 transmissions under both eavesdropping attacks and physical quantum channel noise.
    """

    def __init__(self):
        self.simulator = AerSimulator()

    def simulate(
        self,
        num_qubits: int,
        eve_enabled: bool = False,
        noise_enabled: bool = False,
        noise_model: str = "none",
        noise_probability: float = 0.0,
    ) -> BB84SimulationResult:
        """
        Executes a BB84 transmission with optional Eve intercept-and-resend and configurable quantum channel noise.
        """
        if num_qubits <= 0:
            raise ValueError("num_qubits must be a positive integer.")

        cfg = ChannelConfig(
            noise_enabled=noise_enabled,
            noise_model=NoiseModelType(noise_model)
            if isinstance(noise_model, str)
            else noise_model,
            noise_probability=float(noise_probability),
        )
        cfg.validate()

        # 1. Alice generates random bits and conjugate bases
        alice_bits = [int(b) for b in np.random.randint(0, 2, size=num_qubits)]
        basis_choices = ["+", "x"]
        alice_bases = [str(np.random.choice(basis_choices)) for _ in range(num_qubits)]

        # 2. Bob generates random measurement bases
        bob_bases = [str(np.random.choice(basis_choices)) for _ in range(num_qubits)]

        eve_bases: List[Optional[str]] = []
        eve_bits: List[Optional[int]] = []
        bob_bits: List[int] = []
        details: List[QubitTransmissionDetail] = []

        for i in range(num_qubits):
            a_bit = alice_bits[i]
            a_basis = alice_bases[i]
            b_basis = bob_bases[i]

            if not eve_enabled:
                eve_bases.append(None)
                eve_bits.append(None)
                e_basis = None
                e_bit = None

                # Alice encodes qubit
                qc = QuantumCircuit(1, 1)
                default_bb84_simulator._encode_qubit(qc, a_bit, a_basis)

                # Channel noise applied to transit qubit
                NoisyQuantumChannel.apply_quantum_channel_noise(qc, cfg)

                # Bob measures qubit
                measured_bit = default_bb84_simulator._measure_qubit(qc, b_basis)

                # Optional measurement readout noise
                if (
                    cfg.noise_enabled
                    and cfg.noise_model == NoiseModelType.MEASUREMENT
                    and np.random.random() < cfg.noise_probability
                ):
                    measured_bit = 1 - measured_bit

                bob_bits.append(measured_bit)

            else:
                # Intercept-and-Resend: Alice -> Eve -> Channel Noise -> Bob
                e_basis = str(np.random.choice(basis_choices))
                eve_bases.append(e_basis)

                qc_alice_to_eve = QuantumCircuit(1, 1)
                default_bb84_simulator._encode_qubit(qc_alice_to_eve, a_bit, a_basis)

                # Eve intercepts and measures in e_basis
                e_bit = default_bb84_simulator._measure_qubit(qc_alice_to_eve, e_basis)
                eve_bits.append(e_bit)

                # Eve prepares replacement qubit
                qc_eve_to_bob = QuantumCircuit(1, 1)
                default_bb84_simulator._encode_qubit(qc_eve_to_bob, e_bit, e_basis)

                # Channel noise applied after Eve's resend on way to Bob
                NoisyQuantumChannel.apply_quantum_channel_noise(qc_eve_to_bob, cfg)

                # Bob measures
                measured_bit = default_bb84_simulator._measure_qubit(qc_eve_to_bob, b_basis)

                if (
                    cfg.noise_enabled
                    and cfg.noise_model == NoiseModelType.MEASUREMENT
                    and np.random.random() < cfg.noise_probability
                ):
                    measured_bit = 1 - measured_bit

                bob_bits.append(measured_bit)

            # Sifting and error evaluation
            match = (a_basis == b_basis)
            bit_err = match and (a_bit != bob_bits[-1])

            details.append(
                QubitTransmissionDetail(
                    position=i,
                    alice_bit=a_bit,
                    alice_basis=a_basis,
                    eve_basis=e_basis,
                    eve_bit=e_bit,
                    bob_basis=b_basis,
                    bob_bit=bob_bits[-1],
                    basis_match=match,
                    bit_error=bit_err,
                )
            )

        # Basis sifting
        basis_matches = [alice_bases[i] == bob_bases[i] for i in range(num_qubits)]
        sifted_positions = [i for i, match in enumerate(basis_matches) if match]

        sifted_alice = [str(alice_bits[i]) for i in sifted_positions]
        sifted_bob = [str(bob_bits[i]) for i in sifted_positions]
        sifted_length = len(sifted_positions)

        if sifted_length > 0:
            errors = sum(1 for a, b in zip(sifted_alice, sifted_bob) if a != b)
            qber = round((errors / sifted_length) * 100.0, 2)
        else:
            errors = 0
            qber = 0.0

        return BB84SimulationResult(
            num_qubits=num_qubits,
            eve_enabled=eve_enabled,
            alice_bits=alice_bits,
            alice_bases=alice_bases,
            eve_bases=eve_bases,
            eve_bits=eve_bits,
            bob_bases=bob_bases,
            bob_bits=bob_bits,
            basis_matches=basis_matches,
            sifted_positions=sifted_positions,
            sifted_alice_key="".join(sifted_alice),
            sifted_bob_key="".join(sifted_bob),
            sifted_length=sifted_length,
            errors=errors,
            qber=qber,
            details=details,
        )


default_noisy_simulator = NoisyBB84Simulator()


def simulate_noisy_bb84(
    num_qubits: int = 64,
    eve_enabled: bool = False,
    noise_enabled: bool = False,
    noise_model: str = "none",
    noise_probability: float = 0.0,
) -> BB84SimulationResult:
    """Convenience functional wrapper for noisy BB84 simulation."""
    return default_noisy_simulator.simulate(
        num_qubits=num_qubits,
        eve_enabled=eve_enabled,
        noise_enabled=noise_enabled,
        noise_model=noise_model,
        noise_probability=noise_probability,
    )
