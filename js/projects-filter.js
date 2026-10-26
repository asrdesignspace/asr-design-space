/* =========================================================
   All Projects page: category filters + search

   Every project card in projects/index.html carries:
     data-categories="ui-ux web-development"   (category keys)
     data-keywords="wordpress woocommerce"     (extra search words)
   The category buttons and the search box work together: a card is
   shown only if it is in the chosen category AND matches every word
   typed in the search box.
   ========================================================= */

(function () {
  "use strict";

  var toolbar = document.querySelector("[data-work-toolbar]");
  var grid = document.querySelector("[data-work-grid]");
  if (!toolbar || !grid) return;

  var buttons = Array.prototype.slice.call(toolbar.querySelectorAll("[data-filter]"));
  var searchForm = toolbar.querySelector("[data-work-search-form]");
  var searchInput = toolbar.querySelector("[data-work-search]");
  var cards = Array.prototype.slice.call(grid.querySelectorAll(".work-card"));
  var empty = document.querySelector("[data-work-empty]");
  var emptyText = document.querySelector("[data-work-empty-text]");
  var resetBtn = document.querySelector("[data-work-reset]");
  var status = document.querySelector("[data-work-status]");

  var activeFilter = "all";

  // Lower-case text with accents removed, so "Ur-Rahman" matches "ur rahman"
  function normalise(text) {
    return (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  // Build each card's searchable text once: title, description, badges,
  // category keys and extra keywords
  var index = cards.map(function (card) {
    return {
      card: card,
      categories: (card.getAttribute("data-categories") || "").split(/\s+/),
      text: " " + normalise([
        card.textContent,
        card.getAttribute("data-categories"),
        card.getAttribute("data-keywords")
      ].join(" ")) + " "
    };
  });

  function labelFor(filter) {
    var btn = buttons.filter(function (b) { return b.getAttribute("data-filter") === filter; })[0];
    return btn ? btn.textContent.trim() : "";
  }

  function update() {
    var words = normalise(searchInput.value).split(" ").filter(Boolean);
    var shown = 0;

    index.forEach(function (item) {
      var inCategory = activeFilter === "all" || item.categories.indexOf(activeFilter) !== -1;
      var matchesSearch = words.every(function (word) {
        return item.text.indexOf(word) !== -1;
      });
      var visible = inCategory && matchesSearch;
      item.card.hidden = !visible;
      if (visible) shown++;
    });

    // Empty state + message that explains what was searched
    var query = searchInput.value.trim();
    var where = activeFilter === "all" ? "" : " in " + labelFor(activeFilter);
    if (shown === 0) {
      emptyText.textContent = query
        ? "Nothing matches “" + query + "”" + where + ". Try another search term or category."
        : "There are no projects" + where + " yet. Try another category.";
    }
    empty.hidden = shown !== 0;
    grid.hidden = shown === 0;

    status.textContent = shown === 0
      ? "No projects found."
      : "Showing " + shown + (shown === 1 ? " project" : " projects") + where + (query ? " matching “" + query + "”" : "") + ".";
  }

  function setFilter(filter) {
    activeFilter = filter;
    buttons.forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-filter") === filter));
    });
    update();
  }

  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setFilter(btn.getAttribute("data-filter"));
    });
  });

  // Filter as you type; Enter does not reload the page
  searchInput.addEventListener("input", update);
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    update();
  });

  // Escape clears the search box
  searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && searchInput.value) {
      searchInput.value = "";
      update();
    }
  });

  resetBtn.addEventListener("click", function () {
    searchInput.value = "";
    setFilter("all");
    buttons[0].focus();
  });

  // Everything is ready: show the controls
  toolbar.hidden = false;
  update();
})();
