#!/usr/bin/env node

/**
 * fetch-snapshot.js
 * 
 * Static Metrics Snapshot CLI:
 * Recursively scans HTML and Markdown files for Citeometer tags,
 * queries metrics for each unique publication configuration, and
 * outputs a static snapshot JSON file.
 * 
 * Zero external dependencies.
 */

'use strict';

const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const origFetch = global.fetch;
if (typeof origFetch === 'function' && typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
  global.fetch = (url, init = {}) => origFetch(url, { signal: AbortSignal.timeout(8000), ...init });
}

const fs = require('fs');
const path = require('path');
const Citeometer = require('../src/citeometer.js');

function parseArgs(args) {
  const inputPaths = [];
  let outputPath = 'dist/citeometer-snapshot.json';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') {
      if (i + 1 < args.length) {
        outputPath = args[++i];
      }
    } else if (arg.startsWith('--output=')) {
      outputPath = arg.slice('--output='.length);
    } else if (arg === '--input' || arg === '-i') {
      while (i + 1 < args.length && !args[i + 1].startsWith('-')) {
        inputPaths.push(args[++i]);
      }
    } else if (arg.startsWith('--input=')) {
      const val = arg.slice('--input='.length);
      val.split(',').map(s => s.trim()).filter(Boolean).forEach(p => inputPaths.push(p));
    } else if (arg === '--help' || arg === '-h') {
      console.log(`Usage: node scripts/fetch-snapshot.js [options]

Options:
  --input <paths...>   Files or directories to scan (defaults to index.html and demo/)
  --output <path>      Output JSON snapshot path (defaults to dist/citeometer-snapshot.json)
  --help, -h           Show this help message
`);
      process.exit(0);
    }
  }

  if (inputPaths.length === 0) {
    inputPaths.push('index.html', 'demo/');
  }

  return { inputPaths, outputPath };
}

function findFiles(inputPaths) {
  const files = [];

  function walk(currentPath) {
    if (!fs.existsSync(currentPath)) {
      console.warn(`[fetch-snapshot] Warning: Path not found: ${currentPath}`);
      return;
    }
    const stat = fs.statSync(currentPath);
    if (stat.isDirectory()) {
      const entries = fs.readdirSync(currentPath);
      for (const entry of entries) {
        if (entry.startsWith('.')) continue; // ignore hidden folders like .git
        walk(path.join(currentPath, entry));
      }
    } else if (stat.isFile()) {
      const ext = path.extname(currentPath).toLowerCase();
      if (ext === '.html' || ext === '.htm' || ext === '.md') {
        files.push(currentPath);
      }
    }
  }

  for (const inputPath of inputPaths) {
    walk(path.resolve(process.cwd(), inputPath));
  }

  return Array.from(new Set(files));
}

