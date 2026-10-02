# dericmusic.github.io

Official website for Deric — Producer // Artist // Visionary

## Features

- 🎵 **Auto-Updating Featured Release** — Automatically fetches and displays the latest release from Spotify
- � **Listen Portal** — Premium fullscreen modal with multi-platform streaming links
- 🎬 **YouTube Integration** — Dynamic video carousel with latest content
- 🎨 **Cinematic Design** — Dark, minimal, premium aesthetic
- 📱 **Fully Responsive** — Optimized for all devices

## Listen Portal

The Listen Portal is a premium fullscreen overlay that opens when users click the "Listen" button. It displays your latest release with links to multiple streaming platforms.

### How to Update Platform Links

When you release new music, update the smart links in `data/latestRelease.json`:

```json
{
  "appleMusicUrl": "https://music.apple.com/us/album/your-album/id",
  "albumLink": "https://album.link/us/i/1871631282"
}
```

**These fields are preserved across automatic Spotify updates**, so you only need to set them once per release.

### Supported Platforms

- **Spotify** (required) — Auto-populated from Spotify API
- **Apple Music** (optional) — Shows if `appleMusicUrl` is set
- **All Platforms** (optional) — Shows if `albumLink` is set (use album.link or song.link)

To hide a platform button, simply set its URL to an empty string `""` or remove the field.

## Featured Release System

This website includes an automated system that fetches your latest release from Spotify and updates the site automatically using GitHub Actions.

### How It Works

1. **Script** (`scripts/fetch-latest-release.mjs`) — Fetches latest release data from Spotify API
2. **Data** (`data/latestRelease.json`) — Stores the latest release information
3. **GitHub Actions** (`.github/workflows/update-latest-release.yml`) — Runs every 6 hours to check for new releases
4. **Frontend** (`js/featuredRelease.js`) — Displays the release on your website

### Initial Setup

#### 1. Create a Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **Create app**
4. Fill in the details:
   - **App name**: e.g., "Deric Website Auto-Update"
   - **App description**: e.g., "Fetches latest releases for website"
   - **Redirect URI**: `http://localhost` (required but not used)
   - **APIs used**: Select "Web API"
5. Accept the terms and click **Save**
6. On your app page, click **Settings**
7. Copy your **Client ID** and **Client Secret**

#### 2. Add Secrets to GitHub Repository

1. Go to your GitHub repository: `https://github.com/dericmusic/dericmusic.github.io`
2. Click **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add two secrets:
   - **Name**: `SPOTIFY_CLIENT_ID` | **Value**: (paste your Client ID)
   - **Name**: `SPOTIFY_CLIENT_SECRET` | **Value**: (paste your Client Secret)

#### 3. Enable GitHub Actions

1. Go to the **Actions** tab in your repository
2. If workflows are disabled, click **Enable workflows**
3. The workflow will now run automatically every 6 hours

### Manual Update

To manually trigger an update:

1. Go to **Actions** tab in your repository
2. Click on **Update Latest Release** workflow
3. Click **Run workflow** → **Run workflow**

The workflow will fetch your latest release and commit the updated data if there are changes.

### Customization

#### Add a Mood Line

The "mood line" is an optional tagline that appears below the release title. To add one:

1. Open `data/latestRelease.json`
2. Update the `moodLine` field:
   ```json
   {
     "moodLine": "The vibe is immaculate. 🌙"
   }
   ```
3. Commit and push the change
4. The mood line will be preserved even when the release updates

#### Change Update Frequency

Edit `.github/workflows/update-latest-release.yml` and modify the cron schedule:

```yaml
schedule:
  - cron: '0 */6 * * *'  # Every 6 hours
  # - cron: '0 0 * * *'  # Daily at midnight
  # - cron: '0 */12 * * *'  # Every 12 hours
```

#### Change Artist ID

If you need to update the Spotify Artist ID, edit `scripts/fetch-latest-release.mjs`:

```javascript
const ARTIST_ID = '08nIFJLOyYWc5eWJCa4S8X';  // Change this
```

## Development

### Email list setup

The homepage and Contact newsletter areas use the public MailerLite embed (`account: 2674520`, `data-form: ZEx5pV`). The account owner selected `Deric Updates`. Each page loads the universal script once via `js/newsletter.js`; MailerLite owns validation, submission, and confirmation. Styling is scoped in `css/newsletter.css`. The fallback stays open until form markup exists and the template’s required Groot, jQuery, and inputmask scripts emit their native load events. A script error or timeout keeps the request form available; a visitor already using it keeps it open even after a delayed load. Script loading alone does not verify email delivery. A clearly labeled Formspree request form remains available if the embed fails or the visitor chooses it. Formspree receives addresses, but it is not the campaign mailing list. Fan, booking, and merch forms share the same Formspree endpoint and should not be imported as general newsletter subscribers.

No API token is needed for this embed. For future replacement or account changes:

1. Sign in to MailerLite. Under **Subscribers → Groups**, create `Deric Updates` if it is missing.
2. Under **Forms → Embedded forms**, create or open a website signup form and select `Deric Updates` as its subscriber group. Finish the editor and save.
3. From the form overview, copy the **public website embed code** (both the universal snippet and the individual form snippet). This public code can be shared with the website maintainer; never share passwords or API tokens in chat.
4. Integrate that actual code into a local preview of the homepage and Contact newsletter area. Do not guess account IDs, form IDs, or submission endpoints. The homepage modal dynamically includes the embed controls in its focus trap; its existing JSON submit handler remains attached only to the Formspree fallback. Do not attach that handler to MailerLite.
5. With an explicitly consented test address, verify signup, the confirmation email, and membership in `Deric Updates`. Check mobile display, keyboard navigation, success/error behavior, and the account's current plan limits. Only then consider switching the live signup areas in a separately authorized deployment. Keep fan, booking, and merch inquiries on Formspree; do not import those contacts.

