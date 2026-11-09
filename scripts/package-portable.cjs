'use strict';

// Minimal, reproducible Windows portable build with a checksum-verified Electron
// release. It deliberately avoids downloading Windows signing/NSIS toolchains.
const { downloadArtifact } = require('@electron/get');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const pkg = require('../package.json');

if (process.platform !== 'win32') {
  console.error('Windows packaging must run on Windows (GitHub Actions windows-latest).');
  process.exit(1);
}
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const output = path.join(dist, 'portable');
const archive = path.join(dist, `Restora-POS-Portable-${pkg.version}-win-x64.zip`);

function psQuote(value) { return "'" + value.replaceAll("'", "''") + "'"; }
function powerShell(script) {
  execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { stdio: 'inherit' });
}
async function main() {
  const version = require('electron/package.json').version;
  const zip = await downloadArtifact({ version, platform: 'win32', arch: 'x64', artifactName: 'electron' });
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  powerShell(`Expand-Archive -LiteralPath ${psQuote(zip)} -DestinationPath ${psQuote(output)} -Force`);
  const appDir = path.join(output, 'resources', 'app');
  await fs.mkdir(appDir, { recursive: true });
  await fs.copyFile(path.join(root, 'package.json'), path.join(appDir, 'package.json'));
  await fs.cp(path.join(root, 'src'), path.join(appDir, 'src'), { recursive: true });
  await fs.rename(path.join(output, 'electron.exe'), path.join(output, 'Restora POS.exe'));
  await fs.rm(archive, { force: true });
  powerShell(`Compress-Archive -Path ${psQuote(path.join(output, '*'))} -DestinationPath ${psQuote(archive)} -Force`);
  console.log('Built portable desktop:', archive);
}
main().catch(error => {
  console.error('Unable to create the Windows desktop build:', error.message);
  process.exitCode = 1;
});
