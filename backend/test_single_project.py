import requests
import json

def test_single_project():
    url = "http://localhost:8000/projects"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            projects = response.json()
            if projects:
                print(json.dumps(projects[0], indent=2))
            else:
                print("No projects found.")
        else:
            print(f"Error: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_single_project()
