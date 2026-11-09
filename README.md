# Restora Desktop — Electron for Windows

A minimal **Electron container** for the existing React restaurant POS at
`https://app.restora.live/`. The dashboard itself stays in
[restora-web](https://github.com/ubaidbadar/restora-web) and continues using the
existing Better Auth cookie session and REST API. **No forked menu, order,
offline queue or business logic.**

This repository is not the Rust printing agent. Native printing stays in
[restora-pc-agent](https://github.com/ubaidbadar/restora-pc-agent) pending
an explicitly designed, authenticated desktop-to-agent integration.

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
The `restora-windows-unsigned-installer` artifact contains a test installer.

This first installer is **unsigned** and is intended for internal testing only.
Do not distribute commercially before code signing, publisher details,
auto-update signing/verification, Windows SmartScreen testing and installer QA.

## Security

- Context isolation **on**, sandbox **on**, Node integration **off**
- No privileged preload script, IPC bridge or webview access
- Top-level navigation confined to the approved Restora app origin
- External HTTPS, mailto and telephone links open in the operating-system browser
- Host permissions restricted; downloads blocked pending secure export design
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
2. **Integration:** deliberate desktop-to-Rust printing-agent protocol, discovery,
   pairing, secure receipt dispatch, explicit permissions and retry behavior.
3. **Release:** Windows hardware print QA, offline/online order replay, signing,
   auto updates and support/rollback instructions.

Do not mistake an installer artifact for a production-ready Windows POS.
