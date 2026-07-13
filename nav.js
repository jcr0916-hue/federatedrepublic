/* nav.js — single source of truth for site navigation.
   Injects the header nav + mobile menu into <div id="site-nav"></div>,
   defines toggleMobileNav(), and auto-highlights the current page.
   Keep skip-nav static in each page's HTML (first body child) for
   accessibility and no-JS crawlability. */
(function () {
  var LINKS = [
    { href: "annotated.html",             label: "Annotated Edition" },
    { href: "scenarios.html",             label: "Scenarios" },
    { href: "quicksheets.html",           label: "Quick Sheets" },
    { href: "torenthia.html",             label: "The World" },
    { href: "diagrams.html",              label: "Diagrams" },
    { href: "constitutional-history.html", label: "Constitutional History" },
    { href: "sources.html",               label: "Sources" },
    { href: "glossary.html",              label: "Glossary" }
  ];
  // Mobile menu carries the desktop links plus a few extras.
  var MOBILE_EXTRA = [
    { href: "survey.html",  label: "So You Want a Constitution?" },
    { href: "contact.html", label: "Contact" }
  ];

  // current page filename (default to index.html at site root)
  var path = window.location.pathname.split("/").pop() || "index.html";

  function isActive(href) {
    return href === path;
  }
  function anchors(list) {
    return list.map(function (l) {
      var active = isActive(l.href) ? ' class="active"' : "";
      var current = isActive(l.href) ? ' aria-current="page"' : "";
      return '<a href="' + l.href + '"' + active + current + ">" + l.label + "</a>";
    }).join("\n      ");
  }

  var navHTML =
    '<nav>\n' +
    '  <a href="index.html" class="nav-logo"><img src="seal.png" alt="" class="nav-seal" width="32" height="32" aria-hidden="true">The Federated Republic</a>\n' +
    '  <div class="nav-links">\n      ' + anchors(LINKS) + '\n  </div>\n' +
    '  <button class="hamburger" onclick="toggleMobileNav()" aria-label="Menu" aria-expanded="false">\n' +
    '    <span></span><span></span><span></span>\n' +
    '  </button>\n' +
    '</nav>\n' +
    '<div class="mobile-menu" id="mobileMenu">\n    ' +
    anchors(LINKS.concat(MOBILE_EXTRA)) + '\n' +
    '    <a href="constitution-current.pdf" download class="mobile-cta">Formal Document (PDF)</a>\n' +
    '</div>';

  function inject() {
    var mount = document.getElementById("site-nav");
    if (mount) mount.innerHTML = navHTML;
  }

  // Define the toggle globally so inline onclick keeps working.
  window.toggleMobileNav = function () {
    var m = document.getElementById("mobileMenu");
    if (!m) return;
    var open = m.classList.toggle("open");
    var btn = document.querySelector(".hamburger");
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
