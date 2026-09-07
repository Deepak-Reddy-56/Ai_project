const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const electronBin = process.platform === 'win32'
  ? path.join(projectRoot, 'node_modules', 'electron', 'dist', 'electron.exe')
  : path.join(projectRoot, 'node_modules', 'electron', 'dist', 'electron');
const mainScript = path.join(__dirname, 'main.cjs');

if (!fs.existsSync(electronBin)) {
  console.error(`[DesktopLauncher] Electron binary not found: ${electronBin}`);
  console.error('[DesktopLauncher] Reinstall Electron or provide the binary under node_modules/electron/dist.');
  process.exit(1);
}

console.log(`[DesktopLauncher] Starting ${electronBin}`);
const child = spawn(electronBin, [mainScript], {
  cwd: projectRoot,
  stdio: 'inherit',
  windowsHide: false,
  env: process.env,
});

child.on('error', (error) => {
  console.error(`[DesktopLauncher] Failed to start Electron: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`[DesktopLauncher] Electron exited by signal ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 0);
});
