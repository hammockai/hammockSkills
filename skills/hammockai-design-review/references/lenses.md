<!-- Part of hammockai-design-review v0.2 (2026-11-20). Based on Impeccable by Paul Bakaus (Apache-2.0), tag skill-v4.10.0,
guides critique-rubric, critique, audit, polish, typeset, animate and layout; rewritten, condensed and modified by Hammock AI
(see the change list in SKILL.md and NOTICE.md). Read the section the review needs, not the whole file. -->

# Review lenses

Every answer needs evidence (file and selector, measured value, or what the screenshot shows), never a bare "yes". What could not be checked is NO VERIFICADO.

## A · Design critique

### A1 · Cognitive load (8-item checklist)
Fails count: 0-1 low (good) · 2-3 moderate (fix soon) · 4+ high (critical).
1. One clear focus: the main task of the page stands out.
2. Chunks of 4 items or fewer.
3. Related items grouped visually.
4. Clear visual hierarchy.
5. One decision at a time.
6. 4 or fewer visible options at any decision point (flag any point with more).
7. No need to remember something from another screen.
8. Complexity appears only when it is needed.

Why 4: people hold about 4 items in working memory at once (Cowan, 2001, as cited by the source). At 5-7, group or reveal progressively; at 8+, people skip, misclick or leave.
On small-business sites: one main action, one or two secondary, the rest in the menu; top navigation of 5 items or fewer; long articles keep one reading path with related links at the end.
Common failures and fixes: a wall of options (group, recommend one); hidden navigation (active state in the menu, clear page title); jargon (plain words, a short definition in place); everything with equal weight (one main element, two or three secondary, the rest calm); information needed from another page (repeat it where it is used, e.g. the address next to the booking button).

### A2 · Nielsen's 10 heuristics (0-4 each)
0 absent or failing · 1 poor · 2 partial with major gaps · 3 good with minor gaps · 4 excellent throughout.
| # | Heuristic | What to check on a site | 0 means | 4 means |
|---|---|---|---|---|
| 1 | Visibility of system status | form sent / error shown, current page marked in the menu, loading of anything slow | the visitor guesses | every action confirms |
| 2 | Match with the real world | the client's trade words, as the visitor says them; logical order | jargon | the visitor's language throughout |
| 3 | User control and freedom | back, close, cancel; menus and dialogs close with Esc | the visitor gets trapped | exits everywhere |
| 4 | Consistency and standards | same term and style for the same action on every page | stitched-together pieces | a predictable system |
| 5 | Error prevention | clear labels, right input types, sensible defaults, confirmation before anything irreversible | no guardrails | errors are nearly impossible |
| 6 | Recognition over recall | visible options, icons with text labels | the visitor must memorize | nothing to memorize |
| 7 | Flexibility and efficiency | direct paths (call, WhatsApp, map) for those who already know what they want | one rigid path | fast paths without complicating the basic one |
| 8 | Aesthetic and minimalist design | each element earns its place; color with purpose | everything competes | nothing is extra |
| 9 | Recover from errors | plain message near the field, says what happened and how to fix it, keeps what was typed | cryptic or nothing | pinpointed, fix suggested, input kept |
| 10 | Help and documentation | contact and frequent questions easy to find, short and in context | no help | help at the right moment |
Heuristics 7 and 10 may be n/a on Persuade pages (one-line reason each).

### A3 · Emotional journey
Apply the peak-end rule: people remember the strongest moment and the last one. Look for valleys (a dead end, a form that asks too much, a price with no context) and check for reassurance at high-stakes moments: before booking, calling, paying or sharing personal data (what happens next, how long, who answers). In health, reassurance is the main job: clear hours, how to get there, what to bring, and an emergency notice where it applies.

