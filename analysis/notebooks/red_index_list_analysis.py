import marimo

__generated_with = "0.17.6"
app = marimo.App(layout_file="layouts/red_index_list_analysis.slides.json")


@app.cell
def _(mo):
    mo.md("""
    ### Basic Analysis of data from the Pacific Data Hub

    Using example of the **Red List Index** [(link)](https://stats.pacificdata.org/vis?lc=en&df[ds]=ds%3ASPC2&df[id]=DF_SDG_15&df[ag]=SPC&df[vs]=3.0&dq=A.ER_RSK_LST.........&pd=,&to[TIME_PERIOD]=false&vw=tb).

    Metadata can be found under [this](https://unstats.un.org/sdgs/metadata/files/Metadata-15-05-01.pdf) link.
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
    import matplotlib as mpl
    from highlight_text import ax_text, fig_text
    from pyfonts import load_google_font, set_default_font
    from pypalettes import load_cmap
    import numpy as np
    import drawarrow
    import pypalettes
    import geopandas as gpd
    import cartopy.crs as ccrs

    font = load_google_font('Elms Sans')
    set_default_font(font)
    return (
        ax_text,
        ccrs,
        drawarrow,
        fig_text,
        font,
        gpd,
        load_cmap,
        mpl,
        np,
        plt,
        sdmx,
        sns,
    )


@app.cell
def _(sdmx):
    spc = sdmx.Client('SPC')

    key = dict(SERIES='ER_RSK_LST', SEX='_T', AGE='_T')
    params = dict(startPeriod='1980', endPeriod='2024')
    keep_cols = ['REF_AREA', 'TIME_PERIOD', 'value']

    data = spc.data('DF_SDG', key=key, params=params)
    df = sdmx.to_pandas(data)
    df = df.reset_index()[keep_cols]

    # Replace country codes with real names
    df['COUNTRY'] = df['REF_AREA'].map({
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
    stats_all = df["value"].describe()
    stats_no_guam = df[df.REF_AREA != "Guam"]["value"].describe()
    mo.vstack(
        [
            mo.md("#### Dataset-wide statistics"),
            mo.as_html(stats_all),
            mo.md("#### Dataset-wide statistics (excluding outlier country Guam)"),
            mo.as_html(stats_no_guam),
        ]
    )
    return


@app.cell
def _(df, mo):
    ### Statistics per country

    mo.md(f"""#### Statistics per country:
    {mo.as_html(
        df.groupby('REF_AREA')['value'].agg(['count', 'mean', 'median', 'std', 'min',
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
def _(ax_text, df, drawarrow, font, mo, plt, sns):

    def boxplot(start_year=1980, end_year=2024):
        fig, ax = plt.subplots(figsize=(12,5))

        data = df.copy()
        data["TIME_PERIOD"] = data["TIME_PERIOD"].astype(int)
        data = data[data["TIME_PERIOD"].between(int(start_year), int(end_year))]

        sns.boxplot(ax=ax, data=data, x='TIME_PERIOD', y='value')
        ax.set_xlabel('Year', font=font, size=15)
        ax.set_ylabel('Red List Index', font=font, size=12)
        ax.spines[['top', 'right']].set_visible(False)

        ax.set_yticklabels(ax.get_yticklabels(), font=font)
        ax.set_xticklabels(ax.get_xticklabels(), font=font)

        ax_text(s='Guam', x=.3, y=.6, color='black', ax=ax, size=11, font=font)
        drawarrow.ax_arrow(ax=ax, tail_position=[.5, .58], 
                           head_position=[.1, .5], color='black', fill_head=False)
        ax.scatter(marker='o', x=[.09], y=[.59], color='white', edgecolor='black',
                  linewidth=.8)
        fig.suptitle('Boxplot of red list index per year', font=font, size=20)
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
def _(ax_text, df, drawarrow, fig_text, font, load_cmap, np, plt):
    def lineplot(x_min=1980):
        fig, ax = plt.subplots(figsize=(11,8), dpi=300)
        fig.subplots_adjust(left=0.1, right=1, top=1, bottom=0)
        colors = load_cmap("te_aa_no_areois").colors
        data = df.copy()
        # data = data[data.COUNTRY != 'Guam']
        data["TIME_PERIOD"] = data["TIME_PERIOD"].astype(int)
        data = data[data.TIME_PERIOD >= x_min]
        sorted = data[data.TIME_PERIOD == 2024]\
            .sort_values(by='value', ascending=False).reset_index(drop=True)

        countries_sorted = sorted.COUNTRY.values
        x_text = 2027
        y_text = np.linspace(.57, 1, num=len(data.COUNTRY.unique())-1)[::-1]
        x_start = 2024.5

        for i, country in enumerate(countries_sorted):
            cdata = data[data.COUNTRY == country]
            color = colors[i%(len(colors))]
            ax = cdata.plot(ax=ax, kind='line', x='TIME_PERIOD', y='value', 
                          color=color, legend=False)
            ax = cdata.plot(ax=ax, kind='scatter', x='TIME_PERIOD', y='value', 
                          color=color, legend=False, s=4)

            if country == 'Guam':
                ax_text(x=2025,
                    y=cdata.value.values[-1],
                    color=color, s=country)
            else:
                # plot arc lines for text annotation
                ax.plot([x_start, x_text], [cdata.value.values[-1], y_text[i]], 
                        color=color)

                ax_text(x=x_text+.5,
                    y=y_text[i],
                    color=color, s=country)

            if country == 'Niue' and x_min < 2004:
                # annotate unsusual values between 200 and 2004 for Niue
                point_1 = [2000, list(cdata[cdata.TIME_PERIOD == 2000].value)[0]]
                point_2 = [2004, list(cdata[cdata.TIME_PERIOD == 2004].value)[0]]
                ax.scatter([point_1[0], point_2[0]], [point_1[1], point_2[1]], 
                           color='darkred', s=25)
                # ax.plot([1996, 2000], [.7, point_1[1]-.01], color='darkred')
                drawarrow.ax_arrow(tail_position=[2000, point_1[1]-.004],
                                  head_position=[1996, .665], color='darkred',
                                   zorder=100, ax=ax)
                ax_text(
                    s='''What measures did <Niue> take\nbetween <2000> and <2004>'''
                    '''\nto protect more species ?''',
                    x=1999.5, y=.66, color='black', ha='right', textalign='right',
                       size=12, 
                    highlight_textprops=[{'color': color}, {'color': 'darkred'},
                                         {'color': 'darkred'}])
        if x_min < 2008:
            ax.axvline(x = 2008, color = 'darkred', zorder=-100)
            ax_text(s='All indices are in constant \ndecline after <2008>', x=2008.4, 
               y=1, color='black', size=12,
                highlight_textprops=[{'color':'darkred'}])


        # annotations on y axis
        drawarrow.fig_arrow(fig=fig, tail_position=[0.058, .2],
                          head_position=[0.058, 0], color='gray',
                           linewidth=1)
        fig_text(fig=fig, x=0.04, y=0, s='lower index =',
                color='gray', ha='right', va='bottom', rotation='vertical')
        fig_text(fig=fig, x=0.05, y=0, s='more species going extinct',
                color='gray', ha='right', va='bottom', rotation='vertical')


        drawarrow.fig_arrow(fig=fig, tail_position=[0.058, .8],
                          head_position=[0.058, 1], color='gray',
                           linewidth=1)
        fig_text(fig=fig, x=0.04, y=1, s='higher index =',
                color='gray', ha='right', va='top', rotation='vertical')
        fig_text(fig=fig, x=0.05, y=1, s='less species in extinction',
                color='gray', ha='right', va='top', rotation='vertical')

        step = int((2025-x_min) / 5) # get 5 ticks each time
        ticks = x_min + np.arange(0, 5) * step
        # ticklabels = [t if i%2 == 0 else "" for i, t in enumerate(ticks)]
        ax.set_xticks(ticks, ticks)
        ax.grid(axis='x', alpha=.6, ls='--')

        ax.set_yticklabels(ax.get_yticklabels(), font=font)
        ax.set_xticklabels(ax.get_xticklabels(), font=font)

        ax.spines[["top", "right"]].set_visible(False)

        ax.set_xlim([x_min, 2030])

        fig_text(fig=fig, s='Species in the pacific islands are going extinct.', 
                     font=font, size=20, y=1.13, x=0.09, ha='left')

        fig_text(fig=fig, s='''The <Red List Index> measures how many species are endangered.'''
        '''\n<1> indicates no endangered species, <0> indicates all are extinct.''', 
                     font=font, size=15, y=1.08, x=0.09, ha='left',
                highlight_textprops=[{'color':'darkred'}, {'color':'darkred'}, {'color':'darkred'}])

        ax.set_xlabel('Year', font=font, size=12)
        ax.set_ylabel('Red List Index', font=font, size=12)
        return fig

    lineplot(2010)
    # _fig.savefig('red_list_index.svg')
    return


@app.cell
def _(mo):
    mo.md(r"""
    ### Maps

    Let's explore if there is any pattern visible with respect to the position of the islands.
    """)
    return


@app.cell
def _(ccrs, df, gpd):
    from shapely.ops import transform
    # world = gpd.read_file('data/raw/Pacific islands region EEZs.geojson')
    # projection = ccrs.Mercator()
    # previous_proj = ccrs.PlateCarree() # default projection of GeoPandas
    # world = world.to_crs(projection.to_proj4())
    # land = gpd.read_file("data/raw/Pacific islands region land.geojson")

    eez = gpd.read_file("data/raw/Pacific islands region EEZs.geojson")
    projection = ccrs.PlateCarree(central_longitude=180)
    eez = eez.replace({"Wallis et Futuna": "Wallis and Futuna",
                      "Polynesie Francaise": "French Polynesia",
                      "Micronesia": "Federated States of Micronesia",
                      })

    eez_red_index = eez.merge(df, left_on='country', right_on='COUNTRY').drop(['country', 'id'], axis=1).reset_index(drop=True)
    eez_red_index_24 = eez_red_index[eez_red_index.TIME_PERIOD == '2024'].reset_index(drop=True)

    def to_pacific_lon(geom):
        def _shift(x, y, z=None):
            x = x + 360 if x < 0 else x
            return (x, y) if z is None else (x, y, z)
        return transform(_shift, geom)

    g = eez_red_index_24.copy()
    g["geometry"] = g.geometry.apply(to_pacific_lon)
    g = g.set_crs(4326, allow_override=True)

    # now centroids are meaningful in Pacific lon space
    centroids = g.centroid
    def wrap_lon(lon):
        return ((lon + 180) % 360) - 180
    
    eez_red_index_24["centroid"] = centroids.apply(
        lambda p: type(p)(wrap_lon(p.x), p.y)
    )
    return eez_red_index_24, projection


@app.cell
def _(eez_red_index_24, load_cmap, mpl):
    max_ri = eez_red_index_24['value'].max()
    min_ri = eez_red_index_24['value'].min()

    colormap = load_cmap("Sunset", cmap_type="continuous", reverse=True)

    norm = mpl.colors.Normalize(
        vmin=min_ri,
        vmax=max_ri
    )

    sm = mpl.cm.ScalarMappable(cmap=colormap, norm=norm)

    eez_red_index_24['color'] = eez_red_index_24.value\
        .apply(lambda v: mpl.colors.to_hex(sm.to_rgba(v)))
    print(eez_red_index_24)
    return


@app.cell
def _(ax_text, ccrs, eez_red_index_24, plt, projection):
    def plot_pacific_islands():
        fig, ax = plt.subplots(
            figsize=(10, 8),
            subplot_kw={"projection": projection},
        )

        ax.spines[["top", "right", "bottom", "left"]].set_visible(False)

        # ax.set_xlim(1.4*1e7, 1.9*1e7)
        # ax.set_ylim(-3*1e6, 0.5*1e6)

        # world.plot(ax=ax)
        eez_red_index_24.plot(ax=ax, transform=ccrs.PlateCarree(), 
                              color=eez_red_index_24["color"], 
                              edgecolor="white", linewidth=0.2)

        for i, row in eez_red_index_24.iterrows():
            ref_area = row.REF_AREA
            x, y = projection.transform_point(
                row.centroid.x, row.centroid.y, ccrs.PlateCarree()
            )
            ax_text(ax=ax, x=x, y=y, s=ref_area, color="black")
            if ref_area in ['KI', 'TV', 'FJ']:
                print(row)

        return fig

    plot_pacific_islands()
    return


@app.cell
def _(eez_red_index_24):
    eez_red_index_24
    return


@app.cell
def _():
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
