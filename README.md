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

The homepage and Contact signup forms currently send to Formspree. Formspree receives the addresses, but it is not the campaign mailing list. Fan, booking, and merch forms share the same Formspree endpoint and should not be imported as general newsletter subscribers.

To set up MailerLite, create and verify a Free account. Add a MailerLite API token as the `MAILERLITE_API_TOKEN` secret in the cloud environment, then run `node scripts/create-mailerlite-group.mjs` from this repository. The script creates the `Deric Updates` group if it does not already exist and prints its ID. Never put the API token in website code or GitHub Pages files.

Create the embedded signup form in MailerLite's account editor and attach it to the `Deric Updates` group. The published API can list and update forms, but cannot create them. Connect the public form code to the homepage and Contact signup areas only after a real test address reaches the group and its confirmation message arrives. Keep fan and booking inquiries on Formspree. Check the Free plan limits shown in the account before switching the live forms, since pricing and caps can change.

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
