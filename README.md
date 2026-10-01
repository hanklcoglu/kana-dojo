# Kana Dojo あ

A small web app for learning **hiragana** and **katakana**. No install, no account: open the page and practise.

## Features

| Feature | What it does |
|---|---|
| Three drill modes | Type the romaji, pick the kana from four choices, or listen and pick |
| Row selection | Choose which rows to study: basic, dakuten/handakuten, and combinations (yōon) |
| Smart repetition | Kana you get wrong come back more often; mastered ones appear less |
| Progress chart | Full kana chart coloured by mastery; tap any kana to hear it |
| Stats | Day streak, overall accuracy, mastered count |
| Audio | Uses the browser's built-in Japanese voice |

Progress is saved in each learner's own browser (localStorage), so every student keeps their own record. Use **Chart → Export progress** to save a copy as a JSON file.

## Files

- `index.html` page structure
- `style.css` styles (light and dark mode)
- `kana.js` kana data (edit this to add rows)
- `app.js` quiz logic

## Hosting

Served with GitHub Pages from the `main` branch root.
