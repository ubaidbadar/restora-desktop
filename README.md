# Restora Desktop — Electron for Windows

A minimal **Electron container** for the existing React restaurant POS at
`https://app.restora.live/`. The dashboard itself stays in
[restora-web](https://github.com/ubaidbadar/restora-web) and continues using the
existing Better Auth cookie session and REST API. **No forked menu, order,
offline queue or business logic.**

**One installer includes automatic printing.** Restora Desktop bundles the
existing, battle-tested Rust ESC/POS print engine internally. It starts silently
with Electron, exits when its owning desktop process exits (including after a
crash), and keeps the encrypted pairing, printer settings, branch checks,
durable de-duplication journal, and backend print queue. Staff **do not install
a separate Restora Agent**. Printer setup is performed in the existing Restora
Settings → Printers page, where the built-in engine pairs through the same
authenticated, branch-scoped flow.

There is no privileged IPC bridge or duplicate printing protocol exposed to
the React renderer. The web app still talks to the restricted
`127.0.0.1:17777` interface. Browser-only customers can continue using the
separately installed [Restora Agent](https://github.com/ubaidbadar/restora-pc-agent).

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
`Restora POS.exe` from the extracted directory. Both are unsigned internal-test builds, and both include the built-in print engine.

This first installer, including the embedded print engine, is **unsigned** and is intended for internal testing only.
Do not distribute commercially before code signing, publisher details,
auto-update signing/verification, Windows SmartScreen testing and installer QA.

## Security

- Context isolation **on**, sandbox **on**, Node integration **off**
- No privileged preload script, IPC bridge or webview access
- Top-level navigation confined to the approved Restora app origin
- External HTTPS, mailto and telephone links open in the operating-system browser
- Host permissions restricted. The trusted app origin may request notification and local-network access for the bundled native print engine; downloads are blocked pending secure export design.
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
2. **Integration:** package the pinned Rust print engine *inside* Electron; verify automatic launch and shutdown, local pairing, offline slips, CORS/private-network permissions, backend retries and Windows ESC/POS printers.
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
signup/popup behavior, bundled print engine on `127.0.0.1:17777`, offline
queue/recovery, ESC/POS printing, and cross-restaurant tenant isolation.
Only distribute after code signing, installer integrity checks and approval.
If the official release is unreachable, issue #2 remains blocked.

## Bundled printing build and safety

The source pinned in `print-engine.json` is built with `cargo build --release --locked`
by the common GitHub composite action in `.github/actions/build-print-engine`.
Windows CI includes the resulting executable in **both** the portable ZIP and
NSIS/MSIX packages. Packaging fails if the native executable is missing; it is
never downloaded at runtime or installed as an independent Windows app.

The embedded engine runs as `restora-pc-agent.exe --embedded --parent-pid <Electron PID>`.
It exposes only the existing origin-restricted localhost API and does not open
its own tray or create a Run-key autostart entry. It is supervised by Electron
and exits when its parent process exits. Existing standalone Agent installs may
still be used by browser-only customers.

**Pending manual acceptance:** verify printer pairing on real Windows 10/11,
58 mm and 80 mm slips, USB/network devices, paper-out/retries, branch switching,
Windows Store full-trust child-process behavior, offline order printing and
signed installer delivery. Source merge/CI is not approval to publish the
unsigned installer or Microsoft Store release.
