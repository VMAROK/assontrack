# AssOnTrack

Progress, diet and passion tracker. Installable on iPhone from Safari: open the site, tap **Share → Add to Home Screen**.

- Runs full screen with its own icon and works offline.
- Signing in syncs your logs between devices through Supabase.
- Without an account it saves on the device only.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole app |
| `config.js` | Supabase project URL and anon key |
| `supabase.sql` | Database table and access rules (run once) |
| `sw.js` | Offline support |
| `manifest.webmanifest`, `*.png` | Home-screen app name and icons |

## Setup

1. Create a free project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run `supabase.sql`.
3. In **Authentication → Sign In / Providers → Email**, turn off **Confirm email** so new accounts can sign in straight away.
4. Put the project URL and anon (publishable) key from **Project Settings → API** into `config.js`.
5. Enable **GitHub Pages** for this repo (Settings → Pages → Deploy from a branch → `main` / root).

Your data is not stored in this repository. Each account can only read and write its own row.
