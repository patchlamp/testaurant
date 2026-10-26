# Testaurant — website (testaurant)

This repo IS the website for Testaurant. There is no dashboard and no CMS. The site is one file,
`site.json`: its words, its sections in order, and its design. `site render testaurant` writes the pages
from it. You change the site by changing `site.json` (or the two places below that are yours to write),
rendering, looking, and publishing. Live at https://testaurant.pages.dev/.

How to talk to the client, how texted photos arrive (`incoming/`, one level
up), and what counts as Taylor's work are all in the workspace `CLAUDE.md`
one level above this repo. This file covers only this site: what is in it,
how to change it, and how to check a change is live.

## What this site is

- Plain HTML/CSS/JS static files. **No frameworks, no build step, no npm, no
  external JS libraries.** If a change seems to need one, find the plain
  way or say it's out of scope.
- **The pages are rendered, never edited by hand.** `index.html` (home: hero, a few dishes from the menu, about, hours), `menu.html` (the whole menu, the basket and the checkout),
  `404.html`, `css/style.css` (the base: colour roles, type scale, spacing, layout), `css/look.css` (the
  look and its fonts), `js/motion.js` and `fonts/` all come out of `site render`. The reason: the markup
  carries the hooks the menu, the basket and checkout, the hours, `/admin`, the site chat and the page count read,
  and when every site was hand-edited those drifted apart until a form stopped working with nobody the
  wiser. Rendering from one file keeps every hook in place whatever the look. A hand edit would also be
  overwritten by the next render, which is why `site publish` and `site doctor` say when a page differs
  from what `site.json` renders.
- **Yours to write:** `site.json`; `css/custom.css` (a small stylesheet of this site's own, about 80
  lines); `custom/<name>.html` (a block of markup the render places where `site.json` says); `images/`.
- This is the **restaurant** template: the menu, its prices and the hours come from the site's own database
  (below), so a price or a dish is a row, not a page edit.
- The header, nav and footer come from the shell the renderer wraps every page in, so they are the same
  on every page without anyone copying them.
- The footer ends with `<p class="patchlamp-badge">Patched by Patchlamp</p>`, one small link back to
  Patchlamp, then the site chat's tag (`https://patchlamp.com/s/site-chat.js`, which answers visitors from
  the workspace's `facts.md`) and the page-load count's (`https://patchlamp.com/hit.js`; `site stats` reads its
  numbers back). The render puts all three on every page with this client's name in `data-site`. Whether the bubble shows is the owner's switch
  on patchlamp.com, so the tag stays even when the chat is off. If the owner would rather not carry the
  badge, put `badge: off` on its own line in the workspace's `NOTES.md`: `site publish` leaves it out of
  the published site.
- `images/` holds the photos. `_headers` and `_redirects` are read by the host, not served: `_headers`
  makes every page `no-cache`; `_redirects` is for a page that moved. Leave both alone otherwise.
- **No trackers, no ads, no cookie banners, no checkout.** The one count is
  patchlamp.com/hit.js: a page load's path and the site that linked to it,
  nothing about the visitor (no cookie, no address, no identifier), so the
  owner sees how many and from where, never who. The only
  forms allowed are the ones that post to patchlamp.com (`newsletter form`
  prints the sign-up box; contact/booking forms follow the workspace
  `PLAYBOOK.md`) or, once the site has a database, to its own `/api/…`
  (below) — nothing else on this site stores visitor information.
- The starter's sample lines (`REPLACE-ME`, "Placeholder: the kitchen, the food, since when.") are in `site.json` until the owner's words replace them; the site isn't indexed
  until they're gone (`site publish --index` refuses while one is on a page). Never invent facts, prices,
  hours or quotes: ask for what you don't have.

## site.json

