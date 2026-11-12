'use strict';

// The archive must match the SHA-256 digest published for the official
// electron/electron v39.8.10 Windows x64 GitHub release. Never use an unchecked mirror.
const { downloadArtifact } = require('@electron/get');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { createReadStream } = require('node:fs');
const fs = require('node:fs/promises');
const path = require('node:path');
const pkg = require('../package.json');
const release = require('../electron-release.json');

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
async function fileSha256(file) {
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(file)) digest.update(chunk);
  return digest.digest('hex');
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getOfficialArchive() {
  const version = require('electron/package.json').version;
  if (version !== release.version || release.platform !== 'win32' || release.arch !== 'x64' ||
      !/^[0-9a-f]{64}$/.test(release.sha256)) {
    throw new Error('Electron version/platform/checksum does not match electron-release.json');
  }

  const filename = `electron-v${version}-win32-x64.zip`;
  let zip = process.env.RESTORA_ELECTRON_ARCHIVE
    ? path.resolve(process.env.RESTORA_ELECTRON_ARCHIVE)
    : null;

  if (!zip) {
    for (let attempt = 1; attempt <= 4; attempt++) {
      try {
        zip = await downloadArtifact({
          version,
          platform: 'win32',
          arch: 'x64',
          artifactName: 'electron',
          checksums: { [filename]: release.sha256 },
        });
        break;
      } catch (error) {
        if (attempt === 4) throw error;
        console.warn(`Official @electron/get download failed (attempt ${attempt}/4): ${error.message}`);
        await sleep(10000 * attempt);
      }
    }
  }
  const actual = await fileSha256(zip);
  if (actual !== release.sha256) {
    throw new Error(`Electron Windows release SHA-256 mismatch: expected ${release.sha256}, got ${actual}`);
  }
  return zip;
}

async function main() {
  const zip = await getOfficialArchive();
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });
  powerShell(`Expand-Archive -LiteralPath ${psQuote(zip)} -DestinationPath ${psQuote(output)} -Force`);
  const appDir = path.join(output, 'resources', 'app');
  await fs.mkdir(appDir, { recursive: true });
  await fs.copyFile(path.join(root, 'package.json'), path.join(appDir, 'package.json'));
  await fs.cp(path.join(root, 'src'), path.join(appDir, 'src'), { recursive: true });
  // Match electron-builder's extraResources path exactly. Never ship a desktop
  // package that asks staff to download a separate printing application.
  const engineDir = path.join(output, 'resources', 'print-engine');
  await fs.mkdir(engineDir, { recursive: true });
  await fs.copyFile(path.join(root, 'native', 'print-engine.exe'),
    path.join(engineDir, 'restora-pc-agent.exe'));
  await fs.rename(path.join(output, 'electron.exe'), path.join(output, 'Restora POS.exe'));
  await fs.rm(archive, { force: true });
  powerShell(`Compress-Archive -Path ${psQuote(path.join(output, '*'))} -DestinationPath ${psQuote(archive)} -Force`);
  console.log('Built checksum-verified portable desktop:', archive);
}
main().catch(error => {
  console.error('Unable to create the Windows desktop build:', error.message);
  process.exitCode = 1;
});
