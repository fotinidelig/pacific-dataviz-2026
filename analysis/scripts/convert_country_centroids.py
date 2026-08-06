"""
Convert Pacific country centroids from Google Maps DMS to WGS 84 decimal degrees.

Input:  data/processed/country_centroid.csv
Output: data/processed/country_centroid_wgs84.csv
"""

from __future__ import annotations

import re
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
INPUT_PATH = ROOT / "data/processed/country_centroid.csv"
OUTPUT_PATH = ROOT / "data/processed/country_centroid_wgs84.csv"

DMS_PATTERN = re.compile(r"""(\d+)°(\d+)'([\d.]+)"([NSEW])""")


def dms_to_decimal(dms: str) -> float:
    match = DMS_PATTERN.search(dms.strip())
    if not match:
        raise ValueError(f"Could not parse DMS coordinate: {dms!r}")
    return dms_parts_to_decimal(match.groups())


def dms_parts_to_decimal(parts: tuple[str, str, str, str]) -> float:
    degrees, minutes, seconds, hemisphere = parts
    decimal = int(degrees) + int(minutes) / 60 + float(seconds) / 3600
    if hemisphere in ("S", "W"):
        decimal = -decimal
    return round(decimal, 6)


def parse_coordinate_pair(latitude: str, longitude: str | float) -> tuple[float, float]:
    lat_text = str(latitude).strip()
    lon_text = "" if pd.isna(longitude) else str(longitude).strip()

    if not lon_text:
        matches = DMS_PATTERN.findall(lat_text)
        if len(matches) != 2:
            raise ValueError(
                f"Expected latitude and longitude in one field, got: {lat_text!r}"
            )
        lat = dms_parts_to_decimal(matches[0])
        lon = dms_parts_to_decimal(matches[1])
        return lat, lon

    return dms_to_decimal(lat_text), dms_to_decimal(lon_text)


def main() -> None:
    df = pd.read_csv(INPUT_PATH)
    df.columns = [col.strip() for col in df.columns]

    records = []
    for _, row in df.iterrows():
        lat, lon = parse_coordinate_pair(row["Latitude"], row["Longitude"])
        records.append(
            {
                "Country": row["Country"].strip(),
                "latitude": lat,
                "longitude": lon,
                "crs": "EPSG:4326",
            }
        )

    out = pd.DataFrame(records)
    out.to_csv(OUTPUT_PATH, index=False)
    print(f"Wrote {len(out)} rows to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
