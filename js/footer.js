/*
 * Breathing Records - FOOTER scripts
 * Mirrors Squarespace: Settings > Advanced > Code Injection > Footer
 * Served via Netlify; pulled in by injection/footer.html.
 */

// Change logo link to /room if user is logged in
(function () {
  // Redirect user on / to /room if they are logged in

  // Only on homepage
  if (window.location.pathname !== "/") return;

  // Do not run in Squarespace editor / config contexts
  if (window.location.pathname.indexOf("/config") === 0) return;
  if (window.top !== window.self) return;

  function canCheckAuth() {
    return !!(window.UserAccountApi && typeof window.UserAccountApi.isUserAuthenticated === "function");
  }

  function isAuthed() {
    try { return !!window.UserAccountApi.isUserAuthenticated(); }
    catch (e) { return false; }
  }

  function attemptRedirect() {
    if (!canCheckAuth()) return false;
    if (isAuthed()) {
      window.location.replace("/room");
      return true;
    }
    return true; // auth available, no redirect needed
  }

  // Try once after DOM is ready, then retry briefly in case UserAccountApi loads late
  function run() {
    if (attemptRedirect()) return;

    var tries = 0;
    var t = setInterval(function () {
      tries++;
      if (attemptRedirect() || tries >= 20) clearInterval(t);
    }, 250);
  }

  document.addEventListener("DOMContentLoaded", run);
  window.addEventListener("pageshow", run);
})();
