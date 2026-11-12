'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const path = require('node:path');
const { printEnginePath, startPrintEngine, stopPrintEngine } = require('../src/print_engine.cjs');

test('Windows packaged app launches only the bundled engine without a shell or extra install', () => {
  let call;
  const child = Object.assign(new EventEmitter(), { exitCode: null, killed: false,
    kill() { this.killed = true; },
  });
  const engine = startPrintEngine({
    platform: 'win32',
    packaged: true,
    resourcesPath: '/trusted/resources',
    parentPid: 1234,
    exists: () => true,
    launch: (file, args, options) => {
      call = { file, args, options };
      return child;
    },
  });
  assert.equal(engine, child);
  assert.equal(call.file, printEnginePath('/trusted/resources'));
  assert.deepEqual(call.args, ['--embedded', '--parent-pid', '1234']);
  assert.equal(call.options.shell, false);
  assert.equal(call.options.windowsHide, true);
  assert.equal(call.options.detached, false);
  assert.equal(call.options.stdio, 'ignore');
  stopPrintEngine(engine);
  assert.equal(child.killed, true);
});

test('development and non-Windows systems never start a Windows executable', () => {
  const launch = () => { throw Error('should not launch'); };
  assert.equal(startPrintEngine({ platform: 'linux', packaged: true, launch }), null);
  assert.equal(startPrintEngine({ platform: 'win32', packaged: false, launch }), null);
});

test('packaged desktop fails visibly if its installer did not contain the engine', () => {
  assert.throws(() => startPrintEngine({
    platform: 'win32', packaged: true, resourcesPath: '/resources', exists: () => false,
  }), /missing its built-in print engine/);
});

test('agent path is always inside the packaged resources folder', () => {
  assert.equal(printEnginePath('/resources'), path.join('/resources', 'print-engine', 'restora-pc-agent.exe'));
});
