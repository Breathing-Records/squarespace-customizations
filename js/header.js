/*
 * Breathing Records - HEADER scripts
 * Mirrors Squarespace: Settings > Advanced > Code Injection > Header
 * Served via Netlify; pulled in by injection/header.html.
 */

// Dev-mode indicator: shows a STAGING badge when loaded via ?brdev=1
(function () {
  var dev = false;
  try { dev = localStorage.getItem("brdev") === "1"; } catch (e) {}
  if (!dev) return;

  var badge = document.createElement("div");
  badge.textContent = "STAGING";
  badge.style.cssText = [
    "position:fixed", "bottom:12px", "right:12px", "z-index:99999",
    "background:#c0392b", "color:#fff", "font:600 12px/1 sans-serif",
    "padding:6px 10px", "border-radius:4px", "letter-spacing:1px",
    "opacity:0.85", "pointer-events:none"
  ].join(";");
  var add = function () { document.body.appendChild(badge); };
  if (document.body) add();
  else document.addEventListener("DOMContentLoaded", add);
})();


// Change logo link to /room if user is logged in

(function () {
  function isAuthed() {
    try {
      return !!(
        window.UserAccountApi &&
        typeof window.UserAccountApi.isUserAuthenticated === "function" &&
        window.UserAccountApi.isUserAuthenticated()
      );
    } catch (e) {
      return false;
    }
  }

  function updateLogoLink() {
    // Covers desktop + mobile logos in Squarespace 7.1
    var logoLinks = document.querySelectorAll(
      '.header-title-logo a, .header-mobile-logo a'
    );

    if (!logoLinks.length) return;

    var target = isAuthed() ? "/room" : "/";

    logoLinks.forEach(function (a) {
      a.setAttribute("href", target);
    });
  }

  document.addEventListener("DOMContentLoaded", updateLogoLink);
  window.addEventListener("pageshow", updateLogoLink);

  // Run once more in case header renders late
  setTimeout(updateLogoLink, 600);
})();


// Profile icon + dropdown menu (Login when logged out, Logout when logged in)
(function () {
  var LOGIN_URL = "/room";
  var NAV_SELECTOR = 'a[href="#profile"]';
  var SIGNOUT_BTN_SELECTOR = '[data-test="sign-out"]';
  var LOGOUT_RETURN_TO = "/"; // where to land after logging out

  // Person icon; uses currentColor so it matches the nav's text color.
  var ICON_SVG =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="8" r="4"></circle>' +
    '<path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path></svg>';

  var menu, action;

  function isAuthed() {
    try {
      return !!(window.UserAccountApi &&
        typeof window.UserAccountApi.isUserAuthenticated === "function" &&
        window.UserAccountApi.isUserAuthenticated());
    } catch (e) {
      return false;
    }
  }

  function doLogout(returnTo) {
    // UserAccountApi has no direct logout method, but openAccountScreen() opens
    // Squarespace's account overlay, which contains the sign-out button. We open
    // it, click sign-out, then send the user home.
    try {
      if (window.UserAccountApi &&
          typeof window.UserAccountApi.openAccountScreen === "function") {
        window.UserAccountApi.openAccountScreen();
      }
    } catch (e) {}

    var tries = 0;
    var t = setInterval(function () {
      tries++;

      var btn = document.querySelector(SIGNOUT_BTN_SELECTOR);
      if (btn) {
        clearInterval(t);
        btn.click();
        // Give Squarespace a moment to clear the session, then leave.
        setTimeout(function () { location.href = returnTo || "/"; }, 1200);
        return;
      }

      if (tries >= 40) clearInterval(t); // ~10s, give up quietly
    }, 250);
  }

  function buildMenu() {
    if (menu) return;
    menu = document.createElement("div");
    menu.className = "br-profile-menu";
    menu.style.cssText = [
      "position:fixed", "display:none", "z-index:99999",
      "min-width:140px", "background:#fff", "border:1px solid #e2e2e2",
      "border-radius:8px", "box-shadow:0 6px 20px rgba(0,0,0,0.15)",
      "padding:6px", "font:500 14px/1.2 sans-serif"
    ].join(";");

    action = document.createElement("a");
    action.className = "br-profile-action";
    action.href = "#";
    action.style.cssText = [
      "display:block", "padding:10px 14px", "color:#111",
      "text-decoration:none", "border-radius:6px", "cursor:pointer",
      "white-space:nowrap"
    ].join(";");
    action.addEventListener("mouseenter", function () { action.style.background = "#f2f2f2"; });
    action.addEventListener("mouseleave", function () { action.style.background = "transparent"; });
    action.addEventListener("click", function (e) {
      e.preventDefault();
      closeMenu();
      if (isAuthed()) doLogout(LOGOUT_RETURN_TO);
      else location.href = LOGIN_URL;
    });

    menu.appendChild(action);
    document.body.appendChild(menu);
  }

  function updateMenuLabel() {
    if (action) action.textContent = isAuthed() ? "Logout" : "Login";
  }

  function openMenu(anchor) {
    if (!menu || !anchor) return;
    updateMenuLabel();
    // Measure off-screen, then right-align the menu under the icon.
    menu.style.left = "-9999px";
    menu.style.display = "block";
    var mw = menu.offsetWidth;
    var r = anchor.getBoundingClientRect();
    var left = Math.max(8, Math.min(r.right - mw, window.innerWidth - mw - 8));
    menu.style.top = (r.bottom + 8) + "px";
    menu.style.left = left + "px";
  }

  function closeMenu() { if (menu) menu.style.display = "none"; }

  function isOpen() { return menu && menu.style.display === "block"; }

  function setupIcon() {
    var links = document.querySelectorAll(NAV_SELECTOR);
    if (!links.length) return;
    buildMenu();

    Array.prototype.forEach.call(links, function (a) {
      if (a.getAttribute("data-br-profile") === "1") return;
      a.setAttribute("data-br-profile", "1");
      a.setAttribute("aria-label", "Account");
      a.innerHTML = ICON_SVG;
      a.style.display = "inline-flex";
      a.style.alignItems = "center";

      a.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (isOpen()) closeMenu();
        else openMenu(a);
      });
    });

    updateMenuLabel();
  }

  // Close the menu on outside click, Escape, scroll, or resize.
  document.addEventListener("click", function (e) {
    if (!isOpen()) return;
    if (e.target.closest(".br-profile-menu")) return;
    if (e.target.closest(NAV_SELECTOR)) return;
    closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });
  window.addEventListener("scroll", closeMenu, true);
  window.addEventListener("resize", closeMenu);

  function init() {
    setupIcon();
  }

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("pageshow", init);
  window.addEventListener("focus", updateMenuLabel);

  // Retry for late-rendering nav and late-loading UserAccountApi.
  setTimeout(setupIcon, 800);
  setTimeout(updateMenuLabel, 1500);
})();