# Tooling

Shared webpack output lives in `wp-output.cjs`. Shipping packages write into each package's own `build/` by default.

| Target key | Local default | With `STAYILO_WP_ROOT` |
|------------|---------------|------------------------|
| `freeAdmin` | `packages/free-core/build/` | `{WP_ROOT}/wp-content/plugins/stayilo/build/` |
| `portal` | `packages/portal-shell/build/` | `{WP_ROOT}/wp-content/plugins/stayilo/build/portal/` |

- Override WordPress root: `STAYILO_WP_ROOT=/path/to/wordpress`
- Builds always stay inside the repo when that env var is unset

Vite mocks (`dev:admin`, `dev:free`, …) stay in the package. They do not touch WordPress.
