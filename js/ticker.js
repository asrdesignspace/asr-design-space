/* =========================================================
   Tech stack ticker: pause / play button

   The scrolling itself is pure CSS (css/about.css). This script
   only adds the pause button, so anyone can stop the moving
   icons, as accessibility guidelines ask for moving content.
   ========================================================= */

(function () {
  "use strict";

  var ticker = document.querySelector("[data-ticker]");
  var button = document.querySelector("[data-ticker-pause]");
  if (!ticker || !button) return;

  var label = button.querySelector(".visually-hidden");

  button.addEventListener("click", function () {
    var paused = ticker.classList.toggle("is-paused");
    button.setAttribute("aria-pressed", String(paused));
    label.textContent = paused ? "Play the tech stack animation" : "Pause the tech stack animation";
  });

  button.hidden = false;
})();
