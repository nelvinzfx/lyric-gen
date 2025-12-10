import requests
import sys

try:
    print("Testing API endpoint...")
    r = requests.get("http://localhost:8000/api/v1/search", params={"q": "coldplay yellow"})
    print(f"Status: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        results = data.get("results", [])
        print(f"Found {len(results)} results")
        if results:
            print(f"Sample: {results[0]}")
    else:
        print(f"Error: {r.text}")
except Exception as e:
    print(f"Connection failed: {e}")
