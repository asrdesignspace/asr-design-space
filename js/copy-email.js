/* =========================================================
   Copy email on click

   Any link with data-copy-email="address" copies that address
   to the clipboard instead of opening the email app, then shows
   a short "Copied!" bubble. If copying isn't possible, the link
   falls back to its normal mailto: behaviour.
   ========================================================= */

(function () {
  "use strict";

  var SHOW_FOR = 2000; // ms the "Copied!" bubble stays visible

  // Older-browser fallback: copy from a temporary hidden text box
  function legacyCopy(text) {
    var box = document.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(box);
    return ok;
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(
        function () { return true; },
        function () { return legacyCopy(text); }
      );
    }
    return Promise.resolve(legacyCopy(text));
  }

  document.querySelectorAll("[data-copy-email]").forEach(function (link) {
    var address = link.getAttribute("data-copy-email");
    var status = link.parentNode.querySelector("[data-copy-status]");
    var timer;

    link.addEventListener("click", function (event) {
      event.preventDefault();
      copy(address).then(function (ok) {
        if (!ok) {
          window.location.href = link.href; // could not copy: open the email app instead
          return;
        }
        link.classList.add("is-copied");
        if (status) status.textContent = "Email address copied to clipboard.";
        clearTimeout(timer);
        timer = setTimeout(function () {
          link.classList.remove("is-copied");
          if (status) status.textContent = "";
        }, SHOW_FOR);
      });
    });
  });
})();
