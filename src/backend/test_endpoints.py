
import requests

BASE_URL = "http://127.0.0.1:8000/api"

print("=== Probando endpoints ===")

# 1. Telemetry V1
print("\n1. Probando /telemetry/history/...")
try:
    r = requests.get(f"{BASE_URL}/telemetry/history/")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        print(f"   Response: {r.json()}")
    else:
        print(f"   Text: {r.text}")
except Exception as e:
    print(f"   Error: {e}")

# 2. Telemetry V2
print("\n2. Probando /v2/telemetry/history/...")
try:
    r = requests.get(f"{BASE_URL}/v2/telemetry/history/")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        print(f"   Response: {r.json()}")
    else:
        print(f"   Text: {r.text}")
except Exception as e:
    print(f"   Error: {e}")

# 3. Telemetry V3
print("\n3. Probando /v3/telemetry/history/...")
try:
    r = requests.get(f"{BASE_URL}/v3/telemetry/history/")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        print(f"   Response: {r.json()}")
    else:
        print(f"   Text: {r.text}")
except Exception as e:
    print(f"   Error: {e}")

# 4. AI V2
print("\n4. Probando /v2/ai/crop-advice/...")
try:
    r = requests.get(f"{BASE_URL}/v2/ai/crop-advice/")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        print(f"   Response: {r.json()}")
    else:
        print(f"   Text: {r.text}")
except Exception as e:
    print(f"   Error: {e}")

# 5. AI V3
print("\n5. Probando /v3/ai/crop-advice/...")
try:
    r = requests.get(f"{BASE_URL}/v3/ai/crop-advice/")
    print(f"   Status: {r.status_code}")
    if r.status_code == 200:
        print(f"   Response: {r.json()}")
    else:
        print(f"   Text: {r.text}")
except Exception as e:
    print(f"   Error: {e}")

print("\n=== Pruebas completadas ===")
