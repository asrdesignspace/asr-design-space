/* =========================================================
   Mobile navigation toggle
   ========================================================= */

(function () {
  "use strict";

  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");
  if (!toggle || !menu) return;

  var label = toggle.querySelector(".visually-hidden");

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    if (label) label.textContent = open ? "Close menu" : "Open menu";
  }

  toggle.addEventListener("click", function () {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  // Close after choosing a link
  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });

  // Close with Escape and return focus to the button
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });

  // Reset when resizing back up to desktop
  window.matchMedia("(min-width: 901px)").addEventListener("change", function (mq) {
    if (mq.matches) setOpen(false);
  });
})();
