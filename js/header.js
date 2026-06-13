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
    "position:fixed", "top:0", "left:0", "z-index:99999",
    "background:#c0392b", "color:#fff", "font:700 18px/1 sans-serif",
    "padding:10px 16px", "border-radius:0 0 6px 0", "letter-spacing:2px",
    "opacity:0.9", "pointer-events:none"
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

  function getCookie(name) {
    var m = document.cookie.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
    return m ? m[1] : "";
  }

  function doLogout(returnTo) {
    // Squarespace's customer-account sign-out is a DELETE on the site-user
    // session. UserAccountApi exposes no logout method, and openAccountScreen()
    // just navigates to a reauthenticate page, so we replicate the request the
    // native "Sign out" button fires from inside the /account/frame iframe.
    // The two required tokens live in JS-readable cookies:
    //   crumb         -> x-csrf-token
    //   siteUserCrumb -> x-siteuser-xsrf-token
    var dest = returnTo || "/";

    try { sessionStorage.removeItem("br_is_dj"); } catch (e) {}

    fetch("/api/site-users/account/session?cloneCart=false", {
      method: "DELETE",
      mode: "cors",
      credentials: "include",
      headers: {
        "accept": "application/json, text/plain, */*",
        "x-csrf-token": getCookie("crumb"),
        "x-siteuser-xsrf-token": getCookie("siteUserCrumb")
      }
    })
      .then(function () { location.href = dest; })
      .catch(function () { location.href = dest; });
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


// DJ Room nav link — injected only for verified DJ members.
// Reads the br_is_dj sessionStorage cache set by /room. If not cached,
// hits /dj-check once to check. Never exposes /dj-room13 to non-DJs.
(function () {
  var DJ_URL = "/dj-room13";
  var CACHE_KEY = "br_is_dj";
  var CACHE_TTL = 5 * 60 * 1000;
  var FAN_LINK_SELECTOR = 'a[href="/fan-room"]';

  function cacheGet() {
    try {
      var v = sessionStorage.getItem(CACHE_KEY);
      if (!v) return null;
      var o = JSON.parse(v);
      if (!o || Date.now() - o.t > CACHE_TTL) return null;
      return o.v;
    } catch (e) { return null; }
  }

  function injectLink() {
    if (document.querySelector('a[href="' + DJ_URL + '"].br-dj-nav')) return;

    var fanLink = document.querySelector(FAN_LINK_SELECTOR);
    if (!fanLink) return;

    var fanLi = fanLink.closest("li");
    if (!fanLi || !fanLi.parentNode) return;

    var li = document.createElement("li");
    li.className = fanLi.className; // match Squarespace nav item styles

    var a = document.createElement("a");
    a.href = DJ_URL;
    a.className = (fanLink.className || "") + " br-dj-nav";
    a.textContent = "DJ Room";

    li.appendChild(a);
    fanLi.parentNode.insertBefore(li, fanLi.nextSibling);
  }

  function run() {
    var cached = cacheGet();
    if (cached === true) { injectLink(); return; }
    if (cached === false) return; // confirmed non-DJ, don't check again

    // Cache miss — check once (only if logged in, to avoid hitting on every page for guests)
    try {
      if (!window.UserAccountApi || !window.UserAccountApi.isUserAuthenticated()) return;
    } catch (e) { return; }

    fetch("/dj-check?t=" + Date.now(), { credentials: "same-origin", cache: "no-store" })
      .then(function (r) { return r.text().then(function (t) { return { r: r, t: t }; }); })
      .then(function (o) {
        var txt = (o.t || "").toLowerCase();
        var looksLikeLogin = txt.indexOf("sqs-login") !== -1 ||
          txt.indexOf("log in") !== -1 || txt.indexOf("sign in") !== -1;
        var isDj = o.r && o.r.ok && !looksLikeLogin;
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ v: isDj, t: Date.now() }));
        } catch (e) {}
        if (isDj) injectLink();
      })
      .catch(function () {});
  }

  // Wait for nav to render
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(run, 300); });
  } else {
    setTimeout(run, 300);
  }
  setTimeout(run, 1000); // retry for late-rendering nav
})();


// Suppress ONLY Squarespace's post-login customer-account drawer (the "Digital
// Products" dashboard that auto-opens after sign-in). Squarespace reuses the
// same iframe#accountFrame for the login/signup overlay, so we must never touch
// that one or those buttons break. The distinguisher: the dashboard runs as a
// top-level /account/* page (e.g. /account/digital-products), whereas a
// login/signup overlay leaves the top URL on the underlying content page.
(function () {
  function isDashboard() {
    var p = (location.pathname || "").toLowerCase();
    if (p.indexOf("/account") !== 0) return false;        // not the account area
    // ...but never treat an auth form as the dashboard.
    return !/\/(login|sign-?up|register|password|reauthenticate|reset)/.test(p);
  }

  function isLocked() {
    var de = document.documentElement, b = document.body;
    return getComputedStyle(de).overflow === "hidden" ||
      (b && getComputedStyle(b).overflow === "hidden");
  }

  function dismiss(frame) {
    if (frame.__brDismissed) return;
    frame.__brDismissed = true;
    frame.style.display = "none"; // hide just this dashboard instance (no flash)

    var tries = 0;
    var t = setInterval(function () {
      tries++;
      var gone = !document.getElementById("accountFrame"); // Squarespace removed it
      try {
        var doc = frame.contentDocument;
        if (doc) {
          var els = doc.querySelectorAll('button, a, [role="button"]');
          for (var i = 0; i < els.length; i++) {
            if ((els[i].textContent || "").trim().toLowerCase() === "close") {
              els[i].click(); // native close: removes iframe + restores scroll
              gone = true;
              break;
            }
          }
        }
      } catch (e) {}

      if (gone) {
        clearInterval(t);
      } else if (tries >= 50) { // ~5s: native close never fired
        clearInterval(t);
        // Last resort, only if the drawer left the page scroll-locked: tear it
        // down ourselves so the page can't get stuck behind a hidden iframe.
        if (isLocked()) {
          var f = document.getElementById("accountFrame");
          if (f && f.parentNode) f.parentNode.removeChild(f);
          document.documentElement.style.overflow = "";
          if (document.body) document.body.style.overflow = "";
        }
      }
    }, 100);
  }

  function check() {
    if (!isDashboard()) return;                 // leave login/signup overlays alone
    var frame = document.getElementById("accountFrame");
    if (frame) dismiss(frame);
  }

  function start() {
    if (!document.body) { setTimeout(start, 50); return; }
    new MutationObserver(check).observe(document.body, { childList: true });
    window.addEventListener("popstate", check); // URL may flip to /account after open
    check();
  }

  start();
})();