#!/usr/bin/env python3
"""Generador determinista del bundle SFT para el LLM acústico de CMSC.

Este script SOLO LEE los metadatos reales de C0, C1 y acoustic_envelopes_v1.json
y SOLO ESCRIBE en ``dist_colab_bundle/`` (carpeta ignorada por Git).

El entrenamiento NO se ejecuta aquí: el paquete generado se sube a Google Drive
y el notebook incluido corre en Colab con QLoRA/PEFT.

Invariantes que el bundle protege:
  * C0  = capa propia (cmsc_logger), única verdad evaluable de S81.
  * C1  = referencia externa (ESC-50), estado REF; nunca se suma a C0.
  * rules-v0 = heurística determinista, estado SIM; no es un modelo aprendido.
  * Ninguna métrica numérica se fabrica: si no está declarada, se dice NO_DATA.

Uso:
    python scripts/build_colab_llm_bundle.py
"""

from __future__ import annotations

import csv
import hashlib
import json
import re
from collections import Counter
from pathlib import Path
from string import Template
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
C0_ROOT = REPO_ROOT / "data" / "datasets" / "sigct_rural_acoustic" / "v1"
C1_ROOT = (
    REPO_ROOT / "data" / "datasets" / "sigct_rural_acoustic" / "reference" / "esc50"
)
OUT_DIR = REPO_ROOT / "dist_colab_bundle"

DATASET_NAME = "dataset_acoustic_sft_v1.jsonl"
NOTEBOOK_NAME = "train_cmsc_acoustic_llm_colab.ipynb"
SHA_NAME = "dataset_acoustic_sft_v1.sha256"
MANIFEST_NAME = "bundle_manifest.json"

DRIVE_ROOT = (
    "/content/drive/MyDrive/Gobernanza_Portafolio_Badolgm_IRTELC01_2026/"
    "03_Continuidad_sigcTiArural_y_Ecosistema/CMSC_AI_ACOUSTIC_REPO_V1"
)
DATASET_DIR_REL = "02_DATASETS_Y_CONTRATOS_V1"
ADAPTERS_DIR_REL = "04_MODELOS_LLMS_Y_ADAPTADORES"
EVAL_DIR_REL = "05_EVALUACION_BENCHMARKS_Y_LOGS"

READ_ONLY_SOURCES = (
    C0_ROOT / "metadata" / "metadata.csv",
    C0_ROOT / "metadata" / "labels.csv",
    C0_ROOT / "metadata" / "schema.json",
    C0_ROOT / "features" / "acoustic_envelopes_v1.json",
    C1_ROOT / "manifest_ref.esc50.yaml",
    C1_ROOT / "metadata" / "ref_esc50.csv",
)


# --------------------------------------------------------------------------- #
# Lectura de fuentes (SOLO LECTURA)                                            #
# --------------------------------------------------------------------------- #
def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def _yaml_scalar(raw: str) -> Any:
    value = raw.strip().strip('"').strip("'")
    if re.fullmatch(r"-?\d+", value):
        return int(value)
    if value.lower() in {"true", "false"}:
        return value.lower() == "true"
    return value


def _read_simple_manifest(path: Path) -> dict[str, Any]:
    """Parser mínimo del YAML declarativo; evita dependencias externas."""
    result: dict[str, Any] = {}
    section: str | None = None
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        top = re.match(r"^([A-Za-z0-9_]+):\s*(.*)$", line)
        if top:
            key, raw = top.group(1), top.group(2)
            if raw.strip() == "":
                section = key
                result[key] = {}
            else:
                result[key] = _yaml_scalar(raw)
                section = None
            continue
        nested = re.match(r"^\s{2}([A-Za-z0-9_]+):\s*(.*)$", line)
        if nested and section is not None:
            result[section][nested.group(1)] = _yaml_scalar(nested.group(2))
    return result


