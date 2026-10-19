<div align="center">

<img src="docs/banner.png" alt="Sky.Proxy — proxy manager for Chrome" width="100%">

<br>

<img src="src/assets/icons/icon128.png" alt="" width="72">

### Sky.Proxy

**A Chrome proxy manager with typed proxies, country flags, timezone-by-IP, and a transparent-glass interface.**

[![Manifest V3](https://img.shields.io/badge/Manifest-V3-48B457?style=flat-square&labelColor=0b1110)](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)
[![Version](https://img.shields.io/badge/version-2.4.1-48B457?style=flat-square&labelColor=0b1110)](#-installation)
[![Chromium](https://img.shields.io/badge/Chrome%20%2F%20Edge%20%2F%20Brave-supported-48B457?style=flat-square&labelColor=0b1110)](#-installation)
[![License](https://img.shields.io/badge/license-see%20LICENSE-6b7a74?style=flat-square&labelColor=0b1110)](#-license)

[Features](#-features) · [Screenshots](#-screenshots) · [Install](#-installation) · [How it works](#-how-it-works) · [Project layout](#-project-layout) · [বাংলা](#বাংলা)

</div>

---

## ✨ What it is

Sky.Proxy keeps a list of proxies, switches between them in one click, and puts the
**right protocol** and the **right timezone** behind every connection — all inside a
lightweight Manifest V3 extension with no build step, no framework and no external
dependencies.

The interface is built as **transparent glass**: soft light fields behind, frosted
panels in front, and two full themes (dark & light) designed separately rather than
inverted from one another.

> **The mark.** The green masked ball inside the wordmark is the current login of the
> brand — it replaces the letter “o” in **Proxy**, so the name is new while the sign stays
> recognisable: ball = identity, letters = name.

> **New in 2.4.** Every address carries a **country flag with its city** — the list reads
> like a checker table — and each row has a **Connect / Disconnect** control: green when
> that proxy carries your traffic, red when it does not, and the label shows the action
> under the pointer.

## 🎯 Features

<table>
<tr><td width="50%" valign="top">

### 🧩 1 · Paste a list — and see every type

Paste one proxy per line, or a hundred. Sky.Proxy parses them and **tells you what each
one is** before anything is saved:

| You paste | You get |
|---|---|
| `socks5://185.210.154.136:8162` | **SOCKS5** (from the scheme) |
| `socks4://91.108.4.12:4145` | **SOCKS4** (from the scheme) |
| `https://23.247.247.103:3771` | **HTTPS** (from the scheme) |
| `45.140.17.108:8080` | **HTTP\*** — guessed from the port |
| `user:pass@77.88.44.10:3128` | **HTTP** + credentials |
| `91.108.4.12:4145` | **SOCKS4\*** — 4145 is the classic SOCKS4 port |

- **Per-line categories** under the box, plus a summary row
  (`5 of 5 · HTTP 2 · HTTPS 1 · SOCKS5 1 · SOCKS4 1`).
- A `*` marks a **guess** — the type was inferred from the port, not declared.
- **Check type** runs a real probe over the pasted lines (one by one, proxy off) and
  replaces guesses with the protocol that actually answered.
- All four type filters are **always visible**, even at zero — an empty category is
  dimmed and inert instead of disappearing, so you can see the type is supported.
- Accepted formats: `ip:port`, `ip:port@login:pass`, `ip:port:login:pass`,
  `login:pass@ip:port`, full URLs, and hostnames (`proxy.example.com:8080`).
- **Type filters** in the list (All / HTTP / HTTPS / SOCKS5 / SOCKS4) with live counts.

</td><td width="50%" valign="top">

### 🌍 2 · Timezone by proxy IP

Turn on **Settings → Connection → Timezone by proxy IP** and the browser reports the
**active proxy’s timezone** to every page:

- Lookup chain: `ipwho.is` → `ipapi.co` → `ip-api.com`, then the proxy’s country as a
  fallback; the answer is cached for **7 days** (`tzCache`).
- Patched per page: `Intl.DateTimeFormat`, all local getters/strings of `Date`,
  `toLocale*`, `new Date(y, m, d, …)` and `Date()`.
- **UTC stays UTC** — `toISOString`, `Date.now()`, `getTime()` are untouched.
- Already-open tabs follow immediately; turning the proxy or the setting off restores
  the real zone at once.
- **Timezone only.** No geolocation, no language, no other fingerprint changes — and the
  computer’s clock and other apps are never touched.

</td></tr>
<tr><td valign="top">

### 🌐 3 · Every IP shows its country — and its city

The list reads like a checker table: address → **flag + “Philippines, Lahug”** → protocol →
state, in one line.

- Country and city are resolved **from the address itself** through `ipwho.is` →
  `ipapi.co` → `ip-api.com` — the proxy does not have to be reachable or even enabled.
- Each address is looked up **once** and cached for **30 days** (`geoCache`), so a restart,
  a reload or re-adding the same IP costs nothing.
- **255 flags** — every country and territory in one 17×12 sprite, instead of the 52
  hand-drawn ones from 2.1.
- Country names are localised (English · Русский · Українська) and searchable: type
  “philip”, “PH” or “lahug” and the row is found.
- A country **you** picked always wins over the detected one; editing the address clears the
  detected country, because it described the old address, not the new one.
- Turn automatic lookups off with **Settings → Connection → Country by IP**. Countries that
  are already known stay, and the row menu keeps **Detect country** for a single address.

</td><td valign="top">

### 🔌 4 · Connect / Disconnect — right in the row

One glance tells you what is carrying your traffic, and one click changes it.

- The proxy in use carries a **green “Connect”**; every other row reads **“Disconnected”**
  in red. No guessing from a ring or from the colour of the address.
- **Point at the pill and the label becomes the action:** the green one turns into a red
  **“Disconnect”**, a red one into a green **“Connect”**. What you see is what the click
  will do — and the label never changes width while it swaps.
- Click a **red** pill to switch to that proxy *and* turn the proxy on; click the **green**
  one to drop the connection and go direct. The pill is a real button, not a badge.
- While the switch is in flight it reads **“Connecting…”** in amber — it never claims a
  proxy is connected when it is only selected.
- The hero card, the row, the popup and the toolbar badge all read the same `state`, so no
  window can disagree with another — including the moment you connect straight from a row.
- Expired proxies are refused by the same path as before: the pill goes back to red and the
  hero explains why.

</td></tr>
<tr><td valign="top">

### 🪟 5 · Transparent glass theme

- A backdrop of four soft light fields (connection green, cool blue, depth, centre
  glow) that stays put while the page scrolls.
- Panels, cards, pills and rows are **frosted**: semi-transparent fills,
  `backdrop-filter: blur + saturate`, a bright top edge and a soft drop shadow.
- Menus, tooltips and toasts get a **denser, blurrier** treatment so text stays readable.
- **Dark and light** themes are tuned separately; both are checked for contrast.
- Respects `prefers-reduced-transparency` by falling back to solid surfaces.
- <sub>A browser extension cannot blur the desktop wallpaper behind its window — no
  extension can. “Transparent” here means transparent to the extension’s own backdrop,
  which is always visible and looks the same on any wallpaper.</sub>

</td><td valign="top">

### ⚡ 6 · Type check that stays out of your way

Verifying a protocol means asking the browser to use it — that cost is fixed, so the
work around it was cut instead:

| | before | now |
|---|---|---|
| Probe URL | `https://…/generate_204` (full TLS per scheme) | `http://…/generate_204`, TLS only as a fallback |
| Timeout per scheme | 4.5 s | 2 s |
| Lines with an explicit scheme | probed one by one | **skipped** — the scheme is already the answer |
| Same address checked twice | probed again | **cached for 24 h** (`typeCache`) |
| Dead address (`blackhole`, no RST) | 4 × timeout ≈ 18 s | stops after the first silence ≈ 4.5 s |

Measured on a local proxy: **19 ms** for a working proxy, **3 ms** from cache,
**26 ms** for a closed port, and **4.5 s** worst case for an address that swallows
packets — down from 18 s.

</td></tr>
<tr><td valign="top">

### ⚙️ 7 · The rest of the toolbox

- **Power switch** with live status (connecting / on / off / error) and badge on the icon.
- **Switch to the next on failure** — automatic failover to the first proxy that answers.
- **Test proxy on connect** — verifies the proxy before handing it the traffic, so a dead
  server shows up as an error instead of a page timeout.
- **Block WebRTC** (optional permission) so sites cannot see your real IP.
- **Black & white lists** — proxy only these sites, or everything except these.
- **Reload tab on proxy change**, **Restore state on startup**.
- **Hotkeys** — `Ctrl+Shift+1` toggle, `Ctrl+Shift+2` next proxy, `Ctrl+Shift+5` popup.
- **Per-tab proxying** — “Proxy for: this site” straight from the popup.
- **Import by API key** — pull the proxy list from your account, with expiry and country
  refreshed automatically.
- **Export / duplicate / tags / notes / search**, country flags with cities, expiry chips and renew.
- **Request monitor** — a third window that lists the tab’s requests with an
  “errors only” filter.
- **3 interface languages** — English · Русский · Українська (picked from the browser locale).
- **Legacy migration** — records from the old 2.0.0 storage are upgraded on first run.

</td><td valign="top">

### 🧪 Test suite

A Playwright harness drives a real Chromium with the extension loaded:

| Suite | Covers |
|---|---|
| `t12-full` | 20 steps: add, connect, timezone apply/switch/clear, settings, popup |
| `t16-regress` | rows, filters, search, tabs, theme, help, export, duplicates |
| `t18-typerow` · `t11c` | proxy-type row and the “Check type” flow |
| `t20-final` | end-to-end run on a clean profile |
| `t21-warns` | console must stay warning-free |
| `t22-deep` | `UTC`/`toISOString` untouched, +5:45, date parsing |
| `t23-socks4-fast` | SOCKS4 add/apply, always-visible filters, cache, speed |
| `t24-parity` | locale parity, every `msg()` key exists, all four chips |
| `t25-allfeatures` | paste, connect, settings tabs, help, theme, popup pick |
| `t19-legacy` | 2.0.0 storage: types added, settings/state defaults written |
| `t26-geo` | country + city by IP, flag in the row, Connect/Disconnect pill, `Country by IP` switch |
| `t27-package` | the packed release folder loads: worker, sprite, flags positioned on the grid |

**All green, zero console errors.**

</td></tr>
</table>

## 📸 Screenshots

<div align="center">

**Options — proxies (dark)**
<img src="docs/options-dark.png" alt="Sky.Proxy options page, dark glass theme" width="100%">

**Options — proxies (light)**
<img src="docs/options-light.png" alt="Sky.Proxy options page, light glass theme" width="100%">

**Every row: flag, country, city — and Connect / Disconnect**
<img src="docs/rows-flags.png" alt="Proxy list: country flag and city next to each IP, a green Connect pill on the active proxy and red Disconnected pills elsewhere" width="100%">
<img src="docs/rows-flags-light.png" alt="The same list in the light glass theme" width="100%">

**The pill names the state, and the action on hover**
<img src="docs/rows-connect.png" alt="The active row shows a green Connect pill; with the pointer on it the same pill turns red and reads Disconnect" width="100%">

</div>

<table>
<tr>
<td width="50%"><img src="docs/popup-dark.png" alt="Popup, dark"></td>
<td width="50%"><img src="docs/popup-light.png" alt="Popup, light"></td>
</tr>
<tr>
<td align="center"><sub>Popup — dark</sub></td>
<td align="center"><sub>Popup — light</sub></td>
</tr>
</table>

<div align="center">

**Paste list — every line is recognised and typed before it is added**
<img src="docs/paste-types.png" alt="Bulk paste with per-line proxy type recognition (SOCKS4, SOCKS5, HTTPS)" width="100%">

**All four protocols — SOCKS4 included, in the filter and in the add form**
<img src="docs/filters-socks4.png" alt="Type filters with SOCKS4 selected" width="100%">
<img src="docs/add-protocols.png" alt="Add form with HTTP, HTTPS, SOCKS5 and SOCKS4" width="100%">

**Settings — connection, timezone by IP, proxy type**
<img src="docs/settings-dark.png" alt="Sky.Proxy settings page" width="100%">

</div>

<table>
<tr>
<td width="50%"><img src="docs/requests-dark.png" alt="Request monitor, dark"></td>
<td width="50%"><img src="docs/requests-light.png" alt="Request monitor, light"></td>
</tr>
<tr>
<td align="center"><sub>Request monitor — dark</sub></td>
<td align="center"><sub>Request monitor — light</sub></td>
</tr>
</table>

## 🚀 Installation

### From source (unpacked)

```bash
# use the URL of your repository (the name below is just a placeholder)
git clone https://github.com/Akash-Debnath1/<repo>.git
cd <repo>
```

1. Open `chrome://extensions` (or `edge://extensions`, `brave://extensions`).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and select the repository folder (the one containing
   `manifest.json`).
4. Pin the extension and open the popup — add your first proxy.

> The repository root **is** the extension: `manifest.json`, `src/`, `_locales/` and
> `tools/` are exactly what Chrome needs. The `docs/` folder is only for this README.

### Updating

Re-download / `git pull`, then press the ↻ button on the extension card in
`chrome://extensions`. Your proxy list and settings are kept — storage is migrated
forward automatically (see `src/background/migration.js`).

## 🧠 How it works

```
popup ─┐
       ├─ chrome.runtime messaging ─→ service worker (MV3)
options┤                               ├── proxy.js      chrome.proxy + PAC
       │                               ├── probe.js      "test on connect" / failover
requests┘                              ├── typecheck.js  live SOCKS5/SOCKS4/HTTP/HTTPS probe
                                       ├── tz.js         Intl/Date patch injector
                                       ├── geo.js        country + city by IP
                                       ├── api.js        account API by key
                                       ├── pac.js        per-site routing rules (PAC)
                                       ├── badge.js      toolbar state
                                       └── migration.js  2.0.0 → 2.x storage
```

- **State lives in `chrome.storage.local`** and is validated by a schema module
  (`src/shared/schema.js`); every window subscribes to changes, so the popup, the page and
  the request window never diverge.
- **Parsing** is one shared module (`src/shared/parse.js`) — the same rules for the bulk
  box, the manual fields and the API import.
- **Types** come from `src/shared/proxytype.js`: a declared scheme always wins, a port
  guess is marked as such, and `typecheck.js` can confirm it for real.
- **Timezone** works by injecting a small document-start script per tab
  (`src/background/tz.js` + `src/shared/tzcore.js`) that swaps the `Intl`/`Date` surface
  for the zone resolved for the active IP.
- **Country and city** are resolved by `src/background/geo.js` for records that have no
  country yet: `ipwho.is` → `ipapi.co` → `ip-api.com`, one answer cached for 30 days
  (`geoCache`), at most 60 addresses per pass, 120 ms apart. A country that came from the
  account or from your own pick is never overwritten.
- **No network calls to anything except** the timezone and country lookups, the optional
  account API (`proxys.io`) and the sites you visit.

## 🗂 Project layout

```
manifest.json            MV3 manifest (name, version, permissions, commands)
_locales/{en,ru,uk}/     ~920 UI strings per language
src/background/          service worker: proxy, PAC, probe, timezone, typing, API, migration
src/shared/              tokens.css · brand.css · glass.css · schema · parse · state · i18n …
src/options/             full page: proxies, settings, hotkeys, lists, help
src/popup/               toolbar popup: switch, per-site, lists, notifications
src/requests/            request monitor window
src/assets/              fonts (Onest, JetBrains Mono), icons, logos, flags.png (255-country sprite)
src/shared/flagmap.js    flag codes in sprite order (generated with the sprite)
tools/gen-tz.mjs         regenerates the timezone/country tables
tools/build-flags.js     renders src/assets/flags.png from the flag-icons set
docs/                    screenshots used by this README
```

## 🌐 Permissions — and why

| Permission | Why it is needed |
|---|---|
| `proxy` | The whole point: apply and clear the proxy configuration. |
| `storage` | Keep your proxy list, settings and caches locally. |
| `webRequest`, `webRequestAuthProvider` | Supply proxy credentials when a server asks for them. |
| `alarms` | Refresh the account list, expiry dates and the timezone cache. |
| `notifications` | Tell you when a proxy fails or a subscription expires. |
| `scripting` | Inject the timezone patch into pages. |
| `favicon` | Show site icons in the request monitor. |
| `<all_urls>` | Needed to apply a proxy to all traffic, to patch timezones and to ask the country services about an address. |
| `privacy` *(optional)* | WebRTC policy, only if you turn “Block WebRTC” on. |

Nothing is collected or sent anywhere except the lookups described above.

## 🧭 Version history

| Version | What changed |
|---|---|
| **2.4.1** | The row pill names the **state** and previews the **action**: green “Connect” on the proxy in use, red “Disconnect” under the pointer (and the other way round on a red row). Also fixed a state-write race that could leave a proxy enabled in the browser but *off* in the list after connecting straight from a row. |
| **2.4.0** | **Country flag + city** beside every address (looked up by IP, cached 30 days, 255 flags, `Country by IP` switch) and a **Connect / Disconnect** pill in every row — green while that proxy carries your traffic, red otherwise. |
| **2.3.0** | **SOCKS4 is always visible** in the type filter, can be added from the form, and port 4145 is recognised as SOCKS4; **“Check type” is much faster** (cheap HTTP probe, 2 s timeout, scheme lines skipped, 24 h result cache, dead-host shortcut). |
| **2.2.1** | The header button is now **Update Now** and opens the author’s GitHub. |
| **2.2.0** | Rebranded to **Sky.Proxy** (ball-as-o wordmark) and rebuilt the UI as a **transparent glass** theme in both dark and light. |
| **2.1.0** | Proxy **types** (SOCKS5 / SOCKS4 / HTTP / HTTPS) with per-line recognition in the paste box, a live “Check type” probe and type filters; **timezone by proxy IP**. |
| 2.0.0 | Ground-up rewrite on Manifest V3. |

## 🤝 Contributing

Issues and pull requests are welcome. Useful things to know:

- There is **no build step** — edit a file, press ↻ in `chrome://extensions`, reload.
- UI strings live in `_locales/*/messages.json`; add a key to **all three** languages.
- Layout/material rules: `src/shared/tokens.css` (colours), `glass.css` (material),
  `brand.css` (wordmark) — window stylesheets only handle their own layout.

## 🔗 Links

- Author — [github.com/Akash-Debnath1](https://github.com/Akash-Debnath1)
- Issues — [github.com/Akash-Debnath1/Sky.Proxy/issues](https://github.com/Akash-Debnath1/Sky.Proxy/issues)

## 🙏 Credits

- **Flag artwork** — [flag-icons](https://github.com/lipis/flag-icons) by Panayiotis
  Lipis (MIT). The 255 country flags in `src/assets/flags.png` are rendered from that set
  by `tools/build-flags.js`; the sprite itself is part of this project.
- **Fonts** — Onest and JetBrains Mono (SIL Open Font License).
- Everything else — code, layout, themes, icons — is written for this project.

## 📄 License

Add the license you want to ship under (MIT is a common choice for extensions) and drop
the text into a `LICENSE` file — the badge above points there.

---

<div align="center" id="বাংলা">

## 🇧🇩 বাংলা

**Sky.Proxy** — ক্রোমের জন্য একটি হালকা প্রক্সি ম্যানেজার (Manifest V3), কোনো বিল্ড
স্টেপ বা বাইরের লাইব্রেরি ছাড়াই।

**নতুন যা আছে**

- **পেস্ট করে প্রক্সির ধরন** — একসাথে অনেক লাইন পেস্ট করলে প্রতিটি লাইনের পাশে
  SOCKS5 / SOCKS4 / HTTP / HTTPS দেখায়; স্কিম থাকলে সেটাই সত্যি, না থাকলে পোর্ট দেখে
  অনুমান (তারকাচিহ্ন `*` সহ), আর **Check type** দিয়ে আসল যাচাই।
- **Timezone by proxy IP** — চালু প্রক্সির টাইমজোন ব্রাউজারে বসে; শুধু টাইমজোন,
  UTC/`toISOString` অপরিবর্তিত, কম্পিউটারের ঘড়ি বদলায় না।
- **Sky.Proxy নাম ও লোগো** — শব্দের «o» অক্ষরেই পুরনো সবুজ মুখোশধারী বল।
- **স্বচ্ছ কাচের থিম** — ডার্ক ও লাইট, দুই থিমেই আলাদা করে সাজানো।
- **SOCKS4 সবসময় দেখা যায়** — ফিল্টারে SOCKS4 চিপ এখন সব সময় থাকে (০ হলেও, হালকা
  করে), ফর্মে SOCKS4 বেছে যোগ করা যায়, আর 4145 পোর্ট SOCKS4 হিসেবে ধরা হয়।
- **Check type অনেক দ্রুত** — http-প্রোব, ২ সেকেন্ড টাইমআউট, স্কিম থাকা লাইন
  বাদ, ২৪ ঘণ্টার ক্যাশ, মৃত ঠিকানায় প্রথম নীরবতাতেই থামা (১৮ সেকেন্ড → ৪.৫ সেকেন্ড)।
- **প্রতিটি IP-র পাশে দেশের পতাকা ও শহর** — তালিকা এখন চেকারের টেবিলের মতো: ঠিকানা,
  পতাকা + «Philippines, Lahug», ধরন, অবস্থা। দেশ ও শহর ঠিকানা থেকেই পাওয়া যায়
  (`ipwho.is` → `ipapi.co` → `ip-api.com`), একবার দেখে **৩০ দিন** ক্যাশে থাকে; পতাকা
  এখন **২৫৫টি দেশের** (আগে হাতে আঁকা ৫২টি ছিল)। নিজে বেছে নেওয়া দেশ কখনো হারায় না,
  আর ঠিকানা বদলালে আগের স্বয়ংক্রিয় দেশ মুছে যায়। **Settings → Country by IP** দিয়ে
  বন্ধ করা যায়।
- **প্রতি সারিতে Connect / Disconnect** — যে প্রক্সি দিয়ে ট্রাফিক যাচ্ছে সেটি **সবুজ
  «Connect»**, বাকিগুলো **লাল «Disconnected»**। মাউস নিয়ে গেলে লেখাটাই বদলে যায়:
  সবুজটি হয় লাল **«Disconnect»**, লালটি হয় সবুজ **«Connect»** — অর্থাৎ ক্লিকে কী
  হবে তা আগেই দেখা যায় (আর লেখা বদলালেও বোতামের চওড়া বদলায় না)। লালে ক্লিক করলে
  ওই প্রক্সি চালু হয়, সবুজে ক্লিক করলে সংযোগ বন্ধ হয়ে সরাসরি যায়; বদলানোর সময়
  অ্যাম্বার রঙে «Connecting…»।
- **Update Now** — হেডারের বোতাম, ক্লিকে লেখকের GitHub খোলে।
- সাথে সুইচ/ফেইলওভার, ব্ল্যাক-হোয়াইট লিস্ট, হটকি, API key দিয়ে ইমপোর্ট,
  রিকোয়েস্ট উইন্ডো, en/ru/uk ভাষা — সব আগের মতোই কাজ করে।

**ইনস্টল:** `chrome://extensions` → Developer mode Engr.Akash Debnath→ **Load unpacked** → এই ফোল্ডার।

</div>