```json
{
 "schema": 2, "name": "Testaurant", "lang": "en", "mail": "…", "phone": {"text": "…", "href": "tel:…"},
 "cta": {"text": "See the menu", "short": "Menu", "href": "menu.html"},
 "design": {"look": "linen", "images": []},
 "sections": [
  {"type": "hero", "heading": "…", "secondary": {"text": "Hours", "href": "#details"}},
  {"type": "menu", "heading": "The menu", "more": "See the menu", "count": 4, "pick": ["Beef pho", "…"]},
  {"type": "about", "heading": "Who we are", "paragraphs": ["…"]},
  {"type": "details", "heading": "Find us", "where": "…"}
 ]
}
```

- The sections a restaurant uses are `hero` (one, first), `menu` (a few dishes on the home page: `pick` names
  them by their name in the database, else the first `count` on sale; `more` is the button to the whole menu on
  `menu.html`), `about` and `details` (its hours come from the database when the section lists none); any of the
  library's others (`proof`, `gallery`, `cta`, …) and `custom` (below) can join. The order in the list is the
  order on the page. Keep the `menu` section: `menu.html`, the basket and the checkout come with it.
- A text is a plain string, or `{"text": …, "facts": [...]}` as the preview this site may have started
  from wrote it; either renders the same.
- A picture is one entry in `design.images`: `{"id", "src": "images/….jpg", "alt", "class": "client"}`
  plus where it came from (`source`, `licence`) when it isn't the owner's. A section shows it by id
  (`"image": "id"`, or a gallery's `"images": [ids]`). `class` is `client` for the owner's own photos,
  `stock` or `ai` for anything else. The gallery (and any "our work" slot) shows only `client` pictures,
  because a stock photo there would pass someone else's work off as theirs; with none the gallery is
  left out of the page until the owner sends some. A picture's class is also read from the file's own
  record (what `img place` or `img stock` wrote beside it), so calling a stock photo `client` doesn't
  make it one. `alt` says plainly what is in the photo; never leave it empty.

## How to change things

- **Words** (hours, a service, the tagline, a section's heading): edit `site.json`, `site render
  testaurant`, look at it, then the deploy check below. Ask for anything you don't have.
- **A new photo**: from `incoming/` (one level up; texted photos are already converted and resized), one
  call a photo: `img treat incoming/<file> --site repos/testaurant --slot hero|gallery|about --alt "…"`. It
  crops the photo to this look's shape for that place, gives it the look's colour treatment, writes its
  sizes into `images/`, adds it to `design.images` as theirs (`client`, from the file's own record) and
  names its id where it goes. The first photos of their own work turn the gallery and the photos page on.
  The workspace PLAYBOOK (§ Their photos on the site) has the shot list for asking for them.
- **A design change** is one of three things, smallest first. A token: a colour or a font size in
  `css/custom.css` (`:root { --accent: #0b6e8a; }`). The look: `design.look`, one of the looks in the
  toolbelt's `templates/sites/_looks/` (each is a CSS file and a manifest). A section's layout: its
  `"variant"` (on the section, or for every section of that kind in `design.variants`), one of the files
  in `templates/sites/_sections/<section>/`. `site render` names the ones there are when you give one that
  isn't. "Make it feel warmer" is usually a look or a few tokens, not new markup.
- **A one-off** the library doesn't have: `css/custom.css` for style, and for markup a block in
  `custom/<name>.html`, placed with `{"type": "custom", "file": "custom/<name>.html"}` in `sections`. The
  render places it exactly as written, so it has to follow this file's rules on its own (plain HTML, no
  `onclick=`, no `<script src>` from another site), and a picture in it must be one listed in
  `design.images` (the render refuses any other, naming the file). Keep `custom.css` to about 80 lines: past that it is a
  look of its own, and a stylesheet that grows one request at a time is the drift the renderer replaced.
  `site render` says when it is over.
- **When a one-off proves itself** (the owner likes it, it has lasted a few edits, another business could
  use it), ask for it to join the library rather than copying it to another site: note it in the
  workspace's `NOTES.md` (which block, and why it earned its place), say so in the reply, and add
  `FORWARD-TO-TAYLOR: promote custom/<name>.html (or custom.css) from testaurant into the site library`. A session then moves it into `_sections/` or `_looks/` with its hook test and a before-and-after
  screenshot, and every site can use it.
- **A new page**: the renderer makes the home page, `menu.html` and the 404 page. A page of sections of
  its own is an entry in `site.json`'s `pages` (`{"slug", "title", "head": {"heading", "intro"}, "sections": […]}`,
  rendered as `<slug>.html` in the same shell); for anything else, say so plainly and FORWARD-TO-TAYLOR the ask
  with what the page would hold.
- **A link** (Instagram, a booking site, a menu on another service): add it to the `links` of the
  `details` or `contact` section in `site.json` (`{"text": "Instagram", "href": "https://…"}`). Linking out
  is always fine; embedding third-party code is not, except a plain `<iframe>` embed from a service the
  client already uses (a map, a player), which goes in a `custom/` block.
- **Scripts and the security policy (B178):** `_headers` carries a Content
  Security Policy. A `<script>` block in a page is fine (`site publish` hashes
  it in); an `onclick="…"` attribute is blocked, so put the handler in a
  `<script>` block; a `<script src>` from another site is blocked and `site
  publish` says so. Leave the security block in `_headers` alone (`site
  headers` rewrites it).

## The design gate

`site render` runs the design check after it writes the pages (`--no-check` skips it while you work), and
`site publish` runs it again and won't publish a site that fails. The check is code: the fonts load, the
type sizes sit on the scale, text has AA contrast on its background, the phone's first screen has the
heading and one call to action, nothing overflows, focus is visible, reduced motion is honoured, the
pictures have sizes, the page weighs under 1.5 MB, nothing loads from another host, and every hook the
forms and `/admin` need is there. A failure prints the rule and where, for example `FAIL contrast: --ink-dim
on --bg-raised is 3.9:1`. Fix it where it comes from: `site.json`, `css/custom.css` or a `custom/` block,
then render again. Changing the rendered page instead would be overwritten by the next render.

When the design changed since the last publish (the look, a variant, `custom.css`, a `custom/` block), the
publish also asks the design judge: four screenshots, scored against `JUDGE.md`. It may pass, fail with its
notes, or say it is unsure; unsure publishes and goes to a person, so pass its notes on with
`FORWARD-TO-TAYLOR`. Treat a design request as two rounds at most: render, look, fix, render. If the gate
still fails after that, or a rule looks wrong for this business, stop, tell the owner plainly that a person
will finish it, and FORWARD-TO-TAYLOR the findings. That is a good outcome, not a failure: a site published
around the gate is worse than one that waits a day.

## Every change goes live — deploy check

"Done" means live at https://testaurant.pages.dev/, not edited on disk. Relay sessions run from the client workspace one
level up, so git takes the form `git -C repos/testaurant …`; never `cd` into the repo first (that is
always blocked). After any requested change, without waiting to be asked:

1. Render: `site render testaurant`. It writes the pages from `site.json` and runs the design check; read
   what it prints.
2. Look at your work: `shot repos/testaurant/index.html` (add `--mobile` for the phone layout) saves a
   picture under `shots/`; open it with Read. For anything to do with layout or style, also run `shot
   check repos/testaurant/index.html`. Fix what's off in `site.json` and render again before you push.
3. Commit on `main` with a short plain-English message, as two calls:
   `git -C repos/testaurant add -A`, then `git -C repos/testaurant commit -m "…"`.
   Never one `&&` chain (the workspace rule: a chain is refused if any link of it is).
4. Push: `git -C repos/testaurant push`. The repo is the record.
5. Publish: `site publish testaurant`. It runs the design gate, sends exactly what is committed to the
   host and prints the live URL once it is serving (seconds, not minutes). It refuses if anything is
   uncommitted or unpushed, or if the gate fails: fix that and run it again.
6. Confirm the live site serves the change, with exactly this shape (no pipe, no redirect, and no
   `.html` on the end: the host redirects those, so `curl` would read the redirect instead of the page):

       curl -s https://testaurant.pages.dev/PAGE

   (for the home page, `curl -s https://testaurant.pages.dev/`). Read the output and look for the new content yourself. Only
   say it's live once you have seen it there. Every page is served `no-cache`, so a phone that reloads
   sees the new page.

Undo the last change with `git -C repos/testaurant revert HEAD`, push, and publish again. Never
force-push, never rewrite history. This is standing permission from Taylor: don't ask "should I push?"
for anything the client asked for. Do stop if a change would break a rule in this file or delete
something the request didn't clearly ask to delete.

## The server side (only once the site has a database)

A site gets a database with `site data testaurant` (PLAYBOOK § Data). Then
this repo also holds:

- `wrangler.toml` — the binding to this site's own D1 database (`DB`) and
  a few plain settings. Written by `site`; don't edit the binding (`client
  doctor` fails if it stops matching the registry).
- `migrations/NNNN_*.sql` — the tables, applied in order by `db migrate`.
  Never edit one that's applied; add the next number.
- `functions/` — plain JavaScript that Cloudflare runs for `/admin/*` and
  `/api/*` only; every other page stays a static file. `_lib/core.js` is
  shared (the owner's sign-in, page layout); `admin/` is the owner's
  console; `api/<collection>.js` takes a form's posts; `_admin/<name>.js`
  says how `/admin/<name>` shows a list (title, columns, statuses) and
  `_admin/collections.js` lists them. Add a collection with `db add`,
  change a list's title or columns in its `_admin` file, nothing else by
  hand without a reason. No packages, no build step, no secrets in these
  files (the sign-in secret and owner address are Pages secrets).

`site publish` deploys all of it together, so what's live is what's in
git. A new migration goes live with `db migrate` *before* the publish that
needs it. `/admin` pages are never indexed and never cached.

### This site's lists (what's on /admin, and the texts that change them)

| list | table | on the site |
|---|---|---|
| Menu | `products` (a section is `category`) | the dishes on the home page and the whole menu on `menu.html` (from `GET /api/catalog`) |
| Hours | `hours` | the hours box (`data-hours`), on both pages |
| Orders | `orders` | written by `POST /api/checkout`, marked paid by Stripe's webhook |

**The menu reads the database live**: a price, a new dish, sold out, or an
hour is one `db exec … --yes` and no publish (not by SMS, where `db exec`
doesn't run: the owner changes it on `/admin`; the catalog README in claude-tools
`templates/collections/catalog/` has the texts). Prices are in cents. Which dishes
the home page shows is `site.json`'s `pick` (a render and a publish). Taking
payment needs the owner's Stripe key, set by Taylor (`site checkout`); until
then the button says "Checkout opens once Stripe is connected".

## The email address

The Contact block's `<a data-mail href="mailto:…">…</a>` is the address
Patch answers for this business (`<slug>@mail.patchlamp.com`, or
`hello@` their own domain). Keep the `data-mail` attribute on it and don't
type an address into it by hand: `site mail testaurant` rewrites every
`data-mail` link from the mailbox on patchlamp.com, commits, pushes and
publishes. Another address the owner gives you (their own inbox) goes in a
plain `mailto:` link beside it.

## Hosting (for Taylor)

Cloudflare Pages, one project per site, published by `site publish` from
the committed tree of this repo's `main` (direct upload; no build, no
Cloudflare-side git connection). The repo is on GitHub under `patchlamp`
and stays the record; the host is a mirror of it. A custom domain is
`SITE_ADMIN=1 site domain testaurant example.com` from the workspace (adds
the domain to the project, puts canonical links on every page, prints the
two DNS lines for the registrar). Handing the repo to the
client at the end is `site transfer testaurant <their-github-user>`.
