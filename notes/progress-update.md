# Progress update (2026-06-11)

Two parts: a status update written as a Chris/Gus email, and the technical
"where we left off" notes so this session can continue on another machine.

---

## Part 1: Update for Chris and Gus

Subject: Squarespace customizations - progress update

Hi Chris, Gus,

Quick update on the website customization work. The infrastructure is built,
verified, and live, and we have started building real features on it.

What is in place and working:

- All custom code lives in a private GitHub repo (Breathing-Records/squarespace-customizations).
- It is served to the live site through a CDN (Netlify) that auto-deploys on every push.
- There are two environments off the same setup: production (what visitors see) and
  a private staging environment I can preview on the real site by adding ?brdev=1 to
  the URL. A red STAGING badge shows when I am in that mode.
- The Squarespace boxes now just hold small loader snippets with loud "do not edit here,
  edit in GitHub" notices, so nothing gets changed in the wrong place.

What I am building now (on staging only, not yet live to visitors):

- The profile item in the nav is becoming a small profile icon with a dropdown menu
  that shows "Login" when logged out and "Logout" when logged in.
- The login side and the icon/menu are working. I am finishing the logout behavior,
  which needed some reverse engineering of how Squarespace handles member sign-out.

Nothing here has touched the live visitor experience yet. I promote changes from
staging to production only when they are tested and ready.

More soon,
Jonathan

---

## Part 2: Technical state (for continuing the session)

### Architecture recap
- Repo: `Breathing-Records/squarespace-customizations` (private).
- Netlify site `breathing-records` serves the repo as a CDN.
- Squarespace mirror:
  - Design > Custom CSS  -> `css/site.css`
  - Code Injection Header -> `js/header.js`
  - Code Injection Footer -> `js/footer.js`
- Squarespace boxes hold loader snippets (`injection/header.html`, `injection/footer.html`,
  `injection/custom-css.css`), each with a "do not edit here" banner. Pasted once; live.
- Environments: production = `main` branch (`breathing-records.netlify.app`),
  staging = `staging` branch (`staging--breathing-records.netlify.app`).
- `?brdev=1` switches a browser to staging (sticky via localStorage, cache-busted),
  `?brdev=0` exits. A STAGING badge renders top-left in dev mode (`js/header.js`).
- Workflow: edit on `staging`, push, test at `breathingrecords.com/?brdev=1`, then
  promote with `git switch main && git merge staging && git push`.

### Branch state right now
- `staging` is AHEAD of `main`. The profile-icon menu and logout work are STAGING ONLY.
- Do NOT promote to `main` until logout is verified and Jonathan approves.

### Current feature: profile icon + dropdown (in `js/header.js`)
- Targets `a[href="#profile"]` nav links (3 on the page: desktop / mobile / overlay).
- Replaces each with a person SVG icon; click toggles a dropdown menu below it.
- Menu shows one action: "Login" (logged out -> goes to `/room`) or
  "Logout" (logged in -> runs `doLogout()`).
- Verified on staging via headless render: icon injects on all 3, menu builds,
  logged-out label shows "Login".

### Logout: what we learned (the hard part)
- `/account/member-areas` does NOT exist; it redirects. The original code targeted it,
  so logout never worked.
- `/account/logout` does NOT log out; it triggers a reauthenticate flow and bounces the
  user back to their member page still logged in.
- `window.UserAccountApi` methods (from the live console, logged in):
  `isUserAuthenticated, renderPricingPlansEnrollmentDatesErrorModal, outsideEnrollmentDates,
  getAccountScreenPath, joinPricingPlan, signIn, openAccountScreen`.
  There is NO direct logout/signOut method.
- Current approach (pushed to staging, NOT yet tested logged in):
  `doLogout()` calls `UserAccountApi.openAccountScreen()` to open the account overlay,
  then polls for `[data-test="sign-out"]` and clicks it, then redirects to `/`.

### Console noise (not real problems)
- `c.1password.com/.../*.png 404` = the 1Password browser extension. Ignore.
- `webhook.squarespace.com/.../csp/events 401` = Squarespace's own analytics. Ignore.
- No real SSL issue. All Netlify references are https with valid certs.

### NEXT STEP (do this first next session)
Test logout while logged in:
1. Log into the site, then load `breathingrecords.com/?brdev=1`.
2. Click the profile icon -> Logout.
3. Confirm: does `openAccountScreen()` show the account overlay, is the sign-out button
   found and clicked, do you end up actually logged out and on `/`?
If it fails, likely causes to check: `openAccountScreen()` may navigate instead of
overlay (poller would need to run on the account screen page too), or the sign-out
selector differs from `[data-test="sign-out"]`.

### Open questions for Jonathan
- After logout, land on `/` (current) or `/room`?
- Menu open on click only (current) or hover too?
- Switch login to `UserAccountApi.signIn()` overlay instead of navigating to `/room`?

### Verification method
- Headless Chrome dump of the live page (executes JS):
  `"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --disable-gpu
   --no-sandbox --virtual-time-budget=10000 --dump-dom "https://breathingrecords.com/?brdev=1"`
- Authenticated flows (real logout) cannot be tested headlessly; Jonathan tests those.
