const $ = s => document.querySelector(s);
const logEl = $("#log");
const rand  = n => Math.floor(Math.random() * n);
const pick  = a => a[rand(a.length)];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

let generatedUrls = [];

function log(html, cls = "") {
  const line = document.createElement("div");
  if (cls) line.className = cls;
  line.innerHTML = html;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

/* ---------------------------------------------------------------- pools ---- */

const FOOD_POOL = [
  "Ragi dosa with chutney", "Foxtail millet pulao", "Bajra khichdi", "Millet upma",
  "Jowar roti thali", "Millet idli with sambar", "Ragi porridge", "Barnyard millet fried rice",
  "Kodo millet biryani", "Millet protein bowl", "Little millet pongal", "Ragi banana pancakes",
  "Millet poha", "Millet cutlets", "Pearl millet salad bowl", "Millet smoothie bowl",
  "Ragi malt drink", "Millet khichdi", "Proso millet veggie bowl", "Millet energy bars",
  "Millet bisi bele bath", "Millet lemon rice", "Millet dhokla", "Ragi mudde with saaru"
];
const NAME_POOL   = ["Aarav", "Diya", "Rohan", "Ananya", "Kabir", "Ishita", "Vivaan", "Meera", "Arjun", "Saanvi", "Aditya", "Nisha"];
const CITY_POOL   = ["Bengaluru", "Pune", "Hyderabad", "Chennai", "Mumbai", "Delhi", "Kochi", "Coimbatore", "Indore", "Nagpur"];
const GENERIC_POOL = [
  "Pretty good overall", "Worth trying once", "Depends on the price", "Would like more options",
  "Affordable and healthy", "Good for daily lunch", "Needs better taste", "Convenient and quick",
  "Portion should be filling", "Looks promising"
];

/* ---------------------------------------------------------- form parsing ---- */

function sliceBalanced(str, start) {
  let depth = 0, inStr = false, esc = false, quote = "";
  for (let i = start; i < str.length; i++) {
    const c = str[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === quote) inStr = false;
    } else {
      if (c === '"' || c === "'") { inStr = true; quote = c; }
      else if (c === "[") depth++;
      else if (c === "]") { depth--; if (depth === 0) return str.slice(start, i + 1); }
    }
  }
  return null;
}

function parseForm(html) {
  const marker = "FB_PUBLIC_LOAD_DATA_";
  const mi = html.indexOf(marker);
  if (mi === -1) throw new Error("FB_PUBLIC_LOAD_DATA_ not found. Is this a published /viewform link?");

  const open = html.indexOf("[", mi);
  const jsonText = sliceBalanced(html, open);
  if (!jsonText) throw new Error("The form data block is malformed.");

  let data;
  try { data = JSON.parse(jsonText.replace(/\bundefined\b/g, "null")); }
  catch { throw new Error("Could not parse the form data block."); }

  const raw = data?.[1]?.[1];
  if (!Array.isArray(raw)) throw new Error("No question array found in the form data.");

  const questions = [];
  for (const q of raw) {
    if (!Array.isArray(q)) continue;
    const type = q[3];
    const title = typeof q[1] === "string" ? q[1] : "Untitled question";

    // Grid question: q[4] holds one entry per row
    if (type === 7 && Array.isArray(q[4])) {
      q[4].forEach((row, i) => {
        const entryId = row?.[0];
        const rowLabel = row?.[8]?.[1] || `Row ${i + 1}`;
        const options = Array.isArray(row?.[1])
          ? row[1].map(o => (Array.isArray(o) ? o[0] : o)).filter(x => typeof x === "string")
          : [];
        if (entryId) questions.push({ title: `${title} — ${rowLabel}`, type: 2, entryId, options });
      });
      continue;
    }

    const entryId = q?.[4]?.[0]?.[0];
    if (!entryId) continue;
    const optsRaw = q?.[4]?.[0]?.[1];
    const options = Array.isArray(optsRaw)
      ? optsRaw.map(o => (Array.isArray(o) ? o[0] : o)).filter(x => typeof x === "string")
      : [];
    questions.push({ title, type, entryId, options });
  }

  if (!questions.length) throw new Error("Parsed successfully but found zero answerable questions.");
  return questions;
}

