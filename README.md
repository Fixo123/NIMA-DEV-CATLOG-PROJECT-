# NIMA DEV — Business WhatsApp Catlog

A one-page tool that splits a photo into a 3×2 grid (6 equal tiles) for a WhatsApp Business catalog. Everything runs in the browser — the photo is never uploaded to a server.

## Run locally

```
npm install
npm start
```

Open http://localhost:3000

## Deploy to Heroku

1. Install the Heroku CLI and log in:
   ```
   heroku login
   ```
2. From this project folder:
   ```
   git init
   git add .
   git commit -m "NIMA DEV Business WhatsApp Catlog"
   heroku create your-app-name
   git push heroku main
   ```
   (If your default branch is `master`, use `git push heroku master`.)
3. Open the app:
   ```
   heroku open
   ```

The app uses `process.env.PORT`, an `engines` field, and a `Procfile`, so it runs on Heroku with no extra config.

## Project structure

```
server.js            Express static server (serves /public, works on Heroku)
package.json          Dependencies + start script
Procfile              Tells Heroku how to run the app
public/index.html     Page markup
public/style.css      Design system (dark, gold/cyan accents)
public/script.js      Upload + 3x2 canvas split + per-tile & zip download
```

## Notes

- The hero background video is loaded from the link you provided (https://files.catbox.moe/r6x7us.mp4) and plays muted/looped behind a dark scrim.
- Tiles are numbered 01–06, left to right, top to bottom — post them to WhatsApp/Instagram in that order to reconstruct the full image as a grid.
- "Download all (.zip)" bundles all six PNG tiles using JSZip (loaded from a CDN).
