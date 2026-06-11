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

  // staging-deploy-test: visible only in staging, proves the JS pipeline.
  // Remove together with the matching marker in css/site.css.
  if (dev) {
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
  }

  // --- Add real customizations below this line ---

})();
