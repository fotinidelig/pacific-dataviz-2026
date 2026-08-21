import marimo

__generated_with = "0.17.6"
app = marimo.App(
    width="full",
    layout_file="layouts/red_index_list_analysis.slides.json",
)


@app.cell
def _(mo):
    mo.md(r"""
    ### Basic Analysis of data from the Pacific Data Hub

    Using example of the **Red List Index** [(link)](https://stats.pacificdata.org/vis?lc=en&df[ds]=ds%3ASPC2&df[id]=DF_SDG_15&df[ag]=SPC&df[vs]=3.0&dq=A.ER_RSK_LST.........&pd=,&to[TIME_PERIOD]=false&vw=tb).

    Metadata can be found under [this](https://unstats.un.org/sdgs/metadata/files/Metadata-15-05-01.pdf) link.

    The index ranges from **1** (no species expected to become extinct in the near future)
    to **0** (all species extinct).
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
    import geopandas as gpd
    import cartopy.crs as ccrs
    import math

    font = load_google_font("Elms Sans")
    set_default_font(font)
    return (
        ax_text,
        ccrs,
        drawarrow,
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

    key = dict(SERIES="ER_RSK_LST", SEX="_T", AGE="_T")
    params = dict(startPeriod="1980", endPeriod="2024")
    keep_cols = ["REF_AREA", "TIME_PERIOD", "value"]

    data = spc.data("DF_SDG", key=key, params=params)
    df = sdmx.to_pandas(data)
    df = df.reset_index()[keep_cols]
    df.TIME_PERIOD = df.TIME_PERIOD.astype(int)

    df["COUNTRY"] = df["REF_AREA"].replace(
        {
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
    )
    return (df,)


@app.cell
def _(df):
    df.TIME_PERIOD.unique()
    return


@app.cell
def _(df):
    countries = {
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

    print(set(countries.values()) - set(df.COUNTRY.unique()))
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
    return


@app.cell
def _(df, mo):
    stats_all = df["value"].describe()
    stats_no_guam = df[df.REF_AREA != "GU"]["value"].describe()
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
        df.groupby("COUNTRY")["value"].agg(
            ["count", "mean", "median", "std", "min", "max"]
        )
    )}""")
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
def _(df, font, mo, plt, sns):
    max_year = int(df.TIME_PERIOD.max())
    min_year = int(df.TIME_PERIOD.min())

    def boxplot(start_year=min_year, end_year=max_year, with_guam=True):
        fig, ax = plt.subplots(figsize=(12, 5))

        data = df.copy()
        data = data[data["TIME_PERIOD"].between(int(start_year), int(end_year))]
        if not with_guam:
            data = data[data.REF_AREA != "GU"]

        sns.boxplot(ax=ax, data=data, x="TIME_PERIOD", y="value")
        ax.set_xlabel("Year", font=font, size=15)
        ax.set_ylabel("Red List Index", font=font, size=12)
        ax.spines[["top", "right"]].set_visible(False)

        ax.set_yticklabels(ax.get_yticklabels(), font=font)
        ax.set_xticklabels(ax.get_xticklabels(), font=font)

        fig.suptitle(
            "Boxplot of Red List Index per year",
            font=font,
            size=20,
        )
        return fig

    year_range = mo.ui.range_slider(
        start=min_year,
        stop=max_year,
        step=1,
        value=(2008, max_year),
        label="Year range",
        show_value=True,
        full_width=True,
    )

    with_guam = mo.ui.dropdown(
        options={"Include": True, "Exclude": False},
        value="Include",
        label="Guam",
    )
    return boxplot, max_year, min_year, with_guam, year_range


@app.cell
def _(boxplot, mo, with_guam, year_range):
    start_year, end_year = year_range.value
    fig = boxplot(
        start_year=start_year,
        end_year=end_year,
        with_guam=with_guam.value,
    )

    mo.vstack(
        [
            mo.hstack([year_range, with_guam], justify="start", gap=1),
            mo.as_html(fig),
        ]
    )
    return


@app.cell
def _(df, font, load_cmap, math, max_year, min_year, np, plt):
    def lineplot(start_year=min_year, end_year=max_year, with_guam=True):
        fig, ax = plt.subplots(figsize=(11, 7))
        colors = load_cmap("te_aa_no_areois").colors

        data = df.copy()
        data = data[
            data["TIME_PERIOD"].between(int(start_year), int(end_year))
        ].sort_values(["REF_AREA", "TIME_PERIOD"])
        if not with_guam:
            data = data[data.REF_AREA != "GU"]

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
            median,
            color="#111827",
            linewidth=2.6,
            zorder=4,
            label="Regional median",
        )

        ax.grid(alpha=0.35)
        step = math.ceil((end_year + 1 - start_year) / 5)
        ticks = start_year + np.arange(0, 5) * step
        ax.set_xticks(ticks)
        ax.set_xlim([start_year, end_year + 1])
        ax.spines[["top", "right"]].set_visible(False)
        ax.set_xlabel("Year", font=font, size=12)
        ax.set_ylabel("Red List Index", font=font, size=12)

        fig.suptitle(
            f"Red List Index from {start_year} to {end_year}",
            font=font,
            size=20,
        )

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

    return (lineplot,)


