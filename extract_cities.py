import pandas as pd
import json

file = r"c:/Users/Celso/Downloads/logmed-rp---fleet-management/legacy_spreadsheets/ROTAS RIB. PRETO - EXEMPLO.xlsx"
df = pd.read_excel(file, sheet_name='ACRÉSCIMOS')

cities = []
for index, row in df.iterrows():
    name = row['CIDADES']
    value = row['VALOR ADICIONAL R$']
    
    if pd.notna(name) and pd.notna(value):
        # Clean up name if needed (e.g. remove extra spaces)
        name = str(name).strip()
        try:
            value = float(value)
            cities.append({"name": name, "value": value})
        except ValueError:
            continue

print(json.dumps(cities, indent=2))
