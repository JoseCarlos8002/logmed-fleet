import pandas as pd
# from services.supabase import supabase 
# Better to just generate the SQL string and print it, then I use mcp tool to run it.

file = r"c:/Users/Celso/Downloads/logmed-rp---fleet-management/legacy_spreadsheets/ROTAS RIB. PRETO - EXEMPLO.xlsx"
df = pd.read_excel(file, sheet_name='ACRÉSCIMOS')

cities_dict = {}
for index, row in df.iterrows():
    name = row['CIDADES']
    value = row['VALOR ADICIONAL R$']
    
    if pd.notna(name) and pd.notna(value):
        name = str(name).strip().replace("'", "''") # Escape single quotes
        try:
            val = float(value)
            cities_dict[name] = val
        except ValueError:
            continue

values = []
for name, val in cities_dict.items():
    values.append(f"('{name}', {val}, 'fixed', 'SP', 'Geral')")

if values:
    sql = f"INSERT INTO cities (name, value, type, state, region) VALUES {', '.join(values)} ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value;"
    print(sql)
else:
    print("-- No values to insert")
