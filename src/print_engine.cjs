'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

/**
 * The embedded Rust engine is compiled from a pinned Restora source commit and
 * installed with Electron. Staff never install or launch a second application.
 * Windows keeps the same raw ESC/POS, journal, queue and branch checks as web.
 */
function printEnginePath(resourcesPath) {
  return path.join(resourcesPath, 'print-engine', 'restora-pc-agent.exe');
}

function startPrintEngine({
  platform = process.platform,
  packaged = false,
  resourcesPath = process.resourcesPath,
  parentPid = process.pid,
  exists = fs.existsSync,
  launch = spawn,
} = {}) {
  if (platform !== 'win32' || !packaged) return null;
  const executable = printEnginePath(resourcesPath);
  if (!exists(executable)) {
    throw new Error('Restora Desktop installer is missing its built-in print engine.');
  }
  const engine = launch(executable, ['--embedded', '--parent-pid', String(parentPid)], {
    windowsHide: true,
    shell: false,
    detached: false,
    stdio: 'ignore',
  });
  engine.on('error', error => console.error('[Restora Desktop] print engine could not start:', error.message));
  engine.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) console.error('[Restora Desktop] print engine stopped:', code, signal);
  });
  return engine;
}

function stopPrintEngine(engine) {
  if (engine && engine.exitCode === null && !engine.killed) {
    try { engine.kill(); } catch (error) {
      console.error('[Restora Desktop] could not stop print engine:', error.message);
    }
  }
}

module.exports = { printEnginePath, startPrintEngine, stopPrintEngine };
