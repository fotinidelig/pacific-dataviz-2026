import marimo

__generated_with = "0.17.6"
app = marimo.App(
    width="full",
    layout_file="layouts/population_growth_analysis.slides.json",
)


@app.cell
def _(mo):
    mo.md(r"""
    ### Basic Analysis of data from the Pacific Data Hub

    Using example of the **Population Growth** [(link)](https://stats.pacificdata.org/vis?tm=population%20growth&pg=0&snb=11&df[ds]=ds%3ASPC2&df[id]=DF_NMDI_POP&df[ag]=SPC&df[vs]=1.0&dq=A..NMDI0002._T._T._T..&pd=,&to[TIME_PERIOD]=false).

    Growth rate = [Births - deaths + net migration] / Total population x
    100
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
    import numpy as np
    import matplotlib.pyplot as plt
    from highlight_text import ax_text
    from pyfonts import load_google_font, set_default_font
    from pypalettes import load_cmap
    import math
    font = load_google_font('Elms Sans')
    set_default_font(font)
    return font, load_cmap, math, np, pd, plt, sdmx, sns


@app.cell
def _(sdmx):
    spc = sdmx.Client('SPC')

    key = dict(INDICATOR='NMDI0002')
    keep_cols = ['GEO_PICT', 'TIME_PERIOD', 'value', 'SEX', 'AGE']
    params = dict(startPeriod='1990', endPeriod='2026')

    data = spc.data('DF_NMDI_POP', key=key, params=params)
    df = sdmx.to_pandas(data).reset_index()
    df = df[keep_cols]
    df.TIME_PERIOD = df.TIME_PERIOD.astype('int')
    # Replace country codes with real names
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
    for col in df.columns:
        print(col)
        print(df[col].unique())
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
def _(df):
    data_agg = df[df['AGE'] == '_T'][df['SEX'] == '_T']
    return (data_agg,)


@app.cell
def _(df, pd):
    kids = ['Y00T04', 'Y05T09', 'Y10T14', 'Y15T19']
    young_adults = ['Y20T24', 'Y25T29', 'Y30T34', 'Y35T39']
    adults = ['Y40T44', 'Y45T49', 'Y50T54', 'Y55T59']
    elderly = ['Y60T64', 'Y65T69', 'Y70T999']
    AGE_GROUPS = {
        'Kids (0–19)': kids,
        'Young adults (20–39)': young_adults,
        'Adults (40–59)': adults,
        'Elderly (60+)': elderly,
    }

    frames = []
    for age_group, ages in AGE_GROUPS.items():
        subset = df[(df['SEX'] == '_T') & (df['AGE'].isin(ages))]
        agg = (
            subset.groupby(['GEO_PICT', 'TIME_PERIOD'], as_index=False)['value']
            .mean()
            .sort_values(['GEO_PICT', 'TIME_PERIOD'])
        )
        agg['age_group'] = age_group
        frames.append(agg)

    data_age = pd.concat(frames, ignore_index=True)
    data_age['age_group'] = pd.Categorical(
        data_age['age_group'],
        categories=list(AGE_GROUPS.keys()),
        ordered=True,
    )
    return AGE_GROUPS, data_age


@app.cell
def _(data_agg, mo):
    ### Statistics on entire dataset
    mo.md(f"""#### Dataset-wide statistics
    {mo.as_html(data_agg['value'].describe())}""")
    return


@app.cell
def _(data_agg, mo):
    ### Statistics per country

    mo.md(f"""#### Statistics per country:
    {mo.as_html(
        data_agg.groupby('GEO_PICT')['value'].agg(['count', 'mean', 'median', 'std', 'min',
                                             'max'])
    )}""")
    return


@app.cell
def _(data_agg, mo):
    mo.md(rf"""
    #### Statistics per year:
    {mo.as_html(
        data_agg.groupby('TIME_PERIOD')['value'].agg(['count', 'mean', 'median', 'std', 'min', 
                                                'max']).sort_values(by='TIME_PERIOD', 
                                                                    ascending=False)
    )}
    """)
    return


@app.cell
def _(data_age, mo):
    mo.md(f"""
    #### Dataset-wide statistics by age group
    {mo.as_html(
        data_age.groupby('age_group', observed=True)['value'].describe()
    )}
    """)
    return


@app.cell
def _(data_age, mo):
    mo.md(f"""
    #### Statistics per country and age group
    {mo.as_html(
        data_age.groupby(['age_group', 'GEO_PICT'], observed=True)['value']
        .agg(['count', 'mean', 'median', 'std', 'min', 'max'])
    )}
    """)
    return


@app.cell
def _(data_age, mo):
    mo.md(f"""
    #### Statistics per year and age group
    {mo.as_html(
        data_age.groupby(['age_group', 'TIME_PERIOD'], observed=True)['value']
        .agg(['count', 'mean', 'median', 'std', 'min', 'max'])
        .sort_values(by=['age_group', 'TIME_PERIOD'], ascending=[True, False])
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
def _(sns):
    sns.set_style('white')
    sns.despine()
    return


@app.cell
def _(data_agg, font, mo, plt, sns):
    max_year = data_agg.TIME_PERIOD.max()
    min_year = data_agg.TIME_PERIOD.min()
    def boxplot(start_year=min_year, end_year=max_year):
        fig, ax = plt.subplots(figsize=(12,5))

        data = data_agg.copy()
        data["TIME_PERIOD"] = data["TIME_PERIOD"].astype(int)
        data = data[data["TIME_PERIOD"].between(int(start_year), int(end_year))]

        sns.boxplot(ax=ax, data=data, x='TIME_PERIOD', y='value')
        ax.axhline(y=0, color='darkred', linewidth=3, linestyle='--', zorder=0)

        ax.set_xlabel('Year', font=font, size=15)
        ax.set_ylabel('Population growth (%)', font=font, size=12)
        ax.spines[['top', 'right']].set_visible(False)

        ax.set_yticklabels(ax.get_yticklabels(), font=font)
        ax.set_xticklabels(ax.get_xticklabels(), font=font)

        fig.suptitle('Boxplot of population growth percentage per year', font=font, size=20)
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
    return boxplot, max_year, min_year, year_range


@app.cell
def _(boxplot, mo, year_range):
    start_year, end_year = year_range.value
    fig = boxplot(start_year=start_year, end_year=end_year)

    mo.vstack([year_range, mo.as_html(fig)])
    return


@app.cell
def _(data_agg, font, load_cmap, math, max_year, min_year, mo, np, plt):
    def lineplot(start_year=min_year):
        fig, ax = plt.subplots(figsize=(11,7))
        colors = load_cmap("te_aa_no_areois").colors

        data = data_agg.copy()
        # data = data[data.REF_AREA != 'Guam']
        data["TIME_PERIOD"] = data["TIME_PERIOD"].astype(int)
        data = data[data['TIME_PERIOD'] >= start_year].sort_values(
                ['GEO_PICT', 'TIME_PERIOD']
            )
        countries = sorted(data['GEO_PICT'].dropna().unique())
        color_by_country = {
            country: colors[i % len(colors)] for i, country in enumerate(countries)
        }

        for country, grp in data.groupby('GEO_PICT'):
            if country == 'Pitcairn Islands':
                continue
            ax.plot(
                grp['TIME_PERIOD'],
                grp['value'],
                color=color_by_country[country],
                linewidth=1.2,
                label=country,
            )
        ax.axhline(y=0, color='darkred', linewidth=3, linestyle='--', zorder=0)
        ax.grid(alpha=0.4)
        step = math.ceil((max_year + 1 - start_year) / 5)
        ticks = start_year + np.arange(0, 5) * step
        ax.set_xticks(ticks)
        ax.set_xlim([start_year, max_year + 1])
        ax.spines[['top', 'right']].set_visible(False)
        ax.set_xlabel('Year', font=font, size=12)
        ax.set_ylabel('Population growth rate (%)', font=font, size=12)

        fig.suptitle(
            f'Population growth rate in % from {start_year} to {max_year}',
            font=font,
            size=20,
        )
        handles, labels = ax.get_legend_handles_labels()
        fig.legend(
            handles,
            labels,
            loc='center left',
            bbox_to_anchor=(1.01, 0.5),
            fontsize='small',
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
    return lineplot, total_start_year


@app.cell
def _(lineplot, mo, total_start_year):
    fig_total = lineplot(start_year=total_start_year.value)
    mo.vstack([total_start_year, mo.as_html(fig_total)])
    return


@app.cell
def _(mo):
    mo.md(r"""
    ### Data statistics based on age groups

    We have defined 4 age groups:
    - Kids (0–19)
    - Young adults (20–39)
    - Adults (40–59)
    - Elderly (60+)
    """)
    return


@app.cell
def _(df):
    df.AGE.unique()
    return


@app.cell
def _(AGE_GROUPS, data_age, font, max_year, min_year, mo, plt, sns):
    def boxplot_by_age_group(start_year=min_year, end_year=max_year):
        fig, axes = plt.subplots(
            nrows=2, ncols=2, figsize=(14, 9), sharex=True, sharey=True
        )
        axes = axes.flatten()

        for ax, title in zip(axes, AGE_GROUPS.keys()):
            data = data_age[
                (data_age['age_group'] == title)
                & (data_age['TIME_PERIOD'].between(int(start_year), int(end_year)))
            ].copy()

            sns.boxplot(ax=ax, data=data, x='TIME_PERIOD', y='value')
            ax.axhline(y=0, color='darkred', linewidth=3, linestyle='--', zorder=0)
            ax.set_title(title, font=font, size=13)
            ax.spines[['top', 'right']].set_visible(False)
            ax.set_xlabel('Year', font=font, size=11)
            ax.set_ylabel('Population growth rate (%)', font=font, size=11)
            ax.tick_params(axis='x', rotation=45, labelsize=8)

        fig.suptitle(
            f'Population growth rate by age group ({start_year}–{end_year})',
            font=font,
            size=18,
            y=1.02,
        )
        fig.tight_layout()
        return fig

    age_year_range = mo.ui.range_slider(
        start=int(min_year),
        stop=int(max_year),
        step=1,
        value=(2008, 2025),
        label='Year range',
        show_value=True,
        full_width=True,
    )
    return age_year_range, boxplot_by_age_group


@app.cell
def _(age_year_range, boxplot_by_age_group, mo):
    age_start, age_end = age_year_range.value
    fig_age_box = boxplot_by_age_group(start_year=age_start, end_year=age_end)
    mo.vstack([age_year_range, mo.as_html(fig_age_box)])
    return


@app.cell
def _(
    AGE_GROUPS,
    data_age,
    font,
    load_cmap,
    math,
    max_year,
    min_year,
    mo,
    np,
    plt,
):
    def lineplot_by_age_group(start_year=min_year):
        fig, axes = plt.subplots(nrows=2, ncols=2, figsize=(14, 9), sharex=True, sharey=True)
        colors = load_cmap("te_aa_no_areois").colors
        axes = axes.flatten()

        step = math.ceil((max_year + 1 - start_year) / 5)
        ticks = start_year + np.arange(0, 5) * step

        # Stable country -> color mapping across all panels
        countries = sorted(data_age['GEO_PICT'].dropna().unique())
        color_by_country = {
            country: colors[i % len(colors)] for i, country in enumerate(countries)
        }

        for ax, title in zip(axes, AGE_GROUPS.keys()):
            data = data_age[
                (data_age['age_group'] == title)
                & (data_age['TIME_PERIOD'] >= start_year)
            ].copy()

            for country, grp in data.groupby('GEO_PICT'):
                ax.plot(
                    grp['TIME_PERIOD'],
                    grp['value'],
                    color=color_by_country[country],
                    linewidth=1.2,
                    label=country,
                )
            ax.axhline(y=0, color='darkred', linewidth=3, linestyle='--', zorder=0)

            ax.set_title(title, font=font, size=13)
            ax.grid(alpha=0.4)
            ax.set_xticks(ticks)
            ax.set_xlim([start_year, max_year + 1])
            ax.spines[['top', 'right']].set_visible(False)
            ax.set_xlabel('Year', font=font, size=11)
            ax.set_ylabel('Population growth rate (%)', font=font, size=11)

        handles, labels = axes[0].get_legend_handles_labels()
        fig.legend(
            handles,
            labels,
            loc='center left',
            bbox_to_anchor=(1.01, 0.5),
            fontsize='small',
            frameon=False,
        )
        fig.suptitle(
            f'Population growth rate by age group from {start_year} to {max_year}',
            font=font,
            size=18,
            y=1.02,
        )
        fig.tight_layout()
        return fig

    age_start_year = mo.ui.slider(
        start=int(min_year),
        stop=int(max_year),
        step=1,
        value=2005,
        label='Start year',
        show_value=True,
        full_width=True,
    )
    return age_start_year, lineplot_by_age_group


@app.cell
def _(age_start_year, lineplot_by_age_group, mo):
    fig_age = lineplot_by_age_group(start_year=age_start_year.value)
    mo.vstack([age_start_year, mo.as_html(fig_age)])

    return


@app.cell
def _(mo):
    mo.md(r"""
    #### Notes

    - We have an outlier, Pitcairn Islands, that seems to shift a lot throughout the years especially up to 2005.
    - It seems like on 2024 the population growth reached an ultimate low - why ?
    - After roughly 2000, more countries seem to have very low rates (mostly negative).
    - The age group with the worst growth rate are the young adults between 20-40 years old.
    - The best age group are the elderly, which shows the aging population on the islands.
    """)
    return


if __name__ == "__main__":
    app.run()
