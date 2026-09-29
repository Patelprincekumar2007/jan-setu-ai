import logging
import numpy as np
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self.model_name = settings.EMBEDDING_MODEL_NAME
        self._model = None

    def _load_model(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                logger.info(f"Loading SentenceTransformer model: {self.model_name}")
                self._model = SentenceTransformer(self.model_name)
                logger.info("SentenceTransformer model loaded successfully.")
            except Exception as e:
                logger.warning(f"SentenceTransformer not available or failed to load: {e}. Falling back to hash embeddings.")
                self._model = "FALLBACK_HASH"

    def embed_text(self, text: str) -> np.ndarray:
        self._load_model()
        if isinstance(self._model, str) and self._model == "FALLBACK_HASH":
            # Generate reproducible 384-dim dummy vector for fallback
            np.random.seed(hash(text) % (2**32 - 1))
            vec = np.random.randn(384).astype("float32")
            norm = np.linalg.norm(vec)
            return vec / (norm + 1e-10)
        
        vec = self._model.encode(text, convert_to_numpy=True)
        return vec.astype("float32")

    def embed_batch(self, texts: list[str]) -> np.ndarray:
        if not texts:
            return np.empty((0, 384), dtype="float32")
        return np.array([self.embed_text(t) for t in texts], dtype="float32")

embedding_service = EmbeddingService()
