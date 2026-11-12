'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const pkg = require('../package.json');
const release = require('../electron-release.json');

test('Windows Electron release is pinned to a SHA-256 verified official asset', () => {
  assert.equal(pkg.devDependencies.electron, release.version);
  assert.equal(release.platform, 'win32');
  assert.equal(release.arch, 'x64');
  assert.match(release.sha256, /^[0-9a-f]{64}$/);
});

test('every desktop distribution bundles the source-pinned native print engine', () => {
  const engine = require('../print-engine.json');
  assert.equal(engine.repository, 'ubaidbadar/restora-pc-agent');
  assert.match(engine.sha, /^[a-f0-9]{40}$/);
  assert.deepEqual(pkg.build.extraResources, [
    { from: 'native/print-engine.exe', to: 'print-engine/restora-pc-agent.exe' },
  ]);
  assert.match(pkg.scripts.dist, /require-print-engine/);
  assert.match(pkg.scripts['dist:portable'], /require-print-engine/);
});

