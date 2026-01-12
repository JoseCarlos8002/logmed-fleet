import pandas as pd
import os

files = [
    r"c:/Users/Celso/Downloads/logmed-rp---fleet-management/legacy_spreadsheets/ROTAS RIB. PRETO - EXEMPLO.xlsx",
    r"c:/Users/Celso/Downloads/logmed-rp---fleet-management/legacy_spreadsheets/Formulário - Fechamento - exemplo.xlsx"
]

for file in files:
    try:
        xl = pd.ExcelFile(file)
        print(f"File: {os.path.basename(file)}")
        print(f"Sheets: {xl.sheet_names}")
    except Exception as e:
        print(f"Error reading {file}: {e}")
