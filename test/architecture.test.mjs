import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const config = JSON.parse(readFileSync('src-tauri/tauri.conf.json', 'utf8'));
const manifest = readFileSync('src-tauri/Cargo.toml', 'utf8');
const entry = readFileSync('src-tauri/src/main.rs', 'utf8');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

test('uses Tauri 2 remote Restora origin and disables remote Tauri IPC', () => {
  assert.equal(config.build.frontendDist, 'https://app.restora.live/');
  assert.deepEqual(config.app.security.capabilities, []);
  assert.equal(config.app.windows.length, 0);
  assert.match(manifest, /tauri\s*=\s*\{/);
  assert.match(entry, /start_embedded\(\)/);
});

test('does not package Electron or another print agent executable', () => {
  assert.ok(!existsSync('src/main.cjs'));
  assert.ok(!existsSync('src/print_engine.cjs'));
  assert.ok(!existsSync('native/print-engine.exe'));
  assert.ok(!JSON.stringify(packageJson).toLowerCase().includes('electron'));
  assert.ok(manifest.includes('features = ["embedded"]'));
});

test('ships a Windows native installer and bundled icon', () => {
  assert.deepEqual(config.bundle.targets, ['nsis']);
  assert.ok(existsSync('src-tauri/icons/icon.ico'));
});
