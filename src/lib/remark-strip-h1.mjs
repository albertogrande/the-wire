// Removes the first H1 from the document body. The Wire's articles open with
// `# Title` followed by an italic standfirst; the title is rendered by the
// layout header (derived separately in src/lib/wire.ts), so it must not also
// appear inside the article body. This replaces jekyll-titles-from-headings'
// `strip_title: true`. The standfirst paragraph is deliberately left in place.
export function remarkStripH1() {
  return (tree) => {
    const i = tree.children.findIndex(
      (node) => node.type === 'heading' && node.depth === 1,
    );
    if (i !== -1) tree.children.splice(i, 1);
  };
}
