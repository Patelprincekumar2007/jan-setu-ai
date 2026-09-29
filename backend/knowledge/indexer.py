import logging
import argparse
from backend.database import SessionLocal, init_db
from backend.public_data.service import PublicDataService
from backend.knowledge.service import KnowledgeService
from backend.knowledge.vector_index import build_vector_index, get_vector_index_status

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("nagriklens.knowledge.indexer")

def main():
    parser = argparse.ArgumentParser(description="NagrikLens AI Vector Index Builder CLI")
    parser.add_argument("--force", action="store_true", help="Force rebuild vector index even if up-to-date")
    parser.add_argument("--dataset-id", type=str, default=None, help="Index a specific dataset ID")
    parser.add_argument("--check-only", action="store_true", help="Only check and output index status")
    args = parser.parse_args()

    init_db()
    db = SessionLocal()

    try:
        # Seed public datasets & knowledge first
        PublicDataService.seed_default_datasets(db)
        KnowledgeService.seed_default_knowledge(db)

        if args.check_only:
            status = get_vector_index_status(db)
            print("Vector Index Status:", status)
            return

        logger.info("Building FAISS vector index from SQLite KnowledgeEvidence records...")
        res = build_vector_index(db, dataset_id=args.dataset_id)
        logger.info(f"Vector index built successfully! Indexed count: {res.get('evidence_count')}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
