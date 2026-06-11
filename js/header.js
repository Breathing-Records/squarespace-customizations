/*
 * Breathing Records - HEADER scripts
 * Mirrors Squarespace: Settings > Advanced > Code Injection > Header
 * Served via Netlify; pulled in by injection/header.html.
 */
(function () {
  "use strict";

  // Detect environment the same way the loader does (sticky ?brdev flag).
  var dev = false;
  try { dev = localStorage.getItem("brdev") === "1"; } catch (e) {}

  console.log("[BR] header.js loaded (" + (dev ? "STAGING" : "production") + ")");

  // Small on-page indicator so it is obvious when the browser is in dev mode.
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

  // --- Add HEADER customizations below this line ---

})();
