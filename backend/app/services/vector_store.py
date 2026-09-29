import os
import logging
import numpy as np
from pathlib import Path
from app.config import settings

logger = logging.getLogger(__name__)

class VectorStore:
    def __init__(self):
        self.dimension = 384
        self.index_path = Path(settings.FAISS_INDEX_PATH)
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        self._faiss = None
        self._index = None
        self.id_to_evidence_id = []

    def _init_faiss(self):
        if self._faiss is None:
            try:
                import faiss
                self._faiss = faiss
                if self.index_path.exists():
                    self._index = faiss.read_index(str(self.index_path))
                    logger.info(f"Loaded existing FAISS index from {self.index_path}")
                else:
                    self._index = faiss.IndexFlatIP(self.dimension)
                    logger.info("Initialized new FAISS IndexFlatIP")
            except Exception as e:
                logger.warning(f"FAISS library not available or error: {e}. Vector search running in in-memory cosine fallback mode.")
                self._faiss = "FALLBACK"
                self._index = []  # tuple of (vector, evidence_id)

    def add_vector(self, vector: np.ndarray, evidence_id: str):
        self._init_faiss()
        vector = np.ascontiguousarray(vector.reshape(1, -1).astype("float32"))
        
        if self._faiss == "FALLBACK":
            self._index.append((vector, evidence_id))
            return len(self._index) - 1

        self._index.add(vector)
        self.id_to_evidence_id.append(evidence_id)
        self.save_index()
        return self._index.ntotal - 1

    def search(self, query_vector: np.ndarray, top_k: int = 10) -> list[tuple[str, float]]:
        self._init_faiss()
        query_vector = np.ascontiguousarray(query_vector.reshape(1, -1).astype("float32"))

        if self._faiss == "FALLBACK":
            if not self._index:
                return []
            scores = []
            for vec, ev_id in self._index:
                dot = float(np.dot(query_vector, vec.T)[0][0])
                scores.append((ev_id, dot))
            scores.sort(key=lambda x: x[1], reverse=True)
            return scores[:top_k]

        if self._index.ntotal == 0:
            return []

        actual_k = min(top_k, self._index.ntotal)
        distances, indices = self._index.search(query_vector, actual_k)
        
        results = []
        for idx, dist in zip(indices[0], distances[0]):
            if 0 <= idx < len(self.id_to_evidence_id):
                results.append((self.id_to_evidence_id[idx], float(dist)))
        return results

    def save_index(self):
        if self._faiss not in (None, "FALLBACK") and self._index is not None:
            try:
                self._faiss.write_index(self._index, str(self.index_path))
            except Exception as e:
                logger.error(f"Failed to save FAISS index: {e}")

vector_store = VectorStore()
