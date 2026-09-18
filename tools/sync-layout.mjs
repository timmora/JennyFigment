/**
 * Stamps the shared header and footer into every page.
 *
 * The header/footer markup lives once in tools/partials/ and uses root-absolute
 * links (/books, /about, …), so the same partial drops into a page at any depth
 * — that's what lets one template cover /index.html and /books/lucky-penny.html
 * alike. The site is served from the domain root (see .cpanel.yml), and
 * .htaccess maps the clean URLs onto the .html files.
 *
 * Regions are delimited by <!-- @header --> / <!-- @footer --> marker comments,
 * so re-running only ever rewrites what it owns and page content between the
 * nav and <main> (the Lucky Penny papel banner, say) survives untouched.
 *
 * Run: node tools/sync-layout.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

/** Bumped by hand on release; stamped onto every css/js URL so one edit busts
 *  the whole site's cache instead of each page carrying its own date. */
const SITE_VERSION = '20260917';

/** nav: which header partial to use. current: the data-nav key(s) to mark
 *  active — a book page lights up both the Books dropdown and its own title. */
const PAGES = [
  { file: 'index.html', nav: 'full', current: 'home' },
  { file: 'books.html', nav: 'full', current: ['books', 'books-group'] },
  { file: 'about.html', nav: 'full', current: 'about' },
  { file: 'contact.html', nav: 'full', current: 'contact' },
  { file: 'educators-parents.html', nav: 'full', current: ['educators', 'educators-group'] },
  { file: 'media-kit.html', nav: 'full', current: 'media-kit' },
  { file: 'books/lucky-penny.html', nav: 'full', current: ['books-group', 'lucky-penny'] },
  { file: 'books/jenny-figment-book-1.html', nav: 'full', current: ['books-group', 'jenny-figment-book-1'] },
  { file: 'books/andys-space-friends.html', nav: 'full', current: ['books-group', 'andys-space-friends'] },
  { file: 'books/riddle-fairy-tale-village.html', nav: 'full', current: ['books-group', 'riddle-fairy-tale-village'] },
  { file: 'educators-parents/school-visits.html', nav: 'full', current: ['visits', 'educators-group'] },
  { file: 'kids-zone.html', nav: 'kids-hub', current: null },
  { file: 'kids-zone/jenny-qa.html', nav: 'kids-page', current: 'kids-zone' },
  { file: 'kids-zone/grandpa-tony-jokes.html', nav: 'kids-page', current: 'kids-zone' },
  { file: 'kids-zone/flora-pinkerdoodles.html', nav: 'kids-page', current: 'kids-zone' },
  { file: 'kids-zone/arachna-coloring.html', nav: 'kids-page', current: 'kids-zone' },
  // 404 is served by ErrorDocument at any URL depth, so it carries no nav —
  // just the footer.
  { file: '404.html', nav: null, current: null },
];

const partial = (name) =>
  readFileSync(path.join(root, 'tools', 'partials', `${name}.html`), 'utf8').trimEnd();

const HEADERS = {
  full: partial('header-full'),
  'kids-hub': partial('header-kids-hub'),
  'kids-page': partial('header-kids-page'),
};
const FOOTER = partial('footer');

/** Marks the links for `current` and drops the build-time-only data-nav hooks.
 *  {{root}} becomes the page-relative path to the site root, so header images
 *  load like the page's own css/ and assets/ do — including in a local preview
 *  that isn't served from the domain root, where /assets/… would 404. */
function renderHeader(nav, current, file) {
  const template = HEADERS[nav];
  if (!template) throw new Error(`unknown nav variant: ${nav}`);
  const depth = file.split('/').length - 1;
  let html = template.replaceAll('{{root}}', '../'.repeat(depth));
  for (const key of [current ?? []].flat()) {
    html = html.replaceAll(`data-nav="${key}"`, 'aria-current="page"');
  }
  return html.replace(/ data-nav="[^"]*"/g, '');
}

/** Replaces the marked region, or creates it by swapping out `legacy`. */
function replaceRegion(html, name, body, legacy) {
  const region = `<!-- @${name} -->\n${body}\n  <!-- /@${name} -->`;
  const marked = new RegExp(`[ \\t]*<!-- @${name} -->[\\s\\S]*?<!-- /@${name} -->`);
  if (marked.test(html)) return html.replace(marked, `  ${region}`);
  if (!legacy.test(html)) throw new Error(`no ${name} region found`);
  return html.replace(legacy, `  ${region}`);
}

/** Every local css/js URL gets the same ?v=, so versions can't drift per page. */
function stampVersions(html) {
  return html.replace(
    /(<(?:link|script)\b[^>]*\b(?:href|src)=")([./]*(?:css|js)\/[^"?]+)(\?v=[^"]*)?"/g,
    (_m, head, url) => `${head}${url}?v=${SITE_VERSION}"`
  );
}

// The legacy patterns only need to match the hand-written markup once; after the
// first run the marker comments take over.
const LEGACY_HEADER = /[ \t]*<a href="#main-content" class="skip-link">[\s\S]*?<nav id="nav-drawer"[\s\S]*?<\/nav>/;
const LEGACY_FOOTER = /[ \t]*<footer class="site-footer" role="contentinfo">[\s\S]*?<\/footer>/;

for (const page of PAGES) {
  const filePath = path.join(root, page.file);
  let html = readFileSync(filePath, 'utf8');

  if (page.nav) {
    html = replaceRegion(html, 'header', renderHeader(page.nav, page.current, page.file), LEGACY_HEADER);
  }
  html = replaceRegion(html, 'footer', FOOTER, LEGACY_FOOTER);
  html = stampVersions(html);

  writeFileSync(filePath, html, 'utf8');
  console.log(`synced: ${page.file}`);
}
