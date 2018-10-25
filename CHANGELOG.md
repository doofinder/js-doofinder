# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [5.4.0] - 2018-10-25
### Added
- Stats can accept custom results id for click events.

## [5.3.15] - 2018-09-27
### Fixed
- Don't escape `nextLabel` and `previousLabel` in `PagerWidget` templates so they can be passed to the `translate` helper.

## [5.3.14] - 2018-08-28
### Added
- New `zoom` option in `RangeFacet` to allow _zooming_ selected range in the slider.

## [5.3.13] - 2018-08-27
### Added
- New `forceDecimals` option for currency specification. `true` by default, forces decimal notation for integer values.

### Fixed
- Restored original behavior with currency formatting (via `forceDecimals` default value).
- Better handling of widget rendering exceptions. Now they don't entirely break the execution of the render process.

## [5.3.12] - 2018-06-27
### Fixed
- Fixed problem with terms widget which could cause duplicated entries in terms data.

## [5.3.11] - 2018-06-11
### Added
- Documentation and tests for Pager.

### Changed
- Improved Pager template and math.

## [5.3.10] - 2018-05-08
### Fixed
- Fixed a bug that prevented to perform the search request when you type again the same minimum number of characters that trigger a search.

## [5.3.9] - 2018-04-30
### Added
- Added new `headers` option for `Client`.

## [5.3.8] - 2018-04-11
### Added
- `Thing.is.plainObject` to replace `Thing.is.hash`.

### Changed
- If `Client` receives an `address` option with protocol, protocol is forced (an API key has precedence and forces HTTPS).

### Fixed
- `doofinder.util.merge`

## [5.3.7] - 2018-04-09
### Removed
- `doofinder.util.extend` has been replaced.

### Added
- `doofinder.util.merge` replaces `extend` because it's mainly used to compile options instead of extending _classes_ and that kind of stuff.

### Fixed
- Fixes a problem with PrototypeJS modifying the Array prototype.

## [5.3.6] - 2018-04-04
### Fixed
- There was a problem with HTML entities and the range slider (noUiSlider). We've made a temporary patch and filed an issue in the noUiSlider repository.

## [5.3.5] - 2018-03-22
### Changed
- Updated noUiSlider to v11.x.
- Reduced styles to the minimal so they're easily customizable following the default noUiSlider style guide.

## [5.3.4] - 2018-03-08
### Added
- `QueryInput` now supports extra delayed events for the case the user stops typing and you want to perform actions independently of those done when the `df:input:stop` event is triggered.

### Fixed
- `Stats.registerClick` now is fully compatible with the click recording API endpoint.

## [5.3.3] - 2018-03-07
### Changed
- Removed all the `df:input:submit` stuff.

## [5.3.2] - 2018-03-07
### Fixed
- Now QueryInput also matches input tags with no type attribute.

## [5.3.1] - 2018-03-01
### Changed
- Now QueryInput widget can prevent the submission of the form that contains it (by default this is disabled).
- The `df:input:submit` event now always sends the closest form, if any, as a second parameter.

## [5.3.0] - 2018-02-28
### Changed
- QueryInput widget now supports multiple input sources.
- Programmatically changing current active input in a QueryInput widget affects the same input in other instances of the widget.

## [5.2.6] - 2018-02-28
### Added
- This document.

### Fixed
- A problem in the controller that allowed rendering responses older than the last rendered one.