/* ------------------------------------------------------ answer generation --- */

function maybeBlank(s) { return Math.random() < 0.12 ? "" : s; }

function textFor(title) {
  const t = title.toLowerCase();
  if (/suggest|dish|comment|idea|recommend|like to see|menu/.test(t)) {
    return shuffle(FOOD_POOL).slice(0, 1 + rand(3)).join(", ");
  }
  if (/e-?mail/.test(t))                          return `user${1000 + rand(9000)}@gmail.com`;
  if (/phone|mobile|contact|number|whatsapp/.test(t)) return String(6000000000 + rand(3999999999));
  if (/name/.test(t))                             return pick(NAME_POOL);
  if (/city|place|location|area|locality/.test(t)) return pick(CITY_POOL);
  if (/age|years old/.test(t))                    return String(18 + rand(25));
  if (/why|reason|explain|describe|elaborate/.test(t)) return pick(GENERIC_POOL);
  return shuffle(GENERIC_POOL).slice(0, 1 + rand(2)).join(", ");
}

// Slight skew toward the positive end — realistic for a health-food survey
function weightedScale() {
  const w = [10, 16, 24, 30, 20];
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < w.length; i++) if ((r -= w[i]) <= 0) return String(i + 1);
  return "4";
}

function answerFor(q) {
  switch (q.type) {
    case 2: case 3: {                       // multiple choice / dropdown
      const opts = q.options.length ? q.options : ["Yes", "No"];
      return [pick(opts)];
    }
    case 4: {                               // checkboxes — pick 1–2
      const opts = q.options.length ? q.options : ["Yes"];
      const k = 1 + rand(Math.min(2, opts.length));
      return shuffle(opts).slice(0, k);
    }
    case 5:                                 // linear scale
      return [weightedScale()];
    case 0: case 1:                         // short answer / paragraph
      return [maybeBlank(textFor(q.title))];
    default:
      return q.options.length ? [pick(q.options)] : [];
  }
}

function buildParams(questions) {
  const parts = [];
  for (const q of questions) {
    for (const a of answerFor(q)) {
      parts.push(`entry.${q.entryId}=${encodeURIComponent(a)}`);
    }
  }
  return parts.join("&");
}

/* ------------------------------------------------------------- networking --- */

async function fetchFormHtml(url) {
  // 1) direct fetch (works because of host_permissions)
  try {
    const r = await fetch(url, { credentials: "omit", cache: "no-store" });
    if (r.ok) {
      const html = await r.text();
      if (html.includes("FB_PUBLIC_LOAD_DATA_")) return { html, finalUrl: r.url };
    }
  } catch {}

  // 2) fallback: open a hidden tab and read its DOM
  log("Direct fetch blocked — falling back to hidden tab…", "dim");
  const tab = await chrome.tabs.create({ url, active: false });
  try {
    await waitForComplete(tab.id);
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.documentElement.innerHTML
    });
    const t = await chrome.tabs.get(tab.id);
    if (!result || !result.includes("FB_PUBLIC_LOAD_DATA_")) throw new Error("Page loaded but no form data found.");
    return { html: result, finalUrl: t.url };
  } finally {
    chrome.tabs.remove(tab.id).catch(() => {});
  }
}

function waitForComplete(tabId, timeout = 20000) {
  return new Promise(resolve => {
    let done = false;
    const finish = () => { if (!done) { done = true; chrome.tabs.onUpdated.removeListener(l); resolve(); } };
    const l = (id, info) => { if (id === tabId && info.status === "complete") finish(); };
    chrome.tabs.onUpdated.addListener(l);
    chrome.tabs.get(tabId).then(t => { if (t.status === "complete") finish(); }).catch(finish);
    setTimeout(finish, timeout);
  });
}

async function submitViaTab(url) {
  const tab = await chrome.tabs.create({ url, active: false });
  try { await waitForComplete(tab.id, 15000); }
  finally { chrome.tabs.remove(tab.id).catch(() => {}); }
}

/* ------------------------------------------------------------------ main --- */

