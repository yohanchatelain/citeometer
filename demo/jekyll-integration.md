# Jekyll & GitHub Pages Integration Guide

This guide shows how to drop **Citeometer** into a Jekyll website (like `yohanchatelain.github.io`).

## Option A: Add to `_layouts/default.html` or `_includes/head.html`

In your site's `<head>`:

```html
<!-- Citeometer (styles are bundled) -->
<script src="https://cdn.jsdelivr.net/gh/yohanchatelain/citeometer@v1.1.0/dist/citeometer.min.js" defer></script>
```

To self-host instead, copy `dist/citeometer.min.js` to `assets/js/` and point the `src` at it.

## Option B: Directly in your Markdown Publication List (`03_research.md`)

In Jekyll, markdown files can include raw HTML elements. You can add `<cite-o-meter>` directly below each publication:

```markdown
1. **[Longitudinal brain structure changes in Parkinson's disease: a replication study](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0295069)** \\
Andrzej Sokolowski, Nikhil Bhagwat, **Yohan Chatelain**, et al. *PLOS ONE (2024)*.
<cite-o-meter doi="10.1371/journal.pone.0295069" ads="2024PLoSO..1995069S" layout="badge"></cite-o-meter>

2. **[Numerical Stability of DeepGOPlus Inference](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0296725)** \\
Ines Gonzalez Pepe, **Yohan Chatelain**, Gregory Kiar, Tristan Glatard. *PLOS ONE (2024)*.
<cite-o-meter doi="10.1371/journal.pone.0296725" ads="2024PLoSO..1996725G" ads-reads="269" layout="badge"></cite-o-meter>

3. **[Stochastic Rounding in Low-Precision Transformer Inference](https://arxiv.org/abs/2610.01889)** \\
**Yohan Chatelain**, et al. *arXiv (2026)*.
<cite-o-meter arxiv="2610.01889" ads="2026arXiv261001889C" ads-reads="831" layout="badge"></cite-o-meter>
```
