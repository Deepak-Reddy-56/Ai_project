const { app, BrowserWindow, globalShortcut, desktopCapturer, ipcMain, screen, session } = require('electron');
const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const appDataRoot = path.join(app.getPath('appData'), 'CodeCompanion');
const sessionDataPath = path.join(appDataRoot, 'session');
const cachePath = path.join(sessionDataPath, 'cache');
const codeCachePath = path.join(sessionDataPath, 'code-cache');
fs.mkdirSync(cachePath, { recursive: true });
fs.mkdirSync(codeCachePath, { recursive: true });
fs.mkdirSync(sessionDataPath, { recursive: true });
app.setPath('userData', appDataRoot);
app.setPath('sessionData', sessionDataPath);

app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

let mainWindow = null;
let assistantWindow = null;
let registeredAccelerator = null;
let speechProcess = null;
let speechReady = false;
let speechStarting = false;
let latestSpeechState = null;

const isDev = !app.isPackaged;
const rendererUrl = process.env.ASSISTANT_RENDERER_URL || 'http://localhost:5173';
const speechScript = path.join(__dirname, 'speech', 'stt.py');

function resolvePython() {
  if (process.env.ASSISTANT_PYTHON) return { command: process.env.ASSISTANT_PYTHON, args: [] };
  try {
    const result = spawnSync('where.exe', ['python'], { encoding: 'utf8', windowsHide: true });
    const first = result.stdout?.split(/\r?\n/).map((line) => line.trim()).find(Boolean);
    if (first) return { command: first, args: [] };
  } catch {
    // Fall through to the Python launcher.
  }
  return { command: 'py.exe', args: ['-3'] };
}

function createWindows() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      v8CacheOptions: 'none'
    }
  });

  if (isDev) mainWindow.loadURL(rendererUrl);
  else mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));

  assistantWindow = new BrowserWindow({
    width: 430,
    height: 620,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
      v8CacheOptions: 'none'
    }
  });

  if (isDev) assistantWindow.loadURL(`${rendererUrl}#assistant`);
  else assistantWindow.loadFile(path.join(__dirname, '../dist/index.html'), { hash: 'assistant' });

  assistantWindow.setAlwaysOnTop(true, 'floating');
  assistantWindow.webContents.once('did-finish-load', () => {
    startNativeSpeech();
    pushLatestSpeechState();
  });
  positionAssistant();
}

function positionAssistant() {
  if (!assistantWindow || assistantWindow.isDestroyed()) return;
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const bounds = display.workArea;
  const [width, height] = assistantWindow.getSize();
  assistantWindow.setPosition(
    Math.round(bounds.x + bounds.width - width - 24),
    Math.round(bounds.y + bounds.height - height - 24),
    false
  );
}

async function captureDesktop() {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: { width: 1920, height: 1080 },
    fetchWindowIcons: false
  });
  if (!sources.length) throw new Error('No desktop display is available.');

  const cursorDisplay = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const source = sources.find((item) => item.display_id === String(cursorDisplay.id)) || sources[0];
  return source.thumbnail.toDataURL();
}

function showAssistant() {
  if (!assistantWindow || assistantWindow.isDestroyed()) return;
  positionAssistant();
  assistantWindow.showInactive();
  assistantWindow.webContents.send('desktop-assistant:activate');
}

function registerShortcuts() {
  const candidates = ['Alt+Space', 'Control+Alt+Shift+A', 'Control+Shift+Space'];
  for (const accelerator of candidates) {
    try {
      if (globalShortcut.register(accelerator, showAssistant)) {
        registeredAccelerator = accelerator;
        console.log(`[DesktopAssistant] Global shortcut registered: ${accelerator}`);
        return;
      }
    } catch (err) {
      console.warn(`[DesktopAssistant] Shortcut ${accelerator} failed:`, err.message);
    }
  }
  console.warn('[DesktopAssistant] No global shortcut could be registered.');
}

function sendSpeechEvent(payload) {
  if (['status', 'device', 'ready', 'listening', 'wake', 'error', 'end'].includes(payload?.type)) {
    latestSpeechState = payload;
    console.log('[DesktopAssistant][STT]', JSON.stringify(payload));
  } else if (payload?.type === 'recognized') {
    console.log('[DesktopAssistant][STT]', JSON.stringify(payload));
  }

  if (!assistantWindow || assistantWindow.isDestroyed()) return;
  assistantWindow.webContents.send('desktop-assistant:speech-event', payload);
}

