/**
 * Automated Unit & Integration Test Suite for Citeometer.js
 * 
 * Uses Node's built-in node:test and node:assert/strict modules.
 * Fully mocks global.fetch to run deterministically and offline in milliseconds.
 */

const { describe, it, beforeEach, afterEach, before, after } = require('node:test');
const assert = require('node:assert/strict');

// Minimal mock DOM environment for Node
const mockElements = new Map();
global.document = {
  readyState: 'complete',
  querySelector(selector) {
    return mockElements.get(selector) || null;
  },
  querySelectorAll(selector) {
    return Array.from(mockElements.values());
  },
  addEventListener() {}
};

// Require the UMD module under test
const Citeometer = require('../src/citeometer.js');

// Mock element factory
function createMockElement(attrs = {}, tagName = 'DIV') {
  const attributes = { ...attrs };
  return {
    tagName: tagName.toUpperCase(),
    _pmRenderId: 0,
    innerHTML: '',
    attributes,
    getAttribute(name) {
      return attributes[name] !== undefined ? String(attributes[name]) : null;
    },
    setAttribute(name, val) {
      attributes[name] = String(val);
    }
  };
}

// Helper: json response object
function mockJsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: async () => data,
    text: async () => JSON.stringify(data)
  };
}

describe('Citeometer Test Suite', () => {
  const originalFetch = global.fetch;
  let fetchHistory = [];
  let fetchHandlers = [];

  function setFetchMock(handler) {
    fetchHandlers.unshift(handler);
  }

  beforeEach(() => {
    fetchHistory = [];
    fetchHandlers = [];
    mockElements.clear();

    if (typeof global.localStorage !== 'undefined' && typeof global.localStorage.clear === 'function') {
      global.localStorage.clear();
    }

    global.fetch = async (url, options = {}) => {
      const urlStr = String(url);
      fetchHistory.push({ url: urlStr, options });

      for (const handler of fetchHandlers) {
        const response = await handler(urlStr, options);
        if (response !== undefined) {
          return response;
        }
      }

      // Default offline fallback: 404
      return mockJsonResponse({ error: 'Not found in test mock router' }, 404);
    };
  });

  after(() => {
    global.fetch = originalFetch;
  });

  // =========================================================================
  // 1. formatNum Unit Tests
  // =========================================================================
  describe('formatNum()', () => {
    it('returns "—" for missing, undefined, NaN, empty string, and non-numeric strings', () => {
      assert.strictEqual(Citeometer.formatNum(null), '—');
      assert.strictEqual(Citeometer.formatNum(undefined), '—');
      assert.strictEqual(Citeometer.formatNum(NaN), '—');
      assert.strictEqual(Citeometer.formatNum(''), '—');
      assert.strictEqual(Citeometer.formatNum('invalid'), '—');
    });

    it('formats 0 as "0"', () => {
      assert.strictEqual(Citeometer.formatNum(0), '0');
      assert.strictEqual(Citeometer.formatNum('0'), '0');
    });

    it('formats numbers below 1000 with locale formatting', () => {
      assert.strictEqual(Citeometer.formatNum(999), '999');
      assert.strictEqual(Citeometer.formatNum('999'), '999');
      assert.strictEqual(Citeometer.formatNum(42), '42');
    });

    it('formats thousands with "k" suffix (e.g. 1250 -> "1.3k", 2000 -> "2k")', () => {
      assert.strictEqual(Citeometer.formatNum(1250), '1.3k');
      assert.strictEqual(Citeometer.formatNum('1250'), '1.3k');
      assert.strictEqual(Citeometer.formatNum(2000), '2k');
      assert.strictEqual(Citeometer.formatNum(1000), '1k');
      assert.strictEqual(Citeometer.formatNum(10500), '10.5k');
    });

    it('formats millions with "M" suffix (e.g. 1500000 -> "1.5M")', () => {
      assert.strictEqual(Citeometer.formatNum(1500000), '1.5M');
      assert.strictEqual(Citeometer.formatNum(2000000), '2M');
      assert.strictEqual(Citeometer.formatNum('1500000'), '1.5M');
    });
  });

  // =========================================================================
  // 2. aggregateMetrics: adsReads null vs static reads
  // =========================================================================
  describe('aggregateMetrics() — NASA ADS handling', () => {
    it('returns adsReads: null (never NaN) when adsReads is null and no adsBibcode is provided', async () => {
      const results = await Citeometer.aggregateMetrics({ adsReads: null });

      assert.strictEqual(results.adsReads, null);
      assert.notStrictEqual(results.adsReads, NaN);
      assert.strictEqual(Number.isNaN(results.adsReads), false);
      assert.strictEqual(results.sources.ads, undefined);
      assert.strictEqual(fetchHistory.length, 0);
    });

    it('handles static adsReads: "269" and adsBibcode: "2024PLoSO..1996725G" without network fetch', async () => {
      const results = await Citeometer.aggregateMetrics({
        adsReads: '269',
        adsBibcode: '2024PLoSO..1996725G'
      });

      assert.strictEqual(results.adsReads, 269);
      assert.ok(results.sources.ads);
      assert.strictEqual(results.sources.ads.recentReads, 269);
      assert.strictEqual(results.sources.ads.bibcode, '2024PLoSO..1996725G');
      assert.strictEqual(
        results.sources.ads.url,
        'https://ui.adsabs.harvard.edu/abs/2024PLoSO..1996725G/metrics'
      );
      // Confirms no network fetch was made because static reads were supplied
      assert.strictEqual(fetchHistory.length, 0);
    });
  });

  // =========================================================================
  // 3. aggregateMetrics: arXiv Normalization and OpenAlex Query
  // =========================================================================
  describe('aggregateMetrics() — arXiv normalization & OpenAlex query', () => {
    it('normalizes arXiv identifier "arXiv:1706.03762v5" to "1706.03762" and queries OpenAlex with arXiv DOI', async () => {
      setFetchMock(async (url) => {
        if (url.includes('api.openalex.org/works/')) {
          return mockJsonResponse({
            title: 'Attention Is All You Need',
            cited_by_count: 98000,
            open_access: { is_oa: true, oa_status: 'gold' },
            publication_year: 2017,
            doi: 'https://doi.org/10.48550/arXiv.1706.03762'
          });
        }
        if (url.includes('api.semanticscholar.org')) {
          return mockJsonResponse({
            title: 'Attention Is All You Need',
            citationCount: 95000,
            influentialCitationCount: 12000,
            year: 2017,
            url: 'https://www.semanticscholar.org/paper/test'
          });
        }
        return mockJsonResponse({}, 404);
      });

      const results = await Citeometer.aggregateMetrics({
        arxiv: 'arXiv:1706.03762v5'
      });

      // 1. Verifies normalized arxiv identifier
      assert.strictEqual(results.arxiv, '1706.03762');

      // 2. Verifies OpenAlex URL query contains encoded DOI https://doi.org/10.48550/arXiv.1706.03762
      const expectedOaTarget = 'https://doi.org/10.48550/arXiv.1706.03762';
      const openAlexCall = fetchHistory.find((call) =>
        call.url.startsWith('https://api.openalex.org/works/')
      );
      assert.ok(openAlexCall, 'OpenAlex endpoint must be called');
      assert.strictEqual(
        decodeURIComponent(openAlexCall.url),
        `https://api.openalex.org/works/${expectedOaTarget}`
      );

      // 3. Verifies aggregated metrics from OpenAlex
      assert.strictEqual(results.openAlexCitations, 98000);
      assert.strictEqual(results.citations, 98000);
      assert.strictEqual(results.title, 'Attention Is All You Need');
    });
  });

  // =========================================================================
  // 4. aggregateMetrics: bioRxiv Normalization and Unencoded Slash Query
  // =========================================================================
  describe('aggregateMetrics() — bioRxiv normalization & API query', () => {
    it('normalizes biorxiv DOI, preserves biorxivPdfs: 0, and queries api.biorxiv.org with unencoded slash in DOI path', async () => {
      setFetchMock(async (url) => {
        if (url.includes('api.biorxiv.org/details/biorxiv/')) {
          return mockJsonResponse({
            collection: [
              {
                title: 'A bioRxiv Preprint Example',
                doi: '10.1101/2020.05.22.111161',
                published: '10.1038/s41586-020-0000-0',
                server: 'bioRxiv'
              }
            ]
          });
        }
        return mockJsonResponse({}, 404);
      });

      const results = await Citeometer.aggregateMetrics({
        biorxiv: '10.1101/2020.05.22.111161v1',
        biorxivPdfs: '0'
      });

      // 1. Verifies normalized biorxiv DOI
      assert.strictEqual(results.biorxiv, '10.1101/2020.05.22.111161');

      // 2. Verifies biorxivPdfs preserved as integer 0 (not null)
      assert.strictEqual(results.biorxivPdfs, 0);
      assert.notStrictEqual(results.biorxivPdfs, null);

      // 3. Verifies bioRxiv API URL contains unencoded slash in the DOI path
      const biorxivCall = fetchHistory.find((call) =>
        call.url.startsWith('https://api.biorxiv.org/details/biorxiv/')
      );
      assert.ok(biorxivCall, 'bioRxiv API endpoint must be queried');
      assert.strictEqual(
        biorxivCall.url,
        'https://api.biorxiv.org/details/biorxiv/10.1101/2020.05.22.111161/na/json'
      );
      assert.ok(
        !biorxivCall.url.includes('%2F'),
        'bioRxiv DOI path in URL must use unencoded slashes'
      );
    });
  });

  // =========================================================================
  // 5. aggregateMetrics: Zenodo DOI auto-extraction & links.self_html
  // =========================================================================
  describe('aggregateMetrics() — Zenodo DOI extraction & links.self_html', () => {
    it('auto-extracts Zenodo ID from Zenodo DOI and uses links.self_html for URL', async () => {
      setFetchMock(async (url) => {
        if (url.includes('zenodo.org/api/records/')) {
          return mockJsonResponse({
            metadata: { title: 'Zenodo Open Research Data' },
            doi: '10.5281/zenodo.8301008',
            stats: {
              views: 1250,
              downloads: 480,
              unique_downloads: 390
            },
            links: {
              self_html: 'https://zenodo.org/records/8301008',
              html: 'https://zenodo.org/legacy-records/8301008'
            }
          });
        }
        return mockJsonResponse({}, 404);
      });

      const results = await Citeometer.aggregateMetrics({
        doi: '10.5281/zenodo.8301008'
      });

      // 1. Verifies auto-extraction of Zenodo record ID
      assert.strictEqual(results.zenodo, '8301008');

      // 2. Verifies Zenodo API query URL
      const zenodoCall = fetchHistory.find((call) =>
        call.url.startsWith('https://zenodo.org/api/records/')
      );
      assert.ok(zenodoCall, 'Zenodo API records endpoint must be queried');
      assert.strictEqual(zenodoCall.url, 'https://zenodo.org/api/records/8301008');

      // 3. Verifies metric values and link extraction prioritizing links.self_html
      assert.strictEqual(results.zenodoDownloads, 480);
      assert.strictEqual(results.zenodoViews, 1250);
      assert.ok(results.sources.zenodo);
      assert.strictEqual(results.sources.zenodo.url, 'https://zenodo.org/records/8301008');
    });
  });

  // =========================================================================
  // 6. aggregateMetrics: non-PLOS-ONE PLOS DOI & COUNTER sums
  // =========================================================================
  describe('aggregateMetrics() — non-PLOS-ONE PLOS DOI COUNTER sums', () => {
    it('queries PLOS COUNTER API and correctly sums get-document, get-pdf, and get-xml', async () => {
      setFetchMock(async (url) => {
        if (url.includes('counter.plos.org/api/v1.0/stats/doi/')) {
          return mockJsonResponse({
            '2021-01': [
              ['get-document', 450],
              ['get-pdf', 120],
              ['get-xml', 30]
            ],
            '2021-02': [
              ['get-document', 350],
              ['get-pdf', 80],
              ['get-xml', 20]
            ]
          });
        }
        return mockJsonResponse({}, 404);
      });

      const plosDoi = '10.1371/journal.pcbi.1008689'; // PLOS Computational Biology
      const results = await Citeometer.aggregateMetrics({ doi: plosDoi });

      // 1. Verifies PLOS COUNTER API endpoint called with encoded DOI
      const plosCall = fetchHistory.find((call) =>
        call.url.startsWith('https://counter.plos.org/api/v1.0/stats/doi/')
      );
      assert.ok(plosCall, 'PLOS COUNTER endpoint must be called');
      assert.strictEqual(
        plosCall.url,
        'https://counter.plos.org/api/v1.0/stats/doi/10.1371%2Fjournal.pcbi.1008689/format/json'
      );

      // 2. Sums:
      // html = 450 + 350 = 800
      // pdf  = 120 + 80  = 200
      // xml  = 30  + 20  = 50
      // total = 800 + 200 + 50 = 1050
      assert.ok(results.sources.plos);
      assert.strictEqual(results.sources.plos.html, 800);
      assert.strictEqual(results.sources.plos.pdf, 200);
      assert.strictEqual(results.sources.plos.xml, 50);
      assert.strictEqual(results.sources.plos.total, 1050);
      assert.strictEqual(results.plosTotal, 1050);
      assert.strictEqual(results.plosPdfs, 200);
    });
  });

  // =========================================================================
  // 7. Citeometer.render(): XSS Escaping, Layouts, Concurrency
  // =========================================================================
  describe('Citeometer.render()', () => {
    it('escapes XSS payloads in title (<img src=x onerror=alert(1)>) in card layout', async () => {
      const el = createMockElement({}, 'DIV');
      const xssTitle = '<img src=x onerror=alert(1)>';

      await Citeometer.render(el, {
        title: xssTitle,
        layout: 'card'
      });

      // Assert that raw malicious HTML tags are escaped and never injected raw
      assert.strictEqual(
        el.innerHTML.includes('<img src=x onerror=alert(1)>'),
        false,
        'Raw XSS injection must NOT exist in card output'
      );
      assert.strictEqual(
        el.innerHTML.includes('&lt;img src=x onerror=alert(1)&gt;'),
        true,
        'XSS payload must be HTML-entity escaped'
      );
    });

    it('renders badge layout accurately with metrics', async () => {
      const el = createMockElement({}, 'DIV');
      await Citeometer.render(el, {
        title: 'Badge Test Paper',
        adsReads: '150',
        adsBibcode: '2024TEST...12345',
        layout: 'badge'
      });

      assert.ok(el.innerHTML.includes('pm-badges-container'), 'Must have badge container');
      assert.ok(el.innerHTML.includes('pm-badge-ads'), 'Must have ADS badge');
      assert.ok(el.innerHTML.includes('150'), 'Must display formatted count 150');
      assert.ok(el.innerHTML.includes('ADS reads (90d)'), 'Must include label');
    });

    it('renders badge layout fallback when no metrics are available', async () => {
      const el = createMockElement({}, 'DIV');
      await Citeometer.render(el, { layout: 'badge' });

      assert.ok(
        el.innerHTML.includes('No public metrics found'),
        'Must display empty fallback badge'
      );
      assert.ok(el.innerHTML.includes('pm-badge-loading'));
    });

    it('renders card layout accurately with metric grid, header, and action links', async () => {
      const el = createMockElement({}, 'DIV');
      await Citeometer.render(el, {
        title: 'Deep Residual Learning for Image Recognition',
        doi: '10.1109/cvpr.2016.90',
        arxiv: '1512.03385',
        adsReads: '3200',
        adsBibcode: '2016cvpr.conf...90H',
        layout: 'card'
      });

      assert.ok(el.innerHTML.includes('pm-card'), 'Must contain pm-card root element');
      assert.ok(el.innerHTML.includes('pm-card-header'), 'Must contain header');
      assert.ok(
        el.innerHTML.includes('Deep Residual Learning for Image Recognition'),
        'Must contain title'
      );
      assert.ok(el.innerHTML.includes('pm-card-actions'), 'Must contain actions section');
      assert.ok(el.innerHTML.includes('pm-link-btn'), 'Must contain link buttons');
      assert.ok(el.innerHTML.includes('DOI ↗'), 'Must link to DOI');
      assert.ok(el.innerHTML.includes('arXiv ↗'), 'Must link to arXiv');
      assert.ok(el.innerHTML.includes('pm-card-grid'), 'Must contain metric grid');
      assert.ok(el.innerHTML.includes('3.2k'), 'Must contain formatted 3.2k ADS reads');
      assert.ok(el.innerHTML.includes('pm-card-footer'), 'Must contain card footer');
    });

    it('renders card layout empty fallback message when no metrics exist', async () => {
      const el = createMockElement({}, 'DIV');
      await Citeometer.render(el, { layout: 'card' });

      assert.ok(el.innerHTML.includes('pm-card-empty'), 'Must contain pm-card-empty');
      assert.ok(
        el.innerHTML.includes('No public metrics found for this identifier'),
        'Must display empty message'
      );
    });

    it('renders compact layout accurately', async () => {
      const el = createMockElement({}, 'DIV');
      await Citeometer.render(el, {
        adsReads: '450',
        adsBibcode: '2024COMPACT.12345',
        layout: 'compact'
      });

      assert.ok(el.innerHTML.includes('pm-compact-pill'), 'Must contain compact pill');
      assert.ok(el.innerHTML.includes('pm-compact-item'), 'Must contain compact items');
      assert.ok(el.innerHTML.includes('450'), 'Must contain metric count');
    });

    it('renders compact layout fallback when no metrics are available', async () => {
      const el = createMockElement({}, 'DIV');
      await Citeometer.render(el, { layout: 'compact' });

      assert.ok(el.innerHTML.includes('No public metrics found'));
    });

    it('handles out-of-order concurrent render() calls so an earlier slower call does not overwrite a newer call', async () => {
      const el = createMockElement({}, 'DIV');

      let resolveSlowCall;
      const slowCallPromise = new Promise((resolve) => {
        resolveSlowCall = resolve;
      });

      setFetchMock(async (url) => {
        if (url.includes('slow-paper')) {
          await slowCallPromise;
          return mockJsonResponse({
            title: 'Slower Earlier Paper',
            cited_by_count: 5
          });
        }
        if (url.includes('fast-paper')) {
          return mockJsonResponse({
            title: 'Faster Later Paper',
            cited_by_count: 500
          });
        }
        return mockJsonResponse({}, 404);
      });

      // Trigger slower render call first
      const renderPromise1 = Citeometer.render(el, {
        doi: '10.1000/slow-paper',
        layout: 'card'
      });

      // Immediately trigger faster second render call on the SAME element
      const renderPromise2 = Citeometer.render(el, {
        doi: '10.1000/fast-paper',
        layout: 'card'
      });

      // Await faster second call to complete
      await renderPromise2;

      // Element should now show the results from the second (faster) call
      assert.strictEqual(
        el.innerHTML.includes('Faster Later Paper'),
        true,
        'Must display faster call content'
      );
      assert.strictEqual(
        el.innerHTML.includes('Slower Earlier Paper'),
        false,
        'Must not contain slower call content'
      );

      // Now allow earlier slower call to finish
      resolveSlowCall();
      await renderPromise1;

      // Element MUST STILL retain content from the newer second call
      assert.strictEqual(
        el.innerHTML.includes('Faster Later Paper'),
        true,
        'Must continue to display newer call content even after older call resolves'
      );
      assert.strictEqual(
        el.innerHTML.includes('Slower Earlier Paper'),
        false,
        'Older slower call must NOT overwrite newer call results'
      );
    });

    it('supports DOM string selector and extracts data attributes from element', async () => {
      const el = createMockElement(
        {
          'data-ads-reads': '777',
          'data-ads-bibcode': '2024ATTR...0001A',
          'data-layout': 'badge'
        },
        'DIV'
      );
      mockElements.set('#my-paper-widget', el);

      await Citeometer.render('#my-paper-widget');

      assert.ok(el.innerHTML.includes('pm-badges-container'));
      assert.ok(el.innerHTML.includes('777'));
    });

    it('renders SVG sparkline, Open Access pill, GitHub metrics, DataCite, and OpenCitations breakdown in card mode', async () => {
      setFetchMock(async (url) => {
        if (url.includes('api.openalex.org')) {
          return mockJsonResponse({
            display_name: 'Open Science Paper',
            cited_by_count: 55,
            open_access: { is_oa: true, oa_status: 'gold' },
            counts_by_year: [
              { year: 2024, cited_by_count: 20 },
              { year: 2025, cited_by_count: 35 }
            ]
          });
        }
        if (url.includes('opencitations.net')) {
          return mockJsonResponse([{ count: '52' }]);
        }
        if (url.includes('api.datacite.org')) {
          return mockJsonResponse({
            data: { attributes: { citationCount: 50, viewCount: 200, downloadCount: 80 } }
          });
        }
        if (url.includes('api.github.com/repos/org/pkg/releases')) {
          return mockJsonResponse([{ assets: [{ download_count: 1200 }] }]);
        }
        if (url.includes('api.github.com/repos/org/pkg')) {
          return mockJsonResponse({
            full_name: 'org/pkg',
            stargazers_count: 340,
            forks_count: 45,
            html_url: 'https://github.com/org/pkg'
          });
        }
        return mockJsonResponse({}, 404);
      });

      const el = createMockElement({}, 'DIV');
      await Citeometer.render(el, {
        doi: '10.1000/oa-sparkline-test',
        github: 'https://github.com/org/pkg',
        layout: 'card'
      });

      assert.ok(el.innerHTML.includes('pm-sparkline-svg'), 'Must render SVG sparkline');
      assert.ok(el.innerHTML.includes('Gold OA'), 'Must render Gold OA pill');
      assert.ok(el.innerHTML.includes('pm-card-breakdown'), 'Must render per-source citation breakdown');
      assert.ok(el.innerHTML.includes('OpenCitations'), 'Breakdown must include OpenCitations');
      assert.ok(el.innerHTML.includes('DataCite'), 'Breakdown must include DataCite');
      assert.ok(el.innerHTML.includes('GitHub Stars'), 'Must render GitHub Stars card metric');
      assert.ok(el.innerHTML.includes('1.2k release downloads'), 'Must render formatted GitHub release downloads');
    });
  });
});
