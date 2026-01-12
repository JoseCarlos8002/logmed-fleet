import pandas as pd
import os

def analyze_ficha(file_path):
    print(f"\n--- Detailed Analysis: {os.path.basename(file_path)} ---")
    try:
        xl = pd.ExcelFile(file_path)
        sheet_name = None
        for s in xl.sheet_names:
            if "Ficha" in s:
                sheet_name = s
                break
        
        if sheet_name:
            print(f"\nSheet found: {sheet_name}")
            df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
            print("Form Layout (first 100 rows):")
            for i, row in df.head(100).iterrows():
                # Keep original values including NaNs for layout understanding
                row_data = [str(val) if pd.notna(val) else "" for val in row]
                # Only print if there's at least one non-empty cell
                if any(val != "" for val in row_data):
                    print(f"Row {i:02}: {' | '.join(row_data)}")
            print("-" * 20)
        else:
            print("Sheet containing 'Ficha' not found.")
    except Exception as e:
        print(f"Error reading {file_path}: {e}")

if __name__ == "__main__":
    file_path = os.path.join("legacy_spreadsheets", "Formulário - Fechamento - exemplo.xlsx")
    analyze_ficha(file_path)
