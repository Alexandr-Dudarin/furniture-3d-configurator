# Catalog panels v1 — validation

2026-09-22. Baseline: accepted opening joints v1, verified 116/116 feature files
and 612/612 compatible baseline files before edits.

| Check | Result |
| --- | --- |
| `npm test` | 300 tests / 40 files PASS |
| `npm run build` | PASS |
| ESLint, all 7 changed/new TS/TSX files | PASS |
| Browser desktop, 1440 × 1000 | PASS |
| Browser touch viewports, 390 × 844 and 320 × 844 | PASS |
| Existing public assets | 78/78 byte-identical |
| Re-running dresser catalogue/runtime generator | Byte-identical to first generation |

Browser QA used the production Vite build with QA-only access to the existing
configuration store, motion store and Three.js runtime. Those accessors are
not in product source. Chromium used software WebGL in the test environment.
Mobile checks emulate viewport and touch; they are not physical iOS/Android tests.

## Covered behavior

- All eight cabinet/dresser models have three sections and correct initial open
  state. Switching models restores initial section state; edits keep the
  currently open section open.
- Brooklyn starts with satin-brass handles, confirmed on actual rendered mesh
  materials. Changing dimensions updates the summary. Changing a finish updates
  both summary and saved configuration. Reload and shared URLs preserve it.
  Reset restores brass. A unit regression also preserves previously saved/shared
  white and black handles rather than replacing user choices.
- Native Enter / Space section activation, visible focus outline and
  prefers-reduced-motion support work with the shared component.
- Open-all / close-all update the summary even while the section is collapsed.
  Wardrobe 07 interior view disables four doors and leaves three drawers active.
  Chelsea interior view shows the hidden-door explanation and disabled buttons.
- The handleless white dresser has no hardware selection or hardware summary.
- Mobile touch opens sections and operates opening buttons. Text input commits
  on Enter; height 950 mm for Brooklyn is correctly clamped to its existing
  900 mm maximum. Material cards remain selectable at both widths.
- No horizontal page/panel overflow. Mobile 3D viewport remains above the panel.
- Table builder reuses the extracted section component; four sections work.
  Ready-made table controls remain available.
- No application JavaScript, console-error or HTTP-error events in completed
  desktop/mobile phases. Detailed results: `browser-report.json`.

Desktop and mobile phases ran on the same product code. QA retries corrected
click targeting of visually hidden radio inputs (click the actual card label)
and the expected result for out-of-range input; product behavior was correct.

Build retains the pre-existing warning about the deferred 3D chunk exceeding
500 kB. No dependency, geometry, material-map, dimension-limit or motion-runtime
changes are included. The furniture asset standard remains v2.7.
