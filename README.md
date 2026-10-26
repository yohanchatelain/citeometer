# PaperMetrics.js 📊

> A lightweight, zero-dependency embeddable JavaScript widget and Web Component to gracefully display scholarly publication metrics (citations, recent reads, PDF downloads, and views) on personal academic websites and GitHub Pages.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Zero Dependency](https://img.shields.io/badge/dependencies-0-success.svg)](#)

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
| **NASA ADS** | `api.adsabs.harvard.edu` | Recent 90-day read counts, ADS citations | ❌ No (Anonymous session support) |
| **bioRxiv** | Article usage metrics | Abstract views, Full-text, PDF downloads | ❌ No |

---

## 🚀 Quickstart

### 1. Include the Library

Add the stylesheet and script to your HTML head or before `</body>`:

```html
<link rel="stylesheet" href="https://yourusername.github.io/paper-metrics-widget/src/paper-metrics.css">
<script src="https://yourusername.github.io/paper-metrics-widget/src/paper-metrics.js" defer></script>
```

### 2. Use the Custom Web Component `<paper-metrics>`

Provide whatever identifiers you have for your paper:

#### Compact Inline Badge (for publication lists)
```html
<paper-metrics 
  doi="10.1371/journal.pone.0295069" 
  ads="2024PLoSO..1995069S" 
  layout="badge">
</paper-metrics>
```

#### Rich Interactive Card
```html
<paper-metrics 
  title="Longitudinal brain structure changes in Parkinson's disease: a replication study"
  doi="10.1371/journal.pone.0295069" 
  ads="2024PLoSO..1995069S"
  layout="card">
</paper-metrics>
```

#### Software / Dataset with Zenodo
```html
<paper-metrics 
  title="Verificarlo: Floating-point precision and numerical variability toolkit"
  zenodo="8301008" 
  layout="badge">
</paper-metrics>
```

---

## ⚙️ Configuration Attributes

| Attribute | Description | Example |
| :--- | :--- | :--- |
| `doi` | Digital Object Identifier | `10.1371/journal.pone.0295069` |
| `arxiv` | arXiv identifier | `2610.01889` |
| `ads` / `ads-bibcode` | NASA ADS bibcode | `2024PLoSO..1995069S` |
| `ads-reads` | Static/cached ADS 90-day reads | `831` |
| `zenodo` | Zenodo record ID | `8301008` |
| `biorxiv` | bioRxiv DOI | `10.1101/2024.11.11.623071v1` |
| `layout` | Layout style (`badge` or `card`) | `badge` (default) |
| `title` | Optional title override | `My Research Paper` |

---

## 💡 How It Works

1. **Client-Side Parallel Fetching**: When initialized, the widget queries OpenAlex, Semantic Scholar, Crossref, and Zenodo in parallel (`Promise.allSettled`).
2. **Local Caching**: Responses are automatically cached in `localStorage` with a 12-hour TTL to ensure sub-millisecond loads on repeat visits without hitting rate limits.
3. **Adaptive Themes**: Colors automatically adapt to system dark/light modes or existing `[data-theme="dark"]` CSS conventions.
4. **Methodological Clarity**: Hover tooltips and card footers clearly explain that ADS measures a 90-day rolling window, while bioRxiv and PLOS COUNTER measure cumulative lifetime events.

---

## 📄 License

MIT
