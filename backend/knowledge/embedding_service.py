import logging
from abc import ABC, abstractmethod
from typing import List, Optional
import numpy as np
from backend.config import settings

logger = logging.getLogger("nagriklens.knowledge.embedding")

class BaseEmbeddingService(ABC):
    """Abstract contract for text embeddings."""

    @property
    @abstractmethod
    def dimension(self) -> int:
        pass

    @property
    @abstractmethod
    def model_name(self) -> str:
        pass

    @abstractmethod
    def encode_documents(self, texts: List[str]) -> np.ndarray:
        """Encodes list of documents into L2-normalized float32 2D array (N, D)."""
        pass

    @abstractmethod
    def encode_query(self, query: str) -> np.ndarray:
        """Encodes a single query into L2-normalized float32 1D vector (D,)."""
        pass

def l2_normalize(vectors: np.ndarray) -> np.ndarray:
    """Applies strict L2-normalization along axis 1 (or axis 0 for 1D)."""
    if vectors.ndim == 1:
        norm = np.linalg.norm(vectors)
        if norm == 0:
            return vectors
        return (vectors / norm).astype(np.float32)
    elif vectors.ndim == 2:
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        return (vectors / norms).astype(np.float32)
    else:
        raise ValueError("Vectors must be 1D or 2D array.")

class SentenceTransformerEmbeddingService(BaseEmbeddingService):
    """
    SentenceTransformer embedding service using multilingual model.
    Model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (dim=384)
    """

    def __init__(self, model_name: Optional[str] = None):
        self._model_name = model_name or settings.embedding_model
        self._dimension = 384
        self._model = None

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def model_name(self) -> str:
        return self._model_name

    def _get_model(self):
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            logger.info(f"Loading SentenceTransformer model '{self._model_name}'...")
            self._model = SentenceTransformer(self._model_name)
        return self._model

    def encode_documents(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, self.dimension), dtype=np.float32)
        model = self._get_model()
        embeddings = model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        return embeddings.astype(np.float32)

    def encode_query(self, query: str) -> np.ndarray:
        model = self._get_model()
        embedding = model.encode(query, convert_to_numpy=True, normalize_embeddings=True)
        return embedding.astype(np.float32)

class MockEmbeddingService(BaseEmbeddingService):
    """
    Deterministic pseudo-random embedding generator for fast, offline testing without GPU/Torch.
    Generates reproducible L2-normalized float32 vectors based on string hash.
    """

    def __init__(self, model_name: str = "mock-embedding-model", dimension: int = 64):
        self._model_name = model_name
        self._dimension = dimension

    @property
    def dimension(self) -> int:
        return self._dimension

    @property
    def model_name(self) -> str:
        return self._model_name

    def encode_documents(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, self.dimension), dtype=np.float32)
        arr = np.zeros((len(texts), self.dimension), dtype=np.float32)
        for i, txt in enumerate(texts):
            seed = abs(hash(txt)) % (2**31)
            rng = np.random.RandomState(seed)
            vec = rng.randn(self.dimension).astype(np.float32)
            arr[i] = l2_normalize(vec)
        return arr

    def encode_query(self, query: str) -> np.ndarray:
        seed = abs(hash(query)) % (2**31)
        rng = np.random.RandomState(seed)
        vec = rng.randn(self.dimension).astype(np.float32)
        return l2_normalize(vec)

_default_embedding_service: Optional[BaseEmbeddingService] = None

def get_embedding_service() -> BaseEmbeddingService:
    global _default_embedding_service
    if _default_embedding_service is None:
        _default_embedding_service = SentenceTransformerEmbeddingService()
    return _default_embedding_service

def set_embedding_service(service: BaseEmbeddingService):
    global _default_embedding_service
    _default_embedding_service = service
