/* =========================================================
   Card slider (vanilla JS, no libraries)

   Works on any element with [data-slider] that contains a
   scrollable list, e.g. the Services section:

   <div data-slider data-autoplay="3800"> <ul> <li>…</li> </ul> </div>

   - Optional arrow buttons (.slider-btn--prev / --next) move one card
     at a time and wrap around at the ends. The Services section no
     longer has them; the code simply skips arrows that aren't there.
   - Autoplay (milliseconds in data-autoplay) pauses while the
     pointer is over it, while it has keyboard focus, after a
     manual swipe, while off-screen or in a hidden tab, and
     whenever the pause button is pressed.
   - With "reduce motion" turned on there is no autoplay and
     no smooth scrolling; the arrows still work.
   ========================================================= */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var RESUME_AFTER_SWIPE = 6000; // ms before autoplay resumes after a manual swipe

  function Slider(root) {
    this.root = root;
    this.track = root.querySelector("ul, ol");
    this.section = root.closest("section") || document;
    this.controls = this.section.querySelector(".slider-controls");
    this.prevBtn = this.section.querySelector(".slider-btn--prev");
    this.nextBtn = this.section.querySelector(".slider-btn--next");
    this.pauseBtn = this.section.querySelector(".slider-btn--pause");
    this.delay = parseInt(root.getAttribute("data-autoplay"), 10) || 0;

    this.timer = null;
    this.userPaused = false; // pause button
    this.hovered = false;
    this.focused = false;
    this.visible = true;
    this.swipeHold = false;
    this.swipeTimer = null;

    if (!this.track) return;

    if (this.controls) this.controls.hidden = false;
    this.bindEvents();
    this.updatePauseButton();
    this.refresh();
  }

  // Distance between the starts of two neighbouring cards
  Slider.prototype.step = function () {
    var cards = this.track.children;
    if (cards.length > 1) return cards[1].offsetLeft - cards[0].offsetLeft;
    return this.track.clientWidth;
  };

  Slider.prototype.atStart = function () {
    return this.track.scrollLeft <= 2;
  };

  Slider.prototype.atEnd = function () {
    return this.track.scrollLeft + this.track.clientWidth >= this.track.scrollWidth - 2;
  };

  Slider.prototype.scrollToX = function (x) {
    this.track.scrollTo({ left: x, behavior: reduceMotion.matches ? "auto" : "smooth" });
  };

  Slider.prototype.next = function () {
    if (this.atEnd()) this.scrollToX(0); // wrap back to the first card
    else this.scrollToX(this.track.scrollLeft + this.step());
  };

  Slider.prototype.prev = function () {
    if (this.atStart()) this.scrollToX(this.track.scrollWidth); // wrap to the last card
    else this.scrollToX(this.track.scrollLeft - this.step());
  };

  // ---------- Autoplay ----------
  Slider.prototype.canAutoplay = function () {
    return this.delay > 0 && !reduceMotion.matches && !this.userPaused &&
      !this.hovered && !this.focused && !this.swipeHold && this.visible && !document.hidden;
  };

  Slider.prototype.refresh = function () {
    var self = this;
    clearInterval(this.timer);
    this.timer = null;
    if (this.canAutoplay()) {
      this.timer = setInterval(function () { self.next(); }, this.delay);
    }
  };

  Slider.prototype.updatePauseButton = function () {
    if (!this.pauseBtn) return;
    // No autoplay means nothing to pause: hide the button
    this.pauseBtn.hidden = !(this.delay > 0) || reduceMotion.matches;
    this.pauseBtn.setAttribute("aria-pressed", String(this.userPaused));
    var label = this.pauseBtn.querySelector(".visually-hidden");
    if (label) label.textContent = this.userPaused ? "Resume automatic sliding" : "Pause automatic sliding";
  };

  Slider.prototype.bindEvents = function () {
    var self = this;
    var root = this.root;

    if (this.nextBtn) this.nextBtn.addEventListener("click", function () { self.next(); self.restartTimer(); });
    if (this.prevBtn) this.prevBtn.addEventListener("click", function () { self.prev(); self.restartTimer(); });

    if (this.pauseBtn) {
      this.pauseBtn.addEventListener("click", function () {
        self.userPaused = !self.userPaused;
        self.updatePauseButton();
        self.refresh();
      });
    }

    root.addEventListener("mouseenter", function () { self.hovered = true; self.refresh(); });
    root.addEventListener("mouseleave", function () { self.hovered = false; self.refresh(); });
    root.addEventListener("focusin", function () { self.focused = true; self.refresh(); });
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) { self.focused = false; self.refresh(); }
    });

    // A touch swipe pauses autoplay for a while, then it carries on
    this.track.addEventListener("touchstart", function () {
      self.swipeHold = true;
      clearTimeout(self.swipeTimer);
      self.refresh();
    }, { passive: true });
    this.track.addEventListener("touchend", function () {
      clearTimeout(self.swipeTimer);
      self.swipeTimer = setTimeout(function () { self.swipeHold = false; self.refresh(); }, RESUME_AFTER_SWIPE);
    }, { passive: true });

    // Left / right arrow keys when the track has focus
    this.track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); self.next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); self.prev(); }
    });

    // Only run while the section is on screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        self.visible = entries[0].isIntersecting;
        self.refresh();
      }, { threshold: 0.25 }).observe(root);
    }

    document.addEventListener("visibilitychange", function () { self.refresh(); });

    var onMotion = function () { self.updatePauseButton(); self.refresh(); };
    if (reduceMotion.addEventListener) reduceMotion.addEventListener("change", onMotion);
    else if (reduceMotion.addListener) reduceMotion.addListener(onMotion);
  };

  // After a manual arrow click, wait a full interval before the next auto move
  Slider.prototype.restartTimer = function () {
    this.refresh();
  };

  document.querySelectorAll("[data-slider]").forEach(function (el) {
    new Slider(el);
  });
})();
