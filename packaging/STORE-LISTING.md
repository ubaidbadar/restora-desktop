# Restora Live — Microsoft Store listing (draft)

Product: **Restora Live** (Store ID 9NHM8DPCGPZD, reserved 2026-11-12)
Package identity: BadarDigital.RestoraLive, version 0.1.0.0
Publisher: Badar Digital (CN=72D821D7-890E-4CCA-94D2-675D84F355AA)

## Listing text (verified facts only)

**Title:** Restora Live

**Description:** Restora Live is the Windows desktop app for Restora
restaurants. It runs your restaurant's dashboard — orders, tables,
menu, and POS — in a secure desktop window, and works with the Restora
print agent on your PC to print kitchen tickets and receipts.

**Short description:** Restora Live is the Windows desktop app for
Restora restaurants. It runs your restaurant's dashboard — orders,
tables, menu, and POS — in a secure desktop window.

**Features:**
- Take and track orders, tables and reservations from your PC.
- Run the POS with staff PINs and an audit log.
- Manage your menu and stock.
- Print kitchen tickets and receipts with the Restora print agent
  (installed separately, paired with a 6-digit code).
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
restaurant dashboard, communicate with the locally paired Restora print
agent over loopback (127.0.0.1:17777), and use local-network access.
There is no packaged (non-full-trust) equivalent for these
capabilities.

## Known limitation — verify on real Windows after install

The dashboard posts slips to the print agent on 127.0.0.1:17777.
`privateNetworkClientServer` is declared, but loopback behaviour of
the packaged app must be verified on a real Windows PC after install
from the Store, exactly as with Restora Agent.

## Name reservation deadline

Partner Center: the "Restora Live" name must be submitted to the
Store within three months of reservation (by ~12 February 2027) or
the reservation is lost.
