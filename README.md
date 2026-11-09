# Hamsa & Youssef — Wedding Invitation

Mobile-first Italian Vintage wedding invitation, **4 December 2026**, The Moment at Abu Sir.

## What's included
- Animated envelope opening, responsive invitation, countdown
- Music toggle (add your own licensed MP3 at `assets/music.mp3`)
- Venue button opening a Google Maps **search** for The Moment at Abu Sir (replace with verified venue pin URL when available)
- RSVP with guest name, phone, attendance and party size
- Private guest messages and optional drawn signatures, with opt-in public guestbook
- Google Sheets backend via Apps Script

## 1. Run locally
Open `index.html` in a browser, or run `python -m http.server 8000` inside this folder and open `http://localhost:8000`.

## 2. Set up live RSVP storage
1. Create a Google Sheet in your own account. Copy the spreadsheet ID from its URL (`/spreadsheets/d/THIS_PART/edit`).
2. Go to https://script.google.com/ and create a new project.
3. Paste the contents of `GoogleAppsScript.gs` into the script editor and replace `PASTE_YOUR_GOOGLE_SHEET_ID_HERE` with the spreadsheet ID.
4. Deploy → New deployment → Web app. Execute as **Me**. Who has access: **Anyone**. Authorize the deployment.
5. Copy the deployment URL ending in `/exec` into `config.js` as `apiUrl`.
6. Open the website, send a test RSVP and test message, and verify the rows appear in the Google Sheet. Do not share the site until both tests pass.
7. If you change Apps Script code later, deploy a **new version** of the web app.

**Privacy/security:** RSVP phone numbers and signatures are stored in your private Sheet. Do not publish the Sheet or expose it via a public API. The public guestbook returns only name/message entries that opted in. Public web apps may be spammed; consider adding anti-spam, rate limiting, and an invitation-code gate before distributing widely. This implementation is a starter, not a hardened production backend. The public Google Apps Script endpoint is not an authentication system.

**Note:** Apps Script redirects responses to Google-hosted URLs; test in your intended mobile browsers. If browser CORS or redirects prevent POST/GET requests, deploy an alternative CORS-capable backend (e.g. a serverless API). The UI shows failures rather than claiming a submission succeeded.

## 3. Add music
Put a licensed/original music file named `music.mp3` inside `assets/`. Music starts only after the guest taps the music button (browser autoplay restrictions).

## 4. Publish the site
Create a GitHub repository, upload `index.html`, `style.css`, `script.js`, `config.js`, and `assets/music.mp3` if available. **Do not upload `GoogleAppsScript.gs` with your private spreadsheet ID**; keep it outside the public repo. Settings → Pages → Deploy from a branch → `main` / root. Your public link will look like `https://YOURUSERNAME.github.io/REPOSITORY/`.

## Before sending to guests
- Confirm event start time; the countdown currently targets **midnight Egypt time** at the start of 4 Dec 2026.
- Replace the Google Maps search link with the venue's exact verified pin.
- Confirm whether the maximum of four attendees is appropriate, and whether plus-ones are permitted.
- Add music and test playback.
- Verify form storage and public guestbook from an incognito mobile browser.
