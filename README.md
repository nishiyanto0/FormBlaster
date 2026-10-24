# FormBlaster Studio

A Chrome extension that reads a Google Form's questions, lets you design the
exact answer distribution you want, and submits the whole batch at once.

Built because collecting 30 survey responses when you have no friends is
genuinely painful.

> **Status:** a student tool, not a research-grade instrument. Read the
> disclaimer below before you cite anything from it.

---

## ⚠️ Read this first — what this actually is

This extension submits **synthetic responses** to your form. It is a
shortcut, not a replacement for real data collection.

**Use it when:**
- You have an assignment that says "collect 30 responses" and you have 14
- You need a filled-out dataset to build charts and write a report from
- You are prototyping a survey and want to see how the form flows
- You need to demo/test your own form without asking 30 people

**Do NOT use it when:**
- Your assignment explicitly says "survey 30 people" and your professor
  cares about the distinction
- You are doing real market research where the sample matters
- You need demographic accuracy — the answers are random, not sampled from
  a real population

**Be honest about it.** The correct disclosure is:

> "I collected N real responses and topped up the rest programmatically to
> reach the required count."

Nobody penalises this. Most people find it interesting.

**The real limitation:** 30 synthetic responses are not 30 independent
humans. They are one person's random number generator. Statistical tests
that assume independent sampling (chi-square, t-tests) are technically
violated. For a college report this is fine. For a published paper, it is
not.

---

## Features

- Paste any Google Form link (`docs.google.com/forms/d/e/...` or `forms.gle/...`)
- Auto-detects every question by reading the form's `FB_PUBLIC_LOAD_DATA_` block
- Extracts each field's `entry.XXXX` parameter name automatically
- **Live distribution preview** — percentage bars update as you type weights
- Three modes per question:
  - **Exact distribution** — guarantees the counts you specify, not "roughly"
  - **Weighted random** — soft probabilities with natural variance
  - **Fixed** — pin one answer for every response
- Custom text-answer pool for free-text fields (your own words, randomly assigned)
- Per-question text pools if you want field-specific answers
- Concurrency control — fires the whole batch in parallel, no tabs opened
- Exports the generated dataset as CSV
- Saves your distribution settings per form
- Handles: short text, paragraph, multiple choice, dropdown, checkboxes,
  linear scale, date, time

## Install

No build step, no dependencies, no `npm install`. It's plain files.

**Chrome / Brave / Opera / Vivaldi**

1. Download this repo — either `git clone`, or the green **Code** button →
   **Download ZIP** and unzip it
2. Go to `chrome://extensions`
3. Toggle **Developer mode** ON (top-right corner)
4. Click **Load unpacked**
5. Select the folder containing `manifest.json`
   (the folder itself — not a file inside it)
6. The extension appears in the list. Click the puzzle-piece icon in your
   toolbar and **pin** FormBlaster Studio

**Edge**

Same steps, but go to `edge://extensions` and the toggle is called
**Developer mode** in the left sidebar.

**Firefox**

Manifest V3 is supported, but `chrome.scripting` needs Firefox 101+.
Go to `about:debugging#/runtime/this-firefox` → **Load Temporary Add-on** →
select `manifest.json`. Note: Firefox unloads temporary add-ons on restart.

→ Full walkthrough with troubleshooting: **[INSTALL.md](INSTALL.md)**

## Usage

1. Open your Google Form in a tab
2. Click the extension icon → **Open Studio**
3. The form is auto-detected and every question is listed with its entry ID
4. Set how many responses you need
5. Paste your own answers into the text pool (one per line)
6. Tune each question's distribution — bars update live
7. Click **Blast responses**

Finished in seconds. Then refresh your form's Responses tab to confirm.

## How it works

Every published Google Form exposes a JavaScript variable called
`FB_PUBLIC_LOAD_DATA_` in its page source. It contains the full question
schema, including the internal `entry.XXXXX` parameter name for each field.

Google Forms also accepts a `/formResponse` endpoint. Appending those
`entry.XXXXX=value` pairs as query parameters submits a response directly,
with no browser interaction:

    https://docs.google.com/forms/d/e/<FORM_ID>/formResponse
      ?usp=pp_url
      &entry.1234567890=Answer+1
      &entry.0987654321=Answer+2

This extension automates the whole loop: parse the schema → generate
answers → build URLs → fire them concurrently.

## Caveats and known limitations

- **"Limit to 1 response" + signed in** will collapse your whole batch into
  one submission. Cookies are sent as `omit` by default to avoid this.
- **Forms that require sign-in** will reject anonymous submissions — enable
  the cookies toggle in that case (but see the point above).
- **File-upload questions** are not supported by the `formResponse` endpoint.
- **Fast mode is opaque.** It uses `fetch(..., {mode: "no-cors"})`, so the
  extension cannot read the response to confirm receipt. Verify via the
  form's Responses tab. Tab mode gives real confirmation but is ~4x slower.
- **Exact distribution is enforced per run**, not globally across runs.
- **reCAPTCHA** on a form is untested — most forms don't have it.

## Credits

**The idea is not mine.** The core technique — reading `FB_PUBLIC_LOAD_DATA_`
and constructing a pre-filled `/formResponse` URL by hand — was shared on
Reddit by **u/emaguireiv**.

- Profile: https://www.reddit.com/user/emaguireiv/

That Reddit post is the reason this exists. This extension just wraps the
manual trick in a UI and automates the repetition. All credit for the
underlying method goes to them.

## License

MIT — see [LICENSE](LICENSE).

## Disclaimer

Not affiliated with, endorsed by, or connected to Google or Reddit.
Google Forms is a trademark of Google LLC.
