import pandas as pd
import json
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('--json_file', type=str, required=True)
parser.add_argument('--csv_file', type=str, required=True)
args = parser.parse_args()

with open(args.json_file, 'r') as f:
    data = json.load(f).get('value', [])
df = pd.DataFrame(data)
df.to_csv(args.csv_file, index=False)