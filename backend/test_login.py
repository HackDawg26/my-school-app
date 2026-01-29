import requests
import json

# Test teacher login
url = "http://127.0.0.1:8000/api/token/"
data = {
    "email": "teacher.quiz@school.com",
    "password": "teacher123"
}

print("Testing login endpoint...")
print(f"URL: {url}")
print(f"Data: {json.dumps(data, indent=2)}")
print("-" * 60)

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
    print(f"Response Text: {response.text if 'response' in locals() else 'No response'}")
