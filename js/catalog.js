/* catalog.js: a catalogue site's live parts, from /api/catalog (the catalog collection, templates/collections/catalog).
   [data-catalog-strip] on the home page: a few of the products (data-pick names them, "|"-separated; else the first
   data-count on sale). [data-shop] on menu.html / shop.html: every product by section, a basket and Stripe Checkout
   through /api/checkout. [data-hours]: the pickup or opening hours, and whether it is open now. The page reads the
   database as it loads, so a price, a sold-out or an hour changed on /admin or by text is on the site at once. */
(function () {
  var T = {"basket_empty": "Nothing in the basket yet.", "open_now": "Open now", "closed_now": "Closed now", "hours_soon": "Hours coming soon.", "closed": "closed", "nothing_yet": "Nothing here yet.", "failed": "This didn't load. Please try again in a minute.", "sold_out": "Sold out", "pay_off_now": "Paying online isn't switched on yet.", "went_wrong": "That didn't go through.", "reach_you": "Leave an email or a phone so we can reach you.", "pay_live": "Pay and pick up", "pay_test": "Pay (Stripe test mode — no real charge)", "pay_off": "Checkout opens once Stripe is connected", "note_live": "Payment is by Stripe Checkout.", "note_test": "This is Stripe's test mode: use card 4242 4242 4242 4242, any future date, any code. Nothing is charged.", "note_off": "Paying online isn't connected yet: fill a basket if you like, but nothing is charged and no order is taken until it is.", "try_again": "That didn't go through. Please try again.", "one_fewer": "One fewer ", "one_more": "One more ", "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]};   /* the built-in lines, in the site's language (lib/sitegen.py STRINGS) */
  var strip = document.querySelector("[data-catalog-strip]"), root = document.querySelector("[data-shop]");
  var hoursEls = document.querySelectorAll("[data-hours]");
  var order = (location.search.match(/[?&]order=(paid|cancelled)/) || [])[1];
  /* Stripe sends the shopper back to the home page (/?order=paid, the catalog collection's functions/api/checkout.js),
     and the thanks or the cancelled line sits on the catalogue's own page: the home page passes the answer on there
     (data-page on the strip names it), so a paid order never comes back to a page that says nothing */
  if (order && !root && strip && strip.getAttribute("data-page")) {
    location.replace(strip.getAttribute("data-page") + location.search);
    return;
  }
  if (!strip && !root && !hoursEls.length) return;
  var DAYS = T.days;      /* the site's language's day names (sitegen.UI_STRINGS catalog.days), Sunday first */
  function money(c) { return "$" + (c / 100).toFixed(2); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function clock(t) { var p = t.split(":"), h = +p[0], m = p[1]; return (h % 12 || 12) + (m === "00" ? "" : ":" + m) + (h < 12 ? "am" : "pm"); }
  function hoursBox(h, hours, open) {
    h.textContent = "";
    if (!hours.length) { h.appendChild(el("p", "muted", T.hours_soon)); return; }
    h.appendChild(el("p", "open-now " + (open ? "is-open" : "is-closed"), open ? T.open_now : T.closed_now));
    var ul = el("ul", "hours");
    DAYS.forEach(function (name, i) {
      var today = hours.filter(function (x) { return +x.weekday === i; });
      ul.appendChild(el("li", null, name.slice(0, 3) + ": " + (today.length ? today.map(function (x) { return clock(x.opens) + "–" + clock(x.closes) + (x.note ? " (" + x.note + ")" : ""); }).join(", ") : T.closed)));
    });
    h.appendChild(ul);
  }
  function item(p, cls) {
    var li = el("li", cls + (p.status === "sold out" ? " is-sold-out" : ""));
    var text = el("div", "shop-text");
    var head = el("p", "shop-name"); head.appendChild(el("span", null, p.name)); head.appendChild(el("span", "price", money(p.price_cents)));
    text.appendChild(head);
    if (p.description) text.appendChild(el("p", "muted", p.description));
    li.appendChild(text);
    if (p.status === "sold out") li.appendChild(el("span", "shop-out", T.sold_out));
    return li;
  }
  function fillStrip(products) {
    strip.textContent = "";
    var want = (strip.getAttribute("data-pick") || "").split("|").filter(Boolean);
    var n = +(strip.getAttribute("data-count") || 4);
    var picked = want.length ? want.map(function (w) { return products.filter(function (p) { return p.name === w; })[0]; }).filter(Boolean) : [];
    if (!picked.length) picked = products.filter(function (p) { return p.status !== "sold out"; }).concat(products.filter(function (p) { return p.status === "sold out"; }));
    picked.slice(0, n).forEach(function (p) {
      var li = item(p, "catalog-item");
      if (p.category) li.insertBefore(el("p", "catalog-cat", p.category), li.firstChild);
      strip.appendChild(li);
    });
    if (!strip.children.length) strip.appendChild(el("li", "muted", T.nothing_yet));
  }
  function shop(data) {
    var box = root.querySelector("[data-products]"), form = root.querySelector("[data-checkout]");
    var pay = root.querySelector("[data-pay]"), payNote = root.querySelector("[data-pay-note]");
    var basketLine = root.querySelector("[data-basket]"), err = root.querySelector("[data-error]");
    var basket = {}, products = {}, mode = data.checkout;
    function refresh() {
      var lines = [], total = 0, n = 0;
      Object.keys(basket).forEach(function (id) {
        var q = basket[id], p = products[id]; if (!q || !p) return;
        lines.push(q + " × " + p.name); total += q * p.price_cents; n += q;
        var c = box.querySelector('[data-qty="' + id + '"]'); if (c) c.textContent = q;
      });
      box.querySelectorAll("[data-qty]").forEach(function (c) { if (!basket[c.getAttribute("data-qty")]) c.textContent = "0"; });
      basketLine.textContent = n ? lines.join(", ") + " — " + money(total) : T.basket_empty;
      pay.disabled = !n || mode === "off";
    }
    function step(id, d) { basket[id] = Math.max(0, Math.min(20, (basket[id] || 0) + d)); refresh(); }
    box.textContent = "";
    pay.textContent = mode === "live" ? T.pay_live : mode === "test" ? T.pay_test : T.pay_off;
    payNote.textContent = mode === "live" ? T.note_live : mode === "test" ? T.note_test : T.note_off;
    if (!data.products.length) { box.appendChild(el("p", "muted", T.nothing_yet)); return; }
    var section = null, last = null;
    data.products.forEach(function (p) {
      products[p.id] = p;
      if (p.category !== last) { box.appendChild(el("h3", "shop-section", p.category || "")); section = el("ul", "shop-list"); box.appendChild(section); last = p.category; }
      var li = item(p, "shop-item");
      if (p.status !== "sold out") {
        var ctl = el("span", "shop-qty");
        var minus = el("button", null, "−"); minus.type = "button"; minus.setAttribute("aria-label", T.one_fewer + p.name); minus.onclick = function () { step(p.id, -1); };
        var plus = el("button", null, "+"); plus.type = "button"; plus.setAttribute("aria-label", T.one_more + p.name); plus.onclick = function () { step(p.id, 1); };
        var n = el("span", null, "0"); n.setAttribute("data-qty", p.id); n.setAttribute("aria-live", "polite");
        ctl.appendChild(minus); ctl.appendChild(n); ctl.appendChild(plus); li.appendChild(ctl);
      }
      section.appendChild(li);
    });
    refresh();
    form.addEventListener("submit", function (e) {
      e.preventDefault(); err.hidden = true;
      var f = new FormData(form), items = Object.keys(basket).filter(function (id) { return basket[id]; }).map(function (id) { return { id: +id, qty: basket[id] }; });
      if (!f.get("email") && !f.get("phone")) { err.textContent = T.reach_you; err.hidden = false; return; }
      pay.disabled = true;
      fetch("/api/checkout", { method: "POST", headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({ items: items, name: f.get("name"), email: f.get("email"), phone: f.get("phone"), note: f.get("note") }) })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.url) location.href = d.url; else { err.textContent = d.checkout === "off" ? T.pay_off_now : (d.error || T.went_wrong); err.hidden = false; refresh(); } })
        .catch(function () { err.textContent = T.try_again; err.hidden = false; refresh(); });
    });
  }
  if (root && order) root.querySelector('[data-order="' + order + '"]').hidden = false;
  fetch("/api/catalog", { headers: { accept: "application/json" } })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      hoursEls.forEach(function (h) { hoursBox(h, data.hours || [], data.open_now); });
      if (strip) fillStrip(data.products || []);
      if (root) shop(data);
    })
    .catch(function () {
      var say = function (box) { box.textContent = ""; box.appendChild(el(box.tagName === "UL" ? "li" : "p", "muted", T.failed)); };
      if (strip) say(strip);
      if (root) say(root.querySelector("[data-products]"));
      hoursEls.forEach(say);
    });
})();
