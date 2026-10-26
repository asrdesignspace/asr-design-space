/* =========================================================
   Typewriter effect (vanilla JS, no libraries)

   Markup:
   <span class="typewriter" data-phrases="One|Two|Three">
     <span class="typewriter__line">
       <span class="typewriter__text"></span><span class="typewriter__cursor"></span>
     </span>
   </span>

   - Types one character at a time, pauses, deletes, moves on, loops.
   - Reserves the width of the longest phrase, so the layout never shifts.
   - Pauses while the tab is hidden (saves battery).
   - With "reduce motion" turned on, shows all phrases as static text.
   ========================================================= */

(function () {
  "use strict";

  // Timing (milliseconds), tuned to feel natural rather than robotic
  var TIMING = {
    typeBase: 75,       // average delay per typed character
    typeJitter: 45,     // random variation so it feels human
    deleteSpeed: 38,    // deleting is quicker than typing
    holdAfterType: 1900,  // pause to read the full phrase
    holdAfterDelete: 450, // short beat before the next phrase
    startDelay: 900     // let the page settle first
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function Typewriter(root) {
    this.root = root;
    this.textEl = root.querySelector(".typewriter__text");
    this.phrases = (root.getAttribute("data-phrases") || "")
      .split("|")
      .map(function (p) { return p.trim(); })
      .filter(Boolean);

    this.phraseIndex = 0;
    this.charIndex = this.phrases[0] ? this.phrases[0].length : 0; // first phrase is already in the HTML
    this.deleting = false;
    this.timer = null;
    this.running = false;

    if (!this.textEl || this.phrases.length === 0) return;

    this.addSizer();
    this.bindEvents();
    this.applyMotionPreference();
  }

  // Invisible copy of the longest phrase that holds the space open
  Typewriter.prototype.addSizer = function () {
    var longest = this.phrases.reduce(function (a, b) {
      return b.length > a.length ? b : a;
    }, "");
    this.sizer = document.createElement("span");
    this.sizer.className = "typewriter__sizer";
    this.sizer.setAttribute("aria-hidden", "true");
    this.sizer.textContent = longest;
    this.root.insertBefore(this.sizer, this.root.firstChild);
  };

  Typewriter.prototype.bindEvents = function () {
    var self = this;

    var onMotionChange = function () { self.applyMotionPreference(); };
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener("change", onMotionChange);
    } else if (reduceMotion.addListener) {
      reduceMotion.addListener(onMotionChange); // older Safari
    }

    document.addEventListener("visibilitychange", function () {
      if (reduceMotion.matches) return;
      if (document.hidden) self.stop();
      else self.start(TIMING.holdAfterDelete);
    });
  };

  Typewriter.prototype.applyMotionPreference = function () {
    if (reduceMotion.matches) {
      this.stop();
      this.root.classList.add("is-static");
      this.root.classList.remove("is-busy");
      this.sizer.hidden = true;
      this.textEl.textContent = this.phrases.join(" · ");
    } else {
      this.stop();
      this.root.classList.remove("is-static");
      this.sizer.hidden = false;
      // Resume from the start of the cycle, with the first phrase fully shown
      this.phraseIndex = 0;
      this.charIndex = this.phrases[0].length;
      this.deleting = false;
      this.textEl.textContent = this.phrases[0];
      this.start(TIMING.startDelay + TIMING.holdAfterType);
    }
  };

  Typewriter.prototype.start = function (delay) {
    if (this.running) return;
    this.running = true;
    this.schedule(delay || 0);
  };

  Typewriter.prototype.stop = function () {
    this.running = false;
    clearTimeout(this.timer);
  };

  Typewriter.prototype.schedule = function (delay) {
    var self = this;
    clearTimeout(this.timer);
    this.timer = setTimeout(function () { self.tick(); }, delay);
  };

  Typewriter.prototype.tick = function () {
    if (!this.running) return;

    var phrase = this.phrases[this.phraseIndex];

    if (this.deleting) {
      this.charIndex--;
    } else {
      this.charIndex++;
    }

    this.textEl.textContent = phrase.slice(0, this.charIndex);
    this.root.classList.add("is-busy");

    var delay;

    if (!this.deleting && this.charIndex >= phrase.length) {
      // Finished typing: hold so it can be read, then start deleting
      this.deleting = true;
      this.root.classList.remove("is-busy");
      delay = TIMING.holdAfterType;
    } else if (this.deleting && this.charIndex <= 0) {
      // Finished deleting: move to the next phrase
      this.deleting = false;
      this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
      this.root.classList.remove("is-busy");
      delay = TIMING.holdAfterDelete;
    } else if (this.deleting) {
      delay = TIMING.deleteSpeed;
    } else {
      delay = TIMING.typeBase + (Math.random() * 2 - 1) * TIMING.typeJitter;
    }

    this.schedule(delay);
  };

  document.querySelectorAll(".typewriter").forEach(function (el) {
    new Typewriter(el);
  });
})();
