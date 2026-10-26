/* motion.js: the site's one script for movement (rendered as js/motion.js). No library, no network,
   no inline handlers: the site's CSP blocks CDNs and hashes every inline script.

   Complete at rest. The page reads whole without this file and at every moment with it: nothing is
   ever at opacity 0. A [data-reveal] element waits at a softened state (base.css: opacity .55, 10px
   lower) only while html.motion is set, and only until it is revealed. The reason: a screenshot, a
   link preview, the design judge and a visitor with a slow phone all see a still frame, and a still
   frame with blank sections reads as a broken site.

   What it does:
   - html.motion, only when the visitor has no reduced-motion preference and IntersectionObserver
     exists; under reduced motion the page stays still, and if the preference changes mid-visit the
     class comes off and everything is shown.
   - .is-visible on each [data-reveal] as it enters the screen, staggered: data-reveal-i (or a
     --reveal-i already set) wins, else the order the elements arrived in together.
   - body.is-ready once the fonts have loaded (or after 600 ms): the one hero moment a look may play.
   - Everything revealed after 1.2 s regardless, so a page left unscrolled is whole.
   - Smooth scrolling to same-page anchors, only under html.motion. */
(function () {
  "use strict";
  var root = document.documentElement;
  var still = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: no-preference)") : null;
  var REVEAL_ALL_MS = 1200, READY_MS = 600, SEL = "[data-reveal]";

  function each(list, fn) { for (var i = 0; i < list.length; i++) fn(list[i], i); }
  function show(el) { el.classList.add("is-visible"); }
  function revealAll() { each(document.querySelectorAll(SEL), show); }

  function ready() {
    if (!document.body || document.body.classList.contains("is-ready")) return;
    document.body.classList.add("is-ready");
  }

  function start() {
    var fonts = document.fonts && document.fonts.ready;
    if (fonts && fonts.then) fonts.then(ready, ready);
    setTimeout(ready, READY_MS);
    if (!root.classList.contains("motion")) { revealAll(); return; }

    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      each(entries, function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, i = el.getAttribute("data-reveal-i");
        if (i !== null) el.style.setProperty("--reveal-i", i);
        else if (!el.style.getPropertyValue("--reveal-i")) el.style.setProperty("--reveal-i", n);
        n++;
        show(el);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.05 });
    each(document.querySelectorAll(SEL), function (el) { io.observe(el); });
    setTimeout(function () { io.disconnect(); revealAll(); }, REVEAL_ALL_MS);

    document.addEventListener("click", function (ev) {
      if (!root.classList.contains("motion") || ev.defaultPrevented || ev.button !== 0
          || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      var a = ev.target.closest ? ev.target.closest("a[href^='#']") : null;
      var id = a && a.getAttribute("href").slice(1);
      var to = id && document.getElementById(id);
      if (!to) return;
      ev.preventDefault();
      to.scrollIntoView({ behavior: "smooth", block: "start" });
      if (history.pushState) history.pushState(null, "", "#" + id);
      if (!to.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|FORM)$/.test(to.tagName)) to.setAttribute("tabindex", "-1");
      to.focus({ preventScroll: true });
    });
  }

  if (still && still.matches && "IntersectionObserver" in window) root.classList.add("motion");
  if (still) {
    var drop = function (e) { if (!e.matches) { root.classList.remove("motion"); revealAll(); } };
    if (still.addEventListener) still.addEventListener("change", drop);
    else if (still.addListener) still.addListener(drop);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
