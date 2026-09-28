# Yoree — Motion & Micro-interaction Prototype

A clickable mobile prototype demonstrating a **reusable motion system** for
Yoree, a private digital memory platform (photos, video, audio, written
stories). No backend or build step — pure HTML/CSS/JS, rendered inside a
390×844 device frame.

This prototype is not a full product design. It exists to show that
thoughtful, systematic motion — not "lots of animation" — is what makes a
private memory experience feel calm, emotional and premium.

## Run it

Open `index.html` directly in a browser, or serve the folder:

```
cd yoree-motion
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Demo flow (~45–75s)

1. **Memories Home** — a calm feed: one featured memory, three recent ones. A
   single restrained entrance plays once as the loading skeleton hands off.
2. Tap **Summer by the Sea** → the featured image and title fly into the
   **Memory Story** screen as one continuous object (shared-element / FLIP
   transition), not a hard cut.
3. Scroll the story — the hero subtly compacts and the title tucks into a
   sticky bar. Tap **Sunset** → the thumbnail expands into a focused
   **Moment** view; content fades in only after the media settles.
4. Close it — the same transition reverses, landing back at the exact scroll
   position in the timeline.
5. Tap **+** → a spring-based bottom sheet, **Add a Moment**. Choose
   **Photo** → lands on **Create Photo Memory**, prefilled with a fictional
   moment ("Last Light").
6. **Save Moment** → loading → success → a small, one-shot "spark" completion
   motif (not confetti) → automatic return to the story, where the new
   moment fades/scales into its correct timeline position and briefly
   highlights.

## Secondary interactions (also live)

- **Audio moment** ("Rain on the Window") — play/pause morph, progress fill,
  a lightweight 5-bar waveform that only animates while playing.
- **Video moment** ("Evening Walk") — play/pause morph, elapsed time, no
  decorative playback effects.
- **Mark as meaningful** — a quiet heart toggle with a small pop, no social
  engagement styling.
- **Remove from Memory** — confirmation sheet, then the item collapses out
  of the timeline and siblings close the gap.
- **Simulated network error while saving** — the form, selected photo and
  typed text are never cleared; only an inline error panel appears with
  *Try Again* / *Keep Editing*.
- **Loading** and **empty-memory** states, reachable from the Demo Controls
  panel beside the phone.
- **Reduced Motion** toggle — shared transitions become plain fades, spring
  bottom sheets shorten and lose their overshoot, and the decorative
  completion spark is suppressed. Nothing becomes unreachable; only the
  *decoration* is removed.

## The motion system (`styles.css` + `app.js`)

Every screen reuses the same handful of primitives instead of getting its
own bespoke animation:

| # | Pattern | Where it lives |
|---|---|---|
| 1 | Press feedback | one delegated listener (`.pressable*`), used everywhere |
| 2 | Shared content transition | `flyGhost()` — FLIP-style ghost element, reused for Home→Story, thumbnail→Moment, and its own reverse |
| 3 | Bottom sheet motion | `.sheet` + `openSheet`/`closeSheet`/`makeDraggable()` |
| 4 | Content insertion | `renderStoryWithInsertion()` — fade + scale + temporary highlight |
| 5 | Content removal | `removeMomentRow()` — height/opacity collapse, siblings reflow |
| 6 | State transition | icon crossfades (play↔pause), button loading→success |
| 7 | Completion motion | `playCompletion()` — a single small spark, ~600ms, never repeated mid-flow |

All durations and easings are CSS custom properties (`--d-fast` … `--d-hero`,
`--ease`, `--ease-spring`). Toggling Reduced Motion sets
`[data-motion="reduced"]` on the device frame, which cascades those tokens
down automatically — most of the system doesn't need special-casing to
respect it.

Everything here is built from transforms, opacity and small vector/CSS
motifs — the kind of thing that maps directly onto React Native Reanimated
(shared transitions, layout animations), Skia/Lottie (the spark), or a
native `Animated`/spring API, without relying on effects that are expensive
to run on a real device (no continuous blur, no particle systems, no
full-screen simultaneous animations).

## Demo data

All memories, moments, dates and the two named people ("You", "Sena") are
fictional. There is no contact information (no email, phone, address, URL,
or handle) anywhere in the prototype.
