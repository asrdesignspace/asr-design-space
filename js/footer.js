/* =========================================================
   Footer: keep the copyright year current.
   The HTML already contains a year, so the text is still
   correct if JavaScript does not run.
   ========================================================= */
(function () {
  "use strict";
  var year = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = year;
  });
})();
