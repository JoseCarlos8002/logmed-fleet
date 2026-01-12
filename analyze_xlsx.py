import pandas as pd
import os

def analyze_excel(file_path):
    print(f"\n--- Analyzing: {os.path.basename(file_path)} ---")
    try:
        xl = pd.ExcelFile(file_path)
        for sheet_name in xl.sheet_names:
            print(f"\nSheet: {sheet_name}")
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            print("Headers:", df.columns.tolist())
            print("Sample Data (first 3 rows):")
            print(df.head(3).to_string(index=False))
            print("-" * 20)
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    directory = "legacy_spreadsheets"
    for filename in os.listdir(directory):
        if filename.endswith(".xlsx"):
            analyze_excel(os.path.join(directory, filename))
