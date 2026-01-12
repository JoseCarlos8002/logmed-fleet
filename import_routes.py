import pandas as pd
import json
import os

# Define the file path
file_path = 'legacy_spreadsheets/ROTAS RIB. PRETO - EXEMPLO.xlsx'

def generate_sql():
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found.")
        return

    try:
        # Read the sheet, skipping the first header row which is empty/malformed
        # Based on inspection:
        # Col 1: ROTA
        # Col 2: VALOR FIXO
        # Col 3-10: CIDADES
        df = pd.read_excel(file_path, sheet_name='CIDADES DA ROTA')
        
        # The first row (index 0) contains the headers 'ROTA', 'VALOR FIXO', etc.
        # The data starts from index 1.
        
        sql_statements = []
        
        for index, row in df.iterrows():
            if index == 0: continue # Skip header row
            
            route_id = str(row['Unnamed: 1'])
            if pd.isna(route_id) or route_id == 'nan': continue
            
            # Clean route ID (e.g. 1.1 might be float)
            if route_id.endswith('.0'):
                route_id = route_id[:-2]
                
            value = row['Unnamed: 2']
            if pd.isna(value): value = 0
            
            # Extract cities
            cities_list = []
            # Columns 3 to 10 (indices)
            city_cols = ['Unnamed: 3', 'Unnamed: 4', 'Unnamed: 5', 'Unnamed: 6', 
                         'Unnamed: 7', 'Unnamed: 8', 'Unnamed: 9', 'Unnamed: 10']
            
            for col in city_cols:
                city_name = row.get(col)
                if pd.notna(city_name) and str(city_name).strip() != '':
                    cities_list.append(str(city_name).strip().upper())
            
            if not cities_list:
                continue
                
            origin = cities_list[0]
            destination = cities_list[-1]
            
            # Create JSONB structure for cities
            # Each city object: { name: "CITY", value: 0 }
            cities_json = []
            for city in cities_list:
                cities_json.append({"name": city, "value": 0})
            
            cities_json_str = json.dumps(cities_json, ensure_ascii=False)
            
            # Generate SQL
            # We use ON CONFLICT (id) DO UPDATE to allow re-running
            sql = f"""
            INSERT INTO routes (id, origin, destination, value, cities, status)
            VALUES ('{route_id}', '{origin}', '{destination}', {value}, '{cities_json_str}', 'Ativo')
            ON CONFLICT (id) DO UPDATE SET
                origin = EXCLUDED.origin,
                destination = EXCLUDED.destination,
                value = EXCLUDED.value,
                cities = EXCLUDED.cities,
                status = EXCLUDED.status;
            """
            sql_statements.append(sql.strip())
            
        # Write to file
        with open('import_routes.sql', 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_statements))
            
        print(f"Generated {len(sql_statements)} SQL statements in import_routes.sql")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_sql()
