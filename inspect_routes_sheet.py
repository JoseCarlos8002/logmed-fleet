import pandas as pd
import os

# Define the file path
file_path = 'legacy_spreadsheets/Formulário - Fechamento - exemplo.xlsx'

# Check if file exists
if not os.path.exists(file_path):
    print(f"Error: File '{file_path}' not found.")
else:
    try:
        # Read the "CADASTRO" sheet
        df = pd.read_excel(file_path, sheet_name='CADASTRO')
        
        # Print columns and first few rows
        print("Columns:", df.columns.tolist())
        print("\nFirst row as dict:")
        print(df.iloc[0].to_dict())
        print("\nSecond row as dict:")
        print(df.iloc[1].to_dict())
        
    except Exception as e:
        print(f"Error reading Excel file: {e}")