(async function main() {
  const cfg = await chrome.storage.local.get(["fb_url", "fb_count", "fb_delay", "fb_mode", "fb_cookies"]);
  const inputUrl = cfg.fb_url;
  const count    = cfg.fb_count || 30;
  const delay    = cfg.fb_delay || 800;
  const mode     = cfg.fb_mode || "fetch";
  const useCookies = !!cfg.fb_cookies;

  $("#target").textContent = count;
  $("#sub").textContent = "Fetching the form and reading its structure…";

  if (!inputUrl) { $("#sub").textContent = "No form URL saved. Reopen the popup."; return; }

  let questions, submitBase, formTitle = "";

  try {
    const { html, finalUrl } = await fetchFormHtml(inputUrl);
    questions = parseForm(html);

    const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    formTitle = m ? m[1].replace(/ - Google Forms$/i, "").trim() : "";

    // Derive the submission endpoint from the RESOLVED url (handles forms.gle short links)
    const u = new URL(finalUrl);
    const path = u.pathname.replace(/\/(viewform|formResponse|edit|preview)\/?$/, "");
    submitBase = `${u.origin}${path}/formResponse`;
    window.__formUrl = `${u.origin}${path}/viewform`;
  } catch (e) {
    $("#sub").textContent = "Could not read the form.";
    log(`<span class="err">✗ ${e.message}</span>`);
    $("#state").textContent = "error";
    return;
  }

  $("#sub").textContent = formTitle || "Form detected";
  $("#formInfo").textContent = `Submitting ${count} responses to: ${submitBase}`;
  $("#state").textContent = "running";

  const qlist = $("#qlist");
  qlist.textContent = questions.map((q, i) =>
    `${String(i + 1).padStart(2, "0")}. [type ${q.type}] ${q.title}\n     entry.${q.entryId}  (${q.options.length} options)`
  ).join("\n");

  log(`<span class="ok">✓ Form parsed — ${questions.length} questions detected.</span>`);
  log(`<span class="dim">Mode: ${mode === "tab" ? "tab (opens + closes a tab per submission)" : "fast fetch (no tabs)"} · cookies: ${useCookies ? "ON" : "OFF"} · delay ~${delay}ms</span>`);
  log("");

  let ok = 0, fail = 0;

  for (let i = 1; i <= count; i++) {
    const params = buildParams(questions);
    const url = `${submitBase}?usp=pp_url&${params}&_=${Math.random().toString(36).slice(2)}`;
    generatedUrls.push(url);

    try {
      if (mode === "tab") await submitViaTab(url);
      else await fetch(url, {
        mode: "no-cors",
        cache: "no-store",
        credentials: useCookies ? "include" : "omit"
      });
      ok++;
      log(`<span class="ok">#${String(i).padStart(3, "0")}</span> submitted  <span class="dim">${params.slice(0, 90)}…</span>`);
    } catch (e) {
      fail++;
      log(`<span class="err">#${String(i).padStart(3, "0")} failed: ${e.message}</span>`);
    }

    $("#done").textContent = ok;
    $("#fail").textContent = fail;
    $("#fill").style.width = `${(i / count) * 100}%`;

    if (i < count) await sleep(delay * (0.7 + Math.random() * 0.6));
  }

  $("#state").textContent = fail ? "done (with errors)" : "done";
  $("#sub").textContent = `Finished — ${ok} submitted, ${fail} failed.`;
  log("");
  log(`<span class="ok">✓ Done. ${ok} responses sent${fail ? `, ${fail} failed` : ""}.</span>`);
  log(`<span class="hi">→ Check your form's Responses tab now. It should read ${ok} new entries.</span>`);

  const a = $("#openForm");
  a.href = window.__formUrl;
  a.style.display = "inline-block";
})();

/* ------------------------------------------------------------------ ui ----- */

$("#copy").addEventListener("click", async () => {
  if (!generatedUrls.length) return;
  await navigator.clipboard.writeText(generatedUrls.join("\n"));
  $("#copy").textContent = `Copied ${generatedUrls.length} URLs`;
  setTimeout(() => ($("#copy").textContent = "Copy all generated URLs"), 1800);
});

$("#preview").addEventListener("click", () => {
  const cfg = window.__previewFn;
  if (!cfg) return;
});

$("#again").addEventListener("click", () => location.reload());