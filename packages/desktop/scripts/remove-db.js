#!/usr/bin/env node
/**
 * Removes the dev SQLite database (app-dev.db) so you can test from scratch.
 * Tries multiple app-data folder names (RoYoGo, Electron, electron) since
 * `electron .` may use different names. Only touches the dev DB.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packagePath = path.join(__dirname, '..', 'package.json');
const appName = JSON.parse(fs.readFileSync(packagePath, 'utf8')).name;
const platform = process.platform;

function getAppDataDir(name) {
  if (platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Application Support', name);
  }
  if (platform === 'win32') {
    return path.join(process.env.APPDATA || os.homedir(), name);
  }
  return path.join(os.homedir(), '.config', name);
}

const appNames = [appName, 'Electron', 'electron'];
let removed = false;

for (const name of appNames) {
  const baseDir = getAppDataDir(name);
  const dbDir = path.join(baseDir, 'data');
  const devDbFile = path.join(dbDir, 'app-dev.db');
  const devDbJournal = path.join(dbDir, 'app-dev.db-journal');

  if (fs.existsSync(devDbFile)) {
    fs.unlinkSync(devDbFile);
    console.log('Removed dev DB:', devDbFile);
    removed = true;
  }

  if (fs.existsSync(devDbJournal)) {
    fs.unlinkSync(devDbJournal);
    console.log('Removed dev DB journal:', devDbJournal);
    removed = true;
  }

  if (fs.existsSync(dbDir) && fs.readdirSync(dbDir).length === 0) {
    fs.rmdirSync(dbDir);
    console.log('Removed empty directory:', dbDir);
  }
}

if (!removed) {
  console.log('No app-dev.db found in any of these locations:');
  appNames.forEach((name) => {
    const devDbFile = path.join(getAppDataDir(name), 'data', 'app-dev.db');
    console.log('  -', devDbFile);
  });
  console.log('\nIf your app stores the DB elsewhere, delete app-dev.db there and restart the app.');
} else {
  console.log('\nDone. Start the app again (yarn electron:dev).');
}