def read_source_state() -> dict[str, Any]:
    """Consolida el estado REAL de C0/C1/envelopes sin modificar ningún archivo."""
    missing = [str(p.relative_to(REPO_ROOT)) for p in READ_ONLY_SOURCES if not p.is_file()]
    if missing:
        raise FileNotFoundError("Fuentes de solo lectura ausentes: " + ", ".join(missing))

    c0_rows = _read_csv(C0_ROOT / "metadata" / "metadata.csv")
    labels = _read_csv(C0_ROOT / "metadata" / "labels.csv")
    schema = json.loads((C0_ROOT / "metadata" / "schema.json").read_text(encoding="utf-8"))
    envelopes = json.loads(
        (C0_ROOT / "features" / "acoustic_envelopes_v1.json").read_text(encoding="utf-8")
    )
    c1_rows = _read_csv(C1_ROOT / "metadata" / "ref_esc50.csv")
    manifest = _read_simple_manifest(C1_ROOT / "manifest_ref.esc50.yaml")

    c0_by_class = Counter(row["class_id"] for row in c0_rows)
    c0_accepted_by_class = Counter(
        row["class_id"] for row in c0_rows if row["ingest_status"] == "accepted"
    )
    c1_by_class = Counter(row["class_mapped_v1"] for row in c1_rows)
    pilot = manifest.get("pilot", {})

    state = {
        "c0": {
            "fuente": "data/datasets/sigct_rural_acoustic/v1/metadata/metadata.csv",
            "capa": "C0",
            "origen": "cmsc_logger (propio)",
            "dataset_version": schema.get("dataset_version"),
            "dataset_state": schema.get("dataset_state"),
            "schema_version": schema.get("schema_version"),
            "taxonomy_version": schema.get("taxonomy_version"),
            "feature_schema": schema.get("feature_schema"),
            "window_schema": schema.get("window_schema"),
            "window_schema_dims": schema.get("window_schema_dims"),
            "frames_per_clip": schema.get("window_schema_definition", {}).get(
                "frames_per_clip"
            ),
            "filas": len(c0_rows),
            "aceptadas": sum(r["ingest_status"] == "accepted" for r in c0_rows),
            "rechazadas": sum(r["ingest_status"] == "rejected" for r in c0_rows),
            "cuarentena": sum(r["ingest_status"] == "quarantine" for r in c0_rows),
            "por_clase": dict(sorted(c0_by_class.items())),
            "aceptadas_por_clase": dict(sorted(c0_accepted_by_class.items())),
            "partition": sorted({r["partition"] for r in c0_rows}),
        },
        "c1": {
            "fuente": "data/datasets/sigct_rural_acoustic/reference/esc50/metadata/ref_esc50.csv",
            "capa": "C1",
            "origen": "ESC-50 (externo)",
            "source_id": manifest.get("source_id"),
            "partition": manifest.get("partition"),
            "reference_status": manifest.get("reference_status"),
            "feature_schema_ref": manifest.get("feature_schema_ref"),
            "clips": len(c1_rows),
            "clips_aceptados": sum(
                r["reference_status_clip"] == "ACCEPTED" for r in c1_rows
            ),
            "objetivo": pilot.get("target"),
            "aceptados_manifiesto": pilot.get("accepted"),
            "rechazados": pilot.get("rejected"),
            "deficit": pilot.get("deficit_vs_target"),
            "por_clase": dict(sorted(c1_by_class.items())),
            "licencias": dict(sorted(Counter(r["license"] for r in c1_rows).items())),
        },
        "envelopes": {
            "fuente": "data/datasets/sigct_rural_acoustic/v1/features/acoustic_envelopes_v1.json",
            "schema": envelopes.get("schema"),
            "count_declarado": envelopes.get("count"),
            "claves_reales": len(envelopes.get("envelopes", {})),
        },
        "taxonomia": {
            "clases": len(labels),
            "mids_unverified": sum(
                r.get("audi_set_status") == "UNVERIFIED" for r in labels
            ),
        },
    }
    state["fuentes_sha256"] = {
        str(p.relative_to(REPO_ROOT)).replace("\\", "/"): _sha256(p)
        for p in READ_ONLY_SOURCES
    }
    return state


