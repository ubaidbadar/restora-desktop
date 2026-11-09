'use strict';

const { app, BrowserWindow, Menu, shell, session, dialog } = require('electron');
const { getAppUrl, isInternalUrl, isSafeExternalUrl } = require('./security.cjs');

// The hosted restaurant UI handles authentication and permissions. Electron does not
// receive auth cookies, Meta credentials or privileged IPC from the renderer.
let window = null;
const APP_URL = getAppUrl();

function openExternal(url) {
  if (isSafeExternalUrl(url)) void shell.openExternal(url).catch(() => {});
}

function createWindow() {
  window = new BrowserWindow({
    title: 'Restora POS',
    width: 1320,
    height: 880,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: '#f6f8fa',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      webviewTag: false,
      spellcheck: false,
      navigateOnDragDrop: false,
    },
  });
  window.once('ready-to-show', () => window?.show());
  const contents = window.webContents;

  contents.setWindowOpenHandler(({ url }) => {
    if (!isInternalUrl(url, APP_URL)) openExternal(url);
    // Do not give untrusted remote pages an Electron child window.
    return { action: 'deny' };
  });
  contents.on('will-navigate', (event, url) => {
    if (!isInternalUrl(url, APP_URL)) {
      event.preventDefault();
      openExternal(url);
    }
  });
  contents.on('will-redirect', (event, url) => {
    if (!isInternalUrl(url, APP_URL)) {
      event.preventDefault();
      openExternal(url);
    }
  });
  contents.on('will-attach-webview', event => event.preventDefault());
  contents.on('render-process-gone', () => {
    if (window && !window.isDestroyed()) {
      void dialog.showMessageBox(window, {
        type: 'warning', title: 'Restora needs to reload',
        message: 'The dashboard stopped responding. Reload Restora to continue.',
        buttons: ['Reload', 'Close'], defaultId: 0,
      }).then(({ response }) => {
        if (response === 0 && window && !window.isDestroyed()) void window.loadURL(APP_URL);
        else window?.close();
      });
    }
  });
  contents.on('did-fail-load', (_event, code, description, url, isMainFrame) => {
    if (!isMainFrame || code === -3) return;
    // Leave the existing UI available when possible; report only the failure.
    if (window && !window.isDestroyed()) window.setTitle('Restora POS — Connection unavailable');
    console.error('[Restora Desktop] failed to load', { code, description, origin: (() => { try { return new URL(url).origin; } catch { return 'invalid'; } })() });
  });
  void window.loadURL(APP_URL);
  window.on('closed', () => { window = null; });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) app.quit();
else {
  app.on('second-instance', () => {
    if (!window) return;
    if (window.isMinimized()) window.restore();
    window.focus();
  });
  app.on('ready', () => {
    // The existing paired Rust agent is reachable on 127.0.0.1:17777 from the
    // trusted app. Allow local-network access only for this origin; no broader
    // device, media, clipboard, geolocation, HID/serial/USB permissions.
    const allowedPermissions = new Set(['notifications', 'local-network-access']);
    session.defaultSession.setPermissionRequestHandler((contents, permission, callback) => {
      callback(isInternalUrl(contents.getURL(), APP_URL) && allowedPermissions.has(permission));
    });
    session.defaultSession.setPermissionCheckHandler((_contents, permission, requestingOrigin) => {
      return isInternalUrl(requestingOrigin, APP_URL) && allowedPermissions.has(permission);
    });
    session.defaultSession.on('will-download', event => {
      // Downloads are not allowed until an explicit receipt-export workflow exists.
      event.preventDefault();
    });
    Menu.setApplicationMenu(null);
    createWindow();
  });
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
  app.on('window-all-closed', () => app.quit());
}
