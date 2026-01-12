import pandas as pd
import sys

def analyze_excel(file_path):
    try:
        print(f"\n{'='*60}")
        print(f"Analyzing: {file_path}")
        print(f"{'='*60}")
        
        xl = pd.ExcelFile(file_path)
        print(f"\nSheets found: {xl.sheet_names}")
        
        for sheet_name in xl.sheet_names:
            print(f"\n--- Sheet: {sheet_name} ---")
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            print(f"Columns: {df.columns.tolist()}")
            print(f"Rows: {len(df)}")
            print(f"\nFirst 5 rows:")
            print(df.head(5).to_string())
            print("\n")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze_excel('legacy_spreadsheets/ROTA - 19-12.xlsx')
    analyze_excel('legacy_spreadsheets/ROTA CARLOS.xlsx')
