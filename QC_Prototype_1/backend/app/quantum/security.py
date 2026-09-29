"""
Security decision and threat detection engine for BB84 QKD.

Protocol Evaluation Notes:
- Under the ideal noiseless simulation, Bob receives the exact state Alice sent when their bases match (QBER = 0%).
- In physical quantum key distribution systems, optical noise, detector dark counts, and fiber birefringence
  typically introduce a small non-zero baseline QBER (e.g. 1-3%) even without an eavesdropper.
- An intercept-and-resend eavesdropper (Eve) who measures in a randomly chosen conjugate basis (+ or x)
  introduces an expected 25% error rate into the sifted key.
  Because Eve chooses the wrong basis 50% of the time (collapsing the state), Bob's subsequent measurement
  in Alice's basis has a 50% chance of yielding an error: 0.5 * 0.5 = 25.0%.
- Individual finite simulations will fluctuate probabilistically around this expected 25% value.

Important Note on Detection Thresholds:
- In this demonstration prototype, 11% is used as a configurable prototype detection threshold.
- It is NOT a universal cryptographic security boundary or proof of security.
- Production QKD post-processing systems use error-correction algorithms (e.g., Cascade, LDPC)
  and privacy amplification (universal hashing) where the abort threshold depends on channel models,
  finite-key effects, and device calibration parameters.
"""

from dataclasses import dataclass
from enum import Enum


class SecurityStatus(str, Enum):
    SECURE = "SECURE"
    SUSPICIOUS = "SUSPICIOUS"
    ALERT = "SECURITY ALERT"


@dataclass
class SecurityDecision:
    status: SecurityStatus
    qber: float
    threshold: float
    errors: int
    sifted_length: int
    reason: str
    is_eavesdropping_detected: bool


def evaluate_security(
    qber: float, threshold: float, errors: int, sifted_length: int
) -> SecurityDecision:
    """
    Evaluates the security status of a BB84 transmission using a prototype statistical classification rule.

    States:
    - SECURE: QBER < 0.5 * threshold (under ideal noiseless simulation, typical QBER is 0%).
    - SUSPICIOUS: 0.5 * threshold <= QBER <= threshold (elevated error rate near prototype threshold).
    - SECURITY ALERT: QBER > threshold (statistically significant error rate exceeding prototype threshold).
    """
    if sifted_length == 0:
        return SecurityDecision(
            status=SecurityStatus.SUSPICIOUS,
            qber=0.0,
            threshold=threshold,
            errors=0,
            sifted_length=0,
            reason="No matching bases were found (0 sifted bits). Insufficient data to evaluate QBER.",
            is_eavesdropping_detected=False,
        )

    suspicious_boundary = threshold * 0.5

    if qber > threshold:
        status = SecurityStatus.ALERT
        reason = (
            f"Quantum Bit Error Rate ({qber:.2f}%) exceeds the configurable prototype detection threshold ({threshold:.2f}%). "
            f"Statistically significant quantum state disturbance detected, consistent with an active "
            f"intercept-and-resend eavesdropper (Eve)."
        )
        is_eavesdropping = True
    elif qber >= suspicious_boundary:
        status = SecurityStatus.SUSPICIOUS
        reason = (
            f"Quantum Bit Error Rate ({qber:.2f}%) is elevated near the configurable prototype detection threshold ({threshold:.2f}%). "
            f"In physical quantum channels, this could indicate environmental noise, polarization drift, or partial eavesdropping."
        )
        is_eavesdropping = False
    else:
        status = SecurityStatus.SECURE
        reason = (
            f"Under this ideal noiseless simulation, Quantum Bit Error Rate ({qber:.2f}%) is below 50% of the "
            f"configurable prototype detection threshold ({threshold:.2f}%). Channel appears secure with no significant state disturbance."
        )
        is_eavesdropping = False

    return SecurityDecision(
        status=status,
        qber=qber,
        threshold=threshold,
        errors=errors,
        sifted_length=sifted_length,
        reason=reason,
        is_eavesdropping_detected=is_eavesdropping,
    )
