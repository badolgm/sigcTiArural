import os
import random
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader, WeightedRandomSampler
from torchvision import datasets, transforms

IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def get_seed_worker(seed):
    def worker_init_fn(worker_id):
        np.random.seed(seed + worker_id)
        random.seed(seed + worker_id)
    return worker_init_fn


def make_transforms(augment=True):
    if augment:
        return transforms.Compose([
            transforms.Resize(256),
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(),
            transforms.RandomRotation(15),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.05),
            transforms.ToTensor(),
            transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
        ])
    return transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])


class ClassificationDataModule:
    def __init__(self, data_root, batch_size=64, num_workers=4, seed=42):
        self.data_root = data_root
        self.batch_size = batch_size
        self.num_workers = num_workers
        self.seed = seed
        self.partitions = {}
        self.train_ds = None
        self.val_ds = None
        self.test_ds = None
        self.class_names = None

    def _load(self, partition):
        root = os.path.join(self.data_root, partition)
        ds = datasets.ImageFolder(root, transform=make_transforms(augment=(partition == "train")))
        return ds

    def setup(self):
        self.train_ds = self._load("train")
        self.val_ds = self._load("validation")
        self.test_ds = self._load("test")
        if not (self.train_ds.classes == self.val_ds.classes == self.test_ds.classes):
            raise RuntimeError("Partition class lists differ")
        self.class_names = self.train_ds.classes
        return self

    def _loader(self, ds, shuffle, sampler=None):
        return DataLoader(
            ds,
            batch_size=self.batch_size,
            shuffle=shuffle,
            sampler=sampler,
            num_workers=self.num_workers,
            pin_memory=True,
            worker_init_fn=get_seed_worker(self.seed),
        )

    def train_loader(self):
        # Class-balanced sampling: equal probability per class per batch
        targets = np.array(self.train_ds.targets)
        class_counts = np.bincount(targets)
        weights = 1.0 / (class_counts[targets].astype(float))
        sampler = WeightedRandomSampler(weights, num_samples=len(targets), replacement=True)
        return self._loader(self.train_ds, shuffle=False, sampler=sampler)

    def val_loader(self):
        return self._loader(self.val_ds, shuffle=False)

    def test_loader(self):
        return self._loader(self.test_ds, shuffle=False)


def class_weights(targets, num_classes):
    targets = np.array(targets)
    counts = np.bincount(targets, minlength=num_classes).astype(float)
    n = counts.sum()
    weights = n / (counts * num_classes)
    return torch.tensor(weights, dtype=torch.float32)