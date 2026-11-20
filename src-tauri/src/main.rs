#![cfg_attr(all(windows, not(debug_assertions)), windows_subsystem = "windows")]

use tauri::{Manager, WebviewUrl, WebviewWindowBuilder, webview::NewWindowResponse};

const APP_URL: &str = "https://app.restora.live/";

/// Never let an arbitrary website navigate this app's main window.
fn trusted_navigation(url: &tauri::Url) -> bool {
    if url.scheme() != "https" {
        return false;
    }
    matches!(
        url.host_str(),
        Some("app.restora.live")
            | Some("restora.live")
            | Some("accounts.google.com")
            | Some("www.facebook.com")
            | Some("business.facebook.com")
    )
}

/// OAuth popups are limited to the actual Restora and provider origins.
fn trusted_popup(url: &tauri::Url) -> bool {
    trusted_navigation(url)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            // No sidecar, second installer, Electron process, PowerShell, or
            // externally exposed Tauri command is needed for Windows printing.
            restora_pc_agent::start_embedded().map_err(std::io::Error::other)?;
            WebviewWindowBuilder::new(
                app,
                "main",
                WebviewUrl::External(APP_URL.parse()?),
            )
            .title("Restora POS")
            .inner_size(1320.0, 880.0)
            .min_inner_size(900.0, 620.0)
            .background_color(tauri::window::Color(246, 247, 249, 255))
            // UI hint only; server auth and the agent's localhost Origin/Host
            // checks remain the security boundaries.
            .initialization_script(
                "if (location.origin === 'https://app.restora.live') { Object.defineProperty(window, '__RESTORA_DESKTOP__', { value: true }); }",
            )
            .on_navigation(trusted_navigation)
            .on_new_window(|url, _| {
                if trusted_popup(&url) {
                    NewWindowResponse::Allow
                } else {
                    NewWindowResponse::Deny
                }
            })
            .build()?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Failed to start Restora POS");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn blocks_non_restora_navigation_and_untrusted_popups() {
        assert!(trusted_navigation(&"https://app.restora.live/orders".parse().unwrap()));
        assert!(trusted_popup(&"https://accounts.google.com/o/oauth2/v2/auth".parse().unwrap()));
        for url in [
            "http://app.restora.live",
            "https://app.restora.live.evil.example",
            "https://evil.example",
            "file:///C:/secret",
            "javascript:alert(1)",
        ] {
            let url: tauri::Url = url.parse().unwrap();
            assert!(!trusted_navigation(&url), "{url}");
            assert!(!trusted_popup(&url), "{url}");
        }
    }
}
