import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIZ_PATH = 'C:/Users/trufa/Saved Games/DCS/Missions/capture ultime.miz';

async function main() {
  const server = spawn('npx', ['vite', 'preview', '--port', '4173', '--host'], {
    cwd: __dirname, shell: true, stdio: ['ignore', 'pipe', 'pipe'],
  });

  let ready = false;
  server.stdout.on('data', d => { if (d.toString().includes('4173')) ready = true; process.stdout.write(d); });
  server.stderr.on('data', d => process.stderr.write(d));

  await new Promise(r => { const t = setInterval(() => { if (ready) { clearInterval(t); r(); } }, 100); setTimeout(() => { clearInterval(t); r(); }, 6000); });

  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  const errors = [];

  page.on('pageerror', err => {
    errors.push(err.message + '\n' + (err.stack || ''));
    console.log('\n=== PAGE ERROR ===\n' + err.message + '\n' + (err.stack || '') + '\n');
  });
  page.on('console', msg => { if (msg.type() === 'error') console.log('[console error]', msg.text()); });

  await page.goto('http://localhost:4173/dcs-mission-forge/');
  await page.waitForTimeout(1500);

  if (fs.existsSync(MIZ_PATH)) {
    await page.locator('input[type="file"]').setInputFiles(MIZ_PATH);
    await page.waitForTimeout(4000);
  }

  console.log('\nErreurs:', errors.length);
  await browser.close();
  server.kill();
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
