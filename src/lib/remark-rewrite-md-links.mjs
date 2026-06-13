import path from 'node:path';

// Rewrites relative `.md` links between content files to live site routes,
// replacing jekyll-relative-links. The skills write links like
// `./2026-W23.md`, `../2026-W23.md`, `./deep-dives/<slug>.md`. We resolve them
// against the source file's directory, then map the `/reports/...` tail to the
// published URL (base + `.html`), preserving any #fragment.
const BASE = '/the-wire';

function walk(node, fn) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'link') fn(node);
  if (Array.isArray(node.children)) {
    for (const child of node.children) walk(child, fn);
  }
}

export function remarkRewriteMdLinks() {
  return (tree, file) => {
    const fromDir = file?.path ? path.dirname(file.path) : null;
    walk(tree, (node) => {
      const url = node.url;
      if (typeof url !== 'string') return;
      if (/^[a-z]+:/i.test(url) || url.startsWith('//')) return; // external
      const [target, hash] = url.split('#');
      if (!/\.md$/i.test(target)) return;

      let rel;
      if (target.startsWith('/')) {
        rel = target; // already site-absolute (…/reports/…)
      } else if (fromDir) {
        rel = path.resolve(fromDir, target);
      } else {
        return;
      }
      const idx = rel.indexOf('/reports/');
      if (idx === -1) return;
      const tail = rel.slice(idx).replace(/\.md$/i, '.html');
      node.url = `${BASE}${tail}${hash ? '#' + hash : ''}`;
    });
  };
}
