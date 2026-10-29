/* =========================================================
   Tickers (Tech Stack and Testimonials)

   1. Pause / play buttons. Each button names its ticker with
      aria-controls="<ticker id>" and toggles .is-paused on it.

   2. Script-driven motion for tickers marked data-ticker-motion
      (the testimonials). The whole strip moves as ONE piece, so
      the two copies of the cards can never drift apart and leave
      a gap (which iPhone/iPad Safari did with two separate CSS
      animations). The value is the seconds one loop takes.
      Without JavaScript, the CSS animation in testimonials.css
      runs instead.
   ========================================================= */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ---------- 1. Pause / play buttons ----------
  document.querySelectorAll("[data-ticker-pause]").forEach(function (button) {
    var ticker = document.getElementById(button.getAttribute("aria-controls"));
    if (!ticker) return;

    var label = button.querySelector(".visually-hidden");
    var pauseText = label.textContent;                      // e.g. "Pause the testimonials animation"
    var playText = pauseText.replace(/^Pause/, "Play");

    button.addEventListener("click", function () {
      var paused = ticker.classList.toggle("is-paused");
      button.setAttribute("aria-pressed", String(paused));
      label.textContent = paused ? playText : pauseText;
    });

    button.hidden = false;
  });

  // ---------- 2. Script-driven motion ----------
  document.querySelectorAll("[data-ticker-motion]").forEach(function (ticker) {
    var track = ticker.firstElementChild;                   // the strip holding both copies
    var list = track && track.querySelector("ul");          // one copy of the cards
    var seconds = parseFloat(ticker.getAttribute("data-ticker-motion")) || 50;
    if (!list || !window.requestAnimationFrame) return;

    var distance = 0;     // width of one copy, including the gap after it
    var x = 0;            // how far the strip has moved
    var last = null;      // time of the previous frame
    var hovered = false;  // a real mouse is over the cards
    var visible = true;   // the ticker is on screen

    ticker.classList.add("is-js");                          // switches the CSS animation off

    function measure() {
      distance = list.getBoundingClientRect().width;
      if (distance) x = x % distance;
    }

    function running() {
      return !reduceMotion.matches && !hovered && visible && !document.hidden &&
        !ticker.classList.contains("is-paused") && distance > 0;
    }

    function frame(now) {
      if (last !== null && running()) {
        var dt = Math.min(now - last, 100);                 // no jump after a background tab
        x = (x + dt * distance / (seconds * 1000)) % distance; // one copy per loop, same speed as before
      }
      last = now;
      track.style.transform = reduceMotion.matches ? "" : "translate3d(" + (-x) + "px, 0, 0)";
      window.requestAnimationFrame(frame);
    }

    // pause while a mouse is over the cards (touch taps don't count, so it never "sticks" on iPhone/iPad)
    ticker.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hovered = true; });
    ticker.addEventListener("pointerleave", function () { hovered = false; });

    // keep the loop exact when the cards change size (rotation, window resize, fonts loading)
    if ("ResizeObserver" in window) new ResizeObserver(measure).observe(list);
    window.addEventListener("resize", measure);
    measure();

    // don't spend battery while it's off screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; }).observe(ticker);
    }

    window.requestAnimationFrame(frame);
  });
})();