### A4 · Personas (2-3 per review)
Walk the page's main action as each one and name the exact element that fails them, not a general concern. Use the client's real audience from the brief; never invent audience details. If the brief says nothing, use these:
- **The first-timer:** needs guidance, leaves when stuck. Is the first action clear within 5 seconds? Labeled icons, explained terms, a way back, a confirmation after sending?
- **The keyboard or screen reader user, possibly with low vision at 200 % zoom:** can they complete the main action with the keyboard only? Visible focus, alt text, AA contrast, no meaning by color alone, labeled fields, state changes announced?
- **The distracted phone user:** one thumb, interruptions, slow connection. Main action within thumb reach, touch targets of 24×24 px at least (AA floor) and about 44×44 for the main actions (the source's mobile figure), light images, nothing lost if they come back later?
- **The edge-case tester:** long names, empty or failed states, a refresh in the middle of a form, odd characters. Silent failures, technical error text, useless empty states?
- **(Health) the older patient or the worried one:** larger text, calm layout, phone and address in view, no pressure, no marketing tone.
Selection by page type: Persuade → first-timer, edge-case tester, phone user · Read → first-timer, keyboard/low vision, phone user · Operate → first-timer, keyboard/low vision, phone user · Health: always include the older or worried patient.

## B · Technical audit (5 dimensions, 0-4 each)
| Dimension | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| 1 · Accessibility (WCAG 2.2 AA, measured: contrast 4.5:1 text / 3:1 large text, focus and borders; keyboard; 24×24 targets; reduced motion; alt; labels; semantic HTML) | fails level A | major gaps (no keyboard path, few labels) | some effort, significant gaps | mostly AA, minor gaps | full AA, close to AAA |
| 2 · Performance (image size and format, lazy loading below the fold, only the font weights in use, no animated layout properties, `will-change` only while animating) | severe (huge assets, layout thrashing) | major (no lazy loading, costly animations) | partial | mostly optimized | lean and fast |
| 3 · Tokens and consistency (colors, spacing and type from CSS custom properties; repeated values not hard-coded) | everything hard-coded | few tokens | tokens used unevenly | tokens with minor exceptions | a full, coherent token system |
| 4 · Responsive (from 320 px with no horizontal scroll, fixed widths, text zoom, touch targets, breakpoints that reorder by priority) | desktop only | many failures | works on phone with rough edges | minor target or overflow issues | fluid at every width |
| 5 · Clean site (rule 7 of hammockai-web-design: no inline script or style, no on* attributes, nothing from another domain, local woff2 fonts with relative url(), rel="noopener noreferrer" on target="_blank"; plus the cliché list of that skill) | systemic violations | repeated violations | several verified issues | isolated minor issues | coherent and intentional |
Performance from source only is an estimate: Lighthouse, page weight and LCP/CLS are NO VERIFICADO unless The Builder measured them.
Each finding carries: name, location (file and selector or line), category, impact on the visitor, the standard it breaks (e.g. WCAG 2.4.7), fix, who fixes it.

## C · Polish lens (whole path, in this triage order)
Polish refines what exists; if the concept itself is wrong, say so and recommend a redesign with hammockai-web-design instead of disguising one as polish. Keep content, behavior and everything out of scope.
1. Broken tasks, misleading states, inaccessible paths.
2. Missing states: loading, empty, error, success, disabled (forms, buttons, the contact path).
3. Flow and hierarchy: the main task is obvious; same terms as neighboring pages; drift from the site's own tokens and components (classify it: missing token, one-off value, concept mismatch or local defect, and fix at the narrowest correct level).
4. Visual and motion inconsistencies: contrast in every state (hover, focus, active, disabled), one icon family, no layout shift when images or fonts load.
5. Cleanup: dead code, debug leftovers, values that should be tokens.
A fix never changes factual text (prices, hours, credentials, claims) without the client's OK: report it as a decision.
Check the whole path with mouse, keyboard and touch, at 1280 and 390 px; what you could not try is NO VERIFICADO.

## D · Typography lens
Improve within the existing identity; replacing typefaces is a design decision (hammockai-web-design and the Captain or the client).
- Roles are distinct at a glance (heading, body, label, metadata) and no two sizes or weights are too close; one fixed role scale repeated across pages.
- Body 16 px (1rem) or more; measure 45-75 characters (hammockai-web-design caps it under 80); wider lines need more line height.
- Line height tuned to the face and width, not a fixed ratio; serif slightly more.
- Light text on a dark background: a little more line height, a little more letter spacing and sometimes one step more weight.
- Headings with `text-wrap: balance`, body with `text-wrap: pretty` (progressive enhancement; support NO VERIFICADO until The Builder checks it). Manual line breaks in a heading only between phrases, checked at every width: a break in the middle of a line on a phone is worse than the default.
- Tabular numerals for prices, hours and data.
- Only the fonts and weights in use are loaded; fallbacks with similar metrics so text does not jump when the font arrives; text never invisible while loading.
- Paragraph rhythm with spacing or first-line indent, not both. A second family only if it has a role the first cannot fill.
- Respects browser zoom and the user's font settings.

## E · Motion lens
Motion explains a state, a relationship or a hierarchy, or it is the page's one deliberate moment (hammockai-web-design). Motion without a job is a cost: recommend removing it.
- Durations: 100-150 ms immediate feedback · 150-300 ms state changes · 300-500 ms overlays or view transitions · 500-800 ms one authored entrance. Exits faster than entrances. Slow feedback reads as lag.
- Easing that decelerates, e.g. `cubic-bezier(0.16, 1, 0.3, 1)`; no bounce or elastic by default.
- Animate `transform` and `opacity`; not width, height, top, left or margins.
- Hover: the hovered element stays still and a child moves (otherwise it slides from under the pointer and flickers); neighbors do not move; wrap hover effects in `@media (hover: hover)` so they do not stick on phones. A delay goes only on entering, not on leaving.
- Content visible by default: if a script fails, the page still reads.
- No staggered reveal on every section; stagger only real lists, with a capped total delay.
- `will-change` only during a known animation; pause loops offscreen.
- Every animation has a `prefers-reduced-motion` path: less movement, but state and confirmation changes still visible.
- Check it in both modes, normal and reduced motion, never from one screenshot of one element; if motion could not be observed, say NO VERIFICADO.
- In health: motion only as feedback; no entrance spectacle.

## F · Layout lens
Layout turns priority into reading order, grouping and rhythm. Diagnose before moving anything; keep the identity.
- Blur test: with details blurred, are the main element, the secondary one and the big groups still visible in that order?
- Group by meaning: proximity before boxes and borders ("group near, separate far"); more space above a heading than below it.
- Rhythm: deliberate contrast between tight and generous gaps, not one value repeated until everything weighs the same; one spacing scale (a 4-based scale gives middle steps that 8-only lacks).
- Structure fits the content: repeated cards or columns only if the items really are equivalent.
- Density fits the page type: Read and Operate favor predictable structure; Persuade allows an asymmetric or less predictable composition only where the brief and the 8 rules allow it, and never on health sites.
- Responsive is structural: what reorders, collapses or wraps at narrow widths follows priority. DOM order and focus order match the visual order.
- Extremes: long text, empty states, sticky headers, overlays and small targets do not break the structure.
- Depth (shadows, layers) only to clarify state or hierarchy; a shadow with offset and blur, not a glow.
