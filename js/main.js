/*
 * Custom JavaScript for Breathing Records
 * Served via Netlify; loaded by injection/header.html.
 */
(function () {
  "use strict";

  // Detect environment the same way the loader does (sticky ?brdev flag).
  var dev = false;
  try { dev = localStorage.getItem("brdev") === "1"; } catch (e) {}
  var env = dev ? "STAGING" : "production";

  console.log("[BR] custom JS loaded (" + env + ")");

  // --- Add real customizations below this line ---

})();
