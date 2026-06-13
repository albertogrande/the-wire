source "https://rubygems.org"

# Match the GitHub Pages build exactly so `bundle exec jekyll build` locally
# reproduces what Pages will publish. github-pages pins Jekyll + all the
# whitelisted plugins to the versions Pages runs.
gem "github-pages", group: :jekyll_plugins
gem "webrick" # Ruby 3+ no longer bundles webrick (needed by `jekyll serve`)

# CI only — builds the site's internal link check (see .github/workflows/ci.yml).
# Not a Pages plugin; it never runs on the published site.
gem "html-proofer", "~> 5.0", group: :test
