---
name: eli5
description: Explain a topic like I'm a 5 year old. Use when the user types /eli5 <topic>, says "说人话", or asks for a dead-simple picture explainer of how something works. With no topic, explains the last thing discussed.
---

# eli5

Explain like I'm someone who knows nothing about this topic, using an HTML page whose
diagrams carry the explanation and whose prose stays out of the way.

Write the page to the OS temp directory — never into the user's repository — then open it
(`open` on macOS, `xdg-open` on Linux). Say one line in the terminal afterwards: what you
explained and where the file is. Do not repeat the explanation as prose.

Write the page in the language the user is writing in.

Topic: $ARGUMENTS

If no topic is given, explain the last substantial thing in this conversation.

## Page structure

**Sections scale with the topic, not to a fixed number.** Count the distinct ideas a newcomer
has to hold before the topic makes sense, and give each one its own section. "What is a mutex"
is three sections. "Object-oriented TypeScript" is class, instance, constructor, inheritance,
private, interface, and the type checker — seven ideas, so seven sections. Covering fewer than
the topic actually has is the most common failure mode: the page looks clean and teaches
nothing.

Each section is a heading, one to three sentences, and **one diagram that does real work** —
4 to 9 labelled parts, not a box and an arrow.

Open with the analogy, map it onto the real thing idea by idea, and close with what breaks
without it.

Optional, once per section: a short code or spec chip, five lines at most, in mono and muted,
sitting under the diagram for the reader who wants the exact version. It never replaces the
diagram.

## Tokens

Copy this verbatim, then build on it. Light paper, not dark — dark backgrounds with glowing
strokes read as generated, not designed.

```css
:root {
  --paper: #f5f5f5; --paper-2: #ffffff;
  --ink: #2d3142; --muted: #4f5d75;
  --rule: rgba(45, 49, 66, 0.12);
  --accent: #eb6c36; --accent-tint: rgba(235, 108, 54, 0.08);
}
* { box-sizing: border-box; margin: 0; }
body {
  background: var(--paper); color: var(--ink);
  font: 400 16px/1.6 -apple-system, "PingFang SC", "Segoe UI", system-ui, sans-serif;
  max-width: 960px; margin: 0 auto; padding: 64px 32px;
}
.eyebrow { font: 500 12px/1 ui-monospace, Menlo, monospace; letter-spacing: 0.14em;
           text-transform: uppercase; color: var(--muted); }
h1 { font: 400 40px/1.2 Georgia, "Songti SC", serif; margin: 12px 0 8px; }
h2 { font-size: 24px; font-weight: 600; line-height: 1.3; margin: 0 0 8px; }
p  { color: var(--muted); max-width: 60ch; }
section { padding: 40px 0; border-top: 1px solid var(--rule); }
svg { width: 100%; height: auto; display: block; margin: 24px 0; }
```

Three typographic jobs, three families: serif for the page title, sans for everything
readable, mono only for technical strings (ports, commands, field types) and eyebrow tags.
No web fonts, no CDN, no external images — the file has to render offline.

## Layout procedure

Never eyeball coordinates. Every diagram is built in this order, and connector endpoints are
**derived arithmetically from box geometry** — never estimated.

1. **Plan first.** Before writing any SVG, list the nodes and the edges between them. Every
   node must appear in at least one edge; every edge must name a real source node and a real
   destination node. A node nothing points at, or an arrow with no destination node, is a bug
   you introduce here and can no longer see later.
2. **Place on a fixed grid.** Pick column x-positions and row y-positions up front and put
   every box on them — for a 960-wide canvas, columns at `x = 40, 280, 520, 760` with boxes
   200 wide, rows at `y = 40, 200, 360` with boxes 96–120 tall. Nothing sits between columns.
3. **Derive every endpoint** from the box it touches:
   - right edge of a box: `(x + w, y + h/2)`; left edge: `(x, y + h/2)`;
     bottom: `(x + w/2, y + h)`; top: `(x + w/2, y)`
   - same row → one straight horizontal line between the two edge points
   - different row → elbow: out to the midpoint x, vertical to the target row, then into the
     target edge, each bend an `r=8` quarter-arc
4. **Place labels last**, on the longest straight segment of their own connector, and only if
   that segment has at least 80px of open canvas. If it does not, delete the label — a
   cramped label is worse than no label.

## Drawing rules

These are geometry, not taste. Breaking one is what makes a diagram look generated.

- **4px grid.** Every coordinate, size, gap and font size divisible by 4. Font sizes: 8, 12,
  16, 20, 24. Gaps between nodes: 24, 32, 40, 48. Corner radius: 4, 6, 8 — never more.
- **Draw arrows before boxes** so the strokes sit behind the nodes.
- **Every node box is two rects**: an opaque `var(--paper)` rect first so arrows cannot bleed
  through, then the styled rect on top.
- **Orthogonal connectors only.** Nodes that share no axis connect with a right-angle elbow
  rounded at `r=8`. A diagonal line between two boxes is an automatic fail.
- **Arrows end in a real `<marker>`**, defined once in `<defs>`. No arrow characters
  (`→ ↓ ← ↑`) anywhere in a `<text>` element — an arrow is geometry, not typography.
- **No dangling arrows.** Every connector ends on the edge of a destination box. An arrow
  pointing into empty space is a hard fail, even if the meaning seems obvious.
- **No orphan boxes.** Every box is the endpoint of at least one connector. A box nothing
  reaches either needs a connector or does not belong on the page.
- **Arrow labels get an opaque mask rect** in `var(--paper)`, with a visible **6–10px gap**
  between the mask and the stroke. A label sitting on its own line is a fail. ≤14 characters.
- **Fan the attach points.** Two connectors leaving the same edge of a box need their own
  points, ≥12px apart. No connector may hide another.
- **No connector passes behind a box that is not its endpoint.** Reroute instead.
- **Accent on at most two elements per diagram.** Everything else is ink or muted. Accenting
  five things means you have not decided what matters.
- **Three colours, full stop.** Ink, muted, accent. No red for "forbidden", no green for
  "allowed", no ✕ or ✓ marks. A forbidden path is a dashed accent stroke; a permitted one
  is a solid stroke. The shape carries the meaning, not a new hue.
- Labels live inside the SVG as `<text>`, 12px minimum. No vertical `writing-mode`.
- No shadows. Borders instead. No gradients.

## Budget

The budget is **per diagram, not per page**: at most 9 nodes and 12 arrows in any one diagram.
A topic with more moving parts turns into more sections — never into a denser diagram.

Deletion applies inside a diagram: two nodes that always travel together are one node, and an
arrow whose relationship is already obvious from the layout should go. It does **not** apply to
coverage. Never drop an idea the topic genuinely needs just to keep the page short.

## Before writing the file

- Did I list every idea the topic needs, and does each one have its own section? Stopping
  early because the page already looked tidy is the failure to watch for.
- Did I write down the node list and edge list before drawing?
- **Does every arrow end on a box edge, and is every box reached by an arrow?** Trace each
  one — this is the failure that survives every other check.
- Can any node, arrow or label be removed without losing the reader? Remove it.
- Every coordinate divisible by 4?
- Every connector orthogonal with rounded elbows, none overlapping, none behind a
  non-endpoint box?
- Every arrow label masked, with a visible gap above its stroke, sitting on open canvas
  rather than over a box?
- No arrow characters, ✕, ✓, or any colour outside ink / muted / accent?
- Accent on ≤2 elements per diagram?
- Does each diagram carry more than its two sentences do? If not, the diagram is decoration —
  redraw it or cut the section.
