import marimo

__generated_with = "0.17.6"
app = marimo.App(width="full")


@app.cell
def _():
    import marimo as mo
    import pandas as pd
    import sdmx
    import numpy as np
    return mo, np, pd, sdmx


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### Data merging — country-specific for 2024

    Merge the following into one row per country (`REF_AREA`):

    1. Red List Index (PDH, 2024)
    2. Sea Surface Temperature Anomalies (PDH, 2024)
    3. Mean Surface Temperature Anomalies (PDH, 2024)
    4. Sea Level Anomalies (PDH, 2023)
    5. Land area (PDH, 2023)
    6. EEZ area — `data/processed/eez_areas.csv`
    7. EEZ centroids — `data/processed/eez_centroids.csv`
    8. Population — `data/processed/population_24.csv`
    9. Exports — `data/processed/country_export_data.csv`
    10. Island counts — `data/processed/island_counts.csv`
    """)
    return


@app.cell
def _(sdmx):
    def load_pdh_data(key, keep_cols, source, params=None):
        spc = sdmx.Client("SPC")
        params = params or {}

        if key is None:
            data = spc.data(source, params=params)
        else:
            data = spc.data(source, key=key, params=params)

        df = sdmx.to_pandas(data)
        df = df.reset_index()[keep_cols]
        df["TIME_PERIOD"] = df["TIME_PERIOD"].astype(int)
        return df

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
    codes = list(countries.keys())
    return codes, countries, load_pdh_data


@app.cell
def _(codes, load_pdh_data):
    red_list_idx = load_pdh_data(
        key=dict(SERIES="ER_RSK_LST"),
        keep_cols=["REF_AREA", "TIME_PERIOD", "value"],
        params=dict(startPeriod="2024", endPeriod="2024"),
        source="DF_SDG",
    )
    red_list_idx = red_list_idx.rename(columns={"value": "red_list_index"})
    red_list_idx = red_list_idx[["REF_AREA", "red_list_index"]]
    print("Red List Index — missing:", set(codes) - set(red_list_idx.REF_AREA.unique()))
    return (red_list_idx,)


@app.cell
def _(codes, load_pdh_data):
    ssta = load_pdh_data(
        key=dict(CLIMATE_CHANGE_INDICATORS="SST_ANOM"),
        keep_cols=["GEO_PICT", "TIME_PERIOD", "value"],
        params=dict(startPeriod="2024", endPeriod="2024"),
        source="DF_CLIMATE_CHANGE",
    )
    ssta = ssta.rename(columns={"value": "ssta", "GEO_PICT": "REF_AREA"})
    ssta = ssta[["REF_AREA", "ssta"]]
    print("SSTA — missing:", set(codes) - set(ssta.REF_AREA.unique()))
    return (ssta,)


@app.cell
def _(codes, load_pdh_data):
    st_anom = load_pdh_data(
        key=dict(CLIMATE_CHANGE_INDICATORS="ST_ANOM"),
        keep_cols=["GEO_PICT", "TIME_PERIOD", "value"],
        params=dict(startPeriod="2024", endPeriod="2024"),
        source="DF_CLIMATE_CHANGE",
    )
    st_anom = st_anom.rename(columns={"value": "st_anom", "GEO_PICT": "REF_AREA"})
    st_anom = st_anom[["REF_AREA", "st_anom"]]
    print("ST_ANOM — missing:", set(codes) - set(st_anom.REF_AREA.unique()))
    return (st_anom,)


@app.cell
def _(codes, load_pdh_data):
    sla = load_pdh_data(
        key=dict(CLIMATE_CHANGE_INDICATORS="SEA_LVL"),
        keep_cols=["GEO_PICT", "TIME_PERIOD", "value"],
        params=dict(startPeriod="2023", endPeriod="2023"),
        source="DF_CLIMATE_CHANGE",
    )
    sla = sla.rename(columns={"value": "sla", "GEO_PICT": "REF_AREA"})
    sla = sla[["REF_AREA", "sla"]]
    print("SLA — missing:", set(codes) - set(sla.REF_AREA.unique()))
    return (sla,)


@app.cell
def _(codes, load_pdh_data):
    land_area = load_pdh_data(
        key=None,
        keep_cols=["GEO_PICT", "TIME_PERIOD", "value"],
        params=dict(startPeriod="2023", endPeriod="2023"),
        source="DF_LAND_USE",
    )
    land_area = land_area.rename(columns={"value": "land_area", "GEO_PICT": "REF_AREA"})
    land_area = land_area[["REF_AREA", "land_area"]]
    print("Land area — missing:", set(codes) - set(land_area.REF_AREA.unique()))
    return (land_area,)


@app.cell
def _(codes, pd):
    eez_area = pd.read_csv("data/processed/eez_areas.csv")
    eez_area = eez_area.rename(columns={"area_km2": "eez_area", "country_code": "REF_AREA"})
    eez_area = eez_area[["REF_AREA", "eez_area"]]
    print("EEZ area — missing:", set(codes) - set(eez_area.REF_AREA.unique()))
    return (eez_area,)


@app.cell
def _(codes, pd):
    eez_centroids = pd.read_csv("data/processed/eez_centroids.csv")
    eez_centroids = eez_centroids.rename(
        columns={
            "country_code": "REF_AREA",
            "latitude": "eez_latitude",
            "longitude": "eez_longitude",
            "crs": "eez_crs",
        }
    )
    eez_centroids = eez_centroids[
        ["REF_AREA", "eez_latitude", "eez_longitude", "eez_part", "eez_crs"]
    ]
    print("EEZ centroids — missing:", set(codes) - set(eez_centroids.REF_AREA.unique()))
    return (eez_centroids,)


@app.cell
def _(codes, countries, pd):
    name_to_code = {name: code for code, name in countries.items()}
    name_to_code["Micronesia, Fed. Sts."] = "FM"
    name_to_code["Micronesia Fed. Sts."] = "FM"

    population = pd.read_csv("data/processed/population_24.csv")
    population["REF_AREA"] = population["Country Name"].map(name_to_code)
    population = population.rename(columns={"2024": "population"})
    population["population"] = pd.to_numeric(population["population"], errors="coerce")
    population = population[["REF_AREA", "population"]]
    print("Population — missing:", set(codes) - set(population.REF_AREA.dropna().unique()))
    return name_to_code, population


@app.cell
def _(codes, name_to_code, pd):
    def parse_abbreviated_number(value):
        """Convert strings like '13M', '329K', '1.21B' to absolute floats."""
        if value is None or (isinstance(value, float) and pd.isna(value)):
            return pd.NA
        text = str(value).strip().upper().replace(",", "")
        if text == "" or text == "NAN":
            return pd.NA
        multipliers = {"K": 1_000, "M": 1_000_000, "B": 1_000_000_000}
        suffix = text[-1]
        if suffix in multipliers:
            return float(text[:-1]) * multipliers[suffix]
        return float(text)

    exports = pd.read_csv("data/processed/country_export_data.csv")
    exports["REF_AREA"] = exports["Country"].map(name_to_code)
    exports = exports.rename(
        columns={
            "HS": "export_hs",
            "HS Name": "export_hs_name",
            "HS Value": "export_hs_value",
            "Exports Value": "exports_value",
            "export_class": "export_class",
            "Order": "exporter_order",
            "Total Exporters": "exporters_total",
        }
    )
    exports["export_hs_value"] = exports["export_hs_value"].map(parse_abbreviated_number)
    exports["exports_value"] = exports["exports_value"].map(parse_abbreviated_number)
    exports = exports[
        [
            "REF_AREA",
            "export_hs",
            "export_hs_name",
            "export_hs_value",
            "exports_value",
            "export_class",
            "exporter_order",
            "exporters_total",
        ]
    ]
    print("Exports — missing:", set(codes) - set(exports.REF_AREA.dropna().unique()))
    return (exports,)


@app.cell
def _(codes, pd):
    island_counts = pd.read_csv("data/processed/island_counts.csv")
    island_counts = island_counts.rename(columns={"country_code": "REF_AREA"})
    island_counts = island_counts[["REF_AREA", "number_of_islands", "atolls"]]
    print("Islands — missing:", set(codes) - set(island_counts.REF_AREA.unique()))
    return (island_counts,)


@app.cell
def _(
    codes,
    countries,
    eez_area,
    eez_centroids,
    exports,
    island_counts,
    land_area,
    pd,
    population,
    red_list_idx,
    sla,
    ssta,
    st_anom,
):
    country_table = pd.DataFrame(
        {"REF_AREA": codes, "country": [countries[code] for code in codes]}
    )

    merged = country_table
    for df in [
        red_list_idx,
        ssta,
        st_anom,
        sla,
        land_area,
        eez_area,
        eez_centroids,
        population,
        exports,
        island_counts,
    ]:
        merged = merged.merge(df, on="REF_AREA", how="left")

    merged = merged.sort_values("REF_AREA").reset_index(drop=True)
    return (merged,)


@app.cell
def _(merged, mo):
    mo.md(f"""
    ### Merged dataset ({len(merged)} countries)

    Missing values per column:
    """)
    return


@app.cell
def _(merged, mo):
    mo.as_html(merged.isna().sum().to_frame("missing"))
    return


@app.cell
def _(merged):
    for col in merged.columns:
        try:
            print(col, "max:", merged[col].max(), "min:", merged[col].min())
        except:
            continue
    return


@app.cell
def _(merged, np):
    n_islands = merged[merged.number_of_islands > 1].sort_values(by='number_of_islands', ascending=False).number_of_islands.values
    n_islands_log = np.round(np.log(n_islands))
    merged['log_number_of_islands'] = np.round(np.log(merged['number_of_islands'])).astype(int)
    merged[['number_of_islands', 'log_number_of_islands']]
    return


@app.cell
def _(merged, np):
    pop = merged.sort_values(by='population', ascending=False).population.values
    pop_log = np.round(np.log(pop))
    print(pop)
    print(pop_log)
    # merged['log_number_of_islands'] = np.round(np.log(merged['number_of_islands'])).astype(int)
    # print(np.log(15))
    # merged[['number_of_islands', 'log_number_of_islands']]
    return


@app.cell
def _(merged):
    merged
    return


@app.cell
def _(merged):
    merged.to_csv("data/processed/pacific_countries_2024.csv", index=False)
    return


@app.cell
def _(merged):
    merged.export_hs_name.unique()
    return


@app.cell
def _(merged):
    merged.export_hs_value.min(), merged.export_hs_value.max() 
    return


@app.cell
def _(merged, np):
    print(merged.exports_value.min(), merged.exports_value.max())
    exports_total = merged.sort_values(by='exports_value', ascending=False).exports_value.values
    exports_total_log = np.round(np.log(exports_total))
    print(exports_total_log, exports_total_log.max(), exports_total_log.min())
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
