# Figma import files (Dangdi Home, dark theme, 390 px wide)

- `dangdi-home-figma.html` flat HTML for html.to.design style importers. Only absolutely positioned divs,
  one text layer per line, and inline SVG paths for the cut/notch shapes. No clip-path, mask, CSS variables,
  pseudo-elements, grid or writing-mode. Layers are named from the component classes.
- `dangdi-home.svg` the same screen as one SVG. Drag it into Figma: text stays editable text,
  shapes stay vector paths, cut corners and notches are real outlines.

Fonts to install/enable in Figma: Bricolage Grotesque, Instrument Sans, DM Mono, Noto Serif SC.
Bricolage Grotesque headlines use the condensed width (wdth 75). Set the Width axis on those layers if Figma
imports them at normal width.

`build-figma-html.js` regenerates the HTML from `../index.html` with Playwright.
