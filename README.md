# Quantum-Secured Communication Simulator

An educational, research-grade quantum-classical cryptosecurity simulation platform modeling secure message exchange between Alice and Bob. Built with a modern full-stack architecture featuring **BB84 Quantum Key Distribution (QKD)**, **simplified Quantum Digital Signatures (QDS)**, **Quantum Teleportation** with Pauli corrections, **HMAC-SHA256 packet security**, stateful **anti-replay protection**, and an **explainable 11-rule deterministic threat-detection engine** with strictly zero AI/ML.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Important Disclaimers & Security Hygiene](#important-disclaimers--security-hygiene)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Configuration & Environment Variables](#configuration--environment-variables)
6. [Local Development Setup](#local-development-setup)
   - [Prerequisites](#prerequisites)
   - [Backend Setup (Python & FastAPI)](#1-backend-setup-python--fastapi)
   - [Frontend Setup (React & TypeScript)](#2-frontend-setup-react--typescript)
   - [Running Simulations via CLI](#3-running-simulations-via-cli)
   - [Generating Presentation Metrics & Benchmarks](#4-generating-presentation-metrics--benchmarks)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Deterministic Threat Detection Engine (R01–R11)](#deterministic-threat-detection-engine-r01r11)
9. [Pre-Configured Attack Scenarios](#pre-configured-attack-scenarios)
10. [Testing & Code Quality](#testing--code-quality)
11. [Production Deployment](#production-deployment)
    - [Backend Deployment (Render / Docker)](#backend-deployment-render--docker)
    - [Frontend Deployment (Vercel / Netlify)](#frontend-deployment-vercel--netlify)

---

## Project Overview

The **Quantum-Secured Communication Simulator** demonstrates how quantum and classical cryptographic protocols integrate to provide multi-layered security against eavesdropping, message forgery, tampering, and replay attacks.

### Key Features:
- **BB84 QKD Key Exchange**: Single-photon state preparation ($|0\rangle, |1\rangle, |+\rangle, |-\rangle$), basis sifting, QBER parameter estimation, and one-time key distillation.
- **Quantum Teleportation & Pauli Recovery**: EPR Bell pair generation, Bell-state measurement, classical outcome transmission, deterministic Pauli correction ($I, X, Z, ZX$), and quantum state fidelity verification.
- **Simplified Quantum Digital Signatures**: One-time token generation, SHA-256 digest binding, and deterministic threshold verification ($M \le 8$ Accept, $M \ge 20$ Reject).
- **Classical Packet Security & Anti-Replay**: Canonical JSON serialization, HMAC-SHA256 message authentication, monotonic sequence counters, 64-bit cryptographic nonces, and timestamp freshness windows (120s).
- **Deterministic Threat Detection Engine**: 11 threshold-based rules (R01–R11) rendering explainable routing decisions (`ACCEPT`, `REJECT`, `QUARANTINE`, `ABORT`) with **zero AI/ML**.
- **Secret-Safe Audit Logging & Reporting**: Structured JSONL audit trails and JSON scenario benchmark reports with strict zero raw key leakage.
- **Interactive Security Dashboard**: Real-time React dashboard with semi-circular SVG QBER gauge, QDS mismatch meter, teleportation fidelity card, live threat rule matrix, and PDF export layout.

---

## Important Disclaimers & Security Hygiene

> [!IMPORTANT]
> 1. **Software Simulation Only**: Quantum state evolution, entanglement, and channel noise are simulated classically using **Qiskit Aer**. No claims of real quantum hardware security are made.
> 2. **Simplified QDS Scheme**: Features an educational one-time token protocol demonstrating mismatch thresholding; it is **not** a production-grade cryptographic standard.
> 3. **Zero AI / ML**: All threat decisions are **100% deterministic and rule-based**. No neural networks, classifiers, or statistical machine learning models are used.
> 4. **Zero Secret Leakage**: Raw QKD keys, private signing tokens, HMAC master keys, and quantum state amplitudes are **never logged, saved in reports, or returned in API responses**.
> 5. **One-Time Lifecycle**: Enforces single-use consumption for QKD keys, QDS tokens, EPR Bell pairs, message IDs, and nonces.

---

## Tech Stack

### Frontend
- **Framework**: React 18 + Vite
- **Language**: TypeScript 5.7
- **Styling**: TailwindCSS 3.4 (Quantum Dark & Glassmorphism theme)
- **Icons & UI**: Lucide-React
- **Visualizations**: Custom SVG Gauges (QBER Dial, Teleportation Fidelity, QDS Mismatch Bar)

### Backend & Simulation Engine
- **Runtime**: Python 3.11+
- **Quantum Framework**: Qiskit 2.5 + Qiskit Aer 0.17 (Quantum Circuit & Statevector Simulator)
- **API Framework**: FastAPI 0.141 + Uvicorn + Starlette
- **Data Validation**: Pydantic v2 (Strict schemas & type safety)
- **Configuration**: PyYAML
- **Cryptography**: Standard Python `hashlib`, `hmac`, `secrets` (HMAC-SHA256)
- **Testing & Quality**: Pytest 9.1, Pytest-Cov (94% coverage), Ruff 0.16 (Linter & Formatter)

---

## Project Structure

```
qkd-qds-teleportation-simulator/
├── configs/                      # YAML configuration files
│   ├── default.yaml              # Default simulation & threat thresholds
│   ├── normal.yaml               # Baseline normal execution profile
│   └── [attack_scenarios].yaml   # Attack profiles (eve, tampering, replay, loss, etc.)
│
├── frontend/                     # Standalone React + TypeScript Dashboard
│   ├── src/
│   │   ├── components/           # UI cards (Header, QBER Dial, QDS Card, Threat Panel, etc.)
│   │   ├── services/             # Typed API client (api.ts)
│   │   ├── types/                # TypeScript interfaces matching backend models
│   │   ├── App.tsx               # Main Dashboard container
│   │   ├── main.tsx              # React DOM entrypoint
│   │   └── index.css             # TailwindCSS & Glassmorphism styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── output/                       # Simulation Artifacts
│   ├── audit_logs/               # Sanitized structured JSON Lines audit trails
│   ├── plots/                    # Exported charts & circuit diagrams
│   └── reports/                  # JSON benchmark reports & CSV comparison tables
│
├── src/
│   └── qkd_qds_sim/              # Core Simulation Package
│       ├── actors/               # Alice (Sender) and Bob (Receiver) protocol actors
│       ├── analytics.py          # Presentation metrics aggregator & CSV/JSON export
│       ├── api/                  # FastAPI app factory (app.py) and routes (routes.py)
│       ├── config.py             # Pydantic configuration loader & validators
│       ├── main.py               # CLI entry point and scenario runner
│       ├── models/               # Enums (FinalDecision, ThreatFlag) and schemas
│       ├── qds/                  # QDS distribution, signing, and verification
│       ├── qkd/                  # BB84 simulator, Eve attacker, KeyManager
│       ├── quantum/              # Qiskit backend, state preparation, noise models
│       ├── reporting.py          # Sanitized JSON report generator
│       ├── security/             # HMAC, hashing, replay protection, threat engine, audit logger
│       ├── simulation/           # 17-step orchestrator and 10 scenario runners
│       └── teleportation/        # Bell pair manager, sender, Pauli correction, receiver
│
├── tests/                        # Comprehensive Unit & Integration Test Suite (23 files)
├── pyproject.toml                # Build configuration, pytest settings, Ruff rules
├── requirements.txt              # Production and development Python dependencies
└── README.md                     # Project documentation
```

---

## Configuration & Environment Variables

### 1. Configuration File (`configs/default.yaml`)

Simulation settings and deterministic threat thresholds are centrally managed via YAML:

```yaml
default:
  simulation:
    random_seed: 42
    shots: 1024
    backend: "aer_simulator"

  qkd:
    threshold: 0.10               # 10% QBER threshold
    qubit_count: 512
    sample_fraction: 0.20
    channel_noise_probability: 0.01
    channel_loss_probability: 0.01

  qds:
    threshold: 0.10
    signature_length: 128
    accept_threshold: 8           # Mismatches <= 8 -> ACCEPT
    reject_threshold: 20          # Mismatches >= 20 -> REJECT

  teleportation:
    fidelity_threshold: 0.90      # Minimum state fidelity
    enabled: true
    shots: 4096

  threat:
    max_qber: 0.15
    max_loss_rate: 0.20           # 20% loss threshold -> QUARANTINE
    replay_window_seconds: 300    # Nonce cache validity
    max_packet_age_seconds: 120   # Maximum packet timestamp drift
```

### 2. Frontend Environment (`frontend/.env`)

Create a `.env` file in the `frontend/` directory (optional, defaults to `http://127.0.0.1:8000`):

```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## Local Development Setup

### Prerequisites
- [Python](https://www.python.org/downloads/) (v3.11 or higher)
- [Node.js](https://nodejs.org/) (v18 or higher) & `npm`

---

### 1. Backend Setup (Python & FastAPI)

Navigate to the project root and set up the Python virtual environment:

```bash
# Create and activate virtual environment
python -m venv .venv

# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Linux / macOS:
source .venv/bin/activate

# Install Python dependencies
python -m pip install -r requirements.txt
```

Start the FastAPI backend server:
```bash
uvicorn qkd_qds_sim.api.app:app --host 127.0.0.1 --port 8000 --reload
```
- Server API: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Setup (React & TypeScript)

In a new terminal window, navigate to the `frontend/` directory:

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### 3. Running Simulations via CLI

You can execute simulations directly from the command line without starting the web servers:

```powershell
# Run baseline normal transmission
$env:PYTHONPATH="src"
python -m qkd_qds_sim.main --scenario normal --seed 42

# Run Eve Intercept-Resend attack simulation
python -m qkd_qds_sim.main --scenario eve-intercept-resend --seed 42

# Run message tampering simulation
python -m qkd_qds_sim.main --scenario message-tampering --seed 42
```

---

### 4. Generating Presentation Metrics & Benchmarks

To aggregate all completed simulation reports and export presentation-ready JSON & CSV files:

```powershell
$env:PYTHONPATH="src"
python -m qkd_qds_sim.analytics
```

**Generated Artifacts in `output/reports/`**:
- `presentation_summary.json`: High-level statistical distributions, attack counts, and rates.
- `presentation_scenarios.csv`: Tabular benchmark comparing QBER, fidelity, loss, decisions, and flags across all runs.

---

## API Endpoints Reference

| Category | Method | Endpoint | Description | Response Model |
| :--- | :--- | :--- | :--- | :--- |
| **System** | `GET` | `/health` | Service health status, version, and timestamp | `HealthResponse` |
| **Configuration** | `GET` | `/config` | Active simulation and threat thresholds | `SimulationConfig` |
| **Simulation** | `POST` | `/simulate/normal` | Execute clean baseline Alice $\to$ Bob transmission | `ScenarioReport` |
| **Simulation** | `POST` | `/simulate/scenario/{scenario_name}` | Execute pre-configured attack or operational scenario | `ScenarioReport` |
| **Reporting** | `GET` | `/reports` | List all saved scenario execution reports (newest first) | `list[ScenarioReport]` |
| **Reporting** | `GET` | `/reports/{report_id}` | Retrieve full report by unique report ID | `ScenarioReport` |
| **Audit** | `GET` | `/audit-events` | Retrieve secret-safe, redacted JSONL audit logs | `list[AuditEvent]` |

---

## Deterministic Threat Detection Engine (R01–R11)

All security evaluations follow an explicit, rule-based precedence model without heuristic or AI classifiers:

| Rule Code | Monitored Parameter | Trigger Condition | Threat Flag | Decision Rendered |
|:---:|:---|:---|:---|:---:|
| **R01** | QKD Error Rate | $\text{QBER} > 10.0\%$ | `HIGH_QBER` | **`ABORT` / `REKEY_REQUIRED`** |
| **R02** | Quantum Channel Loss | $\text{Loss Rate} > 20.0\%$ | `HIGH_LOSS` | **`QUARANTINE`** |
| **R03** | Packet HMAC Integrity | HMAC-SHA256 Tag Mismatch | `INVALID_MAC` | **`REJECT`** |
| **R04** | Plaintext Hash Integrity | SHA-256 Digest Mismatch | `MESSAGE_TAMPERING` | **`REJECT`** |
| **R05** | Stateful Anti-Replay | Duplicate Nonce / Sequence $\le$ Last Seen | `REPLAY_ATTACK` | **`REJECT`** |
| **R06** | QDS Verification | Mismatch Count $M \ge 20$ bits | `INVALID_QDS` | **`REJECT`** |
| **R07** | QDS Mismatch Interval | $8 < M < 20$ bits | `INVALID_QDS` | **`QUARANTINE`** |
| **R08** | Entanglement Bell Pair | Attempted Reuse of Consumed Bell Pair | `BELL_PAIR_REUSE` | **`REJECT`** |
| **R09** | Teleportation Classical MAC | Correction Bits HMAC Tag Mismatch | `TELEPORTATION_FAILURE` | **`REJECT`** |
| **R10** | Teleportation Fidelity | Recovered State Fidelity $< 90.0\%$ | `TELEPORTATION_FAILURE` | **`QUARANTINE`** |
| **R11** | Packet Freshness Window | Packet Age $\Delta t > 120\text{s}$ | `EXPIRED_PACKET` | **`REJECT`** |

*Decision Precedence: `ABORT` $\succ$ `REJECT` $\succ$ `QUARANTINE` $\succ$ `ACCEPT`.*

---

## Pre-Configured Attack Scenarios

| # | Scenario Name | Adversarial Profile Simulated | Expected Decision | Primary Threat Flag |
|:---:|:---|:---|:---:|:---:|
| 1 | `normal` | Clean optical channel (1% baseline physical noise) | **`ACCEPT`** | *None* |
| 2 | `eve-intercept-resend` | 100% active intercept-resend eavesdropping in quantum channel | **`ABORT`** | `HIGH_QBER` |
| 3 | `message-tampering` | Payload bit-flip alteration in transit | **`REJECT`** | `MESSAGE_TAMPERING` |
| 4 | `mac-tampering` | Classical HMAC-SHA256 authentication tag alteration | **`REJECT`** | `INVALID_MAC` |
| 5 | `qds-tampering` | Signature token bit-flips exceeding rejection threshold | **`REJECT`** | `INVALID_QDS` |
| 6 | `teleportation-bit-tampering` | Classical Bell correction bits altered, breaking Pauli recovery | **`REJECT`** | `TELEPORTATION_FAILURE` |
| 7 | `replay` | Duplicate packet retransmission with duplicate sequence/nonce | **`REJECT`** | `REPLAY_ATTACK` |
| 8 | `bell-pair-reuse` | Attempted reuse of an already consumed EPR Bell pair ID | **`REJECT`** | `BELL_PAIR_REUSE` |
| 9 | `expired-packet` | Transmission arriving outside the 120s validity window | **`REJECT`** | `EXPIRED_PACKET` |
| 10 | `high-loss` | Elevated optical channel loss (80% photon loss rate) | **`QUARANTINE`** | `HIGH_LOSS` |

---

## Testing & Code Quality

The codebase is tested across 23 test modules with **185 tests** and **94% coverage**:

```bash
# 1. Run full Pytest suite with coverage report
python -m pytest

# 2. Run Ruff code quality & style checks
python -m ruff check src tests

# 3. Verify React TypeScript frontend production build
cd frontend
npm run build
```

---



---


