import marimo

__generated_with = "0.17.6"
app = marimo.App(width="full")


@app.cell
def _(mo):
    mo.md(r"""
    ### Basic Analysis of data from the Pacific Data Hub

    Using example of the **Sea Surface Temperature Anomalies** [(link)](https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.SST_ANOM.&pd=,&to[TIME_PERIOD]=false&vw=tl).
    """)
    return


@app.cell
def _():
    import pandas as pd
    import seaborn as sns
    import sdmx
    import matplotlib.pyplot as plt
    import matplotlib as mpl
    from highlight_text import ax_text, fig_text
    from pyfonts import load_google_font, set_default_font
    from pypalettes import load_cmap
    import numpy as np
    import drawarrow
    import pypalettes
    import geopandas as gpd
    import cartopy.crs as ccrs
    import math
    font = load_google_font('Elms Sans')
    set_default_font(font)
    return font, load_cmap, math, np, plt, sdmx, sns


@app.cell
def _(sdmx):
    spc = sdmx.Client('SPC')

    key = dict(CLIMATE_CHANGE_INDICATORS='SST_ANOM')
    keep_cols = ['GEO_PICT', 'TIME_PERIOD', 'value']
    params = dict(startPeriod='1980', endPeriod='2025')

    data = spc.data('DF_CLIMATE_CHANGE', key=key, params=params)
    df = sdmx.to_pandas(data)
    df = df.reset_index()[keep_cols]
    df.TIME_PERIOD = df.TIME_PERIOD.astype('int')
    df['REF_AREA'] = df.GEO_PICT

    df['COUNTRY'] = df['GEO_PICT'].replace({
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
    df.TIME_PERIOD.unique()
    return


@app.cell
def _(df):
    countries = {'TK': 'Tokelau',
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
        'AS': 'American Samoa',}

    print(set(countries.values())-set(df.COUNTRY.unique()))
    return


@app.cell
def _(mo):
    mo.md(r"""
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
        df.groupby('COUNTRY')['value'].agg(['count', 'mean', 'median', 'std', 'min',
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
    mo.md(r"""
    ### Data visualization
    """)
    return


@app.cell
def _(df, font, mo, plt, sns):
    max_year = df.TIME_PERIOD.max()
    min_year = df.TIME_PERIOD.min()

    def boxplot(start_year=min_year, end_year=max_year, with_pitcairn=True):
        fig, ax = plt.subplots(figsize=(12,5))

        data = df.copy()
        data["TIME_PERIOD"] = data["TIME_PERIOD"].astype(int)
        data = data[data["TIME_PERIOD"].between(int(start_year), int(end_year))]
        if not with_pitcairn:
            data = data[data.GEO_PICT != 'Pitcairn Islands']
        sns.boxplot(ax=ax, data=data, x='TIME_PERIOD', y='value')
        ax.axhline(y=0, color='darkred', linewidth=3, linestyle='--', zorder=0)

        ax.set_xlabel('Year', font=font, size=15)
        ax.set_ylabel('Temperature Anomaly (°C)', font=font, size=12)
        ax.spines[['top', 'right']].set_visible(False)

        ax.set_yticklabels(ax.get_yticklabels(), font=font)
        ax.set_xticklabels(ax.get_xticklabels(), font=font)

        fig.suptitle('Boxplot of sea level temperature anomalies (°C) per year', font=font, size=20)
        return fig

    year_range = mo.ui.range_slider(
        start=min_year,
        stop=max_year,
        step=1,
        value=(2008, 2024),
        label="Year range",
        show_value=True,
        full_width=True,
    )

    with_pitcairn = mo.ui.dropdown(
        options={'Include': True, 'Exclude': False},
        value='Include',
        label='Pitcairn Islands',
    )
    return boxplot, max_year, min_year, with_pitcairn, year_range


@app.cell
def _(boxplot, mo, with_pitcairn, year_range):
    start_year, end_year = year_range.value
    fig = boxplot(start_year=start_year, end_year=end_year, with_pitcairn=with_pitcairn.value)

    mo.vstack([
        mo.hstack([year_range, with_pitcairn], justify='start', gap=1),
        mo.as_html(fig),
    ])
    return


@app.cell
def _(df, font, load_cmap, math, max_year, min_year, mo, np, plt):
    def lineplot(start_year=min_year, end_year=max_year, with_pitcairn=True):
        fig, ax = plt.subplots(figsize=(11, 7))
        colors = load_cmap("te_aa_no_areois").colors

        data = df.copy()
        data["TIME_PERIOD"] = data["TIME_PERIOD"].astype(int)
        data = data[data["TIME_PERIOD"].between(int(start_year), int(end_year))].sort_values(
            ["GEO_PICT", "TIME_PERIOD"]
        )
        if not with_pitcairn:
            data = data[data.GEO_PICT != "Pitcairn Islands"]

        yearly = (
            data.groupby("TIME_PERIOD")["value"]
            .agg(
                median="median",
                q1=lambda s: s.quantile(0.25),
                q3=lambda s: s.quantile(0.75),
            )
            .reset_index()
            .sort_values("TIME_PERIOD")
        )
        years = yearly["TIME_PERIOD"]
        median = yearly["median"]
        lower = yearly["q1"]
        upper = yearly["q3"]

        # IQR band: middle 50% of countries each year (background)
        ax.fill_between(
            years,
            lower,
            upper,
            color="#6b7280",
            alpha=0.18,
            linewidth=0,
            zorder=1,
            label="IQR (25th–75th)",
        )

        countries = sorted(data["COUNTRY"].dropna().unique())
        color_by_country = {
            country: colors[i % len(colors)] for i, country in enumerate(countries)
        }

        for country, grp in data.groupby("COUNTRY"):
            ax.plot(
                grp["TIME_PERIOD"],
                grp["value"],
                color=color_by_country[country],
                linewidth=1.1,
                alpha=0.55,
                label=country,
                zorder=2,
            )

        # Median trend line
        ax.plot(
            years,
            median,
            color="#111827",
            linewidth=2.6,
            zorder=4,
            label="Regional median",
        )

        ax.axhline(y=0, color="darkred", linewidth=2.5, linestyle="--", zorder=0)
        ax.grid(alpha=0.35)
        step = math.ceil((end_year + 1 - start_year) / 5)
        ticks = start_year + np.arange(0, 5) * step
        ax.set_xticks(ticks)
        ax.set_xlim([start_year, end_year + 1])
        ax.spines[["top", "right"]].set_visible(False)
        ax.set_xlabel("Year", font=font, size=12)
        ax.set_ylabel("Temperature Anomaly (°C)", font=font, size=12)

        fig.suptitle(
            f"Sea surface temperature anomalies (°C) from {start_year} to {end_year}",
            font=font,
            size=20,
        )

        # Put median / IQR first in the legend, then countries
        handles, labels = ax.get_legend_handles_labels()
        priority = {"Regional median", "IQR (25th–75th)"}
        ordered = sorted(
            zip(handles, labels),
            key=lambda hl: (0 if hl[1] in priority else 1, hl[1]),
        )
        handles, labels = zip(*ordered) if ordered else ([], [])
        fig.legend(
            handles,
            labels,
            loc="center left",
            bbox_to_anchor=(1.01, 0.5),
            fontsize="small",
            frameon=False,
        )
        fig.tight_layout()
        return fig

    total_start_year = mo.ui.slider(
        start=int(min_year),
        stop=int(max_year),
        step=1,
        value=2005,
        label='Start year',
        show_value=True,
        full_width=True,
    )
    return (lineplot,)


@app.cell
def _(lineplot, mo, with_pitcairn, year_range):
    fig_total = lineplot(
        start_year=year_range.value[0],
        end_year=year_range.value[1],    
        with_pitcairn=with_pitcairn.value,
    )
    mo.vstack([
        mo.hstack([year_range, with_pitcairn], justify='start', gap=1),
        mo.as_html(fig_total),
    ])
    return


@app.cell
def _(df):
    df.to_csv('data/processed/sea_surface_temperature_anomaly.csv',  index=False)
    return


@app.cell
def _(df, font, load_cmap, math, max_year, min_year, plt, with_pitcairn):
    def lineplot_mean_only(start_year=min_year, end_year=max_year, with_pitcairn=True):
        fig, ax = plt.subplots(figsize=(11, 7))
        colors = load_cmap("te_aa_no_areois").colors

        data = df.copy()
        data["TIME_PERIOD"] = data["TIME_PERIOD"].astype(int)
        data = data[data["TIME_PERIOD"].between(int(start_year), int(end_year))].sort_values(
            ["GEO_PICT", "TIME_PERIOD"]
        )
        if not with_pitcairn:
            data = data[data.GEO_PICT != "Pitcairn Islands"]

        yearly = (
            data.groupby("TIME_PERIOD")["value"]
            .agg(
                median="median",
                q1=lambda s: s.quantile(0.25),
                q3=lambda s: s.quantile(0.75),
            )
            .reset_index()
            .sort_values("TIME_PERIOD")
        )
        years = yearly["TIME_PERIOD"]
        median = yearly["median"]

        countries = sorted(data["COUNTRY"].dropna().unique())
        color_by_country = {
            country: colors[i % len(colors)] for i, country in enumerate(countries)
        }

        # Median trend line
        ax.plot(
            years,
            median,
            color="#111827",
            linewidth=2.6,
            zorder=4,
            label="Regional median",
        )

        ax.axhline(y=0, color="darkred", linewidth=2.5, linestyle="--", zorder=0)
        step = math.ceil((end_year + 1 - start_year) / 5)
        ax.set_xticks([])
        ax.set_yticks([])
        ax.set_xlim([start_year, end_year + 1])
        ax.spines[["top", "right"]].set_visible(False)

        fig.suptitle(
            f"Sea surface temperature anomalies (°C) from {start_year} to {end_year}",
            font=font,
            size=20,
        )

        # Put median / IQR first in the legend, then countries
        handles, labels = ax.get_legend_handles_labels()
        priority = {"Regional median", "IQR (25th–75th)"}
        ordered = sorted(
            zip(handles, labels),
            key=lambda hl: (0 if hl[1] in priority else 1, hl[1]),
        )
        handles, labels = zip(*ordered) if ordered else ([], [])
        fig.legend(
            handles,
            labels,
            loc="center left",
            bbox_to_anchor=(1.01, 0.5),
            fontsize="small",
            frameon=False,
        )
        fig.tight_layout()
        return fig
    mean=lineplot_mean_only(
        start_year=1990,
        end_year=2024,    
        with_pitcairn=with_pitcairn.value,
    )

    mean.savefig("mean_sea_surface.svg", bbox_inches='tight')
    return


@app.cell
def _():
    import marimo as mo
    return (mo,)


@app.cell
def _(df):
    # idxmax() → index of the max row per country; .loc pulls year + value
    df_till_2024 = df[df['TIME_PERIOD']<2025]
    max_per_country = (
        df_till_2024.loc[df_till_2024.groupby("COUNTRY")["value"].idxmax(), ["COUNTRY", "TIME_PERIOD", "value"]]
        .rename(columns={"TIME_PERIOD": "year", "value": "max_anomaly"})
        .sort_values("max_anomaly", ascending=False)
        .reset_index(drop=True)
    )
    max_per_country
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
