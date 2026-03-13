import requests
import zipfile
import io

def test_analyze():
    url = "http://localhost:8000/analyze-submission"
    
    # Create a dummy zip
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w') as z:
        z.writestr("project_report.md", "# Project: Smart Irrigation\nThis project uses IoT to save water...")
        z.writestr("main.py", "import sensor\nprint('starting irrigation system')")
    
    buf.seek(0)
    files = {'file': ('test.zip', buf, 'application/zip')}
    data = {'draft_text': 'This is a test project about smart irrigation.'}
    
    try:
        print("Sending request to /analyze-submission...")
        response = requests.post(url, files=files, data=data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_analyze()
