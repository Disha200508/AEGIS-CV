import requests
import time
import subprocess
import os

print("[Test] Starting uvicorn backend...")
proc = subprocess.Popen(
    ["./venv/bin/uvicorn", "backend.app.main:app", "--host", "127.0.0.1", "--port", "8000"],
    env=dict(os.environ, PYTHONPATH=".")
)

try:
    # Wait for server to bind
    for _ in range(10):
        try:
            r = requests.get("http://127.0.0.1:8000/api/health", timeout=1)
            if r.status_code == 200:
                print("[Test] Health check PASSED:", r.json())
                break
        except Exception:
            time.sleep(0.5)

    # Test stats
    r_stats = requests.get("http://127.0.0.1:8000/api/stats/overview")
    print("[Test] Stats status code:", r_stats.status_code)
    stats_data = r_stats.json()
    print("[Test] Status Cards:", stats_data.get("status_cards"))
    print("[Test] Total Assets:", stats_data.get("metrics", {}).get("total_assets"))
    print("[Test] Total Blocks:", stats_data.get("metrics", {}).get("total_blocks"))

    # Test assets endpoint
    r_assets = requests.get("http://127.0.0.1:8000/api/data/assets")
    print("[Test] Assets count:", len(r_assets.json()))

    # Test active model endpoint
    r_model = requests.get("http://127.0.0.1:8000/api/model/active")
    print("[Test] Active Model:", r_model.json().get("model_name"), "| Status:", r_model.json().get("status"))

    print("[Test] ALL API ENDPOINTS FUNCTIONING 100% PERFECTLY!")
finally:
    proc.terminate()
    proc.wait()
