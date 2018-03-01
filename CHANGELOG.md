# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

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
