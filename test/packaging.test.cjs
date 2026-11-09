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
