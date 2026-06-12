# Mirrors the exact toolchain GitHub Pages runs, so CI builds the site the
# same way production does. The `github-pages` gem pins Jekyll and every
# whitelisted plugin (see _config.yml) to the versions Pages uses; adding
# this file does not change how Pages builds — it just lets CI reproduce it.
source "https://rubygems.org"

gem "github-pages", group: :jekyll_plugins

# Link/build checker — CI only, not part of the published site.
gem "html-proofer", "~> 5.0"
