import requests
import os

def test_multi_file_analysis():
    url = "http://localhost:8000/analyze-submission"
    
    # Files to test
    pdf_path = r"c:\Users\HP\OneDrive\Desktop\MVGR\project\Movie_Recommendation_System_Overview.pdf"
    zip_path = r"c:\Users\HP\OneDrive\Desktop\MVGR\project\backend\test_report.zip"
    
    files = [
        ('files', ('movie_report.pdf', open(pdf_path, 'rb'), 'application/pdf')),
        ('files', ('test_code.zip', open(zip_path, 'rb'), 'application/zip'))
    ]
    
    data = {
        'draft_text': 'This is a test submission for a movie recommendation system.'
    }
    
    print("Sending multi-file request...")
    try:
        response = requests.post(url, files=files, data=data)
        response.raise_for_status()
        result = response.json()
        
        print("\nAnalysis Result:")
        print(f"Title: {result.get('title')}")
        print(f"Outcome: {result.get('outcome')}")
        print(f"Completion %: {result.get('completion_percentage')}")
        print(f"Tech Stack: {result.get('tech_stack')}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        for _, (name, f, type) in files:
            f.close()

if __name__ == "__main__":
    test_multi_file_analysis()