@app.cell
def _(lineplot, mo, with_guam, year_range):
    fig_total = lineplot(
        start_year=year_range.value[0],
        end_year=year_range.value[1],
        with_guam=with_guam.value,
    )
    mo.vstack(
        [
            mo.hstack([year_range, with_guam], justify="start", gap=1),
            mo.as_html(fig_total),
        ]
    )
    return


@app.cell
def _(ax_text, df, drawarrow, fig_text, font, load_cmap, max_year, np, plt):
    def lineplot_labeled(x_min=1980):
        fig, ax = plt.subplots(figsize=(11, 8), dpi=150)
        fig.subplots_adjust(left=0.1, right=0.78, top=0.88, bottom=0.1)
        colors = load_cmap("te_aa_no_areois").colors

        data = df.copy()
        data = data[data.TIME_PERIOD >= int(x_min)]
        latest = int(data.TIME_PERIOD.max())
        sorted_df = (
            data[data.TIME_PERIOD == latest]
            .sort_values(by="value", ascending=False)
            .reset_index(drop=True)
        )

        countries_sorted = sorted_df.COUNTRY.values
        x_text = latest + 3
        n_labels = max(len(countries_sorted) - 1, 1)
        y_text = np.linspace(0.57, 1, num=n_labels)[::-1]
        x_start = latest + 0.5
        label_i = 0

        for i, country in enumerate(countries_sorted):
            cdata = data[data.COUNTRY == country]
            color = colors[i % len(colors)]
            ax.plot(
                cdata.TIME_PERIOD,
                cdata.value,
                color=color,
                linewidth=1.2,
                zorder=2,
            )
            ax.scatter(
                cdata.TIME_PERIOD,
                cdata.value,
                color=color,
                s=8,
                zorder=3,
            )

            last_y = float(cdata.value.values[-1])
            if country == "Guam":
                ax_text(x=latest + 1, y=last_y, color=color, s=country, ax=ax)
            else:
                yi = y_text[min(label_i, len(y_text) - 1)]
                ax.plot([x_start, x_text], [last_y, yi], color=color, linewidth=0.8)
                ax_text(x=x_text + 0.5, y=yi, color=color, s=country, ax=ax)
                label_i += 1

            if country == "Niue" and x_min < 2004:
                point_1 = [
                    2000,
                    float(cdata[cdata.TIME_PERIOD == 2000].value.iloc[0]),
                ]
                point_2 = [
                    2004,
                    float(cdata[cdata.TIME_PERIOD == 2004].value.iloc[0]),
                ]
                ax.scatter(
                    [point_1[0], point_2[0]],
                    [point_1[1], point_2[1]],
                    color="darkred",
                    s=25,
                    zorder=5,
                )
                drawarrow.ax_arrow(
                    tail_position=[2000, point_1[1] - 0.004],
                    head_position=[1996, 0.665],
                    color="darkred",
                    zorder=100,
                    ax=ax,
                )
                ax_text(
                    s=(
                        "What measures did <Niue> take\nbetween <2000> and <2004>"
                        "\nto protect more species ?"
                    ),
                    x=1999.5,
                    y=0.66,
                    color="black",
                    ha="right",
                    textalign="right",
                    size=11,
                    ax=ax,
                    highlight_textprops=[
                        {"color": color},
                        {"color": "darkred"},
                        {"color": "darkred"},
                    ],
                )

        if x_min < 2008:
            ax.axvline(x=2008, color="darkred", zorder=-100)
            ax_text(
                s="All indices are in constant \ndecline after <2008>",
                x=2008.4,
                y=1,
                color="black",
                size=12,
                ax=ax,
                highlight_textprops=[{"color": "darkred"}],
            )

        drawarrow.fig_arrow(
            fig=fig,
            tail_position=[0.058, 0.2],
            head_position=[0.058, 0.08],
            color="gray",
            linewidth=1,
        )
        fig_text(
            fig=fig,
            x=0.04,
            y=0.08,
            s="lower index =",
            color="gray",
            ha="right",
            va="bottom",
            rotation="vertical",
        )
        fig_text(
            fig=fig,
            x=0.05,
            y=0.08,
            s="more species going extinct",
            color="gray",
            ha="right",
            va="bottom",
            rotation="vertical",
        )

        drawarrow.fig_arrow(
            fig=fig,
            tail_position=[0.058, 0.8],
            head_position=[0.058, 0.92],
            color="gray",
            linewidth=1,
        )
        fig_text(
            fig=fig,
            x=0.04,
            y=0.92,
            s="higher index =",
            color="gray",
            ha="right",
            va="top",
            rotation="vertical",
        )
        fig_text(
            fig=fig,
            x=0.05,
            y=0.92,
            s="less species in extinction",
            color="gray",
            ha="right",
            va="top",
            rotation="vertical",
        )

        step = max(1, int((latest + 1 - x_min) / 5))
        ticks = x_min + np.arange(0, 6) * step
        ticks = ticks[ticks <= latest]
        ax.set_xticks(ticks)
        ax.grid(axis="x", alpha=0.6, ls="--")
        ax.spines[["top", "right"]].set_visible(False)
        ax.set_xlim([x_min, latest + 12])

        fig_text(
            fig=fig,
            s="Species in the pacific islands are going extinct.",
            font=font,
            size=18,
            y=0.98,
            x=0.1,
            ha="left",
        )
        fig_text(
            fig=fig,
            s=(
                "The <Red List Index> measures how many species are endangered.\n"
                "<1> indicates no endangered species, <0> indicates all are extinct."
            ),
            font=font,
            size=12,
            y=0.93,
            x=0.1,
            ha="left",
            highlight_textprops=[
                {"color": "darkred"},
                {"color": "darkred"},
                {"color": "darkred"},
            ],
        )

        ax.set_xlabel("Year", font=font, size=12)
        ax.set_ylabel("Red List Index", font=font, size=12)
        return fig

    lineplot_labeled(2010)
    return