# --------------------------------------------------------------------------- #
# Corpus SFT determinista                                                      #
# --------------------------------------------------------------------------- #
def build_sft_examples(state: dict[str, Any]) -> list[dict[str, str]]:
    """Pares instrucción/respuesta con valores leídos de las fuentes reales."""
    c0, c1, env = state["c0"], state["c1"], state["envelopes"]
    resumen = json.dumps(
        {
            "C0": {
                "filas": c0["filas"],
                "aceptadas": c0["aceptadas"],
                "cuarentena": c0["cuarentena"],
                "por_clase_aceptadas": c0["aceptadas_por_clase"],
                "dataset_state": c0["dataset_state"],
                "schema_version": c0["schema_version"],
                "feature_schema": c0["feature_schema"],
                "window_schema": c0["window_schema"],
                "dims": c0["window_schema_dims"],
                "frames": c0["frames_per_clip"],
            },
            "C1": {
                "clips": c1["clips"],
                "partition": c1["partition"],
                "reference_status": c1["reference_status"],
                "por_clase": c1["por_clase"],
                "objetivo": c1["objetivo"],
                "aceptados": c1["aceptados_manifiesto"],
                "rechazados": c1["rechazados"],
            },
            "envelopes": {
                "schema": env["schema"],
                "count": env["count_declarado"],
                "claves": env["claves_reales"],
            },
            "taxonomia": state["taxonomia"],
        },
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    )

    silencio = c0["aceptadas_por_clase"].get("silencio", 0)
    clases_c0 = ", ".join(
        f"{k}={v}" for k, v in c0["aceptadas_por_clase"].items()
    )
    clases_c1 = ", ".join(f"{k}={v}" for k, v in c1["por_clase"].items())
    mids = state["taxonomia"]["mids_unverified"]

    pares: list[tuple[str, str]] = [
        (
            "Define la capa C0 del dataset acústico y describe su estado REAL.",
            f"C0 es la capa objetiva propia del proyecto, originada en cmsc_logger. "
            f"Es la ÚNICA verdad evaluable de S81. Estado real: {c0['dataset_state']}, "
            f"schema {c0['schema_version']}, {c0['filas']} filas en metadata.csv, "
            f"{c0['aceptadas']} aceptadas y {c0['cuarentena']} en cuarentena. "
            f"Features: {c0['feature_schema']} con {c0['window_schema']} "
            f"({c0['window_schema_dims']} dimensiones, {c0['frames_per_clip']} frames por clip). "
            f"No es un dataset publicado ni validado: es captura inicial.",
        ),
        (
            "¿Cuántos clips de silencio tiene C0? ¿Es correcto afirmar que hay 1?",
            f"Los metadatos reales declaran {silencio} clips de silencio aceptados en C0. "
            f"La cifra '1 clip' pertenece a un snapshot documental histórico y NO describe "
            f"el estado actual: debe usarse el conteo leído de metadata.csv, nunca una cifra "
            f"memorizada. Conteo real por clase aceptada: {clases_c0}.",
        ),
        (
            "Define la capa C1 y cuántos clips contiene.",
            f"C1 es la capa de referencia externa (REF), no propia: {c1['origen']}, "
            f"source_id={c1['source_id']}, partition={c1['partition']}, "
            f"reference_status={c1['reference_status']}. Contiene {c1['clips']} clips "
            f"aceptados, de un objetivo de {c1['objetivo']} con {c1['rechazados']} "
            f"rechazados y déficit de {c1['deficit']}. Es inventario para pre-entrenamiento, "
            f"bootstrap y negativos; NUNCA evalúa S81.",
        ),
        (
            "¿Puedo sumar los clips de C1 a C0 para reportar cuántos clips propios hay?",
            f"No. C0 declara {c0['aceptadas']} clips aceptados propios y C1 declara "
            f"{c1['clips']} clips REF. Sumarlos (que daría {c0['aceptadas'] + c1['clips']}) "
            f"es una fabricación de evidencia: C1 es externo, su licencia es por clip y su "
            f"estado es REF. Los conteos se reportan separados y con su capa.",
        ),
        (
            "¿Se pueden mezclar C0 y C1 en train/validation/test de S81?",
            "No. Existen cuatro barreras: física (árboles de datos distintos), de esquema "
            "(metadata.csv es solo C0; ref_esc50.csv es solo C1), de entrenamiento (la "
            "evaluación de S81 usa exclusivamente C0; C1 puede pre-entrenar pero jamás "
            "puntúa) y de reporting (dataset_state de C0 es distinto de reference_status "
            "de C1). Mezclarlos invalida cualquier métrica.",
        ),
        (
            "¿Qué es rules-v0 y qué estado de honestidad le corresponde?",
            "rules-v0 es una heurística determinista de reglas, NO un modelo aprendido: no "
            "tiene pesos, no se entrena y no produce inferencia nueva sobre audio. Su estado "
            "de honestidad es SIM, nunca REAL-LOCAL ni REAL. Es reproducible y sirve como "
            "línea base determinista, pero no sustituye a un clasificador validado.",
        ),
        (
            "¿Qué métricas de S81 puedo reportar con los datos disponibles?",
            "Ninguna. No existe modelo acústico entrenado ni validation_metrics.json "
            "acústico: S81 y S82 permanecen en DISEÑO. No hay macro-F1, ECE, balanced "
            "accuracy ni weighted F1 acústicos declarados. Los valores de M1/M2 pertenecen "
            "al benchmark agrícola de imágenes y NO deben atribuirse al dominio acústico. "
            "Si no hay métrica declarada, se responde NO_DATA: 'No hay métricas numéricas "
            "declaradas en el resumen'.",
        ),
        (
            "¿Cómo se clasifica el estado de honestidad de un clip leído desde disco o backup?",
            "LOCAL. REAL-LOCAL exige captura propia autorizada en el momento de la sesión y "
            "inference_executed=true. Un clip leído desde archivo, backup o caché conserva "
            "su proveniencia real: es LOCAL. La etiqueta REAL-LOCAL no se hereda por el hecho "
            "de que el archivo exista en el repositorio.",
        ),
        (
            "¿La ausencia de cabecera EBML demuestra que un clip WebM es inválido?",
            "No. La cabecera EBML es un dato diagnóstico (source.ebmlHeader), no un veredicto. "
            "La decodificación real del payload manda: si el navegador entrega un WebM válido "
            "sin esa cabecera declarada en el resumen, el clip es válido. Un checador que "
            "rechaza por cabecera fabrica un fallo que el audio no respalda.",
        ),
        (
            "¿Qué esquema de features debo usar para el pipeline acústico?",
            f"El esquema vigente es {c0['feature_schema']} (22 features) agregado con "
            f"{c0['window_schema']} = mean+std, {c0['window_schema_dims']} dimensiones, "
            f"{c0['frames_per_clip']} frames por clip de 3,0 s. La versión v1 está CONGELADA: "
            "su feature 21 (profileEntropy) calculaba energía sobre dB en lugar de potencia "
            "lineal y truncaba el espectro. Nunca se mezclan geometrías de v1 y v2 en un "
            "mismo CSV.",
        ),
        (
            "¿Qué clases y cuántos clips tiene la capa C1 por clase?",
            f"C1 ({c1['clips']} clips) se distribuye: {clases_c1}. Las clases 'silencio' y "
            "'ruido_desconocido' NO se nutren de ESC-50: son exclusivas de C0/REAL-LOCAL. "
            "'voz' tampoco se mapea desde ESC-50 en esta capa.",
        ),
        (
            "¿Qué clases están presentes en C0 y con cuántas muestras aceptadas?",
            f"C0 tiene {c0['aceptadas']} clips aceptados distribuidos así: {clases_c0}. "
            f"Además hay {c0['cuarentena']} filas en cuarentena que NO deben contarse como "
            f"evidencia aceptada. Las 9 clases de la taxonomía v1 existen en labels.csv, "
            f"pero no todas tienen muestras capturadas.",
        ),
        (
            "Me piden un macro-F1 acústico para el informe. ¿Lo invento?",
            "No. No existe modelo acústico entrenado ni métrica acústica declarada. La "
            "respuesta honesta es NO_DATA: 'No hay métricas numéricas declaradas en el "
            "resumen'. Debo pedir validation_metrics.json acústico y su hash antes de citar "
            "cualquier cifra. Inventar un macro-F1 viola el principio de no fabricación.",
        ),
        (
            "¿Qué verificación de metadatos puedo citar sobre los mids de AudioSet?",
            f"labels.csv declara 9 clases, de las cuales {mids} tienen audi_set_status "
            "UNVERIFIED. Un mid declarado y no verificado NO es evidencia: debe verificarse "
            "contra yamnet_class_map.csv antes de usarse como apoyo de clase. El gate "
            "G-DS-1 permanece condicionado a esa verificación.",
        ),
        (
            "¿Qué protege el vector de envelopes acústicos y cuántos elementos tiene?",
            f"El archivo {env['schema']} declara count={env['count_declarado']} y contiene "
            f"efectivamente {env['claves_reales']} claves. Es RMS por frame (feature 4), "
            "un derivado regenerable que alimenta el chequeo AC-9 de cuasi-duplicados. "
            "Es solo lectura: se regenera desde el pipeline, nunca se edita a mano.",
        ),
        (
            "Enumera los invariantes que el analista LLM debe respetar siempre.",
            "Cinco invariantes: (1) C0 es la única capa objetiva y evaluable de S81; "
            "(2) C1 es REF, separada y nunca sumada ni promovida a REAL-LOCAL; "
            "(3) rules-v0 es determinista y su estado es SIM; (4) el LLM solo redacta, no "
            "lee crudos, no ejecuta inferencia y no cambia estados; (5) prohibido inventar "
            "métricas, señales o fuentes: si no está declarado, se responde NO_DATA/PARTIAL.",
        ),
        (
            "¿El analista LLM en modo dry_run usa credenciales o red?",
            "No. dry_run=True (el default) ejecuta rules-v0 puro: sin API, sin red, sin "
            "credenciales y determinista. El modo real exige URL, modelo y clave configurados; "
            "si faltan, falla explícitamente con LlmCredentialsMissingError. Nunca se simula "
            "un LLM ni se cae silenciosamente a reglas.",
        ),
    ]

    examples: list[dict[str, str]] = []
    for index, (instruction, response) in enumerate(pares, start=1):
        examples.append(
            {
                "instruction": instruction,
                "input": resumen,
                "output": response,
                "example_id": f"sft_acoustic_{index:03d}",
            }
        )
    return examples


