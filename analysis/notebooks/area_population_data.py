import marimo

__generated_with = "0.17.6"
app = marimo.App(width="full")


@app.cell
def _():
    import marimo as mo

    import pandas as pd
    import seaborn as sns
    import sdmx
    import matplotlib.pyplot as plt
    from highlight_text import ax_text
    from pyfonts import load_google_font, set_default_font
    from pypalettes import load_cmap
    import numpy as np
    return pd, sdmx


@app.cell
def _(pd):
    link = 'https://ourworldindata.org/explorers/population-and-demography.csv?v=1&csvType=filtered&useColumnShortNames=true&tab=map&time=latest&country=~PYF&indicator=Population&Sex=Both+sexes&Age=Total&Projection+scenario=None'

    # data = pd.read_csv(link, storage_options = {'User-Agent': 'Our World In Data data fetch/1.0'})
    data = pd.read_csv('data/raw/API_SP.POP.TOTL_DS2_EN_csv_v2_3107.csv')
    cols = ['Country Name', 'Country Code', '2023', '2024', '2025']
    data =data[cols]
    data.columns
    return (data,)


@app.cell
def _(data, pd):
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

    population = data[data['Country Name'].isin(pacific_countries.values())].reset_index(drop=True)
    rows = [['Cook Islands', 'CK', 14222, None, None], # https://data.who.int/countries/184
          ['Niue', 'NU', 1817, None, None ], # https://data.who.int/countries/570
          ['Pitcairn Islands', 'PN', 50, None, None], # https://www.government.pn/
           ['Tokelau', 'TK', 2424, None, None], # https://ourworldindata.org/profile/population-demography/tokelau
           ['Wallis and Futuna', 'TK', 11400, None, None], # https://worldpopulationreview.com/countries/wallis-and-futuna
    ]

    missing = set(pacific_countries.values()) - set(data["Country Name"])
    print('Missing countries from world population data: ', sorted(missing))

    new_rows = pd.DataFrame(
        rows,
        columns=["Country Name", "Country Code", "2023", "2024", "2025"],
    )

    population = pd.concat([population, new_rows], ignore_index=True)
    population.to_csv('data/processed/population_23_24_25.csv')
    # population = population.replace('Micronesia, Fed. Sts.', 'Federated States of Micronesia')
    return pacific_countries, population


@app.cell
def _(pacific_countries, sdmx):
    spc = sdmx.Client('SPC')

    params = dict(startPeriod='2023', endPeriod='2026')
    keep_cols = ['GEO_PICT', 'TIME_PERIOD', 'value']

    land_data = spc.data('DF_LAND_USE', params=params)
    land_data = sdmx.to_pandas(land_data)
    land_data = land_data.reset_index()[keep_cols]
    land_data = land_data.rename(columns={'GEO_PICT': 'Country Name'})
    land_data['Country Name'] = land_data['Country Name'].replace(pacific_countries)
    return (land_data,)


@app.cell
def _(land_data, pd, population):
    land_population = pd.merge(land_data, population, how='left', on=['Country Name']).drop(columns=['2024', '2025'], axis=1)
    land_population = land_population.rename(columns={'2023': 'Population', 'value': 'Land Cover', 'TIME_PERIOD': 'Year'})
    return (land_population,)


@app.cell
def _(land_population):
    land_population
    return


@app.cell
def _(land_population):
    land_population.to_json('data/processed/land_population.json', orient='values')
    return


@app.cell
def _(pacific_countries, pd):
    pop_data = pd.read_csv('data/raw/population.csv')
    entity_names = list(pacific_countries.values()) + ['Micronesia (country)']
    pop_data = pop_data[pop_data['Entity'].isin(entity_names)].reset_index(drop=True)
    pop_data.to_csv('data/processed/population_pacific_all_years.csv')
    return



if __name__ == "__main__":
    app.run()
