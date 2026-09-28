YarKeshavarz - replacement package

This package is rebuilt as a valid ZIP from the latest stable YarKeshavarz HTML saved in the project context, with:
- local hero background (SVG) so browser/cache clearing does not remove the background image;
- stronger touch handling for the measurement map;
- measurement remains internet-based;
- Persian RTL interface and existing agricultural/advisor functionality retained in the main HTML.

Place index.html, manifest.webmanifest, sw.js and the assets folder together.


Deployment note — Yar Keshavarz real entry
-------------------------------------------
The main GitHub Pages entry is index.html. The Yar Keshavarz rich flow is rendered
directly by the yar() function in index.html; it is not loaded from keshavar-yar.js.

Service-worker cache behavior was changed in v23:
- index.html/navigation is network-first;
- previous service-worker caches are deleted on activation;
- a missing presence.js cache entry was removed.

After replacing the repository contents, open the GitHub Pages site once with a
normal browser refresh. The current Yar page should show its mode selector,
registered lands, product selection, cultivation file, costs/income/profit and
the agricultural chat on the same page.
