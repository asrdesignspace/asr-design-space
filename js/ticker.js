/* =========================================================
   Tickers (Tech Stack and Testimonials): pause / play buttons

   The scrolling itself is pure CSS (css/about.css and
   css/testimonials.css). This script only wires up each pause
   button, so anyone can stop the moving content, as
   accessibility guidelines ask. Each button names its ticker
   with aria-controls="<ticker id>".
   ========================================================= */

(function () {
  "use strict";

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
})();