@app.cell
def _(mo):
    mo.md(r"""
    ### Maps

    Explore whether the latest Red List Index values show a spatial pattern across
    Pacific EEZs.
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

    eez_red_index = (
        eez.merge(df_latest, left_on="country", right_on="COUNTRY")
        .drop(["country", "id"], axis=1)
        .reset_index(drop=True)
    )

    def to_pacific_lon(geom):
        def _shift(x, y, z=None):
            x = x + 360 if x < 0 else x
            return (x, y) if z is None else (x, y, z)

        return transform(_shift, geom)

    g = eez_red_index.copy()
    g["geometry"] = g.geometry.apply(to_pacific_lon)
    g = g.set_crs(4326, allow_override=True)

    centroids = g.centroid

    def wrap_lon(lon):
        return ((lon + 180) % 360) - 180

    eez_red_index["centroid"] = centroids.apply(
        lambda p: type(p)(wrap_lon(p.x), p.y)
    )
    return eez_red_index, latest_year, projection


@app.cell
def _(eez_red_index, load_cmap, mpl):
    max_ri = eez_red_index["value"].max()
    min_ri = eez_red_index["value"].min()

    colormap = load_cmap("Sunset", cmap_type="continuous", reverse=True)
    norm = mpl.colors.Normalize(vmin=min_ri, vmax=max_ri)
    sm = mpl.cm.ScalarMappable(cmap=colormap, norm=norm)

    eez_red_index["color"] = eez_red_index["value"].apply(
        lambda v: mpl.colors.to_hex(sm.to_rgba(v))
    )
    return max_ri, min_ri, sm


@app.cell
def _(
    ax_text,
    ccrs,
    eez_red_index,
    latest_year,
    max_ri,
    min_ri,
    plt,
    projection,
    sm,
):
    def plot_pacific_red_list():
        fig, ax = plt.subplots(
            figsize=(10, 8),
            subplot_kw={"projection": projection},
        )
        ax.spines[["top", "right", "bottom", "left"]].set_visible(False)

        eez_red_index.plot(
            ax=ax,
            transform=ccrs.PlateCarree(),
            color=eez_red_index["color"],
            edgecolor="white",
            linewidth=0.2,
        )

        for _, row in eez_red_index.iterrows():
            x, y = projection.transform_point(
                row.centroid.x, row.centroid.y, ccrs.PlateCarree()
            )
            ax_text(ax=ax, x=x, y=y, s=row.REF_AREA, color="black", size=9)

        cbar = fig.colorbar(sm, ax=ax, shrink=0.55, pad=0.02)
        cbar.set_label(f"Red List Index, {latest_year}")
        cbar.ax.set_ylim(min_ri, max_ri)

        ax.set_title(f"Red List Index by EEZ — {latest_year}", size=14)
        return fig

    plot_pacific_red_list()
    return


@app.cell
def _(eez_red_index):
    eez_red_index[["COUNTRY", "REF_AREA", "TIME_PERIOD", "value", "color"]]
    return


@app.cell
def _(df):
    df.to_csv("data/processed/red_list_index.csv", index=False)
    return


@app.cell
def _(df):
    df.value.min(), df.value.max()
    return


@app.cell
def _(mo):
    mo.md(r"""
    ### Takeaways to explore

    - Which countries sit far below the regional median (e.g. Guam)?
    - What changed for Niue between 2000 and 2004?
    - Is the post-2008 decline shared across all territories?
    - Do spatial clusters appear on the EEZ map for the latest year?
    """)
    return


@app.cell
def _():
    import marimo as mo

    return (mo,)


if __name__ == "__main__":
    app.run()