Official instructions: [create an embedded form](https://www.mailerlite.com/help/how-to-create-an-embedded-form) and [install it on a website](https://www.mailerlite.com/help/how-to-add-a-form-to-your-website).

For optional API-assisted setup, the account owner must add `MAILERLITE_API_TOKEN` through the saved cloud environment's secure secret settings and start a session where it is injected. Never put it in website code, shell commands, or GitHub Pages files. Merely saving a secret name does not supply a value to a running session.

```bash
# Read-only: lists the target group and embedded-form metadata; no subscribers fetched.
node scripts/create-mailerlite-group.mjs --check

# Explicit setup: creates Deric Updates only if absent; no campaigns or subscribers touched.
node scripts/create-mailerlite-group.mjs

# Offline regression tests; no real account requests.
node --test scripts/create-mailerlite-group.test.mjs
```

The read-only check does not prove the form's group assignment or email delivery. Confirm those in the account and a consented end-to-end test. The published REST forms API lists and updates forms but does not document form creation; the account editor is the supported route used here.

### Local Testing

To test the Spotify fetch script locally:

```bash
# Set environment variables
export SPOTIFY_CLIENT_ID="your_client_id"
export SPOTIFY_CLIENT_SECRET="your_client_secret"

# Run the script
node scripts/fetch-latest-release.mjs
```

### File Structure

```
dericmusic.github.io/
├── index.html              # Main website
├── style.css               # Styling
├── hero.css                # Hero section styles
├── css/
│   └── listen-portal.css   # Listen Portal modal styles
├── js/
│   ├── featuredRelease.js  # Featured Release frontend logic
│   └── listen-portal.js    # Listen Portal modal logic
├── data/
│   └── latestRelease.json  # Latest release data (auto-updated)
├── scripts/
│   └── fetch-latest-release.mjs  # Spotify API fetcher
└── .github/
    └── workflows/
        └── update-latest-release.yml  # GitHub Actions workflow
```

## License

© 2026 Deric. All rights reserved.

### MailerLite verification (2026-10-02)

The public embed is wired locally. No real signup has been submitted; the account owner will test receipt and group membership after publication. Local browser checks cover simulated embed rendering at mobile and desktop widths, single-loader behavior, focus trapping, invalid email prevention, and blocked-script/no-JavaScript fallback, including markup present with a failed or delayed Groot script. These simulations do not prove the external vendor's actual markup or end-to-end delivery. This recovered environment starts successfully. GitHub repository and Pages API access, the public site, and the MailerLite universal script and form template are reachable. The required Groot script now returns HTTP 200 without a redirect. Its downstream assets on assets.mlcdn.com and static.mailerlite.com remain blocked by the environment proxy (CONNECT 403), and Chromium reports ERR_CERT_AUTHORITY_INVALID for assets.mailerlite.com. Actual vendor browser rendering and end-to-end signup are not verified here. The owner authorized publication with the Formspree request fallback available and will personally test receipt and group membership. Deployment is verified separately through GitHub Pages status and the live first-party files; no signup or campaign is sent during these checks.

To rerun browser regression checks in this environment, serve the repository on `127.0.0.1:8765` and run `node scripts/test-newsletter.cjs`. Requires Playwright and Chromium (`CHROMIUM_PATH` can override `/usr/bin/chromium`). External requests are blocked or simulated, including all subscription POSTs. Screenshots are written to `/tmp/deric-ml-*.png`.

### Album countdown

The homepage announces `#PLUGGAINTDEAD 2` with the owner-supplied cover art, a compact title/date countdown, and red accents. It stays fixed to one viewport with no page scrolling on either axis; a compact two-column arrangement fits short landscape screens. The email modal retains independent internal scrolling. The target is October 9, 2026 at 12:00 AM Eastern (EDT), stored as `2026-10-09T00:00:00-04:00` (04:00 UTC) in `js/album-countdown.js`. At release the clock hides and shows “Release day is here.” The visible release date remains available without JavaScript. “Save the date” downloads a local `.ics` calendar event at the same UTC instant; no calendar account or invitation is touched. The countdown does not announce each ticking second to screen readers. The owner supplied the pre-save URL `https://hypeddit.com/nrihmk`; it is linked before release and hidden once the release time arrives. Its destination content could not be independently checked because this environment blocks Hypeddit.

Run timing tests with `node --test scripts/album-countdown.test.cjs`; browser layout checks use `node scripts/test-album-countdown.cjs` with the site served on `127.0.0.1:8765`.

### October 2026 visual refresh

The release cover is stored at `assets/releases/pluggaintdead-2-cover.jpg`. Site accents use red; the release card and newsletter controls fit portrait and short landscape screens. Newsletter fields use 16px text to avoid iOS focus zoom, and the modal initially focuses its close control. Background playback prefers MP4, resumes after visibility changes, and falls back to the poster while loading or buffering. Reduced-motion and data-saving preferences retain the poster.
