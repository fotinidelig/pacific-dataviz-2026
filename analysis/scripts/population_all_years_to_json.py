# Data from 1950 to 2023
# Missing country: Pitcairn Islands
# Data source: our world in data

import pandas as pd

pacific_countries = {
    'TK': 'Tokelau',
    'GU': 'Guam',
    'PG': 'Papua New Guinea',
    'PF': 'French Polynesia',
    'FM' : 'Micronesia, Fed. Sts.',
    'PW': 'Palau',
    'VU': 'Vanuatu',
    'TV': 'Tuvalu',
    'PN': 'Pitcairn Islands',
    'MP': 'Northern Mariana Islands',
    'WF': 'Wallis and Futuna',
    'SB': 'Solomon Islands',
    'MH': 'Marshall Islands',
    'KI': 'Kiribati',
    'FJ': 'Fiji',
    'WS': 'Samoa',
    'NC': 'New Caledonia',
    'NU': 'Niue',
    'CK': 'Cook Islands',
    'TO': 'Tonga',
    'NR': 'Nauru',
    'AS': 'American Samoa',
}

df = pd.read_csv('../../data/processed/population_pacific_all_years.csv')
df = df.replace({'Micronesia (country)' : 'Micronesia, Fed. Sts.'})
print("Countries not in the dataset", set(pacific_countries.values()) - set(df.Entity.unique()))
df.to_json('../../data/processed/population_pacific_all_years.json', orient='records')