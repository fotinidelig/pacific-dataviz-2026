import marimo

__generated_with = "0.17.6"
app = marimo.App(width="full")


@app.cell
def _():
    import marimo as mo
    return (mo,)


@app.cell
def _(mo):
    mo.md(r"""
    ### Exclusive Economic Zone (EEZ) areas & centroids — Pacific islands

    - **Areas**: geodesic km² from `data/raw/Pacific islands region EEZs.geojson`
    - **Missing territories** (e.g. Pitcairn Islands): supplemented from Marine Regions
      [`eez_v12.shp`](https://marineregions.org/gazetteer.php?p=details&id=8439)
    - **Centroids**: from Marine Regions `eez_v12.shp`; when a territory has multiple EEZ
      parts, the centroid of the **largest** part is used (e.g. Kiribati → Line Group)
    """)
    return


@app.cell
def _():
    import geopandas as gpd
    import pandas as pd
    from pyproj import Geod
    return Geod, gpd, pd


@app.cell
def _():
    country_codes = {
        "American Samoa": "AS",
        "Cook Islands": "CK",
        "Fiji": "FJ",
        "French Polynesia": "PF",
        "Guam": "GU",
        "Kiribati": "KI",
        "Marshall Islands": "MH",
        "Micronesia, Fed. Sts.": "FM",
        "Nauru": "NR",
        "New Caledonia": "NC",
        "Niue": "NU",
        "Northern Mariana Islands": "MP",
        "Palau": "PW",
        "Papua New Guinea": "PG",
        "Pitcairn Islands": "PN",
        "Samoa": "WS",
        "Solomon Islands": "SB",
        "Tokelau": "TK",
        "Tonga": "TO",
        "Tuvalu": "TV",
        "Vanuatu": "VU",
        "Wallis and Futuna": "WF",
    }

    territory_to_country = {
        "American Samoa": "American Samoa",
        "Cook Islands": "Cook Islands",
        "Fiji": "Fiji",
        "French Polynesia": "French Polynesia",
        "Guam": "Guam",
        "Marshall Islands": "Marshall Islands",
        "Micronesia": "Micronesia, Fed. Sts.",
        "Nauru": "Nauru",
        "New Caledonia": "New Caledonia",
        "Niue": "Niue",
        "Northern Mariana Islands": "Northern Mariana Islands",
        "Palau": "Palau",
        "Papua New Guinea": "Papua New Guinea",
        "Pitcairn": "Pitcairn Islands",
        "Samoa": "Samoa",
        "Solomon Islands": "Solomon Islands",
        "Tokelau": "Tokelau",
        "Tonga": "Tonga",
        "Tuvalu": "Tuvalu",
        "Vanuatu": "Vanuatu",
        "Wallis and Futuna": "Wallis and Futuna",
    }
    return country_codes, territory_to_country


@app.cell
def _(country_codes, gpd):
    path = "data/raw/Pacific islands region EEZs.geojson"

    eez = gpd.read_file(path)
    eez = eez.replace({
        "Polynesie Francaise": "French Polynesia",
        "Wallis et Futuna": "Wallis and Futuna",
        "Micronesia": "Micronesia, Fed. Sts.",
    })
    return (eez,)


@app.cell
def _(Geod, country_codes, eez, gpd, pd, territory_to_country):
    geod = Geod(ellps="WGS84")

    def geodesic_area_km2(geom):
        area_m2, _ = geod.geometry_area_perimeter(geom)
        return abs(area_m2) / 1e6

    eez_areas_geojson = (
        eez.assign(
            area_km2=eez.geometry.apply(geodesic_area_km2),
            country_code=eez["country"].map(country_codes),
        )
        [["country", "country_code", "area_km2"]]
    )

    # Supplement territories missing from the Pacific GeoJSON (e.g. Pitcairn)
    vliz_path = "data/raw/World_EEZ_v12_20231025/eez_v12.shp"
    vliz = gpd.read_file(vliz_path)
    vliz = vliz[vliz["POL_TYPE"] == "200NM"].copy()
    vliz["country"] = vliz["TERRITORY1"].map(territory_to_country)
    vliz.loc[vliz["GEONAME"].str.contains("Kiribati", na=False), "country"] = "Kiribati"

    missing = set(country_codes) - set(eez_areas_geojson["country"])
    vliz_supplement = (
        vliz[vliz["country"].isin(missing)]
        .assign(country_code=lambda d: d["country"].map(country_codes))
        [["country", "country_code", "AREA_KM2"]]
        .rename(columns={"AREA_KM2": "area_km2"})
    )

    eez_areas = (
        pd.concat([eez_areas_geojson, vliz_supplement], ignore_index=True)
        .sort_values("area_km2", ascending=False)
        .reset_index(drop=True)
    )
    eez_areas["area_km2"] = eez_areas["area_km2"].round(0).astype(int)
    return eez_areas, vliz


@app.cell
def _(country_codes, pd, vliz):
    largest = vliz[vliz["country"].notna()].loc[
        vliz[vliz["country"].notna()].groupby("country")["AREA_KM2"].idxmax()
    ]

    eez_centroids = (
        largest.assign(
            country_code=largest["country"].map(country_codes),
            latitude=largest["Y_1"],
            longitude=largest["X_1"],
            eez_part=largest["TERRITORY1"],
            area_km2=largest["AREA_KM2"].round(0).astype(int),
            crs="EPSG:4326",
        )
        [["country", "country_code", "latitude", "longitude", "eez_part", "area_km2", "crs"]]
        .sort_values("area_km2", ascending=False)
        .reset_index(drop=True)
    )
    return (eez_centroids,)


@app.cell
def _(eez_areas):
    eez_areas.to_csv("data/processed/eez_areas.csv", index=False)
    eez_areas
    return


@app.cell
def _(eez_centroids):
    eez_centroids.to_csv("data/processed/eez_centroids.csv", index=False)
    eez_centroids
    return


if __name__ == "__main__":
    app.run()
