import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const targets = [
  { file: 'index.html', current: 'home' },
  { file: 'about.html', current: 'about' },
  { file: 'contact.html', current: 'contact' },
  { file: 'books.html', current: 'books' },
  { file: 'educators-parents.html', current: 'educators' },
];

const headerTemplate = readFileSync(path.join(root, 'tools', 'partials', 'default-header.html'), 'utf8');
const footerTemplate = readFileSync(path.join(root, 'tools', 'partials', 'default-footer.html'), 'utf8');

function withCurrent(template, current) {
  return template
    .replaceAll('{{HOME_CURRENT}}', current === 'home' ? ' aria-current="page"' : '')
    .replaceAll('{{BOOKS_CURRENT}}', current === 'books' ? ' aria-current="page"' : '')
    .replaceAll('{{EDUCATORS_CURRENT}}', current === 'educators' ? ' aria-current="page"' : '')
    .replaceAll('{{ABOUT_CURRENT}}', current === 'about' ? ' aria-current="page"' : '')
    .replaceAll('{{CONTACT_CURRENT}}', current === 'contact' ? ' aria-current="page"' : '');
}

for (const target of targets) {
  const filePath = path.join(root, target.file);
  const original = readFileSync(filePath, 'utf8');

  const nextWithHeader = original.replace(
    /\s*<a href="#main-content" class="skip-link">[\s\S]*?<main id="main-content">/,
    `\n${withCurrent(headerTemplate, target.current)}\n\n  <main id="main-content">`
  );

  const next = nextWithHeader.replace(
    /\s*<footer class="site-footer" role="contentinfo">[\s\S]*?<\/footer>/,
    `\n${footerTemplate}`
  );

  writeFileSync(filePath, next, 'utf8');
  console.log(`synced: ${target.file}`);
}
