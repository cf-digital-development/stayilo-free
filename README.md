# Stayilo free plugin source

Uncompiled JavaScript for the Stayilo plugin submitted to WordPress.org. The compiled files that ship in the plugin are `wp-content/plugins/stayilo/build/`.

This tree includes the Classic portal template only. Minimal stays in the private Stayilo frontend, which keeps every template for paid installs.

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

The build writes into the local WordPress plugin at `../SubXP/wp-content/plugins/stayilo/build` when that plugin directory exists. Set `STAYILO_WP_ROOT` to point at a different WordPress root, or `STAYILO_WP_OUT=0` to write into each package's own `build/` folder instead.

## WordPress.org

Source repository: https://github.com/cf-digital-development/stayilo-free.git

That URL is also listed in the plugin `readme.txt` so reviewers can read this source.