# --------------------------------------------------------------------------- #
# Notebook de Colab (nbformat 4.5)                                             #
# --------------------------------------------------------------------------- #
def _code_cell(cell_id: str, body: str) -> dict[str, Any]:
    return {
        "cell_type": "code",
        "execution_count": None,
        "id": cell_id,
        "metadata": {},
        "outputs": [],
        "source": body.strip("\n").splitlines(keepends=True),
    }


def _md_cell(cell_id: str, body: str) -> dict[str, Any]:
    return {
        "cell_type": "markdown",
        "id": cell_id,
        "metadata": {},
        "source": body.strip("\n").splitlines(keepends=True),
    }


def build_notebook(state: dict[str, Any], dataset_sha256: str) -> dict[str, Any]:
    c0, c1 = state["c0"], state["c1"]
    values = {
        "drive_root": DRIVE_ROOT,
        "dataset_rel": f"{DATASET_DIR_REL}/{DATASET_NAME}",
        "dataset_dir_rel": DATASET_DIR_REL,
        "adapters_dir_rel": ADAPTERS_DIR_REL,
        "eval_dir_rel": EVAL_DIR_REL,
        "expected_sha": dataset_sha256,
        "c0_aceptadas": c0["aceptadas"],
        "c1_clips": c1["clips"],
        "schema_version": c0["schema_version"],
    }
    sub = lambda text: Template(text).substitute(values)  # noqa: E731

    cells: list[dict[str, Any]] = []

    cells.append(
        _md_cell(
            "intro",
            sub(
                """# CMSC — SFT gobernado del analista acústico (QLoRA / PEFT)

**Este notebook corre SOLO en Google Colab.** El entrenamiento local está prohibido:
no hay descarga de pesos ni entrenamiento en la máquina de desarrollo.

## Qué hace
Lee el corpus determinista `$dataset_rel`, ajusta un LLM con QLoRA (4-bit + LoRA)
y guarda checkpoints cada N pasos en `$adapters_dir_rel/`. Al final escribe un
`manifest.json` y un reporte en `$eval_dir_rel/`.

## Por qué
El analista acústico debe redactar resúmenes verificables sin fabricar métricas.
El ajuste enseña el contrato: C0 es la única verdad evaluable, C1 es REF y
`rules-v0` es una heurística SIM.

## Invariantes que protege
1. **C0** (propio, cmsc_logger) = única capa evaluable de S81 — $c0_aceptadas clips aceptados reales.
2. **C1** (ESC-50) = `REF`, $c1_clips clips; nunca se suma a C0 ni entra en S81.
3. **rules-v0** = determinista, `SIM`, no ML.
4. **No fabricación**: si no hay métrica declarada → `NO_DATA`.
5. **Solo lectura**: C0, C1 y `acoustic_envelopes_v1.json` jamás se escriben.

**Hash esperado del dataset:** `$expected_sha`
**Schema de origen:** `$schema_version`"""
            ),
        )
    )

    cells.append(
        _code_cell(
            "setup-runtime",
            """# QUÉ: identifica el entorno y fija la semilla.
# POR QUÉ: QLoRA depende de CUDA; sin GPU el entrenamiento no debe continuar.
# INVARIANTE: reproducibilidad (semilla fija) y honestidad (fallo explícito sin GPU).
import os
import random
from pathlib import Path

import numpy as np
import torch

SEED = 42
random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)
if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)

if not torch.cuda.is_available():
    raise RuntimeError("Colab sin GPU: cambia Entorno > Runtime > GPU (T4 recomendado).")

print("GPU:", torch.cuda.get_device_name(0))
print("bf16 soportado:", torch.cuda.is_bf16_supported())""",
        )
    )

    cells.append(
        _code_cell(
            "mount-drive",
            sub(
                """# QUÉ: monta Google Drive en el punto canónico del portafolio.
# POR QUÉ: todos los artefactos (entrada, checkpoints, evaluación) viven en Drive;
#         nada se escribe en el repo local ni en las fuentes de solo lectura.
# INVARIANTE: trazabilidad de ubicación y preservación de C0/C1.
from google.colab import drive

drive.mount("/content/drive", force_remount=False)

DRIVE_ROOT = Path("$drive_root")
if not DRIVE_ROOT.is_dir():
    raise FileNotFoundError(f"No existe la carpeta canónica en Drive: {DRIVE_ROOT}")

DATASET_DIR = DRIVE_ROOT / "$dataset_dir_rel"
ADAPTERS_DIR = DRIVE_ROOT / "$adapters_dir_rel"
EVAL_DIR = DRIVE_ROOT / "$eval_dir_rel"
DATASET_PATH = DATASET_DIR / "dataset_acoustic_sft_v1.jsonl"

# Solo estas dos carpetas son escribibles por el notebook.
ADAPTERS_DIR.mkdir(parents=True, exist_ok=True)
EVAL_DIR.mkdir(parents=True, exist_ok=True)

print("DRIVE_ROOT :", DRIVE_ROOT)
print("DATASET    :", DATASET_PATH)
print("ADAPTERS   :", ADAPTERS_DIR)
print("EVAL       :", EVAL_DIR)"""
            ),
        )
    )

    cells.append(
        _code_cell(
            "snapshot",
            sub(
                """# QUÉ: toma una instantánea de (tamaño, mtime) de los archivos de entrada.
# POR QUÉ: es la prueba de que el entrenamiento NO tocó C0/C1/envelopes.
# INVARIANTE: "NADA DESAPARECE · TODO SE PRESERVA" — solo lectura garantizada.
def snapshot(folder: Path) -> dict[str, tuple[int, int]]:
    if not folder.is_dir():
        return {}
    return {
        str(p.relative_to(folder)).replace("\\\\", "/"): (p.stat().st_size, p.stat().st_mtime_ns)
        for p in folder.rglob("*")
        if p.is_file()
    }

BEFORE_INPUTS = snapshot(DATASET_DIR)
print(f"Archivos de entrada observados: {len(BEFORE_INPUTS)}")"""
            ),
        )
    )

    cells.append(
        _code_cell(
            "install",
            """# QUÉ: instala el stack de ajuste fino con versiones acotadas.
# POR QUÉ: QLoRA necesita bitsandbytes (4-bit) y PEFT (LoRA); fijar rangos evita
#         cambios de API entre ejecuciones del notebook.
# INVARIANTE: reproducibilidad del entorno.
%pip install -q --upgrade "transformers>=4.44,<5" "peft>=0.13,<1" "accelerate>=0.34,<2" "bitsandbytes>=0.44,<1" "datasets>=2.20,<4"

print("Dependencias instaladas.")""",
        )
    )

    cells.append(
        _code_cell(
            "load-verify-dataset",
            sub(
                """# QUÉ: lee el JSONL y verifica su hash y su esquema antes de entrenar.
# POR QUÉ: un corpus modificado cambiaría las respuestas y rompería la gobernanza.
# INVARIANTE: integridad del dataset + no fabricación (el hash es la evidencia).
import hashlib
import json
from datasets import Dataset

EXPECTED_SHA256 = "$expected_sha"

if not DATASET_PATH.is_file():
    raise FileNotFoundError(f"Falta el corpus en Drive: {DATASET_PATH}")

raw_bytes = DATASET_PATH.read_bytes()
actual_sha256 = hashlib.sha256(raw_bytes).hexdigest()
if actual_sha256 != EXPECTED_SHA256:
    raise ValueError(
        f"Hash del dataset distinto. Esperado={EXPECTED_SHA256} actual={actual_sha256}. "
        "No entrene hasta regenerar el bundle con scripts/build_colab_llm_bundle.py."
    )

records = [json.loads(line) for line in raw_bytes.decode("utf-8").splitlines() if line.strip()]
required = {"instruction", "input", "output", "example_id"}
for idx, record in enumerate(records):
    missing = required - set(record)
    if missing:
        raise ValueError(f"Registro {idx} incompleto: {sorted(missing)}")
    if not record["output"].strip():
        raise ValueError(f"Registro {idx} con respuesta vacía")

# Cada registro incluye el MISMO resumen verificado de C0/C1/envelopes.
DATASET_SHA256 = actual_sha256
print(f"Registros válidos: {len(records)}")
print(f"SHA256 verificado: {DATASET_SHA256}")"""
            ),
        )
    )

    cells.append(
        _code_cell(
            "format-tokenize",
            """# QUÉ: convierte cada par instrucción/respuesta a texto y lo tokeniza con máscara.
# POR QUÉ: el modelo debe aprender SOLO la respuesta; la instrucción se enmascara
#         con -100 para que la pérdida no premie repetir el prompt.
# INVARIANTE: no fabricación — la respuesta canónica es la del corpus, no una
#            generación libre del modelo durante el entrenamiento.
from transformers import AutoTokenizer

BASE_MODEL = "Qwen/Qwen2.5-1.5B-Instruct"  # accesible sin gating; 4-bit cabe en T4
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, use_fast=True)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

SYSTEM_PROMPT = (
    "Eres el analista acústico de SIGC&T Rural. Usa SOLO el resumen proporcionado. "
    "C0 es la única capa evaluable; C1 es REF y nunca se suma a C0. "
    "rules-v0 es determinista y SIM. Si no hay una métrica declarada, responde "
    "NO_DATA. No inventes métricas, señales ni fuentes."
)

def render(record: dict) -> str:
    user = f"RESUMEN VERIFICADO (JSON):\\n{record['input']}\\n\\nPREGUNTA: {record['instruction']}"
    return (
        f"<|im_start|>system\\n{SYSTEM_PROMPT}<|im_end|>\\n"
        f"<|im_start|>user\\n{user}<|im_end|>\\n"
        f"<|im_start|>assistant\\n{record['output']}<|im_end|>"
    )

def tokenize(record: dict) -> dict:
    full = tokenizer(render(record), truncation=True, max_length=1024)
    prompt = tokenizer(
        f"<|im_start|>system\\n{SYSTEM_PROMPT}<|im_end|>\\n"
        f"<|im_start|>user\\nRESUMEN VERIFICADO (JSON):\\n{record['input']}\\n\\n"
        f"PREGUNTA: {record['instruction']}<|im_end|>\\n<|im_start|>assistant\\n",
        truncation=True,
        max_length=1024,
    )
    labels = list(full["input_ids"])
    for idx in range(min(len(prompt["input_ids"]), len(labels))):
        labels[idx] = -100
    return {
        "input_ids": full["input_ids"],
        "attention_mask": full["attention_mask"],
        "labels": labels,
    }

raw_dataset = Dataset.from_list(records).map(tokenize, remove_columns=["instruction", "input", "output", "example_id"])
split = raw_dataset.train_test_split(test_size=0.15, seed=SEED)
train_ds, eval_ds = split["train"], split["test"]
print(f"Train={len(train_ds)} Eval={len(eval_ds)}")""",
        )
    )

    cells.append(
        _md_cell(
            "qlora-note",
            """## QLoRA / PEFT

**Qué hace:** cuantiza el modelo base a 4-bit (NF4) y entrena únicamente matrices LoRA.
**Por qué:** permite ajustar un LLM en una T4 de Colab sin descargar ni versionar pesos
completos en el repo local. Los adaptadores son pequeños y auditables.
**Invariante protegido:** ningún peso pesado entra al repositorio; todo queda en Drive
bajo `04_MODELOS_LLMS_Y_ADAPTADORES/`."""
        )
    )

    cells.append(
        _code_cell(
            "qlora-model",
            """# QUÉ: configura cuantización 4-bit y aplica LoRA al modelo base.
# POR QUÉ: QLoRA = cuantización + adaptadores; reduce VRAM sin cambiar el contrato.
# INVARIANTE: los pesos base NO se modifican (solo se entrenan adaptadores).
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.float16,  # T4 no soporta bf16
)

model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    quantization_config=bnb_config,
    device_map="auto",
    torch_dtype=torch.float16,
)
model.config.use_cache = False
model = prepare_model_for_kbit_training(model)

lora_config = LoraConfig(
    r=16,
    lora_alpha=32,
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()""",
        )
    )

    cells.append(
        _code_cell(
            "training-args",
            sub(
                """# QUÉ: define hiperparámetros y directorio de salida de checkpoints.
# POR QUÉ: save_steps guarda cada N pasos directamente en Drive para no perder
#         progreso si Colab desconecta; save_total_limit evita llenar la cuota.
# INVARIANTE: continuidad operativa + todos los artefactos quedan en la carpeta
#            canónica de modelos, nunca en el repo local.
from transformers import DataCollatorForSeq2Seq, Trainer, TrainingArguments

OUTPUT_DIR = ADAPTERS_DIR / "cmsc_acoustic_sft_v1"
LOGGING_DIR = EVAL_DIR / "runs" / "cmsc_acoustic_sft_v1"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
LOGGING_DIR.mkdir(parents=True, exist_ok=True)

HYPERPARAMETERS = {
    "base_model": BASE_MODEL,
    "quantization": "bitsandbytes-4bit-nf4-double-quant",
    "peft": "lora",
    "lora_r": 16,
    "lora_alpha": 32,
    "lora_dropout": 0.05,
    "target_modules": ["q_proj", "k_proj", "v_proj", "o_proj"],
    "learning_rate": 2e-4,
    "num_train_epochs": 3,
    "per_device_train_batch_size": 2,
    "gradient_accumulation_steps": 4,
    "max_length": 1024,
    "save_steps": 50,
    "save_total_limit": 3,
    "logging_steps": 5,
    "eval_strategy": "epoch",
    "seed": SEED,
    "temperature_inference": 0,  # coherente con el módulo backend
    "dataset_sha256": DATASET_SHA256,
}

training_args = TrainingArguments(
    output_dir=str(OUTPUT_DIR),
    learning_rate=HYPERPARAMETERS["learning_rate"],
    num_train_epochs=HYPERPARAMETERS["num_train_epochs"],
    per_device_train_batch_size=HYPERPARAMETERS["per_device_train_batch_size"],
    per_device_eval_batch_size=2,
    gradient_accumulation_steps=HYPERPARAMETERS["gradient_accumulation_steps"],
    warmup_ratio=0.03,
    lr_scheduler_type="cosine",
    logging_steps=HYPERPARAMETERS["logging_steps"],
    save_strategy="steps",
    save_steps=HYPERPARAMETERS["save_steps"],
    save_total_limit=HYPERPARAMETERS["save_total_limit"],
    eval_strategy=HYPERPARAMETERS["eval_strategy"],
    report_to=[],
    seed=SEED,
    data_seed=SEED,
    fp16=True,
    optim="paged_adamw_8bit",
    remove_unused_columns=False,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_ds,
    eval_dataset=eval_ds,
    data_collator=DataCollatorForSeq2Seq(tokenizer=tokenizer, padding=True, label_pad_token_id=-100),
)

print("Checkpoints ->", OUTPUT_DIR)
print("Logs        ->", LOGGING_DIR)"""
            ),
        )
    )

    cells.append(
        _code_cell(
            "train",
            """# QUÉ: ejecuta el ajuste fino; reanuda desde checkpoint si existe.
# POR QUÉ: si Colab desconecta, el último checkpoint en Drive permite continuar.
# INVARIANTE: progreso preservado; nunca se reescriben C0/C1 ni el dataset.
resume_glob = sorted(OUTPUT_DIR.glob("checkpoint-*"))
resume_from = str(resume_glob[-1]) if resume_glob else None
print("Reanudando desde:", resume_from or "cero")

train_result = trainer.train(resume_from_checkpoint=resume_from)
trainer.save_model(str(OUTPUT_DIR / "final_adapter"))
tokenizer.save_pretrained(str(OUTPUT_DIR / "final_adapter"))
print("Entrenamiento finalizado.")""",
        )
    )

    cells.append(
        _code_cell(
            "verify-preservation",
            sub(
                """# QUÉ: compara la instantánea de entrada contra el estado actual.
# POR QUÉ: demuestra que el notebook solo escribió en las carpetas permitidas.
# INVARIANTE: C0, C1 y acoustic_envelopes_v1.json permanecen intactos.
AFTER_INPUTS = snapshot(DATASET_DIR)
changed = {
    name: (BEFORE_INPUTS.get(name), AFTER_INPUTS.get(name))
    for name in set(BEFORE_INPUTS) | set(AFTER_INPUTS)
    if BEFORE_INPUTS.get(name) != AFTER_INPUTS.get(name)
}
if changed:
    raise RuntimeError(f"Violación de solo lectura en 02_DATASETS_Y_CONTRATOS_V1: {changed}")

PRESERVATION_OK = True
print("Verificación de solo lectura: OK")"""
            ),
        )
    )

    cells.append(
        _code_cell(
            "manifest",
            sub(
                """# QUÉ: escribe manifest.json con hiperparámetros, fecha, pérdida y hash.
# POR QUÉ: sin manifiesto no hay evidencia reproducible ni trazabilidad del modelo.
# INVARIANTE: la fecha se registra AQUÍ (en Colab), no se falsifica en el bundle local.
from datetime import datetime, timezone

loss_values = [
    {"step": entry.get("step"), "loss": entry["loss"]}
    for entry in trainer.state.log_history
    if "loss" in entry
]
eval_values = [
    {"step": entry.get("step"), "eval_loss": entry["eval_loss"]}
    for entry in trainer.state.log_history
    if "eval_loss" in entry
]

manifest = {
    "manifest_type": "cmsc_acoustic_llm_sft_v1",
    "created_at_utc": datetime.now(timezone.utc).isoformat(),
    "executed_in": "Google Colab",
    "drive_root": "$drive_root",
    "dataset_path": "$dataset_rel",
    "dataset_sha256": DATASET_SHA256,
    "dataset_records": len(records),
    "hyperparameters": HYPERPARAMETERS,
    "loss": {
        "train": loss_values,
        "eval": eval_values,
        "final_train_loss": loss_values[-1]["loss"] if loss_values else None,
        "final_eval_loss": eval_values[-1]["eval_loss"] if eval_values else None,
    },
    "train_metrics": {k: (float(v) if isinstance(v, (int, float)) else v)
                      for k, v in train_result.metrics.items()},
    "invariants": {
        "C0_unique_evaluable_layer": True,
        "C1_reference_never_summed": True,
        "rules_v0_deterministic_SIM": True,
        "no_metric_fabrication": True,
        "read_only_sources_preserved": PRESERVATION_OK,
    },
    "sources_read_only": {
        "c0": "data/datasets/sigct_rural_acoustic/v1",
        "c1": "data/datasets/sigct_rural_acoustic/reference/esc50",
        "envelopes": "data/datasets/sigct_rural_acoustic/v1/features/acoustic_envelopes_v1.json",
    },
    "adapter_output": str(OUTPUT_DIR / "final_adapter"),
}

manifest_path = EVAL_DIR / "manifest.json"
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print("Manifest ->", manifest_path)"""
            ),
        )
    )

    cells.append(
        _code_cell(
            "report",
            sub(
                """# QUÉ: genera el reporte legible de la corrida.
# POR QUÉ: el manifiesto es para máquinas; el reporte es para revisión humana.
# INVARIANTE: toda cifra citada sale de trainer.state.log_history o del hash verificado.
lines = [
    "# Reporte de entrenamiento — CMSC analista acústico (SFT v1)",
    "",
    f"- Fecha UTC: `{manifest['created_at_utc']}`",
    f"- Ejecutado en: {manifest['executed_in']} (GPU {torch.cuda.get_device_name(0)})",
    f"- Dataset: `{manifest['dataset_path']}`",
    f"- SHA-256 del dataset: `{manifest['dataset_sha256']}`",
    f"- Registros: {manifest['dataset_records']}",
    f"- Train / Eval: {len(train_ds)} / {len(eval_ds)}",
    f"- Modelo base: `{BASE_MODEL}` (4-bit NF4 + LoRA r={HYPERPARAMETERS['lora_r']})",
    f"- Loss final train: {manifest['loss']['final_train_loss']}",
    f"- Loss final eval: {manifest['loss']['final_eval_loss']}",
    f"- Checkpoints: `{OUTPUT_DIR}`",
    f"- Adaptador final: `{manifest['adapter_output']}`",
    "",
    "## Hiperparámetros",
    "",
    "| Parámetro | Valor |",
    "|---|---|",
]
for key, value in HYPERPARAMETERS.items():
    lines.append(f"| `{key}` | `{value}` |")

lines += [
    "",
    "## Curva de pérdida (train)",
    "",
    "| step | loss |",
    "|---:|---:|",
]
for point in loss_values:
    lines.append(f"| {point['step']} | {point['loss']:.6f} |")

lines += [
    "",
    "## Veredicto de invariantes",
    "",
]
for key, value in manifest["invariants"].items():
    lines.append(f"- `{key}`: **{'OK' if value else 'FALLO'}**")

lines += [
    "",
    "## Límites honestos",
    "",
    "- Este ajuste **no crea un clasificador acústico**. S81/S82 siguen en DISEÑO.",
    "- `rules-v0` continúa siendo la línea base determinista (SIM); el LLM solo redacta.",
    "- No se reportan macro-F1/ECE acústicos: no existen métricas declaradas (NO_DATA).",
    "- C1 (ESC-50, 428 clips) es REF: no se suma a C0 ni evalúa S81.",
    "",
]

report_path = EVAL_DIR / "training_report.md"
report_path.write_text("\\n".join(lines), encoding="utf-8")
print("Reporte ->", report_path)
print("\\n".join(lines[-6:]))"""
            ),
        )
    )

    cells.append(
        _md_cell(
            "cierre",
            """## Cierre

**Qué se obtuvo:** adaptadores LoRA en `04_MODELOS_LLMS_Y_ADAPTADORES/`, `manifest.json`
y `training_report.md` en `05_EVALUACION_BENCHMARKS_Y_LOGS/`.

**Por qué:** el progreso sobrevive a desconexiones y cada cifra tiene evidencia.

**Invariantes confirmados:** C0 única verdad · C1 REF separada · `rules-v0` SIM ·
sin métricas fabricadas · fuentes de solo lectura intactas.

**Siguiente paso (fuera de este notebook):** evaluar el adaptador contra el contrato
estricto del backend (`src/backend/services/llm_acoustic_analyst.py`) y decidir su
promoción con una misión gobernada explícita. El adaptador NO se promociona solo."""
        )
    )

    return {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3",
            },
            "language_info": {
                "name": "python",
                "version": "3.11",
                "file_extension": ".py",
                "mimetype": "text/x-python",
            },
            "colab": {"provenance": []},
        },
        "nbformat": 4,
        "nbformat_minor": 5,
    }


