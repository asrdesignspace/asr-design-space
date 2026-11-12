/* =========================================================
   Tickers (Tech Stack and Testimonials)

   1. Pause / play buttons. Each button names its ticker with
      aria-controls="<ticker id>" and toggles .is-paused on it.

   2. Speed for tickers marked data-ticker-motion (the
      testimonials). The value is the seconds one loop takes; it
      is passed to the CSS animation in testimonials.css, which
      does all the moving. Without JavaScript, the CSS default
      (50s) is used.
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

  // ---------- 2. Speed for the CSS animation ----------
  document.querySelectorAll("[data-ticker-motion]").forEach(function (ticker) {
    var seconds = parseFloat(ticker.getAttribute("data-ticker-motion"));
    if (seconds > 0) ticker.style.setProperty("--t-duration", seconds + "s");
  });
})();
