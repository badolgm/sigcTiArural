import numpy as np
import torch
from sklearn.metrics import (
    f1_score,
    balanced_accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
)


def evaluate(probs, y_true, n_bins=15):
    """Compute canonical metrics from softmax probabilities and true labels."""
    probs = probs.cpu().numpy() if isinstance(probs, torch.Tensor) else np.asarray(probs)
    y_true = y_true.cpu().numpy() if isinstance(y_true, torch.Tensor) else np.asarray(y_true)
    y_pred = probs.argmax(axis=1)
    conf = probs.max(axis=1)

    macro_f1 = f1_score(y_true, y_pred, average="macro", zero_division=0)
    weighted_f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)
    bal_acc = balanced_accuracy_score(y_true, y_pred)
    p, r, f, _ = precision_recall_fscore_support(y_true, y_pred, zero_division=0)
    cm = confusion_matrix(y_true, y_pred)

    ece = expected_calibration_error(conf, y_pred, y_true, n_bins=n_bins)
    return {
        "macro_f1": float(macro_f1),
        "weighted_f1": float(weighted_f1),
        "balanced_accuracy": float(bal_acc),
        "per_class_precision": p.tolist(),
        "per_class_recall": r.tolist(),
        "per_class_f1": f.tolist(),
        "confusion_matrix": cm.tolist(),
        "ece": float(ece),
    }


def expected_calibration_error(conf, y_pred, y_true, n_bins=15):
    """Standard ECE with equal-width bins."""
    bins = np.linspace(0, 1, n_bins + 1)
    total = np.zeros(n_bins)
    correct = np.zeros(n_bins)
    for c, p, t in zip(conf, y_pred, y_true):
        idx = min(int(np.digitize(c, bins)) - 1, n_bins - 1)
        idx = max(idx, 0)
        total[idx] += 1
        correct[idx] += int(p == t)
    mask = total > 0
    with np.errstate(divide="ignore", invalid="ignore"):
        acc = np.divide(correct, total, out=np.zeros_like(total), where=mask)
    bin_conf = np.zeros(n_bins)
    bin_conf[mask] = (bins[:-1][mask] + bins[1:][mask]) / 2
    ece = np.sum((total / total.sum()) * np.abs(acc - bin_conf))
    return float(ece)