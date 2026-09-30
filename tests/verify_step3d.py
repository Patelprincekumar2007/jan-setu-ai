import urllib.request
import urllib.parse
import json

def test_url(url, desc):
    req = urllib.request.urlopen(url)
    assert req.getcode() == 200, f"Failed {desc}: {req.getcode()}"
    data = json.loads(req.read().decode())
    print(f"PASS: {desc}")
    return data

def main():
    test_url("http://127.0.0.1:8000/health", "Health check")
    ds = test_url("http://127.0.0.1:8000/api/datasets", "List datasets")
    assert len(ds["datasets"]) == 4, f"Expected 4 datasets, got {len(ds['datasets'])}"

    for d in ds["datasets"]:
        d_id = d["dataset_id"]
        test_url(f"http://127.0.0.1:8000/api/datasets/{d_id}", f"Dataset {d_id}")
        recs = test_url(f"http://127.0.0.1:8000/api/datasets/{d_id}/records?limit=5", f"Records {d_id}")
        assert len(recs["records"]) == 5
        q = test_url(f"http://127.0.0.1:8000/api/datasets/{d_id}/quality", f"Quality {d_id}")
        assert q["valid_row_count"] == 25
        assert q["duplicate_count"] == 0

    st = test_url("http://127.0.0.1:8000/api/knowledge/status", "Knowledge status")
    assert st["semantic_faiss"]["evidence_count"] == 100

    queries = [
        ("Water", "water tap connection in rural households"),
        ("Healthcare", "functional primary health clinic availability"),
        ("Sanitation", "solid liquid waste management and odf plus"),
        ("Roads", "all-weather road connectivity for habitations"),
    ]

    for cat, q_text in queries:
        url = f"http://127.0.0.1:8000/api/knowledge/hybrid-search?q={urllib.parse.quote(q_text)}&category={cat}&top_k=2"
        res = test_url(url, f"Hybrid search {cat}")
        assert len(res["results"]) >= 1
        top_res = res["results"][0]
        print(f"  -> {cat} Top result: {top_res['title']} (sim: {top_res['similarity_score']:.3f}, meta_level: {top_res['metadata_match_level']})")

    print("\nALL STEP 3D API ENDPOINTS & RETRIEVAL CONTRACTS VERIFIED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
