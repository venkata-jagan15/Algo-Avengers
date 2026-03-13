import zipfile
import io

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    extracted_text = ""
    if filename.endswith(".pdf"):
        # Skipped for now
        pass
    elif filename.endswith(".zip"):
        try:
            with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
                for file_info in z.infolist():
                    if file_info.is_dir(): continue
                    valid_exts = [".txt", ".md", ".py", ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".java", ".cpp", ".c"]
                    if not any(file_info.filename.lower().endswith(ext) for ext in valid_exts):
                        continue
                    with z.open(file_info) as f:
                        content = f.read().decode('utf-8', errors='ignore')
                        extracted_text += f"\n--- File: {file_info.filename} ---\n{content[:5000]}\n"
        except Exception as e:
            print(f"Failed to parse ZIP: {e}")
    return extracted_text

# Create a test zip
buf = io.BytesIO()
with zipfile.ZipFile(buf, 'w') as z:
    z.writestr("test.py", "print('hello world')")
    z.writestr("test.txt", "this is a test")
    z.writestr("subdir/main.js", "console.log('test')")

test_bytes = buf.getvalue()
print(f"Extracted for .zip: {extract_text_from_file(test_bytes, 'test.zip')}")
print(f"Extracted for .ZIP: {extract_text_from_file(test_bytes, 'test.ZIP')}")
