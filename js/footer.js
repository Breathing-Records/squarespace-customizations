/*
 * Breathing Records - FOOTER scripts
 * Mirrors Squarespace: Settings > Advanced > Code Injection > Footer
 * Served via Netlify; pulled in by injection/footer.html.
 */

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


// Handling login/logout status in nav bar
(function () {
  var LOGIN_URL = "/room";
  var NAV_SELECTOR = 'a[href="#profileTEST"]';
  var MEMBER_ACCOUNT_PAGE = "/account/member-areas";
  var SIGNOUT_BTN_SELECTOR = 'button[data-test="sign-out"]';

  function isAuthed() {
    try {
      return !!(window.UserAccountApi &&
        typeof window.UserAccountApi.isUserAuthenticated === "function" &&
        window.UserAccountApi.isUserAuthenticated());
    } catch (e) {
      return false;
    }
  }

  function setNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll(NAV_SELECTOR));
    if (!links.length) return;

    var authed = isAuthed();
    links.forEach(function (a) {
      a.textContent = authed ? "Account" : "Login";
      a.setAttribute("href", authed ? "#logout" : LOGIN_URL);
    });
  }

  function gotoLogoutPage(returnTo) {
    var url = new URL(MEMBER_ACCOUNT_PAGE, location.origin);
    url.searchParams.set("doLogout", "1");
    url.searchParams.set("returnTo", returnTo || "/");
    location.href = url.toString();
  }

  function autoLogoutIfRequested() {
    if (location.pathname !== "/account/member-areas") return;

    var params = new URLSearchParams(location.search);
    if (params.get("doLogout") !== "1") return;

    var returnTo = params.get("returnTo") || "/";

    var tries = 0;
    var t = setInterval(function () {
      tries++;

      var btn = document.querySelector(SIGNOUT_BTN_SELECTOR);
      if (btn) {
        clearInterval(t);
        btn.click();

        // Give Squarespace a moment to clear session, then go where you want.
        setTimeout(function () { location.href = returnTo; }, 1200);
        return;
      }

      if (tries >= 20) {
        clearInterval(t);
        // If sign out button never appears, at least take them back.
        location.href = returnTo;
      }
    }, 250);
  }

  document.addEventListener("click", function (e) {
    var logoutLink = e.target.closest('a[href="#logout"]');
    if (!logoutLink) return;

    e.preventDefault();

    if (!isAuthed()) {
      location.href = LOGIN_URL;
      return;
    }

    // Avoid redirect loops by doing logout on the member account page.
    gotoLogoutPage("/room");
  });

  document.addEventListener("DOMContentLoaded", function () {
    setNav();
    autoLogoutIfRequested();
  });

  window.addEventListener("pageshow", function () {
    setNav();
    autoLogoutIfRequested();
  });

  window.addEventListener("focus", setNav);
  setTimeout(setNav, 800);
})();