function pushLatestSpeechState() {
  if (!latestSpeechState || !assistantWindow || assistantWindow.isDestroyed()) return;
  assistantWindow.webContents.send('desktop-assistant:speech-event', latestSpeechState);
}

function stopNativeSpeech() {
  if (!speechProcess) return;
  try { speechProcess.kill(); } catch { /* ignore */ }
  speechProcess = null;
  speechReady = false;
  speechStarting = false;
}

function startNativeSpeech() {
  if (process.platform !== 'win32') {
    const error = new Error('The local voice engine currently supports Windows.');
    sendSpeechEvent({ type: 'error', message: error.message });
    return false;
  }

  if (!fs.existsSync(speechScript)) {
    const error = new Error('Python voice helper is missing from the Electron build.');
    sendSpeechEvent({ type: 'error', message: error.message });
    return false;
  }

  if (speechProcess && !speechProcess.killed) return true;
  if (speechStarting) return true;

  const python = resolvePython();
  speechStarting = true;
  latestSpeechState = { type: 'status', state: 'starting-python' };
  sendSpeechEvent(latestSpeechState);
  console.log(`[DesktopAssistant] Starting voice worker: ${python.command} ${python.args.join(' ')} -u ${speechScript}`);

  speechProcess = spawn(python.command, [...python.args, '-u', speechScript], {
    cwd: path.join(__dirname, 'speech'),
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      PYTHONIOENCODING: 'utf-8',
      ASSISTANT_WHISPER_MODEL: process.env.ASSISTANT_WHISPER_MODEL || 'base.en',
      ASSISTANT_WHISPER_DEVICE: process.env.ASSISTANT_WHISPER_DEVICE || 'cpu',
      ASSISTANT_WHISPER_COMPUTE_TYPE: process.env.ASSISTANT_WHISPER_COMPUTE_TYPE || 'int8'
    }
  });

  let stdoutBuffer = '';
  speechProcess.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk.toString('utf8');
    const lines = stdoutBuffer.split(/\r?\n/);
    stdoutBuffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const payload = JSON.parse(trimmed);
        if (payload.type === 'ready') {
          speechReady = true;
          speechStarting = false;
        }
        sendSpeechEvent(payload);
      } catch {
        console.warn('[DesktopAssistant] Ignoring invalid voice worker output:', trimmed);
      }
    }
  });

  speechProcess.stderr.on('data', (chunk) => {
    const text = chunk.toString('utf8').trim();
    if (text) console.warn('[DesktopAssistant] Voice worker stderr:', text);
  });

  speechProcess.on('spawn', () => {
    console.log(`[DesktopAssistant] Voice worker spawned (pid ${speechProcess.pid}).`);
  });

  speechProcess.on('error', (err) => {
    speechStarting = false;
    speechReady = false;
    speechProcess = null;
    sendSpeechEvent({ type: 'error', message: `Python voice worker could not start: ${err.message}` });
  });

  speechProcess.on('exit', (code, signal) => {
    console.log(`[DesktopAssistant] Voice worker exited: code=${code} signal=${signal || 'none'}`);
    speechStarting = false;
    speechReady = false;
    speechProcess = null;
    sendSpeechEvent({ type: 'end', code, signal });
  });

  return true;
}

app.whenReady().then(() => {
  session.defaultSession.setCodeCachePath(codeCachePath);
  session.defaultSession.setPermissionCheckHandler(
    (_webContents, permission, _requestingOrigin, details) => {
      if (permission === 'media') return !details?.mediaType || details.mediaType === 'audio';
      return permission === 'display-capture';
    }
  );
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      callback(permission === 'media' || permission === 'display-capture');
    }
  );

  ipcMain.handle('desktop-assistant:capture-screen', captureDesktop);
  ipcMain.on('desktop-assistant:show', showAssistant);
  ipcMain.on('desktop-assistant:hide', () => assistantWindow?.hide());
  ipcMain.handle('desktop-assistant:start-voice', () => ({ started: startNativeSpeech(), ready: speechReady }));
  ipcMain.on('desktop-assistant:stop-voice', () => {});
  ipcMain.on('desktop-assistant:voice-subscribe', pushLatestSpeechState);

  createWindows();
  registerShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindows();
  });
});

app.on('will-quit', () => {
  stopNativeSpeech();
  if (registeredAccelerator) globalShortcut.unregister(registeredAccelerator);
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', (event) => {
  if (process.platform !== 'darwin') event.preventDefault();
});
