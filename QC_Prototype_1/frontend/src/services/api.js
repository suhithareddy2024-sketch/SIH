const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.error('API Health Check Error:', err);
    return null;
  }
}

export async function simulateBB84({ num_qubits = 64, eve_enabled = false, qber_threshold = 11.0 }) {
  const res = await fetch(`${API_BASE}/api/bb84/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      num_qubits: Number(num_qubits),
      eve_enabled: Boolean(eve_enabled),
      qber_threshold: Number(qber_threshold),
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Simulation failed with status ${res.status}`);
  }

  return await res.json();
}

export async function compareBB84({ num_qubits = 64, qber_threshold = 11.0, iterations = 10 }) {
  const res = await fetch(`${API_BASE}/api/bb84/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      num_qubits: Number(num_qubits),
      qber_threshold: Number(qber_threshold),
      iterations: Number(iterations),
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Comparison failed with status ${res.status}`);
  }

  return await res.json();
}

export async function benchmarkBB84({ num_qubits = 64, qber_threshold = 11.0, iterations = 100 }) {
  const res = await fetch(`${API_BASE}/api/bb84/benchmark`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      num_qubits: Number(num_qubits),
      qber_threshold: Number(qber_threshold),
      iterations: Number(iterations),
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Benchmark failed with status ${res.status}`);
  }

  return await res.json();
}

export async function analyzeChannel({
  num_qubits = 64,
  eve_enabled = false,
  noise_enabled = false,
  noise_model = 'bit_flip',
  noise_probability = 0.05,
  qber_threshold = 11.0,
}) {
  const res = await fetch(`${API_BASE}/api/bb84/channel-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      num_qubits: Number(num_qubits),
      eve_enabled: Boolean(eve_enabled),
      noise_enabled: Boolean(noise_enabled),
      noise_model: String(noise_model),
      noise_probability: Number(noise_probability),
      qber_threshold: Number(qber_threshold),
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Channel analysis failed with status ${res.status}`);
  }

  return await res.json();
}

export async function runChannelExperiment({
  num_qubits = 64,
  noise_model = 'bit_flip',
  noise_probability = 0.05,
  qber_threshold = 11.0,
  iterations = 100,
}) {
  const res = await fetch(`${API_BASE}/api/bb84/channel-experiment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      num_qubits: Number(num_qubits),
      noise_model: String(noise_model),
      noise_probability: Number(noise_probability),
      qber_threshold: Number(qber_threshold),
      iterations: Number(iterations),
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Channel experiment failed with status ${res.status}`);
  }

  return await res.json();
}
