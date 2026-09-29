import json
import sys
from pathlib import Path

import numpy as np

from app.services.vector_store import VectorStore


class FakeIndex:
    def __init__(self, ntotal=0):
        self.ntotal = ntotal

    def add(self, _vectors):
        self.ntotal += 1

    def search(self, _query, _top_k):
        return np.array([[0.75]], dtype="float32"), np.array([[0]], dtype="int64")


class FakeFaiss:
    @staticmethod
    def IndexFlatIP(_dimension):
        return FakeIndex()

    @staticmethod
    def read_index(_path):
        return FakeIndex(ntotal=1)

    @staticmethod
    def write_index(_index, path):
        Path(path).write_bytes(b"index")


def test_vector_store_restores_evidence_ids_with_persisted_index(tmp_path, monkeypatch):
    index_path = tmp_path / "index.bin"
    monkeypatch.setattr("app.services.vector_store.settings.FAISS_INDEX_PATH", str(index_path))
    monkeypatch.setitem(sys.modules, "faiss", FakeFaiss)

    first_store = VectorStore()
    first_store.add_vector(np.array([1.0] + [0.0] * 383, dtype="float32"), "ke-001")
    assert json.loads(first_store.metadata_path.read_text(encoding="utf-8")) == ["ke-001"]

    reloaded_store = VectorStore()
    results = reloaded_store.search(np.array([1.0] + [0.0] * 383, dtype="float32"), top_k=1)

    assert reloaded_store.id_to_evidence_id == ["ke-001"]
    assert results == [("ke-001", 0.75)]