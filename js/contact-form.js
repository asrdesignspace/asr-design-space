/* =========================================================
   Contact form (vanilla JS, no libraries)

   Sends the form to the address in the form's `action`
   (a Formspree endpoint) and shows the result on the page.

   - Checks every required field and the email format first.
   - Blocks double-clicks while sending and shows a spinner.
   - Shows "sent" only when the service confirms it.
   - On failure, keeps everything the visitor typed and
     offers the email address as a fallback.
   - Without JavaScript the browser's own validation runs and
     the form posts straight to Formspree.
   ========================================================= */

(function () {
  "use strict";

  var form = document.querySelector("[data-contact-form]");
  if (!form) return;

  var CONTACT_EMAIL = "hello@asrdesignspace.com";
  var TIMEOUT_MS = 15000;
  var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  var submitBtn = form.querySelector(".form-submit");
  var submitLabel = form.querySelector(".form-submit__label");
  var statusBox = form.querySelector(".form-status");
  var sending = false;
  var triedOnce = false; // show errors live only after the first attempt

  // JavaScript takes over validation so messages match the site's style
  form.setAttribute("novalidate", "");

  // ---------- Validation ----------
  var rules = {
    name: function (v) {
      if (!v) return "Please enter your name.";
      if (v.length < 2) return "Please enter at least 2 characters.";
      return "";
    },
    email: function (v) {
      if (!v) return "Please enter your email address.";
      if (!EMAIL_PATTERN.test(v)) return "Please enter a valid email address, like you@example.com.";
      return "";
    },
    subject: function (v) {
      if (!v) return "Please tell me what your message is about.";
      if (v.length < 3) return "Please enter at least 3 characters.";
      return "";
    },
    message: function (v) {
      if (!v) return "Please write a message.";
      if (v.length < 10) return "Please add a little more detail (at least 10 characters).";
      return "";
    }
  };

  function fieldValue(name) {
    var el = form.elements[name];
    return el ? String(el.value).trim() : "";
  }

  function showFieldError(name, message) {
    var input = form.elements[name];
    var wrap = input.closest(".field");
    var errorEl = document.getElementById(input.id + "-error");
    wrap.classList.toggle("is-invalid", Boolean(message));
    if (message) {
      input.setAttribute("aria-invalid", "true");
    } else {
      input.removeAttribute("aria-invalid");
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = !message;
    }
  }

  function validateField(name) {
    var message = rules[name](fieldValue(name));
    showFieldError(name, message);
    return !message;
  }

  function validateAll() {
    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      if (!validateField(name) && !firstInvalid) firstInvalid = form.elements[name];
    });
    return firstInvalid;
  }

  // Re-check a field as the visitor fixes it
  Object.keys(rules).forEach(function (name) {
    var el = form.elements[name];
    el.addEventListener("input", function () {
      if (triedOnce || el.getAttribute("aria-invalid") === "true") validateField(name);
    });
    el.addEventListener("blur", function () {
      if (triedOnce) validateField(name);
    });
  });

  // ---------- Status message ----------
  function setStatus(type, html) {
    statusBox.className = "form-status form-status--" + type;
    statusBox.innerHTML = html;
    statusBox.hidden = false;
  }

  function clearStatus() {
    statusBox.hidden = true;
    statusBox.textContent = "";
  }

  var fallback = ' You can also email me directly at <a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + "</a>.";

  function setSending(on) {
    sending = on;
    submitBtn.disabled = on;
    submitBtn.classList.toggle("is-loading", on);
    form.setAttribute("aria-busy", String(on));
    submitLabel.textContent = on ? "Sending…" : "Send Message";
  }

  // ---------- Submit ----------
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (sending) return; // ignore repeat clicks

    triedOnce = true;
    clearStatus();

    var firstInvalid = validateAll();
    if (firstInvalid) {
      setStatus("error", "Please fix the highlighted fields and try again.");
      firstInvalid.focus();
      return;
    }

    // The Formspree endpoint lives in the form's action attribute (contact/index.html)
    var endpoint = form.getAttribute("action");

    setSending(true);

    var data = new FormData(form);
    // trim the text fields before sending
    ["name", "email", "subject", "message"].forEach(function (n) { data.set(n, fieldValue(n)); });
    // Subject line of the email Formspree sends you (Formspree's special _subject field).
    // Formspree also uses the "email" field as the Reply-To address, so you can reply directly.
    data.set("_subject", "New message from asrdesignspace.com: " + fieldValue("subject"));

    var controller = "AbortController" in window ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, TIMEOUT_MS) : null;

    fetch(endpoint, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) {
        if (response.ok) return { ok: true };
        return response.json().then(
          function (body) { return { ok: false, body: body }; },
          function () { return { ok: false, body: null }; }
        );
      })
      .then(function (result) {
        if (result.ok) {
          form.reset();
          triedOnce = false;
          Object.keys(rules).forEach(function (n) { showFieldError(n, ""); });
          setStatus("success", "Thank you! Your message has been sent. I'll get back to you within 1–2 business days.");
        } else {
          var detail = "";
          if (result.body && Array.isArray(result.body.errors) && result.body.errors.length) {
            detail = " (" + result.body.errors.map(function (e) { return e.message; }).join(" ") + ")";
          }
          setStatus("error", "Sorry, your message couldn't be sent" + escapeHtml(detail) + ". Your details are still here, so please try again." + fallback);
        }
      })
      .catch(function (err) {
        var why = err && err.name === "AbortError"
          ? "The request took too long."
          : "It looks like there was a connection problem.";
        setStatus("error", "Sorry, your message wasn't sent. " + why + " Your details are still here, so please try again." + fallback);
      })
      .then(function () {
        clearTimeout(timer);
        setSending(false);
      });
  });

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
})();
