YarKeshavarz - replacement package

This package is rebuilt as a valid ZIP from the latest stable YarKeshavarz HTML saved in the project context, with:
- local hero background (SVG) so browser/cache clearing does not remove the background image;
- stronger touch handling for the measurement map;
- measurement remains internet-based;
- Persian RTL interface and existing agricultural/advisor functionality retained in the main HTML.

Place index.html, manifest.webmanifest, sw.js and the assets folder together.


Update v2:
- Updated index.html to open a dedicated land-specific chat page when Online is pressed after selecting a registered land.
- Added per-land local chat history, photo selection (gallery/camera), land facts, and quick prompts.
- This is UI/local-storage preparation only. AI server, subscription enforcement, and real online responses are not connected yet.
