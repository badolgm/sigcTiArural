import torchvision.models as models


def build_model(name, num_classes=16, pretrained=True):
    name = name.lower()
    if name == "mobilenet_v2":
        m = models.mobilenet_v2(weights="IMAGENET1K_V1" if pretrained else None)
        m.classifier[1] = __Linear(m.classifier[1], num_classes)
    elif name == "mobilenet_v3_large":
        m = models.mobilenet_v3_large(weights="IMAGENET1K_V1" if pretrained else None)
        m.classifier[3] = __Linear(m.classifier[3], num_classes)
    elif name == "efficientnet_b0":
        m = models.efficientnet_b0(weights="IMAGENET1K_V1" if pretrained else None)
        m.classifier[1] = __Linear(m.classifier[1], num_classes)
    elif name == "resnet50":
        m = models.resnet50(weights="IMAGENET1K_V1" if pretrained else None)
        m.fc = __Linear(m.fc, num_classes)
    elif name == "convnext_tiny":
        m = models.convnext_tiny(weights="IMAGENET1K_V1" if pretrained else None)
        m.classifier[2] = __Linear(m.classifier[2], num_classes)
    else:
        raise ValueError(f"Modelo no soportado: {name}")
    return m


def __Linear(original, num_classes):
    import torch.nn as nn
    return nn.Linear(original.in_features, num_classes)