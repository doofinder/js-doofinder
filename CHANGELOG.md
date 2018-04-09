# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

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
