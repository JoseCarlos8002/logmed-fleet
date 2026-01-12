import pandas as pd

print("="*60)
print("ROTA - 19-12.xlsx")
print("="*60)
df1 = pd.read_excel('legacy_spreadsheets/ROTA - 19-12.xlsx')
print("Columns:")
for i, col in enumerate(df1.columns):
    print(f"  {i}: {col}")
print(f"\nTotal rows: {len(df1)}")

print("\n" + "="*60)
print("ROTA CARLOS.xlsx")
print("="*60)
df2 = pd.read_excel('legacy_spreadsheets/ROTA CARLOS.xlsx')
print("Columns:")
for i, col in enumerate(df2.columns):
    print(f"  {i}: {col}")
print(f"\nTotal rows: {len(df2)}")
