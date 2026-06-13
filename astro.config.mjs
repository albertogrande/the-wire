// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { remarkStripH1 } from './src/lib/remark-strip-h1.mjs';
import { remarkRewriteMdLinks } from './src/lib/remark-rewrite-md-links.mjs';

// The Wire — GitHub Pages project site. `build.format: 'file'` keeps the
// Jekyll-era `.html` URLs (e.g. /reports/2026-W23.html) so bookmarks, feed
// ids, and prediction made_link matching all survive the migration.
export default defineConfig({
  site: 'https://albertogrande.github.io',
  base: '/the-wire',
  trailingSlash: 'ignore',
  build: { format: 'preserve' },
  integrations: [react(), mdx(), sitemap({ filter: (page) => !page.includes('/lab') })],
  markdown: {
    remarkPlugins: [remarkStripH1, remarkRewriteMdLinks],
  },
});
