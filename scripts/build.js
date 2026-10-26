#!/usr/bin/env node

/**
 * build.js — Zero-dependency build script for citeometer
 *
 * Generates:
 *   - dist/citeometer.min.css (minified CSS)
 *   - dist/citeometer.min.js (UMD bundle with CSS auto-injection)
 *   - dist/citeometer.esm.js (ES module wrapper with default + named export)
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const CSS_SRC = path.join(SRC_DIR, 'citeometer.css');
const JS_SRC = path.join(SRC_DIR, 'citeometer.js');

const CSS_DIST = path.join(DIST_DIR, 'citeometer.min.css');
const JS_DIST = path.join(DIST_DIR, 'citeometer.min.js');
const ESM_DIST = path.join(DIST_DIR, 'citeometer.esm.js');

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(2)} KB (${bytes} bytes)`;
}

function minifyCss(css) {
  return css
    // Strip comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    // Remove space around delimiters
    .replace(/\s*([{};:,>])\s*/g, '$1')
    // Remove trailing semicolons before closing brace
    .replace(/;}/g, '}')
    .trim();
}

function cleanTrailingWhitespace(str) {
  return str
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

function build() {
  console.log('Building citeometer...');

  // Ensure dist directory exists
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // 1. Minify CSS
  const rawCss = fs.readFileSync(CSS_SRC, 'utf8');
  const minifiedCss = minifyCss(rawCss);
  fs.writeFileSync(CSS_DIST, minifiedCss, 'utf8');
  const cssStat = fs.statSync(CSS_DIST);
  console.log(`✓ Generated ${path.relative(ROOT_DIR, CSS_DIST)}: ${formatBytes(cssStat.size)}`);

  // 2. Read and transform JS for UMD (citeometer.min.js)
  let rawJs = fs.readFileSync(JS_SRC, 'utf8');

  // Strip banner and block comments
  let processedJs = rawJs.replace(/\/\*[\s\S]*?\*\//g, '');

  // Prepare style auto-injection snippet
  const styleInjectionCode = `
  // Auto-inject styles if document is available and not already present
  function injectStyles() {
    if (typeof document === 'undefined') return;
    try {
      if (document.getElementById('citeometer-styles') || document.querySelector('link[href*="citeometer"], link[href*="paper-metrics"]')) return;
      var style = document.createElement('style');
      style.id = 'citeometer-styles';
      style.textContent = ${JSON.stringify(minifiedCss)};
      (document.head || document.documentElement).appendChild(style);
    } catch (e) {}
  }
  injectStyles();
`;

  // Inject styles inside factory function right after 'use strict';
  processedJs = processedJs.replace(
    /('use strict';)/,
    `$1\n${styleInjectionCode}`
  );

  // Also hook into init() and render() to ensure styles are injected if DOM was ready later
  processedJs = processedJs.replace(
    /async render\(target,\s*config\)\s*\{/,
    'async render(target, config) {\n      injectStyles();'
  );
  processedJs = processedJs.replace(
    /init\(\)\s*\{/,
    'init() {\n      injectStyles();'
  );

  const cleanUmdJs = cleanTrailingWhitespace(processedJs);
  fs.writeFileSync(JS_DIST, cleanUmdJs, 'utf8');
  const jsStat = fs.statSync(JS_DIST);
  console.log(`✓ Generated ${path.relative(ROOT_DIR, JS_DIST)}: ${formatBytes(jsStat.size)}`);

  // 3. Generate ESM wrapper (citeometer.esm.js)
  // Extract the factory body from processed JS
  const factoryMatch = processedJs.match(/function\s*\(\)\s*\{([\s\S]*?)\}\)\);?\s*$/);
  if (!factoryMatch) {
    throw new Error('Failed to extract factory function body for ESM bundle.');
  }

  const factoryBody = factoryMatch[1];
  const esmCode = cleanTrailingWhitespace(`const Citeometer = (function () {${factoryBody}})();

if (typeof window !== 'undefined') {
  window.Citeometer = window.Citeometer || Citeometer;
  window.PaperMetrics = window.PaperMetrics || Citeometer;
}

export { Citeometer, Citeometer as PaperMetrics };
export default Citeometer;
`);

  fs.writeFileSync(ESM_DIST, esmCode, 'utf8');
  const esmStat = fs.statSync(ESM_DIST);
  console.log(`✓ Generated ${path.relative(ROOT_DIR, ESM_DIST)}: ${formatBytes(esmStat.size)}`);

  console.log('\nBuild complete!');
}

build();
