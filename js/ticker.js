/* =========================================================
   Tickers (Tech Stack and Testimonials)

   1. Pause / play buttons. Each button names its ticker with
      aria-controls="<ticker id>" and toggles .is-paused on it.

   2. Same speed on every screen for tickers marked
      data-ticker-speed (the testimonials). The value is pixels
      per second. Cards are narrower on phones, so one loop is
      shorter there; this measures one set of cards and sets the
      loop time (--t-duration) to match. The CSS animation in
      testimonials.css does all the moving — no timers here.
      Without JavaScript, the CSS fallback times are used.
   ========================================================= */

(function () {
  "use strict";

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

  // ---------- 2. Same speed on every screen ----------
  document.querySelectorAll("[data-ticker-speed]").forEach(function (ticker) {
    var speed = parseFloat(ticker.getAttribute("data-ticker-speed")); // pixels per second
    var list = ticker.querySelector("ul");                            // one full set of cards
    if (!(speed > 0) || !list) return;

    function setDuration() {
      var width = list.getBoundingClientRect().width;                 // one set, including its trailing gap
      if (width > 0) ticker.style.setProperty("--t-duration", (width / speed).toFixed(2) + "s");
    }

    setDuration();
    // runs again only when the cards change size (window resize, phone rotation)
    if ("ResizeObserver" in window) new ResizeObserver(setDuration).observe(list);
    else window.addEventListener("resize", setDuration);
  });
})();
