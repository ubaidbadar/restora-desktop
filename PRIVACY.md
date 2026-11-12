# Privacy Policy — Restora Live (Windows desktop app)

**Last updated: 12 November 2026**

Restora Live is a Windows desktop container for the Restora restaurant
dashboard at https://app.restora.live/. The dashboard itself is the
Restora web app; this desktop app does not fork it or add its own
data collection.

## What this app itself collects

Nothing. The desktop shell has no analytics, no tracking, and no
advertising. It does not read, store, or transmit personal data on its
own. It has no privileged access to your computer: it runs with the
sandbox on, Node integration off, and no scripting bridge to the
operating system.

## Sign-in and restaurant data

Signing in and everything you do in the dashboard — orders, tables,
menu, customers, staff — is handled by the Restora web app and the
Restora API at https://restora.live, exactly as it is when you use the
dashboard in a browser. The Electron main process never handles session
cookies, tenant IDs, or Meta tokens.

## Printing

The dashboard can print through the Restora print agent running on the
same PC (it listens on 127.0.0.1:17777). That traffic stays on your own
computer; the desktop app sends nothing about your printers anywhere
else.

## Contact

Questions about this policy: contact us through https://restora.live.
