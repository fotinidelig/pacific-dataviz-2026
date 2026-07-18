import marimo

__generated_with = "0.17.6"
app = marimo.App(
    layout_file="layouts/fisheries_management_analysis.slides.json",
)


@app.cell
def _(mo):
    mo.md("""
    ### Basic Analysis of data from the Pacific Data Hub

    Using example of the **Fisheries management measures in place** [(link)](https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.FISH_MNGT_MULT_BILAT_ARGMT.&pd=,&to[TIME_PERIOD]=false&vw=tb).
    """)
    return


@app.cell
def _():
    import marimo as mo
    return (mo,)


@app.cell
def _():
    import pandas as pd
    import seaborn as sns
    import sdmx
    import matplotlib.pyplot as plt
    from highlight_text import ax_text
    from pyfonts import load_google_font, set_default_font
    from pypalettes import load_cmap

    font = load_google_font('Elms Sans')
    set_default_font(font)
    return ax_text, font, load_cmap, plt, sdmx, sns


@app.cell
def _(sdmx):
    spc = sdmx.Client('SPC')

    key = dict(CLIMATE_CHANGE_INDICATORS='FISH_MNGT_MULT_BILAT_ARGMT')
    keep_cols = ['GEO_PICT', 'TIME_PERIOD', 'value']
    params = dict(startPeriod='1980', endPeriod='2026')

    data = spc.data('DF_CLIMATE_CHANGE', key=key, params=params)
    df = sdmx.to_pandas(data)
    df = df.reset_index()[keep_cols]

    # # Replace country codes with real names
    df['GEO_PICT'] = df['GEO_PICT'].replace({
        'TK': 'Tokelau',
        'GU': 'Guam',
        'PG': 'Papua New Guinea',
        'PF': 'French Polynesia',
        'FM': 'Federated States of Micronesia',
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
    })
    return (df,)


@app.cell
def _(df):
    df
    return


@app.cell
def _(mo):
    mo.md("""
    ### Numerical statistics

    Range, missing values, mean/median.
    """)
    return


@app.cell
def _(df, mo):
    ### Number of NaN values

    mo.md(f"""Missing values per column:
    {mo.as_html(df.isna().sum())}""")
    # df.info()
    # df.isna().sum() # missing values per column
    return


@app.cell
def _(df, mo):
    ### Statistics on entire dataset
    mo.md(f"""#### Dataset-wide statistics
    {mo.as_html(df['value'].describe())}""")
    return


@app.cell
def _(df, mo):
    ### Statistics per country

    mo.md(f"""#### Statistics per country:
    {mo.as_html(
        df.groupby('GEO_PICT')['value'].agg(['count', 'mean', 'median', 'std', 'min',
                                             'max'])
    )}""")
    return


@app.cell
def _(df, mo):
    mo.md(f"""
    #### Statistics per year:
    {mo.as_html(
        df.groupby('TIME_PERIOD')['value'].agg(['count', 'mean', 'median', 'std', 'min', 
                                                'max']).sort_values(by='TIME_PERIOD', 
                                                                    ascending=False)
    )}
    """)
    return


@app.cell
def _(mo):
    mo.md("""
    ### Data visualization
    """)
    return


@app.cell
def _(sns):
    sns.set_style('white')
    sns.despine()
    return


@app.cell
def _(df, font, mo, plt, sns):

    def boxplot(start_year=1980, end_year=2024):
        fig, ax = plt.subplots(figsize=(12,5))

        data = df.copy()
        data["TIME_PERIOD"] = data["TIME_PERIOD"].astype(int)
        data = data[data["TIME_PERIOD"].between(int(start_year), int(end_year))]

        sns.boxplot(ax=ax, data=data, x='TIME_PERIOD', y='value')
        ax.set_xlabel('Year', font=font, size=15)
        ax.set_ylabel('Management Measures Count', font=font, size=12)
        ax.spines[['top', 'right']].set_visible(False)

        ax.set_yticklabels(ax.get_yticklabels(), font=font)
        ax.set_xticklabels(ax.get_xticklabels(), font=font)

        fig.suptitle('Boxplot of management measures for fisheries per year', font=font, size=20)
        return fig

    year_range = mo.ui.range_slider(
        start=1980,
        stop=2024,
        step=1,
        value=(2008, 2024),
        label="Year range",
        show_value=True,
        full_width=True,
    )
    return boxplot, year_range


@app.cell
def _(boxplot, mo, year_range):
    start_year, end_year = year_range.value
    fig = boxplot(start_year=start_year, end_year=end_year)

    mo.vstack([year_range, mo.as_html(fig)])
    return


@app.cell
def _(ax_text, df, font, load_cmap, plt):
    def lineplot():
        fig, ax = plt.subplots(figsize=(11,8))
        colors = load_cmap("te_aa_no_areois").colors

        data = df.copy()
        # data = data[data.REF_AREA != 'Guam']
        data["TIME_PERIOD"] = data["TIME_PERIOD"].astype(int)

        for i, (country, grp) in enumerate(data.groupby(['GEO_PICT'])):
            color = colors[i%(len(colors))]
            ax = grp.plot(ax=ax, kind='line', x='TIME_PERIOD', y='value', 
                          color=color, legend=False)
            # y_jitter = np.random.uniform(0, 1)*.01
            y_text = grp.value.values[-1]
            x_text = grp.TIME_PERIOD.values[-1]+1

            if country[0] == 'Fiji':
                y_text = y_text + 1.5
                x_text = x_text - 1
            if country[0] == 'Pitcairn Islands':
                y_text = y_text + 1.2
            if country[0] == 'Cook Islands':
                y_text = y_text - 2
                x_text = x_text - .9
            if country[0] == 'American Samoa':
                y_text = y_text + 1.5
            if country[0] == 'Federated States of Micronesia':
                y_text = y_text + 1
            if country[0] == 'Nauru':
                y_text = y_text + 1

            ax_text(x=x_text,
                    y=y_text,
                    color=color, s=country[0])

        ax.grid()

        ax.set_xticks([1980, 1990, 2000, 2010, 2020])

        ax.set_yticklabels(ax.get_yticklabels(), font=font)
        ax.set_xticklabels(ax.get_xticklabels(), font=font)

        ax.spines[["top", "right"]].set_visible(False)

        ax.set_xlim([1980, 2030])

        fig.suptitle('Fisheries management measures from 1980 to 2024', font=font, 
                     size=20)
        ax.set_xlabel('Year', font=font, size=12)
        ax.set_ylabel('Management Measures Count', font=font, size=12)
        return fig

    lineplot()
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
