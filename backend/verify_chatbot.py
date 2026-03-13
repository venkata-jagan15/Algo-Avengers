import requests

def test_project_chat():
    project_id = "ce5c2bf0-c78c-4813-ba3d-d1abb2aba71d"
    url = f"http://localhost:8000/projects/{project_id}/chat"
    
    payload = {
        "message": "What is the main goal of this project and what technologies did they use?",
        "history": []
    }
    
    try:
        print(f"Testing chat for project: {project_id}")
        response = requests.post(url, json=payload)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print(f"AI Response: {response.json().get('response')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_project_chat()
