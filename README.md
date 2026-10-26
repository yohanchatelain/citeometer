# Citeometer

> How far has your paper travelled? A lightweight, zero-dependency embeddable JavaScript widget and Web Component to gracefully display scholarly publication metrics (citations, recent reads, PDF downloads, and views) on personal academic websites and GitHub Pages.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependency](https://img.shields.io/badge/dependencies-0-success.svg)](#)
[![Live demo](https://img.shields.io/badge/demo-live-1d5fbf.svg)](https://yohanchatelain.github.io/citeometer/)

**Live demo and embed generator:** https://yohanchatelain.github.io/citeometer/

---

## 🌟 Supported Public APIs

Curated from public academic APIs (including GitHub `awesome-public-apis`, `awesome-open-science`, and open bibliometric indexes):

| Platform | Endpoint / Source | Metric Types | Requires Key? |
| :--- | :--- | :--- | :--- |
| **OpenAlex** | `api.openalex.org/works` | Total Citations, Annual Trend, OA status | ❌ No (CORS enabled) |
| **Semantic Scholar** | `api.semanticscholar.org/graph/v1` | Citations, Influential Citations | ❌ No (CORS enabled) |
| **Crossref** | `api.crossref.org/works` | Official DOI Citations, References count | ❌ No (CORS enabled) |
| **Europe PMC** | `ebi.ac.uk/europepmc/webservices` | Citations, PubMed Central links | ❌ No (CORS enabled) |
| **PLOS COUNTER** | `counter.plos.org/api/v1.0/stats` | COUNTER 5 HTML views, PDF downloads, Total | ❌ No (CORS enabled) |
| **Zenodo** | `zenodo.org/api/records` | Software & Dataset Downloads & Views | ❌ No (CORS enabled) |
| **DataCite** | `api.datacite.org/dois` | Dataset/Software Citations, Views, Downloads | ❌ No (CORS enabled) |
| **OpenCitations** | `opencitations.net/index/api/v2` | Open CC0 DOI Citation Counts | ❌ No (CORS enabled) |
| **GitHub** | `api.github.com/repos` | Repository Stars & Release Asset Downloads | ❌ No (CORS enabled) |
| **NASA ADS** | `api.adsabs.harvard.edu` | Recent 90-day read counts, ADS citations | ❌ No, but **snapshot only** (no CORS) |
| **bioRxiv** | `api.biorxiv.org` + article metrics page | Published DOI linkage (live); PDF downloads & views (**snapshot only**) | ❌ No |

---

## 🚀 Quickstart

### 1. Include the Library

Add one script tag to your HTML `<head>`. The bundle injects its own styles:

```html
<script src="https://cdn.jsdelivr.net/gh/yohanchatelain/citeometer@v1.1.0/dist/citeometer.min.js" defer></script>
```

Prefer to load the stylesheet yourself? Use `dist/citeometer.min.css` alongside `src/citeometer.js`.

### 2. Use the Custom Web Component `<cite-o-meter>`

(The legacy `<paper-metrics>` tag, `.paper-metrics` class and `window.PaperMetrics` global still work as aliases.)

Provide whatever identifiers you have for your paper:

#### Compact Inline Badge (for publication lists)
```html
<cite-o-meter 
  doi="10.1371/journal.pone.0295069" 
  ads="2024PLoSO..1995069S" 
  layout="badge">
</cite-o-meter>
```

#### Rich Interactive Card
```html
<cite-o-meter 
  title="Longitudinal brain structure changes in Parkinson's disease: a replication study"
  doi="10.1371/journal.pone.0295069" 
  ads="2024PLoSO..1995069S"
  layout="card">
</cite-o-meter>
```

#### Software / Dataset with Zenodo
```html
<cite-o-meter 
  title="Verificarlo: Floating-point precision and numerical variability toolkit"
  zenodo="8301008" 
  layout="badge">
</cite-o-meter>
```

---

## ⚙️ Configuration Attributes

| Attribute | Description | Example |
| :--- | :--- | :--- |
| `doi` | Digital Object Identifier (or DOI URL) | `10.1371/journal.pone.0295069` |
| `arxiv` | arXiv identifier (or arXiv URL) | `2610.01889` |
| `ads` / `ads-bibcode` | NASA ADS bibcode | `2024PLoSO..1995069S` |
| `ads-reads` | Static/cached ADS 90-day reads | `831` |
| `zenodo` | Zenodo record ID (or Zenodo DOI/URL) | `8301008` |
| `plos-doi` | Explicit PLOS DOI for COUNTER stats | `10.1371/journal.pone.0295069` |
| `biorxiv` | bioRxiv / medRxiv DOI | `10.1101/2024.11.11.623071v1` |
| `biorxiv-pdfs` | Static/cached bioRxiv PDF download count | `1420` |
| `biorxiv-views` | Static/cached bioRxiv abstract/HTML view count | `4850` |
| `github` | GitHub `owner/repo` (or repo URL) for software papers | `verificarlo/verificarlo` |
| `mailto` | Polite-pool contact email for OpenAlex / Crossref | `you@university.edu` |
| `snapshot-url` | Static JSON snapshot URL for offline/CORS fallback | `dist/citeometer-snapshot.json` |
| `lazy` | Defer API requests until scrolled into view (`true`/`false`) | `true` |
| `hide-zero` | Hide badges whose value is 0 (badge & compact layouts) | `true` |
| `shadow` | Render inside an isolated Shadow DOM root (`true`/`false`) | `true` |
| `layout` | Layout style (`badge`, `card`, or `compact`) | `badge` (default) |
| `title` | Optional title override (auto-fetched if omitted) | `My Research Paper` |

---

## 📦 Snapshots: NASA ADS reads & bioRxiv downloads

NASA ADS and bioRxiv usage pages do not allow cross-origin requests, so browsers cannot query them directly. Instead, `scripts/fetch-snapshot.js` scans your pages for `<cite-o-meter>` tags, queries **every** source server-side (ADS is looked up by bibcode, DOI or arXiv ID), and writes one JSON file. The widget merges it with live data.

```bash
node scripts/fetch-snapshot.js --input _pages/publications.md --output assets/citeometer-snapshot.json
```

Point the widget at it once, on the script tag. Site-wide options are read from `data-*` attributes:

```html
<script src="https://cdn.jsdelivr.net/gh/yohanchatelain/citeometer@v1.1.0/dist/citeometer.min.js"
        data-snapshot-url="/assets/citeometer-snapshot.json"
        data-hide-zero="true" data-lazy="true" defer></script>
```

To refresh it daily on GitHub Pages, add this workflow to your site repository (`.github/workflows/citeometer.yml`):

```yaml
name: Update Citeometer snapshot
on:
  schedule: [{ cron: '0 6 * * *' }]
  workflow_dispatch:
permissions:
  contents: write
jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/checkout@v4
        with: { repository: yohanchatelain/citeometer, ref: v1.1.0, path: .citeometer }
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: node .citeometer/scripts/fetch-snapshot.js --input _pages --output assets/citeometer-snapshot.json
      - run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add assets/citeometer-snapshot.json
          git diff --staged --quiet || (git commit -m "Update Citeometer snapshot" && git push)
```

---

## 🎨 Theming

Every color, the font and the corner radius are CSS custom properties. Override them on `:root` or on any wrapper:

```css
:root {
  --pm-font: inherit;          /* use your site's font */
  --pm-cites-text: #8c1515;    /* citation accent */
  --pm-cites-bg: #f9eaea;
  --pm-radius: 6px;
}
```

Dark mode follows `prefers-color-scheme`; force it with `data-theme="dark"` or `data-theme="light"` on any ancestor.

---

## 💡 How It Works

1. **Client-Side Parallel Fetching**: When initialized, the widget queries OpenAlex, Semantic Scholar, Crossref, and Zenodo in parallel (`Promise.allSettled`).
2. **Local Caching**: Responses are automatically cached in `localStorage` with a 12-hour TTL to ensure sub-millisecond loads on repeat visits without hitting rate limits.
3. **Adaptive Themes**: Colors automatically adapt to system dark/light modes or existing `[data-theme="dark"]` CSS conventions.
4. **Methodological Clarity**: Hover tooltips and card footers clearly explain that ADS measures a 90-day rolling window, while bioRxiv and PLOS COUNTER measure cumulative lifetime events.

---

## 📄 License

MIT
