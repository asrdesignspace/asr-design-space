/* =========================================================
   Entrance & scroll animations (used on every page)
   ---------------------------------------------------------
   1. When a page opens, the pieces of its first section
      (title, text, buttons, image) rise into place one by one.
   2. Further down, each block fades up as it scrolls into view.
      Cards in a grid or list arrive in a short cascade.

   The blocks are found automatically from the page layout,
   so new pages and case studies animate without extra work:
   - side-by-side columns animate separately
   - cards in a grid or list animate one after another
   - anything else animates as one block
   - moving parts (tickers, sliders) animate as a whole
   To keep an element still, add data-reveal="off" to it.

   The look (distance, speed, easing) is set in
   css/animations.css. Each element animates once; afterwards
   its data-reveal mark is removed so its own styles, such as
   hover effects, apply exactly as before.
   ========================================================= */

(function () {
  "use strict";

  var root = document.documentElement;
  var main = document.querySelector("main");
  var STAGGER_MS = 90;   // pause between blocks that arrive together
  var MAX_STEPS = 6;     // longest cascade: 6 steps, then the rest arrive together

  function showPage() {
    root.classList.add("motion-ready");
  }

  // No animation: "reduce motion" is on, the head script did not run,
  // or the browser is too old. Everything simply shows.
  if (!root.classList.contains("js-motion") || !main ||
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    showPage();
    return;
  }

  // If the 3-second safety timer already showed the page,
  // leave whatever is on screen alone and only animate what is below.
  var startedLate = root.classList.contains("motion-ready");

  // ---------- 1. Find the blocks to animate ----------
  var LEAF_TAGS = /^(P|H[1-6]|A|BUTTON|FORM|TABLE|BLOCKQUOTE|DL|PICTURE|FIGURE|IMG|VIDEO|SVG|IFRAME)$/;
  var MEDIA_TAGS = /^(PICTURE|FIGURE|IMG|VIDEO|SVG)$/;
  var MOVING = "[data-ticker], [data-slider], [class*='ticker'], [class*='slider'], [class*='carousel'], [class*='marquee']";
  var targets = [];

  // Elements that should never be animated or measured
  function isIgnored(el) {
    if (el.hidden || el.getAttribute("data-reveal") === "off") return true;
    if (/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT|BR)$/.test(el.tagName)) return true;
    var cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return true;
    if (cs.position === "absolute" || cs.position === "fixed") return true; // decorations
    if (parseFloat(cs.opacity) < 1) return true;                           // already see-through on purpose
    var r = el.getBoundingClientRect();
    return r.width < 4 || r.height < 4;                                     // empty or screen-reader-only
  }

  function visibleChildren(el) {
    return Array.prototype.filter.call(el.children, function (c) { return !isIgnored(c); });
  }

  function isLeaf(el) {
    return LEAF_TAGS.test(el.tagName.toUpperCase()) || el.matches(MOVING) ||
      /auto|scroll/.test(getComputedStyle(el).overflowX);
  }

  // Two to four tall blocks placed side by side (e.g. text column + image)
  function isRow(kids) {
    if (kids.length < 2 || kids.length > 4) return false;
    var prev = null;
    return kids.every(function (k) {
      var r = k.getBoundingClientRect();
      var ok = r.height >= 60 && (!prev || (Math.abs(r.top - prev.top) < 48 && r.left >= prev.right - 4));
      prev = r;
      return ok;
    });
  }

  // A list or grid of card-sized items
  function isCardList(el, kids) {
    if (kids.length < 2 || kids.length > 30) return false;
    var big = kids.filter(function (k) {
      var r = k.getBoundingClientRect();
      return r.height >= 56 && r.width >= 100;
    });
    if (big.length < kids.length * 0.75) return false;
    if (/^(UL|OL)$/.test(el.tagName)) return true;
    // other grids: at least two items share a row
    var top0 = kids[0].getBoundingClientRect().top;
    return Math.abs(kids[1].getBoundingClientRect().top - top0) < 4;
  }

  function mark(el) {
    if (startedLate && el.getBoundingClientRect().top < window.innerHeight) return;
    var onlyChild = el.children.length === 1 ? el.children[0] : null;
    var kind = "up";
    if (MEDIA_TAGS.test(el.tagName.toUpperCase()) ||
        (onlyChild && MEDIA_TAGS.test(onlyChild.tagName.toUpperCase()) && !el.textContent.trim())) {
      kind = "media";
    }
    if (getComputedStyle(el).transform !== "none") kind = "fade"; // keep its own transform
    targets.push({ el: el, kind: kind });
  }

  // Any block below the page's opening section
  function planBlock(el, depth) {
    if (isIgnored(el)) return;
    var kids = visibleChildren(el);
    if (depth > 4 || !kids.length || isLeaf(el)) { mark(el); return; }
    if (isCardList(el, kids)) { kids.forEach(mark); return; }
    if (isRow(kids)) { kids.forEach(function (k) { planBlock(k, depth + 1); }); return; }
    mark(el);
  }

  // The opening section: split the part holding the page title into its pieces
  function planOpening(el, depth) {
    if (isIgnored(el)) return;
    var h1 = el.querySelector("h1");
    var kids = visibleChildren(el);
    if (!h1 || depth > 6 || !kids.length || isLeaf(el)) { planBlock(el, depth); return; }
    kids.forEach(function (k) {
      if (k === h1) mark(k);
      else if (k.contains(h1)) planOpening(k, depth + 1);
      else planBlock(k, depth + 1);
    });
  }

  // Top-level sections of the page (inside a case-study <article>, its parts)
  function sections() {
    var list = [];
    visibleChildren(main).forEach(function (el) {
      if (el.tagName === "ARTICLE") list = list.concat(visibleChildren(el));
      else list.push(el);
    });
    return list;
  }

  // Step through single wrappers (e.g. section > .container) to reach the content
  function contentOf(section) {
    var el = section, kids = visibleChildren(el), steps = 0;
    while (kids.length === 1 && !isLeaf(kids[0]) && steps < 3) {
      el = kids[0]; kids = visibleChildren(el); steps++;
    }
    return kids.length ? kids : [el];
  }

  // ---------- 2. Animate each block as it comes into view ----------
  function durationMs() {
    var v = getComputedStyle(root).getPropertyValue("--reveal-duration").trim();
    var n = parseFloat(v) || 0.7;
    return /ms$/.test(v) ? n : n * 1000;
  }

  function finish(el) {
    el.removeAttribute("data-reveal");
    el.classList.remove("is-revealed");
    el.style.removeProperty("--reveal-delay");
  }

  function start() {
    sections().forEach(function (section, i) {
      if (section.getAttribute("data-reveal") === "off") return;
      if (i === 0) planOpening(section, 0);
      else contentOf(section).forEach(function (el) { planBlock(el, 1); });
    });

    var duration = durationMs();
    var observer = new IntersectionObserver(function (entries) {
      // Blocks that appear together arrive one after another, in page order
      var arriving = entries.filter(function (e) { return e.isIntersecting; })
        .map(function (e) { return e.target; })
        .sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });

      arriving.forEach(function (el, i) {
        var delay = Math.min(i, MAX_STEPS) * STAGGER_MS;
        observer.unobserve(el);
        el.style.setProperty("--reveal-delay", delay + "ms");
        el.classList.add("is-revealed");
        setTimeout(function () { finish(el); }, delay + duration + 100);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });

    targets.forEach(function (t) {
      t.el.setAttribute("data-reveal", t.kind);
    });

    // Let the browser draw the starting position once before watching,
    // so blocks already on screen (the page opening) animate in too
    // instead of appearing straight away.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        targets.forEach(function (t) { observer.observe(t.el); });
      });
    });

    // Blocks skipped over (a fast fling, the End key, a link further down)
    // never "come into view", so show anything already above the screen
    // straight away. This check stops once every block has appeared.
    var waiting = targets.map(function (t) { return t.el; });
    var queued = false;
    function showSkipped() {
      queued = false;
      waiting = waiting.filter(function (el) {
        if (!el.hasAttribute("data-reveal") || el.classList.contains("is-revealed")) return false;
        if (el.getBoundingClientRect().bottom > 0) return true;
        observer.unobserve(el);
        finish(el);
        return false;
      });
      if (!waiting.length) window.removeEventListener("scroll", onScroll);
    }
    function onScroll() {
      if (!queued) { queued = true; requestAnimationFrame(showSkipped); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // also covers a page opened part-way down
  }

  try {
    start();
  } catch (error) {
    // Something unexpected: show everything without animation
    targets.forEach(function (t) { finish(t.el); });
  } finally {
    showPage();
  }
})();
