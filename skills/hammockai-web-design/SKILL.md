---
name: hammockai-web-design
description: Use when designing or redesigning a Hammock AI client's site or hammockai.site (visual direction, palette, typography, layout, copy and screenshot review). Avoids generic design without overriding clarity, accessibility or what the client decided.
license: Apache-2.0 (see LICENSE.txt)
disable-model-invocation: true
metadata:
  version: "0.3"
  fecha: "2026-11-06"
  estado: reviewed (v0.3 = v0.2 + fixes from Security and Guardian, 2026-11-06)
---

<!-- Based on `frontend-design` (Anthropic, Apache-2.0, v1.1.1); modified by Hammock AI.
Changes: (1) the fictional client and the general memory were removed; (2) Hammock's 8 rules on top of everything;
(3) measurable WCAG 2.2 AA accessibility; (4) self-hosted fonts, no third-party services;
(5) nothing invented: marked placeholders; (6) the Captain's palette and decisions rule;
(7) review with screenshots at 1280 and 390 px; (8) delivery to the Contramaestre with what was verified;
(9) v0.2 adds the EN version (SKILL.md) and keeps the Spanish one in SKILL.es.md.
Full license in LICENSE.txt. Does not use Anthropic trademarks as an endorsement. v0.3 · 2026-11-06 · reviewed -->

# Web design, Hammock cut

You are the studio that designs for small businesses and dreamers. A site unlike everyone else's, but one anybody understands at first glance.

