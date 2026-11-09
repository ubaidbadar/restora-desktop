# Restora Desktop — Electron for Windows

A minimal **Electron container** for the existing React restaurant POS at
`https://app.restora.live/`. The dashboard itself stays in
[restora-web](https://github.com/ubaidbadar/restora-web) and continues using the
existing Better Auth cookie session and REST API. **No forked menu, order,
offline queue or business logic.**

This repository is not the Rust printing agent. The existing
[restora-pc-agent](https://github.com/ubaidbadar/restora-pc-agent) is a separate
Windows tray process with its own secure pairing and `http://127.0.0.1:17777`
local API. The React dashboard already supports that agent. Electron loads the
same dashboard origin, so **no new privileged IPC or duplicated printer
protocol** is required. Staff must install and pair the agent separately.

## Run locally

Install Node.js 22 or later.

```sh
npm install
npm start
npm run check
```

By default Electron opens **https://app.restora.live/**. To test a local Vite
dashboard, launch in development mode only:

```powershell
$env:RESTORA_DESKTOP_DEV = "1"
$env:RESTORA_APP_URL = "http://localhost:3000/"
npm start
```

Arbitrary remote URL overrides are refused to avoid credential theft.

## Windows installer

```sh
npm run dist
```

Or run **Actions → Windows installer (unsigned test artifact) → Run workflow**.
The workflow builds a portable `restora-windows-portable` ZIP first and then
attempts an NSIS installer (artifact `restora-windows-unsigned-installer`).
If the NSIS tool download fails, use the portable archive: unzip it and start
`Restora POS.exe` from the extracted directory. Both are unsigned internal-test builds.

This first installer is **unsigned** and is intended for internal testing only.
Do not distribute commercially before code signing, publisher details,
auto-update signing/verification, Windows SmartScreen testing and installer QA.

## Security

- Context isolation **on**, sandbox **on**, Node integration **off**
- No privileged preload script, IPC bridge or webview access
- Top-level navigation confined to the approved Restora app origin
- External HTTPS, mailto and telephone links open in the operating-system browser
- Host permissions restricted. The trusted app origin may request notification and local-network access for the existing paired Rust printer agent; downloads are blocked pending secure export design.
- Electron main process never handles session cookies, tenant IDs or Meta tokens
- HTTPS production URL is fixed; localhost override only when intentionally developing

Electron wraps the *deployed web dashboard*. A source commit does not change the
desktop screen until the web dashboard is deployed. Offline behavior follows the
deployed web app's service-worker and IndexedDB implementation; full offline
cold-start is **not yet validated** in Electron.

Meta Embedded Signup uses a browser popup and needs an acceptance test inside
Electron before restaurant owners are directed to use it there. If popup
restrictions interfere, complete first-time WhatsApp connection in the regular
browser instead of relaxing Electron security.

## Delivery phases

1. **Foundation:** secure Electron shell, CI, Windows NSIS test installer, tests.
2. **Integration:** run the existing Rust printer agent beside Electron; verify local pairing, offline slips, CORS/private-network permissions, backend retry behavior and Windows ESC/POS printers.
3. **Release:** Windows hardware print QA, offline/online order replay, signing,
   auto updates and support/rollback instructions.

Do not mistake an installer artifact for a production-ready Windows POS.

## Verified Windows build downloads

The Actions build pins **Electron ${manifest.version}** and SHA-256 in
`electron-release.json`. It first uses the official `electron/electron` GitHub
release API via `gh release download` (with retry and a validated cache), then
falls back to official `@electron/get` with retry if GitHub's API route fails.
Both paths verify the archive against the pinned official SHA-256 before it is
unpacked. Do not replace either source with a third-party binary mirror.

The workflow validates that the portable ZIP contains the executable and shell
sources, and uploads the ZIP as a GitHub Actions test artifact if packaging
succeeds. It also tries an unsigned NSIS installer. A successful ZIP-structure
check is **not** a Windows desktop launch or hardware acceptance test.

Before a commercial release, manually test on Windows 10 and 11: launch
`https://app.restora.live/`, signed-in session persistence, Meta embedded
signup/popup behavior, paired Rust agent on `127.0.0.1:17777`, offline
queue/recovery, ESC/POS printing, and cross-restaurant tenant isolation.
Only distribute after code signing, installer integrity checks and approval.
If the official release is unreachable, issue #2 remains blocked.
