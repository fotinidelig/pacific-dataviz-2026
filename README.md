# Pacific Dataviz 2026

Monorepo for data analysis (Python) and interactive visualization (D3 + React).

## Structure

```
pacific-dataviz-2026/
├── data/           # Optional local cache; large sources fetched via API when possible
├── analysis/       # Python notebooks and export scripts
└── web/            # Vite + React + D3 (to be initialized)
```

## Setup

### Analysis (Python)

```bash
cd analysis
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### Web (Vite)

```bash
cd web
npm install
npm run dev
```

Stack: Vite, React, D3, Tailwind CSS v4, Motion.

Processed data is available via the `@data` alias (points to `data/processed/`).

## Data

Primary data access is planned via APIs rather than committed files. Use `data/processed/` only for small exports the web app needs at build or runtime.
