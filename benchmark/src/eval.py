import argparse
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import torch
from sklearn.metrics import roc_curve, auc, precision_recall_curve, average_precision_score

from datasets import ClassificationDataModule
from metrics import evaluate
from models import build_model


def plot_curves(probs, y_true, class_names, out_dir):
    n_classes = len(class_names)
    lin = np.linspace(0, 1, 15)
    acc_bin = []
    confs = probs.max(1)
    preds = probs.argmax(1)

    fig, ax = plt.subplots(figsize=(8, 8))
    for c in range(n_classes):
        fpr, tpr, _ = roc_curve((y_true == c).astype(int), probs[:, c])
        ax.plot(fpr, tpr, label=f"{class_names[c]} (auc={auc(fpr, tpr):.2f})")
    ax.plot([0, 1], [0, 1], "k--")
    ax.set_title("ROC one-vs-rest"); ax.legend(fontsize=6); fig.tight_layout()
    fig.savefig(out_dir / "roc_1vRest.png", dpi=120); plt.close(fig)

    fig, ax = plt.subplots(figsize=(8, 8))
    for c in range(n_classes):
        precision, recall, _ = precision_recall_curve((y_true == c).astype(int), probs[:, c])
        ax.plot(recall, precision, label=f"{class_names[c]} (aps={average_precision_score((y_true == c).astype(int), probs[:, c]):.2f})")
    ax.set_title("PR per class"); ax.legend(fontsize=6); fig.tight_layout()
    fig.savefig(out_dir / "pr_per_class.png", dpi=120); plt.close(fig)

    fig, ax = plt.subplots(figsize=(6, 6))
    ax.hist(confs, bins=15, range=(0, 1), alpha=0.6, label="conf")
    ax.set_title("Confidence vs Accuracy (calibration)")
    for i in range(15):
        acc_bin.append(np.mean(preds.confs if False else None) if False else 0)
    # calibration curve (expected vs observed)
    bins = np.linspace(0, 1, 16)
    obs = []
    for i in range(15):
        idx = (confs >= bins[i]) & (confs < bins[i + 1])
        obs.append(np.mean(preds[idx].numpy() == y_true[idx].numpy()) if idx.sum() > 0 else np.nan)
    ax.plot(bins[:-1], obs, "o-", label="observed accuracy")
    ax.plot([0, 1], [0, 1], "k--", label="perfect")
    ax.set_ylim(0, 1); ax.legend(); fig.tight_layout()
    fig.savefig(out_dir / "calibration.png", dpi=120); plt.close(fig)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--run-id", required=True)
    ap.add_argument("--data-root", required=True)
    ap.add_argument("--partition", default="validation", choices=["validation", "test"])
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    run_dir = Path("runs") / args.run_id
    run_cfg = json.loads((run_dir / "config.json").read_text())
    ckpt = torch.load(run_dir / "checkpoints" / "best.pth", map_location="cpu", weights_only=False)

    dm = ClassificationDataModule(data_root=args.data_root, batch_size=64, seed=args.seed).setup()
    model = build_model(run_cfg["model"], num_classes=len(dm.class_names)).to("cpu" if not torch.cuda.is_available() else "cuda")
    model.load_state_dict(ckpt["model_state_dict"])
    model.eval()

    loader = dm.val_loader() if args.partition == "validation" else dm.test_loader()
    device = next(model.parameters()).device
    all_probs, all_t = [], []
    with torch.no_grad():
        for images, targets in loader:
            logits = model(images.to(device))
            all_probs.append(torch.softmax(logits.cpu(), dim=1))
            all_t.append(targets)
    probs = torch.cat(all_probs); y_true = torch.cat(all_t)
    metrics = evaluate(probs, y_true)
    metrics["partition"] = args.partition
    metrics["per_class_table"] = [
        [c, p, r, f] for c, p, r, f in
        zip(dm.class_names, metrics["per_class_precision"], metrics["per_class_recall"], metrics["per_class_f1"])
    ]
    (run_dir / "report" / f"metrics_{args.partition}.json").write_text(
        json.dumps(metrics, indent=2, ensure_ascii=False))
    plot_curves(probs, y_true.numpy(), dm.class_names, run_dir / "plots")
    print(f"partition={args.partition} macro_f1={metrics['macro_f1']:.4f} "
          f"balanced_acc={metrics['balanced_accuracy']:.4f} ece={metrics['ece']:.4f}")


if __name__ == "__main__":
    main()