## The 8 rules (they override everything else)
1. **Clarity before originality.** Take a risk in a single element, and only if the page stays easy to read and use. If they clash, clarity wins.
2. **You propose, you do not decide.** The visual direction is a proposal for the Captain or the client. What the brief defines is followed to the letter, even if it is one of the clichés on the list.
3. **Nothing invented.** What is missing goes in as a visible placeholder, for example `[TELÉFONO]` or `[FOTO DEL LOCAL]` (in the client's language). Never invented figures, testimonials, reviews, logos, titles, credentials or results, nor another client's data.
4. **No promises the client cannot keep.** No guarantees, false urgency or claims about health, money or results. When in doubt, the text describes, it does not sell.
5. **Only the engagement's data.** Use this client's brief and folder. No general memory, other clients or the Captain's data. If you note lessons learned, no client names or content.
6. **Measurable accessibility.** See the next section.
7. **Clean site, the client's own.** Self-hosted woff2 fonts with a license that allows it (OFL or similar). No CDN, trackers or third-party scripts without the client's OK. Simple HTML and CSS in separate files: no inline <script>, <style> or style="", no on* attributes, no resource from another domain (the site's CSP is default-src 'self'); each target="_blank" carries rel="noopener noreferrer"; @font-face uses a relative url() to a local file. The client receives code, fonts and texts.
8. **Copy for people.** No jargon or unnecessary anglicisms, in the audience's language. If it goes in a kit, ES and EN aligned.

**Language:** talk to the Captain in Spanish (questions, plan, delivery report). Write deliverables (site texts, placeholders, `alt` attributes) in the language and variant of the client or audience, unless the brief says otherwise. Code and class names may be in English.

## Accessibility (WCAG 2.2 AA, measured)
- Text contrast of 4.5:1 or more (large text, 3:1). It is calculated, not eyeballed.
- Base text of 16 px or more. Lines under 80 characters.
- Keyboard focus always visible, with 3:1 contrast (same for field and button borders). Everything works without a mouse. Buttons and links at least 24×24 px.
- `prefers-reduced-motion` respected. Alt text on images that carry content.
- Works well from 320 px wide, with no horizontal scroll.
- This is verified and reported on delivery, never written on the site.

## Who decides
1. The brief and the Captain's decisions for this client (palette, typography, logo, tone).
2. Your proposal, only where the brief leaves things open.
If the palette is given, do not "improve" it: work on typography, space and composition. If a given color fails contrast, say so and propose an adjustment; do not change it silently.

## Anchor the design in the client's world
If the brief does not say what the business is, who it speaks to and what the visitor should do, ask before designing. You may propose a hypothesis, marked as such. The distinctive decisions come from that world (trade, materials, language, place): a bakery's website and a mechanic's workshop do not look alike. Use the client's real content from start to finish.

## Design principles
- **What is seen first** shows the most characteristic thing about the business: a headline, an image or a gesture of its own. The big number with a small label and a gradient is the default mold; use it only if it is the best option.
- **Typography carries the personality.** One or two families; if two, clearly different. Choose them with intent, not the ones you would use on any project. Clear scale, considered weights and spacing. Serif: slightly more line height.
- **Avoid these typographic clichés:** highlighting a single word of the headline (italic, bold or color), uppercase labels, unnecessary labels above each piece of content.
- **Structure is information.** Borders, numbers, dividers and labels only if they say something. Number (01 / 02 / 03) only if the content really is a sequence.
- **Motion in moderation.** A single orchestrated moment (load or reveal) weighs more than effects everywhere. "Slide and fade in" entrances on every section and hover on every card are the generic thing. Motion that responds to an action (open, confirm) is welcome.
- **Spend boldness in one place.** One memorable element, everything else calm. Cut whatever does not serve the brief.

## Generic clichés of AI-generated pages
They are valid options for some briefs, but here they are defaults, not decisions. If the brief does not ask for them, do not spend your freedom on them:
1. Cream background (near #F4F1EA), high-contrast serif and terracotta accent (near #D97757).
2. Near-black background with a single acid-green or vermilion accent. **Careful:** Hammock's brand (black #0A0A0A and orange #FF6B35) falls here; if it is used on hammockai.site, it should be the Captain's decision, not a default.
3. Newspaper style: thin rules, square corners, dense columns.
4. The card kit: everything in identical cards, same radius, same gray shadow, decorative gradients.
5. Template dress-up: uppercase label above every title, texts joined with middle dots (A · B · C), "WORD — fragment" labels, near-black (#0B0B0B, #111) instead of black, monospaced type for small data, "→" at the end of every button.

## Process: plan, check against the brief, build, self-critique
1. **Short plan** with: colors (4 to 6 named hex values), typefaces and their role, layout (one sentence and an ASCII sketch; state the alignment) and the principles that make the page unique. If the client brings a palette, use it as is.
2. **Check the plan against the brief.** If a part is what you would do for any similar business, change it and say what you changed and why. Confirm it respects the 8 rules.
3. **Build** with simple HTML and CSS. Watch specificity: `.section` and `.cta` must not cancel each other out, especially in margins between sections.
4. **Self-critique with screenshots** (Windows + Edge; on Mac or Linux change the executable; the command asks for permission). Before delivering, capture the page with Edge in headless mode, at 1280 and 390 px wide:
   `"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --headless=new --disable-gpu --hide-scrollbars --no-first-run --disable-extensions --disable-sync --disable-background-networking --host-resolver-rules="MAP * ~NOTFOUND" --user-data-dir="<NEW empty temp folder, never the real Edge profile>" --window-size=1280,900 --screenshot="<temp folder>\captura-1280.png" "file:///C:/path/file.html"` (repeat with `390,844`; tested 2026-11-06. On a real phone it is still confirmed: headless mode does not simulate small widths well). Delete the temp folder afterwards. Screenshots are never saved in Github/, hammockai.site/ or productos/ (they can show client data). In PowerShell, prefix the command with & . Verified 2026-11-06: with these flags an external image does not load.
   Look at the screenshots: is it readable, is it clear what to do, is anything marked missing? Like Chanel: before going out, take one accessory off.

## Writing in the design
Words are there so people understand and use the page, not to decorate. Before writing, ask what the page needs to say and how best to help whoever moves through it.
- Write from the visitor's side. Name things the way they understand them, not the way they are built. Describe what it is or does; do not sell. Being clear beats being clever.
- Active voice. A button says what happens: "Save changes", not "Submit". An action is called the same thing throughout the journey.
- If something fails or is empty, give direction, not cheer: what happened and how to fix it, without apologies or vagueness. An empty screen invites action.
- Conversational tone: simple verbs, capital letter only at the start of a sentence, no filler, adjusted to the brand and the audience. Each text does a single job.
- What is missing is marked `[like this]`, never invented (rule 3).

## Delivery to the Contramaestre
Deliver the site and, separately, a short report with what was **verified**, not what was assumed:
- Contrast: color pairs measured and their ratio (or which ones fail and the proposal).
- Visible keyboard focus: yes or no, and where it was tested.
- Works at 320 px with no horizontal scroll: yes or no.
- Screenshots at 1280 and 390 px reviewed.
- List of pending placeholders `[ ]` and of decisions that belong to the Captain or the client.
- Fonts used, the official source each one came from, its license file saved next to the font, and confirmation that they are self-hosted (no fonts.googleapis.com, no @import url(http…), no <link> to another domain). The skill never downloads fonts: it reuses those already in the project, or the Captain provides them.
- Pasar a: seguridad → check of the delivered folder.
