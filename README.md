# Stayilo free plugin source

Uncompiled JavaScript for the Stayilo plugin submitted to WordPress.org. Compiled assets ship in `wp-content/plugins/stayilo/build/`.

This tree includes the Classic portal template only. Minimal and other paid templates live in the private Stayilo Pro frontend.

## Packages

- `@stayilo/free-core` builds the wp-admin dashboard and setup wizard (`stayilo/build/index.js` and `stayilo/build/setup.js`).
- `@stayilo/portal-shell` builds the My Account portal (`stayilo/build/portal/`).
- `@stayilo/admin-shell`, `@stayilo/design-system`, `@stayilo/extension-sdk`, and `@stayilo/preview` are libraries those two builds import.

## Build

Requires Node 20 or newer. From this directory:

```bash
npm install
npm run build
```

By default each package writes into its own `build/` folder inside this repo. Set `STAYILO_WP_ROOT` to a WordPress root to write into that site’s Stayilo plugin directory instead.

## WordPress.org

Source repository: https://github.com/cf-digital-development/stayilo-free.git

That URL is also listed in the plugin `readme.txt` so reviewers can read this source.
