# Bo's Space — iOS Share Extension

Save Instagram and TikTok reels directly to your inspiration repo from the iOS share sheet.

---

## What you need before starting

- Mac with Xcode installed (free from the Mac App Store)
- Apple Developer account ($99/year at developer.apple.com)
- Your production app URL (e.g. `https://bo-tasks.vercel.app`)
- An `INSPIRATION_API_KEY` value set in your Vercel environment variables

---

## Step 1 — Find your Apple Team ID

1. Go to developer.apple.com → Account → Membership
2. Copy the **Team ID** (looks like `AB12CD34EF`)
3. Open `project.yml` in this folder and paste it into `DEVELOPMENT_TEAM: ""`

---

## Step 2 — Register the App Group

This lets the container app and share extension share settings.

1. Go to developer.apple.com → Certificates, Identifiers & Profiles → Identifiers
2. Click **+** → App Groups → Continue
3. Description: `Bo Space` — Identifier: `group.com.bo.bospace` → Register
4. Go to your App ID (`com.bo.bospace`) → Edit → enable **App Groups** → select `group.com.bo.bospace` → Save
5. Do the same for the extension App ID (`com.bo.bospace.ShareExtension`)

---

## Step 3 — Generate the Xcode project

Install XcodeGen if you haven't:
```
brew install xcodegen
```

Then from this `ios/` folder:
```
xcodegen generate
```

This creates `BoSpace.xcodeproj`. You only need to run this once (or after editing `project.yml`).

---

## Step 4 — Open in Xcode and sign

1. Double-click `BoSpace.xcodeproj`
2. In the Project Navigator, click **BoSpace** (the project, not a target)
3. Select the **BoSpace** target → Signing & Capabilities
   - Check **Automatically manage signing**
   - Set Team to your Apple Developer account
4. Do the same for the **ShareExtension** target
5. For both targets, click **+ Capability** → **App Groups** → check `group.com.bo.bospace`

---

## Step 5 — Build and install

1. Plug your iPhone into your Mac with a USB cable
2. In Xcode, select your iPhone from the device dropdown (top left)
3. Press **▶ Run** (or ⌘R)
4. On your iPhone: Settings → General → VPN & Device Management → trust the developer certificate

---

## Step 6 — Configure the app

1. Open **Bo's Space** on your iPhone
2. Enter your Vercel URL: `https://your-app.vercel.app`
3. Enter your API key (the value of `INSPIRATION_API_KEY` in Vercel)
4. Tap **Save Settings**

---

## Step 7 — Test it

1. Open Instagram, find any reel
2. Tap the **Share** button → scroll the share sheet → tap **Bo's Space**
3. Add a title and notes (optional) → tap **Save to Bo's Space**
4. Open your web app → Content → Inspirations — it should appear instantly

---

## Troubleshooting

**"Bo's Space" doesn't appear in the share sheet**
The extension only activates for URLs. Make sure you're sharing a reel/post link, not a story or a non-URL item. Try force-quitting and reopening Instagram.

**"Open Bo's Space app to set your API URL"**
The App Group wasn't set up properly. Go back to Step 2 and make sure both App IDs have the group enabled, then rebuild.

**Server error after saving**
- Check that `INSPIRATION_API_KEY` in Vercel matches exactly what you typed in the app
- Make sure `supabase_inspirations_migration.sql` has been run in your Supabase SQL Editor
