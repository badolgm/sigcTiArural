"""Pruebas del nucleo de identidad de artefactos (L-1).

Corren con stdlib pura, sin Docker, sin TensorFlow y sin Django:

    cd src/ai_models
    python -m unittest test_model_identity -v

Tambien son compatibles con pytest. Incluyen los tres casos negativos que
sostienen el diseno fail-closed: hash desconocido, class_space inconsistente y
ausencia de artefacto.
"""

import tempfile
import unittest
from pathlib import Path

import model_identity as mi

PRODUCTION_DIR = Path(__file__).resolve().parent / "production_models"
REAL_ARTIFACT = PRODUCTION_DIR / "plant_disease_mbv2.h5"
EXPECTED_SHA256 = "77b0efecd602f95fd31846c3058b4d45e41289155438fbd22738bce0640219c0"

REPO_ROOT = Path(__file__).resolve().parents[2]
M2_ARTIFACT = (
    REPO_ROOT / "benchmark" / "runs" / "M2_efficientnet_b0" / "exports" / "model.onnx"
)
M2_SHA256 = "4bd657b363407d4012f013589a5469dca57b9c5e347a9ea54e1f6e57a3274ec3"


class RealArtifactTests(unittest.TestCase):
    """Identidad del artefacto realmente presente en el repositorio."""

    @classmethod
    def setUpClass(cls):
        if not REAL_ARTIFACT.is_file():
            raise unittest.SkipTest("artefacto real ausente: prueba solo valida en el repo")
        mi.reset_cache()
        cls.identity = mi.compute_identity(PRODUCTION_DIR, output_dim=2)

    def test_hash_matches_known_artifact(self):
        self.assertEqual(mi.hash_file(REAL_ARTIFACT), EXPECTED_SHA256)

    def test_status_is_historico(self):
        self.assertEqual(self.identity["model_status"], mi.STATUS_HISTORICO)

    def test_class_space_is_two(self):
        self.assertEqual(self.identity["class_space"], 2)

    def test_class_labels(self):
        self.assertEqual(self.identity["class_labels"], ["enferma", "sana"])

    def test_artifact_id(self):
        self.assertEqual(self.identity["artifact_id"], "plant_disease_mbv2@77b0efec")

    def test_identity_source_is_registry(self):
        self.assertEqual(self.identity["identity_source"], mi.IDENTITY_SOURCE_REGISTRY)

    def test_scientific_scope_is_binary(self):
        self.assertEqual(self.identity["scientific_scope"], "binary_only")

    def test_superseded_by(self):
        self.assertEqual(self.identity["superseded_by"], "M2_efficientnet_b0_001")

    def test_bytes_and_filename(self):
        self.assertEqual(self.identity["model_file"], "plant_disease_mbv2.h5")
        self.assertEqual(self.identity["model_bytes"], REAL_ARTIFACT.stat().st_size)

    def test_mtime_is_iso_utc(self):
        self.assertRegex(self.identity["model_mtime"], r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")


class M2OnnxArtifactTests(unittest.TestCase):
    """Identidad del ONNX de M2 servido por AI_MODEL_PATH (AI-R3/D-A)."""

    @classmethod
    def setUpClass(cls):
        if not M2_ARTIFACT.is_file():
            raise unittest.SkipTest("ONNX de M2 ausente (artefacto local ignorado por Git)")
        mi.reset_cache()
        cls.identity = mi.compute_identity(
            M2_ARTIFACT.parent, output_dim=16, include_onnx=True, explicit_path=M2_ARTIFACT
        )

    def test_hash_is_registered(self):
        self.assertEqual(mi.hash_file(M2_ARTIFACT), M2_SHA256)
        self.assertIn(M2_SHA256, mi.KNOWN_ARTIFACTS)

    def test_status_is_canonico(self):
        self.assertEqual(self.identity["model_status"], mi.STATUS_CANONICO)

    def test_role_is_challenger_validado(self):
        self.assertEqual(self.identity["role"], "challenger_validado")

    def test_class_space_is_sixteen(self):
        self.assertEqual(self.identity["class_space"], 16)
        self.assertEqual(len(self.identity["class_labels"]), 16)

    def test_class_labels_are_the_exported_map(self):
        self.assertEqual(self.identity["class_labels"], mi.M2_CLASS_LABELS)

    def test_not_superseded_and_scope(self):
        self.assertIsNone(self.identity["superseded_by"])
        self.assertEqual(self.identity["scientific_scope"], "agriculture_multiclass16")

    def test_identity_source_is_registry(self):
        self.assertEqual(self.identity["identity_source"], mi.IDENTITY_SOURCE_REGISTRY)

    def test_artifact_id(self):
        self.assertEqual(self.identity["artifact_id"], "model@4bd657b3")

    def test_wrong_output_dim_is_inconsistente(self):
        identity = mi.compute_identity(
            M2_ARTIFACT.parent, output_dim=2, include_onnx=True, explicit_path=M2_ARTIFACT
        )
        self.assertEqual(identity["model_status"], mi.STATUS_INCONSISTENTE)

    def test_historical_entry_is_unchanged(self):
        historico = mi.KNOWN_ARTIFACTS[EXPECTED_SHA256]
        self.assertEqual(historico["model_status"], mi.STATUS_HISTORICO)
        self.assertEqual(historico["superseded_by"], "M2_efficientnet_b0_001")
        self.assertIsNone(historico.get("role"))


class FailClosedTests(unittest.TestCase):
    """El default nunca es HISTORICO."""

    def test_missing_artifact_is_no_disponible(self):
        with tempfile.TemporaryDirectory() as tmp:
            identity = mi.compute_identity(Path(tmp))
        self.assertEqual(identity["model_status"], mi.STATUS_NO_DISPONIBLE)
        self.assertIsNone(identity["model_sha256"])

    def test_unknown_hash_is_no_declarado(self):
        with tempfile.TemporaryDirectory() as tmp:
            (Path(tmp) / "otro_modelo.h5").write_bytes(b"contenido no registrado")
            identity = mi.compute_identity(Path(tmp), output_dim=4)
        self.assertEqual(identity["model_status"], mi.STATUS_NO_DECLARADO)
        self.assertEqual(identity["identity_source"], mi.IDENTITY_SOURCE_HASH_ONLY)
        self.assertEqual(identity["class_space"], 4)
        self.assertIsNone(identity["superseded_by"])

    def test_class_space_mismatch_is_inconsistente(self):
        if not REAL_ARTIFACT.is_file():
            self.skipTest("artefacto real ausente")
        identity = mi.compute_identity(PRODUCTION_DIR, output_dim=3)
        self.assertEqual(identity["model_status"], mi.STATUS_INCONSISTENTE)

    def test_cache_returns_equal_value(self):
        if not REAL_ARTIFACT.is_file():
            self.skipTest("artefacto real ausente")
        mi.reset_cache()
        first = mi.refresh_model_identity(PRODUCTION_DIR, output_dim=2)
        second = mi.refresh_model_identity(PRODUCTION_DIR, output_dim=2)
        self.assertEqual(first, second)
        self.assertIsNot(first, second)  # copia defensiva, no el objeto cacheado


class NormalizationTests(unittest.TestCase):
    def test_default_is_no_declarado(self):
        self.assertEqual(mi.MODEL_STATUS_DEFAULT, mi.STATUS_NO_DECLARADO)

    def test_unknown_values_fall_closed(self):
        for value in (None, "", "OK", "ok", "real", "false", 42, [], {}):
            with self.subTest(value=value):
                self.assertEqual(mi.normalize_status(value), mi.STATUS_NO_DECLARADO)

    def test_enum_is_case_insensitive(self):
        self.assertEqual(mi.normalize_status("historico"), mi.STATUS_HISTORICO)
        self.assertEqual(mi.normalize_status(" Canonico "), mi.STATUS_CANONICO)

    def test_documented_alias_historical(self):
        self.assertEqual(mi.normalize_status("HISTORICAL"), mi.STATUS_HISTORICO)

    def test_no_other_alias_accepted(self):
        self.assertEqual(mi.normalize_status("HISTORIC"), mi.STATUS_NO_DECLARADO)
        self.assertEqual(mi.normalize_status("HISTORY"), mi.STATUS_NO_DECLARADO)

    def test_sha256_normalization(self):
        self.assertEqual(mi.normalize_sha256(EXPECTED_SHA256.upper()), EXPECTED_SHA256)
        self.assertIsNone(mi.normalize_sha256("abc"))
        self.assertIsNone(mi.normalize_sha256(None))
        self.assertIsNone(mi.normalize_sha256("z" * 64))


if __name__ == "__main__":
    unittest.main(verbosity=2)
