const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const wavPath = path.join(root, 'jarvis-test.wav');
const pythonScript = path.join(__dirname, 'speech', 'test_voice.py');

function fail(message) {
  console.error(`[VoiceTest] ${message}`);
  process.exit(1);
}

if (!fs.existsSync(wavPath)) {
  fail(`Missing ${wavPath}. Create it first with the PowerShell TTS command.`);
}

function resolvePython() {
  const candidates = ['python', 'py'];
  for (const command of candidates) {
    const result = spawnSync(command, ['--version'], { encoding: 'utf8', windowsHide: true });
    if (result.status === 0) return command;
  }
  fail('Could not find Python. Make sure Python is installed and available on PATH.');
}

const python = resolvePython();
console.log('[VoiceTest] Feeding jarvis-test.wav directly into the voice pipeline.');
console.log('[VoiceTest] Microphone and speakers are NOT used.');

const result = spawnSync(
  python,
  [python === 'py' ? '-3' : pythonScript, ...(python === 'py' ? [pythonScript] : []), '--audio-file', wavPath],
  {
    cwd: root,
    stdio: 'inherit',
    windowsHide: false,
  },
);

if (result.error) fail(result.error.message);
process.exit(result.status ?? 1);
