import requests

def test_get_projects():
    url = "http://localhost:8000/projects"
    try:
        response = requests.get(url)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()[:2]}...") # Only print first two projects
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_get_projects()
