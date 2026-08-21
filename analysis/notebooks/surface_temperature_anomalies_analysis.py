import marimo

__generated_with = "0.17.6"
app = marimo.App(width="full")


@app.cell
def _(mo):
    mo.md(r"""
    ### Basic Analysis of data from the Pacific Data Hub

    Using the **Mean Surface Temperature Anomalies** indicator
    [(link)](https://stats.pacificdata.org/vis?lc=en&df[ds]=SPC2&df[id]=DF_CLIMATE_CHANGE&df[ag]=SPC&df[vs]=1.0&av=true&dq=A.ST_ANOM.&pd=,&to[TIME_PERIOD]=false&vw=tl)
    from the Pacific Data Hub climate change dataset (`DF_CLIMATE_CHANGE` / `ST_ANOM`).

    Surface temperature anomalies measure how much the mean surface temperature differs
    from a long-term reference period. Positive values = warmer than average;
    negative values = cooler than average.
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
    import geopandas as gpd
    import cartopy.crs as ccrs
    import math

    font = load_google_font("Elms Sans")
    set_default_font(font)
    return (
        ax_text,
        ccrs,
        fig_text,
        font,
        gpd,
        load_cmap,
        math,
        mpl,
        np,
        plt,
        sdmx,
        sns,
    )


@app.cell
def _(sdmx):
    spc = sdmx.Client("SPC")

    key = dict(CLIMATE_CHANGE_INDICATORS="ST_ANOM")
    keep_cols = ["GEO_PICT", "TIME_PERIOD", "value"]
    params = dict(startPeriod="1990", endPeriod="2025")

    data = spc.data("DF_CLIMATE_CHANGE", key=key, params=params)
    df = sdmx.to_pandas(data)
    df = df.reset_index()[keep_cols]
    df["TIME_PERIOD"] = df["TIME_PERIOD"].astype(int)
    df['REF_AREA'] = df.GEO_PICT

    country_map = {
        "TK": "Tokelau",
        "GU": "Guam",
        "PG": "Papua New Guinea",
        "PF": "French Polynesia",
        "FM": "Federated States of Micronesia",
        "PW": "Palau",
        "VU": "Vanuatu",
        "TV": "Tuvalu",
        "PN": "Pitcairn Islands",
        "MP": "Northern Mariana Islands",
        "WF": "Wallis and Futuna",
        "SB": "Solomon Islands",
        "MH": "Marshall Islands",
        "KI": "Kiribati",
        "FJ": "Fiji",
        "WS": "Samoa",
        "NC": "New Caledonia",
        "NU": "Niue",
        "CK": "Cook Islands",
        "TO": "Tonga",
        "NR": "Nauru",
        "AS": "American Samoa",
    }
    df["COUNTRY"] = df["GEO_PICT"].map(country_map)
    return (df,)


@app.cell
def _(df):
    df
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
    mo.md(f"""
    Missing values per column:
    {mo.as_html(df.isna().sum())}
    """)
    return


@app.cell
def _(df, mo):
    mo.md(f"""
    #### Dataset-wide statistics
    {mo.as_html(df["value"].describe())}
    """)
    return


@app.cell
def _(df, mo):
    mo.md(f"""
    #### Statistics per country:
    {mo.as_html(
        df.groupby("COUNTRY")["value"].agg(
            ["count", "mean", "median", "std", "min", "max"]
        )
    )}
    """)
    return


@app.cell
def _(df, mo):
    mo.md(f"""
    #### Statistics per year:
    {mo.as_html(
        df.groupby("TIME_PERIOD")["value"]
        .agg(["count", "mean", "median", "std", "min", "max"])
        .sort_values(by="TIME_PERIOD", ascending=False)
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
    sns.set_style("white")
    sns.despine()
    return


@app.cell
def _(df, font, mo, plt, sns):
    max_year = int(df.TIME_PERIOD.max())
    min_year = int(df.TIME_PERIOD.min())

    def boxplot(start_year=min_year, end_year=max_year):
        fig, ax = plt.subplots(figsize=(12, 5))

        data = df.copy()
        data = data[data["TIME_PERIOD"].between(int(start_year), int(end_year))]

        sns.boxplot(ax=ax, data=data, x="TIME_PERIOD", y="value")
        ax.axhline(y=0, color="darkred", linewidth=2.5, linestyle="--", zorder=0)

        ax.set_xlabel("Year", font=font, size=15)
        ax.set_ylabel("Temperature anomaly (°C)", font=font, size=12)
        ax.spines[["top", "right"]].set_visible(False)

        ax.set_yticklabels(ax.get_yticklabels(), font=font)
        ax.set_xticklabels(ax.get_xticklabels(), font=font)

        fig.suptitle(
            "Boxplot of mean surface temperature anomalies (°C) per year",
            font=font,
            size=20,
        )
        return fig

    year_range = mo.ui.range_slider(
        start=min_year,
        stop=max_year,
        step=1,
        value=(max(min_year, 2008), max_year),
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
def _(df, font, load_cmap, math, max_year, min_year, np, plt):
    def lineplot(start_year=min_year, end_year=max_year):
        fig, ax = plt.subplots(figsize=(11, 7))
        colors = load_cmap("te_aa_no_areois").colors

        data = (
            df.copy()
            .query("@start_year <= TIME_PERIOD <= @end_year")
            .sort_values(["COUNTRY", "TIME_PERIOD"])
        )

        yearly = (
            data.groupby("TIME_PERIOD")["value"]
            .agg(
                mean="mean",
                q1=lambda s: s.quantile(0.25),
                q3=lambda s: s.quantile(0.75),
            )
            .reset_index()
            .sort_values("TIME_PERIOD")
        )
        years = yearly["TIME_PERIOD"]
        mean = yearly["mean"]
        lower = yearly["q1"]
        upper = yearly["q3"]

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

        ax.plot(
            years,
            mean,
            color="#111827",
            linewidth=2.6,
            zorder=4,
            label="Regional mean",
        )

        ax.axhline(y=0, color="darkred", linewidth=2.5, linestyle="--", zorder=0)
        ax.grid(alpha=0.35)
        step = max(1, math.ceil((end_year + 1 - start_year) / 5))
        ticks = start_year + np.arange(0, 5) * step
        ticks = ticks[ticks <= end_year]
        ax.set_xticks(ticks)
        ax.set_xlim([start_year, end_year + 1])
        ax.spines[["top", "right"]].set_visible(False)
        ax.set_xlabel("Year", font=font, size=12)
        ax.set_ylabel("Temperature anomaly (°C)", font=font, size=12)

        fig.suptitle(
            f"Mean surface temperature anomalies (°C) from {start_year} to {end_year}",
            font=font,
            size=20,
        )

        handles, labels = ax.get_legend_handles_labels()
        priority = {"Regional mean", "IQR (25th–75th)"}
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
    return (lineplot,)


@app.cell
def _(lineplot, mo, year_range):
    fig_total = lineplot(
        start_year=year_range.value[0],
        end_year=year_range.value[1],
    )
    mo.vstack([year_range, mo.as_html(fig_total)])
    return


@app.cell
def _(df, font, load_cmap, math, max_year, min_year, np, plt):
    def lineplot_mean_only(start_year=min_year, end_year=max_year):
        fig, ax = plt.subplots(figsize=(11, 7))
        colors = load_cmap("te_aa_no_areois").colors

        data = (
            df.copy()
            .query("@start_year <= TIME_PERIOD <= @end_year")
            .sort_values(["COUNTRY", "TIME_PERIOD"])
        )

        yearly = (
            data.groupby("TIME_PERIOD")["value"]
            .agg(
                mean="mean",
                q1=lambda s: s.quantile(0.25),
                q3=lambda s: s.quantile(0.75),
            )
            .reset_index()
            .sort_values("TIME_PERIOD")
        )
        years = yearly["TIME_PERIOD"]
        mean = yearly["mean"]

        countries = sorted(data["COUNTRY"].dropna().unique())
        color_by_country = {
            country: colors[i % len(colors)] for i, country in enumerate(countries)
        }

        ax.plot(
            years,
            mean,
            color="#111827",
            linewidth=2.6,
            zorder=4,
            label="Regional mean",
        )

        ax.axhline(y=0, color="darkred", linewidth=2.5, linestyle="--", zorder=0)
        step = max(1, math.ceil((end_year + 1 - start_year) / 5))
        ticks = start_year + np.arange(0, 5) * step
        ax.set_xticks([])
        ax.set_yticks([])
        ax.set_xlim([start_year, end_year + 1])
        ax.spines[["top", "right"]].set_visible(False)

        fig.suptitle(
            f"Mean surface temperature anomalies (°C) from {start_year} to {end_year}",
            font=font,
            size=20,
        )

        handles, labels = ax.get_legend_handles_labels()
        priority = {"Regional mean", "IQR (25th–75th)"}
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
    )

    mean.savefig("mean_surface.svg", bbox_inches='tight')
    return


@app.cell
def _(ax_text, df, fig_text, font, load_cmap, max_year, min_year, np, plt):
    def lineplot_labeled(x_min=None):
        if x_min is None:
            x_min = min_year

        fig, ax = plt.subplots(figsize=(11, 8), dpi=150)
        fig.subplots_adjust(left=0.1, right=0.78, top=0.88, bottom=0.1)
        colors = load_cmap("te_aa_no_areois").colors

        data = df.copy()
        data = data[data.TIME_PERIOD >= x_min].sort_values(["COUNTRY", "TIME_PERIOD"])

        yearly_mean = (
            data.groupby("TIME_PERIOD")["value"].mean().reset_index().sort_values("TIME_PERIOD")
        )

        latest = data[data.TIME_PERIOD == data.TIME_PERIOD.max()]
        sorted_countries = (
            latest.sort_values(by="value", ascending=False)["COUNTRY"].values
        )

        n = len(sorted_countries)
        x_text = max_year + 2
        y_text = np.linspace(
            data["value"].min(), data["value"].max(), num=max(n, 2)
        )[::-1]
        x_start = max_year + 0.4

        for i, country in enumerate(sorted_countries):
            cdata = data[data.COUNTRY == country]
            if cdata.empty:
                continue
            color = colors[i % len(colors)]
            ax.plot(
                cdata["TIME_PERIOD"],
                cdata["value"],
                color=color,
                linewidth=1.2,
                alpha=0.7,
            )
            ax.scatter(
                cdata["TIME_PERIOD"],
                cdata["value"],
                color=color,
                s=8,
                zorder=3,
            )
            last_y = cdata.value.values[-1]
            ax.plot(
                [x_start, x_text],
                [last_y, y_text[i]],
                color=color,
                linewidth=0.8,
                alpha=0.7,
            )
            ax_text(
                x=x_text + 0.3,
                y=y_text[i],
                color=color,
                s=country,
                ax=ax,
                size=9,
            )

        ax.plot(
            yearly_mean["TIME_PERIOD"],
            yearly_mean["value"],
            color="#111827",
            linewidth=2.8,
            zorder=5,
            label="Regional mean",
        )
        ax_text(
            x=yearly_mean["TIME_PERIOD"].iloc[-1] + 0.3,
            y=yearly_mean["value"].iloc[-1],
            s="mean",
            color="#111827",
            ax=ax,
            size=11,
            weight="bold",
        )

        ax.axhline(y=0, color="darkred", linewidth=2, linestyle="--", zorder=0)
        ax.grid(axis="x", alpha=0.5, ls="--")
        ax.spines[["top", "right"]].set_visible(False)

        step = max(1, int((max_year + 1 - x_min) / 5))
        ticks = x_min + np.arange(0, 6) * step
        ticks = ticks[ticks <= max_year]
        ax.set_xticks(ticks)
        ax.set_xlim([x_min, max_year + 12])

        fig_text(
            fig=fig,
            s="Mean surface temperature anomalies across Pacific island countries",
            font=font,
            size=18,
            y=0.98,
            x=0.1,
            ha="left",
        )
        fig_text(
            fig=fig,
            s="Country series with <regional mean> highlighted. Zero = long-term average temperature.",
            font=font,
            size=12,
            y=0.94,
            x=0.1,
            ha="left",
            highlight_textprops=[{"color": "#111827", "weight": "bold"}],
        )

        ax.set_xlabel("Year", font=font, size=12)
        ax.set_ylabel("Temperature anomaly (°C)", font=font, size=12)
        return fig

    lineplot_labeled(1990)
    return


@app.cell
def _(mo):
    mo.md(r"""
    ### Maps

    Explore whether surface temperature anomalies in the latest year show a spatial
    pattern across Pacific EEZs.
    """)
    return


@app.cell
def _(ccrs, df, gpd):
    from shapely.ops import transform

    eez = gpd.read_file("data/raw/Pacific islands region EEZs.geojson")
    projection = ccrs.PlateCarree(central_longitude=180)
    eez = eez.replace(
        {
            "Wallis et Futuna": "Wallis and Futuna",
            "Polynesie Francaise": "French Polynesia",
            "Micronesia": "Federated States of Micronesia",
        }
    )

    latest_year = int(df.TIME_PERIOD.max())
    df_latest = df[df.TIME_PERIOD == latest_year].copy()

    eez_st = (
        eez.merge(df_latest, left_on="country", right_on="COUNTRY")
        .drop(["country", "id"], axis=1)
        .reset_index(drop=True)
    )

    def to_pacific_lon(geom):
        def _shift(x, y, z=None):
            x = x + 360 if x < 0 else x
            return (x, y) if z is None else (x, y, z)

        return transform(_shift, geom)

    g = eez_st.copy()
    g["geometry"] = g.geometry.apply(to_pacific_lon)
    g = g.set_crs(4326, allow_override=True)

    centroids = g.centroid

    def wrap_lon(lon):
        return ((lon + 180) % 360) - 180

    eez_st["centroid"] = centroids.apply(
        lambda p: type(p)(wrap_lon(p.x), p.y)
    )
    return eez_st, latest_year, projection


@app.cell
def _(eez_st, load_cmap, mpl):
    max_val = eez_st["value"].max()
    min_val = eez_st["value"].min()
    abs_max = max(abs(min_val), abs(max_val))

    colormap = load_cmap("Sunset", cmap_type="continuous", reverse=True)
    norm = mpl.colors.TwoSlopeNorm(vmin=-abs_max, vcenter=0, vmax=abs_max)
    sm = mpl.cm.ScalarMappable(cmap=colormap, norm=norm)

    eez_st["color"] = eez_st["value"].apply(
        lambda v: mpl.colors.to_hex(sm.to_rgba(v))
    )
    return abs_max, sm


@app.cell
def _(abs_max, ax_text, ccrs, eez_st, latest_year, plt, projection, sm):
    def plot_pacific_surface_temp():
        fig, ax = plt.subplots(
            figsize=(10, 8),
            subplot_kw={"projection": projection},
        )
        ax.spines[["top", "right", "bottom", "left"]].set_visible(False)

        eez_st.plot(
            ax=ax,
            transform=ccrs.PlateCarree(),
            color=eez_st["color"],
            edgecolor="white",
            linewidth=0.2,
        )

        for _, row in eez_st.iterrows():
            x, y = projection.transform_point(
                row.centroid.x, row.centroid.y, ccrs.PlateCarree()
            )
            ax_text(ax=ax, x=x, y=y, s=row.REF_AREA, color="black", size=9)

        cbar = fig.colorbar(sm, ax=ax, shrink=0.55, pad=0.02)
        cbar.set_label(f"Surface temperature anomaly (°C), {latest_year}")
        cbar.ax.set_ylim(-abs_max, abs_max)

        ax.set_title(
            f"Mean surface temperature anomalies by EEZ — {latest_year}",
            size=14,
        )
        return fig

    plot_pacific_surface_temp()
    return


@app.cell
def _(eez_st):
    eez_st[["COUNTRY", "REF_AREA", "TIME_PERIOD", "value", "color"]]
    return


@app.cell
def _(df):
    df.to_csv('data/processed/surface_temperature_anomaly.csv',  index=False)
    return


@app.cell
def _(df):
    df.value.min(), df.value.max()
    return


@app.cell
def _(mo):
    mo.md(r"""
    ### Takeaways to explore

    - Which years show the strongest regional warming or cooling?
    - Do land surface anomalies move in sync with sea-surface temperature anomalies
      (`sea_surface_temperature_analysis.py`)?
    - How do surface temperature anomalies relate to rainfall patterns
      (`rainfall_anomalies_analysis.py`)?
    """)
    return


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
def _(df):
    df[df['TIME_PERIOD']==2024]
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
