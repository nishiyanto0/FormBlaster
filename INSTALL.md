# Installation guide

FormBlaster Studio is a **developer-mode extension**. It is not on the Chrome
Web Store, so you load it manually. It takes about 60 seconds.

## Before you start

- Use a Chromium browser (Chrome, Edge, Brave, Opera, Vivaldi)
- You need the whole folder, not just one file
- You need the folder to contain `manifest.json` at its top level

## Step 1 — Get the files

**Option A — git**

    git clone https://github.com/nishiyanto0/FormBlaster.git

**Option B — no git**
1. Click the green **Code** button on the repo page
2. Choose **Download ZIP**
3. Unzip it somewhere permanent (not your Downloads folder if you plan to
   keep using it)

You should end up with a folder containing:

    manifest.json
    popup.html
    popup.js
    runner.html
    runner.js

## Step 2 — Open the extensions page

Paste the right address for your browser into the URL bar:

| Browser | Address |
|---|---|
| Chrome | `chrome://extensions` |
| Edge | `edge://extensions` |
| Brave | `brave://extensions` |
| Opera | `opera://extensions` |
| Vivaldi | `vivaldi://extensions` |

## Step 3 — Turn on Developer mode

- **Chrome, Brave, Opera, Vivaldi:** toggle in the **top-right corner**
- **Edge:** toggle in the **left sidebar**

## Step 4 — Load it

1. Click **Load unpacked** (Edge: **Load unpacked extension**)
2. A file picker opens
3. Navigate to your folder and select it — click the folder once, then
   **Select Folder**
4. The extension now appears in the list with a version number

## Step 5 — Pin it

1. Click the puzzle-piece icon in your toolbar (Extensions menu)
2. Find **FormBlaster Studio**
3. Click the pin icon next to it

The icon now sits in your toolbar. Click it to open the popup.

---

## Troubleshooting

**"Manifest file is missing or unreadable"**
You selected the wrong folder. You must select the folder that *directly*
contains `manifest.json` — not its parent, not a file inside it.

**The folder picker looks empty / won't let me select anything**
On macOS, the picker may hide files. Press `Cmd + Shift + .` to reveal hidden
files. On Windows, make sure you're in "Select Folder" mode, not "Select File".

**"Manifest version 2 is deprecated"**
You're on an old copy. This repo is Manifest V3. Re-download.

**Extension loads but does nothing when clicked**
Open `chrome://extensions`, find FormBlaster Studio, click **Errors**. Paste
the error in an issue.

**"Could not read the form" when I paste a link**
- Make sure the form is *published*, not the editor URL
  (`docs.google.com/forms/d/e/...` not `/forms/d/.../edit`)
- Make sure it's set to accept responses
- Short links (`forms.gle/...`) are supported
- If it still fails, your form likely requires sign-in — try the cookies
  toggle in Global settings

**Submissions went out but my Responses tab didn't change**
Your form has **Limit to 1 response** enabled and Google is treating all your
submissions as one person. Cookies are off by default to avoid this — but if
it still happens, open the form in an incognito window and blast from there.

**Nothing happens in Tab mode**
Some popup blockers interfere with background tab creation. Disable them for
`docs.google.com` and retry.

---

## Updating

1. Pull or re-download the files over your existing folder
2. Go to your extensions page
3. Click the **reload ↻** icon on the FormBlaster Studio card

## Uninstalling

Extensions page → **Remove**. Deleting the folder first will leave a broken
card — remove it from the browser first.

---

## Firefox note

Firefox supports MV3 but treats manually-loaded extensions as *temporary* —
they vanish when the browser restarts. To make it permanent you'd need to
package and sign it. For a quick session it works fine.

Go to `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** →
pick `manifest.json`. Minimum Firefox 101.
