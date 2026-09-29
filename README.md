# BB84 Quantum Security Simulator

An interactive full-stack cybersecurity and quantum computing demonstration prototype based on the **BB84 Quantum Key Distribution (QKD)** protocol.

This system executes **genuine quantum state simulations** in Python using **Qiskit** and **Qiskit Aer**, demonstrating how an intercept-and-resend attacker (Eve) introduces measurable **Quantum Bit Error Rate (QBER)** disturbances into the sifted key.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│             React + Vite + Tailwind CSS Frontend            │
│  - Real-time animated Quantum Optical Channel Topology      │
│  - Interactive Security Decision HUD (SECURE/ALERT)         │
│  - Sifted Key Generation & Discrepancy Highlighting         │
│  - Per-Qubit Quantum Telemetry Log (Bases, Bits, Matches)   │
│  - Multi-run Historical QBER Trend Chart (Recharts)         │
│  - Monte Carlo Benchmark / Side-by-Side Comparison Mode     │
│  - Collapsible Educational Theory & Quantum Mechanics Guide │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP REST API (JSON)
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Backend Server                   │
│  - POST /api/bb84/simulate (Single-run Qiskit circuit)      │
│  - POST /api/bb84/compare  (Multi-run statistical benchmark)│
│  - GET  /api/health        (Backend status & Qiskit ver)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Python Protocol Engine
┌──────────────────────────────▼──────────────────────────────┐
│                     BB84 Qiskit Engine                      │
│  - Alice: Random bit & basis generation, State preparation  │
│  - Eve: Intercept-and-resend attack via projective collapse │
│  - Bob: Independent random basis selection & measurement    │
│  - Sifting: Public basis matching & Sifted Key distillation │
│  - Security Decision: Configurable Prototype Threshold      │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

1. **True Quantum Circuit Simulation**:
   - Every qubit is prepared and measured using `qiskit.QuantumCircuit` and `qiskit_aer.AerSimulator`.
   - Rectilinear basis ($+$): $|0\rangle$, $|1\rangle$.
   - Diagonal basis ($\times$): $|+\rangle = \frac{|0\rangle + |1\rangle}{\sqrt{2}}$, $|-\rangle = \frac{|0\rangle - |1\rangle}{\sqrt{2}}$ via Hadamard ($H$) gates.

2. **Intercept-and-Resend Attacker (Eve)**:
   - When enabled, Eve intercepts each qubit in flight, randomly chooses a basis ($+$ or $\times$), measures the qubit, and resends a newly prepared state according to her measurement outcome.
   - By the **No-Cloning Theorem** and projective measurement collapse, Eve's wrong basis guesses introduce an expected **25% error rate** into Alice and Bob's sifted key.

3. **Dynamic Threat Detection & QBER HUD**:
   - Real-time QBER calculation: $\text{QBER} = \left(\frac{\text{errors}}{\text{sifted bits}}\right) \times 100\%$.
   - Configurable Prototype Detection Threshold (default: 11%).
   - Three security states:
     - `SECURE` ($\text{QBER} < 0.5 \times \text{Threshold}$)
     - `SUSPICIOUS` ($0.5 \times \text{Threshold} \le \text{QBER} \le \text{Threshold}$)
     - `SECURITY ALERT` ($\text{QBER} > \text{Threshold}$)

4. **Multi-Run History & Comparison Mode**:
   - Recharts visualizer tracking historical QBER fluctuations with threshold lines.
   - Side-by-side benchmark comparing 5, 10, or 20 runs **Without Eve** ($0.0\%$ avg QBER) vs **With Eve** (~$25.0\%$ avg QBER).

---

## Installation & Setup

### Prerequisites
- **Python 3.10 - 3.12**
- **Node.js 18+** & **npm**

---

### Backend Setup

1. Open a terminal in the project root:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn numpy qiskit qiskit-aer pytest httpx
   ```

3. Run the automated test suite:
   ```bash
   pytest tests -v
   ```

4. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   * The backend API will be live at `http://127.0.0.1:8000`
   * Interactive API docs (Swagger UI): `http://127.0.0.1:8000/docs`

---

### Frontend Setup

1. Open a second terminal in the project root:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * Open your browser at `http://localhost:5173`

---

## API Reference

### `GET /api/health`
Health check and backend status.
```json
{
  "status": "OK",
  "service": "BB84 Quantum Security Simulator",
  "quantum_backend": "Qiskit 2.5.2 (AerSimulator)",
  "version": "1.0.0"
}
```

### `POST /api/bb84/simulate`
Simulates a single BB84 transmission.
- **Request Body:**
  ```json
  {
    "num_qubits": 64,
    "eve_enabled": true,
    "qber_threshold": 11.0
  }
  ```
- **Response Structure:**
  ```json
  {
    "num_qubits": 64,
    "eve_enabled": true,
    "alice_bits": [0, 1, 1, ...],
    "alice_bases": ["+", "x", "+", ...],
    "eve_bases": ["x", "x", "+", ...],
    "eve_bits": [0, 1, 1, ...],
    "bob_bases": ["+", "x", "x", ...],
    "bob_bits": [0, 1, 0, ...],
    "basis_matches": [true, true, false, ...],
    "sifted_positions": [0, 1, ...],
    "sifted_alice_key": "01...",
    "sifted_bob_key": "01...",
    "sifted_length": 32,
    "errors": 8,
    "qber": 25.0,
    "threshold": 11.0,
    "status": "SECURITY ALERT",
    "reason": "Quantum Bit Error Rate (25.00%) exceeds the detection threshold (11.00%)...",
    "is_eavesdropping_detected": true,
    "details": [...]
  }
  ```

### `POST /api/bb84/compare`
Runs comparative Monte Carlo batches with and without Eve.
- **Request Body:**
  ```json
  {
    "num_qubits": 64,
    "qber_threshold": 11.0,
    "iterations": 10
  }
  ```

---

## Quantum Theory & Why Eve Causes 25% QBER

When Alice and Bob share the same basis (which happens 50% of the time during random selection):
1. **Eve measures in the correct basis** with probability $P = 0.5 \implies$ Bob measures the exact bit Alice sent ($0\%$ error).
2. **Eve measures in the wrong basis** with probability $P = 0.5 \implies$ the quantum state is projected onto Eve's basis. When Bob subsequently measures in Alice's original basis, he gets the incorrect bit with probability $P = 0.5$.
3. **Total expected error rate**:
   $$\text{Error Rate} = P(\text{wrong basis}) \times P(\text{error}) = 0.5 \times 0.5 = 25.0\%$$

Hence, Eve cannot eavesdrop on BB84 without creating a massive, statistically unambiguous jump in QBER from $0\%$ to $\approx 25\%$.

---

## License
MIT