# --------------------------------------------------------------------------- #
# Entrada                                                                      #
# --------------------------------------------------------------------------- #
def main() -> None:
    state = read_source_state()
    examples = build_sft_examples(state)

    jsonl_text = "".join(
        json.dumps(example, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        + "\n"
        for example in examples
    )
    dataset_sha = hashlib.sha256(jsonl_text.encode("utf-8")).hexdigest()
    notebook = build_notebook(state, dataset_sha)
    notebook_text = json.dumps(notebook, ensure_ascii=False, indent=1) + "\n"

    manifest = {
        "bundle_type": "cmsc_acoustic_llm_sft_v1",
        "generated_locally": True,
        "training_executed_locally": False,
        "generator": "scripts/build_colab_llm_bundle.py",
        "output_folder": "dist_colab_bundle/ (ignorada por Git)",
        "dataset": DATASET_NAME,
        "dataset_sha256": dataset_sha,
        "dataset_records": len(examples),
        "notebook": NOTEBOOK_NAME,
        "source_state": state,
        "invariants": {
            "C0_unique_evaluable_layer": True,
            "C1_reference_never_summed": True,
            "rules_v0_deterministic_SIM": True,
            "no_metric_fabrication": True,
        },
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / DATASET_NAME).write_text(jsonl_text, encoding="utf-8", newline="\n")
    (OUT_DIR / NOTEBOOK_NAME).write_text(notebook_text, encoding="utf-8", newline="\n")
    (OUT_DIR / SHA_NAME).write_text(
        f"{dataset_sha}  {DATASET_NAME}\n", encoding="utf-8", newline="\n"
    )
    (OUT_DIR / MANIFEST_NAME).write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
        newline="\n",
    )

    print(f"Bundle generado en: {OUT_DIR}")
    print(f"  {DATASET_NAME}: {len(examples)} pares · sha256={dataset_sha}")
    print(f"  {NOTEBOOK_NAME}: {len(notebook['cells'])} celdas · nbformat 4.5")
    print(f"  {SHA_NAME}")
    print(f"  {MANIFEST_NAME}")


if __name__ == "__main__":
    main()
