YarKeshavarz - replacement package

This package is rebuilt as a valid ZIP from the latest stable YarKeshavarz HTML saved in the project context, with:
- local hero background (SVG) so browser/cache clearing does not remove the background image;
- stronger touch handling for the measurement map;
- measurement remains internet-based;
- Persian RTL interface and existing agricultural/advisor functionality retained in the main HTML.

Place index.html, manifest.webmanifest, sw.js and the assets folder together.

NEW: server/ contains the initial secure API foundation for online subscriptions,
monthly AI quotas and text/image analysis endpoints. It is intentionally NOT wired
into the public frontend and is NOT production-ready until authentication, payment
verification, provider commercial permission, deployment secrets and live tests are completed.
See server/README-FA.md before deploying.
