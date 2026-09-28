# Tooling

Shared webpack output lives in `wp-output.cjs`. Shipping packages write **directly** into WordPress / the license server.

| Target key | Destination |
|------------|-------------|
| `freeAdmin` | `stayilo/build/` (`index` + `setup`) |
| `portal` | `stayilo/build/portal/` |
| `wizard` | `stayilo-pro/build/wizard-pro/` |
| `licenseCore` | `license-server/builds/core/` |
| `licenseGrowth` | `license-server/builds/growth/` |
| `licensePortal` | `license-server/builds/portal/` |

- Default root: sibling `SubXP/` (or XAMPP `D:/xampp/htdocs/SubXP/SubXP` if that plugin exists).
- Override: `STAYILO_WP_ROOT=/path/to/SubXP`
- Local package `build/`: `STAYILO_WP_OUT=0`

Vite mocks (`dev:admin`, `dev:free`, `dev:wizard`, …) stay in the package. They do not touch WordPress.
