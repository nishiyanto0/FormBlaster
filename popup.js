const $ = s => document.querySelector(s);

// Prefill from storage, and from the active tab if it's already a Google Form
(async () => {
  const saved = await chrome.storage.local.get(["fb_url", "fb_count", "fb_delay", "fb_mode", "fb_cookies"]);
  if (saved.fb_url)   $("#url").value    = saved.fb_url;
  if (saved.fb_count) $("#count").value  = saved.fb_count;
  if (saved.fb_delay) $("#delay").value  = saved.fb_delay;
  if (saved.fb_mode)  $("#mode").value   = saved.fb_mode;
  if (saved.fb_cookies) $("#cookies").checked = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.url && /docs\.google\.com\/forms|forms\.gle/.test(tab.url)) {
      $("#url").value = tab.url;
    }
  } catch {}
})();

$("#go").addEventListener("click", async () => {
  const url = $("#url").value.trim();
  const count = Math.max(1, Math.min(500, parseInt($("#count").value || "30", 10)));
  const delay = Math.max(200, Math.min(5000, parseInt($("#delay").value || "800", 10)));
  const mode = $("#mode").value;
  const cookies = $("#cookies").checked;

  if (!/^https?:\/\//.test(url)) { $("#msg").textContent = "Enter a full https:// form link."; return; }
  if (!/docs\.google\.com\/forms|forms\.gle/.test(url)) {
    $("#msg").textContent = "That doesn't look like a Google Form link."; return;
  }

  await chrome.storage.local.set({ fb_url: url, fb_count: count, fb_delay: delay, fb_mode: mode, fb_cookies: cookies });
  $("#go").disabled = true;
  $("#msg").textContent = "Launching runner…";

  await chrome.tabs.create({ url: chrome.runtime.getURL("runner.html") });
  window.close();
});