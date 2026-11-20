# Restora POS for Windows — Privacy

**Updated: 20 November 2026**

The Windows desktop application uses Tauri 2 and Microsoft WebView2 to display the existing Restora website at https://app.restora.live/. Authentication, orders, restaurant accounts, staff and customers remain governed by Restora's existing service privacy policy. Login sessions are stored in the operating system's WebView2 browser profile through secure httpOnly cookies, not exposed to the native printing worker.

## Native printing

The Rust printing component runs in the same process as Restora Desktop. It discovers printer names and the user's default printer from Windows, and submits print instructions to the locally installed printer driver. Like the previous standalone Restora Agent, it communicates with the authenticated Restora API over HTTPS to receive queued receipt/kitchen slips and report printer inventory, completion, and errors. The server uses inventory and assignments to route restaurant print jobs. Local print history is retained to prevent duplicate tickets; pairing credentials are protected with Windows DPAPI.

The printing component listens only on `127.0.0.1:17777` and permits browser access only from an approved Restora origin. No remote webpage receives privileged Tauri IPC permissions. There is no additional printer-driver or background application installation.

Restora Desktop itself does not add advertising or a third-party analytics SDK. It does, however, communicate with the Restora website and backend to operate the POS and with Microsoft WebView2 infrastructure as required by that platform.

For customer support and privacy questions, use https://restora.live/.
