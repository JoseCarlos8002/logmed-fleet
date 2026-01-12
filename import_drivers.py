import pandas as pd
import os

# Define the file path
file_path = 'legacy_spreadsheets/Formulário - Fechamento - exemplo.xlsx'

def generate_sql():
    if not os.path.exists(file_path):
        print(f"Error: File '{file_path}' not found.")
        return

    try:
        # Read the "CADASTRO" sheet
        df = pd.read_excel(file_path, sheet_name='CADASTRO')
        
        sql_statements = []
        
        for index, row in df.iterrows():
            name = row.get('NOME')
            if pd.isna(name) or str(name).strip() == '': continue
            name = str(name).strip().upper()
            
            cnpj = row.get('CNPJ')
            if pd.isna(cnpj): 
                cnpj = 'NULL'
            else:
                # Clean CNPJ (remove . - /)
                cnpj = str(cnpj).replace('.', '').replace('-', '').replace('/', '').strip()
                if cnpj == '': cnpj = 'NULL'
                else: cnpj = f"'{cnpj}'"
            
            plate = row.get('PLACA')
            if pd.isna(plate): 
                plate = 'NULL'
            else:
                plate = str(plate).strip().upper()
                if plate == '': plate = 'NULL'
                else: plate = f"'{plate}'"
            
            # Generate SQL
            # status defaults to 'active'
            # monthly_routes, revenue defaults to 0
            # valor_km, valor_ponto defaults to 0
            
            sql = f"""
            INSERT INTO drivers (name, cnpj_cpf, plate, status, monthly_routes, revenue, valor_km, valor_ponto)
            VALUES ('{name}', {cnpj}, {plate}, 'active', 0, 0, 0, 0)
            ON CONFLICT (name) DO UPDATE SET
                cnpj_cpf = EXCLUDED.cnpj_cpf,
                plate = EXCLUDED.plate;
            """
            sql_statements.append(sql.strip())
            
        # Write to file
        with open('import_drivers.sql', 'w', encoding='utf-8') as f:
            f.write('\n'.join(sql_statements))
            
        print(f"Generated {len(sql_statements)} SQL statements in import_drivers.sql")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    generate_sql()
