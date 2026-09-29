"""
BB84 Quantum Key Distribution (QKD) Engine using Qiskit.

Protocol Overview:
1. Alice generates random classical bits (0 or 1) and random conjugate bases ('+' rectilinear or 'x' diagonal).
2. Alice prepares qubits in corresponding quantum states using Qiskit QuantumCircuits:
   - Basis '+':
     * Bit 0 -> |0>
     * Bit 1 -> |1>  (X gate)
   - Basis 'x':
     * Bit 0 -> |+> = (|0> + |1>)/sqrt(2) (H gate)
     * Bit 1 -> |-> = (|0> - |1>)/sqrt(2) (X then H gate)
3. If Eve is enabled (Intercept-and-Resend Attack):
   - Eve intercepts each qubit in transit.
   - Eve independently and randomly chooses a basis ('+' or 'x').
   - Eve measures the qubit (if basis is 'x', rotates via H gate before projective measurement).
   - Eve prepares a fresh replacement qubit corresponding to her measurement outcome and basis, and resends to Bob.
4. Bob generates independent random measurement bases ('+' or 'x').
   - Bob measures the received qubit (rotating via H gate if measuring in 'x' basis).
5. Sifting Stage:
   - Alice and Bob publicly broadcast and compare their bases over a classical channel (without revealing bit values).
   - Positions where Alice and Bob used the same basis are kept for the sifted key; non-matching positions are discarded.
6. QBER Calculation:
   - Sifted bits are compared: QBER = (mismatched sifted bits / total sifted bits) * 100.
   - Note: Under the ideal noiseless simulation, QBER is expected to be 0% without eavesdropping.
   - In real-world physical quantum channels, small non-zero baseline QBER can occur due to noise, optical imperfections, and detector dark counts.
   - Under standard BB84 assumptions, an intercept-and-resend attack produces an expected sifted-key QBER of approximately 25%,
     though individual finite simulations fluctuate probabilistically around that value.
"""

from dataclasses import dataclass
from typing import List, Optional, Tuple
import numpy as np
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator


@dataclass
class QubitTransmissionDetail:
    position: int
    alice_bit: int
    alice_basis: str
    eve_basis: Optional[str]
    eve_bit: Optional[int]
    bob_basis: str
    bob_bit: int
    basis_match: bool
    bit_error: bool


@dataclass
class BB84SimulationResult:
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
    details: List[QubitTransmissionDetail]


