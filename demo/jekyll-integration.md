# Jekyll & GitHub Pages Integration Guide

This guide shows how to drop **PaperMetrics.js** into a Jekyll website (like `yohanchatelain.github.io`).

## Option A: Add to `_layouts/default.html` or `_includes/head.html`

In your site's `<head>`:

```html
<!-- PaperMetrics.js Styles and Script -->
<link rel="stylesheet" href="{{ '/assets/css/paper-metrics.css' | relative_url }}">
<script src="{{ '/assets/js/paper-metrics.js' | relative_url }}" defer></script>
```

Copy `paper-metrics.css` to `assets/css/` and `paper-metrics.js` to `assets/js/`.

## Option B: Directly in your Markdown Publication List (`03_research.md`)

In Jekyll, markdown files can include raw HTML elements. You can add `<paper-metrics>` directly below each publication:

```markdown
1. **[Longitudinal brain structure changes in Parkinson's disease: a replication study](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0295069)** \\
Andrzej Sokolowski, Nikhil Bhagwat, **Yohan Chatelain**, et al. *PLOS ONE (2024)*.
<paper-metrics doi="10.1371/journal.pone.0295069" ads="2024PLoSO..1995069S" layout="badge"></paper-metrics>

2. **[Numerical Stability of DeepGOPlus Inference](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0296725)** \\
Ines Gonzalez Pepe, **Yohan Chatelain**, Gregory Kiar, Tristan Glatard. *PLOS ONE (2024)*.
<paper-metrics doi="10.1371/journal.pone.0296725" ads="2024PLoSO..1996725G" ads-reads="269" layout="badge"></paper-metrics>

3. **[Stochastic Rounding in Low-Precision Transformer Inference](https://arxiv.org/abs/2610.01889)** \\
**Yohan Chatelain**, et al. *arXiv (2026)*.
<paper-metrics arxiv="2610.01889" ads="2026arXiv261001889C" ads-reads="831" layout="badge"></paper-metrics>
```
