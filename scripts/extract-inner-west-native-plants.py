"""Extract the structured plant tables from Inner West Council's native list."""

import json
import re
from pathlib import Path

import pdfplumber

SOURCE = Path("tmp/pdfs/inner-west-native-plants.pdf")
OUTPUT = Path("lib/db/seed-data/council-inner-west.json")


def clean(value):
    if not value:
        return ""
    value = value.replace("\n", " ").replace("\u00ad", "")
    value = value.replace("", " ")
    return re.sub(r"\s+", " ", value).strip()


records = []
with pdfplumber.open(SOURCE) as pdf:
    for page_number, page in enumerate(pdf.pages[1:], start=2):
        for table in page.extract_tables():
            if not table or len(table[0]) < 8:
                continue
            header = [clean(cell).lower() for cell in table[0]]
            if not header or "scientific" not in header[0]:
                continue
            columns = {name: index for index, name in enumerate(header)}
            for row in table[1:]:
                if len(row) < 8:
                    continue
                scientific_name = clean(row[columns["scientific name"]])
                if not re.match(r"^[A-Z][A-Za-z-]+\s+[a-z][A-Za-z-]+", scientific_name):
                    continue
                records.append(
                    {
                        "scientific_name": scientific_name,
                        "common_name": clean(row[columns["common name"]]),
                        "type": clean(row[columns["type"]]) if "type" in columns else "",
                        "height": clean(row[columns["height"]]),
                        "water": clean(row[columns["water"]]),
                        "soil": clean(row[columns["soil"]]),
                        "sun": clean(row[columns["sun"]]),
                        "vegetation_zones": [
                            zone.strip()
                            for zone in re.split(r"[,/]", clean(row[columns["veg zone"]]))
                            if zone.strip()
                        ],
                        "description": clean(row[columns["description"]]),
                        "source_page": page_number,
                    }
                )

deduped = {}
for record in records:
    deduped[record["scientific_name"].lower()] = record

OUTPUT.write_text(
    json.dumps(sorted(deduped.values(), key=lambda row: row["scientific_name"]), indent=2)
    + "\n",
    encoding="utf-8",
)
print(f"Extracted {len(deduped)} Inner West Council plant records")