class BB84Simulator:
    """
    Simulates the BB84 protocol using genuine Qiskit quantum circuits for state preparation,
    intercept-and-resend projective measurement and state recreation (optional), and Bob's measurement.
    """

    def __init__(self):
        self.simulator = AerSimulator()

    def _encode_qubit(self, circuit: QuantumCircuit, bit: int, basis: str) -> None:
        """
        Encodes a single bit into a qubit on the circuit using the given conjugate basis.
        - Basis '+': computational basis {|0>, |1>}
        - Basis 'x': diagonal/Hadamard basis {|+>, |->}
        """
        if basis == "+":
            if bit == 1:
                circuit.x(0)
        elif basis == "x":
            if bit == 0:
                circuit.h(0)
            elif bit == 1:
                circuit.x(0)
                circuit.h(0)
        else:
            raise ValueError(f"Invalid basis: {basis}. Expected '+' or 'x'.")

    def _measure_qubit(self, circuit: QuantumCircuit, basis: str) -> int:
        """
        Measures the single qubit in the specified basis.
        - Basis '+': measure directly in computational Z-basis.
        - Basis 'x': apply Hadamard H gate before measuring in computational Z-basis.
        """
        if basis == "x":
            circuit.h(0)
        circuit.measure(0, 0)

        # Execute single shot projective measurement
        job = self.simulator.run(circuit, shots=1)
        result = job.result()
        counts = result.get_counts()
        measured_bit = int(list(counts.keys())[0])
        return measured_bit

    def simulate_transmission(
        self, num_qubits: int, eve_enabled: bool
    ) -> BB84SimulationResult:
        """
        Runs a complete BB84 transmission for `num_qubits`.
        """
        if num_qubits <= 0:
            raise ValueError("num_qubits must be a positive integer.")

        # 1. Alice generates random classical bits and random bases ('+' or 'x')
        alice_bits = [int(b) for b in np.random.randint(0, 2, size=num_qubits)]
        basis_choices = ["+", "x"]
        alice_bases = [str(np.random.choice(basis_choices)) for _ in range(num_qubits)]

        # 2. Bob generates independent random measurement bases ('+' or 'x')
        bob_bases = [str(np.random.choice(basis_choices)) for _ in range(num_qubits)]

        # 3. Eve setup (if enabled)
        eve_bases: List[Optional[str]] = []
        eve_bits: List[Optional[int]] = []

        bob_bits: List[int] = []
        details: List[QubitTransmissionDetail] = []

        for i in range(num_qubits):
            a_bit = alice_bits[i]
            a_basis = alice_bases[i]
            b_basis = bob_bases[i]

            if not eve_enabled:
                # Direct transmission: Alice -> Bob (Ideal noiseless channel)
                eve_bases.append(None)
                eve_bits.append(None)

                # Alice prepares qubit
                qc = QuantumCircuit(1, 1)
                self._encode_qubit(qc, a_bit, a_basis)

                # Bob measures qubit
                b_bit = self._measure_qubit(qc, b_basis)
                bob_bits.append(b_bit)
                e_basis = None
                e_bit = None
            else:
                # Intercept-and-resend transmission: Alice -> Eve -> Bob
                # Eve chooses an independent random basis
                e_basis = str(np.random.choice(basis_choices))
                eve_bases.append(e_basis)

                # Alice prepares qubit
                qc_alice_to_eve = QuantumCircuit(1, 1)
                self._encode_qubit(qc_alice_to_eve, a_bit, a_basis)

                # Eve intercepts and measures in e_basis
                e_bit = self._measure_qubit(qc_alice_to_eve, e_basis)
                eve_bits.append(e_bit)

                # Eve prepares a fresh replacement qubit matching her measurement outcome and resends to Bob
                qc_eve_to_bob = QuantumCircuit(1, 1)
                self._encode_qubit(qc_eve_to_bob, e_bit, e_basis)

                # Bob measures received replacement qubit in b_basis
                b_bit = self._measure_qubit(qc_eve_to_bob, b_basis)
                bob_bits.append(b_bit)

            # Basis match check: only compare bits where bases match
            match = (a_basis == b_basis)
            bit_err = match and (a_bit != b_bit)

            details.append(
                QubitTransmissionDetail(
                    position=i,
                    alice_bit=a_bit,
                    alice_basis=a_basis,
                    eve_basis=e_basis,
                    eve_bit=e_bit,
                    bob_basis=b_basis,
                    bob_bit=b_bit,
                    basis_match=match,
                    bit_error=bit_err,
                )
            )

        # 4. Basis Sifting
        basis_matches = [alice_bases[i] == bob_bases[i] for i in range(num_qubits)]
        sifted_positions = [i for i, match in enumerate(basis_matches) if match]

        sifted_alice = [str(alice_bits[i]) for i in sifted_positions]
        sifted_bob = [str(bob_bits[i]) for i in sifted_positions]

        sifted_length = len(sifted_positions)

        # 5. QBER Calculation (with zero sifted bits edge case safety)
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


# Singleton instance for general use
default_bb84_simulator = BB84Simulator()


def simulate_bb84(num_qubits: int, eve_enabled: bool) -> BB84SimulationResult:
    """Convenience functional wrapper for BB84 simulation."""
    return default_bb84_simulator.simulate_transmission(num_qubits, eve_enabled)
