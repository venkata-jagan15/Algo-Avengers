import rag
import os

def debug():
    dir_path = r'c:\Users\HP\OneDrive\Desktop\MVGR\project\backend\project reports\project reports\stable-refusion'
    context = ""
    for f in os.listdir(dir_path):
        file_path = os.path.join(dir_path, f)
        print(f"Reading {f}...")
        with open(file_path, 'rb') as f_obj:
            text = rag.extract_text_from_file(f_obj.read(), f)
            context += f"\n--- {f} ---\n{text}"
    
    print(f"Total context length: {len(context)}")
    print("Calling LLM...")
    result = rag.analyze_project_files_with_llm(context[:30000])
    print("\nRESULT:")
    import json
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    debug()
