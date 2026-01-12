import pandas as pd

file = r"c:/Users/Celso/Downloads/logmed-rp---fleet-management/legacy_spreadsheets/ROTAS RIB. PRETO - EXEMPLO.xlsx"
df = pd.read_excel(file, sheet_name='ACRÉSCIMOS')
print(df.head(10).to_string())
print("\nColumns:", df.columns.tolist())
