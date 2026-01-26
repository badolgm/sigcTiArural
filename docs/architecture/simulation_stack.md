# Arquitectura de Simulación Avanzada: NVIDIA Omniverse & Newton

## 1. Visión General
Este documento detalla la integración de herramientas de simulación de "Grado Industrial" en la plataforma SIGC&T. El objetivo es proporcionar un entorno de gemelo digital fotorrealista y físicamente preciso para el desarrollo de robótica.

## 2. Tecnologías Clave

### 2.1 NVIDIA Omniverse™
Plataforma de desarrollo para conectar y construir herramientas 3D y aplicaciones basadas en **Universal Scene Description (OpenUSD)**.
*   **Uso en SIGC&T:** Visualización fotorrealista, colaboración multi-usuario y renderizado RTX en tiempo real.
*   **Conector:** `scripts/newton_bridge.py` actúa como orquestador de exportación USD.
*   **Recursos:** [NVIDIA Omniverse](https://www.nvidia.com/en-us/omniverse/)

### 2.2 Newton Physics Engine
Motor de física acelerado por GPU construido sobre **NVIDIA Warp**. Diseñado específicamente para investigación en robótica.
*   **Uso en SIGC&T:** Cálculo de dinámicas de cuerpo rígido, colisiones y articulaciones a alta velocidad (1000+ FPS).
*   **Repositorio:** [GitHub - newton-physics/newton](https://github.com/newton-physics/newton.git)
*   **Ventaja:** Permite entrenar modelos de IA (Reinforcement Learning) mucho más rápido que en tiempo real.

## 3. Flujo de Datos (Pipeline)

```mermaid
graph TD
    A[Usuario (Frontend React)] -->|Comandos de Control| B[API Django]
    B -->|ZMQ / WebSockets| C[Servidor de Simulación (GPU)]
    C -->|Newton Engine| D[Cálculo de Física]
    C -->|Omniverse Kit| E[Renderizado USD]
    E -->|Stream RTSP/WebRTC| A
    D -->|Telemetría JSON| B
```

## 4. Requisitos de Hardware
Para ejecutar el entorno de simulación completo (Newton + Omniverse) se recomienda:
*   **GPU:** NVIDIA RTX 3070 o superior (Drivers actualizados).
*   **OS:** Linux (Ubuntu 22.04) o Windows con WSL2 y soporte GPU Passthrough.
*   **RAM:** 32GB+.

## 5. Estado de Implementación
*   ✅ Interfaz de Control (Frontend).
*   ✅ Script de Puente (Backend stub).
*   🚧 Servidor GPU dedicado (Pendiente de despliegue).
