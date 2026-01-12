import os
from supabase import create_client, Client

# Supabase credentials
url = os.environ.get("VITE_SUPABASE_URL")
key = os.environ.get("VITE_SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

# Missing drivers to insert
missing_drivers = [
    {
        "name": "LKR SERVICOS TRANSPORTES E LOGISTICA LTDA",
        "cpf": "00000000000",
        "cnh": "00000000000",
        "phone": "(00) 00000-0000",
        "status": "active",
        "valor_km": 2.50,
        "valor_ponto": 15.00
    },
    {
        "name": "ANDERSON APARECIDO DE OLIVEIRA",
        "cpf": "00000000000",
        "cnh": "00000000000",
        "phone": "(00) 00000-0000",
        "status": "active",
        "valor_km": 2.50,
        "valor_ponto": 15.00
    },
    {
        "name": "DANIEL DA SILVA PONTES CAMARA",
        "cpf": "00000000000",
        "cnh": "00000000000",
        "phone": "(00) 00000-0000",
        "status": "active",
        "valor_km": 2.50,
        "valor_ponto": 15.00
    },
    {
        "name": "ALEXANDRE MIGUEL",
        "cpf": "00000000000",
        "cnh": "00000000000",
        "phone": "(00) 00000-0000",
        "status": "active",
        "valor_km": 2.50,
        "valor_ponto": 15.00
    },
    {
        "name": "DIONE MACEDO SILVA",
        "cpf": "00000000000",
        "cnh": "00000000000",
        "phone": "(00) 00000-0000",
        "status": "active",
        "valor_km": 2.50,
        "valor_ponto": 15.00
    },
    {
        "name": "KLEBER ROBERTO DA SILVA",
        "cpf": "00000000000",
        "cnh": "00000000000",
        "phone": "(00) 00000-0000",
        "status": "active",
        "valor_km": 2.50,
        "valor_ponto": 15.00
    }
]

try:
    response = supabase.table('drivers').insert(missing_drivers).execute()
    print(f"✓ {len(missing_drivers)} motoristas cadastrados com sucesso!")
    print(response.data)
except Exception as e:
    print(f"✗ Erro ao cadastrar motoristas: {e}")