function unescapeAttr(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function extractConfigsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const configs = [];

  // Match opening tags: <cite-o-meter ...>, legacy <paper-metrics ...>, or <tagName ...>
  const tagRegex = /<([a-zA-Z0-9_-]+)((?:\s+[a-zA-Z0-9_-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*\/?>/gi;
  const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi;

  let tagMatch;
  while ((tagMatch = tagRegex.exec(content)) !== null) {
    const tagName = tagMatch[1].toLowerCase();
    const rawAttrs = tagMatch[2];

    const attrs = {};
    let attrMatch;
    attrRegex.lastIndex = 0;
    while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
      const name = attrMatch[1].toLowerCase();
      const rawVal = attrMatch[2] !== undefined
        ? attrMatch[2]
        : (attrMatch[3] !== undefined
          ? attrMatch[3]
          : (attrMatch[4] !== undefined ? attrMatch[4] : ''));
      attrs[name] = unescapeAttr(rawVal);
    }

    const isCiteometerTag = tagName === 'cite-o-meter' || tagName === 'paper-metrics' || tagName === 'repo-meter';
    const classVal = attrs.class || '';
    const hasCiteometerClass = /(?:^|\s)(?:citeometer|paper-metrics)(?:\s|$)/.test(classVal);

    if (!isCiteometerTag && !hasCiteometerClass) {
      continue;
    }

    const getAttr = (name) => {
      if (attrs[name] !== undefined && attrs[name] !== '') return attrs[name];
      if (attrs['data-' + name] !== undefined && attrs['data-' + name] !== '') return attrs['data-' + name];
      return null;
    };

    const cfg = {
      title: getAttr('title'),
      doi: getAttr('doi'),
      arxiv: getAttr('arxiv'),
      biorxiv: getAttr('biorxiv'),
      biorxivPdfs: getAttr('biorxiv-pdfs'),
      biorxivViews: getAttr('biorxiv-views'),
      zenodo: getAttr('zenodo'),
      plosDoi: getAttr('plos-doi'),
      adsBibcode: getAttr('ads-bibcode') || getAttr('ads'),
      ads: getAttr('ads') || getAttr('ads-bibcode'),
      adsReads: getAttr('ads-reads'),
      github: getAttr('github'),
      githubClones: getAttr('github-clones'),
      githubViews: getAttr('github-views'),
      docker: getAttr('docker'),
      pypi: getAttr('pypi'),
      npm: getAttr('npm'),
      layout: getAttr('layout') || 'badge'
    };

    // Ensure at least one primary identifier exists
    if (cfg.doi || cfg.arxiv || cfg.biorxiv || cfg.zenodo || cfg.adsBibcode || cfg.plosDoi || cfg.github || cfg.docker || cfg.pypi || cfg.npm) {
      configs.push(cfg);
    }
  }

  return configs;
}

function getCanonicalKey(cfg) {
  const norm = (val) => (val ? String(val).trim().toLowerCase() : '');
  return [
    norm(cfg.doi),
    norm(cfg.arxiv),
    norm(cfg.biorxiv),
    norm(cfg.zenodo),
    norm(cfg.adsBibcode),
    norm(cfg.plosDoi),
    norm(cfg.github),
    norm(cfg.docker),
    norm(cfg.pypi),
    norm(cfg.npm),
    norm(cfg.adsReads),
    norm(cfg.biorxivPdfs),
    norm(cfg.biorxivViews)
  ].join('||');
}

function registerPaperKeys(papersMap, cfg, metrics) {
  // 1. DOI
  const doiCandidates = new Set();
  if (metrics.doi) doiCandidates.add(metrics.doi);
  if (cfg.doi) {
    doiCandidates.add(cfg.doi);
    const cleaned = String(cfg.doi).trim().replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/i, '').trim();
    if (cleaned) doiCandidates.add(cleaned);
  }
  for (const doi of doiCandidates) {
    papersMap[`doi:${doi}`] = metrics;
  }

  // 2. arXiv
  const arxivCandidates = new Set();
  if (metrics.arxiv) arxivCandidates.add(metrics.arxiv);
  if (cfg.arxiv) {
    arxivCandidates.add(cfg.arxiv);
    const cleaned = String(cfg.arxiv).trim().replace(/^(?:https?:\/\/arxiv\.org\/abs\/|arxiv:\s*)/i, '').trim();
    if (cleaned) arxivCandidates.add(cleaned);
  }
  for (const arxiv of arxivCandidates) {
    papersMap[`arxiv:${arxiv}`] = metrics;
  }

  // 3. ADS
  const adsCandidates = new Set();
  if (metrics.adsBibcode) adsCandidates.add(metrics.adsBibcode);
  if (cfg.adsBibcode) adsCandidates.add(cfg.adsBibcode);
  if (cfg.ads) adsCandidates.add(cfg.ads);
  for (const ads of adsCandidates) {
    papersMap[`ads:${ads}`] = metrics;
  }

  // 4. Zenodo
  const zenodoCandidates = new Set();
  if (metrics.zenodo) zenodoCandidates.add(metrics.zenodo);
  if (cfg.zenodo) {
    zenodoCandidates.add(cfg.zenodo);
    const match = String(cfg.zenodo).match(/(?:zenodo\.org\/records?\/|zenodo\.org\/doi\/10\.5281\/zenodo\.|zenodo:)(\d+)/i) || String(cfg.zenodo).match(/^(\d+)$/);
    if (match) zenodoCandidates.add(match[1]);
  }
  for (const zenodo of zenodoCandidates) {
    papersMap[`zenodo:${zenodo}`] = metrics;
  }

  // 5. bioRxiv
  const biorxivCandidates = new Set();
  if (metrics.biorxiv) biorxivCandidates.add(metrics.biorxiv);
  if (cfg.biorxiv) {
    biorxivCandidates.add(cfg.biorxiv);
    const cleaned = String(cfg.biorxiv).trim().replace(/^(?:https?:\/\/(?:www\.)?biorxiv\.org\/content\/|doi:\s*)/i, '').replace(/v\d+$/i, '').trim();
    if (cleaned) biorxivCandidates.add(cleaned);
  }
  for (const biorxiv of biorxivCandidates) {
    papersMap[`biorxiv:${biorxiv}`] = metrics;
  }

  // 6. GitHub
  const githubCandidates = new Set();
  if (metrics.github) githubCandidates.add(metrics.github);
  if (cfg.github) {
    githubCandidates.add(cfg.github);
    const cleaned = String(cfg.github).trim().replace(/^(?:https?:\/\/github\.com\/)/i, '').replace(/\.git$/i, '').replace(/\/+$/, '').trim();
    if (cleaned) githubCandidates.add(cleaned);
  }
  for (const github of githubCandidates) {
    papersMap[`github:${github}`] = metrics;
  }

  // 7. Docker Hub
  const dockerCandidates = new Set();
  if (metrics.docker) dockerCandidates.add(metrics.docker);
  if (cfg.docker) dockerCandidates.add(cfg.docker);
  for (const docker of dockerCandidates) {
    papersMap[`docker:${docker}`] = metrics;
  }

  // 8. PyPI
  const pypiCandidates = new Set();
  if (metrics.pypi) pypiCandidates.add(metrics.pypi);
  if (cfg.pypi) pypiCandidates.add(cfg.pypi);
  for (const pypi of pypiCandidates) {
    papersMap[`pypi:${pypi}`] = metrics;
  }

  // 9. npm
  const npmCandidates = new Set();
  if (metrics.npm) npmCandidates.add(metrics.npm);
  if (cfg.npm) npmCandidates.add(cfg.npm);
  for (const npm of npmCandidates) {
    papersMap[`npm:${npm}`] = metrics;
  }
}

async function main() {
  const { inputPaths, outputPath } = parseArgs(process.argv.slice(2));

  // Auto-detect local `gh auth token` if no GitHub token env var is set
  if (!process.env.GH_TRAFFIC_TOKEN && !process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
    try {
      const { execSync } = require('child_process');
      const token = execSync('gh auth token', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      if (token) process.env.GH_TOKEN = token;
    } catch (e) {}
  }

  console.log(`[fetch-snapshot] Scanning inputs: ${inputPaths.join(', ')}`);
  const files = findFiles(inputPaths);
  console.log(`[fetch-snapshot] Found ${files.length} candidate file(s)`);

  const uniqueConfigsMap = new Map();
  for (const file of files) {
    const configs = extractConfigsFromFile(file);
    for (const cfg of configs) {
      const key = getCanonicalKey(cfg);
      if (!uniqueConfigsMap.has(key)) {
        uniqueConfigsMap.set(key, cfg);
      } else {
        // Merge optional fields if missing
        const existing = uniqueConfigsMap.get(key);
        if (!existing.title && cfg.title) existing.title = cfg.title;
        if (!existing.adsReads && cfg.adsReads) existing.adsReads = cfg.adsReads;
        if (!existing.biorxivPdfs && cfg.biorxivPdfs) existing.biorxivPdfs = cfg.biorxivPdfs;
        if (!existing.biorxivViews && cfg.biorxivViews) existing.biorxivViews = cfg.biorxivViews;
      }
    }
  }

  const uniqueConfigs = Array.from(uniqueConfigsMap.values());
  console.log(`[fetch-snapshot] Discovered ${uniqueConfigs.length} unique publication configuration(s)`);

  const papers = {};

  for (let i = 0; i < uniqueConfigs.length; i++) {
    const cfg = uniqueConfigs[i];
    const label = cfg.title || cfg.doi || cfg.arxiv || cfg.adsBibcode || cfg.zenodo || cfg.github || cfg.docker || cfg.pypi || cfg.npm || `Paper #${i + 1}`;
    console.log(`[fetch-snapshot] [${i + 1}/${uniqueConfigs.length}] Aggregating metrics: ${label}`);

    try {
      const metrics = await Citeometer.aggregateMetrics(cfg);
      registerPaperKeys(papers, cfg, metrics);
    } catch (err) {
      console.error(`[fetch-snapshot] Error fetching metrics for ${label}:`, err.message);
    }
  }

  const resolvedOutputPath = path.resolve(process.cwd(), outputPath);

  // A throttled or failing source must not make counts drop between runs: cumulative
  // totals only grow, and auth-gated rolling traffic is preserved when unavailable.
  if (fs.existsSync(resolvedOutputPath)) {
    try {
      const previous = JSON.parse(fs.readFileSync(resolvedOutputPath, 'utf8')).papers || {};
      for (const [key, metrics] of Object.entries(papers)) {
        const old = previous[key];
        if (!old) continue;
        for (const field of ['citations', 'influentialCitations', 'githubStars', 'dockerPulls', 'pypiDownloads', 'npmDownloads']) {
          if (typeof old[field] === 'number' && (metrics[field] === null || metrics[field] < old[field])) {
            metrics[field] = old[field];
          }
        }
        for (const field of ['githubClones', 'githubUniqueClones', 'githubViews', 'githubUniqueViews', 'adsReads', 'biorxivPdfs', 'biorxivViews']) {
          if (typeof old[field] === 'number' && metrics[field] === null) {
            metrics[field] = old[field];
          }
        }
      }
      for (const [key, old] of Object.entries(previous)) {
        if (!papers[key]) papers[key] = old;
      }
    } catch (err) {
      console.warn('[fetch-snapshot] Could not read previous snapshot:', err.message);
    }
  }

  const snapshotData = {
    generatedAt: new Date().toISOString(),
    papers: papers
  };

  const outputDir = path.dirname(resolvedOutputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(resolvedOutputPath, JSON.stringify(snapshotData, null, 2) + '\n', 'utf8');
  console.log(`[fetch-snapshot] Successfully wrote snapshot to ${resolvedOutputPath} (${Object.keys(papers).length} identifier keys indexed)`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('[fetch-snapshot] Fatal error:', err);
    process.exit(1);
  });
}

module.exports = {
  parseArgs,
  findFiles,
  extractConfigsFromFile,
  getCanonicalKey,
  registerPaperKeys,
  main
};
