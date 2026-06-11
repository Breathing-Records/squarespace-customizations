# Dev mode bookmarklet

The loader in `injection/header.html` keeps staging mode sticky via `localStorage`,
so once you visit a page with `?brdev=1` you stay in dev mode across clickthroughs
(the query string dropping off the URL is only cosmetic; the STAGING badge confirms
you are still in dev mode). Visit `?brdev=0` to exit.

If you would rather not touch the URL at all, use this bookmarklet to toggle dev mode
on any page. Create a new bookmark and paste this as the URL:

```
javascript:(function(){var k='brdev';if(localStorage.getItem(k)==='1'){localStorage.removeItem(k)}else{localStorage.setItem(k,'1')}location.reload()})();
```

- Click it on any page to flip staging on/off; the page reloads in the new mode.
- No query string, no typing.
- Same `brdev` flag the loader reads, so the two stay in sync.
