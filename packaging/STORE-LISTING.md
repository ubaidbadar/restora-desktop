# Restora Live — Microsoft Store listing (draft)

Product: **Restora Live** (Store ID 9NHM8DPCGPZD, reserved 2026-11-12)
Package identity: BadarDigital.RestoraLive, version 0.1.0.0
Publisher: Badar Digital (CN=72D821D7-890E-4CCA-94D2-675D84F355AA)

## Listing text (verified facts only)

**Title:** Restora Live

**Description:** Restora Live is the Windows desktop app for Restora
restaurants. It runs your restaurant's dashboard — orders, tables,
menu, and POS — in a secure desktop window. Its built-in Windows
printing engine handles kitchen tickets and customer receipts without
installing a second application.

**Short description:** Restora Live is the Windows desktop app for
Restora restaurants. It runs your restaurant's dashboard — orders,
tables, menu, and POS — in a secure desktop window.

**Features:**
- Take and track orders, tables and reservations from your PC.
- Run the POS with staff PINs and an audit log.
- Manage your menu and stock.
- Print kitchen tickets and receipts with the native printing engine
  included in Restora Desktop (no separate install; secure connection
  through the restaurant's authenticated printer settings).
- Secure by design: sandboxed window, no plugins, same dashboard
  as the web app.

**Privacy policy:** https://github.com/ubaidbadar/restora-desktop/blob/main/PRIVACY.md
**Website / support:** https://restora.live
**Category:** Productivity. **Pricing:** Free.

## Screenshots

Still to capture: real screenshots of the dashboard as the app shows
it (signed-in restaurant dashboard, 1366x768 or larger). No
AI-generated images; the screenshots must be the real app.

## runFullTrust justification (for Submission options)

Restora Live is a full-trust Win32 (Electron) desktop app. It must run
outside the UWP app container to host a desktop window for the
restaurant dashboard, start its included native print engine as a full-trust child process,
communicate with it over loopback (127.0.0.1:17777), and use local-network access.
There is no packaged (non-full-trust) equivalent for these
capabilities.

## Known limitation — verify on real Windows after install

The dashboard posts slips to the engine bundled inside the same MSIX
package on 127.0.0.1:17777. `privateNetworkClientServer` and
`runFullTrust` are declared, but launching the packaged child process
and loopback communication must be verified on a real Windows PC
after a Store installation. Windows CI only verifies the portable
installer and packaged payload.

## Name reservation deadline

Partner Center: the "Restora Live" name must be submitted to the
Store within three months of reservation (by ~12 February 2027) or
the reservation is lost.
