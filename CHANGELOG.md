# Changelog

This changelog documents only the two most recent published GitHub releases. Each entry describes verified changes between its tag and the immediately preceding **published** release. Changes made later on `master` are excluded.

**Release history note:** The `1.1.4...1.1.6` comparison includes an intermediate commit labeled `V 1.1.5`, but no published GitHub release for `1.1.5` was found. No separate `1.1.5` release entry is inferred.

## 1.1.6 - 2026-10-19

### Changed

- Added the plugin icon image at `pix/icon.png` and reorganized the SVG logo asset as `pix/monologo.svg`.
- Added a release workflow concurrency group keyed by Git reference, with `cancel-in-progress: false` and `queue: max`, to configure how overlapping release runs are handled.
- Removed the inline `// Moodle 4.5.` comment from the `$plugin->requires` line in `version.php`; the minimum Moodle build requirement, `2024100700`, remains unchanged.
- Updated the published release identifier from `1.1.4` to `1.1.6` and the plugin build number from `2026101500` to `2026101900`. The comparison also includes a `V 1.1.5` commit without an associated published release.

No functional changes to the Triangle activity were identified in this tag comparison.

[Compare 1.1.4...1.1.6](https://github.com/EduardoKrausME/moodle-mod_triangle/compare/1.1.4...1.1.6)

## 1.1.4 - 2026-10-15

### Changed

- Updated the GitHub Actions CI PostgreSQL service from version 16 to 17.
- Updated the MariaDB CI service from version 10 to 11.4, including revised startup environment variables and health-check configuration.
- Updated the plugin release identifier from `1.1.3` to `1.1.4` and its build number from `2026101200` to `2026101500`.

No functional changes to the Triangle activity were identified in this tag comparison.

[Compare 1.1.3...1.1.4](https://github.com/EduardoKrausME/moodle-mod_triangle/compare/1.1.3...1.1.4)
