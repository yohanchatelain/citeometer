const Citeometer = (function () {
  'use strict';

  // Auto-inject styles if document is available and not already present
  function injectStyles() {
    if (typeof document === 'undefined') return;
    try {
      if (document.getElementById('citeometer-styles') || document.querySelector('link[href*="citeometer"], link[href*="paper-metrics"]')) return;
      var style = document.createElement('style');
      style.id = 'citeometer-styles';
      style.textContent = ":root,[data-theme=\"light\"]{--pm-font:ui-sans-serif,-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;--pm-bg-card:#ffffff;--pm-bg-metric:#f6f7f9;--pm-bg-metric-hover:#eff1f4;--pm-border:#e4e7ec;--pm-border-strong:#d0d5dd;--pm-text:#101828;--pm-text-muted:#475467;--pm-text-soft:#8a94a6;--pm-focus:#2563eb;--pm-cites-bg:#e8f1fd;--pm-cites-text:#1d5fbf;--pm-influential-bg:#fdf3e1;--pm-influential-text:#a15c07;--pm-ads-bg:#ecebfd;--pm-ads-text:#4b3fc4;--pm-biorxiv-bg:#e6f6ec;--pm-biorxiv-text:#18794e;--pm-plos-bg:#f3ebfc;--pm-plos-text:#7a3bc2;--pm-zenodo-bg:#fbe9f3;--pm-zenodo-text:#a8326e;--pm-github-bg:#eef0f3;--pm-github-text:#344054;--pm-docker-bg:#e6f4fe;--pm-docker-text:#0369a1;--pm-pypi-bg:#fef6e0;--pm-pypi-text:#9a5b04;--pm-npm-bg:#feeceb;--pm-npm-text:#b91c1c;--pm-loading-bg:#eef0f3;--pm-loading-shine:#f8f9fb;--pm-loading-text:#8a94a6;--pm-error-bg:#fdecec;--pm-error-text:#b42318;--pm-radius:12px;--pm-radius-sm:8px;--pm-shadow:0 1px 2px rgba(16,24,40,0.04),0 1px 3px rgba(16,24,40,0.06)}@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){--pm-bg-card:#12161f;--pm-bg-metric:#1a1f2b;--pm-bg-metric-hover:#212736;--pm-border:#262d3b;--pm-border-strong:#343c4d;--pm-text:#eef1f6;--pm-text-muted:#a3acbd;--pm-text-soft:#6b7487;--pm-focus:#6ea8fe;--pm-cites-bg:#132741;--pm-cites-text:#7fb6ff;--pm-influential-bg:#36260b;--pm-influential-text:#f5c26b;--pm-ads-bg:#221f45;--pm-ads-text:#aaa2ff;--pm-biorxiv-bg:#0f2e20;--pm-biorxiv-text:#6fd6a0;--pm-plos-bg:#2a1b40;--pm-plos-text:#c9a3ff;--pm-zenodo-bg:#3a1529;--pm-zenodo-text:#f4a1cb;--pm-github-bg:#1f2531;--pm-github-text:#d0d6e2;--pm-docker-bg:#0c293d;--pm-docker-text:#7dd3fc;--pm-pypi-bg:#332407;--pm-pypi-text:#fcd34d;--pm-npm-bg:#3b1214;--pm-npm-text:#fca5a5;--pm-loading-bg:#1d2330;--pm-loading-shine:#262d3c;--pm-loading-text:#6b7487;--pm-error-bg:#3a1414;--pm-error-text:#ff9b91;--pm-shadow:0 1px 2px rgba(0,0,0,0.3),0 4px 12px rgba(0,0,0,0.25)}}[data-theme=\"dark\"]{--pm-bg-card:#12161f;--pm-bg-metric:#1a1f2b;--pm-bg-metric-hover:#212736;--pm-border:#262d3b;--pm-border-strong:#343c4d;--pm-text:#eef1f6;--pm-text-muted:#a3acbd;--pm-text-soft:#6b7487;--pm-focus:#6ea8fe;--pm-cites-bg:#132741;--pm-cites-text:#7fb6ff;--pm-influential-bg:#36260b;--pm-influential-text:#f5c26b;--pm-ads-bg:#221f45;--pm-ads-text:#aaa2ff;--pm-biorxiv-bg:#0f2e20;--pm-biorxiv-text:#6fd6a0;--pm-plos-bg:#2a1b40;--pm-plos-text:#c9a3ff;--pm-zenodo-bg:#3a1529;--pm-zenodo-text:#f4a1cb;--pm-github-bg:#1f2531;--pm-github-text:#d0d6e2;--pm-docker-bg:#0c293d;--pm-docker-text:#7dd3fc;--pm-pypi-bg:#332407;--pm-pypi-text:#fcd34d;--pm-npm-bg:#3b1214;--pm-npm-text:#fca5a5;--pm-loading-bg:#1d2330;--pm-loading-shine:#262d3c;--pm-loading-text:#6b7487;--pm-error-bg:#3a1414;--pm-error-text:#ff9b91;--pm-shadow:0 1px 2px rgba(0,0,0,0.3),0 4px 12px rgba(0,0,0,0.25)}.pm-badges-container,.pm-compact-pill,.pm-card,.pm-badge{font-family:var(--pm-font);font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}.pm-icon{flex:none;width:1em;height:1em;vertical-align:-0.125em}.pm-badges-container{display:inline-flex;flex-wrap:wrap;align-items:center;gap:6px;vertical-align:middle;margin:4px 0}.pm-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px 3px 8px;border-radius:9999px;font-size:0.78rem;font-weight:500;line-height:1.3;white-space:nowrap;text-decoration:none;cursor:default;box-shadow:inset 0 0 0 1px rgba(0,0,0,0.04);transition:transform 0.15s ease,box-shadow 0.15s ease}.pm-badge strong{font-weight:650}.pm-badge:hover{transform:translateY(-1px);box-shadow:inset 0 0 0 1px rgba(0,0,0,0.04),0 2px 6px rgba(16,24,40,0.08)}.pm-badge-citations{background:var(--pm-cites-bg);color:var(--pm-cites-text)}.pm-badge-influential{background:var(--pm-influential-bg);color:var(--pm-influential-text)}.pm-badge-ads{background:var(--pm-ads-bg);color:var(--pm-ads-text)}.pm-badge-biorxiv{background:var(--pm-biorxiv-bg);color:var(--pm-biorxiv-text)}.pm-badge-plos{background:var(--pm-plos-bg);color:var(--pm-plos-text)}.pm-badge-zenodo{background:var(--pm-zenodo-bg);color:var(--pm-zenodo-text)}.pm-badge-github,.pm-badge-forks{background:var(--pm-github-bg);color:var(--pm-github-text)}.pm-badge-clones{background:var(--pm-biorxiv-bg);color:var(--pm-biorxiv-text)}.pm-badge-views{background:var(--pm-ads-bg);color:var(--pm-ads-text)}.pm-badge-docker{background:var(--pm-docker-bg);color:var(--pm-docker-text)}.pm-badge-pypi{background:var(--pm-pypi-bg);color:var(--pm-pypi-text)}.pm-badge-npm{background:var(--pm-npm-bg);color:var(--pm-npm-text)}.pm-badge-loading{color:var(--pm-loading-text);font-size:0.75rem;background:linear-gradient(90deg,var(--pm-loading-bg) 0%,var(--pm-loading-shine) 50%,var(--pm-loading-bg) 100%);background-size:200% 100%;animation:pm-shimmer 1.4s ease-in-out infinite}.pm-badge-loading:hover,.pm-badge-error:hover{transform:none;box-shadow:inset 0 0 0 1px rgba(0,0,0,0.04)}@keyframes pm-shimmer{from{background-position:100% 0}to{background-position:-100% 0}}.pm-badge-error{background:var(--pm-error-bg);color:var(--pm-error-text);font-size:0.75rem}.pm-compact-pill{display:inline-flex;align-items:center;gap:8px;padding:3px 11px;border-radius:9999px;background:var(--pm-bg-card);border:1px solid var(--pm-border);color:var(--pm-text-muted);font-size:0.76rem;line-height:1.35;vertical-align:middle}.pm-compact-item{display:inline-flex;align-items:center;gap:4px}.pm-compact-item strong{color:var(--pm-text);font-weight:650}.pm-compact-sep{color:var(--pm-border-strong)}.pm-card{background:var(--pm-bg-card);color:var(--pm-text);border:1px solid var(--pm-border);border-radius:var(--pm-radius);padding:18px 20px 14px;box-shadow:var(--pm-shadow);margin:12px 0;box-sizing:border-box}.pm-card *,.pm-card *::before,.pm-card *::after{box-sizing:inherit}.pm-card-header{display:flex;justify-content:space-between;align-items:flex-start;gap:10px 16px;margin-bottom:16px;flex-wrap:wrap}.pm-card-title{font-weight:600;font-size:1rem;letter-spacing:-0.01em;color:var(--pm-text);line-height:1.4;flex:1 1 240px;text-wrap:balance}.pm-card-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.pm-link-btn{display:inline-flex;align-items:center;font-size:0.74rem;font-weight:500;color:var(--pm-text-muted);background:transparent;border:1px solid var(--pm-border);padding:3px 9px;border-radius:9999px;text-decoration:none;white-space:nowrap;transition:color 0.15s ease,border-color 0.15s ease,background-color 0.15s ease}.pm-link-btn:hover{color:var(--pm-text);border-color:var(--pm-border-strong);background:var(--pm-bg-metric)}.pm-link-btn:focus-visible{outline:2px solid var(--pm-focus);outline-offset:2px}.pm-oa-pill{display:inline-flex;align-items:center;gap:5px;font-size:0.74rem;font-weight:600;color:var(--pm-biorxiv-text);background:var(--pm-biorxiv-bg);padding:3px 9px;border-radius:9999px;white-space:nowrap}.pm-card-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(132px,1fr));gap:8px;margin-bottom:10px}.pm-card-empty{font-size:0.82rem;color:var(--pm-text-muted);padding:14px;margin-bottom:10px;border:1px dashed var(--pm-border-strong);border-radius:var(--pm-radius-sm);text-align:center}.pm-card-metric{position:relative;padding:12px 14px 11px;border-radius:var(--pm-radius-sm);background:var(--pm-bg-metric);overflow:hidden;transition:background-color 0.15s ease}.pm-card-metric::before{content:\"\";position:absolute;left:0;top:12px;bottom:12px;width:3px;border-radius:0 3px 3px 0;background:currentColor;opacity:0.9}.pm-card-metric:hover{background:var(--pm-bg-metric-hover)}.pm-metric-val{font-size:1.5rem;font-weight:700;letter-spacing:-0.02em;line-height:1.1;margin-bottom:4px}.pm-metric-lbl{font-size:0.76rem;font-weight:600;color:var(--pm-text)}.pm-metric-sub{font-size:0.7rem;color:var(--pm-text-muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.pm-metric-cites{color:var(--pm-cites-text)}.pm-metric-influential{color:var(--pm-influential-text)}.pm-metric-ads{color:var(--pm-ads-text)}.pm-metric-biorxiv{color:var(--pm-biorxiv-text)}.pm-metric-plos{color:var(--pm-plos-text)}.pm-metric-zenodo{color:var(--pm-zenodo-text)}.pm-metric-github{color:var(--pm-github-text)}.pm-metric-clones{color:var(--pm-biorxiv-text)}.pm-metric-docker{color:var(--pm-docker-text)}.pm-metric-pypi{color:var(--pm-pypi-text)}.pm-metric-npm{color:var(--pm-npm-text)}.pm-sparkline-box{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;padding:10px 14px;margin-bottom:10px;border:1px solid var(--pm-border);border-radius:var(--pm-radius-sm)}.pm-sparkline-lbl{font-size:0.72rem;font-weight:600;color:var(--pm-text-muted)}.pm-sparkline-svg{display:block;overflow:visible;max-width:100%}.pm-sparkline-bar{fill:var(--pm-cites-text);opacity:0.55;transition:opacity 0.15s ease}.pm-sparkline-bar:last-child{opacity:0.9}.pm-sparkline-bar:hover{opacity:1}.pm-card-breakdown{font-size:0.72rem;color:var(--pm-text-muted);margin-bottom:10px;padding:0 2px;line-height:1.6}.pm-card-breakdown strong{color:var(--pm-text);font-weight:600}.pm-card-footer{font-size:0.7rem;color:var(--pm-text-soft);border-top:1px solid var(--pm-border);padding-top:10px;margin-top:4px;display:flex;justify-content:space-between}.pm-footer-note{display:inline-flex;align-items:center;gap:6px}@media (prefers-reduced-motion:reduce){.pm-badge,.pm-badge-loading,.pm-link-btn,.pm-card-metric,.pm-sparkline-bar{animation:none;transition:none}.pm-badge:hover{transform:none}}";
      (document.head || document.documentElement).appendChild(style);
    } catch (e) {}
  }
  injectStyles();

  const CACHE_PREFIX = 'pm_cache_v1_';
  const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

  const globalConfig = {
    mailto: null,
    snapshotUrl: null,
    snapshotData: null,
    lazy: false,
    shadowDom: false,
    hideZero: false
  };

  // NASA ADS and bioRxiv usage pages do not send CORS headers, so they can only be
  // queried server-side (scripts/fetch-snapshot.js). Browsers read them from a snapshot.
  const IS_BROWSER = typeof window !== 'undefined' && typeof window.document !== 'undefined';

  // Site-wide options from the loading <script> tag, e.g.
  // <script src="citeometer.min.js" data-snapshot-url="/snapshot.json" data-hide-zero="true">
  (function readScriptConfig() {
    if (typeof document === 'undefined' || !document.currentScript || !document.currentScript.dataset) return;
    const ds = document.currentScript.dataset;
    if (ds.snapshotUrl) globalConfig.snapshotUrl = ds.snapshotUrl;
    if (ds.mailto) globalConfig.mailto = ds.mailto;
    if (ds.hideZero !== undefined) globalConfig.hideZero = ds.hideZero !== 'false';
    if (ds.lazy !== undefined) globalConfig.lazy = ds.lazy !== 'false';
  })();

  // In-flight request deduplication map
  const inFlightRequests = new Map();
  let snapshotPromise = null;
  let adsTokenPromise = null;
  const S2_RETRIES = 4;
  const S2_RETRY_DELAY_MS = 3000;

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

  // Deduplicated cached fetcher
  async function fetchWithCache(cacheKey, fn) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }
    const p = (async () => {
      try {
        const res = await fn();
        if (res !== null && res !== undefined) {
          setCached(cacheKey, res);
        }
        return res;
      } finally {
        inFlightRequests.delete(cacheKey);
      }
    })();
    inFlightRequests.set(cacheKey, p);
    return p;
  }

  async function getSnapshotEntry(config) {
    const snapUrl = config.snapshotUrl || globalConfig.snapshotUrl;
    let snap = globalConfig.snapshotData;
    if (!snap && snapUrl) {
      if (!snapshotPromise) {
        snapshotPromise = fetch(snapUrl)
          .then(r => (r.ok ? r.json() : null))
          .catch(() => null);
      }
      snap = await snapshotPromise;
      if (snap) globalConfig.snapshotData = snap;
    }
    if (!snap || !snap.papers) return null;
    const keys = [];
    if (config.doi) keys.push(`doi:${config.doi}`);
    if (config.arxiv) keys.push(`arxiv:${config.arxiv}`);
    if (config.adsBibcode) keys.push(`ads:${config.adsBibcode}`);
    if (config.zenodo) keys.push(`zenodo:${config.zenodo}`);
    if (config.biorxiv) keys.push(`biorxiv:${config.biorxiv}`);
    if (config.github) keys.push(`github:${config.github}`);
    if (config.docker) keys.push(`docker:${config.docker}`);
    if (config.pypi) keys.push(`pypi:${config.pypi}`);
    if (config.npm) keys.push(`npm:${config.npm}`);
    for (const k of keys) {
      if (snap.papers[k]) return snap.papers[k];
    }
    return null;
  }

  // Format large numbers: 1250 -> 1.3k
  function formatNum(n) {
    if (n === null || n === undefined || n === '') return '—';
    const num = Number(n);
    if (!Number.isFinite(num)) return '—';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toLocaleString();
  }

  // Escape HTML special characters to prevent XSS and broken markup
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Parse optional integer attribute/option safely (returns integer or null)
  function parseOptionalInt(val) {
    if (val === null || val === undefined) return null;
    const str = String(val).trim();
    if (str === '') return null;
    const parsed = parseInt(str, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  // Identifier normalization helpers
  function normalizeDoi(raw) {
    if (!raw) return null;
    const cleaned = String(raw)
      .trim()
      .replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/i, '')
      .trim();
    return cleaned || null;
  }

  function normalizeArxiv(raw) {
    if (!raw) return null;
    const cleaned = String(raw)
      .trim()
      .replace(/^(?:https?:\/\/arxiv\.org\/(?:abs|pdf)\/|arxiv:\s*)/i, '')
      .replace(/\.pdf$/i, '')
      .replace(/v\d+$/i, '')
      .trim();
    return cleaned || null;
  }

  function normalizeBiorxiv(raw) {
    if (!raw) return null;
    const cleaned = String(raw)
      .trim()
      .replace(/^https?:\/\/(?:www\.)?(?:biorxiv|medrxiv)\.org\/content\//i, '')
      .replace(/^(?:doi:\s*)/i, '')
      .replace(/(?:\.full(?:\.pdf)?|v\d+)$/gi, '')
      .replace(/v\d+$/i, '')
      .trim();
    return cleaned || null;
  }

  function normalizeZenodo(raw, doi) {
    if (raw) {
      const str = String(raw).trim();
      const match = str.match(/^(?:https?:\/\/zenodo\.org\/records?\/|10\.5281\/zenodo\.)?(\d+)\/?$/i);
      if (match) return match[1];
      return str || null;
    }
    if (doi) {
      const doiMatch = String(doi).trim().match(/^10\.5281\/zenodo\.(\d+)$/i);
      if (doiMatch) return doiMatch[1];
    }
    return null;
  }

  function normalizeGithub(raw) {
    if (!raw) return null;
    const cleaned = String(raw)
      .trim()
      .replace(/^https?:\/\/(?:www\.)?github\.com\//i, '')
      .replace(/\.git$/i, '')
      .replace(/\/+$/, '');
    const parts = cleaned.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    if (parts.length === 1) {
      return parts[0];
    }
    return null;
  }

  function normalizeDocker(raw) {
    if (!raw) return null;
    const cleaned = String(raw)
      .trim()
      .replace(/^https?:\/\/(?:hub\.docker\.com\/r\/|docker\.io\/)/i, '')
      .replace(/\/+$/, '');
    const parts = cleaned.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
    return null;
  }

  function normalizePypi(raw) {
    if (!raw) return null;
    const cleaned = String(raw)
      .trim()
      .replace(/^https?:\/\/pypi\.org\/project\//i, '')
      .replace(/\/+$/, '')
      .trim();
    return cleaned || null;
  }

  function normalizeNpm(raw) {
    if (!raw) return null;
    const cleaned = String(raw)
      .trim()
      .replace(/^https?:\/\/(?:www\.)?npmjs\.com\/package\//i, '')
      .replace(/\/+$/, '')
      .trim();
    return cleaned || null;
  }

  function parseHumanCount(str) {
    if (typeof str === 'number') return Number.isFinite(str) ? str : null;
    if (!str || typeof str !== 'string') return null;
    const m = str.trim().match(/^([\d.,]+)\s*([kKmM])?/);
    if (!m) return null;
    const num = parseFloat(m[1].replace(/,/g, ''));
    if (!Number.isFinite(num)) return null;
    const unit = (m[2] || '').toLowerCase();
    if (unit === 'm') return Math.round(num * 1000000);
    if (unit === 'k') return Math.round(num * 1000);
    return Math.round(num);
  }

  // Individual API Fetchers
  async function fetchSemanticScholar(opts) {
    const doi = opts.doi || opts.biorxiv;
    const query = doi ? `DOI:${doi}` : (opts.arxiv ? `ARXIV:${opts.arxiv}` : null);
    if (!query) return null;
    const cacheKey = `s2_${query}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        const url = `https://api.semanticscholar.org/graph/v1/paper/${encodeURIComponent(query)}?fields=title,citationCount,influentialCitationCount,year,url`;
        // The anonymous pool is often throttled (HTTP 429). Server-side snapshots can wait
        // and retry, and may use a key from S2_API_KEY; browsers give up immediately.
        const apiKey = !IS_BROWSER && typeof process !== 'undefined' && process.env ? process.env.S2_API_KEY : null;
        const init = apiKey ? { headers: { 'x-api-key': apiKey } } : undefined;
        let res = await fetch(url, init);
        for (let attempt = 1; !IS_BROWSER && res && res.status === 429 && attempt <= S2_RETRIES; attempt++) {
          await new Promise(resolve => setTimeout(resolve, S2_RETRY_DELAY_MS * attempt));
          res = await fetch(url, init);
        }
        if (!res || !res.ok) return null;
        const data = await res.json();
        return {
          title: data.title || null,
          citations: data.citationCount ?? 0,
          influentialCitations: data.influentialCitationCount ?? 0,
          year: data.year,
          url: data.url
        };
      } catch (err) {
        return null;
      }
    });
  }

  async function fetchOpenAlex(opts) {
    const doi = opts.doi || opts.biorxiv || (opts.arxiv ? `10.48550/arXiv.${opts.arxiv}` : null);
    if (!doi) return null;
    const identifier = `https://doi.org/${doi}`;
    const cacheKey = `oa_${identifier}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        const mailto = opts.mailto || globalConfig.mailto;
        const query = mailto ? `?mailto=${encodeURIComponent(mailto)}` : '';
        const url = `https://api.openalex.org/works/${encodeURIComponent(identifier)}${query}`;
        const res = await fetch(url);
        if (!res || !res.ok) return null;
        const data = await res.json();
        return {
          title: data.display_name || data.title || null,
          citations: data.cited_by_count ?? 0,
          isOa: data.open_access?.is_oa ?? false,
          oaStatus: data.open_access?.oa_status,
          year: data.publication_year,
          countsByYear: data.counts_by_year || [],
          url: data.doi || identifier
        };
      } catch (err) {
        return null;
      }
    });
  }

  async function fetchCrossref(opts) {
    const doi = opts.doi || opts.biorxiv;
    if (!doi) return null;
    const cacheKey = `cr_${doi}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        const mailto = opts.mailto || globalConfig.mailto;
        const query = mailto ? `?mailto=${encodeURIComponent(mailto)}` : '';
        const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}${query}`;
        const res = await fetch(url);
        if (!res || !res.ok) return null;
        const json = await res.json();
        const data = json.message || {};
        return {
          title: Array.isArray(data.title) ? data.title[0] : (data.title || null),
          citations: data['is-referenced-by-count'] ?? 0,
          referencesCount: data['references-count'] ?? 0,
          publisher: data.publisher,
          url: data.URL
        };
      } catch (err) {
        return null;
      }
    });
  }

  async function fetchEuropePmc(opts) {
    const doi = opts.doi || opts.biorxiv;
    if (!doi) return null;
    const cacheKey = `epmc_${doi}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(`DOI:"${doi}"`)}&format=json`;
        const res = await fetch(url);
        if (!res || !res.ok) return null;
        const json = await res.json();
        const item = json.resultList?.result?.[0];
        if (!item) return null;
        return {
          title: item.title || null,
          citations: item.citedByCount ?? 0,
          pmcid: item.pmcid,
          url: item.pmcid ? `https://europepmc.org/article/PMC/${item.pmcid}` : null
        };
      } catch (err) {
        return null;
      }
    });
  }

  async function fetchZenodo(opts) {
    if (!opts.zenodo) return null;
    const cacheKey = `zenodo_${opts.zenodo}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        const url = `https://zenodo.org/api/records/${encodeURIComponent(opts.zenodo)}`;
        const res = await fetch(url);
        if (!res || !res.ok) return null;
        const data = await res.json();
        const stats = data.stats || {};
        return {
          title: data.metadata?.title || data.title || null,
          doi: data.doi || data.metadata?.doi || null,
          views: stats.views ?? 0,
          downloads: stats.downloads ?? 0,
          uniqueDownloads: stats.unique_downloads ?? 0,
          url: data.links?.self_html || data.links?.html || `https://zenodo.org/records/${opts.zenodo}`
        };
      } catch (err) {
        return null;
      }
    });
  }

  async function fetchPlosCounter(opts) {
    const candidateDoi = opts.plosDoi || opts.doi;
    if (!opts.plosDoi && (!candidateDoi || !/^10\.1371\/journal\.p/i.test(candidateDoi))) return null;
    const doi = candidateDoi;
    const cacheKey = `plos_${doi}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        const url = `https://counter.plos.org/api/v1.0/stats/doi/${encodeURIComponent(doi)}/format/json`;
        const res = await fetch(url);
        if (!res || !res.ok) return null;
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

        return {
          total: data.total ?? (html + pdf + xml),
          pdf: pdf,
          html: html,
          xml: xml,
          url: `https://doi.org/${doi}`
        };
      } catch (err) {
        return null;
      }
    });
  }

  async function fetchBiorxiv(opts) {
    const doi = opts.biorxiv || (opts.doi && /^10\.1101\//.test(opts.doi) ? opts.doi : null);
    if (!doi) return null;
    const cacheKey = `biorxiv_${doi}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        const encodedDoi = encodeURIComponent(doi).replace(/%2F/gi, '/');
        const url = `https://api.biorxiv.org/details/biorxiv/${encodedDoi}/na/json`;
        const res = await fetch(url);
        if (!res || !res.ok) return null;
        const data = await res.json();
        const collection = data.collection;
        if (!Array.isArray(collection) || collection.length === 0) return null;
        const latest = collection[collection.length - 1];
        const usage = IS_BROWSER ? null : await fetchBiorxivUsage(doi, latest.version, latest.server);
        return {
          title: latest.title || null,
          pdfs: usage ? usage.pdfs : null,
          views: usage ? usage.views : null,
          doi: latest.doi || doi,
          publishedDoi: latest.published && latest.published !== 'NA' ? latest.published : null,
          versions: collection.length,
          server: latest.server || 'bioRxiv',
          url: `https://www.biorxiv.org/content/${encodedDoi}`
        };
      } catch (err) {
        return null;
      }
    });
  }

  // Lifetime usage from the bioRxiv "Metrics" tab (HTML table: Abstract | Full | Pdf per month)
  async function fetchBiorxivUsage(doi, version, server) {
    try {
      const host = /medrxiv/i.test(server || '') ? 'www.medrxiv.org' : 'www.biorxiv.org';
      const url = `https://${host}/content/${doi}v${version || 1}.article-metrics`;
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (citeometer snapshot)' } });
      if (!res || !res.ok) return null;
      const html = await res.text();
      const start = html.indexOf('<table class="highwire-stats');
      if (start === -1) return null;
      const table = html.slice(start, html.indexOf('</table>', start));
      let views = 0;
      let pdfs = 0;
      let rows = 0;
      for (const row of table.split(/<tr[\s>]/i).slice(1)) {
        const cells = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => parseInt(m[1].replace(/<[^>]+>|[,\s]/g, ''), 10));
        if (cells.length < 4 || cells.slice(1, 4).some(n => !Number.isFinite(n))) continue;
        views += cells[1] + cells[2];
        pdfs += cells[3];
        rows++;
      }
      return rows > 0 ? { views, pdfs } : null;
    } catch (err) {
      return null;
    }
  }

  async function fetchAds(opts) {
    const bibcode = opts.adsBibcode ? String(opts.adsBibcode).trim() : null;
    const adsUrl = bibcode ? `https://ui.adsabs.harvard.edu/abs/${encodeURIComponent(bibcode)}/metrics` : null;
    const staticReads = parseOptionalInt(opts.adsReads);

    // If valid static value provided
    if (staticReads !== null) {
      return {
        recentReads: staticReads,
        citations: null,
        bibcode: bibcode,
        url: adsUrl
      };
    }
    if (IS_BROWSER) return bibcode ? { recentReads: null, citations: null, bibcode, url: adsUrl } : null;

    // Server-side, papers without a bibcode are looked up by DOI or arXiv ID
    let adsQuery = null;
    if (bibcode) adsQuery = `bibcode:${bibcode}`;
    else if (opts.doi) adsQuery = `doi:"${opts.doi}"`;
    else if (opts.arxiv) adsQuery = `arxiv:${opts.arxiv}`;
    if (!adsQuery) return null;
    const cacheKey = `ads_${adsQuery}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    try {
      // One anonymous ADS token per process is enough
      if (!adsTokenPromise) {
        adsTokenPromise = fetch('https://ui.adsabs.harvard.edu/v1/accounts/bootstrap')
          .then(r => (r && r.ok ? r.json() : null))
          .then(boot => (boot && boot.access_token) || null)
          .catch(() => null);
      }
      const token = await adsTokenPromise;
      if (!token) {
        adsTokenPromise = null;
        return { recentReads: null, citations: null, bibcode, url: adsUrl };
      }

      const qUrl = `https://api.adsabs.harvard.edu/v1/search/query?q=${encodeURIComponent(adsQuery)}&fl=read_count,citation_count,bibcode,title`;
      const res = await fetch(qUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res || !res.ok) return { recentReads: null, citations: null, bibcode, url: adsUrl };
      const data = await res.json();
      const doc = data.response?.docs?.[0];
      if (!doc) return { recentReads: null, citations: null, bibcode, url: adsUrl };

      const result = {
        title: Array.isArray(doc.title) ? doc.title[0] : (doc.title || null),
        recentReads: doc.read_count ?? 0,
        citations: doc.citation_count ?? 0,
        bibcode: doc.bibcode || bibcode,
        url: `https://ui.adsabs.harvard.edu/abs/${encodeURIComponent(doc.bibcode || bibcode)}/metrics`
      };
      setCached(cacheKey, result);
      return result;
    } catch (e) {
      return { recentReads: null, citations: null, bibcode, url: adsUrl };
    }
  }

  async function fetchDataCite(opts) {
    const doi = opts.doi || (opts.arxiv ? `10.48550/arXiv.${opts.arxiv}` : null);
    if (!doi) return null;
    const cacheKey = `dc_${doi}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        const url = `https://api.datacite.org/dois/${encodeURIComponent(doi)}`;
        const res = await fetch(url);
        if (!res || !res.ok) return null;
        const json = await res.json();
        const attr = json?.data?.attributes;
        if (!attr) return null;
        return {
          title: Array.isArray(attr.titles) && attr.titles[0]?.title ? attr.titles[0].title : null,
          citations: attr.citationCount ?? 0,
          views: attr.viewCount ?? 0,
          downloads: attr.downloadCount ?? 0,
          url: attr.url || `https://doi.org/${doi}`
        };
      } catch (err) {
        return null;
      }
    });
  }

  async function fetchOpenCitations(opts) {
    const doi = opts.doi || opts.biorxiv;
    if (!doi) return null;
    const cacheKey = `oc_${doi}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        const url = `https://opencitations.net/index/api/v2/citation-count/doi:${encodeURIComponent(doi)}`;
        const res = await fetch(url);
        if (!res || !res.ok) return null;
        const json = await res.json();
        if (!Array.isArray(json) || json.length === 0 || json[0]?.count === undefined) return null;
        const count = parseInt(json[0].count, 10);
        if (!Number.isFinite(count)) return null;
        return {
          citations: count,
          url: `https://opencitations.net/index/api/v2/citations/doi:${encodeURIComponent(doi)}`
        };
      } catch (err) {
        return null;
      }
    });
  }

  async function fetchGitHub(opts) {
    if (!opts.github) return null;
    const repo = opts.github;
    const staticClones = parseOptionalInt(opts.githubClones);
    const staticViews = parseOptionalInt(opts.githubViews);
    const cacheKey = `gh_${repo}_${staticClones ?? ''}_${staticViews ?? ''}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        const token = !IS_BROWSER && typeof process !== 'undefined' && process.env
          ? (process.env.GH_TRAFFIC_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || null)
          : null;
        const init = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;

        // Organization or user account (no slash)
        if (!repo.includes('/')) {
          let orgRes = await fetch(`https://api.github.com/orgs/${repo}/repos?per_page=100`, init);
          if (!orgRes || !orgRes.ok) {
            orgRes = await fetch(`https://api.github.com/users/${repo}/repos?per_page=100`, init);
          }
          if (!orgRes || !orgRes.ok) return null;
          const repos = await orgRes.json();
          if (!Array.isArray(repos) || repos.length === 0) return null;
          let stars = 0;
          let forks = 0;
          for (const r of repos) {
            stars += (r.stargazers_count || 0);
            forks += (r.forks_count || 0);
          }
          let clones = staticClones;
          let uniqueClones = null;
          let views = staticViews;
          let uniqueViews = null;
          if (!IS_BROWSER && token && (clones === null || views === null)) {
            let cSum = 0, ucSum = 0, vSum = 0, uvSum = 0, hasTraffic = false;
            await Promise.all(repos.map(async (r) => {
              if (!r.full_name) return;
              const [cRes, vRes] = await Promise.all([
                fetch(`https://api.github.com/repos/${r.full_name}/traffic/clones`, init).catch(() => null),
                fetch(`https://api.github.com/repos/${r.full_name}/traffic/views`, init).catch(() => null)
              ]);
              if (cRes && cRes.ok) {
                const cData = await cRes.json();
                cSum += (cData.count || 0);
                ucSum += (cData.uniques || 0);
                hasTraffic = true;
              }
              if (vRes && vRes.ok) {
                const vData = await vRes.json();
                vSum += (vData.count || 0);
                uvSum += (vData.uniques || 0);
                hasTraffic = true;
              }
            }));
            if (hasTraffic) {
              if (clones === null) { clones = cSum; uniqueClones = ucSum; }
              if (views === null) { views = vSum; uniqueViews = uvSum; }
            }
          }
          return {
            title: repo,
            isOrg: true,
            repos: repos.length,
            stars,
            forks,
            downloads: 0,
            clones,
            uniqueClones,
            views,
            uniqueViews,
            url: `https://github.com/${repo}`
          };
        }

        const fetches = [
          fetch(`https://api.github.com/repos/${repo}`, init),
          fetch(`https://api.github.com/repos/${repo}/releases?per_page=30`, init).catch(() => null)
        ];
        if (!IS_BROWSER && token) {
          fetches.push(
            fetch(`https://api.github.com/repos/${repo}/traffic/clones`, init).catch(() => null),
            fetch(`https://api.github.com/repos/${repo}/traffic/views`, init).catch(() => null)
          );
        }
        const [repoRes, relRes, clonesRes, viewsRes] = await Promise.all(fetches);
        if (!repoRes || !repoRes.ok) return null;
        const repoData = await repoRes.json();
        let releaseDownloads = 0;
        if (relRes && relRes.ok) {
          const releases = await relRes.json();
          if (Array.isArray(releases)) {
            for (const rel of releases) {
              for (const asset of (rel.assets || [])) {
                releaseDownloads += (asset.download_count || 0);
              }
            }
          }
        }
        let clones = staticClones;
        let uniqueClones = null;
        let views = staticViews;
        let uniqueViews = null;
        if (clonesRes && clonesRes.ok) {
          const cData = await clonesRes.json();
          if (clones === null && typeof cData.count === 'number') clones = cData.count;
          if (typeof cData.uniques === 'number') uniqueClones = cData.uniques;
        }
        if (viewsRes && viewsRes.ok) {
          const vData = await viewsRes.json();
          if (views === null && typeof vData.count === 'number') views = vData.count;
          if (typeof vData.uniques === 'number') uniqueViews = vData.uniques;
        }
        return {
          title: repoData.full_name || repo,
          description: repoData.description || null,
          stars: repoData.stargazers_count ?? 0,
          forks: repoData.forks_count ?? 0,
          downloads: releaseDownloads,
          clones,
          uniqueClones,
          views,
          uniqueViews,
          url: repoData.html_url || `https://github.com/${repo}`
        };
      } catch (err) {
        return null;
      }
    });
  }

  async function fetchDockerHub(opts) {
    if (!opts.docker) return null;
    const repo = opts.docker;
    const cacheKey = `docker_${repo}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        if (!IS_BROWSER) {
          const res = await fetch(`https://hub.docker.com/v2/repositories/${repo}/`);
          if (!res || !res.ok) return null;
          const data = await res.json();
          return {
            title: repo,
            pulls: data.pull_count ?? 0,
            stars: data.star_count ?? 0,
            url: `https://hub.docker.com/r/${repo}`
          };
        }
        const res = await fetch(`https://img.shields.io/docker/pulls/${repo}.json`);
        if (!res || !res.ok) return null;
        const data = await res.json();
        const pulls = parseHumanCount(data.message || data.value);
        if (pulls === null) return null;
        return {
          title: repo,
          pulls,
          url: `https://hub.docker.com/r/${repo}`
        };
      } catch (err) {
        return null;
      }
    });
  }

  async function fetchPyPI(opts) {
    if (!opts.pypi) return null;
    const pkg = opts.pypi;
    const cacheKey = `pypi_${pkg}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        if (!IS_BROWSER) {
          const [overallRes, recentRes] = await Promise.all([
            fetch(`https://pypistats.org/api/packages/${encodeURIComponent(pkg)}/overall`).catch(() => null),
            fetch(`https://pypistats.org/api/packages/${encodeURIComponent(pkg)}/recent`).catch(() => null)
          ]);
          let downloads = null;
          let monthlyDownloads = null;
          if (overallRes && overallRes.ok) {
            const oData = await overallRes.json();
            if (Array.isArray(oData.data)) {
              downloads = oData.data
                .filter(d => d && d.category === 'without_mirrors')
                .reduce((sum, d) => sum + (d.downloads || 0), 0);
            }
          }
          if (recentRes && recentRes.ok) {
            const rData = await recentRes.json();
            if (typeof rData.data?.last_month === 'number') {
              monthlyDownloads = rData.data.last_month;
              if (downloads === null) downloads = monthlyDownloads;
            }
          }
          if (downloads === null && monthlyDownloads === null) return null;
          return {
            title: pkg,
            downloads,
            monthlyDownloads,
            url: `https://pypi.org/project/${encodeURIComponent(pkg)}/`
          };
        }
        const res = await fetch(`https://img.shields.io/pypi/dm/${encodeURIComponent(pkg)}.json`);
        if (!res || !res.ok) return null;
        const data = await res.json();
        const monthlyDownloads = parseHumanCount(data.message || data.value);
        if (monthlyDownloads === null) return null;
        return {
          title: pkg,
          downloads: monthlyDownloads,
          monthlyDownloads,
          url: `https://pypi.org/project/${encodeURIComponent(pkg)}/`
        };
      } catch (err) {
        return null;
      }
    });
  }

  async function fetchNpm(opts) {
    if (!opts.npm) return null;
    const pkg = opts.npm;
    const cacheKey = `npm_${pkg}`;
    return fetchWithCache(cacheKey, async () => {
      try {
        const res = await fetch(`https://api.npmjs.org/downloads/point/last-year/${encodeURIComponent(pkg)}`);
        if (!res || !res.ok) return null;
        const data = await res.json();
        if (typeof data.downloads !== 'number') return null;
        return {
          title: pkg,
          downloads: data.downloads,
          url: `https://www.npmjs.com/package/${encodeURIComponent(pkg)}`
        };
      } catch (err) {
        return null;
      }
    });
  }

  // Aggregate metrics for a paper or software project config
  async function aggregateMetrics(rawConfig = {}) {
    const doi = normalizeDoi(rawConfig.doi);
    const arxiv = normalizeArxiv(rawConfig.arxiv);
    const biorxiv = normalizeBiorxiv(rawConfig.biorxiv);
    const zenodo = normalizeZenodo(rawConfig.zenodo, doi);
    const plosDoi = normalizeDoi(rawConfig.plosDoi);
    const github = normalizeGithub(rawConfig.github);
    const docker = normalizeDocker(rawConfig.docker);
    const pypi = normalizePypi(rawConfig.pypi);
    const npm = normalizeNpm(rawConfig.npm);
    const adsBibcode = rawConfig.adsBibcode ? String(rawConfig.adsBibcode).trim() : null;

    const config = {
      ...rawConfig,
      doi,
      arxiv,
      biorxiv,
      zenodo,
      plosDoi,
      github,
      docker,
      pypi,
      npm,
      adsBibcode
    };

    const results = {
      title: rawConfig.title ? String(rawConfig.title).trim() : null,
      doi,
      arxiv,
      biorxiv,
      zenodo,
      github,
      docker,
      pypi,
      npm,
      adsBibcode,
      publishedDoi: null,
      isOa: false,
      oaStatus: null,

      // Metric buckets
      citations: null,
      influentialCitations: null,
      openAlexCitations: null,
      crossrefCitations: null,
      dataCiteCitations: null,
      openCitationsCount: null,
      adsReads: null,
      biorxivPdfs: parseOptionalInt(rawConfig.biorxivPdfs),
      biorxivViews: parseOptionalInt(rawConfig.biorxivViews),
      plosTotal: null,
      plosPdfs: null,
      zenodoDownloads: null,
      zenodoViews: null,
      dataCiteDownloads: null,
      dataCiteViews: null,
      githubStars: null,
      githubForks: null,
      githubDownloads: null,
      githubClones: parseOptionalInt(rawConfig.githubClones),
      githubUniqueClones: null,
      githubViews: parseOptionalInt(rawConfig.githubViews),
      githubUniqueViews: null,
      githubRepos: null,
      dockerPulls: null,
      pypiDownloads: null,
      pypiMonthly: null,
      npmDownloads: null,

      sources: {}
    };

    const updateMaxCitations = (val) => {
      if (typeof val === 'number' && Number.isFinite(val)) {
        if (results.citations === null || val > results.citations) {
          results.citations = val;
        }
      }
    };

    // Merge pre-fetched snapshot baseline if configured
    const snapEntry = await getSnapshotEntry(config);
    if (snapEntry) {
      if (snapEntry.citations !== null && snapEntry.citations !== undefined) updateMaxCitations(snapEntry.citations);
      if (snapEntry.adsReads !== null && snapEntry.adsReads !== undefined && results.adsReads === null) results.adsReads = snapEntry.adsReads;
      if (snapEntry.influentialCitations !== null && snapEntry.influentialCitations !== undefined) results.influentialCitations = snapEntry.influentialCitations;
      if (snapEntry.biorxivPdfs !== null && snapEntry.biorxivPdfs !== undefined && results.biorxivPdfs === null) results.biorxivPdfs = snapEntry.biorxivPdfs;
      if (snapEntry.biorxivViews !== null && snapEntry.biorxivViews !== undefined && results.biorxivViews === null) results.biorxivViews = snapEntry.biorxivViews;
      if (snapEntry.plosPdfs !== null && snapEntry.plosPdfs !== undefined) results.plosPdfs = snapEntry.plosPdfs;
      if (snapEntry.plosTotal !== null && snapEntry.plosTotal !== undefined) results.plosTotal = snapEntry.plosTotal;
      if (snapEntry.zenodoDownloads !== null && snapEntry.zenodoDownloads !== undefined) results.zenodoDownloads = snapEntry.zenodoDownloads;
      if (snapEntry.zenodoViews !== null && snapEntry.zenodoViews !== undefined) results.zenodoViews = snapEntry.zenodoViews;
      if (snapEntry.githubStars !== null && snapEntry.githubStars !== undefined) results.githubStars = snapEntry.githubStars;
      if (snapEntry.githubForks !== null && snapEntry.githubForks !== undefined) results.githubForks = snapEntry.githubForks;
      if (snapEntry.githubDownloads !== null && snapEntry.githubDownloads !== undefined) results.githubDownloads = snapEntry.githubDownloads;
      if (snapEntry.githubClones !== null && snapEntry.githubClones !== undefined && results.githubClones === null) results.githubClones = snapEntry.githubClones;
      if (snapEntry.githubUniqueClones !== null && snapEntry.githubUniqueClones !== undefined) results.githubUniqueClones = snapEntry.githubUniqueClones;
      if (snapEntry.githubViews !== null && snapEntry.githubViews !== undefined && results.githubViews === null) results.githubViews = snapEntry.githubViews;
      if (snapEntry.githubUniqueViews !== null && snapEntry.githubUniqueViews !== undefined) results.githubUniqueViews = snapEntry.githubUniqueViews;
      if (snapEntry.githubRepos !== null && snapEntry.githubRepos !== undefined) results.githubRepos = snapEntry.githubRepos;
      if (snapEntry.dockerPulls !== null && snapEntry.dockerPulls !== undefined) results.dockerPulls = snapEntry.dockerPulls;
      if (snapEntry.pypiDownloads !== null && snapEntry.pypiDownloads !== undefined) results.pypiDownloads = snapEntry.pypiDownloads;
      if (snapEntry.pypiMonthly !== null && snapEntry.pypiMonthly !== undefined) results.pypiMonthly = snapEntry.pypiMonthly;
      if (snapEntry.npmDownloads !== null && snapEntry.npmDownloads !== undefined) results.npmDownloads = snapEntry.npmDownloads;
      if (snapEntry.sources) results.sources = { ...snapEntry.sources };
      if (snapEntry.isOa !== undefined || snapEntry.sources?.openAlex?.isOa !== undefined) {
        results.isOa = Boolean(snapEntry.isOa ?? snapEntry.sources?.openAlex?.isOa);
      }
      if (snapEntry.oaStatus || snapEntry.sources?.openAlex?.oaStatus) {
        results.oaStatus = snapEntry.oaStatus || snapEntry.sources?.openAlex?.oaStatus;
      }
      if (snapEntry.publishedDoi || snapEntry.sources?.biorxiv?.publishedDoi) {
        results.publishedDoi = snapEntry.publishedDoi || snapEntry.sources?.biorxiv?.publishedDoi;
      }
    }

    // Parallel fetches
    const [s2, oa, cr, epmc, zen, plos, bxv, ads, dc, oc, gh, dkr, pypiRes, npmRes] = await Promise.allSettled([
      fetchSemanticScholar(config),
      fetchOpenAlex(config),
      fetchCrossref(config),
      fetchEuropePmc(config),
      fetchZenodo(config),
      fetchPlosCounter(config),
      fetchBiorxiv(config),
      fetchAds(config),
      fetchDataCite(config),
      fetchOpenCitations(config),
      fetchGitHub(config),
      fetchDockerHub(config),
      fetchPyPI(config),
      fetchNpm(config)
    ]);

    if (s2.status === 'fulfilled' && s2.value) {
      results.sources.semanticScholar = s2.value;
      updateMaxCitations(s2.value.citations);
      results.influentialCitations = s2.value.influentialCitations;
    }
    if (oa.status === 'fulfilled' && oa.value) {
      results.sources.openAlex = oa.value;
      results.openAlexCitations = oa.value.citations;
      results.isOa = Boolean(oa.value.isOa);
      results.oaStatus = oa.value.oaStatus || null;
      updateMaxCitations(oa.value.citations);
    }
    if (cr.status === 'fulfilled' && cr.value) {
      results.sources.crossref = cr.value;
      results.crossrefCitations = cr.value.citations;
      updateMaxCitations(cr.value.citations);
    }
    if (epmc.status === 'fulfilled' && epmc.value) {
      results.sources.europePmc = epmc.value;
      updateMaxCitations(epmc.value.citations);
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
    if (bxv.status === 'fulfilled' && bxv.value) {
      results.sources.biorxiv = bxv.value;
      if (results.biorxivPdfs === null && typeof bxv.value.pdfs === 'number') results.biorxivPdfs = bxv.value.pdfs;
      if (results.biorxivViews === null && typeof bxv.value.views === 'number') results.biorxivViews = bxv.value.views;
      if (bxv.value.publishedDoi) {
        results.publishedDoi = bxv.value.publishedDoi;
        // Preprint-to-published journal link: merge citations from published journal DOI if different
        if (!doi || doi === biorxiv) {
          const [pubOa, pubCr] = await Promise.allSettled([
            fetchOpenAlex({ doi: bxv.value.publishedDoi, mailto: config.mailto }),
            fetchCrossref({ doi: bxv.value.publishedDoi, mailto: config.mailto })
          ]);
          if (pubOa.status === 'fulfilled' && pubOa.value) {
            results.sources.publishedJournal = pubOa.value;
            updateMaxCitations(pubOa.value.citations);
          }
          if (pubCr.status === 'fulfilled' && pubCr.value) {
            if (!results.sources.publishedJournal) results.sources.publishedJournal = pubCr.value;
            updateMaxCitations(pubCr.value.citations);
          }
        }
      }
    }
    if (ads.status === 'fulfilled' && ads.value) {
      results.sources.ads = ads.value;
      if (ads.value.recentReads !== null && ads.value.recentReads !== undefined) {
        results.adsReads = ads.value.recentReads;
      }
      updateMaxCitations(ads.value.citations);
    }
    if (dc.status === 'fulfilled' && dc.value) {
      results.sources.dataCite = dc.value;
      results.dataCiteCitations = dc.value.citations;
      if (dc.value.downloads > 0) results.dataCiteDownloads = dc.value.downloads;
      if (dc.value.views > 0) results.dataCiteViews = dc.value.views;
      updateMaxCitations(dc.value.citations);
    }
    if (oc.status === 'fulfilled' && oc.value) {
      results.sources.openCitations = oc.value;
      results.openCitationsCount = oc.value.citations;
      updateMaxCitations(oc.value.citations);
    }
    if (gh.status === 'fulfilled' && gh.value) {
      results.sources.github = { ...(results.sources.github || {}), ...gh.value };
      results.githubStars = Math.max(results.githubStars ?? 0, gh.value.stars ?? 0);
      if (typeof gh.value.forks === 'number') {
        results.githubForks = Math.max(results.githubForks ?? 0, gh.value.forks);
      }
      if (gh.value.downloads > 0) {
        results.githubDownloads = Math.max(results.githubDownloads ?? 0, gh.value.downloads);
      }
      if (typeof gh.value.clones === 'number') results.githubClones = gh.value.clones;
      if (typeof gh.value.uniqueClones === 'number') results.githubUniqueClones = gh.value.uniqueClones;
      if (typeof gh.value.views === 'number') results.githubViews = gh.value.views;
      if (typeof gh.value.uniqueViews === 'number') results.githubUniqueViews = gh.value.uniqueViews;
      if (typeof gh.value.repos === 'number') results.githubRepos = gh.value.repos;
    }
    if (dkr.status === 'fulfilled' && dkr.value) {
      results.sources.docker = dkr.value;
      if (typeof dkr.value.pulls === 'number') {
        results.dockerPulls = Math.max(results.dockerPulls ?? 0, dkr.value.pulls);
      }
    }
    if (pypiRes.status === 'fulfilled' && pypiRes.value) {
      results.sources.pypi = pypiRes.value;
      if (typeof pypiRes.value.downloads === 'number') {
        results.pypiDownloads = Math.max(results.pypiDownloads ?? 0, pypiRes.value.downloads);
      }
      if (typeof pypiRes.value.monthlyDownloads === 'number') {
        results.pypiMonthly = pypiRes.value.monthlyDownloads;
      }
    }
    if (npmRes.status === 'fulfilled' && npmRes.value) {
      results.sources.npm = npmRes.value;
      if (typeof npmRes.value.downloads === 'number') {
        results.npmDownloads = Math.max(results.npmDownloads ?? 0, npmRes.value.downloads);
      }
    }

    if (!results.title) {
      results.title =
        results.sources.openAlex?.title ||
        results.sources.crossref?.title ||
        results.sources.semanticScholar?.title ||
        results.sources.europePmc?.title ||
        results.sources.biorxiv?.title ||
        results.sources.zenodo?.title ||
        results.sources.dataCite?.title ||
        results.sources.ads?.title ||
        results.sources.github?.title ||
        results.sources.docker?.title ||
        results.sources.pypi?.title ||
        results.sources.npm?.title ||
        'Scholarly Publication';
    }

    return results;
  }

  // Build per-source citation breakdown array
  function getCitationBreakdown(metrics) {
    const entries = [];
    const s = metrics.sources || {};
    if (typeof s.openAlex?.citations === 'number') entries.push({ name: 'OpenAlex', count: s.openAlex.citations });
    if (typeof s.semanticScholar?.citations === 'number') entries.push({ name: 'Semantic Scholar', count: s.semanticScholar.citations });
    if (typeof s.crossref?.citations === 'number') entries.push({ name: 'Crossref', count: s.crossref.citations });
    if (typeof s.europePmc?.citations === 'number') entries.push({ name: 'Europe PMC', count: s.europePmc.citations });
    if (typeof s.openCitations?.citations === 'number') entries.push({ name: 'OpenCitations', count: s.openCitations.citations });
    if (typeof s.dataCite?.citations === 'number' && s.dataCite.citations > 0) entries.push({ name: 'DataCite', count: s.dataCite.citations });
    if (typeof s.ads?.citations === 'number' && s.ads.citations > 0) entries.push({ name: 'NASA ADS', count: s.ads.citations });
    if (typeof s.publishedJournal?.citations === 'number') entries.push({ name: 'Published DOI', count: s.publishedJournal.citations });
    return entries;
  }

  // Render inline SVG sparkline for annual citations (OpenAlex counts_by_year)
  function renderSparkline(countsByYear) {
    if (!Array.isArray(countsByYear) || countsByYear.length < 2) return '';
    const sorted = [...countsByYear]
      .filter(d => d && typeof d.year === 'number' && typeof d.cited_by_count === 'number')
      .sort((a, b) => a.year - b.year)
      .slice(-10);
    if (sorted.length < 2) return '';

    const maxCount = Math.max(...sorted.map(d => d.cited_by_count), 1);
    const barW = 14;
    const gap = 4;
    const height = 36;
    const width = sorted.length * (barW + gap) - gap;

    const bars = sorted.map((d, idx) => {
      const barH = Math.max(3, Math.round((d.cited_by_count / maxCount) * (height - 6)));
      const x = idx * (barW + gap);
      const y = height - barH;
      return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="2" class="pm-sparkline-bar"><title>${d.year}: ${d.cited_by_count} citations</title></rect>`;
    }).join('');

    const firstYear = sorted[0].year;
    const lastYear = sorted[sorted.length - 1].year;

    return `
      <div class="pm-sparkline-box" title="Annual citation velocity (${firstYear}–${lastYear})">
        <div class="pm-sparkline-header">
          <span class="pm-sparkline-lbl">Annual Citation Trend (${firstYear}–${lastYear})</span>
        </div>
        <svg class="pm-sparkline-svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="Annual citation trend from ${firstYear} to ${lastYear}">
          ${bars}
        </svg>
      </div>
    `;
  }

  // Inline SVG icons (paths adapted from Lucide, ISC license) — no icon font or extra requests
  const ICON_PATHS = {
    cites: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    reads: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    archive: '<rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/>',
    repo: '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
    box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
    unlock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    pulse: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>'
  };

  function icon(name) {
    return `<svg class="pm-icon" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;
  }

  // HTML Renderers
  function renderBadge(metrics, opts = {}) {
    const pills = [];
    const show = (n) => n !== null && n !== undefined && (!opts.hideZero || n > 0);
    const breakdown = getCitationBreakdown(metrics);
    const breakdownTooltip = breakdown.length > 0
      ? 'Citations — ' + breakdown.map(b => `${b.name}: ${b.count}`).join(' | ')
      : 'Citations across OpenAlex / Semantic Scholar / Crossref';

    if (show(metrics.citations)) {
      pills.push(`
        <span class="pm-badge pm-badge-citations" title="${escapeHtml(breakdownTooltip)}">
          ${icon('cites')}
          <strong>${formatNum(metrics.citations)}</strong> cites
        </span>
      `);
    }

    if (metrics.influentialCitations !== null && metrics.influentialCitations > 0) {
      pills.push(`
        <span class="pm-badge pm-badge-influential" title="Semantic Scholar Influential Citations">
          ${icon('star')}
          <strong>${formatNum(metrics.influentialCitations)}</strong> influential
        </span>
      `);
    }

    if (metrics.adsReads !== null && metrics.adsReads > 0) {
      pills.push(`
        <span class="pm-badge pm-badge-ads" title="ADS Recent Reads (90-day rolling window)">
          ${icon('reads')}
          <strong>${formatNum(metrics.adsReads)}</strong> ADS reads (90d)
        </span>
      `);
    }

    if (show(metrics.biorxivPdfs)) {
      pills.push(`
        <span class="pm-badge pm-badge-biorxiv" title="bioRxiv Cumulative PDF Downloads">
          ${icon('file')}
          <strong>${formatNum(metrics.biorxivPdfs)}</strong> bioRxiv PDFs
        </span>
      `);
    }

    if (show(metrics.plosPdfs)) {
      pills.push(`
        <span class="pm-badge pm-badge-plos" title="PLOS COUNTER PDF Downloads">
          ${icon('download')}
          <strong>${formatNum(metrics.plosPdfs)}</strong> PLOS PDFs
        </span>
      `);
    }

    if (show(metrics.zenodoDownloads)) {
      pills.push(`
        <span class="pm-badge pm-badge-zenodo" title="Zenodo Software/Dataset Downloads">
          ${icon('archive')}
          <strong>${formatNum(metrics.zenodoDownloads)}</strong> downloads
        </span>
      `);
    }

    const orgScope = metrics.githubRepos ? ` across ${metrics.githubRepos} repositories` : '';
    if (metrics.githubStars !== null && metrics.githubStars > 0) {
      pills.push(`
        <span class="pm-badge pm-badge-github" title="GitHub Stars${escapeHtml(orgScope)}">
          ${icon('star')}
          <strong>${formatNum(metrics.githubStars)}</strong> ${metrics.githubStars === 1 ? 'star' : 'stars'}
        </span>
      `);
    }

    if (metrics.githubForks !== null && metrics.githubForks > 0) {
      pills.push(`
        <span class="pm-badge pm-badge-forks" title="GitHub Forks${escapeHtml(orgScope)}">
          ${icon('repo')}
          <strong>${formatNum(metrics.githubForks)}</strong> ${metrics.githubForks === 1 ? 'fork' : 'forks'}
        </span>
      `);
    }

    if (metrics.githubClones !== null && metrics.githubClones > 0) {
      const cloneTip = metrics.githubUniqueClones
        ? `GitHub Clones (14-day window: ${metrics.githubClones} total, ${metrics.githubUniqueClones} unique${orgScope})`
        : `GitHub Clones (14-day rolling window${orgScope})`;
      pills.push(`
        <span class="pm-badge pm-badge-clones" title="${escapeHtml(cloneTip)}">
          ${icon('terminal')}
          <strong>${formatNum(metrics.githubClones)}</strong> clones (14d)
        </span>
      `);
    }

    if (metrics.githubViews !== null && metrics.githubViews > 0) {
      const viewTip = metrics.githubUniqueViews
        ? `GitHub Views (14-day window: ${metrics.githubViews} total, ${metrics.githubUniqueViews} unique${orgScope})`
        : `GitHub Views (14-day rolling window${orgScope})`;
      pills.push(`
        <span class="pm-badge pm-badge-views" title="${escapeHtml(viewTip)}">
          ${icon('reads')}
          <strong>${formatNum(metrics.githubViews)}</strong> views (14d)
        </span>
      `);
    }

    if (metrics.githubDownloads !== null && metrics.githubDownloads > 0) {
      pills.push(`
        <span class="pm-badge pm-badge-github" title="GitHub Release Asset Downloads">
          ${icon('download')}
          <strong>${formatNum(metrics.githubDownloads)}</strong> downloads
        </span>
      `);
    }

    if (metrics.dockerPulls !== null && metrics.dockerPulls > 0) {
      pills.push(`
        <span class="pm-badge pm-badge-docker" title="Docker Hub Container Pulls">
          ${icon('box')}
          <strong>${formatNum(metrics.dockerPulls)}</strong> Docker pulls
        </span>
      `);
    }

    if (metrics.pypiDownloads !== null && metrics.pypiDownloads > 0) {
      const pypiTip = metrics.pypiMonthly
        ? `PyPI Downloads (${metrics.pypiDownloads.toLocaleString()} in 180d · ${metrics.pypiMonthly.toLocaleString()}/month)`
        : 'PyPI Package Downloads';
      pills.push(`
        <span class="pm-badge pm-badge-pypi" title="${escapeHtml(pypiTip)}">
          ${icon('box')}
          <strong>${formatNum(metrics.pypiDownloads)}</strong> PyPI downloads
        </span>
      `);
    }

    if (metrics.npmDownloads !== null && metrics.npmDownloads > 0) {
      pills.push(`
        <span class="pm-badge pm-badge-npm" title="npm Package Downloads">
          ${icon('box')}
          <strong>${formatNum(metrics.npmDownloads)}</strong> npm downloads
        </span>
      `);
    }

    if (pills.length === 0) {
      return opts.hideZero ? '' : `<span class="pm-badge pm-badge-loading">No public metrics found</span>`;
    }

    return `<div class="pm-badges-container">${pills.join('')}</div>`;
  }

  function renderCompact(metrics, opts = {}) {
    const parts = [];
    const show = (n) => n !== null && n !== undefined && (!opts.hideZero || n > 0);
    if (show(metrics.citations)) {
      parts.push(`<span class="pm-compact-item" title="Total Citations">${icon('cites')}<strong>${formatNum(metrics.citations)}</strong></span>`);
    }
    if (metrics.adsReads !== null && metrics.adsReads > 0) {
      parts.push(`<span class="pm-compact-item" title="NASA ADS 90-day Reads">${icon('reads')}<strong>${formatNum(metrics.adsReads)}</strong></span>`);
    }
    const downloads = metrics.plosPdfs ?? metrics.biorxivPdfs ?? metrics.zenodoDownloads ?? metrics.dataCiteDownloads ?? metrics.dockerPulls ?? metrics.pypiDownloads ?? metrics.npmDownloads ?? metrics.githubDownloads;
    if (show(downloads)) {
      parts.push(`<span class="pm-compact-item" title="Downloads / Pulls">${icon('download')}<strong>${formatNum(downloads)}</strong></span>`);
    }
    if (metrics.githubStars !== null && metrics.githubStars > 0) {
      parts.push(`<span class="pm-compact-item" title="GitHub Stars">${icon('star')}<strong>${formatNum(metrics.githubStars)}</strong></span>`);
    }
    if (metrics.githubForks !== null && metrics.githubForks > 0) {
      parts.push(`<span class="pm-compact-item" title="GitHub Forks">${icon('repo')}<strong>${formatNum(metrics.githubForks)}</strong></span>`);
    }
    if (metrics.githubClones !== null && metrics.githubClones > 0) {
      parts.push(`<span class="pm-compact-item" title="GitHub Clones (14d)">${icon('terminal')}<strong>${formatNum(metrics.githubClones)}</strong></span>`);
    }
    if (parts.length === 0) {
      return opts.hideZero ? '' : `<span class="pm-badge pm-badge-loading">No public metrics found</span>`;
    }
    return `<span class="pm-compact-pill">${parts.join('<span class="pm-compact-sep">·</span>')}</span>`;
  }

  function renderCard(metrics) {
    const items = [];
    const breakdown = getCitationBreakdown(metrics);
    const breakdownTooltip = breakdown.map(b => `${b.name}: ${b.count}`).join(' · ');

    // Citations section
    if (metrics.citations !== null) {
      const citeSources = breakdown.map(b => b.name);
      const citeSub = citeSources.slice(0, 2).join(' / ') || 'Bibliometric APIs';

      items.push(`
        <div class="pm-card-metric pm-metric-cites" title="${escapeHtml(breakdownTooltip)}">
          <div class="pm-metric-val">${formatNum(metrics.citations)}</div>
          <div class="pm-metric-lbl">Total Citations</div>
          <div class="pm-metric-sub">${escapeHtml(citeSub)}</div>
        </div>
      `);
    }

    if (metrics.influentialCitations !== null && metrics.influentialCitations > 0) {
      items.push(`
        <div class="pm-card-metric pm-metric-influential">
          <div class="pm-metric-val">${formatNum(metrics.influentialCitations)}</div>
          <div class="pm-metric-lbl">Influential Cites</div>
          <div class="pm-metric-sub">Semantic Scholar</div>
        </div>
      `);
    }

    // ADS
    if (metrics.adsReads !== null && metrics.adsReads > 0) {
      items.push(`
        <div class="pm-card-metric pm-metric-ads">
          <div class="pm-metric-val">${formatNum(metrics.adsReads)}</div>
          <div class="pm-metric-lbl">Recent Reads</div>
          <div class="pm-metric-sub">NASA ADS (90-day window)</div>
        </div>
      `);
    }

    // Downloads (bioRxiv, PLOS, Zenodo, DataCite, GitHub, Docker, PyPI, npm)
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
          <div class="pm-metric-sub">${metrics.biorxivViews !== null ? formatNum(metrics.biorxivViews) + ' views' : 'Cumulative'}</div>
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

    if (metrics.githubStars !== null) {
      const ghSub = metrics.githubDownloads
        ? `${formatNum(metrics.githubDownloads)} release downloads`
        : (metrics.githubForks ? `${formatNum(metrics.githubForks)} forks` : (metrics.githubRepos ? `${metrics.githubRepos} repositories` : 'Repository'));
      items.push(`
        <div class="pm-card-metric pm-metric-github">
          <div class="pm-metric-val">${formatNum(metrics.githubStars)}</div>
          <div class="pm-metric-lbl">GitHub Stars</div>
          <div class="pm-metric-sub">${escapeHtml(ghSub)}</div>
        </div>
      `);
    }

    if (metrics.githubClones !== null && metrics.githubClones > 0) {
      const cloneSub = metrics.githubUniqueClones
        ? `${formatNum(metrics.githubUniqueClones)} unique cloners (14d)`
        : 'GitHub (14-day window)';
      items.push(`
        <div class="pm-card-metric pm-metric-clones">
          <div class="pm-metric-val">${formatNum(metrics.githubClones)}</div>
          <div class="pm-metric-lbl">Git Clones</div>
          <div class="pm-metric-sub">${escapeHtml(cloneSub)}</div>
        </div>
      `);
    }

    if (metrics.dockerPulls !== null && metrics.dockerPulls > 0) {
      items.push(`
        <div class="pm-card-metric pm-metric-docker">
          <div class="pm-metric-val">${formatNum(metrics.dockerPulls)}</div>
          <div class="pm-metric-lbl">Docker Pulls</div>
          <div class="pm-metric-sub">Docker Hub</div>
        </div>
      `);
    }

    if (metrics.pypiDownloads !== null && metrics.pypiDownloads > 0) {
      items.push(`
        <div class="pm-card-metric pm-metric-pypi">
          <div class="pm-metric-val">${formatNum(metrics.pypiDownloads)}</div>
          <div class="pm-metric-lbl">PyPI Downloads</div>
          <div class="pm-metric-sub">${metrics.pypiMonthly ? formatNum(metrics.pypiMonthly) + '/month' : 'PyPI (180-day)'}</div>
        </div>
      `);
    }

    if (metrics.npmDownloads !== null && metrics.npmDownloads > 0) {
      items.push(`
        <div class="pm-card-metric pm-metric-npm">
          <div class="pm-metric-val">${formatNum(metrics.npmDownloads)}</div>
          <div class="pm-metric-lbl">npm Downloads</div>
          <div class="pm-metric-sub">npmjs.com</div>
        </div>
      `);
    }

    // Link buttons & Open Access pill
    const links = [];
    if (metrics.isOa) {
      const oaLabel = metrics.oaStatus ? `${metrics.oaStatus.charAt(0).toUpperCase() + metrics.oaStatus.slice(1)} OA` : 'Open Access';
      links.push(`<span class="pm-oa-pill" title="Open Access via OpenAlex">${icon('unlock')}${escapeHtml(oaLabel)}</span>`);
    }
    if (metrics.doi) {
      links.push(`<a href="https://doi.org/${encodeURIComponent(metrics.doi).replace(/%2F/gi, '/')}" target="_blank" rel="noopener" class="pm-link-btn">DOI ↗</a>`);
    }
    if (metrics.publishedDoi && metrics.publishedDoi !== metrics.doi) {
      links.push(`<a href="https://doi.org/${encodeURIComponent(metrics.publishedDoi).replace(/%2F/gi, '/')}" target="_blank" rel="noopener" class="pm-link-btn">Published Journal ↗</a>`);
    }
    if (metrics.arxiv) {
      links.push(`<a href="https://arxiv.org/abs/${encodeURIComponent(metrics.arxiv)}" target="_blank" rel="noopener" class="pm-link-btn">arXiv ↗</a>`);
    }
    if (metrics.sources.biorxiv?.url) {
      links.push(`<a href="${escapeHtml(metrics.sources.biorxiv.url)}" target="_blank" rel="noopener" class="pm-link-btn">${escapeHtml(metrics.sources.biorxiv.server || 'bioRxiv')} ↗</a>`);
    }
    if (metrics.sources.semanticScholar?.url) {
      links.push(`<a href="${escapeHtml(metrics.sources.semanticScholar.url)}" target="_blank" rel="noopener" class="pm-link-btn">Semantic Scholar ↗</a>`);
    }
    if (metrics.sources.europePmc?.url) {
      links.push(`<a href="${escapeHtml(metrics.sources.europePmc.url)}" target="_blank" rel="noopener" class="pm-link-btn">Europe PMC ↗</a>`);
    }
    if (metrics.sources.ads?.url) {
      links.push(`<a href="${escapeHtml(metrics.sources.ads.url)}" target="_blank" rel="noopener" class="pm-link-btn">NASA ADS ↗</a>`);
    }
    if (metrics.sources.zenodo?.url) {
      links.push(`<a href="${escapeHtml(metrics.sources.zenodo.url)}" target="_blank" rel="noopener" class="pm-link-btn">Zenodo ↗</a>`);
    }
    if (metrics.sources.github?.url) {
      links.push(`<a href="${escapeHtml(metrics.sources.github.url)}" target="_blank" rel="noopener" class="pm-link-btn">GitHub ↗</a>`);
    }
    if (metrics.sources.docker?.url) {
      links.push(`<a href="${escapeHtml(metrics.sources.docker.url)}" target="_blank" rel="noopener" class="pm-link-btn">Docker Hub ↗</a>`);
    }
    if (metrics.sources.pypi?.url) {
      links.push(`<a href="${escapeHtml(metrics.sources.pypi.url)}" target="_blank" rel="noopener" class="pm-link-btn">PyPI ↗</a>`);
    }
    if (metrics.sources.npm?.url) {
      links.push(`<a href="${escapeHtml(metrics.sources.npm.url)}" target="_blank" rel="noopener" class="pm-link-btn">npm ↗</a>`);
    }

    const sparklineHtml = renderSparkline(metrics.sources.openAlex?.countsByYear);
    const breakdownHtml = breakdown.length > 1
      ? `<div class="pm-card-breakdown">Sources: ${breakdown.map(b => `<span>${escapeHtml(b.name)}: <strong>${formatNum(b.count)}</strong></span>`).join(' · ')}</div>`
      : '';

    const bodyHtml = items.length > 0
      ? `<div class="pm-card-grid">${items.join('')}</div>${sparklineHtml}${breakdownHtml}`
      : `<div class="pm-card-empty">No public metrics found for this identifier.</div>`;

    return `
      <div class="pm-card" role="region" aria-label="Publication metrics">
        <div class="pm-card-header">
          <div class="pm-card-title">${escapeHtml(metrics.title)}</div>
          <div class="pm-card-actions">${links.join('')}</div>
        </div>
        ${bodyHtml}
        <div class="pm-card-footer">
          <span class="pm-footer-note">${icon('pulse')}Metrics live-queried via open APIs (OpenAlex, Semantic Scholar, Crossref, ADS, PLOS, Zenodo, DataCite, GitHub)</span>
        </div>
      </div>
    `;
  }

  function extractElementConfig(el, prefix = '') {
    const getAttr = (name) => el.getAttribute(prefix + name);
    return {
      title: getAttr('title'),
      doi: getAttr('doi'),
      arxiv: getAttr('arxiv'),
      biorxiv: getAttr('biorxiv'),
      biorxivPdfs: getAttr('biorxiv-pdfs'),
      biorxivViews: getAttr('biorxiv-views'),
      zenodo: getAttr('zenodo'),
      plosDoi: getAttr('plos-doi'),
      github: getAttr('github'),
      githubClones: getAttr('github-clones'),
      githubViews: getAttr('github-views'),
      docker: getAttr('docker'),
      pypi: getAttr('pypi'),
      npm: getAttr('npm'),
      adsBibcode: getAttr('ads-bibcode') || getAttr('ads'),
      adsReads: getAttr('ads-reads'),
      mailto: getAttr('mailto'),
      snapshotUrl: getAttr('snapshot-url'),
      lazy: getAttr('lazy'),
      shadow: getAttr('shadow'),
      hideZero: getAttr('hide-zero'),
      layout: getAttr('layout') || 'badge'
    };
  }

  function getRenderTarget(el, useShadow) {
    if (!useShadow || typeof el.attachShadow !== 'function') return el;
    const root = el.shadowRoot || el.attachShadow({ mode: 'open' });
    if (!root.querySelector('link[data-pm-style], style[data-pm-style]')) {
      const existingStyle = typeof document !== 'undefined' && document.getElementById('citeometer-styles');
      if (existingStyle) {
        const styleClone = document.createElement('style');
        styleClone.setAttribute('data-pm-style', 'true');
        styleClone.textContent = existingStyle.textContent;
        root.appendChild(styleClone);
      } else if (typeof document !== 'undefined') {
        const docLink = document.querySelector('link[href*="citeometer"], link[href*="paper-metrics"]');
        if (docLink) {
          const linkClone = document.createElement('link');
          linkClone.rel = 'stylesheet';
          linkClone.href = docLink.href;
          linkClone.setAttribute('data-pm-style', 'true');
          root.appendChild(linkClone);
        }
      }
    }
    let container = root.querySelector('.pm-shadow-root');
    if (!container) {
      container = document.createElement('div');
      container.className = 'pm-shadow-root';
      root.appendChild(container);
    }
    return container;
  }

  // Public Component & Init
  const TAG_NAMES = ['cite-o-meter', 'paper-metrics', 'repo-meter'];

  const Citeometer = {
    aggregateMetrics,
    formatNum,

    configure(opts = {}) {
      Object.assign(globalConfig, opts);
      if (opts.snapshotData) snapshotPromise = null;
    },

    async render(target, config) {
      injectStyles();
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (!el) return;

      const resolvedConfig = config || extractElementConfig(el, TAG_NAMES.includes(el.tagName.toLowerCase()) ? '' : 'data-');
      const useLazy = resolvedConfig.lazy === true || resolvedConfig.lazy === 'true' || globalConfig.lazy;

      if (useLazy && !el._pmObserved && typeof IntersectionObserver !== 'undefined') {
        el._pmObserved = true;
        const obs = new IntersectionObserver((entries) => {
          if (entries.some(e => e.isIntersecting)) {
            obs.disconnect();
            Citeometer.render(el, { ...resolvedConfig, lazy: false });
          }
        }, { rootMargin: '200px' });
        obs.observe(el);
        return;
      }

      const renderId = (el._pmRenderId || 0) + 1;
      el._pmRenderId = renderId;

      const useShadow = resolvedConfig.shadow === true || resolvedConfig.shadow === 'true' || globalConfig.shadowDom;
      const mount = getRenderTarget(el, useShadow);

      const layout = resolvedConfig.layout || el.getAttribute('data-layout') || el.getAttribute('layout') || 'badge';
      mount.innerHTML = `<span class="pm-badge pm-badge-loading" role="status" aria-live="polite">Loading live metrics...</span>`;

      try {
        const data = await aggregateMetrics(resolvedConfig);
        if (el._pmRenderId !== renderId) return; // Superseded by a newer render call
        if (layout === 'card') {
          mount.innerHTML = renderCard(data);
        } else {
          const hz = resolvedConfig.hideZero;
          const opts = { hideZero: hz === true || hz === '' || hz === 'true' || (hz == null && globalConfig.hideZero) };
          mount.innerHTML = layout === 'compact' ? renderCompact(data, opts) : renderBadge(data, opts);
        }
      } catch (err) {
        if (el._pmRenderId !== renderId) return;
        mount.innerHTML = `<span class="pm-badge pm-badge-error" role="alert">Metrics unavailable</span>`;
      }
    },

    init() {
      injectStyles();
      // Auto-scan elements with class 'citeometer' (or legacy 'paper-metrics')
      document.querySelectorAll('.citeometer, .paper-metrics').forEach(el => {
        const cfg = extractElementConfig(el, 'data-');
        Citeometer.render(el, cfg);
      });
    }
  };

  // Define Custom Web Components: <cite-o-meter>, <repo-meter>, and legacy <paper-metrics>
  if (typeof customElements !== 'undefined') {
    class CiteometerElement extends HTMLElement {
      static get observedAttributes() {
        return [
          'title', 'doi', 'arxiv', 'biorxiv', 'biorxiv-pdfs',
          'biorxiv-views', 'zenodo', 'plos-doi', 'github', 'github-clones', 'github-views',
          'docker', 'pypi', 'npm', 'ads', 'ads-bibcode',
          'ads-reads', 'mailto', 'snapshot-url', 'lazy', 'shadow', 'hide-zero', 'layout'
        ];
      }

      connectedCallback() {
        this._connected = true;
        Citeometer.render(this, extractElementConfig(this, ''));
      }

      disconnectedCallback() {
        this._connected = false;
      }

      attributeChangedCallback(name, oldVal, newVal) {
        if (!this._connected || oldVal === newVal) return;
        Citeometer.render(this, extractElementConfig(this, ''));
      }
    }
    for (const tag of TAG_NAMES) {
      // Each tag needs its own constructor
      if (!customElements.get(tag)) customElements.define(tag, class extends CiteometerElement {});
    }
  }

  // Auto-init on DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => Citeometer.init());
    } else {
      Citeometer.init();
    }
  }

  return Citeometer;
})();

if (typeof window !== 'undefined') {
  window.Citeometer = window.Citeometer || Citeometer;
  window.PaperMetrics = window.PaperMetrics || Citeometer;
}

export { Citeometer, Citeometer as PaperMetrics };
export default Citeometer;
