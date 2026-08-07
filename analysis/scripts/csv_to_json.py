"""Convert a CSV file to a JSON array of records (one object per row)."""

import argparse
import json

import pandas as pd

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--csv_file', type=str, required=True)
parser.add_argument('--json_file', type=str, required=True)
args = parser.parse_args()

df = pd.read_csv(args.csv_file)
# orient='records' → [{col: val, ...}, ...]; NaN → null in JSON
records = json.loads(df.to_json(orient='records'))

with open(args.json_file, 'w') as f:
    json.dump(records, f, indent=2)
    f.write('\n')

print(f'Wrote {len(records)} records to {args.json_file}')
