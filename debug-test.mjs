/**
 * Test Playwright pour capturer l'erreur React #310 avec source maps
 * Lance le serveur de dev Vite en mode non-minifié pour avoir les vraies stack traces
 */
import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIZ_PATH = path.join('C:/Users/trufa/Saved Games/DCS/Missions', 'capture ultime.miz');

async function main() {
  // Lancer vite dev
  console.log('Démarrage Vite dev...');
  const vite = spawn('npx', ['vite', '--port', '5173', '--host'], {
    cwd: __dirname,
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let viteReady = false;
  vite.stdout.on('data', d => {
    const s = d.toString();
    if (s.includes('5173')) viteReady = true;
    process.stdout.write('[vite] ' + s);
  });
  vite.stderr.on('data', d => process.stderr.write('[vite err] ' + d.toString()));

  // Attendre que Vite soit prêt
  await new Promise(resolve => {
    const check = setInterval(() => {
      if (viteReady) { clearInterval(check); resolve(); }
    }, 200);
    setTimeout(() => { clearInterval(check); resolve(); }, 8000);
  });

  console.log('\nLancement Playwright...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  const consoleLogs = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', text);
  });

  page.on('pageerror', err => {
    errors.push(err.message + '\n' + err.stack);
    console.log('\n=== PAGE ERROR ===\n', err.message, '\n', err.stack, '\n==================\n');
  });

  await page.goto('http://localhost:5173/dcs-mission-forge/');
  await page.waitForTimeout(2000);
  console.log('Page chargée.');

  // Charger le .miz via file input
  if (fs.existsSync(MIZ_PATH)) {
    console.log('Chargement du .miz...');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(MIZ_PATH);
    await page.waitForTimeout(3000);
    console.log('Mission chargée, attente des erreurs...');
  } else {
    console.log('Fichier .miz non trouvé:', MIZ_PATH);
  }

  await page.waitForTimeout(2000);

  // Résumé
  console.log('\n=== RÉSUMÉ ===');
  console.log('Erreurs:', errors.length);
  errors.forEach(e => console.log(e));
  console.log('Console logs:', consoleLogs.filter(l => l.includes('error') || l.includes('Error')).length);

  await browser.close();
  vite.kill();
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch(e => { console.error(e); process.exit(1); });
