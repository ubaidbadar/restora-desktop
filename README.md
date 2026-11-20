# Restora POS — Tauri 2 (Windows)

Restora POS is a **Tauri 2 + Rust** desktop application. There is **no Electron runtime, Node runtime, standalone print-agent EXE, hidden PowerShell, or separate printer setup installer** in the shipped application.

The React 19/Vite 8 POS stays in [restora-web](https://github.com/ubaidbadar/restora-web). To keep Better Auth's existing httpOnly cookie session, hosted Google/Meta authentication, IndexedDB outbox and web push flows intact, the Tauri WebView2 window loads the existing trusted [https://app.restora.live/](https://app.restora.live/) website. The desktop Rust worker links the native [restora-pc-agent](https://github.com/ubaidbadar/restora-pc-agent) library **inside the same application process**, and runs its already hardened, localhost-restricted print API, encrypted pairing, polling, retries and journal. It does **not** spawn the old PC agent executable.

## Windows build

Prerequisites: Windows 10/11, current Microsoft WebView2, Rust stable (MSVC toolchain), C++ build tools, Node 22+ and npm.

```powershell
npm install
npm run check
cargo test --manifest-path src-tauri/Cargo.toml
npm run build
```

The unsigned **NSIS test installer** is built in `src-tauri/target/release/bundle/nsis/`. GitHub Actions runs native unit tests, clippy, bundling checks and publishes its unsigned test artifact. Sign and hardware-validate before customer distribution or Microsoft Store submission.

## Built-in printing and no printer configuration

1. Install the supported ESC/POS-compatible thermal printer **in Windows**; Windows provides its driver, connection and default-printer selection.
2. Start Restora POS and sign in to the correct restaurant/branch. An authorized user with `devices:manage` can pair it automatically; existing pairing stays private to that Windows account.
3. If there is no explicit assignment for kitchen or receipt slips, the backend routes that slip kind to the **Windows default printer**. No Restora printer mapping screen is necessary. Existing explicit kitchen/bar/receipt assignments are retained. Windows changing the default moves only auto-routed kinds.
4. The same Rust engine prints server-queued slips and offline local slips; a durable journal protects against duplicate auto-prints. Failed jobs use the existing retry/dead-letter workflow.

Important: **Raw ESC/POS bytes are not a universal Windows printing language.** An ordinary A4/PDF/graphics printer cannot be promised correct thermal receipt output. Without a configured Windows default or an ESC/POS-compatible device, printing must surface a failure rather than silently route kitchen tickets to an arbitrary device. Printer installation and selection are Windows responsibilities, not a Restora configuration flow.

The old **standalone Restora Agent must be exited or uninstalled before starting this build** because it reserves port `127.0.0.1:17777`. That port is kept for compatibility with the existing web application's trusted localhost protocol, without adding a privileged Tauri renderer API. All remote Tauri capabilities are disabled; only the existing Restora website and provider auth origins may navigate.

## Known release requirements

The hosted website remains the source of the user interface. **A clean offline cold start is not guaranteed** just by installing this shell; existing service-worker/IndexedDB behavior needs a real Windows WebView2 offline acceptance run. Also verify live sign-in and Better Auth/Google and Meta popups, native printer hotplug/default changes, 58/80mm paper formats, USB and network thermal printer output, paper-out/retry, software crash/restart, WebView2 deployment, permissions, branch isolation and credential migration. The CI artifact is **not** a signed production release. Do not deploy these interdependent repository changes separately.

The migrated sources replace the old Electron implementation; existing web/PWA users can continue using the optional separate agent while the Windows Tauri build is being rolled out.
