/**
 * paper-metrics.js — Embeddable scholarly access & citation metrics widget
 * 
 * Aggregates public metrics across:
 *   - Semantic Scholar API (citations, influential citations)
 *   - OpenAlex API (citations, annual trend, open access)
 *   - Crossref REST API (official DOI citation count)
 *   - Europe PMC REST API (citations, PMC linkage)
 *   - Zenodo API (views, downloads for software/data)
 *   - PLOS COUNTER API (official COUNTER views, PDF downloads)
 *   - NASA ADS (90-day recent read counts)
 *   - bioRxiv (views, PDF accesses)
 * 
 * Supports:
 *   - Web Component: <paper-metrics doi="..." ads="..." ...></paper-metrics>
 *   - Data Attributes: <div class="paper-metrics" data-doi="..." ...></div>
 *   - JS programmatic API: PaperMetrics.render(container, options)
 *   - Layout modes: 'badge' (inline), 'card' (rich card), 'compact'
 *   - Automatic localStorage caching (12hr TTL)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PaperMetrics = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CACHE_PREFIX = 'pm_cache_v1_';
  const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

  // Helper: Cache get/set
  function getCached(key) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  function setCached(key, data) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
        timestamp: Date.now(),
        data: data
      }));
    } catch (e) {}
  }

  // Format large numbers: 1250 -> 1.3k
  function formatNum(n) {
    if (n === null || n === undefined) return '—';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return n.toLocaleString();
  }

  // Individual API Fetchers
  async function fetchSemanticScholar(opts) {
    const query = opts.doi ? `DOI:${opts.doi}` : (opts.arxiv ? `ARXIV:${opts.arxiv}` : null);
    if (!query) return null;
    const cacheKey = `s2_${query}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(query)}?fields=citationCount,influentialCitationCount,year,url`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const result = {
        citations: data.citationCount ?? 0,
        influentialCitations: data.influentialCitationCount ?? 0,
        year: data.year,
        url: data.url
      };
      setCached(cacheKey, result);
      return result;
    } catch (err) {
      return null;
    }
  }

  async function fetchOpenAlex(opts) {
    if (!opts.doi && !opts.arxiv) return null;
    const identifier = opts.doi ? `https://doi.org/${opts.doi}` : `https://arxiv.org/abs/${opts.arxiv}`;
    const cacheKey = `oa_${identifier}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api.openalex.org/works/${encodeURIComponent(identifier)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const result = {
        citations: data.cited_by_count ?? 0,
        isOa: data.open_access?.is_oa ?? false,
        oaStatus: data.open_access?.oa_status,
        year: data.publication_year,
        countsByYear: data.counts_by_year || [],
        url: data.doi || identifier
      };
      setCached(cacheKey, result);
      return result;
    } catch (err) {
      return null;
    }
  }

  async function fetchCrossref(opts) {
    if (!opts.doi) return null;
    const cacheKey = `cr_${opts.doi}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://api.crossref.org/works/${encodeURIComponent(opts.doi)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      const data = json.message || {};
      const result = {
        citations: data['is-referenced-by-count'] ?? 0,
        referencesCount: data['references-count'] ?? 0,
        publisher: data.publisher,
        url: data.URL
      };
      setCached(cacheKey, result);
      return result;
    } catch (err) {
      return null;
    }
  }

  async function fetchEuropePmc(opts) {
    if (!opts.doi) return null;
    const cacheKey = `epmc_${opts.doi}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:${encodeURIComponent(opts.doi)}&format=json`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      const item = json.resultList?.result?.[0];
      if (!item) return null;
      const result = {
        citations: item.citedByCount ?? 0,
        pmcid: item.pmcid,
        url: item.pmcid ? `https://europepmc.org/article/PMC/${item.pmcid}` : null
      };
      setCached(cacheKey, result);
      return result;
    } catch (err) {
      return null;
    }
  }

  async function fetchZenodo(opts) {
    if (!opts.zenodo) return null;
    const cacheKey = `zenodo_${opts.zenodo}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://zenodo.org/api/records/${encodeURIComponent(opts.zenodo)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      const stats = data.stats || {};
      const result = {
        views: stats.views ?? 0,
        downloads: stats.downloads ?? 0,
        uniqueDownloads: stats.unique_downloads ?? 0,
        url: data.links?.html || `https://zenodo.org/record/${opts.zenodo}`
      };
      setCached(cacheKey, result);
      return result;
    } catch (err) {
      return null;
    }
  }

  async function fetchPlosCounter(opts) {
    if (!opts.plosDoi && (!opts.doi || !opts.doi.includes('journal.pone.'))) return null;
    const doi = opts.plosDoi || opts.doi;
    const cacheKey = `plos_${doi}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://counter.plos.org/api/v1.0/stats/doi/${encodeURIComponent(doi)}/format/json`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      
      let html = 0;
      let pdf = 0;
      let xml = 0;
      for (const [key, val] of Object.entries(data)) {
        if (key === 'total' || !Array.isArray(val)) continue;
        for (const [action, count] of val) {
          if (action === 'get-document') html += count;
          else if (action === 'get-pdf') pdf += count;
          else if (action === 'get-xml') xml += count;
        }
      }

      const result = {
        total: data.total ?? (html + pdf + xml),
        pdf: pdf,
        html: html,
        xml: xml,
        url: `https://journals.plos.org/plosone/article?id=${doi}`
      };
      setCached(cacheKey, result);
      return result;
    } catch (err) {
      return null;
    }
  }

  async function fetchAds(opts) {
    // If static value provided
    if (opts.adsReads !== undefined) {
      return {
        recentReads: parseInt(opts.adsReads, 10),
        bibcode: opts.adsBibcode,
        url: opts.adsBibcode ? `https://ui.adsabs.harvard.edu/abs/${opts.adsBibcode}/metrics` : null
      };
    }
    if (!opts.adsBibcode) return null;
    const cacheKey = `ads_${opts.adsBibcode}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      // Fetch anonymous bootstrap token
      const bootRes = await fetch('https://ui.adsabs.harvard.edu/v1/accounts/bootstrap');
      if (!bootRes.ok) return null;
      const boot = await bootRes.json();
      const token = boot.access_token;
      if (!token) return null;

      const qUrl = `https://api.adsabs.harvard.edu/v1/search/query?q=bibcode:${encodeURIComponent(opts.adsBibcode)}&fl=read_count,citation_count,bibcode`;
      const res = await fetch(qUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return null;
      const data = await res.json();
      const doc = data.response?.docs?.[0];
      if (!doc) return null;

      const result = {
        recentReads: doc.read_count ?? 0,
        citations: doc.citation_count ?? 0,
        bibcode: doc.bibcode,
        url: `https://ui.adsabs.harvard.edu/abs/${doc.bibcode}/metrics`
      };
      setCached(cacheKey, result);
      return result;
    } catch (e) {
      return null;
    }
  }

  // Aggregate metrics for a paper config
  async function aggregateMetrics(config) {
    const results = {
      title: config.title || 'Scholarly Publication',
      doi: config.doi,
      arxiv: config.arxiv,
      biorxiv: config.biorxiv,
      zenodo: config.zenodo,
      adsBibcode: config.adsBibcode,
      
      // Metric buckets
      citations: null,
      influentialCitations: null,
      openAlexCitations: null,
      crossrefCitations: null,
      adsReads: null,
      biorxivPdfs: config.biorxivPdfs ? parseInt(config.biorxivPdfs, 10) : null,
      biorxivViews: config.biorxivViews ? parseInt(config.biorxivViews, 10) : null,
      plosTotal: null,
      plosPdfs: null,
      zenodoDownloads: null,
      zenodoViews: null,
      
      sources: {}
    };

    // Parallel fetches
    const [s2, oa, cr, epmc, zen, plos, ads] = await Promise.allSettled([
      fetchSemanticScholar(config),
      fetchOpenAlex(config),
      fetchCrossref(config),
      fetchEuropePmc(config),
      fetchZenodo(config),
      fetchPlosCounter(config),
      fetchAds(config)
    ]);

    if (s2.status === 'fulfilled' && s2.value) {
      results.sources.semanticScholar = s2.value;
      results.citations = s2.value.citations;
      results.influentialCitations = s2.value.influentialCitations;
    }
    if (oa.status === 'fulfilled' && oa.value) {
      results.sources.openAlex = oa.value;
      results.openAlexCitations = oa.value.citations;
      if (results.citations === null || oa.value.citations > results.citations) {
        results.citations = oa.value.citations;
      }
    }
    if (cr.status === 'fulfilled' && cr.value) {
      results.sources.crossref = cr.value;
      results.crossrefCitations = cr.value.citations;
      if (results.citations === null) results.citations = cr.value.citations;
    }
    if (epmc.status === 'fulfilled' && epmc.value) {
      results.sources.europePmc = epmc.value;
    }
    if (zen.status === 'fulfilled' && zen.value) {
      results.sources.zenodo = zen.value;
      results.zenodoDownloads = zen.value.downloads;
      results.zenodoViews = zen.value.views;
    }
    if (plos.status === 'fulfilled' && plos.value) {
      results.sources.plos = plos.value;
      results.plosTotal = plos.value.total;
      results.plosPdfs = plos.value.pdf;
    }
    if (ads.status === 'fulfilled' && ads.value) {
      results.sources.ads = ads.value;
      results.adsReads = ads.value.recentReads;
    }

    return results;
  }

  // HTML Renderers
  function renderBadge(metrics) {
    const pills = [];

    if (metrics.citations !== null) {
      pills.push(`
        <span class="pm-badge pm-badge-citations" title="Citations across OpenAlex / Semantic Scholar / Crossref">
          <span class="pm-icon">📚</span>
          <strong>${formatNum(metrics.citations)}</strong> cites
        </span>
      `);
    }

    if (metrics.influentialCitations !== null && metrics.influentialCitations > 0) {
      pills.push(`
        <span class="pm-badge pm-badge-influential" title="Semantic Scholar Influential Citations">
          <span class="pm-icon">⭐</span>
          <strong>${formatNum(metrics.influentialCitations)}</strong> influential
        </span>
      `);
    }

    if (metrics.adsReads !== null) {
      pills.push(`
        <span class="pm-badge pm-badge-ads" title="ADS Recent Reads (90-day rolling window)">
          <span class="pm-icon">🔭</span>
          <strong>${formatNum(metrics.adsReads)}</strong> ADS reads (90d)
        </span>
      `);
    }

    if (metrics.biorxivPdfs !== null) {
      pills.push(`
        <span class="pm-badge pm-badge-biorxiv" title="bioRxiv Cumulative PDF Downloads">
          <span class="pm-icon">📄</span>
          <strong>${formatNum(metrics.biorxivPdfs)}</strong> bioRxiv PDFs
        </span>
      `);
    }

    if (metrics.plosPdfs !== null) {
      pills.push(`
        <span class="pm-badge pm-badge-plos" title="PLOS COUNTER PDF Downloads">
          <span class="pm-icon">📥</span>
          <strong>${formatNum(metrics.plosPdfs)}</strong> PLOS PDFs
        </span>
      `);
    }

    if (metrics.zenodoDownloads !== null) {
      pills.push(`
        <span class="pm-badge pm-badge-zenodo" title="Zenodo Software/Dataset Downloads">
          <span class="pm-icon">💾</span>
          <strong>${formatNum(metrics.zenodoDownloads)}</strong> downloads
        </span>
      `);
    }

    if (pills.length === 0) {
      return `<span class="pm-badge pm-badge-loading">No public metrics found</span>`;
    }

    return `<div class="pm-badges-container">${pills.join('')}</div>`;
  }

  function renderCard(metrics) {
    const items = [];

    // Citations section
    if (metrics.citations !== null) {
      items.push(`
        <div class="pm-card-metric pm-metric-cites">
          <div class="pm-metric-val">${formatNum(metrics.citations)}</div>
          <div class="pm-metric-lbl">Total Citations</div>
          <div class="pm-metric-sub">OpenAlex / Crossref</div>
        </div>
      `);
    }

    if (metrics.influentialCitations !== null) {
      items.push(`
        <div class="pm-card-metric pm-metric-influential">
          <div class="pm-metric-val">${formatNum(metrics.influentialCitations)}</div>
          <div class="pm-metric-lbl">Influential Cites</div>
          <div class="pm-metric-sub">Semantic Scholar</div>
        </div>
      `);
    }

    // ADS
    if (metrics.adsReads !== null) {
      items.push(`
        <div class="pm-card-metric pm-metric-ads">
          <div class="pm-metric-val">${formatNum(metrics.adsReads)}</div>
          <div class="pm-metric-lbl">Recent Reads</div>
          <div class="pm-metric-sub">NASA ADS (90-day window)</div>
        </div>
      `);
    }

    // Downloads (bioRxiv, PLOS, Zenodo)
    if (metrics.plosPdfs !== null) {
      items.push(`
        <div class="pm-card-metric pm-metric-plos">
          <div class="pm-metric-val">${formatNum(metrics.plosPdfs)}</div>
          <div class="pm-metric-lbl">PLOS PDF Downloads</div>
          <div class="pm-metric-sub">${formatNum(metrics.plosTotal)} COUNTER total</div>
        </div>
      `);
    }

    if (metrics.biorxivPdfs !== null) {
      items.push(`
        <div class="pm-card-metric pm-metric-biorxiv">
          <div class="pm-metric-val">${formatNum(metrics.biorxivPdfs)}</div>
          <div class="pm-metric-lbl">bioRxiv PDFs</div>
          <div class="pm-metric-sub">${metrics.biorxivViews ? formatNum(metrics.biorxivViews) + ' views' : 'Cumulative'}</div>
        </div>
      `);
    }

    if (metrics.zenodoDownloads !== null) {
      items.push(`
        <div class="pm-card-metric pm-metric-zenodo">
          <div class="pm-metric-val">${formatNum(metrics.zenodoDownloads)}</div>
          <div class="pm-metric-lbl">Zenodo Downloads</div>
          <div class="pm-metric-sub">${formatNum(metrics.zenodoViews)} views</div>
        </div>
      `);
    }

    // Link buttons
    const links = [];
    if (metrics.doi) {
      links.push(`<a href="https://doi.org/${metrics.doi}" target="_blank" rel="noopener" class="pm-link-btn">DOI ↗</a>`);
    }
    if (metrics.sources.semanticScholar?.url) {
      links.push(`<a href="${metrics.sources.semanticScholar.url}" target="_blank" rel="noopener" class="pm-link-btn">Semantic Scholar ↗</a>`);
    }
    if (metrics.sources.ads?.url) {
      links.push(`<a href="${metrics.sources.ads.url}" target="_blank" rel="noopener" class="pm-link-btn">NASA ADS ↗</a>`);
    }
    if (metrics.sources.zenodo?.url) {
      links.push(`<a href="${metrics.sources.zenodo.url}" target="_blank" rel="noopener" class="pm-link-btn">Zenodo ↗</a>`);
    }

    return `
      <div class="pm-card">
        <div class="pm-card-header">
          <div class="pm-card-title">${metrics.title}</div>
          <div class="pm-card-actions">${links.join('')}</div>
        </div>
        <div class="pm-card-grid">
          ${items.join('')}
        </div>
        <div class="pm-card-footer">
          <span>⚡ Metrics live-queried via open APIs (OpenAlex, Semantic Scholar, Crossref, ADS, PLOS, Zenodo)</span>
        </div>
      </div>
    `;
  }

  // Public Component & Init
  const PaperMetrics = {
    async render(target, config) {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      const layout = config.layout || el.getAttribute('data-layout') || 'badge';
      el.innerHTML = `<span class="pm-badge pm-badge-loading">Loading live metrics...</span>`;

      try {
        const data = await aggregateMetrics(config);
        if (layout === 'card') {
          el.innerHTML = renderCard(data);
        } else {
          el.innerHTML = renderBadge(data);
        }
      } catch (err) {
        el.innerHTML = `<span class="pm-badge pm-badge-error">Metrics unavailable</span>`;
      }
    },

    init() {
      // Auto-scan elements with class 'paper-metrics'
      document.querySelectorAll('.paper-metrics').forEach(el => {
        const cfg = {
          title: el.getAttribute('data-title'),
          doi: el.getAttribute('data-doi'),
          arxiv: el.getAttribute('data-arxiv'),
          biorxiv: el.getAttribute('data-biorxiv'),
          biorxivPdfs: el.getAttribute('data-biorxiv-pdfs'),
          biorxivViews: el.getAttribute('data-biorxiv-views'),
          zenodo: el.getAttribute('data-zenodo'),
          adsBibcode: el.getAttribute('data-ads-bibcode') || el.getAttribute('data-ads'),
          adsReads: el.getAttribute('data-ads-reads'),
          layout: el.getAttribute('data-layout') || 'badge'
        };
        PaperMetrics.render(el, cfg);
      });
    }
  };

  // Define Custom Web Component: <paper-metrics>
  if (typeof customElements !== 'undefined' && !customElements.get('paper-metrics')) {
    class PaperMetricsElement extends HTMLElement {
      connectedCallback() {
        const cfg = {
          title: this.getAttribute('title'),
          doi: this.getAttribute('doi'),
          arxiv: this.getAttribute('arxiv'),
          biorxiv: this.getAttribute('biorxiv'),
          biorxivPdfs: this.getAttribute('biorxiv-pdfs'),
          biorxivViews: this.getAttribute('biorxiv-views'),
          zenodo: this.getAttribute('zenodo'),
          adsBibcode: this.getAttribute('ads-bibcode') || this.getAttribute('ads'),
          adsReads: this.getAttribute('ads-reads'),
          layout: this.getAttribute('layout') || 'badge'
        };
        PaperMetrics.render(this, cfg);
      }
    }
    customElements.define('paper-metrics', PaperMetricsElement);
  }

  // Auto-init on DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => PaperMetrics.init());
    } else {
      PaperMetrics.init();
    }
  }

  return PaperMetrics;
}));
