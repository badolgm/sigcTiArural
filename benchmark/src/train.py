import argparse
import csv
import json
import math
import os
import random
import time
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
import yaml
from torch.cuda.amp import GradScaler, autocast
from torch.optim import AdamW
from torch.optim.lr_scheduler import CosineAnnealingLR

from datasets import ClassificationDataModule, class_weights
from metrics import evaluate
from models import build_model


def set_seed(seed):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def run_one_epoch(model, loader, criterion, device, optimizer=None, scaler=None, fp16=True):
    is_train = optimizer is not None
    model.train(is_train)
    total_loss, correct, n = 0.0, 0.0, 0
    all_probs, all_targets = [], []
    with torch.set_grad_enabled(is_train):
        for images, targets in loader:
            images, targets = images.to(device), targets.to(device)
            if is_train:
                optimizer.zero_grad()
                with autocast(enabled=fp16):
                    logits = model(images)
                    loss = criterion(logits, targets)
                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()
            else:
                with autocast(enabled=fp16):
                    logits = model(images)
                    loss = criterion(logits, targets)
            probs = torch.softmax(logits.detach(), dim=1)
            all_probs.append(probs)
            all_targets.append(targets)
            total_loss += loss.item() * images.size(0)
            correct += (probs.argmax(1) == targets).sum().item()
            n += images.size(0)
    probs = torch.cat(all_probs)
    targets = torch.cat(all_targets)
    metrics = evaluate(probs, targets)
    metrics["loss"] = total_loss / n
    metrics["accuracy"] = correct / n
    return metrics


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="mobilenet_v2")
    ap.add_argument("--config", required=True)
    ap.add_argument("--run-id", required=True)
    ap.add_argument("--data-root", required=True)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    cfg = yaml.safe_load(Path(args.config).read_text())
    set_seed(args.seed)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"device={device} model={args.model} run={args.run_id}", flush=True)

    dm = ClassificationDataModule(
        data_root=args.data_root,
        batch_size=cfg["batch_size"],
        num_workers=cfg["num_workers"],
        seed=args.seed,
    ).setup()
    num_classes = len(dm.class_names)
    model = build_model(args.model, num_classes=num_classes, pretrained=True).to(device)
    criterion = nn.CrossEntropyLoss(weight=class_weights(dm.train_ds.targets, num_classes).to(device))
    optimizer = AdamW(model.parameters(), lr=cfg["lr"], weight_decay=cfg["weight_decay"])
    scheduler = CosineAnnealingLR(optimizer, T_max=cfg["epochs"], eta_min=cfg["lr"] * 0.01)
    scaler = GradScaler(enabled=(device == "cuda"))

    run_dir = Path("runs") / args.run_id
    (run_dir / "checkpoints").mkdir(parents=True, exist_ok=True)
    (run_dir / "plots").mkdir(parents=True, exist_ok=True)
    (run_dir / "report").mkdir(parents=True, exist_ok=True)
    (run_dir / "config.json").write_text(json.dumps({
        "model": args.model, "run_id": args.run_id, "seed": args.seed,
        "num_classes": num_classes, "device": device,
        "config": cfg, "data_root": args.data_root, "class_names": dm.class_names,
    }, indent=2, ensure_ascii=False))

    best_f1, best_epoch, no_improve = -1.0, -1, 0
    hdr = ["epoch", "train_loss", "train_macro_f1", "val_loss", "val_macro_f1", "val_ece", "lr", "time_s"]
    with open(run_dir / "metrics.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(hdr)
        for epoch in range(1, cfg["epochs"] + 1):
            t0 = time.time()
            tr = run_one_epoch(model, dm.train_loader(), criterion, device, optimizer, scaler, cfg["fp16"])
            va = run_one_epoch(model, dm.val_loader(), criterion, device, scaler=scaler, fp16=cfg["fp16"])
            scheduler.step()
            lr = optimizer.param_groups[0]["lr"]
            w.writerow([epoch, round(tr["loss"], 4), round(tr["macro_f1"], 4),
                        round(va["loss"], 4), round(va["macro_f1"], 4),
                        round(va["ece"], 4), round(lr, 6), round(time.time() - t0, 1)])
            f.flush()
            print(f"epoch={epoch} train_f1={tr['macro_f1']:.4f} val_f1={va['macro_f1']:.4f} "
                  f"val_ece={va['ece']:.4f} lr={lr:.2e}", flush=True)

            improved = va["macro_f1"] > best_f1
            if improved:
                best_f1, best_epoch, no_improve = va["macro_f1"], epoch, 0
                torch.save({"epoch": epoch, "model_state_dict": model.state_dict(),
                            "optimizer_state_dict": optimizer.state_dict(),
                            "macro_f1_val": best_f1, "ece_val": va["ece"], "config": cfg},
                           run_dir / "checkpoints" / "best.pth")
            else:
                no_improve += 1
            torch.save({"epoch": epoch, "model_state_dict": model.state_dict(),
                        "macro_f1_val": va["macro_f1"]}, run_dir / "checkpoints" / "last.pth")
            if no_improve >= cfg["patience"]:
                print(f"early stop at epoch {epoch} (best {best_f1:.4f} @ {best_epoch})", flush=True)
                break
    print(f"done best_val_macro_f1={best_f1:.4f} at epoch {best_epoch}", flush=True)


if __name__ == "__main__":
    main()