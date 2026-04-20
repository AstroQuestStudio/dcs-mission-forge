import { firefox } from '@playwright/test';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIZ_PATH = 'C:/Users/trufa/Saved Games/DCS/Missions/capture ultime.miz';

async function main() {
  const server = spawn('npx', ['vite', 'preview', '--port', '4175'], {
    cwd: __dirname, shell: true, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let ready = false;
  server.stdout.on('data', d => { if (d.toString().includes('4175')) ready = true; });
  await new Promise(r => { const t = setInterval(() => { if (ready) { clearInterval(t); r(); } }, 100); setTimeout(() => { clearInterval(t); r(); }, 6000); });

  console.log('Serveur prêt, lancement Firefox...');
  const browser = await firefox.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  const errors = [];

  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('🔴 ERREUR FIREFOX:', err.message.substring(0, 200));
    console.log('Stack:', (err.stack || '').substring(0, 500));
  });
  page.on('console', msg => { if (msg.type() === 'error') console.log('[console]', msg.text().substring(0, 200)); });

  await page.goto('http://localhost:4175/dcs-mission-forge/');
  await page.waitForTimeout(2000);
  console.log('Page OK, chargement mission...');

  if (fs.existsSync(MIZ_PATH)) {
    await page.locator('input[type="file"]').setInputFiles(MIZ_PATH);
    await page.waitForTimeout(4000);
    console.log('Mission chargée.');
  }

  // Cliquer sur un marqueur si visible
  await page.waitForTimeout(1000);

  console.log('\n=== RÉSULTAT ===');
  console.log(errors.length === 0 ? '✅ AUCUNE ERREUR Firefox !' : `❌ ${errors.length} erreur(s)`);

  await browser.close();
  server.kill();
}
main().catch(e => { console.error(e); process.exit(1); });
